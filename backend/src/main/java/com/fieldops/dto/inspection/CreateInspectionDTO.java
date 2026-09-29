package com.fieldops.dto.inspection;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class CreateInspectionDTO {

    @NotNull(message = "O modelo de inspeção é obrigatório")
    private UUID templateId;

    private UUID templateVersionId;

    @NotNull(message = "O cliente é obrigatório")
    private UUID clientId;

    @NotNull(message = "O local/planta é obrigatório")
    private UUID siteId;

    private UUID equipmentId;

    @NotNull(message = "O técnico responsável é obrigatório")
    private UUID technicianId;

    @NotNull(message = "O supervisor responsável é obrigatório")
    private UUID supervisorId;

    @NotBlank(message = "O título da inspeção é obrigatório")
    private String title;

    private String instructions;

    @Builder.Default
    private String priority = "MEDIUM";

    private OffsetDateTime scheduledFor;
}
