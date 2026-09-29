package com.fieldops.controller;

import com.fieldops.domain.entity.User;
import com.fieldops.dto.inspection.CreateInspectionDTO;
import com.fieldops.dto.inspection.InspectionResponseDTO;
import com.fieldops.dto.inspection.SubmitResponsesDTO;
import com.fieldops.service.InspectionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Inspeções", description = "Endpoints de agendamento, execução e respostas de inspeções em campo (Seção 12.10 e 12.11)")
public class InspectionController {

    private final InspectionService inspectionService;

    @GetMapping("/inspections")
    @Operation(summary = "Lista todas as inspeções (painel administrativo)")
    public ResponseEntity<List<InspectionResponseDTO>> listAll() {
        return ResponseEntity.ok(inspectionService.listAll());
    }

    @GetMapping("/inspections/{id}")
    @Operation(summary = "Busca detalhes de uma inspeção por ID com snapshots e respostas")
    public ResponseEntity<InspectionResponseDTO> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(inspectionService.getById(id));
    }

    @GetMapping("/mobile/inspections")
    @Operation(summary = "Lista inspeções atribuídas ao técnico autenticado (Seção 12.10)")
    public ResponseEntity<List<InspectionResponseDTO>> listForMobile(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) UUID technicianId) {
        UUID effectiveId = user != null ? user.getId() : technicianId;
        if (effectiveId == null) {
            return ResponseEntity.ok(inspectionService.listAll());
        }
        return ResponseEntity.ok(inspectionService.listByTechnician(effectiveId));
    }

    @PostMapping("/inspections")
    @Operation(summary = "Agenda uma nova inspeção gerando os snapshots imutáveis do checklist")
    public ResponseEntity<InspectionResponseDTO> create(
            @Valid @RequestBody CreateInspectionDTO dto,
            @AuthenticationPrincipal User user) {
        InspectionResponseDTO created = inspectionService.create(dto, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping("/inspections/{id}/start")
    @Operation(summary = "Inicia a execução da inspeção em campo")
    public ResponseEntity<InspectionResponseDTO> start(
            @PathVariable UUID id,
            @RequestBody(required = false) Map<String, String> body) {
        OffsetDateTime deviceTime = null;
        if (body != null && body.containsKey("deviceTime")) {
            try {
                deviceTime = OffsetDateTime.parse(body.get("deviceTime"));
            } catch (Exception ignored) {
            }
        }
        return ResponseEntity.ok(inspectionService.start(id, deviceTime));
    }

    @PostMapping("/inspections/{id}/submit")
    @Operation(summary = "Envia respostas preenchidas da inspeção e finaliza para revisão")
    public ResponseEntity<InspectionResponseDTO> submit(
            @PathVariable UUID id,
            @RequestBody SubmitResponsesDTO dto,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(inspectionService.submit(id, dto, user));
    }

    @PostMapping("/inspections/{id}/cancel")
    @Operation(summary = "Cancela uma inspeção com motivo obrigatório")
    public ResponseEntity<InspectionResponseDTO> cancel(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal User user) {
        String reason = body.getOrDefault("reason", "Cancelamento solicitado pelo supervisor.");
        return ResponseEntity.ok(inspectionService.cancel(id, reason, user));
    }
}
