package com.fieldops.service;

import com.fieldops.common.exception.ConflictException;
import com.fieldops.common.exception.ResourceNotFoundException;
import com.fieldops.domain.entity.User;
import com.fieldops.domain.enums.UserRole;
import com.fieldops.domain.enums.UserStatus;
import com.fieldops.dto.auth.CreateUserDTO;
import com.fieldops.dto.auth.UserResponseDTO;
import com.fieldops.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<UserResponseDTO> listAll() {
        return userRepository.findAll().stream()
                .map(UserResponseDTO::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public UserResponseDTO getById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("USER_NOT_FOUND", "Usuário não encontrado"));
        return UserResponseDTO.fromEntity(user);
    }

    @Transactional
    public UserResponseDTO create(CreateUserDTO dto) {
        if (userRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new ConflictException("EMAIL_ALREADY_EXISTS", "Já existe um usuário com este e-mail");
        }

        UserRole role = UserRole.TECHNICIAN;
        if (dto.getRole() != null) {
            try {
                role = UserRole.valueOf(dto.getRole().toUpperCase());
            } catch (Exception ignored) {
            }
        }

        User user = User.builder()
                .name(dto.getName())
                .email(dto.getEmail())
                .passwordHash(passwordEncoder.encode(dto.getPassword()))
                .role(role)
                .status(UserStatus.ACTIVE)
                .phone(dto.getPhone())
                .version(1)
                .build();

        return UserResponseDTO.fromEntity(userRepository.save(user));
    }

    @Transactional
    public UserResponseDTO updateStatus(UUID id, UserStatus status) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("USER_NOT_FOUND", "Usuário não encontrado"));
        user.setStatus(status);
        return UserResponseDTO.fromEntity(userRepository.save(user));
    }
}
