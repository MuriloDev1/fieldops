package com.fieldops.service;

import com.fieldops.domain.entity.Inspection;
import com.fieldops.domain.enums.EquipmentStatus;
import com.fieldops.domain.enums.InspectionStatus;
import com.fieldops.domain.enums.NonConformitySeverity;
import com.fieldops.domain.enums.NonConformityStatus;
import com.fieldops.domain.enums.UserRole;
import com.fieldops.dto.dashboard.DashboardSummaryDTO;
import com.fieldops.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ClientRepository clientRepository;
    private final InspectionSiteRepository siteRepository;
    private final EquipmentRepository equipmentRepository;
    private final InspectionRepository inspectionRepository;
    private final NonConformityRepository nonConformityRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public DashboardSummaryDTO getSummary() {
        long totalClients = clientRepository.count();
        long totalSites = siteRepository.count();
        long totalEquipment = equipmentRepository.count();
        List<Inspection> allInspections = inspectionRepository.findAll();
        long totalInspections = allInspections.size();

        long approved = inspectionRepository.countByStatus(InspectionStatus.APPROVED);
        long submitted = inspectionRepository.countByStatus(InspectionStatus.SUBMITTED);
        long completed = approved + submitted;
        long inProgress = inspectionRepository.countByStatus(InspectionStatus.IN_PROGRESS)
                + inspectionRepository.countByStatus(InspectionStatus.UNDER_REVIEW);
        long scheduled = inspectionRepository.countByStatus(InspectionStatus.ASSIGNED)
                + inspectionRepository.countByStatus(InspectionStatus.DRAFT);
        long rejected = inspectionRepository.countByStatus(InspectionStatus.REJECTED);
        long pending = Math.max(0, totalInspections - completed);

        long openNc = nonConformityRepository.countByStatus(NonConformityStatus.OPEN);
        long criticalEq = equipmentRepository.findByStatus(EquipmentStatus.CRITICAL).size()
                + equipmentRepository.findByStatus(EquipmentStatus.CRITICO).size()
                + equipmentRepository.findByStatus(EquipmentStatus.ALTA).size()
                + equipmentRepository.findByStatus(EquipmentStatus.HIGH).size()
                + equipmentRepository.findByStatus(EquipmentStatus.MAINTENANCE).size();

        long activeTechs = userRepository.findByRole(UserRole.TECHNICIAN).size();

        double confRate = 100.0;
        if (totalInspections > 0) {
            confRate = Math.round(((totalInspections - Math.min(openNc, totalInspections)) * 1000.0) / totalInspections) / 10.0;
        }
        double nonConfRate = Math.round((100.0 - confRate) * 10.0) / 10.0;

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

        String[] dayLabels = {"Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"};
        int[] completedByDay = new int[7];
        int[] totalByDay = new int[7];

        for (Inspection insp : allInspections) {
            OffsetDateTime refDate = insp.getScheduledFor() != null ? insp.getScheduledFor() : insp.getCreatedAt();
            if (refDate != null) {
                DayOfWeek dow = refDate.getDayOfWeek();
                int idx = dow.getValue() - 1; // 0 = Seg .. 6 = Dom
                totalByDay[idx]++;
                if (insp.getStatus() == InspectionStatus.APPROVED || insp.getStatus() == InspectionStatus.SUBMITTED) {
                    completedByDay[idx]++;
                }
            }
        }

        List<DashboardSummaryDTO.WeeklyProgressItem> weeklyProgress = new ArrayList<>();
        for (int i = 0; i < 7; i++) {
            weeklyProgress.add(new DashboardSummaryDTO.WeeklyProgressItem(
                    dayLabels[i],
                    completedByDay[i],
                    totalByDay[i]
            ));
        }

        return DashboardSummaryDTO.builder()
                .totalClients(totalClients)
                .totalSites(totalSites)
                .activeSites(totalSites)
                .totalEquipment(totalEquipment)
                .totalEquipments(totalEquipment)
                .totalInspections(totalInspections)
                .inspectionsCompleted(completed)
                .completedInspections(completed)
                .inspectionsPending(pending)
                .scheduledInspections(scheduled)
                .inProgressInspections(inProgress)
                .overdueInspections(rejected > 0 ? rejected : openNc)
                .openNonConformities(openNc)
                .criticalEquipments(criticalEq)
                .activeTechnicians(activeTechs)
                .conformanceRate(confRate)
                .nonConformanceRate(nonConfRate)
                .nonConformityRate(nonConfRate)
                .weeklyProgress(weeklyProgress)
                .inspectionsByStatus(byStatus)
                .nonConformitiesBySeverity(bySeverity)
                .build();
    }
}
