package com.fieldops.dto.template;

import com.fieldops.domain.entity.TemplateItem;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TemplateItemDTO {

    private UUID id;
    private String code;
    private String title;
    private String description;
    private String responseType;
    private boolean required;
    private boolean observationRequiredOnFailure;
    private boolean evidenceRequiredOnFailure;
    private String optionsJson;
    private int displayOrder;

    public static TemplateItemDTO fromEntity(TemplateItem item) {
        return TemplateItemDTO.builder()
                .id(item.getId())
                .code(item.getCode())
                .title(item.getTitle())
                .description(item.getDescription())
                .responseType(item.getResponseType().name())
                .required(item.getRequired())
                .observationRequiredOnFailure(item.getObservationRequiredOnFailure())
                .evidenceRequiredOnFailure(item.getEvidenceRequiredOnFailure())
                .optionsJson(item.getOptionsJson())
                .displayOrder(item.getDisplayOrder())
                .build();
    }
}
