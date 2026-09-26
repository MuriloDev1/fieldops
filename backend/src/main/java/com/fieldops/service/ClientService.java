package com.fieldops.service;

import com.fieldops.common.exception.ResourceNotFoundException;
import com.fieldops.domain.entity.Client;
import com.fieldops.domain.enums.ClientStatus;
import com.fieldops.dto.client.ClientResponseDTO;
import com.fieldops.dto.client.CreateClientDTO;
import com.fieldops.repository.ClientRepository;
import com.fieldops.repository.InspectionSiteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ClientService {

    private final ClientRepository clientRepository;
    private final InspectionSiteRepository siteRepository;

    @Transactional(readOnly = true)
    public List<ClientResponseDTO> listAll() {
        return clientRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(client -> {
                    long count = siteRepository.countByClientId(client.getId());
                    return ClientResponseDTO.fromEntity(client, count);
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public ClientResponseDTO getById(UUID id) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CLIENT_NOT_FOUND", "Cliente não encontrado"));
        long count = siteRepository.countByClientId(client.getId());
        return ClientResponseDTO.fromEntity(client, count);
    }

    @Transactional
    public ClientResponseDTO create(CreateClientDTO dto) {
        Client client = Client.builder()
                .name(dto.getName())
                .legalName(dto.getLegalName())
                .document(dto.getEffectiveDocument())
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .status(ClientStatus.ACTIVE)
                .build();

        Client saved = clientRepository.save(client);
        return ClientResponseDTO.fromEntity(saved, 0);
    }

    @Transactional
    public ClientResponseDTO updateStatus(UUID id, ClientStatus status) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CLIENT_NOT_FOUND", "Cliente não encontrado"));
        client.setStatus(status);
        Client updated = clientRepository.save(client);
        long count = siteRepository.countByClientId(updated.getId());
        return ClientResponseDTO.fromEntity(updated, count);
    }
}
