package com.fieldops.service;

import com.fieldops.common.exception.ResourceNotFoundException;
import com.fieldops.domain.entity.*;
import com.fieldops.domain.enums.ResponseType;
import com.fieldops.domain.enums.TemplateStatus;
import com.fieldops.dto.template.CreateTemplateDTO;
import com.fieldops.dto.template.TemplateResponseDTO;
import com.fieldops.dto.template.TemplateVersionResponseDTO;
import com.fieldops.repository.InspectionTemplateRepository;
import com.fieldops.repository.InspectionTemplateVersionRepository;
import com.fieldops.repository.TemplateItemRepository;
import com.fieldops.repository.TemplateSectionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InspectionTemplateService {

    private final InspectionTemplateRepository templateRepository;
    private final InspectionTemplateVersionRepository versionRepository;
    private final TemplateSectionRepository sectionRepository;
    private final TemplateItemRepository itemRepository;

    @Transactional(readOnly = true)
    public List<TemplateResponseDTO> listAll() {
        return templateRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(TemplateResponseDTO::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public TemplateResponseDTO getById(UUID id) {
        InspectionTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TEMPLATE_NOT_FOUND", "Modelo de inspeção não encontrado."));
        return TemplateResponseDTO.fromEntity(template);
    }

    @Transactional(readOnly = true)
    public TemplateVersionResponseDTO getActiveVersion(UUID templateId) {
        InspectionTemplateVersion version = versionRepository
                .findFirstByTemplateIdAndActiveForNewInspectionsTrueOrderByVersionNumberDesc(templateId)
                .orElseThrow(() -> new ResourceNotFoundException("VERSION_NOT_FOUND", "Nenhuma versão ativa encontrada para este modelo."));
        return TemplateVersionResponseDTO.fromEntity(version);
    }

    @Transactional(readOnly = true)
    public TemplateVersionResponseDTO getVersionById(UUID versionId) {
        InspectionTemplateVersion version = versionRepository.findByIdWithSectionsAndItems(versionId)
                .orElseThrow(() -> new ResourceNotFoundException("VERSION_NOT_FOUND", "Versão do modelo não encontrada."));
        return TemplateVersionResponseDTO.fromEntity(version);
    }

    @Transactional
    public TemplateResponseDTO create(CreateTemplateDTO dto, User creator) {
        InspectionTemplate template = InspectionTemplate.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .category(dto.getCategory())
                .status(TemplateStatus.ACTIVE)
                .currentVersion(1)
                .createdBy(creator)
                .build();

        InspectionTemplate savedTemplate = templateRepository.save(template);

        // Cria a versão 1 imutável
        InspectionTemplateVersion version = InspectionTemplateVersion.builder()
                .template(savedTemplate)
                .versionNumber(1)
                .titleSnapshot(dto.getTitle())
                .descriptionSnapshot(dto.getDescription())
                .publishedBy(creator)
                .publishedAt(OffsetDateTime.now())
                .activeForNewInspections(true)
                .build();

        InspectionTemplateVersion savedVersion = versionRepository.save(version);

        // Seções e Itens
        if (dto.getSections() != null) {
            for (CreateTemplateDTO.CreateSectionDTO secDto : dto.getSections()) {
                TemplateSection section = TemplateSection.builder()
                        .templateVersion(savedVersion)
                        .title(secDto.getTitle())
                        .description(secDto.getDescription())
                        .displayOrder(secDto.getDisplayOrder())
                        .build();

                TemplateSection savedSection = sectionRepository.save(section);

                if (secDto.getItems() != null) {
                    for (CreateTemplateDTO.CreateItemDTO itemDto : secDto.getItems()) {
                        ResponseType rType = ResponseType.TEXT_SHORT;
                        if (itemDto.getResponseType() != null) {
                            try {
                                rType = ResponseType.valueOf(itemDto.getResponseType().toUpperCase());
                            } catch (Exception ignored) {
                            }
                        }

                        TemplateItem item = TemplateItem.builder()
                                .section(savedSection)
                                .code(itemDto.getCode())
                                .title(itemDto.getTitle())
                                .description(itemDto.getDescription())
                                .responseType(rType)
                                .required(itemDto.isRequired())
                                .observationRequiredOnFailure(itemDto.isObservationRequiredOnFailure())
                                .evidenceRequiredOnFailure(itemDto.isEvidenceRequiredOnFailure())
                                .optionsJson(itemDto.getOptionsJson() != null ? itemDto.getOptionsJson() : "[]")
                                .displayOrder(itemDto.getDisplayOrder())
                                .build();

                        itemRepository.save(item);
                    }
                }
            }
        }

        return TemplateResponseDTO.fromEntity(savedTemplate);
    }

    @Transactional
    public TemplateVersionResponseDTO publishNewVersion(UUID templateId, String titleSnapshot, String descriptionSnapshot, User publisher) {
        InspectionTemplate template = templateRepository.findById(templateId)
                .orElseThrow(() -> new ResourceNotFoundException("TEMPLATE_NOT_FOUND", "Modelo de inspeção não encontrado."));

        int nextVersionNumber = template.getCurrentVersion() + 1;
        template.setCurrentVersion(nextVersionNumber);
        templateRepository.save(template);

        InspectionTemplateVersion newVersion = InspectionTemplateVersion.builder()
                .template(template)
                .versionNumber(nextVersionNumber)
                .titleSnapshot(titleSnapshot != null ? titleSnapshot : template.getTitle())
                .descriptionSnapshot(descriptionSnapshot != null ? descriptionSnapshot : template.getDescription())
                .publishedBy(publisher)
                .publishedAt(OffsetDateTime.now())
                .activeForNewInspections(true)
                .build();

        InspectionTemplateVersion saved = versionRepository.save(newVersion);
        return TemplateVersionResponseDTO.fromEntity(saved);
    }
}
