package com.fieldops.service;

import com.fieldops.common.exception.BusinessException;
import com.fieldops.common.exception.ResourceNotFoundException;
import com.fieldops.domain.entity.AuditEvent;
import com.fieldops.domain.entity.Equipment;
import com.fieldops.domain.entity.Inspection;
import com.fieldops.domain.entity.InspectionReview;
import com.fieldops.domain.entity.User;
import com.fieldops.domain.enums.EquipmentStatus;
import com.fieldops.domain.enums.InspectionStatus;
import com.fieldops.domain.enums.ReviewDecision;
import com.fieldops.domain.enums.UserRole;
import com.fieldops.dto.inspection.InspectionResponseDTO;
import com.fieldops.dto.review.ReviewDecisionRequestDTO;
import com.fieldops.dto.review.ReviewResponseDTO;
import com.fieldops.repository.AuditEventRepository;
import com.fieldops.repository.EquipmentRepository;
import com.fieldops.repository.InspectionRepository;
import com.fieldops.repository.InspectionReviewRepository;
import com.fieldops.repository.UserRepository;
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
    private final UserRepository userRepository;
    private final EquipmentRepository equipmentRepository;

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

        User effectiveSupervisor = resolveSupervisor(supervisor, inspection, null);

        inspection.setStatus(InspectionStatus.UNDER_REVIEW);
        Inspection updated = inspectionRepository.save(inspection);

        recordAudit(updated, effectiveSupervisor, "REVIEW_STARTED", "{\"details\":\"Revisão iniciada pelo supervisor\"}");
        return InspectionResponseDTO.fromEntity(updated);
    }

    @Transactional
    public ReviewResponseDTO approve(UUID inspectionId, ReviewDecisionRequestDTO dto, User supervisor) {
        Inspection inspection = inspectionRepository.findById(inspectionId)
                .orElseThrow(() -> new ResourceNotFoundException("INSPECTION_NOT_FOUND", "Inspeção não encontrada."));

        User effectiveSupervisor = resolveSupervisor(supervisor, inspection, null);
        int cycle = (int) reviewRepository.countByInspectionId(inspectionId) + 1;

        String reason = dto != null ? dto.getReason() : null;
        String comments = dto != null ? dto.getComments() : null;

        InspectionReview review = InspectionReview.builder()
                .inspection(inspection)
                .reviewer(effectiveSupervisor)
                .decision(ReviewDecision.APPROVED)
                .reason(reason)
                .comments(comments)
                .reviewedAt(OffsetDateTime.now())
                .reviewCycle(cycle)
                .build();

        InspectionReview saved = reviewRepository.save(review);

        inspection.setStatus(InspectionStatus.APPROVED);
        inspection.setApprovedAt(OffsetDateTime.now());
        inspectionRepository.save(inspection);

        Equipment equipment = inspection.getEquipment();
        if (equipment != null) {
            equipment.setStatus(EquipmentStatus.ACTIVE);
            equipmentRepository.save(equipment);
        }

        String detailText = (reason != null && !reason.isBlank()) ? reason : "Inspeção aprovada pelo supervisor";
        recordAudit(inspection, effectiveSupervisor, "INSPECTION_APPROVED",
                "{\"details\":\"" + detailText.replace("\"", "\\\"") + "\"}");
        return ReviewResponseDTO.fromEntity(saved);
    }

    @Transactional
    public ReviewResponseDTO reject(UUID inspectionId, ReviewDecisionRequestDTO dto, User supervisor) {
        Inspection inspection = inspectionRepository.findById(inspectionId)
                .orElseThrow(() -> new ResourceNotFoundException("INSPECTION_NOT_FOUND", "Inspeção não encontrada."));

        String reason = dto != null ? dto.getReason() : null;
        if ((reason == null || reason.isBlank()) && dto != null && dto.getComments() != null && !dto.getComments().isBlank()) {
            reason = dto.getComments();
        }
        if (reason == null || reason.isBlank()) {
            throw new BusinessException("REASON_REQUIRED", "O motivo da reprovação é obrigatório (Seção 10.11.1).");
        }

        User effectiveSupervisor = resolveSupervisor(supervisor, inspection, null);
        int cycle = (int) reviewRepository.countByInspectionId(inspectionId) + 1;

        InspectionReview review = InspectionReview.builder()
                .inspection(inspection)
                .reviewer(effectiveSupervisor)
                .decision(ReviewDecision.REJECTED)
                .reason(reason)
                .comments(dto != null ? dto.getComments() : null)
                .reviewedAt(OffsetDateTime.now())
                .reviewCycle(cycle)
                .build();

        InspectionReview saved = reviewRepository.save(review);

        inspection.setStatus(InspectionStatus.REJECTED);
        inspectionRepository.save(inspection);

        Equipment equipment = inspection.getEquipment();
        if (equipment != null) {
            equipment.setStatus(EquipmentStatus.MAINTENANCE);
            equipmentRepository.save(equipment);
        }

        recordAudit(inspection, effectiveSupervisor, "INSPECTION_REJECTED",
                "{\"details\":\"" + reason.replace("\"", "\\\"") + "\"}");
        return ReviewResponseDTO.fromEntity(saved);
    }

    @Transactional
    public InspectionResponseDTO reviewFromMobile(UUID inspectionId, String status, UUID reviewerId, String observation, User authenticatedUser) {
        Inspection inspection = inspectionRepository.findByIdWithDetails(inspectionId)
                .orElseThrow(() -> new ResourceNotFoundException("INSPECTION_NOT_FOUND", "Inspeção não encontrada."));

        User effectiveSupervisor = resolveSupervisor(authenticatedUser, inspection, reviewerId);
        ReviewDecisionRequestDTO req = ReviewDecisionRequestDTO.builder()
                .reason(observation != null && !observation.isBlank() ? observation : ("REJECTED".equalsIgnoreCase(status) ? "Reprovado pelo supervisor." : "Aprovado pelo supervisor."))
                .comments(observation)
                .build();

        if ("REJECTED".equalsIgnoreCase(status)) {
            reject(inspectionId, req, effectiveSupervisor);
        } else {
            approve(inspectionId, req, effectiveSupervisor);
        }

        Inspection refreshed = inspectionRepository.findByIdWithDetails(inspectionId).orElse(inspection);
        List<InspectionReview> reviews = reviewRepository.findByInspectionIdOrderByReviewCycleAsc(inspectionId);
        InspectionReview latest = reviews.isEmpty() ? null : reviews.get(reviews.size() - 1);
        return InspectionResponseDTO.fromEntity(refreshed, latest);
    }

    private User resolveSupervisor(User supervisor, Inspection inspection, UUID reviewerId) {
        if (supervisor != null && supervisor.getRole() == UserRole.TECHNICIAN) {
            throw new BusinessException("FORBIDDEN_ROLE", "O técnico não possui permissão para avaliar, aprovar ou reprovar inspeções. A avaliação é exclusiva do Supervisor.");
        }
        if (reviewerId != null) {
            var found = userRepository.findById(reviewerId);
            if (found.isPresent()) {
                if (found.get().getRole() == UserRole.TECHNICIAN) {
                    throw new BusinessException("FORBIDDEN_ROLE", "O técnico não possui permissão para avaliar, aprovar ou reprovar inspeções. A avaliação é exclusiva do Supervisor.");
                }
                return found.get();
            }
        }
        if (supervisor != null) return supervisor;
        if (inspection.getSupervisor() != null) return inspection.getSupervisor();
        List<User> sups = userRepository.findByRole(UserRole.SUPERVISOR);
        if (!sups.isEmpty()) return sups.get(0);
        List<User> admins = userRepository.findByRole(UserRole.ADMIN);
        if (!admins.isEmpty()) return admins.get(0);
        return inspection.getTechnician();
    }

    private void recordAudit(Inspection inspection, User actor, String action, String metadataJson) {
        AuditEvent event = AuditEvent.builder()
                .inspection(inspection)
                .actor(actor)
                .action(action)
                .entityType("INSPECTION")
                .entityId(inspection.getId())
                .metadataJson(metadataJson)
                .occurredAt(OffsetDateTime.now())
                .build();
        auditEventRepository.save(event);
    }
}
