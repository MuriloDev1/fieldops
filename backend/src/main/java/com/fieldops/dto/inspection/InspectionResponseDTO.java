package com.fieldops.dto.inspection;

import com.fieldops.domain.entity.Inspection;
import com.fieldops.domain.entity.InspectionItemSnapshot;
import com.fieldops.domain.entity.InspectionResponse;
import com.fieldops.domain.entity.InspectionReview;
import com.fieldops.domain.enums.ConformityStatus;
import com.fieldops.domain.enums.InspectionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InspectionResponseDTO {

    private UUID id;
    private String title;
    private String templateTitle;
    private String templateVersionTitle;
    private String instructions;
    private String notes;
    private String description;
    private String priority;
    private String status;
    private UUID clientId;
    private String clientName;
    private UUID siteId;
    private String siteName;
    private UUID equipmentId;
    private String equipmentName;
    private String equipmentQrCode;
    private UUID technicianId;
    private String technicianName;
    private UUID supervisorId;
    private String supervisorName;
    private OffsetDateTime scheduledFor;
    private String scheduledDate;
    private OffsetDateTime startedAtServer;
    private OffsetDateTime submittedAtServer;
    private OffsetDateTime approvedAt;
    private OffsetDateTime canceledAt;
    private String canceledReason;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    private int itemsCount;
    private int answeredCount;
    private int nonConformityCount;
    private int nonConformitiesCount;
    private double conformanceRate;

    // Mobile (Gizella) nested fields
    private MobileEquipmentSummary equipment;
    private MobileUserSummary responsible;
    private String reviewStatus;
    private MobileUserSummary reviewer;
    private String reviewObservation;
    private OffsetDateTime reviewedAt;

    @Builder.Default
    private List<InspectionItemSnapshotDTO> items = new ArrayList<>();
    @Builder.Default
    private List<InspectionResponseItemDTO> responses = new ArrayList<>();
    @Builder.Default
    private List<InspectionItemSnapshotDTO> questions = new ArrayList<>();
    @Builder.Default
    private List<MobileAnswerDTO> answers = new ArrayList<>();

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MobileEquipmentSummary {
        private UUID id;
        private String name;
        private String code;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MobileUserSummary {
        private UUID id;
        private String name;
        private String email;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MobileAnswerDTO {
        private UUID id;
        private UUID questionId;
        private String value;
        private String observation;
        private String photoUrl;
        private String signatureUrl;
        private MobileQuestionSummary question;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MobileQuestionSummary {
        private UUID id;
        private String title;
        private String type;
    }

    public static InspectionResponseDTO fromEntity(Inspection i) {
        return fromEntity(i, null);
    }

    public static InspectionResponseDTO fromEntity(Inspection i, InspectionReview latestReview) {
        String clientName = i.getClient() != null ? i.getClient().getName() : "";
        String siteName = i.getSite() != null ? i.getSite().getName() : "";
        String eqName = i.getEquipment() != null ? i.getEquipment().getName() : null;
        String eqQr = i.getEquipment() != null ? i.getEquipment().getQrCode() : null;
        UUID eqId = i.getEquipment() != null ? i.getEquipment().getId() : null;
        String techName = i.getTechnician() != null ? i.getTechnician().getName() : "";
        String superName = i.getSupervisor() != null ? i.getSupervisor().getName() : "";

        String tmplTitle = i.getTitle();
        try {
            if (i.getTemplateVersion() != null && i.getTemplateVersion().getTitleSnapshot() != null) {
                tmplTitle = i.getTemplateVersion().getTitleSnapshot();
            }
        } catch (Exception ignored) {
        }

        Set<UUID> answeredItemIds = i.getResponses() != null
                ? i.getResponses().stream()
                    .filter(r -> r.getInspectionItem() != null)
                    .map(r -> r.getInspectionItem().getId())
                    .collect(Collectors.toSet())
                : Collections.emptySet();

        List<InspectionItemSnapshotDTO> itemDTOs = i.getSnapshots() != null
                ? i.getSnapshots().stream()
                    .map(s -> InspectionItemSnapshotDTO.fromEntity(s, answeredItemIds.contains(s.getId())))
                    .toList()
                : new ArrayList<>();

        List<InspectionResponseItemDTO> respDTOs = i.getResponses() != null
                ? i.getResponses().stream().map(InspectionResponseItemDTO::fromEntity).toList()
                : new ArrayList<>();

        List<MobileAnswerDTO> mobileAnswers = new ArrayList<>();
        int ncCount = 0;
        int conformingCount = 0;

        if (i.getResponses() != null) {
            for (InspectionResponse r : i.getResponses()) {
                if (r.getConformity() == ConformityStatus.NON_CONFORMING) {
                    ncCount++;
                } else {
                    conformingCount++;
                }

                InspectionItemSnapshot snap = r.getInspectionItem();
                String val = r.getValueText();
                if (val == null || val.isBlank()) {
                    if (r.getConformity() == ConformityStatus.CONFORMING || Boolean.TRUE.equals(r.getValueBoolean())) {
                        val = "Sim";
                    } else if (r.getConformity() == ConformityStatus.NON_CONFORMING || Boolean.FALSE.equals(r.getValueBoolean())) {
                        val = "Não";
                    } else if (r.getValueNumber() != null) {
                        val = r.getValueNumber().toPlainString();
                    } else {
                        val = "Conforme";
                    }
                }

                String photoUrl = extractJsonField(r.getValueJson(), "photoUrl");
                String signatureUrl = extractJsonField(r.getValueJson(), "signatureUrl");

                mobileAnswers.add(MobileAnswerDTO.builder()
                        .id(r.getId())
                        .questionId(snap != null ? snap.getId() : null)
                        .value(val)
                        .observation(r.getObservation())
                        .photoUrl(photoUrl)
                        .signatureUrl(signatureUrl)
                        .question(snap != null ? MobileQuestionSummary.builder()
                                .id(snap.getId())
                                .title(snap.getItemTitle())
                                .type(InspectionItemSnapshotDTO.mapMobileQuestionType(
                                        snap.getResponseType() != null ? snap.getResponseType().name() : null))
                                .build() : null)
                        .build());
            }
        }

        int itemsCount = itemDTOs.size();
        int answeredCount = respDTOs.size();
        double confRate = answeredCount > 0 ? Math.round((conformingCount * 1000.0) / answeredCount) / 10.0 : 100.0;

        String scheduledDateStr = i.getScheduledFor() != null
                ? i.getScheduledFor().toLocalDate().toString()
                : (i.getCreatedAt() != null ? i.getCreatedAt().toLocalDate().toString() : "");

        String revStatus = "PENDENTE";
        if (i.getStatus() == InspectionStatus.APPROVED) {
            revStatus = "APPROVED";
        } else if (i.getStatus() == InspectionStatus.REJECTED) {
            revStatus = "REJECTED";
        }

        MobileUserSummary reviewerSummary = null;
        String reviewObs = null;
        OffsetDateTime revAt = i.getApprovedAt();

        if (latestReview != null) {
            if (latestReview.getReviewer() != null) {
                reviewerSummary = MobileUserSummary.builder()
                        .id(latestReview.getReviewer().getId())
                        .name(latestReview.getReviewer().getName())
                        .email(latestReview.getReviewer().getEmail())
                        .build();
            }
            reviewObs = latestReview.getReason() != null && !latestReview.getReason().isBlank()
                    ? latestReview.getReason()
                    : latestReview.getComments();
            revAt = latestReview.getReviewedAt();
        } else if ((i.getStatus() == InspectionStatus.APPROVED || i.getStatus() == InspectionStatus.REJECTED) && i.getSupervisor() != null) {
            reviewerSummary = MobileUserSummary.builder()
                    .id(i.getSupervisor().getId())
                    .name(i.getSupervisor().getName())
                    .email(i.getSupervisor().getEmail())
                    .build();
        }

        return InspectionResponseDTO.builder()
                .id(i.getId())
                .title(i.getTitle())
                .templateTitle(tmplTitle)
                .templateVersionTitle(tmplTitle)
                .instructions(i.getInstructions())
                .notes(i.getInstructions())
                .description(i.getInstructions())
                .priority(i.getPriority() != null ? i.getPriority().name() : "MEDIUM")
                .status(i.getStatus().name())
                .clientId(i.getClient() != null ? i.getClient().getId() : null)
                .clientName(clientName)
                .siteId(i.getSite() != null ? i.getSite().getId() : null)
                .siteName(siteName)
                .equipmentId(eqId)
                .equipmentName(eqName)
                .equipmentQrCode(eqQr)
                .technicianId(i.getTechnician() != null ? i.getTechnician().getId() : null)
                .technicianName(techName)
                .supervisorId(i.getSupervisor() != null ? i.getSupervisor().getId() : null)
                .supervisorName(superName)
                .scheduledFor(i.getScheduledFor())
                .scheduledDate(scheduledDateStr)
                .startedAtServer(i.getStartedAtServer())
                .submittedAtServer(i.getSubmittedAtServer())
                .approvedAt(i.getApprovedAt())
                .canceledAt(i.getCanceledAt())
                .canceledReason(i.getCanceledReason())
                .createdAt(i.getCreatedAt())
                .updatedAt(i.getUpdatedAt())
                .itemsCount(itemsCount)
                .answeredCount(answeredCount)
                .nonConformityCount(ncCount)
                .nonConformitiesCount(ncCount)
                .conformanceRate(confRate)
                .equipment(i.getEquipment() != null ? MobileEquipmentSummary.builder()
                        .id(eqId)
                        .name(eqName)
                        .code(eqQr)
                        .build() : null)
                .responsible(i.getTechnician() != null ? MobileUserSummary.builder()
                        .id(i.getTechnician().getId())
                        .name(techName)
                        .email(i.getTechnician().getEmail())
                        .build() : null)
                .reviewStatus(revStatus)
                .reviewer(reviewerSummary)
                .reviewObservation(reviewObs)
                .reviewedAt(revAt)
                .items(itemDTOs)
                .responses(respDTOs)
                .questions(itemDTOs)
                .answers(mobileAnswers)
                .build();
    }

    private static final com.fasterxml.jackson.databind.ObjectMapper OBJECT_MAPPER = new com.fasterxml.jackson.databind.ObjectMapper();

    private static String extractJsonField(String json, String fieldName) {
        if (json == null || json.isBlank()) return null;
        try {
            com.fasterxml.jackson.databind.JsonNode node = OBJECT_MAPPER.readTree(json);
            if (node.hasNonNull(fieldName)) {
                String val = node.get(fieldName).asText();
                return val.isEmpty() ? null : val;
            }
        } catch (Exception ignored) {
        }
        if (json == null || json.isBlank()) return null;
        Pattern p = Pattern.compile("\"" + Pattern.quote(fieldName) + "\"\\s*:\\s*\"([^\"]*)\"");
        Matcher m = p.matcher(json);
        if (m.find()) {
            String val = m.group(1);
            return val.isEmpty() ? null : val;
        }
        return null;
    }
}
