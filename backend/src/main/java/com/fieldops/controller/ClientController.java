package com.fieldops.controller;

import com.fieldops.domain.enums.ClientStatus;
import com.fieldops.dto.client.ClientResponseDTO;
import com.fieldops.dto.client.CreateClientDTO;
import com.fieldops.service.ClientService;
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
@RequestMapping("/api/v1/clients")
@RequiredArgsConstructor
@Tag(name = "Clientes", description = "Endpoints de gestão de clientes e contratantes (Seção 12.6)")
public class ClientController {

    private final ClientService clientService;

    @GetMapping
    @Operation(summary = "Lista todos os clientes cadastrados", description = "Retorna os clientes com contagem de plantas operacionais.")
    public ResponseEntity<List<ClientResponseDTO>> listAll() {
        return ResponseEntity.ok(clientService.listAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Busca cliente por identificador UUID")
    public ResponseEntity<ClientResponseDTO> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(clientService.getById(id));
    }

    @PostMapping
    @Operation(summary = "Cadastra um novo cliente", description = "Compatível diretamente com o formulário da página ClientsPage.")
    public ResponseEntity<ClientResponseDTO> create(@Valid @RequestBody CreateClientDTO dto) {
        ClientResponseDTO created = clientService.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Altera o status do cliente (ACTIVE/INACTIVE)")
    public ResponseEntity<ClientResponseDTO> updateStatus(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        String statusStr = body.get("status");
        ClientStatus status = ClientStatus.valueOf(statusStr.toUpperCase());
        return ResponseEntity.ok(clientService.updateStatus(id, status));
    }
}
