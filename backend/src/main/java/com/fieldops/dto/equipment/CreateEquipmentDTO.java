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

    private String qrCode;
    private String qrCodeId; // Permite envio direto do front-end

    private String type; // Categoria do equipamento

    private UUID siteId;
    private UUID locationId; // Permite envio direto do front-end

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
        return qrCode != null && !qrCode.isBlank() ? qrCode : qrCodeId;
    }
}
