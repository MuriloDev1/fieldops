package com.fieldops.controller;

import com.fieldops.domain.entity.User;
import com.fieldops.domain.enums.UserRole;
import com.fieldops.domain.enums.UserStatus;
import com.fieldops.dto.auth.CreateUserDTO;
import com.fieldops.dto.auth.UserResponseDTO;
import com.fieldops.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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
    public ResponseEntity<List<UserResponseDTO>> listAll(@AuthenticationPrincipal User currentUser) {
        if (currentUser != null && currentUser.getRole() == UserRole.TECHNICIAN) {
            throw new AccessDeniedException("Técnicos não possuem permissão para listar cadastros administrativos de usuários (AC-USERS / RN-003).");
        }
        return ResponseEntity.ok(userService.listAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Busca usuário por ID")
    public ResponseEntity<UserResponseDTO> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(userService.getById(id));
    }

    @PostMapping
    @Operation(summary = "Cadastra um novo usuário / colaborador")
    public ResponseEntity<UserResponseDTO> create(
            @Valid @RequestBody CreateUserDTO dto,
            @AuthenticationPrincipal User currentUser) {
        if (currentUser != null && currentUser.getRole() != UserRole.ADMIN) {
            throw new AccessDeniedException("Apenas administradores podem cadastrar novos usuários (AC-USERS / RN-006).");
        }
        UserResponseDTO created = userService.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Altera o status do usuário (ACTIVE, INACTIVE, BLOCKED)")
    public ResponseEntity<UserResponseDTO> updateStatus(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal User currentUser) {
        if (currentUser != null && currentUser.getRole() != UserRole.ADMIN) {
            throw new AccessDeniedException("Apenas administradores podem alterar o status de usuários (AC-USERS / RN-006).");
        }
        String statusStr = body.get("status");
        UserStatus status = UserStatus.valueOf(statusStr.toUpperCase());
        return ResponseEntity.ok(userService.updateStatus(id, status));
    }
}
