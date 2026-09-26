package com.fieldops.dto.client;

import com.fieldops.domain.entity.Client;
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
public class ClientResponseDTO {

    private UUID id;
    private String name;
    private String legalName;
    private String document;
    private String cnpj; // Campo de conveniência idêntico a document para compatibilidade direta com o front-end
    private String email;
    private String phone;
    private String status;
    private long locationsCount;
    private OffsetDateTime createdAt;

    public static ClientResponseDTO fromEntity(Client client, long locationsCount) {
        return ClientResponseDTO.builder()
                .id(client.getId())
                .name(client.getName())
                .legalName(client.getLegalName())
                .document(client.getDocument())
                .cnpj(client.getDocument())
                .email(client.getEmail())
                .phone(client.getPhone())
                .status(client.getStatus().name())
                .locationsCount(locationsCount)
                .createdAt(client.getCreatedAt())
                .build();
    }
}
