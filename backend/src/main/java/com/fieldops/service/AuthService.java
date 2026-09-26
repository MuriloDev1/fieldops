package com.fieldops.service;

import com.fieldops.common.exception.BusinessException;
import com.fieldops.common.exception.ResourceNotFoundException;
import com.fieldops.domain.entity.User;
import com.fieldops.domain.enums.UserStatus;
import com.fieldops.dto.auth.AuthResponseDTO;
import com.fieldops.dto.auth.LoginRequestDTO;
import com.fieldops.dto.auth.UserResponseDTO;
import com.fieldops.repository.UserRepository;
import com.fieldops.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    @Transactional(readOnly = true)
    public AuthResponseDTO login(LoginRequestDTO request) {
        User user = userRepository.findByEmail(request.getEmail().toLowerCase().trim())
                .orElseThrow(() -> new BadCredentialsException("Credenciais inválidas"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Credenciais inválidas");
        }

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new BusinessException("USER_NOT_ACTIVE", "O usuário está inativo ou bloqueado.");
        }

        String token = tokenProvider.generateToken(user);

        return AuthResponseDTO.builder()
                .accessToken(token)
                .refreshToken(token)
                .expiresIn(86400) // 24h
                .user(UserResponseDTO.fromEntity(user))
                .build();
    }

    @Transactional(readOnly = true)
    public UserResponseDTO getMe(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("USER_NOT_FOUND", "Usuário não encontrado."));
        return UserResponseDTO.fromEntity(user);
    }
}
