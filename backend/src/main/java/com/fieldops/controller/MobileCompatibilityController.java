package com.fieldops.controller;

import com.fieldops.domain.entity.User;
import com.fieldops.dto.auth.AuthResponseDTO;
import com.fieldops.dto.auth.LoginRequestDTO;
import com.fieldops.dto.equipment.CreateEquipmentDTO;
import com.fieldops.dto.equipment.EquipmentResponseDTO;
import com.fieldops.dto.inspection.CreateInspectionDTO;
import com.fieldops.dto.inspection.InspectionResponseDTO;
import com.fieldops.dto.inspection.InspectionResponseItemDTO;
import com.fieldops.service.AuthService;
import com.fieldops.service.EquipmentService;
import com.fieldops.service.InspectionService;
import com.fieldops.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@Tag(name = "Compatibilidade Mobile (Gizella)", description = "Endpoints diretos compatíveis com o aplicativo móvel React Native / Expo")
public class MobileCompatibilityController {

    private final AuthService authService;
    private final EquipmentService equipmentService;
    private final InspectionService inspectionService;
    private final ReviewService reviewService;

    @PostMapping("/auth/login")
    @Operation(summary = "Autenticação direta para o aplicativo móvel")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginRequestDTO request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping({"/auth/refresh", "/api/v1/auth/refresh"})
    @Operation(summary = "Renovação de sessão para o aplicativo móvel")
    public ResponseEntity<AuthResponseDTO> refreshMobile(@RequestBody(required = false) Map<String, String> request) {
        String refreshToken = request != null ? request.get("refreshToken") : null;
        if (refreshToken == null || refreshToken.isBlank()) {
            refreshToken = request != null ? request.get("token") : null;
        }
        return ResponseEntity.ok(authService.refresh(refreshToken));
    }

    @PostMapping({"/auth/logout", "/api/v1/auth/logout"})
    @Operation(summary = "Encerra sessão pelo aplicativo móvel")
    public ResponseEntity<Void> logoutMobile() {
        return ResponseEntity.noContent().build();
    }

    @GetMapping({"/equipments", "/api/v1/equipments"})
    @Operation(summary = "Lista equipamentos no formato esperado pelo app móvel")
    public ResponseEntity<List<EquipmentResponseDTO>> listEquipments() {
        List<EquipmentResponseDTO> list = equipmentService.listAll().stream()
                .map(this::normalizeEquipmentForMobile)
                .toList();
        return ResponseEntity.ok(list);
    }

    @GetMapping({"/equipments/{id}", "/api/v1/equipments/{id}"})
    @Operation(summary = "Busca equipamento por ID no formato esperado pelo app móvel")
    public ResponseEntity<EquipmentResponseDTO> getEquipment(@PathVariable UUID id) {
        return ResponseEntity.ok(normalizeEquipmentForMobile(equipmentService.getById(id)));
    }

    @PostMapping({"/equipments", "/api/v1/equipments"})
    @Operation(summary = "Cria equipamento pelo app móvel")
    public ResponseEntity<EquipmentResponseDTO> createEquipment(@RequestBody CreateEquipmentDTO dto) {
        EquipmentResponseDTO created = equipmentService.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(normalizeEquipmentForMobile(created));
    }

    @PatchMapping({"/equipments/{id}", "/api/v1/equipments/{id}"})
    @Operation(summary = "Atualiza equipamento pelo app móvel")
    public ResponseEntity<EquipmentResponseDTO> patchEquipment(
            @PathVariable UUID id,
            @RequestBody Map<String, Object> body) {
        EquipmentResponseDTO updated = equipmentService.updatePartial(id, body);
        return ResponseEntity.ok(normalizeEquipmentForMobile(updated));
    }

    @GetMapping("/inspections")
    @Operation(summary = "Lista inspeções no formato esperado pelo app móvel")
    public ResponseEntity<List<InspectionResponseDTO>> listInspections() {
        List<InspectionResponseDTO> list = inspectionService.listAll().stream()
                .map(this::normalizeInspectionForMobile)
                .toList();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/inspections/{id}")
    @Operation(summary = "Busca inspeção por ID no formato esperado pelo app móvel")
    public ResponseEntity<InspectionResponseDTO> getInspection(@PathVariable UUID id) {
        return ResponseEntity.ok(normalizeInspectionForMobile(inspectionService.getById(id)));
    }

    @PostMapping("/inspections")
    @Operation(summary = "Cria e inicia inspeção pelo app móvel")
    public ResponseEntity<InspectionResponseDTO> createInspection(
            @RequestBody CreateInspectionDTO dto,
            @AuthenticationPrincipal User user) {
        InspectionResponseDTO created = inspectionService.create(dto, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(normalizeInspectionForMobile(created));
    }

    @PostMapping({"/inspections/{id}/answers", "/api/v1/inspections/{id}/answers"})
    @Operation(summary = "Registra resposta individual de pergunta pelo app móvel")
    public ResponseEntity<InspectionResponseItemDTO> saveAnswer(
            @PathVariable UUID id,
            @RequestBody MobileAnswerInputDTO dto,
            @AuthenticationPrincipal User user) {
        UUID effectiveUserId = dto.getUserId() != null ? dto.getUserId() : (user != null ? user.getId() : null);
        InspectionResponseItemDTO saved = inspectionService.saveSingleAnswer(
                id,
                dto.getQuestionId(),
                effectiveUserId,
                dto.getValue(),
                dto.getObservation(),
                dto.getPhotoUrl(),
                dto.getSignatureUrl()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PatchMapping({"/inspections/{id}/complete", "/api/v1/inspections/{id}/complete"})
    @Operation(summary = "Conclui inspeção em campo pelo app móvel")
    public ResponseEntity<InspectionResponseDTO> completeInspection(
            @PathVariable UUID id,
            @RequestBody(required = false) MobileCompleteInputDTO dto,
            @AuthenticationPrincipal User user) {
        UUID effectiveUserId = (dto != null && dto.getUserId() != null)
                ? dto.getUserId()
                : (user != null ? user.getId() : null);
        String obs = dto != null ? dto.getObservation() : null;
        InspectionResponseDTO completed = inspectionService.completeMobileInspection(id, effectiveUserId, obs);
        return ResponseEntity.ok(normalizeInspectionForMobile(completed));
    }

    @PatchMapping({"/inspections/{id}/review", "/api/v1/inspections/{id}/review"})
    @Operation(summary = "Aprova ou reprova inspeção pelo modal do supervisor no app móvel")
    public ResponseEntity<InspectionResponseDTO> reviewInspection(
            @PathVariable UUID id,
            @RequestBody MobileReviewInputDTO dto,
            @AuthenticationPrincipal User user) {
        InspectionResponseDTO reviewed = reviewService.reviewFromMobile(
                id,
                dto.getStatus(),
                dto.getReviewerId(),
                dto.getObservation(),
                user
        );
        return ResponseEntity.ok(normalizeInspectionForMobile(reviewed));
    }

    private EquipmentResponseDTO normalizeEquipmentForMobile(EquipmentResponseDTO eq) {
        if (eq == null) return null;
        String st = eq.getStatus();
        if (st == null) {
            eq.setStatus("ACTIVE");
        } else {
            switch (st.toUpperCase()) {
                case "ACTIVE", "OK", "LOW" -> eq.setStatus("ACTIVE");
                case "MAINTENANCE", "ALTA", "HIGH" -> eq.setStatus("MAINTENANCE");
                case "INACTIVE", "CRITICAL", "CRITICO" -> eq.setStatus("INACTIVE");
                default -> eq.setStatus("ACTIVE");
            }
        }
        return eq;
    }

    private InspectionResponseDTO normalizeInspectionForMobile(InspectionResponseDTO insp) {
        if (insp == null) return null;
        String st = insp.getStatus();
        if (st == null) {
            insp.setStatus("IN_PROGRESS");
        } else {
            switch (st.toUpperCase()) {
                case "SUBMITTED", "UNDER_REVIEW", "APPROVED", "REJECTED", "COMPLETED" -> insp.setStatus("COMPLETED");
                case "CANCELED", "CANCELLED" -> insp.setStatus("CANCELLED");
                default -> insp.setStatus("IN_PROGRESS");
            }
        }
        return insp;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MobileAnswerInputDTO {
        private UUID questionId;
        private UUID userId;
        private String value;
        private String observation;
        private String photoUrl;
        private String signatureUrl;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MobileCompleteInputDTO {
        private UUID userId;
        private String observation;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MobileReviewInputDTO {
        private String status;
        private UUID reviewerId;
        private String observation;
    }
}
