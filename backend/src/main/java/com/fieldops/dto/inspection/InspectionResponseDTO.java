package com.fieldops.dto.inspection;

import com.fieldops.domain.entity.Inspection;
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
public class InspectionResponseDTO {

    private UUID id;
    private String title;
    private String instructions;
    private String priority;
    private String status;
    private UUID clientId;
    private String clientName;
    private UUID siteId;
    private String siteName;
    private UUID equipmentId;
    private String equipmentName;
    private String equipmentQrCode;
    private UUID technicianId;
    private String technicianName;
    private UUID supervisorId;
    private String supervisorName;
    private OffsetDateTime scheduledFor;
    private OffsetDateTime startedAtServer;
    private OffsetDateTime submittedAtServer;
    private OffsetDateTime approvedAt;
    private OffsetDateTime canceledAt;
    private String canceledReason;
    @Builder.Default
    private List<InspectionItemSnapshotDTO> items = new ArrayList<>();
    @Builder.Default
    private List<InspectionResponseItemDTO> responses = new ArrayList<>();

    public static InspectionResponseDTO fromEntity(Inspection i) {
        String clientName = i.getClient() != null ? i.getClient().getName() : "";
        String siteName = i.getSite() != null ? i.getSite().getName() : "";
        String eqName = i.getEquipment() != null ? i.getEquipment().getName() : null;
        String eqQr = i.getEquipment() != null ? i.getEquipment().getQrCode() : null;
        UUID eqId = i.getEquipment() != null ? i.getEquipment().getId() : null;
        String techName = i.getTechnician() != null ? i.getTechnician().getName() : "";
        String superName = i.getSupervisor() != null ? i.getSupervisor().getName() : "";

        List<InspectionItemSnapshotDTO> itemDTOs = i.getSnapshots() != null
                ? i.getSnapshots().stream().map(InspectionItemSnapshotDTO::fromEntity).toList()
                : new ArrayList<>();

        List<InspectionResponseItemDTO> respDTOs = i.getResponses() != null
                ? i.getResponses().stream().map(InspectionResponseItemDTO::fromEntity).toList()
                : new ArrayList<>();

        return InspectionResponseDTO.builder()
                .id(i.getId())
                .title(i.getTitle())
                .instructions(i.getInstructions())
                .priority(i.getPriority().name())
                .status(i.getStatus().name())
                .clientId(i.getClient().getId())
                .clientName(clientName)
                .siteId(i.getSite().getId())
                .siteName(siteName)
                .equipmentId(eqId)
                .equipmentName(eqName)
                .equipmentQrCode(eqQr)
                .technicianId(i.getTechnician().getId())
                .technicianName(techName)
                .supervisorId(i.getSupervisor().getId())
                .supervisorName(superName)
                .scheduledFor(i.getScheduledFor())
                .startedAtServer(i.getStartedAtServer())
                .submittedAtServer(i.getSubmittedAtServer())
                .approvedAt(i.getApprovedAt())
                .canceledAt(i.getCanceledAt())
                .canceledReason(i.getCanceledReason())
                .items(itemDTOs)
                .responses(respDTOs)
                .build();
    }
}
