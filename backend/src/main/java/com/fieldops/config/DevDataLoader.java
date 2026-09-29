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
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            return;
        }

        log.info("Populando dados de desenvolvimento inicial (Perfil local H2)...");

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
                .publishedAt(OffsetDateTime.now())
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

        // 6. Inspeções Iniciais
        Inspection insp1 = inspectionRepository.save(Inspection.builder()
                .templateVersion(version)
                .client(petrobras)
                .site(rpbc)
                .equipment(bomba)
                .technician(tecnico)
                .supervisor(supervisor)
                .title("Inspeção Preventiva Bomba KSB")
                .scheduledFor(OffsetDateTime.now().plusDays(2))
                .priority(InspectionPriority.HIGH)
                .status(InspectionStatus.ASSIGNED)
                .version(1)
                .build());

        snapshotRepository.save(InspectionItemSnapshot.builder()
                .inspection(insp1)
                .sectionTitle("Inspeção Visual e Segurança")
                .sectionOrder(0)
                .itemTitle("Equipamento desobstruído e limpo?")
                .responseType(ResponseType.CONFORMITY)
                .required(true)
                .itemOrder(0)
                .build());

        snapshotRepository.save(InspectionItemSnapshot.builder()
                .inspection(insp1)
                .sectionTitle("Inspeção Visual e Segurança")
                .sectionOrder(0)
                .itemTitle("Presença de ruídos ou vibrações fora do padrão?")
                .responseType(ResponseType.CONFORMITY)
                .required(true)
                .itemOrder(1)
                .build());

        snapshotRepository.save(InspectionItemSnapshot.builder()
                .inspection(insp1)
                .sectionTitle("Inspeção Visual e Segurança")
                .sectionOrder(0)
                .itemTitle("Vazamento de fluido no selo mecânico?")
                .responseType(ResponseType.CONFORMITY)
                .required(true)
                .itemOrder(2)
                .build());

        log.info("Base local H2 populada com sucesso!");
    }
}
