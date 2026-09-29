package com.fieldops.dto.review;

import com.fieldops.domain.entity.InspectionReview;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponseDTO {

    private UUID id;
    private UUID inspectionId;
    private UUID reviewerId;
    private String reviewerName;
    private String decision;
    private String reason;
    private String comments;
    private OffsetDateTime reviewedAt;
    private int reviewCycle;

    public static ReviewResponseDTO fromEntity(InspectionReview r) {
        return ReviewResponseDTO.builder()
                .id(r.getId())
                .inspectionId(r.getInspection().getId())
                .reviewerId(r.getReviewer().getId())
                .reviewerName(r.getReviewer().getName())
                .decision(r.getDecision().name())
                .reason(r.getReason())
                .comments(r.getComments())
                .reviewedAt(r.getReviewedAt())
                .reviewCycle(r.getReviewCycle())
                .build();
    }
}
