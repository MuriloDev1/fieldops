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
│          (React / Angular / TS)         │
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
| **Web Admin** | **React / Angular + TS** | Interface administrativa web responsiva e reativa |
| **API Backend** | **Java 17+ / Spring Boot 3+** | Framework backend para APIs REST, Spring Security (JWT), JPA/Hibernate |
| **Banco Principal** | **PostgreSQL 15+** | Relacional central com suporte a JSONB e restrições de integridade |
| **Armazenamento** | **Object Storage (S3 / MinIO)** | Armazenamento dedicado para fotos e mídias das evidências |
| **DevOps & Infra** | **Docker & Docker Compose** | Padronização e orquestração dos ambientes de desenvolvimento |

---

## 5. Estrutura do Repositório (Monorepo)

```text
fieldops/
├── docs/                             # Base de conhecimento técnica modular em Markdown
│   ├── gestao/                       # TAP, EAP e relatórios de acompanhamento do projeto
│   ├── 01_visao_geral.md             # Visão geral do produto e componentes
│   ├── 02_objetivos.md               # Objetivos de negócio, técnicos e acadêmicos
│   ├── 03_problema.md                # Análise detalhada de dores e oportunidade
│   ├── 04_personas.md                # Perfis de uso (Carlos, Marina, Ana, Roberto)
│   ├── 05_perfis_de_usuario.md       # Matriz de permissões por perfil (ADMIN, SUPERVISOR, TECHNICIAN)
│   ├── 06_casos_de_uso.md            # Casos de uso de UC-01 a UC-20
│   ├── 07_fluxo_geral.md             # Estados de negócio e sincronização
│   ├── 08_funcionalidades.md         # Escopo detalhado (P0, P1, P2)
│   ├── 09_regras_de_negocio.md       # Regras RN-001 a RN-090
│   ├── 10_modelo_de_dados.md         # Modelo ER, entidades, SQLite e Outbox
│   ├── 11_arquitetura.md             # Visão arquitetural e padrões de infraestrutura
│   ├── 12_api_rest.md                # Contratos HTTP, payloads e endpoints REST
│   ├── 13_aplicativo_mobile.md       # Telas, rotas Expo Router e recursos nativos
│   ├── 14_interface_administrativa_web.md # Mapa de navegação e componentes Web
│   ├── 15_backlog_do_produto.md      # Épicos e PBIs priorizados
│   ├── 16_roadmap.md                 # Cronograma de 16 semanas e marcos M1 a M8
│   ├── 17_criterios_aceite.md        # Especificações BDD de aceitação
│   ├── 18_definition_of_done.md      # Definição de Pronto (DoD) por camada
│   └── 19_criterios_de_avaliacao.md  # Rubrica e critérios de avaliação do projeto
├── api/                              # Backend Java / Spring Boot REST API
├── web/                              # Painel Web Administrativo
├── fieldops-mobile/                  # Aplicativo Mobile Expo / React Native
├── database/                         # Scripts de banco de dados (schema.sql, seed.sql, queries)
├── docker-compose.yml                # Containers do banco PostgreSQL e infraestrutura local
└── README.md                         # Documentação principal da solução
```

---

## 6. Índice da Base de Conhecimento

A base de conhecimento do FieldOps foi estruturada de forma modular na pasta `/docs`:

### Gestão do Projeto
* [Documento de Abertura do Projeto (TAP)](file:///c:/Users/muril/OneDrive/Imagens/Documentos/Eu/SENAI/fieldops/docs/gestao/TAP.md)
* [01. Visão Geral](file:///c:/Users/muril/OneDrive/Imagens/Documentos/Eu/SENAI/fieldops/docs/01_visao_geral.md)
* [02. Objetivos](file:///c:/Users/muril/OneDrive/Imagens/Documentos/Eu/SENAI/fieldops/docs/02_objetivos.md)
* [03. Análise do Problema](file:///c:/Users/muril/OneDrive/Imagens/Documentos/Eu/SENAI/fieldops/docs/03_problema.md)
* [04. Personas](file:///c:/Users/muril/OneDrive/Imagens/Documentos/Eu/SENAI/fieldops/docs/04_personas.md)
* [15. Backlog do Produto (PBIs)](file:///c:/Users/muril/OneDrive/Imagens/Documentos/Eu/SENAI/fieldops/docs/15_backlog_do_produto.md)
* [16. Roadmap & Sprints](file:///c:/Users/muril/OneDrive/Imagens/Documentos/Eu/SENAI/fieldops/docs/16_roadmap.md)
* [19. Critérios de Avaliação](file:///c:/Users/muril/OneDrive/Imagens/Documentos/Eu/SENAI/fieldops/docs/19_criterios_de_avaliacao.md)

### Especificação & Regras de Negócio
* [05. Perfis de Usuário & Permissões](file:///c:/Users/muril/OneDrive/Imagens/Documentos/Eu/SENAI/fieldops/docs/05_perfis_de_usuario.md)
* [06. Catálogo de Casos de Uso](file:///c:/Users/muril/OneDrive/Imagens/Documentos/Eu/SENAI/fieldops/docs/06_casos_de_uso.md)
* [07. Fluxo Geral & Estados](file:///c:/Users/muril/OneDrive/Imagens/Documentos/Eu/SENAI/fieldops/docs/07_fluxo_geral.md)
* [08. Matriz de Funcionalidades (P0/P1/P2)](file:///c:/Users/muril/OneDrive/Imagens/Documentos/Eu/SENAI/fieldops/docs/08_funcionalidades.md)
* [09. Regras de Negócio (RN-001 a RN-090)](file:///c:/Users/muril/OneDrive/Imagens/Documentos/Eu/SENAI/fieldops/docs/09_regras_de_negocio.md)
* [17. Critérios de Aceitação (BDD)](file:///c:/Users/muril/OneDrive/Imagens/Documentos/Eu/SENAI/fieldops/docs/17_criterios_aceite.md)
* [18. Definição de Pronto (DoD)](file:///c:/Users/muril/OneDrive/Imagens/Documentos/Eu/SENAI/fieldops/docs/18_definition_of_done.md)

### Arquitetura & Engenharia
* [10. Modelo de Dados (PostgreSQL & SQLite Outbox)](file:///c:/Users/muril/OneDrive/Imagens/Documentos/Eu/SENAI/fieldops/docs/10_modelo_de_dados.md)
* [11. Arquitetura da Solução](file:///c:/Users/muril/OneDrive/Imagens/Documentos/Eu/SENAI/fieldops/docs/11_arquitetura.md)
* [12. API REST (Contrato HTTP)](file:///c:/Users/muril/OneDrive/Imagens/Documentos/Eu/SENAI/fieldops/docs/12_api_rest.md)
* [13. Aplicativo Mobile (Expo / SQLite)](file:///c:/Users/muril/OneDrive/Imagens/Documentos/Eu/SENAI/fieldops/docs/13_aplicativo_mobile.md)
* [14. Interface Administrativa Web](file:///c:/Users/muril/OneDrive/Imagens/Documentos/Eu/SENAI/fieldops/docs/14_interface_administrativa_web.md)

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
| **Murilo** | **Backend / Arquitetura & Integração** | Estruturação da API REST, segurança JWT, regras de idempotência e auditoria |
| **Gizela** | **Mobile (UX & Lógica de Inspeção)** | Telas de execução do checklist no Expo, formulários dinâmicos e captura de evidências |
| **Pedro** | **Frontend Web (Dashboard & Revisão)** | Telas do supervisor no React/Vite, gráficos analíticos, gestão de ativos e histórico |
| **Julio** | **Mobile (Recursos Nativos & Offline)** | Configuração do SQLite local, persistência da fila Outbox, leitor de QR Code e GPS |
| **Matheus** | **Banco de Dados & Backend** | Schema PostgreSQL, DDL, seeds de dados e endpoints de suporte aos cadastros |
| **Juan** | **QA, Testes & Documentação Acadêmica** | Critérios de aceitação BDD, relatórios de testes e documentação acadêmica do PI |

---

*Projeto desenvolvido no âmbito do SENAI como referência prática de Engenharia de Software e Arquitetura de Sistemas Distribuídos.*

