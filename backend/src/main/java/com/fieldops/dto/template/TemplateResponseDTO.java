package com.fieldops.dto.template;

import com.fieldops.domain.entity.InspectionTemplate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TemplateResponseDTO {

    private UUID id;
    private String title;
    private String description;
    private String category;
    private String status;
    private int currentVersion;
    private int versionNumber;
    private int sectionsCount;
    private int itemsCount;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public static TemplateResponseDTO fromEntity(InspectionTemplate template) {
        return fromEntity(template, 0, 0);
    }

    public static TemplateResponseDTO fromEntity(InspectionTemplate template, int sectionsCount, int itemsCount) {
        return TemplateResponseDTO.builder()
                .id(template.getId())
                .title(template.getTitle())
                .description(template.getDescription())
                .category(template.getCategory())
                .status(template.getStatus().name())
                .currentVersion(template.getCurrentVersion())
                .versionNumber(template.getCurrentVersion())
                .sectionsCount(sectionsCount)
                .itemsCount(itemsCount)
                .createdAt(template.getCreatedAt())
                .updatedAt(template.getUpdatedAt())
                .build();
    }
}
