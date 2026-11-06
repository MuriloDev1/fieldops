package com.fieldops.dto.inspection;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubmitResponsesDTO {

    @Builder.Default
    private List<ItemAnswerDTO> answers = new ArrayList<>();

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ItemAnswerDTO {
        private UUID inspectionItemId;
        private UUID snapshotItemId;
        private String valueText;
        private BigDecimal valueNumber;
        private Boolean valueBoolean;
        private Boolean compliant;
        private LocalDate valueDate;
        private String valueJson;
        private String answerJson;
        private String observation;
        private String conformity; // NOT_APPLICABLE, CONFORMING, NON_CONFORMING
        private OffsetDateTime answeredAtDevice;

        public UUID getEffectiveItemId() {
            return inspectionItemId != null ? inspectionItemId : snapshotItemId;
        }
    }
}
