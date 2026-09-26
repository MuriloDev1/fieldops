package com.fieldops.dto.client;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateClientDTO {

    @NotBlank(message = "O nome da empresa é obrigatório")
    private String name;

    private String legalName;

    private String document;

    private String cnpj; // Permite envio direto do front-end

    private String email;

    private String phone;

    public String getEffectiveDocument() {
        return document != null && !document.isBlank() ? document : cnpj;
    }
}
