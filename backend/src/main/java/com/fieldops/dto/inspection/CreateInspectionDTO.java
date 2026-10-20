package com.fieldops.dto.inspection;

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
public class CreateInspectionDTO {

    private UUID templateId;

    private UUID templateVersionId;

    private UUID clientId;

    private UUID siteId;

    private UUID equipmentId;

    private UUID technicianId;

    private UUID responsibleId;

    private UUID supervisorId;

    private String title;

    private String instructions;

    private String notes;

    private String description;

    @Builder.Default
    private String priority = "MEDIUM";

    private OffsetDateTime scheduledFor;

    private String scheduledDate;

    @Builder.Default
    private List<MobileQuestionInputDTO> questions = new ArrayList<>();

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MobileQuestionInputDTO {
        private String type;
        private String title;
        private boolean required;
        private Integer order;
    }
}
