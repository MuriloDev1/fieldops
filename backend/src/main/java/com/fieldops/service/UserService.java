package com.fieldops.service;

import com.fieldops.common.exception.ResourceNotFoundException;
import com.fieldops.domain.entity.User;
import com.fieldops.domain.enums.UserStatus;
import com.fieldops.dto.auth.UserResponseDTO;
import com.fieldops.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

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
    public UserResponseDTO updateStatus(UUID id, UserStatus status) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("USER_NOT_FOUND", "Usuário não encontrado"));
        user.setStatus(status);
        return UserResponseDTO.fromEntity(userRepository.save(user));
    }
}
