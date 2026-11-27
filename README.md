# FieldOps — Plataforma de Inspeção em Campo

[![Architecture](https://img.shields.io/badge/Architecture-Distributed%20Offline--First-blue.svg)](#2-arquitetura-da-solução)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](#)
[![Status](https://img.shields.io/badge/Status-In%20Development-orange.svg)](#)

---

## 1. Apresentação e Proposta de Valor

O **FieldOps** é uma plataforma digital integrada para planejamento, execução, acompanhamento e revisão de inspeções técnicas em campo.

### O Problema Operacional
Processos tradicionais de inspeção técnica baseados em formulários impressos (pranchetas de papel), planilhas isoladas, aplicativos de mensagens instantâneas e fotografias desvinculadas sofrem com:
- **Fragmentação e perda de dados:** evidências separadas dos relatórios e preenchimento incompleto de checklists;
- **Vulnerabilidade à conectividade:** paralisação do trabalho técnico em zonas industriais, rurais ou subsolos sem acesso à internet;
- **Falta de padronização e rastreabilidade:** ausência de um histórico imutável das respostas, revisões e não conformidades.

### A Solução FieldOps
O FieldOps substitui essa cadeia fragmentada por um ecossistema digital unificado com suporte nativo a operações ***offline-first***. O sistema garante a integridade dos dados coletados no dispositivo móvel do técnico, enfileira e sincroniza alterações de forma idempotente e oferece aos supervisores uma interface centralizada de gestão, auditoria e aprovação.

---

## 2. Arquitetura da Solução

O ecossistema FieldOps adota uma arquitetura distribuída e descentralizada, conectando quatro pilares fundamentais:

```text
┌─────────────────────────────────────────┐
│           Aplicativo Mobile             │
│        (Expo / React Native)            │
│  - Leitura de QR Code & Câmera Nativa   │
│  - Persistência Local (SQLite)          │
│  - Fila de Operações Outbox Pattern     │
└────────────────────┬────────────────────┘
                     │ HTTPS / JSON / Multipart
                     ▼
┌─────────────────────────────────────────┐
│                API REST                 │
│           (Java / Spring Boot)          │
│  - Autenticação JWT & Autorização       │
│  - Regras de Negócio (RN-001 a RN-090)  │
│  - Sincronização Idempotente            │
│  - Trilhas de Auditoria (AuditEvent)    │
└─────────┬──────────────────────┬────────┘
          │                      │
          ▼                      ▼
┌──────────────────┐    ┌──────────────────┐
│    PostgreSQL    │    │ Object Storage   │
│  (Base Central)  │    │  (Fotos / Mídia) │
└──────────────────┘    └──────────────────┘
          ▲
          │ HTTPS / JSON
┌─────────┴───────────────────────────────┐
│       Interface Administrativa Web      │
│          (React 19 / Vite 8 / TS)       │
│  - Gestão de Clientes, Locais e Ativos  │
│  - Construtor de Modelos Versionados    │
│  - Painel de Revisão (InspectionReview) │
└─────────────────────────────────────────┘
```

### Pilares da Solução:
1. **Aplicativo Mobile (Técnico de Campo):** Interface móvel focada em produtividade. Carrega checklists dinâmicos, captura fotografias, lê QR Codes de equipamentos e opera de forma 100% autônoma através de persistência local em SQLite.
2. **Interface Administrativa Web (Gestão e Supervisão):** Painel corporativo para cadastro de ativos, construção de modelos de inspeção versionados, agendamento de ordens de serviço e revisão rigorosa de não conformidades.
3. **API REST (Núcleo de Regras e Segurança):** Serviços backend em Spring Boot responsáveis por validar autorizações, processar lotes de sincronização idempotentes, gerar snapshots imutáveis e manter logs de auditoria.
4. **Infraestrutura de Dados & Armazenamento:** PostgreSQL como fonte oficial centralizada, SQLite para armazenamento relacional móvel e Object Storage (S3/MinIO) para preservação de mídias.

---

## 3. Fluxo do Ciclo de Vida da Inspeção

O fluxo operacional do FieldOps é modelado para assegurar total rastreabilidade desde a configuração até o encerramento da inspeção:

```text
  ┌────────────────────────────────────────────────────────┐
  │ 1. CONFIGURAÇÃO                                        │
  │    Supervisor cria modelo e publica versão imutável.   │
  └───────────────────────────┬────────────────────────────┘
                              │
                              ▼
  ┌────────────────────────────────────────────────────────┐
  │ 2. AGENDAMENTO COM SNAPSHOT                            │
  │    Agendamento gera InspectionItemSnapshot imutável    │
  │    com filtro encadeado: Cliente → Local → Equipamento.│
  └───────────────────────────┬────────────────────────────┘
                              │
                              ▼
  ┌────────────────────────────────────────────────────────┐
  │ 3. EXECUÇÃO MOBILE (OFFLINE-FIRST)                     │
  │    Técnico baixa inspeção, valida QR Code, preenche    │
  │    checklist e registra fotografias e não conformidades│
  └───────────────────────────┬────────────────────────────┘
                              │
                              ▼
  ┌────────────────────────────────────────────────────────┐
  │ 4. FILA OUTBOX (SQLITE)                                │
  │    Alterações geram operações ordenadas e com IDs      │
  │    idempotentes no banco local do dispositivo.         │
  └───────────────────────────┬────────────────────────────┘
                              │
                              ▼
  ┌────────────────────────────────────────────────────────┐
  │ 5. SINCRONIZAÇÃO                                       │
  │    Conexão restabelecida: envio em lote à API REST,    │
  │    processamento idempotente e avanço do cursor.       │
  └───────────────────────────┬────────────────────────────┘
                              │
                              ▼
  ┌────────────────────────────────────────────────────────┐
  │ 6. AUDITORIA E DECISÃO DO SUPERVISOR                   │
  │    Supervisor avalia respostas/mídias em Web Panel.    │
  │    Gera InspectionReview (Aprovada / Reprovada) e     │
  │    dispara registro imutável em AuditEvent.            │
  └────────────────────────────────────────────────────────┘
```

---

## 4. Stack Tecnológica Oficial

| Camada | Tecnologia | Descrição / Uso |
| --- | --- | --- |
| **Mobile** | **Expo / React Native** | Desenvolvimento móvel cross-platform (Android priorizado) |
| **Mobile State/DB** | **SQLite & SecureStore** | Persistência local offline e armazenamento seguro de tokens |
| **Web Admin** | **React 19 / Vite 8 + TS** | Interface administrativa web responsiva e reativa |
| **API Backend** | **Java 21 LTS / Spring Boot 3.3** | Framework backend para APIs REST, Spring Security (JWT), JPA/Hibernate |
| **Banco Principal** | **PostgreSQL 16** | Relacional central com suporte a JSONB e restrições de integridade |
| **Armazenamento** | **Object Storage (S3 / MinIO)** | Armazenamento dedicado para fotos e mídias das evidências |
| **DevOps & Infra** | **Docker & Docker Compose** | Padronização e orquestração dos ambientes de desenvolvimento |

---

## 5. Estrutura do Repositório (Monorepo)

```text
fieldops/
├── docs/                                        # Base de conhecimento técnica e de gestão organizada por domínio
│   ├── README.md                                # Índice Mestre da documentação com mapa por perfil
│   ├── produto/                                 # Visão, objetivos, personas, casos de uso e regras (01 a 09)
│   │   ├── 01_visao_geral.md
│   │   ├── 02_objetivos.md
│   │   ├── 03_problema.md
│   │   ├── 04_personas.md
│   │   ├── 05_perfis_de_usuario.md
│   │   ├── 06_casos_de_uso.md
│   │   ├── 07_fluxo_geral.md
│   │   ├── 08_funcionalidades.md
│   │   └── 09_regras_de_negocio.md              # Catálogo canônico consolidado (RN-001 a RN-090)
│   ├── arquitetura/                             # Engenharia, modelo de dados, API, mobile e web (10 a 14)
│   │   ├── 10_modelo_de_dados.md
│   │   ├── 11_arquitetura.md
│   │   ├── 12_api_rest.md
│   │   ├── 13_aplicativo_mobile.md
│   │   └── 14_interface_administrativa_web.md
│   ├── qualidade/                               # Backlog, roadmap, critérios BDD, DoD e avaliação (15 a 19)
│   │   ├── 15_backlog_do_produto.md
│   │   ├── 16_roadmap.md
│   │   ├── 17_criterios_aceite.md
│   │   ├── 18_definition_of_done.md
│   │   └── 19_criterios_de_avaliacao.md
│   ├── guias/                                   # Manuais práticos de deploy AWS e roteiro de apresentação
│   │   ├── deploy_aws_learner_lab.md
│   │   └── guia_apresentacao_e_status.md
│   └── gestao/                                  # Artefatos formais PMBOK / SENAI ADS (TAP, EAP, Riscos, Custos, etc.)
├── backend/                                     # Backend Java 21 / Spring Boot 3.3 REST API + Flyway
├── frontend/                                    # Painel Web Administrativo (React 19 / Vite 8)
├── fieldops-mobile/                             # Aplicativo Mobile Offline-First (Expo SDK 57 / React Native)
├── database/                                    # Scripts PostgreSQL 16 (schema.sql, seed.sql, erd.mmd, queries)
├── scripts/                                     # Verificação estática e testes de consistência do repositório
├── deploy_aws.sh                                # Script automatizado de deploy em instância AWS EC2 (Learner Lab)
├── docker-compose.yml                           # Orquestração Docker (PostgreSQL, Backend, Frontend Nginx e Adminer)
└── README.md                                    # Documentação principal da solução
```

---

## 6. Índice da Base de Conhecimento

Consulte o **[Índice Mestre da Documentação (`docs/README.md`)](docs/README.md)** ou acesse diretamente cada módulo:

### Guias Rápidos & Apresentação
* [Índice Mestre da Documentação](docs/README.md)
* [Guia Passo a Passo: Deploy no AWS Academy Learner Lab](docs/guias/deploy_aws_learner_lab.md)
* [Guia de Apresentação Final, Roteiro dos 12 Testes (100 Pontos) e Status](docs/guias/guia_apresentacao_e_status.md)

### Produto, Especificação & Regras de Negócio (`docs/produto/`)
* [01. Visão Geral](docs/produto/01_visao_geral.md)
* [02. Objetivos](docs/produto/02_objetivos.md)
* [03. Análise do Problema](docs/produto/03_problema.md)
* [04. Personas](docs/produto/04_personas.md)
* [05. Perfis de Usuário & Permissões](docs/produto/05_perfis_de_usuario.md)
* [06. Catálogo de Casos de Uso](docs/produto/06_casos_de_uso.md)
* [07. Fluxo Geral & Estados](docs/produto/07_fluxo_geral.md)
* [08. Matriz de Funcionalidades (P0/P1/P2)](docs/produto/08_funcionalidades.md)
* [09. Regras de Negócio Consolidadas (RN-001 a RN-090)](docs/produto/09_regras_de_negocio.md)

### Arquitetura & Engenharia (`docs/arquitetura/`)
* [10. Modelo de Dados (PostgreSQL 16, Snapshots & Outbox)](docs/arquitetura/10_modelo_de_dados.md)
* [11. Arquitetura da Solução](docs/arquitetura/11_arquitetura.md)
* [12. API REST (Contrato HTTP e Compatibilidade Mobile)](docs/arquitetura/12_api_rest.md)
* [13. Aplicativo Mobile (Expo / Offline-First)](docs/arquitetura/13_aplicativo_mobile.md)
* [14. Interface Administrativa Web (React 19 / Vite 8)](docs/arquitetura/14_interface_administrativa_web.md)

### Qualidade, Planejamento & Avaliação (`docs/qualidade/`)
* [15. Backlog do Produto (PBIs)](docs/qualidade/15_backlog_do_produto.md)
* [16. Roadmap & Sprints](docs/qualidade/16_roadmap.md)
* [17. Critérios de Aceitação (BDD)](docs/qualidade/17_criterios_aceite.md)
* [18. Definição de Pronto (DoD)](docs/qualidade/18_definition_of_done.md)
* [19. Critérios de Avaliação e Rubricas](docs/qualidade/19_criterios_de_avaliacao.md)

---

## 7. Guia de Inicialização Rápida (Execução Reproduzível — PBI-067 / Task #34)

O ecossistema FieldOps foi projetado para execução reproduzível imediata pelo avaliador, com passos documentados por aplicação.

### 🔑 Credenciais para Demonstração (Seed Inicial)

Senha padrão para todos os perfis: `123456`

| Papel | Nome | E-mail | Senha |
|---|---|---|---|
| **Administrador Geral** | Administrador do Sistema | `admin@fieldops.com` | `123456` |
| **Supervisor Operacional** | Roberto Silva | `supervisor@fieldops.com` | `123456` |
| **Técnico em Campo** | Carlos Lima | `tecnico@fieldops.com` | `123456` |

---

### Passo 1: Executar o Backend (API REST)

O backend possui suporte a execução imediata em memória (**H2**, sem dependência de banco de dados externo) ou com **PostgreSQL** via Docker Compose:

#### Opção A: Execução Imediata com H2 (Recomendada para Avaliação Rápida)
```bash
cd backend

# No Linux / macOS:
./mvnw spring-boot:run -Dspring-boot.run.profiles=local

# No Windows (PowerShell / CMD):
.\mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=local
```
*O perfil local popula automaticamente a base em memória com dados completos de clientes, equipamentos, modelos, inspeções em múltiplos estados e trilhas de auditoria (DevDataLoader).*

#### Opção B: Execução com PostgreSQL (Via Docker Compose)
```bash
# Na raiz do repositório:
docker compose up -d postgres

# Na pasta backend:
cd backend
./mvnw spring-boot:run   # (ou .\mvnw.cmd spring-boot:run no Windows)
```
*O Flyway executará automaticamente as migrações `V1__initial_schema.sql` e `V2__seed_data.sql`.*

---

### Passo 2: Executar o Painel Web Administrativo

```bash
cd frontend
npm install
npm run dev
```
👉 Acesse no navegador: **[http://localhost:5173](http://localhost:5173)**  
*(Ou se executando em ambiente de preview após `npm run build`: `http://localhost:4173`)*

---

### Passo 3: Executar o Aplicativo Mobile (Expo)

```bash
cd fieldops-mobile
npm install
npx expo start
```
*Abra no aplicativo **Expo Go** escaneando o QR Code pelo celular ou pressione `a` para emulador Android.*

---

## 📖 Documentação da API REST (OpenAPI 3 / Swagger UI — PBI-071)

Com o backend em execução, a documentação OpenAPI completa e interativa pode ser consultada em:

- **Swagger UI Interativo:** 👉 **[http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)**
- **Contrato OpenAPI JSON:** 👉 **[http://localhost:8080/v3/api-docs](http://localhost:8080/v3/api-docs)**

A especificação inclui autenticação Bearer JWT, esquemas DTO de requisição/resposta, tratamento padronizado de erros e o endpoint de trilha de auditoria:
- `GET /api/v1/inspections/{id}/history`: Linha do tempo completa de mudanças de estado com auditoria de quem, quando e ação (RN-086 / Task #51).

---

## 🕒 Histórico de Mudanças de Estado e Trilha de Auditoria (Task #51 / RN-086)

A plataforma provê rastreabilidade completa do ciclo de vida das inspeções:

1. **Origem dos Dados:** Registros imutáveis na tabela `audit_events` com duplo carimbo de data (`occurred_at` e `device_occurred_at`), identificação do usuário ator e ação executada.
2. **Visualização no Painel Web:**
   - **Menu Lateral → Histórico (`/history`):** Tela dedicada com listagem filtrável de inspeções e painel de detalhamento da linha do tempo (`InspectionTimeline`).
   - **Menu Lateral → Operações (`/operations`):** Ao abrir qualquer inspeção no drawer de detalhes, a seção de linha do tempo apresenta cada estágio registrado:
     - 🔵 **Criação da Inspeção** (quem criou, data/hora e ativo)
     - 🟣 **Atribuição do Técnico** (técnico encarregado)
     - 🟠 **Execução Iniciada** (check-in presencial validado via QR Code)
     - 🔷 **Respostas Enviadas** (submissão do checklist com ou sem não conformidades)
     - 🟣 **Revisão Técnica Iniciada** (supervisor responsável)
     - 🟢 **Inspeção Aprovada** / 🔴 **Inspeção Reprovada** (parecer e justificativa formal registrada)

---

## 📊 Dados de Demonstração e Execução Reproduzível (Task #34 / PBI-066)

O projeto inclui um dataset completo e realista pronto para validação de ponta a ponta:

- **3 Grandes Clientes Industriais:** Petrobras S.A., Vale S.A., Klabin Papel e Celulose.
- **5 Locais / Plantas:** Refinaria RPBC, Refinaria Central, Terminal Portuário de Tubarão, Complexo Carajás, Fábrica Monte Alegre.
- **5 Equipamentos Industriais com QR Code:** Bomba Centrífuga KSB 01 (`QR-KSB-01`), Painel Elétrico CCM-02 (`QR-CCM-02`), Caldeira de Alta Pressão 03 (`QR-CALD-03`), Compressor Principal (`QR-COMP-01`), Válvula de Pressão B (`QR-VALV-02-CENTRAL`).
- **Checklists Especializados:** Modelos dinâmicos com seções e perguntas de conformidade, booleano e valor numérico.
- **5 Inspeções em Todos os Estágios do Ciclo de Vida:**
  - `INS-8001`: **Em Andamento (IN_PROGRESS)** com respostas parciais.
  - `INS-8002`: **Agendada (ASSIGNED)** pronta para despacho.
  - `INS-8003`: **Em Revisão (SUBMITTED)** com 1 Não Conformidade aberta (sobreaquecimento térmico).
  - `INS-8004`: **Aprovada (APPROVED)** com homologação formal do supervisor.
  - `INS-8005`: **Reprovada (REJECTED)** com justificativa de ausência de foto de folga mecânica.

---

## ⚠️ Limitações Conhecidas Registradas (PBI-066 / Task #34)

Em conformidade com as boas práticas de Engenharia de Software e o escopo do MVP acadêmico, as seguintes limitações e decisões arquiteturais estão registradas:

1. **Organização e Escopo Multi-tenancy:** O sistema opera com isolamento relacional padrão focado na organização matriz para a demonstração do MVP acadêmico. Criação dinâmica de novas organizações isoladas em tempo de execução está prevista para o ciclo comercial pós-MVP.
2. **Armazenamento de Fotos e Mídias:** Em ambiente de desenvolvimento local, evidências fotográficas utilizam identificadores e metadados na base relacional e cache local do dispositivo; em ambiente de homologação/nuvem, o backend integra-se via driver S3/MinIO.
3. **Resolução de Conflitos Offline:** Adotada a política orientada a eventos *Last-Write-Wins* combinada com duplo carimbo de data (`device_occurred_at` no celular e `server_received_at` na API) e chaves UUID geradas no dispositivo móvel para assegurar idempotência estrita no processamento da fila Outbox (RN-068 e RN-074).
4. **Homologação Mobile:** O aplicativo React Native/Expo foi testado e homologado prioritariamente em dispositivos Android (físicos e emuladores). No iOS via Expo Go, recursos nativos dependem da concessão manual de permissões de câmera e localização no sistema operacional.

---

## 8. Equipe e Governança

O desenvolvimento do FieldOps segue práticas ágeis de Engenharia de Software com papéis bem definidos:

| Integrante | Papel de Foco Principal | Responsabilidades |
|---|---|---|
| **Pedro** | **Backend / API REST & Regras de Negócio** | Construção da API REST Spring Boot (Java 21), serviços de autenticação JWT, lógica de negócio, idempotência, segurança RBAC e endpoints de revisão |
| **Murilo** | **Repositório, Governança & DevOps** | Gestão do repositório GitHub, controle de branches, padronização de commits, pipeline CI/CD e suporte a integração |
| **Matheus** | **Frontend Web (Interface do Supervisor)** | Telas administrativas no React/Vite, Dashboard operacional, construtor visual de checklists e tela de revisão de inspeções |
| **Juan** | **Banco de Dados (PostgreSQL & Modelagem)** | Criação e manutenção do schema relacional, scripts de seed, migrações Flyway e integridade referencial dos dados |
| **Julio** | **Frontend & Mobile de Campo** | Desenvolvimento das telas e fluxos de navegação mobile no React Native/Expo, integração com câmera e formulários |
| **Gizela** | **Frontend & Mobile de Campo** | Interface com o usuário de campo, estilização de componentes, usabilidade e testes funcionais do aplicativo |

---

## 📚 9. Documentação Formal de Gestão de Projetos (SENAI ADS / PMBOK)

Todos os artefatos formais exigidos na disciplina de **Gestão de Projetos** ministrada pelo **Prof. Deivison Takatu** estão implementados e disponíveis no diretório [`docs/gestao/`](docs/gestao/README.md):

### 🎯 Avaliação 1 — Definição e Planejamento Inicial
- 📄 **[Termo de Abertura do Projeto (TAP)](docs/gestao/tap.md):** Contexto, justificativa, objetivos SMART, limites e marcos.
- 👥 **[Matriz de Partes Interessadas](docs/gestao/matriz_poder_interesse_stakeholders.md):** Rede de poder x interesse (Fábio Carvalho).
- 📢 **[Plano de Gerenciamento das Comunicações](docs/gestao/plano_de_comunicacao.md):** Matriz de comunicação (público, canal, frequência, responsável).
- 📐 **[Declaração de Escopo do Projeto](docs/gestao/declaracao_de_escopo.md):** Limites, exclusões e controle integrado de mudanças.
- 🌳 **[EAP e Dicionário da Estrutura Analítica](docs/gestao/eap_e_dicionario.md):** Decomposição em 6 pacotes de entregas e critérios formais.
- 📅 **[Cronograma do Projeto e Matriz RACI](docs/gestao/cronograma_e_recursos.md):** Gantt Mermaid, lista com predecessores e matriz RACI.

### 🏆 Avaliação 2 — Planejamento Complementar e Entrega Final
- 💰 **[Plano de Custos, Orçamento e EVM](docs/gestao/plano_de_custos_e_orcamento.md):** 1.080h técnicas, custos AWS, contingência e Valor Agregado.
- 🛡️ **[Plano de Gerenciamento da Qualidade](docs/gestao/plano_de_qualidade.md):** ISO/IEC 25010, DoR, DoD e gestão de não conformidades.
- ⚠️ **[Plano de Gerenciamento e Matriz de Riscos](docs/gestao/matriz_e_plano_de_riscos.md):** Severidade (Probabilidade x Impacto) e planos preventivos.
- 📊 **[Monitoramento, Controle e Encerramento](docs/gestao/monitoramento_controle_encerramento.md):** KPIs, processo de CCR e Termo de Encerramento (TEP).
- 📘 **[Relatório Final Consolidado de Gestão](docs/gestao/relatorio_final_consolidado_gestao.md):** Relatório completo nas 14 seções acadêmicas da disciplina.

### 🏭 Atividades Práticas e Apresentação
- 🏭 **[Resolução do Desafio MetalTech S.A. (Portfólio PMO)](docs/gestao/desafio_gestao_portfolio_metaltech.md):** Resolução integral do desafio de R$ 2,5M.
- 🖥️ **[Sprint Review Executiva Monocromática](docs/gestao/sprint_review_monocromatico.md):** Apresentação visual para projeção em sala.

---

## 🧪 Verificação Estática e Testes Unitários

Para validar a consistência do repositório (scripts shell, JSONs, paridade entre `database/` e migrations Flyway) e rodar a suíte de testes unitários do módulo core do frontend:

```bash
bash scripts/check_repo.sh
node --test scripts/__tests__/repoConsistency.test.mjs
npm --prefix frontend test
```

---

*Projeto desenvolvido no âmbito do SENAI como referência prática de Engenharia de Software e Gestão Integrada de Projetos.*


