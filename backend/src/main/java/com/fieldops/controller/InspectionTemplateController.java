package com.fieldops.controller;

import com.fieldops.domain.entity.User;
import com.fieldops.dto.template.CreateTemplateDTO;
import com.fieldops.dto.template.TemplateResponseDTO;
import com.fieldops.dto.template.TemplateVersionResponseDTO;
import com.fieldops.service.InspectionTemplateService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Modelos de Inspeção", description = "Endpoints de gestão de checklists dinâmicos e versionamento imutável (Seção 12.9)")
public class InspectionTemplateController {

    private final InspectionTemplateService templateService;

    @GetMapping("/inspection-templates")
    @Operation(summary = "Lista todos os modelos de inspeção")
    public ResponseEntity<List<TemplateResponseDTO>> listAll() {
        return ResponseEntity.ok(templateService.listAll());
    }

    @GetMapping("/inspection-templates/{id}")
    @Operation(summary = "Busca modelo de inspeção por ID")
    public ResponseEntity<TemplateResponseDTO> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(templateService.getById(id));
    }

    @GetMapping("/inspection-templates/{id}/active-version")
    @Operation(summary = "Obtém a versão ativa atual com seções e itens do checklist")
    public ResponseEntity<TemplateVersionResponseDTO> getActiveVersion(@PathVariable UUID id) {
        return ResponseEntity.ok(templateService.getActiveVersion(id));
    }

    @GetMapping("/inspection-template-versions/{versionId}")
    @Operation(summary = "Busca versão específica imutável do modelo por ID")
    public ResponseEntity<TemplateVersionResponseDTO> getVersionById(@PathVariable UUID versionId) {
        return ResponseEntity.ok(templateService.getVersionById(versionId));
    }

    @PostMapping("/inspection-templates")
    @Operation(summary = "Cria um novo modelo de inspeção com checklist inicial")
    public ResponseEntity<TemplateResponseDTO> create(
            @Valid @RequestBody CreateTemplateDTO dto,
            @AuthenticationPrincipal User user) {
        TemplateResponseDTO created = templateService.create(dto, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping("/inspection-templates/{id}/publish")
    @Operation(summary = "Publica uma nova versão imutável do modelo")
    public ResponseEntity<TemplateVersionResponseDTO> publish(
            @PathVariable UUID id,
            @RequestBody(required = false) CreateTemplateDTO dto,
            @AuthenticationPrincipal User user) {
        String title = dto != null ? dto.getTitle() : null;
        String desc = dto != null ? dto.getDescription() : null;
        return ResponseEntity.ok(templateService.publishNewVersion(id, title, desc, user));
    }
}
