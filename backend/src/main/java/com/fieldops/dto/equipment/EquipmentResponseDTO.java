package com.fieldops.dto.equipment;

import com.fieldops.domain.entity.Equipment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EquipmentResponseDTO {

    private UUID id;
    private String name;
    private String qrCode;
    private String qrCodeId; // Conveniência para EquipmentPage do front-end
    private String type;
    private UUID customerId; // Conveniência
    private String customerName;
    private UUID locationId; // Conveniência (siteId)
    private UUID siteId;
    private String locationName;
    private String siteName;
    private String serialNumber;
    private String assetNumber;
    private String manufacturer;
    private String model;
    private String description;
    private String status;
    private String lastInspected;

    public static EquipmentResponseDTO fromEntity(Equipment eq) {
        String clientName = "";
        UUID cId = null;
        String siteName = "";
        UUID sId = null;

        if (eq.getSite() != null) {
            sId = eq.getSite().getId();
            siteName = eq.getSite().getName();
            if (eq.getSite().getClient() != null) {
                cId = eq.getSite().getClient().getId();
                clientName = eq.getSite().getClient().getName();
            }
        }

        String formattedDate = eq.getCreatedAt() != null 
                ? eq.getCreatedAt().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) 
                : "";

        return EquipmentResponseDTO.builder()
                .id(eq.getId())
                .name(eq.getName())
                .qrCode(eq.getQrCode())
                .qrCodeId(eq.getQrCode())
                .type(eq.getType() != null ? eq.getType() : "Equipamento Geral")
                .customerId(cId)
                .customerName(clientName)
                .locationId(sId)
                .siteId(sId)
                .locationName(siteName)
                .siteName(siteName)
                .serialNumber(eq.getSerialNumber())
                .assetNumber(eq.getAssetNumber())
                .manufacturer(eq.getManufacturer())
                .model(eq.getModel())
                .description(eq.getDescription())
                .status(eq.getStatus().name())
                .lastInspected(formattedDate)
                .build();
    }
}
