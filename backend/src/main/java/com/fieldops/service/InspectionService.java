package com.fieldops.service;

import com.fieldops.common.exception.BusinessException;
import com.fieldops.common.exception.ResourceNotFoundException;
import com.fieldops.domain.entity.*;
import com.fieldops.domain.enums.*;
import com.fieldops.dto.inspection.CreateInspectionDTO;
import com.fieldops.dto.inspection.InspectionResponseDTO;
import com.fieldops.dto.inspection.SubmitResponsesDTO;
import com.fieldops.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InspectionService {

    private final InspectionRepository inspectionRepository;
    private final InspectionTemplateVersionRepository versionRepository;
    private final ClientRepository clientRepository;
    private final InspectionSiteRepository siteRepository;
    private final EquipmentRepository equipmentRepository;
    private final UserRepository userRepository;
    private final InspectionItemSnapshotRepository snapshotRepository;
    private final InspectionResponseRepository responseRepository;
    private final NonConformityRepository nonConformityRepository;
    private final AuditEventRepository auditEventRepository;

    @Transactional(readOnly = true)
    public List<InspectionResponseDTO> listAll() {
        return inspectionRepository.findAllWithDetails().stream()
                .map(InspectionResponseDTO::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<InspectionResponseDTO> listByTechnician(UUID technicianId) {
        return inspectionRepository.findByTechnicianIdOrderByScheduledForDesc(technicianId).stream()
                .map(InspectionResponseDTO::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public InspectionResponseDTO getById(UUID id) {
        Inspection inspection = inspectionRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("INSPECTION_NOT_FOUND", "Inspeção não encontrada."));
        return InspectionResponseDTO.fromEntity(inspection);
    }

    @Transactional
    public InspectionResponseDTO create(CreateInspectionDTO dto, User creator) {
        // 1. Validar Cliente, Local, Técnico e Supervisor
        Client client = clientRepository.findById(dto.getClientId())
                .orElseThrow(() -> new ResourceNotFoundException("CLIENT_NOT_FOUND", "Cliente não encontrado."));

        InspectionSite site = siteRepository.findById(dto.getSiteId())
                .orElseThrow(() -> new ResourceNotFoundException("SITE_NOT_FOUND", "Local de inspeção não encontrado."));

        Equipment equipment = null;
        if (dto.getEquipmentId() != null) {
            equipment = equipmentRepository.findById(dto.getEquipmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("EQUIPMENT_NOT_FOUND", "Equipamento não encontrado."));
        }

        User technician = userRepository.findById(dto.getTechnicianId())
                .orElseThrow(() -> new ResourceNotFoundException("USER_NOT_FOUND", "Técnico responsável não encontrado."));

        User supervisor = userRepository.findById(dto.getSupervisorId())
                .orElseThrow(() -> new ResourceNotFoundException("USER_NOT_FOUND", "Supervisor responsável não encontrado."));

        // 2. Obter a versão publicada do modelo (Seção 10.8.2)
        InspectionTemplateVersion templateVersion;
        if (dto.getTemplateVersionId() != null) {
            templateVersion = versionRepository.findByIdWithSectionsAndItems(dto.getTemplateVersionId())
                    .orElseThrow(() -> new ResourceNotFoundException("VERSION_NOT_FOUND", "Versão do modelo não encontrada."));
        } else {
            templateVersion = versionRepository.findFirstByTemplateIdAndActiveForNewInspectionsTrueOrderByVersionNumberDesc(dto.getTemplateId())
                    .flatMap(v -> versionRepository.findByIdWithSectionsAndItems(v.getId()))
                    .orElseThrow(() -> new ResourceNotFoundException("VERSION_NOT_FOUND", "Nenhuma versão ativa encontrada para este modelo."));
        }

        InspectionPriority priority = InspectionPriority.MEDIUM;
        if (dto.getPriority() != null) {
            try {
                priority = InspectionPriority.valueOf(dto.getPriority().toUpperCase());
            } catch (Exception ignored) {
            }
        }

        // 3. Criar a inspeção
        Inspection inspection = Inspection.builder()
                .templateVersion(templateVersion)
                .client(client)
                .site(site)
                .equipment(equipment)
                .technician(technician)
                .supervisor(supervisor)
                .createdBy(creator != null ? creator : supervisor)
                .title(dto.getTitle())
                .instructions(dto.getInstructions())
                .priority(priority)
                .status(InspectionStatus.ASSIGNED)
                .scheduledFor(dto.getScheduledFor() != null ? dto.getScheduledFor() : OffsetDateTime.now())
                .build();

        Inspection savedInspection = inspectionRepository.save(inspection);

        // 4. Copiar seções e itens da versão para InspectionItemSnapshot (Seção 10.8.2 e 10.8.3)
        if (templateVersion.getSections() != null) {
            for (TemplateSection section : templateVersion.getSections()) {
                if (section.getItems() != null) {
                    for (TemplateItem item : section.getItems()) {
                        InspectionItemSnapshot snapshot = InspectionItemSnapshot.builder()
                                .inspection(savedInspection)
                                .sourceTemplateItemId(item.getId())
                                .sectionTitle(section.getTitle())
                                .sectionDescription(section.getDescription())
                                .sectionOrder(section.getDisplayOrder())
                                .itemCode(item.getCode())
                                .itemTitle(item.getTitle())
                                .itemDescription(item.getDescription())
                                .responseType(item.getResponseType())
                                .required(item.getRequired())
                                .optionsJson(item.getOptionsJson())
                                .itemOrder(item.getDisplayOrder())
                                .build();

                        snapshotRepository.save(snapshot);
                    }
                }
            }
        }

        // 5. Registrar evento de auditoria (Seção 10.12)
        recordAuditEvent(savedInspection, creator != null ? creator : supervisor, "INSPECTION_CREATED");

        return getById(savedInspection.getId());
    }

    @Transactional
    public InspectionResponseDTO start(UUID inspectionId, OffsetDateTime deviceTime) {
        Inspection inspection = inspectionRepository.findById(inspectionId)
                .orElseThrow(() -> new ResourceNotFoundException("INSPECTION_NOT_FOUND", "Inspeção não encontrada."));

        if (inspection.getStatus() == InspectionStatus.CANCELED) {
            throw new BusinessException("INVALID_STATE", "Inspeção cancelada não pode ser iniciada.");
        }

        inspection.setStatus(InspectionStatus.IN_PROGRESS);
        inspection.setStartedAtServer(OffsetDateTime.now());
        if (deviceTime != null) {
            inspection.setStartedAtDevice(deviceTime);
        }

        Inspection updated = inspectionRepository.save(inspection);
        recordAuditEvent(updated, updated.getTechnician(), "INSPECTION_STARTED");
        return getById(updated.getId());
    }

    @Transactional
    public InspectionResponseDTO submit(UUID inspectionId, SubmitResponsesDTO dto, User technician) {
        Inspection inspection = inspectionRepository.findById(inspectionId)
                .orElseThrow(() -> new ResourceNotFoundException("INSPECTION_NOT_FOUND", "Inspeção não encontrada."));

        if (inspection.getStatus() == InspectionStatus.CANCELED || inspection.getStatus() == InspectionStatus.APPROVED) {
            throw new BusinessException("INVALID_STATE", "Inspeção encerrada não permite submissão de respostas.");
        }

        // Grava as respostas
        if (dto.getAnswers() != null) {
            for (SubmitResponsesDTO.ItemAnswerDTO ans : dto.getAnswers()) {
                InspectionItemSnapshot item = snapshotRepository.findById(ans.getInspectionItemId())
                        .orElseThrow(() -> new ResourceNotFoundException("ITEM_NOT_FOUND", "Item da inspeção não encontrado: " + ans.getInspectionItemId()));

                InspectionResponse resp = responseRepository.findByInspectionItemId(item.getId())
                        .orElseGet(() -> InspectionResponse.builder()
                                .inspection(inspection)
                                .inspectionItem(item)
                                .build());

                resp.setValueText(ans.getValueText());
                resp.setValueNumber(ans.getValueNumber());
                resp.setValueBoolean(ans.getValueBoolean());
                resp.setValueDate(ans.getValueDate());
                resp.setValueJson(ans.getValueJson() != null ? ans.getValueJson() : "{}");
                resp.setObservation(ans.getObservation());

                ConformityStatus cStatus = ConformityStatus.NOT_APPLICABLE;
                if (ans.getConformity() != null) {
                    try {
                        cStatus = ConformityStatus.valueOf(ans.getConformity().toUpperCase());
                    } catch (Exception ignored) {
                    }
                }
                resp.setConformity(cStatus);
                resp.setAnsweredBy(technician);
                resp.setAnsweredAtDevice(ans.getAnsweredAtDevice() != null ? ans.getAnsweredAtDevice() : OffsetDateTime.now());
                resp.setServerReceivedAt(OffsetDateTime.now());

                InspectionResponse savedResp = responseRepository.save(resp);

                // Se houver não conformidade declarada, gera registro automático
                if (cStatus == ConformityStatus.NON_CONFORMING) {
                    NonConformity nc = NonConformity.builder()
                            .inspection(inspection)
                            .inspectionItem(item)
                            .response(savedResp)
                            .title("Não conformidade: " + item.getItemTitle())
                            .description(ans.getObservation() != null ? ans.getObservation() : "Item identificado como não conforme em campo.")
                            .severity(NonConformitySeverity.HIGH)
                            .status(NonConformityStatus.OPEN)
                            .createdBy(technician)
                            .createdAtDevice(ans.getAnsweredAtDevice())
                            .build();

                    nonConformityRepository.save(nc);
                }
            }
        }

        inspection.setStatus(InspectionStatus.SUBMITTED);
        inspection.setSubmittedAtServer(OffsetDateTime.now());
        inspection.setCompletedAtDevice(OffsetDateTime.now());
        Inspection updated = inspectionRepository.save(inspection);

        recordAuditEvent(updated, technician, "INSPECTION_SUBMITTED");
        return getById(updated.getId());
    }

    @Transactional
    public InspectionResponseDTO cancel(UUID inspectionId, String reason, User user) {
        Inspection inspection = inspectionRepository.findById(inspectionId)
                .orElseThrow(() -> new ResourceNotFoundException("INSPECTION_NOT_FOUND", "Inspeção não encontrada."));

        if (reason == null || reason.isBlank()) {
            throw new BusinessException("REASON_REQUIRED", "O motivo do cancelamento é obrigatório.");
        }

        inspection.setStatus(InspectionStatus.CANCELED);
        inspection.setCanceledAt(OffsetDateTime.now());
        inspection.setCanceledBy(user);
        inspection.setCanceledReason(reason);

        Inspection updated = inspectionRepository.save(inspection);
        recordAuditEvent(updated, user, "INSPECTION_CANCELED");
        return getById(updated.getId());
    }

    private void recordAuditEvent(Inspection inspection, User actor, String action) {
        AuditEvent event = AuditEvent.builder()
                .inspection(inspection)
                .actor(actor)
                .action(action)
                .entityType("INSPECTION")
                .entityId(inspection.getId())
                .occurredAt(OffsetDateTime.now())
                .build();
        auditEventRepository.save(event);
    }
}
