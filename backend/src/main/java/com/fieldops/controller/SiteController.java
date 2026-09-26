package com.fieldops.controller;

import com.fieldops.domain.enums.SiteStatus;
import com.fieldops.dto.site.CreateSiteDTO;
import com.fieldops.dto.site.SiteResponseDTO;
import com.fieldops.service.SiteService;
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
@Tag(name = "Locais / Plantas", description = "Endpoints de locais e plantas operacionais vinculadas aos clientes (Seção 12.7)")
public class SiteController {

    private final SiteService siteService;

    @GetMapping("/sites")
    @Operation(summary = "Lista todos os locais e plantas")
    public ResponseEntity<List<SiteResponseDTO>> listAll() {
        return ResponseEntity.ok(siteService.listAll());
    }

    @GetMapping("/sites/{id}")
    @Operation(summary = "Busca local por ID")
    public ResponseEntity<SiteResponseDTO> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(siteService.getById(id));
    }

    @GetMapping("/clients/{clientId}/sites")
    @Operation(summary = "Lista os locais de um cliente específico", description = "Permite filtrar plantas por cliente conforme Seção 12.7.")
    public ResponseEntity<List<SiteResponseDTO>> listByClient(@PathVariable UUID clientId) {
        return ResponseEntity.ok(siteService.listByClient(clientId));
    }

    @PostMapping("/sites")
    @Operation(summary = "Cadastra um novo local/planta", description = "Compatível diretamente com o formulário da LocationsPage.")
    public ResponseEntity<SiteResponseDTO> create(@Valid @RequestBody CreateSiteDTO dto) {
        SiteResponseDTO created = siteService.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PatchMapping("/sites/{id}/status")
    @Operation(summary = "Altera o status do local (ACTIVE/INACTIVE)")
    public ResponseEntity<SiteResponseDTO> updateStatus(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        String statusStr = body.get("status");
        SiteStatus status = SiteStatus.valueOf(statusStr.toUpperCase());
        return ResponseEntity.ok(siteService.updateStatus(id, status));
    }
}
