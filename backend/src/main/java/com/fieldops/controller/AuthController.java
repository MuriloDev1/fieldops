package com.fieldops.controller;

import com.fieldops.domain.entity.User;
import com.fieldops.dto.auth.AuthResponseDTO;
import com.fieldops.dto.auth.LoginRequestDTO;
import com.fieldops.dto.auth.UserResponseDTO;
import com.fieldops.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Autenticação", description = "Endpoints de autenticação e sessão de usuários (Seção 12.4)")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "Realiza login na plataforma", description = "Autentica o usuário e retorna o token JWT Bearer.")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginRequestDTO request) {
        AuthResponseDTO response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    @Operation(summary = "Obtém dados do usuário autenticado", description = "Retorna o perfil do usuário logado baseado no token Bearer.")
    public ResponseEntity<UserResponseDTO> getMe(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(UserResponseDTO.fromEntity(user));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Renova o token JWT de acesso", description = "Valida o refresh token e emite novo token Bearer.")
    public ResponseEntity<AuthResponseDTO> refresh(@RequestBody java.util.Map<String, String> request) {
        String refreshToken = request != null ? request.get("refreshToken") : null;
        if (refreshToken == null || refreshToken.isBlank()) {
            refreshToken = request != null ? request.get("token") : null;
        }
        return ResponseEntity.ok(authService.refresh(refreshToken));
    }

    @PostMapping("/logout")
    @Operation(summary = "Encerra a sessão", description = "Invalida a sessão do usuário.")
    public ResponseEntity<Void> logout() {
        return ResponseEntity.noContent().build();
    }
}
