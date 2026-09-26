package com.fieldops.service;

import com.fieldops.common.exception.ConflictException;
import com.fieldops.common.exception.ResourceNotFoundException;
import com.fieldops.domain.entity.Equipment;
import com.fieldops.domain.entity.InspectionSite;
import com.fieldops.domain.enums.EquipmentStatus;
import com.fieldops.dto.equipment.CreateEquipmentDTO;
import com.fieldops.dto.equipment.EquipmentResponseDTO;
import com.fieldops.repository.EquipmentRepository;
import com.fieldops.repository.InspectionSiteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EquipmentService {

    private final EquipmentRepository equipmentRepository;
    private final InspectionSiteRepository siteRepository;

    @Transactional(readOnly = true)
    public List<EquipmentResponseDTO> listAll() {
        return equipmentRepository.findAllWithSiteAndClient().stream()
                .map(EquipmentResponseDTO::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<EquipmentResponseDTO> listBySite(UUID siteId) {
        return equipmentRepository.findBySiteId(siteId).stream()
                .map(EquipmentResponseDTO::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<EquipmentResponseDTO> listByClient(UUID clientId) {
        return equipmentRepository.findByClientId(clientId).stream()
                .map(EquipmentResponseDTO::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public EquipmentResponseDTO getById(UUID id) {
        Equipment equipment = equipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("EQUIPMENT_NOT_FOUND", "Equipamento não encontrado"));
        return EquipmentResponseDTO.fromEntity(equipment);
    }

    @Transactional(readOnly = true)
    public EquipmentResponseDTO getByQrCode(String qrCode) {
        Equipment equipment = equipmentRepository.findByQrCode(qrCode)
                .orElseThrow(() -> new ResourceNotFoundException("EQUIPMENT_NOT_FOUND", "Nenhum equipamento cadastrado com o QR Code: " + qrCode));
        return EquipmentResponseDTO.fromEntity(equipment);
    }

    @Transactional
    public EquipmentResponseDTO create(CreateEquipmentDTO dto) {
        UUID siteId = dto.getEffectiveSiteId();
        if (siteId == null) {
            throw new IllegalArgumentException("O local/planta de vinculação é obrigatório");
        }

        InspectionSite site = siteRepository.findById(siteId)
                .orElseThrow(() -> new ResourceNotFoundException("SITE_NOT_FOUND", "Local de instalação não encontrado"));

        String qrCode = dto.getEffectiveQrCode();
        if (qrCode != null && !qrCode.isBlank() && equipmentRepository.existsByQrCode(qrCode)) {
            throw new ConflictException("QR_CODE_EXISTS", "Já existe um equipamento cadastrado com este QR Code.");
        }

        EquipmentStatus status = EquipmentStatus.ACTIVE;
        if (dto.getStatus() != null) {
            try {
                status = EquipmentStatus.valueOf(dto.getStatus().toUpperCase());
            } catch (Exception ignored) {
                // Mantém ACTIVE se for status não reconhecido
            }
        }

        Equipment equipment = Equipment.builder()
                .site(site)
                .name(dto.getName())
                .type(dto.getType())
                .assetNumber(dto.getAssetNumber())
                .serialNumber(dto.getSerialNumber())
                .manufacturer(dto.getManufacturer())
                .model(dto.getModel())
                .description(dto.getDescription())
                .qrCode(qrCode)
                .status(status)
                .installedAt(LocalDate.now())
                .build();

        Equipment saved = equipmentRepository.save(equipment);
        return EquipmentResponseDTO.fromEntity(saved);
    }

    @Transactional
    public EquipmentResponseDTO updateStatus(UUID id, EquipmentStatus status) {
        Equipment equipment = equipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("EQUIPMENT_NOT_FOUND", "Equipamento não encontrado"));
        equipment.setStatus(status);
        Equipment updated = equipmentRepository.save(equipment);
        return EquipmentResponseDTO.fromEntity(updated);
    }
}
