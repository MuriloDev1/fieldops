package com.fieldops.dto.inspection;

import com.fieldops.domain.entity.InspectionItemSnapshot;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InspectionItemSnapshotDTO {

    private UUID id;
    private String sectionTitle;
    private String sectionDescription;
    private int sectionOrder;
    private String itemCode;
    private String itemTitle;
    private String itemDescription;
    private String responseType;
    private boolean required;
    private String rulesJson;
    private String optionsJson;
    private int itemOrder;

    public static InspectionItemSnapshotDTO fromEntity(InspectionItemSnapshot s) {
        return InspectionItemSnapshotDTO.builder()
                .id(s.getId())
                .sectionTitle(s.getSectionTitle())
                .sectionDescription(s.getSectionDescription())
                .sectionOrder(s.getSectionOrder())
                .itemCode(s.getItemCode())
                .itemTitle(s.getItemTitle())
                .itemDescription(s.getItemDescription())
                .responseType(s.getResponseType().name())
                .required(s.getRequired())
                .rulesJson(s.getRulesJson())
                .optionsJson(s.getOptionsJson())
                .itemOrder(s.getItemOrder())
                .build();
    }
}
