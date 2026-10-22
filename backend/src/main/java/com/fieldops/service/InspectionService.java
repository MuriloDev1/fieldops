package com.fieldops.service;

import com.fieldops.common.exception.BusinessException;
import com.fieldops.common.exception.ResourceNotFoundException;
import com.fieldops.domain.entity.*;
import com.fieldops.domain.enums.*;
import com.fieldops.dto.audit.AuditEventResponseDTO;
import com.fieldops.dto.inspection.CreateInspectionDTO;
import com.fieldops.dto.inspection.InspectionResponseDTO;
import com.fieldops.dto.inspection.InspectionResponseItemDTO;
import com.fieldops.dto.inspection.SubmitResponsesDTO;
import com.fieldops.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InspectionService {

    private final InspectionRepository inspectionRepository;
    private final InspectionTemplateRepository templateRepository;
    private final InspectionTemplateVersionRepository versionRepository;
    private final TemplateSectionRepository sectionRepository;
    private final TemplateItemRepository itemRepository;
    private final ClientRepository clientRepository;
    private final InspectionSiteRepository siteRepository;
    private final EquipmentRepository equipmentRepository;
    private final UserRepository userRepository;
    private final InspectionItemSnapshotRepository snapshotRepository;
    private final InspectionResponseRepository responseRepository;
    private final NonConformityRepository nonConformityRepository;
    private final InspectionReviewRepository reviewRepository;
    private final AuditEventRepository auditEventRepository;

    @Transactional(readOnly = true)
    public List<AuditEventResponseDTO> getInspectionHistory(UUID inspectionId) {
        if (!inspectionRepository.existsById(inspectionId)) {
            throw new ResourceNotFoundException("INSPECTION_NOT_FOUND", "Inspeção não encontrada.");
        }
        return auditEventRepository.findByInspectionIdOrderByOccurredAtAsc(inspectionId).stream()
                .map(AuditEventResponseDTO::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<InspectionResponseDTO> listAll() {
        return inspectionRepository.findAllWithDetails().stream()
                .map(this::toResponseDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<InspectionResponseDTO> listByTechnician(UUID technicianId) {
        return inspectionRepository.findByTechnicianIdOrderByScheduledForDesc(technicianId).stream()
                .map(this::toResponseDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public InspectionResponseDTO getById(UUID id) {
        Inspection inspection = inspectionRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("INSPECTION_NOT_FOUND", "Inspeção não encontrada."));
        return toResponseDTO(inspection);
    }

    private InspectionResponseDTO toResponseDTO(Inspection inspection) {
        List<InspectionReview> reviews = reviewRepository.findByInspectionIdOrderByReviewCycleAsc(inspection.getId());
        InspectionReview latestReview = reviews.isEmpty() ? null : reviews.get(reviews.size() - 1);
        return InspectionResponseDTO.fromEntity(inspection, latestReview);
    }

    @Transactional
    public InspectionResponseDTO create(CreateInspectionDTO dto, User creator) {
        // 1. Resolver Equipamento, Local e Cliente com fallbacks inteligentes para Web e Mobile
        Equipment equipment = null;
        if (dto.getEquipmentId() != null) {
            equipment = equipmentRepository.findByIdWithSiteAndClient(dto.getEquipmentId())
                    .or(() -> equipmentRepository.findById(dto.getEquipmentId()))
                    .orElse(null);
        }

        InspectionSite site = null;
        if (dto.getSiteId() != null) {
            site = siteRepository.findById(dto.getSiteId()).orElse(null);
        }
        if (site == null && equipment != null && equipment.getSite() != null) {
            site = equipment.getSite();
        }
        if (site == null) {
            site = siteRepository.findAll().stream().findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("SITE_NOT_FOUND", "Nenhum local de inspeção cadastrado."));
        }

        Client client = null;
        if (dto.getClientId() != null) {
            client = clientRepository.findById(dto.getClientId()).orElse(null);
        }
        if (client == null && site.getClient() != null) {
            client = site.getClient();
        }
        if (client == null) {
            client = clientRepository.findAll().stream().findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("CLIENT_NOT_FOUND", "Nenhum cliente cadastrado."));
        }

        // 2. Resolver Técnico e Supervisor
        UUID techId = dto.getTechnicianId() != null ? dto.getTechnicianId() : dto.getResponsibleId();
        User technician = null;
        if (techId != null) {
            technician = userRepository.findById(techId).orElse(null);
        }
        if (technician == null && creator != null) {
            technician = creator;
        }
        if (technician == null) {
            List<User> techs = userRepository.findByRole(UserRole.TECHNICIAN);
            technician = !techs.isEmpty() ? techs.get(0) : userRepository.findAll().stream().findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("USER_NOT_FOUND", "Nenhum usuário cadastrado."));
        }

        User supervisor = null;
        if (dto.getSupervisorId() != null) {
            supervisor = userRepository.findById(dto.getSupervisorId()).orElse(null);
        }
        if (supervisor == null && creator != null && (creator.getRole() == UserRole.SUPERVISOR || creator.getRole() == UserRole.ADMIN)) {
            supervisor = creator;
        }
        if (supervisor == null) {
            List<User> sups = userRepository.findByRole(UserRole.SUPERVISOR);
            if (!sups.isEmpty()) {
                supervisor = sups.get(0);
            } else {
                List<User> admins = userRepository.findByRole(UserRole.ADMIN);
                supervisor = !admins.isEmpty() ? admins.get(0) : technician;
            }
        }

        final User finalSupervisor = supervisor;

        // 3. Obter a versão publicada do modelo (Seção 10.8.2)
        InspectionTemplateVersion templateVersion = null;
        if (dto.getTemplateVersionId() != null) {
            templateVersion = versionRepository.findByIdWithSectionsAndItems(dto.getTemplateVersionId()).orElse(null);
        }
        if (templateVersion == null && dto.getTemplateId() != null) {
            templateVersion = versionRepository
                    .findFirstByTemplateIdAndActiveForNewInspectionsTrueOrderByVersionNumberDesc(dto.getTemplateId())
                    .flatMap(v -> versionRepository.findByIdWithSectionsAndItems(v.getId()))
                    .orElse(null);
        }
        if (templateVersion == null) {
            templateVersion = versionRepository.findAll().stream()
                    .filter(v -> Boolean.TRUE.equals(v.getActiveForNewInspections()))
                    .findFirst()
                    .flatMap(v -> versionRepository.findByIdWithSectionsAndItems(v.getId()))
                    .orElseGet(() -> versionRepository.findAll().stream().findFirst()
                            .flatMap(v -> versionRepository.findByIdWithSectionsAndItems(v.getId()))
                            .orElseGet(() -> createFallbackTemplateVersion(finalSupervisor)));
        }

        InspectionPriority priority = InspectionPriority.MEDIUM;
        if (dto.getPriority() != null) {
            try {
                priority = InspectionPriority.valueOf(dto.getPriority().toUpperCase());
            } catch (Exception ignored) {
            }
        }

        String title = dto.getTitle();
        if (title == null || title.isBlank()) {
            String baseTitle = templateVersion.getTitleSnapshot() != null ? templateVersion.getTitleSnapshot() : "Inspeção Técnica";
            title = equipment != null ? baseTitle + " - " + equipment.getName() : baseTitle;
        }

        String instructions = dto.getInstructions();
        if (instructions == null || instructions.isBlank()) {
            instructions = (dto.getNotes() != null && !dto.getNotes().isBlank()) ? dto.getNotes() : dto.getDescription();
        }

        OffsetDateTime scheduledFor = dto.getScheduledFor();
        if (scheduledFor == null && dto.getScheduledDate() != null && !dto.getScheduledDate().isBlank()) {
            try {
                scheduledFor = LocalDate.parse(dto.getScheduledDate().substring(0, 10)).atTime(9, 0).atOffset(ZoneOffset.UTC);
            } catch (Exception ignored) {
            }
        }
        if (scheduledFor == null) {
            scheduledFor = OffsetDateTime.now();
        }

        boolean hasAdHocQuestions = dto.getQuestions() != null && !dto.getQuestions().isEmpty();

        // 4. Criar a inspeção
        Inspection inspection = Inspection.builder()
                .templateVersion(templateVersion)
                .client(client)
                .site(site)
                .equipment(equipment)
                .technician(technician)
                .supervisor(supervisor)
                .createdBy(creator != null ? creator : supervisor)
                .title(title)
                .instructions(instructions)
                .priority(priority)
                .status(hasAdHocQuestions ? InspectionStatus.IN_PROGRESS : InspectionStatus.ASSIGNED)
                .scheduledFor(scheduledFor)
                .startedAtServer(hasAdHocQuestions ? OffsetDateTime.now() : null)
                .build();

        Inspection savedInspection = inspectionRepository.save(inspection);

        // 5. Gerar snapshots (a partir das perguntas do Mobile ou das seções do modelo)
        if (hasAdHocQuestions) {
            int orderIdx = 1;
            for (CreateInspectionDTO.MobileQuestionInputDTO q : dto.getQuestions()) {
                int itemOrder = q.getOrder() != null ? q.getOrder() : orderIdx;
                orderIdx++;
                ResponseType rType = mapMobileTypeToResponseType(q.getType());

                InspectionItemSnapshot snapshot = InspectionItemSnapshot.builder()
                        .inspection(savedInspection)
                        .sectionTitle("Checklist Operacional")
                        .sectionDescription("Itens de verificação em campo")
                        .sectionOrder(1)
                        .itemCode("Q-" + itemOrder)
                        .itemTitle(q.getTitle() != null && !q.getTitle().isBlank() ? q.getTitle() : "Item " + itemOrder)
                        .responseType(rType)
                        .required(q.isRequired())
                        .optionsJson("MULTIPLE_CHOICE".equalsIgnoreCase(q.getType()) ? "[\"Bom\",\"Regular\",\"Ruim\",\"N/A\"]" : "[]")
                        .rulesJson("{}")
                        .itemOrder(itemOrder)
                        .build();

                InspectionItemSnapshot savedSnap = snapshotRepository.save(snapshot);
                savedInspection.getSnapshots().add(savedSnap);
            }
        } else {
            List<TemplateSection> sections = sectionRepository.findByTemplateVersionIdOrderByDisplayOrderAsc(templateVersion.getId());
            for (TemplateSection section : sections) {
                List<TemplateItem> items = itemRepository.findBySectionIdOrderByDisplayOrderAsc(section.getId());
                for (TemplateItem item : items) {
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
                            .optionsJson(item.getOptionsJson() != null ? item.getOptionsJson() : "[]")
                            .rulesJson("{}")
                            .itemOrder(item.getDisplayOrder())
                            .build();

                    InspectionItemSnapshot savedSnap = snapshotRepository.save(snapshot);
                    savedInspection.getSnapshots().add(savedSnap);
                }
            }
        }

        // 6. Registrar eventos de auditoria (Seção 10.12 e RN-086)
        User actor = creator != null ? creator : supervisor;
        recordAuditEvent(savedInspection, actor, "INSPECTION_CREATED", "{\"details\":\"Inspeção registrada no sistema\"}");
        if (technician != null) {
            recordAuditEvent(savedInspection, actor, "INSPECTION_ASSIGNED", "{\"details\":\"Atribuída ao técnico " + technician.getName() + "\"}");
        }
        if (hasAdHocQuestions) {
            recordAuditEvent(savedInspection, technician, "INSPECTION_STARTED", "{\"details\":\"Execução iniciada no aplicativo móvel\"}");
        }

        return getById(savedInspection.getId());
    }

    private ResponseType mapMobileTypeToResponseType(String type) {
        if (type == null) return ResponseType.CONFORM_NON_CONFORM;
        return switch (type.toUpperCase()) {
            case "COMPLIANCE", "CONFORM_NON_CONFORM", "BOOLEAN" -> ResponseType.CONFORM_NON_CONFORM;
            case "MULTIPLE_CHOICE", "SINGLE_CHOICE" -> ResponseType.SINGLE_CHOICE;
            case "PHOTO" -> ResponseType.PHOTO;
            default -> ResponseType.TEXT_SHORT;
        };
    }

    private InspectionTemplateVersion createFallbackTemplateVersion(User creator) {
        InspectionTemplate tmpl = InspectionTemplate.builder()
                .title("Checklist Operacional Padrão")
                .description("Modelo padrão de verificação de conformidade em campo")
                .category("Geral")
                .status(TemplateStatus.ACTIVE)
                .currentVersion(1)
                .createdBy(creator)
                .build();
        InspectionTemplate savedTmpl = templateRepository.save(tmpl);

        InspectionTemplateVersion ver = InspectionTemplateVersion.builder()
                .template(savedTmpl)
                .versionNumber(1)
                .titleSnapshot(savedTmpl.getTitle())
                .descriptionSnapshot(savedTmpl.getDescription())
                .publishedBy(creator)
                .publishedAt(OffsetDateTime.now())
                .activeForNewInspections(true)
                .build();
        return versionRepository.save(ver);
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
        recordAuditEvent(updated, updated.getTechnician(), "INSPECTION_STARTED", "{\"details\":\"Execução em campo iniciada\"}");
        return getById(updated.getId());
    }

    @Transactional
    public InspectionResponseItemDTO saveSingleAnswer(
            UUID inspectionId,
            UUID questionId,
            UUID userId,
            String value,
            String observation,
            String photoUrl,
            String signatureUrl) {
        Inspection inspection = inspectionRepository.findById(inspectionId)
                .orElseThrow(() -> new ResourceNotFoundException("INSPECTION_NOT_FOUND", "Inspeção não encontrada."));

        InspectionItemSnapshot item = null;
        if (questionId != null) {
            item = snapshotRepository.findById(questionId).orElse(null);
        }
        if (item == null) {
            List<InspectionItemSnapshot> snaps = snapshotRepository.findByInspectionIdOrderBySectionOrderAscItemOrderAsc(inspectionId);
            if (!snaps.isEmpty()) {
                item = snaps.get(0);
            } else {
                throw new ResourceNotFoundException("ITEM_NOT_FOUND", "Item da inspeção não encontrado.");
            }
        }

        final InspectionItemSnapshot targetItem = item;
        User actor = (userId != null ? userRepository.findById(userId).orElse(null) : null);
        if (actor == null) {
            actor = inspection.getTechnician();
        }

        InspectionResponse resp = responseRepository.findByInspectionItemId(targetItem.getId())
                .orElseGet(() -> InspectionResponse.builder()
                        .inspection(inspection)
                        .inspectionItem(targetItem)
                        .build());

        resp.setValueText(value);
        resp.setObservation(observation);

        if ("Sim".equalsIgnoreCase(value) || "CONFORMING".equalsIgnoreCase(value) || "Bom".equalsIgnoreCase(value)) {
            resp.setValueBoolean(true);
            resp.setConformity(ConformityStatus.CONFORMING);
        } else if ("Não".equalsIgnoreCase(value) || "Nao".equalsIgnoreCase(value) || "Ruim".equalsIgnoreCase(value) || "NON_CONFORMING".equalsIgnoreCase(value)) {
            resp.setValueBoolean(false);
            resp.setConformity(ConformityStatus.NON_CONFORMING);
        } else if ("N/A".equalsIgnoreCase(value) || "NOT_APPLICABLE".equalsIgnoreCase(value)) {
            resp.setConformity(ConformityStatus.NOT_APPLICABLE);
        } else {
            resp.setConformity(ConformityStatus.CONFORMING);
        }

        java.util.Map<String, String> metaMap = new java.util.HashMap<>();
        metaMap.put("photoUrl", photoUrl != null ? photoUrl : "");
        metaMap.put("signatureUrl", signatureUrl != null ? signatureUrl : "");
        try {
            resp.setValueJson(new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(metaMap));
        } catch (Exception e) {
            resp.setValueJson("{}");
        }


        resp.setAnsweredBy(actor);
        resp.setAnsweredAtDevice(OffsetDateTime.now());
        resp.setServerReceivedAt(OffsetDateTime.now());

        InspectionResponse savedResp = responseRepository.save(resp);

        if (resp.getConformity() == ConformityStatus.NON_CONFORMING) {
            boolean exists = nonConformityRepository.findByInspectionIdOrderByCreatedAtDesc(inspectionId).stream()
                    .anyMatch(nc -> nc.getInspectionItem() != null && nc.getInspectionItem().getId().equals(targetItem.getId()));
            if (!exists) {
                NonConformity nc = NonConformity.builder()
                        .inspection(inspection)
                        .inspectionItem(targetItem)
                        .response(savedResp)
                        .title("Não conformidade: " + targetItem.getItemTitle())
                        .description(observation != null && !observation.isBlank() ? observation : "Item reprovado em inspeção de campo.")
                        .severity(NonConformitySeverity.HIGH)
                        .status(NonConformityStatus.OPEN)
                        .createdBy(actor)
                        .createdAtDevice(OffsetDateTime.now())
                        .build();
                nonConformityRepository.save(nc);
            }
        }

        return InspectionResponseItemDTO.fromEntity(savedResp);
    }

    @Transactional
    public InspectionResponseDTO completeMobileInspection(UUID inspectionId, UUID userId, String observation) {
        Inspection inspection = inspectionRepository.findById(inspectionId)
                .orElseThrow(() -> new ResourceNotFoundException("INSPECTION_NOT_FOUND", "Inspeção não encontrada."));

        User actor = (userId != null ? userRepository.findById(userId).orElse(null) : null);
        if (actor == null) {
            actor = inspection.getTechnician();
        }

        if (observation != null && !observation.isBlank() && (inspection.getInstructions() == null || inspection.getInstructions().isBlank())) {
            inspection.setInstructions(observation);
        }

        inspection.setStatus(InspectionStatus.SUBMITTED);
        inspection.setSubmittedAtServer(OffsetDateTime.now());
        inspection.setCompletedAtDevice(OffsetDateTime.now());
        Inspection updated = inspectionRepository.save(inspection);

        recordAuditEvent(updated, actor, "INSPECTION_SUBMITTED",
                "{\"details\":\"Inspeção concluída em campo e enviada para revisão do supervisor\"}");
        return getById(updated.getId());
    }

    @Transactional
    public InspectionResponseDTO submit(UUID inspectionId, SubmitResponsesDTO dto, User technician) {
        Inspection inspection = inspectionRepository.findById(inspectionId)
                .orElseThrow(() -> new ResourceNotFoundException("INSPECTION_NOT_FOUND", "Inspeção não encontrada."));

        if (inspection.getStatus() == InspectionStatus.CANCELED || inspection.getStatus() == InspectionStatus.APPROVED) {
            throw new BusinessException("INVALID_STATE", "Inspeção encerrada não permite submissão de respostas.");
        }

        User effectiveTech = technician != null ? technician : inspection.getTechnician();

        // Grava as respostas
        if (dto.getAnswers() != null) {
            for (SubmitResponsesDTO.ItemAnswerDTO ans : dto.getAnswers()) {
                UUID itemId = ans.getEffectiveItemId();
                InspectionItemSnapshot item = snapshotRepository.findById(itemId)
                        .orElseThrow(() -> new ResourceNotFoundException("ITEM_NOT_FOUND", "Item da inspeção não encontrado: " + itemId));

                InspectionResponse resp = responseRepository.findByInspectionItemId(item.getId())
                        .orElseGet(() -> InspectionResponse.builder()
                                .inspection(inspection)
                                .inspectionItem(item)
                                .build());

                Boolean boolVal = ans.getValueBoolean() != null ? ans.getValueBoolean() : ans.getCompliant();
                String textVal = ans.getValueText();
                if (textVal == null && boolVal != null) {
                    textVal = boolVal ? "Sim" : "Não";
                }
                resp.setValueText(textVal);
                resp.setValueNumber(ans.getValueNumber());
                resp.setValueBoolean(boolVal);
                resp.setValueDate(ans.getValueDate());
                String jsonVal = ans.getValueJson() != null ? ans.getValueJson() : (ans.getAnswerJson() != null ? "{\"answer\":\"" + ans.getAnswerJson() + "\"}" : "{}");
                resp.setValueJson(jsonVal);
                resp.setObservation(ans.getObservation());

                ConformityStatus cStatus = ConformityStatus.NOT_APPLICABLE;
                if (ans.getConformity() != null) {
                    String rawConf = ans.getConformity().toUpperCase();
                    if ("CONFORM".equals(rawConf) || "CONFORMING".equals(rawConf)) {
                        cStatus = ConformityStatus.CONFORMING;
                    } else if ("NON_CONFORM".equals(rawConf) || "NON_CONFORMING".equals(rawConf)) {
                        cStatus = ConformityStatus.NON_CONFORMING;
                    }
                } else if (boolVal != null) {
                    cStatus = boolVal ? ConformityStatus.CONFORMING : ConformityStatus.NON_CONFORMING;
                } else if (ans.getAnswerJson() != null) {
                    cStatus = "NON_CONFORM".equalsIgnoreCase(ans.getAnswerJson()) ? ConformityStatus.NON_CONFORMING : ConformityStatus.CONFORMING;
                }
                resp.setConformity(cStatus);
                resp.setAnsweredBy(effectiveTech);
                resp.setAnsweredAtDevice(ans.getAnsweredAtDevice() != null ? ans.getAnsweredAtDevice() : OffsetDateTime.now());
                resp.setServerReceivedAt(OffsetDateTime.now());

                InspectionResponse savedResp = responseRepository.save(resp);

                // Se houver não conformidade declarada, gera registro automático
                if (cStatus == ConformityStatus.NON_CONFORMING) {
                    boolean ncExists = nonConformityRepository.findByInspectionIdOrderByCreatedAtDesc(inspectionId).stream()
                            .anyMatch(nc -> nc.getInspectionItem() != null && nc.getInspectionItem().getId().equals(item.getId()));
                    if (!ncExists) {
                        NonConformity nc = NonConformity.builder()
                                .inspection(inspection)
                                .inspectionItem(item)
                                .response(savedResp)
                                .title("Não conformidade: " + item.getItemTitle())
                                .description(ans.getObservation() != null && !ans.getObservation().isBlank() ? ans.getObservation() : "Item identificado como não conforme em campo.")
                                .severity(NonConformitySeverity.HIGH)
                                .status(NonConformityStatus.OPEN)
                                .createdBy(effectiveTech)
                                .createdAtDevice(ans.getAnsweredAtDevice() != null ? ans.getAnsweredAtDevice() : OffsetDateTime.now())
                                .build();

                        nonConformityRepository.save(nc);
                    }
                }
            }
        }

        inspection.setStatus(InspectionStatus.SUBMITTED);
        inspection.setSubmittedAtServer(OffsetDateTime.now());
        inspection.setCompletedAtDevice(OffsetDateTime.now());
        Inspection updated = inspectionRepository.save(inspection);

        recordAuditEvent(updated, effectiveTech, "INSPECTION_SUBMITTED",
                "{\"details\":\"Respostas submetidas e inspeção enviada para revisão\"}");
        return getById(updated.getId());
    }

    @Transactional
    public InspectionResponseDTO cancel(UUID inspectionId, String reason, User user) {
        Inspection inspection = inspectionRepository.findById(inspectionId)
                .orElseThrow(() -> new ResourceNotFoundException("INSPECTION_NOT_FOUND", "Inspeção não encontrada."));

        if (reason == null || reason.isBlank()) {
            throw new BusinessException("REASON_REQUIRED", "O motivo do cancelamento é obrigatório.");
        }

        User actor = user != null ? user : inspection.getSupervisor();

        inspection.setStatus(InspectionStatus.CANCELED);
        inspection.setCanceledAt(OffsetDateTime.now());
        inspection.setCanceledBy(actor);
        inspection.setCanceledReason(reason);

        Inspection updated = inspectionRepository.save(inspection);
        recordAuditEvent(updated, actor, "INSPECTION_CANCELED",
                "{\"details\":\"" + reason.replace("\"", "\\\"") + "\"}");
        return getById(updated.getId());
    }

    private void recordAuditEvent(Inspection inspection, User actor, String action, String metadataJson) {
        AuditEvent event = AuditEvent.builder()
                .inspection(inspection)
                .actor(actor)
                .action(action)
                .entityType("INSPECTION")
                .entityId(inspection.getId())
                .metadataJson(metadataJson)
                .occurredAt(OffsetDateTime.now())
                .build();
        auditEventRepository.save(event);
    }
}
