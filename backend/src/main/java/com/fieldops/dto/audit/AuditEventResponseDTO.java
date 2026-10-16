package com.fieldops.dto.audit;

import com.fieldops.domain.entity.AuditEvent;
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
public class AuditEventResponseDTO {

    private UUID id;
    private UUID inspectionId;
    private UUID actorId;
    private String actorName;
    private String actorEmail;
    private String actorRole;
    private String action;
    private String actionLabel;
    private String description;
    private String entityType;
    private UUID entityId;
    private OffsetDateTime occurredAt;
    private OffsetDateTime deviceOccurredAt;
    private String metadataJson;
    private String requestId;
    private String deviceId;

    public static AuditEventResponseDTO fromEntity(AuditEvent event) {
        if (event == null) return null;

        String actorName = "Sistema";
        String actorEmail = null;
        String actorRole = "SYSTEM";
        UUID actorId = null;

        if (event.getActor() != null) {
            actorId = event.getActor().getId();
            actorName = event.getActor().getName();
            actorEmail = event.getActor().getEmail();
            actorRole = event.getActor().getRole() != null ? event.getActor().getRole().name() : "USER";
        }

        String action = event.getAction();
        String actionLabel = resolveActionLabel(action);
        String description = resolveDescription(action, event);

        return AuditEventResponseDTO.builder()
                .id(event.getId())
                .inspectionId(event.getInspection() != null ? event.getInspection().getId() : null)
                .actorId(actorId)
                .actorName(actorName)
                .actorEmail(actorEmail)
                .actorRole(actorRole)
                .action(action)
                .actionLabel(actionLabel)
                .description(description)
                .entityType(event.getEntityType())
                .entityId(event.getEntityId())
                .occurredAt(event.getOccurredAt())
                .deviceOccurredAt(event.getDeviceOccurredAt())
                .metadataJson(event.getMetadataJson())
                .requestId(event.getRequestId())
                .deviceId(event.getDeviceId())
                .build();
    }

    private static String resolveActionLabel(String action) {
        if (action == null) return "Evento Registrado";
        return switch (action.toUpperCase()) {
            case "INSPECTION_CREATED" -> "Inspeção Criada";
            case "INSPECTION_ASSIGNED" -> "Técnico Atribuído";
            case "INSPECTION_STARTED" -> "Execução Iniciada em Campo";
            case "INSPECTION_SUBMITTED" -> "Respostas Enviadas para Revisão";
            case "REVIEW_STARTED" -> "Revisão Iniciada pelo Supervisor";
            case "INSPECTION_APPROVED" -> "Inspeção Aprovada";
            case "INSPECTION_REJECTED" -> "Inspeção Reprovada";
            case "INSPECTION_CANCELED" -> "Inspeção Cancelada";
            default -> action.replace("_", " ");
        };
    }

    private static String resolveDescription(String action, AuditEvent event) {
        if (event.getMetadataJson() != null && !event.getMetadataJson().isBlank() && !event.getMetadataJson().equals("{}")) {
            return event.getMetadataJson();
        }
        if (action == null) return "Transição de estado registrada na trilha de auditoria.";
        return switch (action.toUpperCase()) {
            case "INSPECTION_CREATED" -> "Inspeção agendada e snapshot imutável de itens gerado.";
            case "INSPECTION_ASSIGNED" -> "Ordem de serviço atribuída para o técnico responsável.";
            case "INSPECTION_STARTED" -> "Técnico realizou validação e iniciou o preenchimento em campo.";
            case "INSPECTION_SUBMITTED" -> "Checklist concluído pelo técnico e submetido para validação.";
            case "REVIEW_STARTED" -> "Supervisor iniciou a análise de evidências e conformidades.";
            case "INSPECTION_APPROVED" -> "Inspeção validada e aprovada pelo supervisor.";
            case "INSPECTION_REJECTED" -> "Inspeção devolvida para correção com apontamentos técnicos.";
            case "INSPECTION_CANCELED" -> "Inspeção cancelada pela gestão operacional.";
            default -> "Registro em conformidade com a norma técnica RN-086.";
        };
    }
}
