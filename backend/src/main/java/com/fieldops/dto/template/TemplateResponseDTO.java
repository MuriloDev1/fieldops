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
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public static TemplateResponseDTO fromEntity(InspectionTemplate template) {
        return TemplateResponseDTO.builder()
                .id(template.getId())
                .title(template.getTitle())
                .description(template.getDescription())
                .category(template.getCategory())
                .status(template.getStatus().name())
                .currentVersion(template.getCurrentVersion())
                .createdAt(template.getCreatedAt())
                .updatedAt(template.getUpdatedAt())
                .build();
    }
}
