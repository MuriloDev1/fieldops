package com.fieldops.service;

import com.fieldops.common.exception.BusinessException;
import com.fieldops.common.exception.ConflictException;
import com.fieldops.common.exception.ResourceNotFoundException;
import com.fieldops.domain.entity.Client;
import com.fieldops.domain.entity.Equipment;
import com.fieldops.domain.entity.InspectionSite;
import com.fieldops.domain.enums.ClientStatus;
import com.fieldops.domain.enums.EquipmentStatus;
import com.fieldops.domain.enums.SiteStatus;
import com.fieldops.dto.equipment.CreateEquipmentDTO;
import com.fieldops.dto.equipment.EquipmentResponseDTO;
import com.fieldops.repository.ClientRepository;
import com.fieldops.repository.EquipmentRepository;
import com.fieldops.repository.InspectionSiteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EquipmentService {

    private final EquipmentRepository equipmentRepository;
    private final InspectionSiteRepository siteRepository;
    private final ClientRepository clientRepository;

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
        InspectionSite site = resolveSite(dto.getEffectiveSiteId(), dto.getLocation());

        String qrCode = dto.getEffectiveQrCode();
        if (qrCode != null && !qrCode.isBlank() && equipmentRepository.existsByQrCode(qrCode)) {
            throw new ConflictException("QR_CODE_EXISTS", "Já existe um equipamento cadastrado com este QR Code.");
        }

        EquipmentStatus status = parseStatus(dto.getStatus(), EquipmentStatus.ACTIVE);

        Equipment equipment = Equipment.builder()
                .site(site)
                .name(dto.getName())
                .type(dto.getType() != null ? dto.getType() : "Equipamento Industrial")
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

    @Transactional
    public EquipmentResponseDTO updatePartial(UUID id, Map<String, Object> body) {
        Equipment equipment = equipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("EQUIPMENT_NOT_FOUND", "Equipamento não encontrado"));

        if (body.containsKey("name") && body.get("name") != null) {
            String name = String.valueOf(body.get("name")).trim();
            if (!name.isEmpty()) {
                equipment.setName(name);
            }
        }

        String newCode = null;
        if (body.get("code") != null) newCode = String.valueOf(body.get("code")).trim();
        else if (body.get("qrCode") != null) newCode = String.valueOf(body.get("qrCode")).trim();
        else if (body.get("qrCodeId") != null) newCode = String.valueOf(body.get("qrCodeId")).trim();

        if (newCode != null && !newCode.isEmpty() && !newCode.equals(equipment.getQrCode())) {
            if (equipmentRepository.existsByQrCode(newCode)) {
                throw new ConflictException("QR_CODE_EXISTS", "Já existe um equipamento cadastrado com este código.");
            }
            equipment.setQrCode(newCode);
        }

        if (body.containsKey("description")) {
            Object desc = body.get("description");
            equipment.setDescription(desc != null ? String.valueOf(desc) : null);
        }

        if (body.containsKey("type") && body.get("type") != null) {
            equipment.setType(String.valueOf(body.get("type")));
        }

        if (body.containsKey("serialNumber") && body.get("serialNumber") != null) {
            equipment.setSerialNumber(String.valueOf(body.get("serialNumber")));
        }

        if (body.containsKey("location") && body.get("location") != null) {
            String locName = String.valueOf(body.get("location")).trim();
            if (!locName.isEmpty()) {
                equipment.setSite(resolveSite(null, locName));
            }
        }

        if (body.containsKey("status") && body.get("status") != null) {
            equipment.setStatus(parseStatus(String.valueOf(body.get("status")), equipment.getStatus()));
        }

        Equipment updated = equipmentRepository.save(equipment);
        return EquipmentResponseDTO.fromEntity(updated);
    }

    public EquipmentStatus parseStatus(String raw, EquipmentStatus fallback) {
        if (raw == null || raw.isBlank()) {
            return fallback;
        }
        String normalized = raw.trim().toUpperCase();
        return switch (normalized) {
            case "ACTIVE", "ATIVO" -> EquipmentStatus.ACTIVE;
            case "MAINTENANCE", "MANUTENÇÃO", "MANUTENCAO" -> EquipmentStatus.MAINTENANCE;
            case "INACTIVE", "INATIVO" -> EquipmentStatus.INACTIVE;
            case "DECOMMISSIONED", "DESATIVADO" -> EquipmentStatus.DECOMMISSIONED;
            case "OK" -> EquipmentStatus.OK;
            case "ALTA", "HIGH" -> EquipmentStatus.HIGH;
            case "CRÍTICO", "CRITICO", "CRITICAL" -> EquipmentStatus.CRITICAL;
            case "BAIXA", "LOW" -> EquipmentStatus.LOW;
            default -> {
                try {
                    yield EquipmentStatus.valueOf(normalized);
                } catch (Exception e) {
                    yield fallback;
                }
            }
        };
    }

    private InspectionSite resolveSite(UUID siteId, String locationName) {
        if (siteId != null) {
            return siteRepository.findById(siteId)
                    .orElseThrow(() -> new ResourceNotFoundException("SITE_NOT_FOUND", "Local de instalação não encontrado"));
        }
        if (locationName != null && !locationName.isBlank()) {
            String trimmed = locationName.trim();
            List<InspectionSite> existingSites = siteRepository.findAllWithClient();
            for (InspectionSite s : existingSites) {
                if (s.getName() != null && s.getName().equalsIgnoreCase(trimmed)) {
                    return s;
                }
            }
            Client defaultClient = clientRepository.findAll().stream().findFirst()
                    .orElseGet(() -> clientRepository.save(Client.builder()
                            .name("Unidade Industrial Padrão")
                            .legalName("Operações Industriais S.A.")
                            .document("00.000.000/0001-00")
                            .status(ClientStatus.ACTIVE)
                            .build()));
            return siteRepository.save(InspectionSite.builder()
                    .client(defaultClient)
                    .name(trimmed)
                    .description("Setor operacional: " + trimmed)
                    .city("São Paulo")
                    .state("SP")
                    .status(SiteStatus.ACTIVE)
                    .build());
        }
        return siteRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new BusinessException("SITE_REQUIRED", "O local/planta de vinculação é obrigatório"));
    }
}
