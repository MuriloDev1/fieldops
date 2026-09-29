package com.fieldops.dto.template;

import com.fieldops.domain.entity.InspectionTemplateVersion;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TemplateVersionResponseDTO {

    private UUID id;
    private UUID templateId;
    private int versionNumber;
    private String titleSnapshot;
    private String descriptionSnapshot;
    private OffsetDateTime publishedAt;
    private boolean activeForNewInspections;
    @Builder.Default
    private List<TemplateSectionDTO> sections = new ArrayList<>();

    public static TemplateVersionResponseDTO fromEntity(InspectionTemplateVersion version) {
        List<TemplateSectionDTO> sectionDTOs = version.getSections() != null
                ? version.getSections().stream().map(TemplateSectionDTO::fromEntity).toList()
                : new ArrayList<>();

        return TemplateVersionResponseDTO.builder()
                .id(version.getId())
                .templateId(version.getTemplate().getId())
                .versionNumber(version.getVersionNumber())
                .titleSnapshot(version.getTitleSnapshot())
                .descriptionSnapshot(version.getDescriptionSnapshot())
                .publishedAt(version.getPublishedAt())
                .activeForNewInspections(version.getActiveForNewInspections())
                .sections(sectionDTOs)
                .build();
    }
}
