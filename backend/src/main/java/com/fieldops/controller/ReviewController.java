package com.fieldops.controller;

import com.fieldops.domain.entity.User;
import com.fieldops.dto.inspection.InspectionResponseDTO;
import com.fieldops.dto.review.ReviewDecisionRequestDTO;
import com.fieldops.dto.review.ReviewResponseDTO;
import com.fieldops.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/inspections/{inspectionId}")
@RequiredArgsConstructor
@Tag(name = "Revisões", description = "Endpoints de revisão e aprovação motivada de inspeções (Seção 12.14)")
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping("/reviews")
    @Operation(summary = "Lista o histórico de ciclos de revisão da inspeção")
    public ResponseEntity<List<ReviewResponseDTO>> getReviews(@PathVariable UUID inspectionId) {
        return ResponseEntity.ok(reviewService.getReviewsByInspection(inspectionId));
    }

    @PostMapping("/begin-review")
    @Operation(summary = "Inicia a revisão da inspeção pelo supervisor")
    public ResponseEntity<InspectionResponseDTO> beginReview(
            @PathVariable UUID inspectionId,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(reviewService.beginReview(inspectionId, user));
    }

    @PostMapping("/approve")
    @Operation(summary = "Aprova a inspeção")
    public ResponseEntity<ReviewResponseDTO> approve(
            @PathVariable UUID inspectionId,
            @RequestBody(required = false) ReviewDecisionRequestDTO dto,
            @AuthenticationPrincipal User user) {
        ReviewDecisionRequestDTO request = dto != null ? dto : new ReviewDecisionRequestDTO();
        return ResponseEntity.ok(reviewService.approve(inspectionId, request, user));
    }

    @PostMapping("/reject")
    @Operation(summary = "Reprova a inspeção com motivo obrigatório")
    public ResponseEntity<ReviewResponseDTO> reject(
            @PathVariable UUID inspectionId,
            @RequestBody ReviewDecisionRequestDTO dto,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(reviewService.reject(inspectionId, dto, user));
    }
}
