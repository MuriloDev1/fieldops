# 📅 Cronograma do Projeto e Matriz de Recursos (RACI) — FieldOps

---

## 📌 Identificação

| Campo | Informação |
|---|---|
| **Projeto** | FieldOps — Sistema Integrado de Gestão e Execução de Inspeções em Campo |
| **Docente Orientador** | Prof. Deivison Takatu |
| **Data de Elaboração** | 21/08/2026 |
| **Última Atualização** | 06/11/2026 |
| **Versão** | 2.0 (Alinhado aos Modelos 6.1 e Requisitos de Avaliação 1 e 2) |
| **Início Previsto** | 21/08/2026 |
| **Término Previsto** | 04/12/2026 |
| **Equipe e Papéis** | Pedro (Backend), Murilo (Repo/DevOps), Matheus (Web), Juan (DB), Julio & Gizela (Mobile) |

---

## 📊 Cronograma Visual (Gráfico de Gantt)

```mermaid
gantt
    title Cronograma Integrado de Desenvolvimento — FieldOps (2026)
    dateFormat  YYYY-MM-DD
    axisFormat  %d/%m

    section 1. Gestão e Iniciação
    Elaboração do TAP e Partes Interessadas       :done, a1, 2026-08-21, 14d
    Declaração de Escopo e EAP                   :done, a2, after a1, 14d
    Marco: Linha de Base Aprovada (Avaliação 1)   :milestone, m1, after a2, 0d

    section 2. Dados e Infraestrutura
    Modelagem Relacional e DER (PostgreSQL)      :done, a3, 2026-09-01, 14d
    Migrations DDL, Seeds e Docker Compose       :done, a4, after a3, 10d
    Configuração do Repositório e CI/CD          :done, a5, 2026-09-01, 10d

    section 3. Backend & API REST
    Módulo de Autenticação JWT e RBAC            :done, a6, after a4, 12d
    APIs de Equipamentos, QR Code e Templates     :done, a7, after a6, 14d
    Snapshots Imutáveis e Workflow de Vistorias  :done, a8, after a7, 14d
    Endpoints de Sincronização Offline em Lote   :active, a9, after a8, 12d

    section 4. Interface Web (Supervisor)
    Layout Base, Login e Dashboard               :done, a10, after a6, 14d
    Construtor Visual de Formulários e Templates :done, a11, after a7, 14d
    Módulo de Agendamento e Painel de Revisão    :active, a12, after a11, 14d

    section 5. Mobile (Técnico de Campo)
    Configuração React Native e Leitor QR Code   :done, a13, after a6, 14d
    Checklist de Inspeção e Captura de Fotos     :done, a14, after a13, 14d
    Cache Offline (SQLite) e Fila de Sync        :active, a15, after a14, 14d

    section 6. Homologação e Encerramento
    Testes Integrados de Ponta a Ponta           :a16, 2026-11-10, 10d
    Testes de Carga e Validação em Campo         :a17, after a16, 7d
    Marco: Entrega Final Consolidada (Avaliação 2):milestone, m2, 2026-11-28, 0d
    Apresentação Executiva à Banca               :a18, 2026-12-01, 4d
```

---

## 📋 Lista de Atividades e Rastreabilidade

| ID | Atividade | Início | Término | Duração | Responsável Primário | Dependência | Status |
|---|---|---|---|---:|---|---|---|
| **A01** | Elaboração do TAP e Partes Interessadas | 21/08 | 04/09 | 14 dias | Murilo & Pedro | — | 🔵 Concluída |
| **A02** | Declaração de Escopo, EAP e Dicionário | 05/09 | 19/09 | 14 dias | Pedro | A01 | 🔵 Concluída |
| **A03** | Modelagem Relacional e DER no PostgreSQL | 01/09 | 14/09 | 14 dias | Juan | A01 | 🔵 Concluída |
| **A04** | Criação de Migrations DDL, Seeds e Docker | 15/09 | 24/09 | 10 dias | Juan & Murilo | A03 | 🔵 Concluída |
| **A05** | Configuração do GitHub, Branch Protection e CI/CD | 01/09 | 10/09 | 10 dias | Murilo | A01 | 🔵 Concluída |
| **A06** | Autenticação Spring Security, JWT e RBAC | 25/09 | 06/10 | 12 dias | Pedro | A04 | 🔵 Concluída |
| **A07** | CRUD Equipamentos, Geração QR Code e Templates | 07/10 | 20/10 | 14 dias | Pedro | A06 | 🔵 Concluída |
| **A08** | Motor de Snapshots JSONB e Workflow de Inspeção | 21/10 | 03/11 | 14 dias | Pedro | A07 | 🔵 Concluída |
| **A09** | Endpoints de Sincronização Offline em Lote | 04/11 | 15/11 | 12 dias | Pedro | A08 | 🟡 Em andamento (85%) |
| **A10** | Frontend Web: Login, Autenticação e Dashboard | 07/10 | 20/10 | 14 dias | Matheus | A06 | 🔵 Concluída |
| **A11** | Frontend Web: Construtor Visual de Formulários | 21/10 | 03/11 | 14 dias | Matheus | A07, A10 | 🔵 Concluída |
| **A12** | Frontend Web: Agendamento e Painel de Revisão | 04/11 | 17/11 | 14 dias | Matheus | A08, A11 | 🟡 Em andamento (80%) |
| **A13** | Mobile: Shell React Native, Login e Leitor QR Code | 07/10 | 20/10 | 14 dias | Julio & Gizela | A06 | 🔵 Concluída |
| **A14** | Mobile: Interface de Checklist e Captura de Fotos | 21/10 | 03/11 | 14 dias | Julio & Gizela | A07, A13 | 🔵 Concluída |
| **A15** | Mobile: Persistência Local (SQLite) e Fila de Sync | 04/11 | 17/11 | 14 dias | Julio & Gizela | A09, A14 | 🟡 Em andamento (80%) |
| **A16** | Testes Integrados de Ponta a Ponta (E2E) | 10/11 | 20/11 | 10 dias | Equipe Completa | A09, A12, A15 | ⬜ Planejada |
| **A17** | Testes de Carga, Deploy AWS e Validação em Campo | 21/11 | 27/11 | 7 dias | Murilo & Pedro | A16 | ⬜ Planejada |
| **A18** | Relatório Final Consolidado e Apresentação Banca | 28/11 | 04/12 | 6 dias | Equipe Completa | A17 | ⬜ Planejada |

---

## 🔗 Matriz de Dependências Lógicas

As dependências técnicas do FieldOps garantem a consistência arquitetural:

| Atividade Sucessora | Atividade Antecessora (Predecessora) | Tipo de Relação | Justificativa Técnica |
|---|---|---|---|
| A04 (Migrations e Docker) | A03 (Modelagem Relacional) | Término-Início (TI) | O script DDL só pode ser implementado após o modelo relacional estar normalizado. |
| A06 (Segurança e JWT) | A04 (Migrations e Docker) | Término-Início (TI) | A tabela de usuários e perfis precisa existir no banco para a autenticação funcionar. |
| A10, A13 (Web e Mobile Login) | A06 (Backend Auth JWT) | Término-Início (TI) | Os frontends precisam dos endpoints de autenticação e dos tokens JWT ativos. |
| A11, A14 (Construtor e Checklist) | A07 (APIs de Templates) | Término-Início (TI) | A interface web e mobile dependem dos contratos JSON de perguntas e respostas. |
| A15 (Mobile Sync) | A09 (Backend Sync Endpoint) | Término-Início (TI) | O descarregamento da fila local do mobile necessita do endpoint de lote pronto na API. |
| A16 (Testes E2E Integrados) | A09, A12, A15 | Término-Início (TI) | Os testes de ponta a ponta exigem os três módulos sincronizados e comunicando. |

---

## 🚩 Marcos do Projeto (Milestones)

| Marco | Data Prevista | Critério de Aceitação / Evidência |
|---|---|---|
| 🚀 **M1: Kick-off e Linha de Base Aprovada** | 19/09/2026 | TAP assinado, EAP validada e escopo acordado com o orientador (Avaliação 1). |
| 🗄️ **M2: Fundação de Dados e Auth Operacional** | 06/10/2026 | Docker subindo banco PostgreSQL e autenticação JWT funcionando no Postman. |
| 📋 **M3: Núcleo de Vistorias e Construtor Pronto** | 03/11/2026 | Supervisor cria modelo na Web e API congela snapshot de perguntas sem falhas. |
| 📱 **M4: Mobile Operando 100% Offline com Fotos** | 17/11/2026 | Técnico preenche checklist e anexa fotos sem rede, mantendo dados intactos no SQLite. |
| 🌐 **M5: Integração Completa e Deploy em Nuvem** | 27/11/2026 | Teste de ponta a ponta finalizado com sincronização em lote e deploy ativo. |
| 🎓 **M6: Apresentação Final e Defesa à Banca** | 04/12/2026 | Relatório técnico final homologado e apresentação executiva concluída (Avaliação 2). |

---

## 👥 Matriz RACI de Responsabilidades

A matriz RACI estabelece a governança e o papel de cada integrante:
- **R (Responsible):** Quem executa a tarefa diretamente.
- **A (Accountable):** Quem responde pelo resultado e tem autoridade final de aprovação.
- **C (Consulted):** Quem é consultado antes de decisões técnicas relevantes.
- **I (Informed):** Quem é informado sobre o andamento e conclusão da entrega.

| Pacote de Trabalho / Entrega | Pedro (Backend) | Murilo (DevOps/Repo) | Matheus (Web) | Juan (Banco) | Julio & Gizela (Mobile) |
|---|:---:|:---:|:---:|:---:|:---:|
| **1.0 Gestão do Projeto e Documentação** | C | **A / R** | I | C | I |
| **2.1 Modelagem e Normalização do Banco** | C | I | I | **A / R** | I |
| **2.2 Migrations, Seeds e Docker** | C | **A** | I | **R** | I |
| **3.1 Autenticação JWT e RBAC** | **A / R** | C | C | C | C |
| **3.2 CRUD Equipamentos e QR Code (API)** | **A / R** | I | C | C | C |
| **3.3 Snapshots JSONB e Vistorias (API)** | **A / R** | I | C | C | C |
| **3.4 Sincronização Offline em Lote (API)** | **A / R** | I | I | C | **C** |
| **4.1 Dashboard Executivo Web** | I | I | **A / R** | I | I |
| **4.2 Construtor Visual de Formulários Web** | C | I | **A / R** | I | I |
| **4.3 Painel de Revisão e Auditoria Web** | C | I | **A / R** | I | I |
| **5.1 Shell Mobile e Leitor QR Code** | I | I | I | I | **A / R** |
| **5.2 Checklist Dinâmico e Captura Fotos** | C | I | I | I | **A / R** |
| **5.3 SQLite Local e Fila Offline** | C | I | I | I | **A / R** |
| **6.1 Pipeline CI/CD e Governança GitHub** | C | **A / R** | I | I | I |
| **6.2 Testes Integrados e Carga em Campo** | **R** | **R** | **R** | **R** | **R** |
| **6.3 Apresentação Executiva e Defesa** | **R** | **R** | **R** | **R** | **R** |

---

## 💻 Recursos do Projeto

### 1. Recursos Humanos:
- **Pedro:** Especialista em Arquitetura Backend, Spring Boot 3, Java 17, Spring Security e APIs REST.
- **Murilo:** Especialista em Repositórios, Versionamento Git, CI/CD, Docker e Governança DevOps.
- **Matheus:** Especialista em Frontend Web, React, Vite, TailwindCSS e Interfaces Reativas.
- **Juan:** Especialista em Banco de Dados Relacional, PostgreSQL 15, Modelagem DDL/DML e Otimização.
- **Julio e Gizela:** Especialistas em Desenvolvimento Mobile, React Native, Expo, SQLite e Experiência do Usuário (UX/UI).

### 2. Recursos Materiais e Físicos:
- Estações de trabalho (computadores dos desenvolvedores).
- Smartphones Android e iOS para testes de hardware (câmera, leitor QR Code, GPS, modo avião/offline).
- Etiquetas físicas impressas com QR Code para testes reais de bancada.

### 3. Recursos Tecnológicos e de Software:
- Ambientes de Desenvolvimento: VS Code, IntelliJ IDEA Community, DBeaver, Postman / Insomnia.
- Plataformas Cloud / Infra: GitHub, Docker Hub, AWS (EC2/RDS/S3).
- Ferramentas de Gestão: GitHub Projects (Kanban), Discord e Google Workspace.

---

## 📊 Acompanhamento do Cronograma (Status Atual)

| ID | Pacote | % Planejado | % Realizado | Situação | Análise de Desvio |
|---|---|---:|---:|:---:|---|
| A01-A08 | Iniciação, Banco, Auth e Core Backend | 100% | 100% | 🟢 No Prazo | Finalizados com sucesso e testados. |
| A10-A11 | Web Base e Construtor de Modelos | 100% | 100% | 🟢 No Prazo | Totalmente operacionais. |
| A13-A14 | Mobile Base e Checklist de Inspeção | 100% | 100% | 🟢 No Prazo | Câmera e layout fluído funcionando. |
| A09 | API de Sincronização em Lote | 80% | 85% | 🟢 No Prazo | Endpoints criados, refinando tratamento de conflitos. |
| A12 | Web Agendamento e Revisão | 80% | 80% | 🟢 No Prazo | Tela de revisão integrada com visualização de evidências. |
| A15 | Mobile Offline (SQLite e Sync Queue) | 80% | 80% | 🟢 No Prazo | Persistência local implementada, integrando com A09. |
| A16-A18 | Testes Finais, Deploy e Defesa | 0% | 0% | ⬜ Aguardando | Programados conforme linha de base. |

---

## ⚠️ Registro de Riscos de Prazo e Ações Corretivas

| Atividade | Incerteza / Risco de Prazo | Impacto | Ação Preventiva / Contingencial Adotada |
|---|---|---|---|
| A15 (Sync) | Dificuldade com payloads pesados de fotos em conexões lentas 3G | Atraso no tempo de upload | Implementação de compressão JPEG nativa no mobile antes do envio e uploads multipart fragmentados. |
| A17 (Deploy) | Complexidade de configuração na AWS | Atraso no deploy de homologação | Murilo preparou imagem Docker Compose idêntica para contingência local ou VPS simples. |

---

## ✅ Checklist do Cronograma (Modelo 6.1 do Professor)

- [x] Todas as atividades do projeto foram identificadas com código unívoco (A01 a A18)
- [x] As atividades possuem responsáveis técnicos primários alinhados com suas atribuições reais
- [x] As datas de início e término foram fixadas ao longo do semestre letivo
- [x] As durações em dias corridos foram estimadas com critérios técnicos
- [x] A sequência e dependências lógicas (Término-Início) foram formalizadas
- [x] Os marcos de entrega (M1 a M6) foram destacados com critérios de aceitação
- [x] A Matriz RACI foi detalhada integrando os 6 componentes da EAP
- [x] O acompanhamento percentual (Planejado vs. Realizado) está devidamente mapeado
