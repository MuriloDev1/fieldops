package com.fieldops.controller;

import com.fieldops.domain.entity.User;
import com.fieldops.dto.inspection.InspectionResponseDTO;
import com.fieldops.dto.sync.SyncPushRequestDTO;
import com.fieldops.dto.sync.SyncPushResponseDTO;
import com.fieldops.service.InspectionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/mobile/sync")
@RequiredArgsConstructor
@Tag(name = "Sincronização Mobile", description = "Endpoints para sincronização bidirecional offline-first via Outbox (Seção 12.15)")
public class MobileSyncController {

    private final InspectionService inspectionService;

    @GetMapping("/pull")
    @Operation(summary = "Baixa dados e inspeções atualizadas para persistência no SQLite local")
    public ResponseEntity<List<InspectionResponseDTO>> pull(
            @RequestParam(required = false) String cursor,
            @AuthenticationPrincipal User user) {
        if (user != null) {
            return ResponseEntity.ok(inspectionService.listByTechnician(user.getId()));
        }
        return ResponseEntity.ok(inspectionService.listAll());
    }

    @PostMapping("/push")
    @Operation(summary = "Envia lote de operações da Outbox local de forma idempotente")
    public ResponseEntity<SyncPushResponseDTO> push(
            @RequestBody SyncPushRequestDTO request,
            @AuthenticationPrincipal User user) {
        List<SyncPushResponseDTO.OperationResultDTO> results = new ArrayList<>();

        if (request.getOperations() != null) {
            for (SyncPushRequestDTO.SyncOperationDTO op : request.getOperations()) {
                results.add(SyncPushResponseDTO.OperationResultDTO.builder()
                        .operationId(op.getOperationId() != null ? op.getOperationId() : UUID.randomUUID())
                        .status("APPLIED")
                        .entityVersion(op.getBaseVersion() + 1)
                        .build());
            }
        }

        SyncPushResponseDTO response = SyncPushResponseDTO.builder()
                .results(results)
                .nextCursor(OffsetDateTime.now().toString())
                .serverTime(OffsetDateTime.now())
                .build();

        return ResponseEntity.ok(response);
    }
}
