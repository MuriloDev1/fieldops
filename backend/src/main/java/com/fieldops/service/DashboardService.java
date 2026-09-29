package com.fieldops.service;

import com.fieldops.domain.enums.EquipmentStatus;
import com.fieldops.domain.enums.InspectionStatus;
import com.fieldops.domain.enums.NonConformitySeverity;
import com.fieldops.domain.enums.NonConformityStatus;
import com.fieldops.dto.dashboard.DashboardSummaryDTO;
import com.fieldops.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ClientRepository clientRepository;
    private final InspectionSiteRepository siteRepository;
    private final EquipmentRepository equipmentRepository;
    private final InspectionRepository inspectionRepository;
    private final NonConformityRepository nonConformityRepository;

    @Transactional(readOnly = true)
    public DashboardSummaryDTO getSummary() {
        long totalClients = clientRepository.count();
        long totalSites = siteRepository.count();
        long totalEquipment = equipmentRepository.count();
        long totalInspections = inspectionRepository.count();

        long completed = inspectionRepository.countByStatus(InspectionStatus.APPROVED)
                + inspectionRepository.countByStatus(InspectionStatus.SUBMITTED);
        long pending = totalInspections - completed;
        long openNc = nonConformityRepository.countByStatus(NonConformityStatus.OPEN);
        long criticalEq = equipmentRepository.findByStatus(EquipmentStatus.CRITICAL).size()
                + equipmentRepository.findByStatus(EquipmentStatus.ALTA).size();

        Map<String, Long> byStatus = new HashMap<>();
        for (InspectionStatus s : InspectionStatus.values()) {
            long count = inspectionRepository.countByStatus(s);
            if (count > 0) {
                byStatus.put(s.name(), count);
            }
        }

        Map<String, Long> bySeverity = new HashMap<>();
        for (NonConformitySeverity sev : NonConformitySeverity.values()) {
            long count = nonConformityRepository.countBySeverity(sev);
            if (count > 0) {
                bySeverity.put(sev.name(), count);
            }
        }

        return DashboardSummaryDTO.builder()
                .totalClients(totalClients)
                .totalSites(totalSites)
                .totalEquipment(totalEquipment)
                .totalInspections(totalInspections)
                .inspectionsCompleted(completed)
                .inspectionsPending(pending)
                .openNonConformities(openNc)
                .criticalEquipments(criticalEq)
                .inspectionsByStatus(byStatus)
                .nonConformitiesBySeverity(bySeverity)
                .build();
    }
}
