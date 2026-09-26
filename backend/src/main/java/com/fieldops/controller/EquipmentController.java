package com.fieldops.controller;

import com.fieldops.domain.enums.EquipmentStatus;
import com.fieldops.dto.equipment.CreateEquipmentDTO;
import com.fieldops.dto.equipment.EquipmentResponseDTO;
import com.fieldops.service.EquipmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Equipamentos", description = "Endpoints de gerenciamento e identificação por QR Code de equipamentos (Seção 12.8)")
public class EquipmentController {

    private final EquipmentService equipmentService;

    @GetMapping("/equipment")
    @Operation(summary = "Lista todos os equipamentos", description = "Compatível com a tabela de equipamentos da tela EquipmentPage.")
    public ResponseEntity<List<EquipmentResponseDTO>> listAll(
            @RequestParam(required = false) UUID clientId,
            @RequestParam(required = false) UUID siteId) {
        if (siteId != null) {
            return ResponseEntity.ok(equipmentService.listBySite(siteId));
        }
        if (clientId != null) {
            return ResponseEntity.ok(equipmentService.listByClient(clientId));
        }
        return ResponseEntity.ok(equipmentService.listAll());
    }

    @GetMapping("/equipment/{id}")
    @Operation(summary = "Busca equipamento por ID")
    public ResponseEntity<EquipmentResponseDTO> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(equipmentService.getById(id));
    }

    @GetMapping("/equipment/by-qr/{qrCode}")
    @Operation(summary = "Busca equipamento pelo código do QR Code", description = "Utilizado pelo leitor de QR Code do aplicativo mobile em campo.")
    public ResponseEntity<EquipmentResponseDTO> getByQrCode(@PathVariable String qrCode) {
        return ResponseEntity.ok(equipmentService.getByQrCode(qrCode));
    }

    @GetMapping("/sites/{siteId}/equipment")
    @Operation(summary = "Lista equipamentos de uma planta/local específica")
    public ResponseEntity<List<EquipmentResponseDTO>> listBySite(@PathVariable UUID siteId) {
        return ResponseEntity.ok(equipmentService.listBySite(siteId));
    }

    @PostMapping("/equipment")
    @Operation(summary = "Cadastra novo equipamento com QR Code", description = "Compatível com o formulário de cadastro da EquipmentPage.")
    public ResponseEntity<EquipmentResponseDTO> create(@Valid @RequestBody CreateEquipmentDTO dto) {
        EquipmentResponseDTO created = equipmentService.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PatchMapping("/equipment/{id}/status")
    @Operation(summary = "Altera status operacional do equipamento")
    public ResponseEntity<EquipmentResponseDTO> updateStatus(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        String statusStr = body.get("status");
        EquipmentStatus status = EquipmentStatus.valueOf(statusStr.toUpperCase());
        return ResponseEntity.ok(equipmentService.updateStatus(id, status));
    }
}
