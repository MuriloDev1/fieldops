package com.fieldops.config;

import com.fieldops.domain.entity.*;
import com.fieldops.domain.enums.*;
import com.fieldops.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

@Slf4j
@Component
@Profile("local")
@RequiredArgsConstructor
public class DevDataLoader implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ClientRepository clientRepository;
    private final InspectionSiteRepository siteRepository;
    private final EquipmentRepository equipmentRepository;
    private final InspectionTemplateRepository templateRepository;
    private final InspectionTemplateVersionRepository versionRepository;
    private final InspectionRepository inspectionRepository;
    private final InspectionItemSnapshotRepository snapshotRepository;
    private final InspectionResponseRepository responseRepository;
    private final NonConformityRepository nonConformityRepository;
    private final InspectionReviewRepository reviewRepository;
    private final AuditEventRepository auditEventRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            return;
        }

        log.info("Populando dados de demonstração reproduzíveis (Perfil local H2 - PBI-066 / Task #34)...");

        // 1. Usuários
        String defaultPass = passwordEncoder.encode("123456");
        User admin = userRepository.save(User.builder()
                .name("Administrador do Sistema")
                .email("admin@fieldops.com")
                .passwordHash(defaultPass)
                .role(UserRole.ADMIN)
                .status(UserStatus.ACTIVE)
                .phone("(11) 99999-0001")
                .version(1)
                .build());

        User supervisor = userRepository.save(User.builder()
                .name("Roberto Silva")
                .email("supervisor@fieldops.com")
                .passwordHash(defaultPass)
                .role(UserRole.SUPERVISOR)
                .status(UserStatus.ACTIVE)
                .phone("(11) 99999-0002")
                .version(1)
                .build());

        User tecnico = userRepository.save(User.builder()
                .name("Carlos Lima")
                .email("tecnico@fieldops.com")
                .passwordHash(defaultPass)
                .role(UserRole.TECHNICIAN)
                .status(UserStatus.ACTIVE)
                .phone("(11) 99999-0003")
                .version(1)
                .build());

        // 2. Clientes
        Client petrobras = clientRepository.save(Client.builder()
                .name("Petrobras")
                .legalName("Petróleo Brasileiro S.A.")
                .document("33.000.167/0001-01")
                .email("contato@petrobras.com.br")
                .phone("(11) 3000-1000")
                .status(ClientStatus.ACTIVE)
                .version(1)
                .build());

        Client vale = clientRepository.save(Client.builder()
                .name("Vale S.A.")
                .legalName("Vale S.A. Mineração")
                .document("33.592.510/0001-54")
                .email("operacoes@vale.com")
                .phone("(27) 3333-2000")
                .status(ClientStatus.ACTIVE)
                .version(1)
                .build());

        Client klabin = clientRepository.save(Client.builder()
                .name("Klabin")
                .legalName("Klabin S.A. Papel e Celulose")
                .document("89.637.490/0001-45")
                .email("manutencao@klabin.com.br")
                .phone("(42) 3271-5000")
                .status(ClientStatus.ACTIVE)
                .version(1)
                .build());

        // 3. Locais / Plantas
        InspectionSite rpbc = siteRepository.save(InspectionSite.builder()
                .client(petrobras)
                .name("Refinaria RPBC")
                .description("Refinaria Presidente Bernardes")
                .city("Cubatão")
                .state("SP")
                .status(SiteStatus.ACTIVE)
                .version(1)
                .build());

        InspectionSite tubarao = siteRepository.save(InspectionSite.builder()
                .client(vale)
                .name("Terminal Portuário de Tubarão")
                .description("Complexo Portuário e Logístico")
                .city("Vitória")
                .state("ES")
                .status(SiteStatus.ACTIVE)
                .version(1)
                .build());

        InspectionSite monteAlegre = siteRepository.save(InspectionSite.builder()
                .client(klabin)
                .name("Fábrica Monte Alegre")
                .description("Unidade Industrial de Celulose")
                .city("Telêmaco Borba")
                .state("PR")
                .status(SiteStatus.ACTIVE)
                .version(1)
                .build());

        // 4. Equipamentos
        Equipment bomba = equipmentRepository.save(Equipment.builder()
                .site(rpbc)
                .name("Bomba Centrífuga KSB 01")
                .qrCode("QR-KSB-01")
                .manufacturer("KSB")
                .model("Meganorm 125-250")
                .status(EquipmentStatus.ACTIVE)
                .version(1)
                .build());

        Equipment painel = equipmentRepository.save(Equipment.builder()
                .site(tubarao)
                .name("Painel Elétrico CCM-02")
                .qrCode("QR-CCM-02")
                .manufacturer("WEG")
                .model("CCM 480V 60Hz")
                .status(EquipmentStatus.ACTIVE)
                .version(1)
                .build());

        Equipment caldeira = equipmentRepository.save(Equipment.builder()
                .site(monteAlegre)
                .name("Caldeira de Alta Pressão 03")
                .qrCode("QR-CALD-03")
                .manufacturer("CBC")
                .model("Vapor 120 ton/h")
                .status(EquipmentStatus.ACTIVE)
                .version(1)
                .build());

        Equipment compressor = equipmentRepository.save(Equipment.builder()
                .site(rpbc)
                .name("Compressor Principal GA 90")
                .qrCode("QR-COMP-01")
                .manufacturer("Atlas Copco")
                .model("GA 90 VSD")
                .status(EquipmentStatus.ACTIVE)
                .version(1)
                .build());

        // 5. Modelo de Checklist
        InspectionTemplate template = templateRepository.save(InspectionTemplate.builder()
                .title("Checklist Preventivo de Bomba Hidráulica")
                .description("Inspeção visual, rolamentos, vibração e selagem mecânica")
                .category("Mecânica")
                .status(TemplateStatus.ACTIVE)
                .createdBy(admin)
                .version(1)
                .build());

        InspectionTemplateVersion version = InspectionTemplateVersion.builder()
                .template(template)
                .versionNumber(1)
                .titleSnapshot("Checklist Preventivo de Bomba Hidráulica v1.0")
                .descriptionSnapshot("Inspeção visual, rolamentos, vibração e selagem mecânica")
                .publishedBy(admin)
                .publishedAt(OffsetDateTime.now().minusDays(10))
                .activeForNewInspections(true)
                .build();

        TemplateSection section1 = TemplateSection.builder()
                .templateVersion(version)
                .title("Inspeção Visual e Segurança")
                .displayOrder(0)
                .build();

        TemplateItem item1 = TemplateItem.builder()
                .section(section1)
                .title("Equipamento desobstruído e limpo?")
                .responseType(ResponseType.CONFORMITY)
                .required(true)
                .displayOrder(0)
                .build();

        TemplateItem item2 = TemplateItem.builder()
                .section(section1)
                .title("Presença de ruídos ou vibrações fora do padrão?")
                .responseType(ResponseType.CONFORMITY)
                .required(true)
                .displayOrder(1)
                .build();

        TemplateItem item3 = TemplateItem.builder()
                .section(section1)
                .title("Vazamento de fluido no selo mecânico?")
                .responseType(ResponseType.CONFORMITY)
                .required(true)
                .displayOrder(2)
                .build();

        section1.setItems(List.of(item1, item2, item3));
        version.setSections(List.of(section1));
        versionRepository.save(version);

        // 6. Demonstração de Inspeções em Diversos Estados do Ciclo de Vida (Task #34 e #51)

        // 6.1 Inspeção 1: SCHEDULED (Agendada)
        Inspection insp1 = inspectionRepository.save(Inspection.builder()
                .templateVersion(version)
                .client(petrobras)
                .site(rpbc)
                .equipment(bomba)
                .technician(tecnico)
                .supervisor(supervisor)
                .title("Inspeção Preventiva Bomba KSB")
                .instructions("Verificar vedação e temperatura dos mancais.")
                .scheduledFor(OffsetDateTime.now().plusDays(2))
                .priority(InspectionPriority.HIGH)
                .status(InspectionStatus.ASSIGNED)
                .version(1)
                .build());

        createItemSnapshots(insp1);
        recordAudit(insp1, supervisor, "INSPECTION_CREATED", OffsetDateTime.now().minusHours(24), "Inspeção agendada para a próxima parada de manutenção.");
        recordAudit(insp1, supervisor, "INSPECTION_ASSIGNED", OffsetDateTime.now().minusHours(24), "Atribuída ao técnico Carlos Lima.");

        // 6.2 Inspeção 2: IN_PROGRESS (Em Andamento)
        Inspection insp2 = inspectionRepository.save(Inspection.builder()
                .templateVersion(version)
                .client(vale)
                .site(tubarao)
                .equipment(painel)
                .technician(tecnico)
                .supervisor(supervisor)
                .title("Inspeção Elétrica Painel CCM-02")
                .instructions("Utilizar EPI nível 2 e verificar conexões térmicas.")
                .scheduledFor(OffsetDateTime.now())
                .startedAtServer(OffsetDateTime.now().minusHours(2))
                .startedAtDevice(OffsetDateTime.now().minusHours(2))
                .priority(InspectionPriority.CRITICAL)
                .status(InspectionStatus.IN_PROGRESS)
                .version(1)
                .build());

        List<InspectionItemSnapshot> snaps2 = createItemSnapshots(insp2);
        recordAudit(insp2, supervisor, "INSPECTION_CREATED", OffsetDateTime.now().minusDays(1), "Agendamento de emergência por indicação termográfica.");
        recordAudit(insp2, supervisor, "INSPECTION_ASSIGNED", OffsetDateTime.now().minusDays(1), "Atribuída ao técnico Carlos Lima.");
        recordAudit(insp2, tecnico, "INSPECTION_STARTED", OffsetDateTime.now().minusHours(2), "Check-in realizado com leitura de QR Code QR-CCM-02.");

        // Resposta parcial
        if (!snaps2.isEmpty()) {
            responseRepository.save(InspectionResponse.builder()
                    .inspection(insp2)
                    .inspectionItem(snaps2.get(0))
                    .conformity(ConformityStatus.CONFORMING)
                    .answeredBy(tecnico)
                    .answeredAtDevice(OffsetDateTime.now().minusMinutes(90))
                    .serverReceivedAt(OffsetDateTime.now().minusMinutes(90))
                    .build());
        }

        // 6.3 Inspeção 3: SUBMITTED (Em Revisão com Não Conformidade gerada)
        Inspection insp3 = inspectionRepository.save(Inspection.builder()
                .templateVersion(version)
                .client(klabin)
                .site(monteAlegre)
                .equipment(caldeira)
                .technician(tecnico)
                .supervisor(supervisor)
                .title("Inspeção Caldeira de Alta Pressão")
                .instructions("Inspecionar válvulas de alívio e estanqueidade.")
                .scheduledFor(OffsetDateTime.now().minusDays(1))
                .startedAtServer(OffsetDateTime.now().minusHours(6))
                .submittedAtServer(OffsetDateTime.now().minusHours(3))
                .completedAtDevice(OffsetDateTime.now().minusHours(3))
                .priority(InspectionPriority.HIGH)
                .status(InspectionStatus.SUBMITTED)
                .version(1)
                .build());

        List<InspectionItemSnapshot> snaps3 = createItemSnapshots(insp3);
        recordAudit(insp3, supervisor, "INSPECTION_CREATED", OffsetDateTime.now().minusDays(2), "Criação de rotina mensal preventiva.");
        recordAudit(insp3, supervisor, "INSPECTION_ASSIGNED", OffsetDateTime.now().minusDays(2), "Atribuída ao técnico Carlos Lima.");
        recordAudit(insp3, tecnico, "INSPECTION_STARTED", OffsetDateTime.now().minusHours(6), "Início da inspeção presencial.");
        recordAudit(insp3, tecnico, "INSPECTION_SUBMITTED", OffsetDateTime.now().minusHours(3), "Checklist enviado. Identificada não conformidade em mancal.");
        recordAudit(insp3, supervisor, "REVIEW_STARTED", OffsetDateTime.now().minusHours(1), "Supervisor iniciou a revisão técnica.");

        if (snaps3.size() >= 3) {
            responseRepository.save(InspectionResponse.builder()
                    .inspection(insp3)
                    .inspectionItem(snaps3.get(0))
                    .conformity(ConformityStatus.CONFORMING)
                    .answeredBy(tecnico)
                    .build());

            InspectionResponse respFailure = responseRepository.save(InspectionResponse.builder()
                    .inspection(insp3)
                    .inspectionItem(snaps3.get(1))
                    .conformity(ConformityStatus.NON_CONFORMING)
                    .observation("Vibração anômala detectada no rotor principal (acima de 4.5 mm/s).")
                    .answeredBy(tecnico)
                    .build());

            responseRepository.save(InspectionResponse.builder()
                    .inspection(insp3)
                    .inspectionItem(snaps3.get(2))
                    .conformity(ConformityStatus.CONFORMING)
                    .answeredBy(tecnico)
                    .build());

            nonConformityRepository.save(NonConformity.builder()
                    .inspection(insp3)
                    .inspectionItem(snaps3.get(1))
                    .response(respFailure)
                    .title("Vibração fora do padrão no rotor principal")
                    .description("Nível de vibração 4.5 mm/s excede o limite aceitável de 2.8 mm/s.")
                    .severity(NonConformitySeverity.HIGH)
                    .status(NonConformityStatus.OPEN)
                    .createdBy(tecnico)
                    .createdAtDevice(OffsetDateTime.now().minusHours(3))
                    .build());
        }

        // 6.4 Inspeção 4: APPROVED (Aprovada pelo Supervisor)
        Inspection insp4 = inspectionRepository.save(Inspection.builder()
                .templateVersion(version)
                .client(petrobras)
                .site(rpbc)
                .equipment(compressor)
                .technician(tecnico)
                .supervisor(supervisor)
                .title("Inspeção Periódica Compressor GA 90")
                .instructions("Checagem de filtros e troca de óleo lubrificante.")
                .scheduledFor(OffsetDateTime.now().minusDays(3))
                .startedAtServer(OffsetDateTime.now().minusDays(3).plusHours(2))
                .submittedAtServer(OffsetDateTime.now().minusDays(3).plusHours(4))
                .completedAtDevice(OffsetDateTime.now().minusDays(3).plusHours(4))
                .priority(InspectionPriority.MEDIUM)
                .status(InspectionStatus.APPROVED)
                .version(1)
                .build());

        createItemSnapshots(insp4);
        recordAudit(insp4, supervisor, "INSPECTION_CREATED", OffsetDateTime.now().minusDays(4), "Inspeção criada.");
        recordAudit(insp4, supervisor, "INSPECTION_ASSIGNED", OffsetDateTime.now().minusDays(4), "Atribuída ao técnico.");
        recordAudit(insp4, tecnico, "INSPECTION_STARTED", OffsetDateTime.now().minusDays(3).plusHours(2), "Execução iniciada.");
        recordAudit(insp4, tecnico, "INSPECTION_SUBMITTED", OffsetDateTime.now().minusDays(3).plusHours(4), "Checklist enviado sem pendências.");
        recordAudit(insp4, supervisor, "REVIEW_STARTED", OffsetDateTime.now().minusDays(3).plusHours(5), "Revisão iniciada.");
        recordAudit(insp4, supervisor, "INSPECTION_APPROVED", OffsetDateTime.now().minusDays(3).plusHours(6), "Aprovada sem ressalvas pelo supervisor.");

        reviewRepository.save(InspectionReview.builder()
                .inspection(insp4)
                .reviewer(supervisor)
                .decision(ReviewDecision.APPROVED)
                .comments("Todos os parâmetros verificados estão dentro das normas operacionais.")
                .reviewedAt(OffsetDateTime.now().minusDays(3).plusHours(6))
                .reviewCycle(1)
                .build());

        // 6.5 Inspeção 5: REJECTED (Reprovada com Justificativa)
        Inspection insp5 = inspectionRepository.save(Inspection.builder()
                .templateVersion(version)
                .client(vale)
                .site(tubarao)
                .equipment(painel)
                .technician(tecnico)
                .supervisor(supervisor)
                .title("Inspeção de Segurança Elétrica Painel CCM")
                .instructions("Auditoria de aterramento e disjuntores.")
                .scheduledFor(OffsetDateTime.now().minusDays(5))
                .startedAtServer(OffsetDateTime.now().minusDays(5).plusHours(1))
                .submittedAtServer(OffsetDateTime.now().minusDays(5).plusHours(3))
                .completedAtDevice(OffsetDateTime.now().minusDays(5).plusHours(3))
                .priority(InspectionPriority.HIGH)
                .status(InspectionStatus.REJECTED)
                .version(1)
                .build());

        createItemSnapshots(insp5);
        recordAudit(insp5, supervisor, "INSPECTION_CREATED", OffsetDateTime.now().minusDays(6), "Inspeção criada.");
        recordAudit(insp5, supervisor, "INSPECTION_ASSIGNED", OffsetDateTime.now().minusDays(6), "Atribuída ao técnico.");
        recordAudit(insp5, tecnico, "INSPECTION_STARTED", OffsetDateTime.now().minusDays(5).plusHours(1), "Execução iniciada.");
        recordAudit(insp5, tecnico, "INSPECTION_SUBMITTED", OffsetDateTime.now().minusDays(5).plusHours(3), "Checklist enviado pelo técnico.");
        recordAudit(insp5, supervisor, "REVIEW_STARTED", OffsetDateTime.now().minusDays(5).plusHours(4), "Revisão iniciada.");
        recordAudit(insp5, supervisor, "INSPECTION_REJECTED", OffsetDateTime.now().minusDays(5).plusHours(5), "Reprovada: Ausência de foto obrigatória do mancal com aquecimento.");

        reviewRepository.save(InspectionReview.builder()
                .inspection(insp5)
                .reviewer(supervisor)
                .decision(ReviewDecision.REJECTED)
                .reason("Foto obrigatória ausente no item de aquecimento anômalo. Necessário registrar evidência fotográfica.")
                .comments("Favor retornar ao painel e fotografar a leitura termográfica com data visível.")
                .reviewedAt(OffsetDateTime.now().minusDays(5).plusHours(5))
                .reviewCycle(1)
                .build());

        log.info("Base local H2 populada com 5 inspeções completas e trilha de auditoria (RN-086 / Task #34 e #51)!");
    }

    private List<InspectionItemSnapshot> createItemSnapshots(Inspection inspection) {
        InspectionItemSnapshot s1 = snapshotRepository.save(InspectionItemSnapshot.builder()
                .inspection(inspection)
                .sectionTitle("Inspeção Visual e Segurança")
                .sectionOrder(0)
                .itemTitle("Equipamento desobstruído e limpo?")
                .responseType(ResponseType.CONFORMITY)
                .required(true)
                .itemOrder(0)
                .build());

        InspectionItemSnapshot s2 = snapshotRepository.save(InspectionItemSnapshot.builder()
                .inspection(inspection)
                .sectionTitle("Inspeção Visual e Segurança")
                .sectionOrder(0)
                .itemTitle("Presença de ruídos ou vibrações fora do padrão?")
                .responseType(ResponseType.CONFORMITY)
                .required(true)
                .itemOrder(1)
                .build());

        InspectionItemSnapshot s3 = snapshotRepository.save(InspectionItemSnapshot.builder()
                .inspection(inspection)
                .sectionTitle("Inspeção Visual e Segurança")
                .sectionOrder(0)
                .itemTitle("Vazamento de fluido no selo mecânico?")
                .responseType(ResponseType.CONFORMITY)
                .required(true)
                .itemOrder(2)
                .build());

        return List.of(s1, s2, s3);
    }

    private void recordAudit(Inspection inspection, User actor, String action, OffsetDateTime occurredAt, String details) {
        AuditEvent event = AuditEvent.builder()
                .inspection(inspection)
                .actor(actor)
                .action(action)
                .entityType("INSPECTION")
                .entityId(inspection.getId())
                .occurredAt(occurredAt)
                .metadataJson(details)
                .build();
        auditEventRepository.save(event);
    }
}
