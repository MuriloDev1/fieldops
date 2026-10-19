package com.fieldops.dto.nc;

import com.fieldops.domain.entity.Inspection;
import com.fieldops.domain.entity.NonConformity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NonConformityResponseDTO {

    private static final DateTimeFormatter BR_DATE = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private UUID id;
    private UUID inspectionId;
    private UUID inspectionItemId;
    private String title;
    private String description;
    private String severity;
    private String status;
    private String local;
    private String siteName;
    private String equipment;
    private String equipmentName;
    private String technician;
    private String technicianName;
    private String date;
    private OffsetDateTime createdAt;

    public static NonConformityResponseDTO fromEntity(NonConformity nc) {
        Inspection insp = nc.getInspection();
        String site = (insp != null && insp.getSite() != null) ? insp.getSite().getName() : "Planta Principal";
        String eq = (insp != null && insp.getEquipment() != null) ? insp.getEquipment().getName() : "Ativo Geral";
        String tech = (nc.getCreatedBy() != null)
                ? nc.getCreatedBy().getName()
                : ((insp != null && insp.getTechnician() != null) ? insp.getTechnician().getName() : "Carlos Lima");
        String dateStr = nc.getCreatedAt() != null ? nc.getCreatedAt().format(BR_DATE) : "";

        return NonConformityResponseDTO.builder()
                .id(nc.getId())
                .inspectionId(insp != null ? insp.getId() : null)
                .inspectionItemId(nc.getInspectionItem() != null ? nc.getInspectionItem().getId() : null)
                .title(nc.getTitle())
                .description(nc.getDescription())
                .severity(nc.getSeverity().name())
                .status(nc.getStatus().name())
                .local(site)
                .siteName(site)
                .equipment(eq)
                .equipmentName(eq)
                .technician(tech)
                .technicianName(tech)
                .date(dateStr)
                .createdAt(nc.getCreatedAt())
                .build();
    }
}
