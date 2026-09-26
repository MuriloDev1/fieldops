package com.fieldops.controller;

import com.fieldops.domain.enums.UserStatus;
import com.fieldops.dto.auth.UserResponseDTO;
import com.fieldops.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "Usuários", description = "Endpoints de gerenciamento de usuários do sistema (Seção 12.5)")
public class UserController {

    private final UserService userService;

    @GetMapping
    @Operation(summary = "Lista todos os usuários cadastrados")
    public ResponseEntity<List<UserResponseDTO>> listAll() {
        return ResponseEntity.ok(userService.listAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Busca usuário por ID")
    public ResponseEntity<UserResponseDTO> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(userService.getById(id));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Altera o status do usuário (ACTIVE, INACTIVE, BLOCKED)")
    public ResponseEntity<UserResponseDTO> updateStatus(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        String statusStr = body.get("status");
        UserStatus status = UserStatus.valueOf(statusStr.toUpperCase());
        return ResponseEntity.ok(userService.updateStatus(id, status));
    }
}
