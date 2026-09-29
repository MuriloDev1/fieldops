package com.fieldops.dto.inspection;

import com.fieldops.domain.entity.InspectionResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InspectionResponseItemDTO {

    private UUID id;
    private UUID inspectionItemId;
    private String valueText;
    private BigDecimal valueNumber;
    private Boolean valueBoolean;
    private LocalDate valueDate;
    private String valueJson;
    private String observation;
    private String conformity;
    private OffsetDateTime answeredAtDevice;
    private int baseVersion;

    public static InspectionResponseItemDTO fromEntity(InspectionResponse r) {
        return InspectionResponseItemDTO.builder()
                .id(r.getId())
                .inspectionItemId(r.getInspectionItem().getId())
                .valueText(r.getValueText())
                .valueNumber(r.getValueNumber())
                .valueBoolean(r.getValueBoolean())
                .valueDate(r.getValueDate())
                .valueJson(r.getValueJson())
                .observation(r.getObservation())
                .conformity(r.getConformity() != null ? r.getConformity().name() : null)
                .answeredAtDevice(r.getAnsweredAtDevice())
                .baseVersion(r.getVersion())
                .build();
    }
}
