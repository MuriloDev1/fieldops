package com.fieldops.dto.template;

import com.fieldops.domain.entity.TemplateSection;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TemplateSectionDTO {

    private UUID id;
    private String title;
    private String description;
    private int displayOrder;
    @Builder.Default
    private List<TemplateItemDTO> items = new ArrayList<>();

    public static TemplateSectionDTO fromEntity(TemplateSection section) {
        List<TemplateItemDTO> itemDTOs = section.getItems() != null
                ? section.getItems().stream().map(TemplateItemDTO::fromEntity).toList()
                : new ArrayList<>();

        return TemplateSectionDTO.builder()
                .id(section.getId())
                .title(section.getTitle())
                .description(section.getDescription())
                .displayOrder(section.getDisplayOrder())
                .items(itemDTOs)
                .build();
    }
}
