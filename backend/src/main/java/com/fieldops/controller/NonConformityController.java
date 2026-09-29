package com.fieldops.controller;

import com.fieldops.domain.entity.User;
import com.fieldops.domain.enums.NonConformityStatus;
import com.fieldops.dto.nc.CreateNonConformityDTO;
import com.fieldops.dto.nc.NonConformityResponseDTO;
import com.fieldops.service.NonConformityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Não Conformidades", description = "Endpoints de apontamento e acompanhamento de não conformidades (Seção 12.13)")
public class NonConformityController {

    private final NonConformityService nonConformityService;

    @GetMapping("/non-conformities")
    @Operation(summary = "Lista todas as não conformidades")
    public ResponseEntity<List<NonConformityResponseDTO>> listAll() {
        return ResponseEntity.ok(nonConformityService.listAll());
    }

    @GetMapping("/inspections/{inspectionId}/non-conformities")
    @Operation(summary = "Lista não conformidades de uma inspeção específica")
    public ResponseEntity<List<NonConformityResponseDTO>> listByInspection(@PathVariable UUID inspectionId) {
        return ResponseEntity.ok(nonConformityService.listByInspection(inspectionId));
    }

    @GetMapping("/non-conformities/{id}")
    @Operation(summary = "Busca não conformidade por ID")
    public ResponseEntity<NonConformityResponseDTO> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(nonConformityService.getById(id));
    }

    @PostMapping("/inspections/{inspectionId}/non-conformities")
    @Operation(summary = "Registra uma nova não conformidade vinculada à inspeção")
    public ResponseEntity<NonConformityResponseDTO> create(
            @PathVariable UUID inspectionId,
            @Valid @RequestBody CreateNonConformityDTO dto,
            @AuthenticationPrincipal User user) {
        NonConformityResponseDTO created = nonConformityService.create(inspectionId, dto, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PatchMapping("/non-conformities/{id}/status")
    @Operation(summary = "Atualiza status da não conformidade (OPEN, IN_PROGRESS, RESOLVED, CANCELLED)")
    public ResponseEntity<NonConformityResponseDTO> updateStatus(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        String statusStr = body.get("status");
        NonConformityStatus status = NonConformityStatus.valueOf(statusStr.toUpperCase());
        return ResponseEntity.ok(nonConformityService.updateStatus(id, status));
    }
}
