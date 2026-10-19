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
                .map(this::toTemplateResponseDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public TemplateResponseDTO getById(UUID id) {
        InspectionTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TEMPLATE_NOT_FOUND", "Modelo de inspeção não encontrado."));
        return toTemplateResponseDTO(template);
    }

    private TemplateResponseDTO toTemplateResponseDTO(InspectionTemplate template) {
        int sectionsCount = 0;
        int itemsCount = 0;
        var activeVersionOpt = versionRepository
                .findFirstByTemplateIdAndActiveForNewInspectionsTrueOrderByVersionNumberDesc(template.getId());
        if (activeVersionOpt.isPresent()) {
            List<TemplateSection> sections = sectionRepository.findByTemplateVersionIdOrderByDisplayOrderAsc(activeVersionOpt.get().getId());
            sectionsCount = sections.size();
            for (TemplateSection s : sections) {
                itemsCount += itemRepository.findBySectionIdOrderByDisplayOrderAsc(s.getId()).size();
            }
        }
        return TemplateResponseDTO.fromEntity(template, sectionsCount, itemsCount);
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
        String category = (dto.getCategory() != null && !dto.getCategory().isBlank()) ? dto.getCategory() : "Geral";

        InspectionTemplate template = InspectionTemplate.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .category(category)
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

        int sectionsCount = 0;
        int itemsCount = 0;

        // Seções e Itens
        if (dto.getSections() != null) {
            int secCounter = 1;
            for (CreateTemplateDTO.CreateSectionDTO secDto : dto.getSections()) {
                int secOrder = secDto.getDisplayOrder() > 0
                        ? secDto.getDisplayOrder()
                        : (secDto.getOrderIndex() != null ? secDto.getOrderIndex() + 1 : secCounter);
                secCounter++;

                TemplateSection section = TemplateSection.builder()
                        .templateVersion(savedVersion)
                        .title(secDto.getTitle() != null && !secDto.getTitle().isBlank() ? secDto.getTitle() : "Seção " + secOrder)
                        .description(secDto.getDescription())
                        .displayOrder(secOrder)
                        .build();

                TemplateSection savedSection = sectionRepository.save(section);
                sectionsCount++;

                if (secDto.getItems() != null) {
                    int itemCounter = 1;
                    for (CreateTemplateDTO.CreateItemDTO itemDto : secDto.getItems()) {
                        ResponseType rType = ResponseType.CONFORM_NON_CONFORM;
                        if (itemDto.getResponseType() != null) {
                            try {
                                rType = ResponseType.valueOf(itemDto.getResponseType().toUpperCase());
                            } catch (Exception ignored) {
                            }
                        }

                        String itemTitle = (itemDto.getTitle() != null && !itemDto.getTitle().isBlank())
                                ? itemDto.getTitle()
                                : (itemDto.getText() != null && !itemDto.getText().isBlank() ? itemDto.getText() : "Item de verificação " + itemCounter);
                        String itemCode = (itemDto.getCode() != null && !itemDto.getCode().isBlank())
                                ? itemDto.getCode()
                                : String.format("CHK-%d-%d", secOrder, itemCounter);
                        int itemOrder = itemDto.getDisplayOrder() > 0
                                ? itemDto.getDisplayOrder()
                                : (itemDto.getOrderIndex() != null ? itemDto.getOrderIndex() + 1 : itemCounter);
                        itemCounter++;

                        TemplateItem item = TemplateItem.builder()
                                .section(savedSection)
                                .code(itemCode)
                                .title(itemTitle)
                                .description(itemDto.getDescription())
                                .responseType(rType)
                                .required(itemDto.isRequired())
                                .observationRequiredOnFailure(itemDto.isObservationRequiredOnFailure())
                                .evidenceRequiredOnFailure(itemDto.isEvidenceRequiredOnFailure())
                                .optionsJson(itemDto.getOptionsJson() != null ? itemDto.getOptionsJson() : "[]")
                                .displayOrder(itemOrder)
                                .build();

                        itemRepository.save(item);
                        itemsCount++;
                    }
                }
            }
        }

        return TemplateResponseDTO.fromEntity(savedTemplate, sectionsCount, itemsCount);
    }

    @Transactional
    public TemplateVersionResponseDTO publishNewVersion(UUID templateId, String titleSnapshot, String descriptionSnapshot, User publisher) {
        InspectionTemplate template = templateRepository.findById(templateId)
                .orElseThrow(() -> new ResourceNotFoundException("TEMPLATE_NOT_FOUND", "Modelo de inspeção não encontrado."));

        var prevVersionOpt = versionRepository
                .findFirstByTemplateIdAndActiveForNewInspectionsTrueOrderByVersionNumberDesc(templateId);

        List<InspectionTemplateVersion> existingVersions = versionRepository.findByTemplateIdOrderByVersionNumberDesc(templateId);
        for (InspectionTemplateVersion existing : existingVersions) {
            if (Boolean.TRUE.equals(existing.getActiveForNewInspections())) {
                existing.setActiveForNewInspections(false);
                versionRepository.save(existing);
            }
        }

        int nextVersionNumber = template.getCurrentVersion() + 1;
        template.setCurrentVersion(nextVersionNumber);
        templateRepository.save(template);

        InspectionTemplateVersion newVersion = InspectionTemplateVersion.builder()
                .template(template)
                .versionNumber(nextVersionNumber)
                .titleSnapshot(titleSnapshot != null && !titleSnapshot.isBlank() ? titleSnapshot : template.getTitle())
                .descriptionSnapshot(descriptionSnapshot != null && !descriptionSnapshot.isBlank() ? descriptionSnapshot : template.getDescription())
                .publishedBy(publisher)
                .publishedAt(OffsetDateTime.now())
                .activeForNewInspections(true)
                .build();

        InspectionTemplateVersion saved = versionRepository.save(newVersion);

        // Copia seções e itens da versão anterior para a nova versão imutável
        if (prevVersionOpt.isPresent()) {
            List<TemplateSection> prevSections = sectionRepository.findByTemplateVersionIdOrderByDisplayOrderAsc(prevVersionOpt.get().getId());
            for (TemplateSection prevSec : prevSections) {
                TemplateSection clonedSec = TemplateSection.builder()
                        .templateVersion(saved)
                        .title(prevSec.getTitle())
                        .description(prevSec.getDescription())
                        .displayOrder(prevSec.getDisplayOrder())
                        .build();
                TemplateSection savedSec = sectionRepository.save(clonedSec);

                List<TemplateItem> prevItems = itemRepository.findBySectionIdOrderByDisplayOrderAsc(prevSec.getId());
                for (TemplateItem prevItem : prevItems) {
                    TemplateItem clonedItem = TemplateItem.builder()
                            .section(savedSec)
                            .code(prevItem.getCode())
                            .title(prevItem.getTitle())
                            .description(prevItem.getDescription())
                            .responseType(prevItem.getResponseType())
                            .required(prevItem.getRequired())
                            .observationRequiredOnFailure(prevItem.getObservationRequiredOnFailure())
                            .evidenceRequiredOnFailure(prevItem.getEvidenceRequiredOnFailure())
                            .optionsJson(prevItem.getOptionsJson())
                            .displayOrder(prevItem.getDisplayOrder())
                            .build();
                    itemRepository.save(clonedItem);
                }
            }
        }

        return TemplateVersionResponseDTO.fromEntity(saved);
    }
}
