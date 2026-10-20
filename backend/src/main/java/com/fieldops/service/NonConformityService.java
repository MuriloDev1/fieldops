package com.fieldops.service;

import com.fieldops.common.exception.ResourceNotFoundException;
import com.fieldops.domain.entity.Inspection;
import com.fieldops.domain.entity.InspectionItemSnapshot;
import com.fieldops.domain.entity.NonConformity;
import com.fieldops.domain.entity.User;
import com.fieldops.domain.enums.NonConformitySeverity;
import com.fieldops.domain.enums.NonConformityStatus;
import com.fieldops.dto.nc.CreateNonConformityDTO;
import com.fieldops.dto.nc.NonConformityResponseDTO;
import com.fieldops.repository.InspectionItemSnapshotRepository;
import com.fieldops.repository.InspectionRepository;
import com.fieldops.repository.NonConformityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NonConformityService {

    private final NonConformityRepository nonConformityRepository;
    private final InspectionRepository inspectionRepository;
    private final InspectionItemSnapshotRepository snapshotRepository;

    @Transactional(readOnly = true)
    public List<NonConformityResponseDTO> listAll() {
        return nonConformityRepository.findAll().stream()
                .map(NonConformityResponseDTO::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<NonConformityResponseDTO> listByInspection(UUID inspectionId) {
        return nonConformityRepository.findByInspectionIdOrderByCreatedAtDesc(inspectionId).stream()
                .map(NonConformityResponseDTO::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public NonConformityResponseDTO getById(UUID id) {
        NonConformity nc = nonConformityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("NC_NOT_FOUND", "Não conformidade não encontrada."));
        return NonConformityResponseDTO.fromEntity(nc);
    }

    @Transactional
    public NonConformityResponseDTO create(UUID inspectionId, CreateNonConformityDTO dto, User user) {
        Inspection inspection = inspectionRepository.findById(inspectionId)
                .orElseThrow(() -> new ResourceNotFoundException("INSPECTION_NOT_FOUND", "Inspeção não encontrada."));

        InspectionItemSnapshot item = null;
        if (dto.getInspectionItemId() != null) {
            item = snapshotRepository.findById(dto.getInspectionItemId()).orElse(null);
        }

        NonConformitySeverity severity = NonConformitySeverity.MEDIUM;
        if (dto.getSeverity() != null) {
            try {
                severity = NonConformitySeverity.valueOf(dto.getSeverity().toUpperCase());
            } catch (Exception ignored) {
            }
        }

        NonConformity nc = NonConformity.builder()
                .inspection(inspection)
                .inspectionItem(item)
                .title(dto.getTitle())
                .description(dto.getDescription())
                .severity(severity)
                .status(NonConformityStatus.OPEN)
                .createdBy(user)
                .serverReceivedAt(OffsetDateTime.now())
                .build();

        NonConformity saved = nonConformityRepository.save(nc);
        return NonConformityResponseDTO.fromEntity(saved);
    }

    @Transactional
    public NonConformityResponseDTO updateStatus(UUID id, NonConformityStatus status) {
        NonConformity nc = nonConformityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("NC_NOT_FOUND", "Não conformidade não encontrada."));
        nc.setStatus(status);
        return NonConformityResponseDTO.fromEntity(nonConformityRepository.save(nc));
    }
}
