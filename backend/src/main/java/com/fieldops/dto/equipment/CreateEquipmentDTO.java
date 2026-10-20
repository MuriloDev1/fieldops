package com.fieldops.dto.equipment;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateEquipmentDTO {

    @NotBlank(message = "O nome do equipamento é obrigatório")
    private String name;

    private String code; // Enviado pelo app mobile (gizella)
    private String qrCode;
    private String qrCodeId; // Permite envio direto do front-end web

    private String type; // Categoria do equipamento

    private UUID siteId;
    private UUID locationId; // Permite envio direto do front-end web
    private String location; // Nome do local enviado pelo app mobile (gizella)

    private String serialNumber;
    private String assetNumber;
    private String manufacturer;
    private String model;
    private String description;
    private String status;

    public UUID getEffectiveSiteId() {
        return siteId != null ? siteId : locationId;
    }

    public String getEffectiveQrCode() {
        if (qrCode != null && !qrCode.isBlank()) return qrCode.trim();
        if (qrCodeId != null && !qrCodeId.isBlank()) return qrCodeId.trim();
        if (code != null && !code.isBlank()) return code.trim();
        return null;
    }
}
