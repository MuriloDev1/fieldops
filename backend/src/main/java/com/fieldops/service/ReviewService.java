package com.fieldops.service;

import com.fieldops.common.exception.BusinessException;
import com.fieldops.common.exception.ResourceNotFoundException;
import com.fieldops.domain.entity.AuditEvent;
import com.fieldops.domain.entity.Inspection;
import com.fieldops.domain.entity.InspectionReview;
import com.fieldops.domain.entity.User;
import com.fieldops.domain.enums.InspectionStatus;
import com.fieldops.domain.enums.ReviewDecision;
import com.fieldops.dto.inspection.InspectionResponseDTO;
import com.fieldops.dto.review.ReviewDecisionRequestDTO;
import com.fieldops.dto.review.ReviewResponseDTO;
import com.fieldops.repository.AuditEventRepository;
import com.fieldops.repository.InspectionRepository;
import com.fieldops.repository.InspectionReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final InspectionRepository inspectionRepository;
    private final InspectionReviewRepository reviewRepository;
    private final AuditEventRepository auditEventRepository;

    @Transactional(readOnly = true)
    public List<ReviewResponseDTO> getReviewsByInspection(UUID inspectionId) {
        return reviewRepository.findByInspectionIdOrderByReviewCycleAsc(inspectionId).stream()
                .map(ReviewResponseDTO::fromEntity)
                .toList();
    }

    @Transactional
    public InspectionResponseDTO beginReview(UUID inspectionId, User supervisor) {
        Inspection inspection = inspectionRepository.findById(inspectionId)
                .orElseThrow(() -> new ResourceNotFoundException("INSPECTION_NOT_FOUND", "Inspeção não encontrada."));

        inspection.setStatus(InspectionStatus.UNDER_REVIEW);
        Inspection updated = inspectionRepository.save(inspection);

        recordAudit(updated, supervisor, "REVIEW_STARTED");
        return InspectionResponseDTO.fromEntity(updated);
    }

    @Transactional
    public ReviewResponseDTO approve(UUID inspectionId, ReviewDecisionRequestDTO dto, User supervisor) {
        Inspection inspection = inspectionRepository.findById(inspectionId)
                .orElseThrow(() -> new ResourceNotFoundException("INSPECTION_NOT_FOUND", "Inspeção não encontrada."));

        int cycle = (int) reviewRepository.countByInspectionId(inspectionId) + 1;

        InspectionReview review = InspectionReview.builder()
                .inspection(inspection)
                .reviewer(supervisor)
                .decision(ReviewDecision.APPROVED)
                .reason(dto.getReason())
                .comments(dto.getComments())
                .reviewedAt(OffsetDateTime.now())
                .reviewCycle(cycle)
                .build();

        InspectionReview saved = reviewRepository.save(review);

        inspection.setStatus(InspectionStatus.APPROVED);
        inspection.setApprovedAt(OffsetDateTime.now());
        inspectionRepository.save(inspection);

        recordAudit(inspection, supervisor, "INSPECTION_APPROVED");
        return ReviewResponseDTO.fromEntity(saved);
    }

    @Transactional
    public ReviewResponseDTO reject(UUID inspectionId, ReviewDecisionRequestDTO dto, User supervisor) {
        Inspection inspection = inspectionRepository.findById(inspectionId)
                .orElseThrow(() -> new ResourceNotFoundException("INSPECTION_NOT_FOUND", "Inspeção não encontrada."));

        if (dto.getReason() == null || dto.getReason().isBlank()) {
            throw new BusinessException("REASON_REQUIRED", "O motivo da reprovação é obrigatório (Seção 10.11.1).");
        }

        int cycle = (int) reviewRepository.countByInspectionId(inspectionId) + 1;

        InspectionReview review = InspectionReview.builder()
                .inspection(inspection)
                .reviewer(supervisor)
                .decision(ReviewDecision.REJECTED)
                .reason(dto.getReason())
                .comments(dto.getComments())
                .reviewedAt(OffsetDateTime.now())
                .reviewCycle(cycle)
                .build();

        InspectionReview saved = reviewRepository.save(review);

        inspection.setStatus(InspectionStatus.REJECTED);
        inspectionRepository.save(inspection);

        recordAudit(inspection, supervisor, "INSPECTION_REJECTED");
        return ReviewResponseDTO.fromEntity(saved);
    }

    private void recordAudit(Inspection inspection, User actor, String action) {
        AuditEvent event = AuditEvent.builder()
                .inspection(inspection)
                .actor(actor)
                .action(action)
                .entityType("INSPECTION")
                .entityId(inspection.getId())
                .occurredAt(OffsetDateTime.now())
                .build();
        auditEventRepository.save(event);
    }
}
