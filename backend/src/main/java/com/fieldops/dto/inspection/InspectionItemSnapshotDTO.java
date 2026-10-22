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
    private int order;
    private String title;
    private String text;
    private String prompt;
    private String type;
    private boolean answered;

    public static InspectionItemSnapshotDTO fromEntity(InspectionItemSnapshot s) {
        return fromEntity(s, false);
    }

    public static InspectionItemSnapshotDTO fromEntity(InspectionItemSnapshot s, boolean answered) {
        String mobileType = mapMobileQuestionType(s.getResponseType() != null ? s.getResponseType().name() : "TEXT_SHORT");
        return InspectionItemSnapshotDTO.builder()
                .id(s.getId())
                .sectionTitle(s.getSectionTitle())
                .sectionDescription(s.getSectionDescription())
                .sectionOrder(s.getSectionOrder())
                .itemCode(s.getItemCode())
                .itemTitle(s.getItemTitle())
                .title(s.getItemTitle())
                .text(s.getItemTitle())
                .prompt(s.getItemTitle())
                .itemDescription(s.getItemDescription())
                .responseType(s.getResponseType() != null ? s.getResponseType().name() : "TEXT_SHORT")
                .type(mobileType)
                .required(Boolean.TRUE.equals(s.getRequired()))
                .rulesJson(s.getRulesJson())
                .optionsJson(s.getOptionsJson())
                .itemOrder(s.getItemOrder())
                .order(s.getItemOrder())
                .answered(answered)
                .build();
    }

    public static String mapMobileQuestionType(String responseType) {
        if (responseType == null) return "SHORT_TEXT";
        return switch (responseType.toUpperCase()) {
            case "CONFORMITY", "CONFORM_NON_CONFORM", "BOOLEAN", "COMPLIANCE" -> "COMPLIANCE";
            case "SINGLE_CHOICE", "MULTIPLE_CHOICE" -> "MULTIPLE_CHOICE";
            case "PHOTO" -> "PHOTO";
            default -> "SHORT_TEXT";
        };
    }
}
