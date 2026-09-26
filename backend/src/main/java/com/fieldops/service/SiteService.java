package com.fieldops.service;

import com.fieldops.common.exception.ResourceNotFoundException;
import com.fieldops.domain.entity.Client;
import com.fieldops.domain.entity.InspectionSite;
import com.fieldops.domain.enums.SiteStatus;
import com.fieldops.dto.site.CreateSiteDTO;
import com.fieldops.dto.site.SiteResponseDTO;
import com.fieldops.repository.ClientRepository;
import com.fieldops.repository.EquipmentRepository;
import com.fieldops.repository.InspectionSiteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SiteService {

    private final InspectionSiteRepository siteRepository;
    private final ClientRepository clientRepository;
    private final EquipmentRepository equipmentRepository;

    @Transactional(readOnly = true)
    public List<SiteResponseDTO> listAll() {
        return siteRepository.findAllWithClient().stream()
                .map(site -> {
                    long count = equipmentRepository.countBySiteId(site.getId());
                    return SiteResponseDTO.fromEntity(site, count);
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public List<SiteResponseDTO> listByClient(UUID clientId) {
        return siteRepository.findByClientId(clientId).stream()
                .map(site -> {
                    long count = equipmentRepository.countBySiteId(site.getId());
                    return SiteResponseDTO.fromEntity(site, count);
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public SiteResponseDTO getById(UUID id) {
        InspectionSite site = siteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SITE_NOT_FOUND", "Local de inspeção não encontrado"));
        long count = equipmentRepository.countBySiteId(site.getId());
        return SiteResponseDTO.fromEntity(site, count);
    }

    @Transactional
    public SiteResponseDTO create(CreateSiteDTO dto) {
        UUID clientId = dto.getEffectiveClientId();
        if (clientId == null) {
            throw new IllegalArgumentException("O cliente vinculado é obrigatório");
        }

        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new ResourceNotFoundException("CLIENT_NOT_FOUND", "Cliente não encontrado"));

        InspectionSite site = InspectionSite.builder()
                .client(client)
                .name(dto.getName())
                .description(dto.getDescription())
                .addressLine(dto.getEffectiveAddress())
                .city(dto.getCity())
                .state(dto.getState())
                .postalCode(dto.getPostalCode())
                .contactName(dto.getEffectiveContactName())
                .contactPhone(dto.getContactPhone())
                .status(SiteStatus.ACTIVE)
                .build();

        InspectionSite saved = siteRepository.save(site);
        return SiteResponseDTO.fromEntity(saved, 0);
    }

    @Transactional
    public SiteResponseDTO updateStatus(UUID id, SiteStatus status) {
        InspectionSite site = siteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SITE_NOT_FOUND", "Local não encontrado"));
        site.setStatus(status);
        InspectionSite updated = siteRepository.save(site);
        long count = equipmentRepository.countBySiteId(updated.getId());
        return SiteResponseDTO.fromEntity(updated, count);
    }
}
