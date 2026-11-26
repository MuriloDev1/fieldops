package com.fieldops.controller;

import com.fieldops.common.exception.BusinessException;
import com.fieldops.common.exception.ResourceNotFoundException;
import com.fieldops.domain.entity.AuditEvent;
import com.fieldops.domain.entity.Inspection;
import com.fieldops.domain.entity.User;
import com.fieldops.domain.enums.InspectionStatus;
import com.fieldops.dto.inspection.InspectionResponseDTO;
import com.fieldops.dto.sync.SyncPushRequestDTO;
import com.fieldops.dto.sync.SyncPushResponseDTO;
import com.fieldops.repository.AuditEventRepository;
import com.fieldops.repository.InspectionRepository;
import com.fieldops.service.InspectionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/v1/mobile/sync")
@RequiredArgsConstructor
@Tag(name = "Sincronização Mobile", description = "Endpoints para sincronização bidirecional offline-first via Outbox (Seção 12.15, RN-067 a RN-076)")
public class MobileSyncController {

    private final InspectionService inspectionService;
    private final InspectionRepository inspectionRepository;
    private final AuditEventRepository auditEventRepository;

    private final Set<UUID> processedOperationsCache = ConcurrentHashMap.newKeySet();

    @GetMapping("/pull")
    @Operation(summary = "Baixa dados e inspeções atualizadas para persistência local")
    public ResponseEntity<List<InspectionResponseDTO>> pull(
            @RequestParam(required = false) String cursor,
            @RequestParam(required = false) UUID technicianId,
            @AuthenticationPrincipal User user) {
        if (user != null) {
            return ResponseEntity.ok(inspectionService.listByTechnician(user.getId()));
        }
        if (technicianId != null) {
            return ResponseEntity.ok(inspectionService.listByTechnician(technicianId));
        }
        return ResponseEntity.ok(inspectionService.listAll());
    }

    @PostMapping("/push")
    @Operation(summary = "Envia lote de operações da Outbox local de forma idempotente (RN-067, RN-068, RN-070, RN-076)")
    public ResponseEntity<SyncPushResponseDTO> push(
            @RequestBody SyncPushRequestDTO request,
            @AuthenticationPrincipal User user) {
        List<SyncPushResponseDTO.OperationResultDTO> results = new ArrayList<>();
        String deviceIdStr = request.getDeviceId() != null ? request.getDeviceId().toString() : "mobile-device";

        if (request.getOperations() != null) {
            for (SyncPushRequestDTO.SyncOperationDTO op : request.getOperations()) {
                UUID opId = op.getOperationId() != null ? op.getOperationId() : UUID.randomUUID();
                String opIdStr = opId.toString();

                // 1. Verificação estrita de idempotência (RN-068 / AC-SYNC)
                if (processedOperationsCache.contains(opId) || auditEventRepository.existsByRequestId(opIdStr)) {
                    results.add(SyncPushResponseDTO.OperationResultDTO.builder()
                            .operationId(opId)
                            .status("ALREADY_APPLIED")
                            .entityVersion(op.getBaseVersion() + 1)
                            .build());
                    continue;
                }

                try {
                    String status = processSingleOperation(op, opIdStr, deviceIdStr, user);
                    if ("APPLIED".equals(status)) {
                        processedOperationsCache.add(opId);
                    }
                    results.add(SyncPushResponseDTO.OperationResultDTO.builder()
                            .operationId(opId)
                            .status(status)
                            .entityVersion(op.getBaseVersion() + 1)
                            .build());
                } catch (BusinessException ex) {
                    // RN-070: Isolamento de erro — falha em uma operação não apaga nem derruba as demais do lote
                    String errStatus = ex.getCode() != null && ex.getCode().contains("LOCKED") ? "CONFLICT" : "REJECTED";
                    results.add(SyncPushResponseDTO.OperationResultDTO.builder()
                            .operationId(opId)
                            .status(errStatus)
                            .entityVersion(op.getBaseVersion())
                            .build());
                } catch (ResourceNotFoundException ex) {
                    results.add(SyncPushResponseDTO.OperationResultDTO.builder()
                            .operationId(opId)
                            .status("REJECTED")
                            .entityVersion(op.getBaseVersion())
                            .build());
                } catch (Exception ex) {
                    results.add(SyncPushResponseDTO.OperationResultDTO.builder()
                            .operationId(opId)
                            .status("REJECTED")
                            .entityVersion(op.getBaseVersion())
                            .build());
                }
            }
        }

        SyncPushResponseDTO response = SyncPushResponseDTO.builder()
                .results(results)
                .nextCursor(OffsetDateTime.now().toString())
                .serverTime(OffsetDateTime.now())
                .build();

        return ResponseEntity.ok(response);
    }

    private String processSingleOperation(
            SyncPushRequestDTO.SyncOperationDTO op,
            String opIdStr,
            String deviceIdStr,
            User user) {
        Map<String, Object> payload = op.getPayload() != null ? op.getPayload() : Collections.emptyMap();
        String entityType = op.getEntityType() != null ? op.getEntityType().toUpperCase() : "INSPECTION_RESPONSE";
        String operationType = op.getOperationType() != null ? op.getOperationType().toUpperCase() : "UPSERT";

        UUID inspectionId = resolveUuid(payload.get("inspectionId"), op.getEntityId());
        Inspection targetInspection = inspectionId != null ? inspectionRepository.findById(inspectionId).orElse(null) : null;

        // RN-076: Dados aprovados no servidor prevalecem e não aceitam atualização tardia comum
        if (targetInspection != null && targetInspection.getStatus() == InspectionStatus.APPROVED) {
            return "CONFLICT";
        }

        if ("INSPECTION".equals(entityType) && ("START".equals(operationType) || "IN_PROGRESS".equals(String.valueOf(payload.get("status"))))) {
            if (targetInspection == null) {
                throw new ResourceNotFoundException("INSPECTION_NOT_FOUND", "Inspeção não encontrada para início.");
            }
            OffsetDateTime deviceTime = parseDeviceTime(payload.get("deviceTime"));
            String qrCode = payload.get("qrCode") != null ? String.valueOf(payload.get("qrCode")) : null;
            String lat = payload.get("latitude") != null ? String.valueOf(payload.get("latitude")) : null;
            String lng = payload.get("longitude") != null ? String.valueOf(payload.get("longitude")) : null;
            inspectionService.startWithValidation(targetInspection.getId(), deviceTime, qrCode, lat, lng);
        } else if ("INSPECTION_RESPONSE".equals(entityType)) {
            if (targetInspection != null) {
                UUID questionId = resolveUuid(payload.get("inspectionItemId"), resolveUuid(payload.get("questionId"), null));
                UUID userId = user != null ? user.getId() : resolveUuid(payload.get("userId"), null);
                String val = payload.get("value") != null
                        ? String.valueOf(payload.get("value"))
                        : (payload.get("conformity") != null ? String.valueOf(payload.get("conformity")) : "CONFORMING");
                String obs = payload.get("observation") != null ? String.valueOf(payload.get("observation")) : null;
                String photoUrl = payload.get("photoUrl") != null ? String.valueOf(payload.get("photoUrl")) : null;
                String sigUrl = payload.get("signatureUrl") != null ? String.valueOf(payload.get("signatureUrl")) : null;
                inspectionService.saveSingleAnswer(targetInspection.getId(), questionId, userId, val, obs, photoUrl, sigUrl);
            }
        } else if ("INSPECTION".equals(entityType) && ("COMPLETE".equals(operationType) || "SUBMIT".equals(operationType))) {
            if (targetInspection == null) {
                throw new ResourceNotFoundException("INSPECTION_NOT_FOUND", "Inspeção não encontrada para conclusão.");
            }
            UUID userId = user != null ? user.getId() : resolveUuid(payload.get("userId"), null);
            String obs = payload.get("observation") != null ? String.valueOf(payload.get("observation")) : null;
            inspectionService.completeMobileInspection(targetInspection.getId(), userId, obs);
        }

        // Registra evento de auditoria com requestId = operationId para persistir a chave de idempotência no banco (RN-068 / RN-086)
        AuditEvent syncAudit = AuditEvent.builder()
                .inspection(targetInspection)
                .actor(user != null ? user : (targetInspection != null ? targetInspection.getTechnician() : null))
                .action("SYNC_OPERATION_" + operationType)
                .entityType(entityType)
                .entityId(op.getEntityId() != null ? op.getEntityId() : (inspectionId != null ? inspectionId : UUID.randomUUID()))
                .occurredAt(OffsetDateTime.now())
                .deviceOccurredAt(parseDeviceTime(payload.get("answeredAtDevice")))
                .metadataJson("{\"operationId\":\"" + opIdStr + "\",\"status\":\"APPLIED\"}")
                .requestId(opIdStr)
                .deviceId(deviceIdStr)
                .build();
        auditEventRepository.save(syncAudit);

        return "APPLIED";
    }

    private UUID resolveUuid(Object candidate, UUID fallback) {
        if (candidate == null) return fallback;
        try {
            return UUID.fromString(String.valueOf(candidate));
        } catch (Exception e) {
            return fallback;
        }
    }

    private OffsetDateTime parseDeviceTime(Object raw) {
        if (raw == null) return OffsetDateTime.now();
        try {
            return OffsetDateTime.parse(String.valueOf(raw));
        } catch (Exception e) {
            return OffsetDateTime.now();
        }
    }
}
