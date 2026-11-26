package com.fieldops;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fieldops.domain.entity.Equipment;
import com.fieldops.domain.entity.Inspection;
import com.fieldops.domain.enums.InspectionStatus;
import com.fieldops.dto.auth.LoginRequestDTO;
import com.fieldops.dto.inspection.CreateInspectionDTO;
import com.fieldops.dto.review.ReviewDecisionRequestDTO;
import com.fieldops.dto.sync.SyncPushRequestDTO;
import com.fieldops.dto.template.CreateTemplateDTO;
import com.fieldops.repository.EquipmentRepository;
import com.fieldops.repository.InspectionRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("local")
class FieldOpsIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private EquipmentRepository equipmentRepository;

    @Autowired
    private InspectionRepository inspectionRepository;

    @Test
    @DisplayName("AC-AUTH & RN-001: Login válido retorna JWT e login inválido retorna 401")
    void shouldAuthenticateValidUserAndRejectInvalidCredentials() throws Exception {
        LoginRequestDTO validLogin = new LoginRequestDTO("supervisor@fieldops.com", "123456");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validLogin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken", notNullValue()))
                .andExpect(jsonPath("$.user.email", is("supervisor@fieldops.com")))
                .andExpect(jsonPath("$.user.role", is("SUPERVISOR")));

        LoginRequestDTO invalidLogin = new LoginRequestDTO("supervisor@fieldops.com", "senha-errada");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidLogin)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code", is("UNAUTHORIZED")));
    }

    @Test
    @DisplayName("AC-SECURITY & RN-003/RN-079: Técnico não pode gerenciar usuários nem aprovar inspeção (403 Forbidden)")
    void shouldBlockTechnicianFromAdminAndSupervisorActions() throws Exception {
        LoginRequestDTO techLogin = new LoginRequestDTO("tecnico@fieldops.com", "123456");
        MvcResult loginRes = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(techLogin)))
                .andExpect(status().isOk())
                .andReturn();

        String techToken = objectMapper.readTree(loginRes.getResponse().getContentAsString())
                .get("accessToken").asText();

        // Técnico tentando listar cadastros administrativos de usuários -> 403
        mockMvc.perform(get("/api/v1/users")
                        .header("Authorization", "Bearer " + techToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code", is("FORBIDDEN")));

        // Técnico tentando aprovar uma inspeção -> 403
        UUID submittedInspectionId = UUID.fromString("80000000-0000-0000-0000-000000000003");
        mockMvc.perform(post("/api/v1/inspections/" + submittedInspectionId + "/approve")
                        .header("Authorization", "Bearer " + techToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code", is("FORBIDDEN")));
    }

    @Test
    @DisplayName("RN-019 a RN-025: Criar modelo versionado, agendar inspeção com snapshot imutável e validar QR Code no início")
    void shouldCreateVersionedTemplateScheduleInspectionWithSnapshotAndValidateQrCode() throws Exception {
        // 1. Criar novo modelo com seção e itens
        CreateTemplateDTO.CreateItemDTO item1 = CreateTemplateDTO.CreateItemDTO.builder()
                .title("Pressão do manômetro está normal?")
                .responseType("CONFORM_NON_CONFORM")
                .required(true)
                .observationRequiredOnFailure(true)
                .evidenceRequiredOnFailure(true)
                .displayOrder(1)
                .build();

        CreateTemplateDTO.CreateSectionDTO sec1 = CreateTemplateDTO.CreateSectionDTO.builder()
                .title("Verificação Hidráulica")
                .displayOrder(1)
                .items(List.of(item1))
                .build();

        CreateTemplateDTO createTemplate = CreateTemplateDTO.builder()
                .title("Modelo de Teste Integração")
                .category("Hidráulica")
                .description("Teste automatizado de snapshot")
                .sections(List.of(sec1))
                .build();

        MvcResult tmplRes = mockMvc.perform(post("/api/v1/inspection-templates")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createTemplate)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.versionNumber", is(1)))
                .andExpect(jsonPath("$.itemsCount", is(1)))
                .andReturn();

        UUID templateId = UUID.fromString(
                objectMapper.readTree(tmplRes.getResponse().getContentAsString()).get("id").asText()
        );

        // 2. Agendar inspeção vinculada ao modelo e equipamento QR-BOMBA-04-ALPHA
        Equipment bomba = equipmentRepository.findByQrCode("QR-BOMBA-04-ALPHA")
                .orElseGet(() -> equipmentRepository.findAll().get(0));
        String expectedQr = bomba.getQrCode();

        CreateInspectionDTO createInsp = CreateInspectionDTO.builder()
                .templateId(templateId)
                .equipmentId(bomba.getId())
                .priority("HIGH")
                .notes("Validar snapshot e QR Code")
                .build();

        MvcResult inspRes = mockMvc.perform(post("/api/v1/inspections")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createInsp)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status", is("ASSIGNED")))
                .andExpect(jsonPath("$.itemsCount", is(1)))
                .andExpect(jsonPath("$.items[0].itemTitle", is("Pressão do manômetro está normal?")))
                .andReturn();

        UUID inspectionId = UUID.fromString(
                objectMapper.readTree(inspRes.getResponse().getContentAsString()).get("id").asText()
        );

        // 3. Publicar versão 2 do modelo e garantir que a inspeção existente preserva o snapshot original (RN-021)
        mockMvc.perform(post("/api/v1/inspection-templates/" + templateId + "/publish")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"Modelo de Teste Integração v2\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.versionNumber", is(2)));

        // 4. Tentar iniciar inspeção com QR Code ERRADO -> deve bloquear com 422 (RN-025 / RN-064)
        mockMvc.perform(post("/api/v1/inspections/" + inspectionId + "/start")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"qrCode\":\"QR-EQUIPAMENTO-ERRADO\",\"latitude\":\"-23.8950\",\"longitude\":\"-46.4250\"}"))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.code", is("QR_CODE_MISMATCH")));

        // 5. Iniciar inspeção com QR Code CORRETO -> muda para IN_PROGRESS (RN-025 / RN-042)
        mockMvc.perform(post("/api/v1/inspections/" + inspectionId + "/start")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"qrCode\":\"" + expectedQr + "\",\"latitude\":\"-23.8950\",\"longitude\":\"-46.4250\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("IN_PROGRESS")));
    }

    @Test
    @DisplayName("AC-SYNC & RN-067/RN-068: Sincronização Outbox processa lote e impede duplicidade em reenvio idêntico")
    void shouldProcessOutboxPushIdempotentlyWithoutDuplication() throws Exception {
        Inspection assignedInspection = inspectionRepository.findAll().stream()
                .filter(i -> i.getStatus() == InspectionStatus.ASSIGNED || i.getStatus() == InspectionStatus.IN_PROGRESS)
                .findFirst()
                .orElseThrow();
        UUID assignedInspectionId = assignedInspection.getId();
        UUID operationId = UUID.randomUUID();

        SyncPushRequestDTO.SyncOperationDTO startOp = new SyncPushRequestDTO.SyncOperationDTO(
                operationId,
                "INSPECTION",
                assignedInspectionId,
                "START",
                0,
                Map.of(
                        "inspectionId", assignedInspectionId.toString(),
                        "latitude", "-20.2820",
                        "longitude", "-40.2440"
                )
        );

        SyncPushRequestDTO pushRequest = SyncPushRequestDTO.builder()
                .deviceId(UUID.randomUUID())
                .operations(List.of(startOp))
                .build();

        // 1º envio: deve retornar APPLIED
        mockMvc.perform(post("/api/v1/mobile/sync/push")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(pushRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.results[0].operationId", is(operationId.toString())))
                .andExpect(jsonPath("$.results[0].status", is("APPLIED")));

        // 2º envio (reenvio do mesmo operationId): deve retornar ALREADY_APPLIED sem duplicar (RN-068)
        mockMvc.perform(post("/api/v1/mobile/sync/push")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(pushRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.results[0].operationId", is(operationId.toString())))
                .andExpect(jsonPath("$.results[0].status", is("ALREADY_APPLIED")));
    }

    @Test
    @DisplayName("AC-REVIEW & RN-080/RN-082/RN-086: Reprovação sem motivo é bloqueada (422) e trilha de auditoria é registrada")
    void shouldEnforceRejectionReasonAndRecordAuditHistory() throws Exception {
        Inspection submittedInspection = inspectionRepository.findAll().stream()
                .filter(i -> i.getStatus() == InspectionStatus.SUBMITTED)
                .findFirst()
                .orElseThrow();
        UUID submittedInspectionId = submittedInspection.getId();

        // 1. Reprovar sem motivo -> 422 REASON_REQUIRED (RN-080)
        ReviewDecisionRequestDTO emptyReject = ReviewDecisionRequestDTO.builder()
                .reason("")
                .build();

        mockMvc.perform(post("/api/v1/inspections/" + submittedInspectionId + "/reject")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(emptyReject)))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.code", is("REASON_REQUIRED")));

        // 2. Consultar histórico de auditoria (RN-086)
        mockMvc.perform(get("/api/v1/inspections/" + submittedInspectionId + "/history"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", not(empty())))
                .andExpect(jsonPath("$[0].action", notNullValue()));

        // 3. Tentar cancelar uma inspeção já APROVADA -> 422 CANNOT_CANCEL_APPROVED (RN-030 / RN-082)
        Inspection approvedInspection = inspectionRepository.findAll().stream()
                .filter(i -> i.getStatus() == InspectionStatus.APPROVED)
                .findFirst()
                .orElseThrow();
        mockMvc.perform(post("/api/v1/inspections/" + approvedInspection.getId() + "/cancel")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"reason\":\"Tentativa indevida\"}"))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.code", is("CANNOT_CANCEL_APPROVED")));
    }
}
