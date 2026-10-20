package com.fieldops.dto.site;

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
public class CreateSiteDTO {

    private UUID clientId;
    private UUID customerId; // Permite envio direto do front-end

    @NotBlank(message = "O nome da planta/unidade é obrigatório")
    private String name;

    private String description;
    private String address;
    private String addressLine;
    private String city;
    private String state;
    private String postalCode;
    private String supervisor; // Mapeado para contactName
    private String contactName;
    private String contactPhone;

    public UUID getEffectiveClientId() {
        return clientId != null ? clientId : customerId;
    }

    public String getEffectiveAddress() {
        return addressLine != null && !addressLine.isBlank() ? addressLine : address;
    }

    public String getEffectiveContactName() {
        return contactName != null && !contactName.isBlank() ? contactName : supervisor;
    }
}
