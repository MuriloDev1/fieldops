package com.fieldops.dto.nc;

import com.fieldops.domain.entity.NonConformity;
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
public class NonConformityResponseDTO {

    private UUID id;
    private UUID inspectionId;
    private UUID inspectionItemId;
    private String title;
    private String description;
    private String severity;
    private String status;
    private OffsetDateTime createdAt;

    public static NonConformityResponseDTO fromEntity(NonConformity nc) {
        return NonConformityResponseDTO.builder()
                .id(nc.getId())
                .inspectionId(nc.getInspection().getId())
                .inspectionItemId(nc.getInspectionItem() != null ? nc.getInspectionItem().getId() : null)
                .title(nc.getTitle())
                .description(nc.getDescription())
                .severity(nc.getSeverity().name())
                .status(nc.getStatus().name())
                .createdAt(nc.getCreatedAt())
                .build();
    }
}
