package com.fieldops.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummaryDTO {

    private long totalClients;
    private long totalSites;
    private long activeSites;
    private long totalEquipment;
    private long totalEquipments;
    private long totalInspections;
    private long inspectionsCompleted;
    private long completedInspections;
    private long inspectionsPending;
    private long scheduledInspections;
    private long inProgressInspections;
    private long overdueInspections;
    private long openNonConformities;
    private long criticalEquipments;
    private long activeTechnicians;
    private double conformanceRate;
    private double nonConformanceRate;

    @Builder.Default
    private List<WeeklyProgressItem> weeklyProgress = new ArrayList<>();

    @Builder.Default
    private Map<String, Long> inspectionsByStatus = new HashMap<>();

    @Builder.Default
    private Map<String, Long> nonConformitiesBySeverity = new HashMap<>();

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WeeklyProgressItem {
        private String day;
        private int completed;
        private int total;
    }
}
