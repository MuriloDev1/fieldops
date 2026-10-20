package com.fieldops.dto.site;

import com.fieldops.domain.entity.InspectionSite;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SiteResponseDTO {

    private UUID id;
    private UUID clientId;
    private UUID customerId; // Conveniência para compatibilidade com o front-end
    private String customerName; // Nome do cliente para renderização direta na tabela
    private String name;
    private String description;
    private String address;
    private String addressLine;
    private String city;
    private String state;
    private String postalCode;
    private String supervisor; // Campo mapeado para contactName do banco
    private String contactName;
    private String contactPhone;
    private String status;
    private long equipmentsCount;

    public static SiteResponseDTO fromEntity(InspectionSite site, long equipmentsCount) {
        String clientName = site.getClient() != null ? site.getClient().getName() : "";
        UUID cId = site.getClient() != null ? site.getClient().getId() : null;

        return SiteResponseDTO.builder()
                .id(site.getId())
                .clientId(cId)
                .customerId(cId)
                .customerName(clientName)
                .name(site.getName())
                .description(site.getDescription())
                .address(site.getAddressLine())
                .addressLine(site.getAddressLine())
                .city(site.getCity())
                .state(site.getState())
                .postalCode(site.getPostalCode())
                .supervisor(site.getContactName())
                .contactName(site.getContactName())
                .contactPhone(site.getContactPhone())
                .status(site.getStatus().name())
                .equipmentsCount(equipmentsCount)
                .build();
    }
}
