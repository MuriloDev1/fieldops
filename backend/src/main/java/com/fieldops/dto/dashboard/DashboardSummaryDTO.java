package com.fieldops.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashMap;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummaryDTO {

    private long totalClients;
    private long totalSites;
    private long totalEquipment;
    private long totalInspections;
    private long inspectionsCompleted;
    private long inspectionsPending;
    private long openNonConformities;
    private long criticalEquipments;

    @Builder.Default
    private Map<String, Long> inspectionsByStatus = new HashMap<>();

    @Builder.Default
    private Map<String, Long> nonConformitiesBySeverity = new HashMap<>();
}
