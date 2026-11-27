# 11. Arquitetura da Solução

## 11.1 Visão arquitetural

O **FieldOps** adota uma arquitetura distribuída, desacoplada e orientada a resiliência (**Offline-First / Local-First**), composta por aplicações independentes que compartilham um contrato REST padronizado e documentado via OpenAPI 3 / Swagger.

```text
┌─────────────────────────────────────────────────────────┐
│             Aplicativo Mobile (Técnico)                 │
│             Expo SDK 57 + React Native 0.86             │
│   AsyncStorage (Rascunho/Outbox) + SecureStore + Camera │
└────────────────────────────┬────────────────────────────┘
                             │ HTTPS / JSON / Base64
                             ▼
┌─────────────────────────────────────────────────────────┐
│                  API REST (Core Engine)                 │
│              Java 21 LTS + Spring Boot 3.3.4            │
│        Spring Security (JWT/RBAC) + JPA + Flyway        │
└─────────────────┬─────────────────────────┬─────────────┘
                  │                         │
                  ▼                         ▼
┌───────────────────────────┐   ┌─────────────────────────┐
│   PostgreSQL 16 (Central) │   │ Evidências (JSONB / S3) │
│   (Dados, Snapshots,      │   │ (Fotos Base64, SVG e    │
│    Revisões, AuditEvent)  │   │  Metadados de Mídia)    │
└───────────────────────────┘   └─────────────────────────┘
                  ▲
                  │ HTTPS / JSON (JWT Bearer)
┌─────────────────┴───────────────────────────────────────┐
│        Interface Administrativa Web (Supervisor)        │
│        React 19 + Vite 8 + React Router 7 + Axios       │
└─────────────────────────────────────────────────────────┘
```

---

## 11.2 Princípios arquiteturais

- **Separação clara de responsabilidades** entre apresentação (Web e Mobile), aplicação/serviços, domínio e persistência.
- **API REST como ponto central** de regras de negócio (`RN-001` a `RN-090`), autenticação JWT e autorização RBAC.
- **Resiliência Local-First (Offline-First):** persistência local imediata no dispositivo móvel como parte intrínseca da arquitetura, garantindo zero perda de dados em zonas industriais sem internet (`RN-065`, `RN-066`).
- **Sincronização Idempotente:** operações identificadas e reconciliadas sem duplicação de inspeções ou respostas (`RN-067`, `RN-068`).
- **Imutabilidade Histórica:** modelos de inspeção versionados (`InspectionTemplateVersion`) e geração de snapshots imutáveis por inspeção (`InspectionItemSnapshot`, `RN-021`).
- **Rastreabilidade Completa:** duplo carimbo de data/hora (`device_occurred_at` vs. `server_received_at`, `RN-042`, `RN-074`) e trilha de auditoria imutável (`AuditEvent`, `RN-086`).
- **Tratamento global e padronizado de erros** sem exposição de stack traces ou credenciais em logs (`RN-007`).
- **Conteinerização e Reprodutibilidade:** orquestração completa via Docker Compose (PostgreSQL 16, Backend Spring Boot, Frontend React/Nginx e Adminer) pronta para execução local ou em nuvem (AWS EC2).

---

## 11.3 Contextos funcionais do domínio

| Contexto | Responsabilidade Principal |
| :--- | :--- |
| **Identidade e Acesso** | Usuários, perfis (`ADMIN`, `SUPERVISOR`, `TECHNICIAN`, `CLIENT_VIEWER`), login JWT, refresh token e controle de acesso RBAC. |
| **Cadastros Operacionais** | Gestão de empresas contratantes (`Client`), plantas/locais (`InspectionSite`) e ativos físicos com etiqueta QR Code (`Equipment`). |
| **Modelos de Inspeção** | Criação de templates (`InspectionTemplate`), publicação de versões imutáveis (`InspectionTemplateVersion`), seções (`TemplateSection`) e itens dinâmicos (`TemplateItem`). |
| **Planejamento e Despacho** | Agendamento de inspeções (`Inspection`), vínculo encadeado Cliente → Local → Equipamento → Técnico e congelamento do snapshot (`InspectionItemSnapshot`). |
| **Execução de Campo** | Check-in via leitura de QR Code, preenchimento dinâmico do checklist, captura de fotos e assinatura digital, registro de não conformidades (`NonConformity`) e conclusão. |
| **Sincronização Offline** | Persistência local de rascunhos em andamento, fila Outbox de pendências e envio/recebimento idempotente sem duplicação. |
| **Revisão e Homologação** | Análise detalhada pelo supervisor, aprovação formal ou reprovação motivada (`InspectionReview`) e atualização automática do status do ativo. |
| **Auditoria e Indicadores** | Trilha cronológica de eventos (`AuditEvent`) e agregação de KPIs gerenciais no Dashboard. |

---

## 11.4 Arquitetura do Aplicativo Mobile (`fieldops-mobile/`)

### Estrutura implementada

```text
fieldops-mobile/
├── App.tsx                           # Núcleo da aplicação mobile, abas, checklist, câmera QR, assinatura SVG e motor offline
├── index.ts                          # Entry point Expo
├── app.json                          # Configuração Expo SDK 57, permissões Android (CAMERA, STORAGE) e plugins
├── eas.json                          # Perfis de build nativo Android (.apk standalone)
├── package.json                      # Dependências React Native 0.86, Expo 57, AsyncStorage, NetInfo, SecureStore, Axios
└── src/
    ├── services/
    │   ├── api.ts                    # Cliente HTTP Axios tipado, interceptores Bearer JWT, fila de refresh e updateApiBaseUrl
    │   ├── authService.ts            # Serviço de login, sessão e sanitização de credenciais (RN-001, RN-007)
    │   └── tokenStorage.ts           # Persistência criptografada de tokens em expo-secure-store (com fallback web)
    └── types/
        └── api.ts                    # Contratos TypeScript estritos (Inspection, Equipment, AuthUser, SubmitInspectionAnswersRequest)
```

### Decisões técnicas do Mobile
- **Persistência Offline Resiliente (`AsyncStorage`):** Utiliza chaves dedicadas para o rascunho ativo (`@fieldops/rascunho-em-andamento`), fila de inspeções concluídas offline (`@fieldops/inspecoes-pendentes-offline`) e caches locais de agenda, equipamentos e modelos. Sobrevive ao fechamento forçado do app no gerenciador de tarefas do Android (`RN-066`).
- **Armazenamento Seguro de Sessão (`expo-secure-store`):** Tokens JWT e dados sensíveis são guardados de forma segura por `tokenStorage.ts`.
- **Recursos Nativos Integrados:**
  - Leitura de QR Code via `CameraView` (`expo-camera`) com validação contra o equipamento da inspeção e opção manual para emulador (`RN-059`, `RN-064`).
  - Captura de fotos via câmera nativa ou galeria (`expo-image-picker`) serializadas em Base64 para integridade offline.
  - Componente `SignaturePad` em SVG puro (`react-native-svg` + `PanResponder`), compatível com Android, iOS e Web sem dependência de WebView.
- **Configurador Dinâmico de Servidor AWS:** Permite apontar o APK instalado para o IP público efêmero da instância AWS EC2 (Learner Lab) diretamente na tela de login (`@fieldops/custom-api-url`), sem necessidade de recompilar o APK.

---

## 11.5 Arquitetura da Interface Administrativa Web (`frontend/`)

### Estrutura implementada (React 19 + Vite 8 + React Router 7)

```text
frontend/
├── Dockerfile                        # Build multi-stage (Node 20 Alpine -> Nginx Alpine na porta 80)
├── vite.config.js                    # Configuração Vite com @vitejs/plugin-react
├── package.json                      # React 19.2, React Router 7.18, Axios, Lucide React, Oxlint
└── src/
    ├── App.jsx                       # Roteamento principal protegido por AuthGuard e ErrorBoundary
    ├── main.jsx                      # Ponto de montagem React 19
    ├── core/
    │   ├── components/
    │   │   └── ErrorBoundary.jsx     # Captura global de erros de renderização
    │   ├── context/
    │   │   ├── AuthContext.jsx       # Estado global de sessão, login, logout e fallback demo
    │   │   └── ToastContext.jsx      # Feedback visual padronizado de ações e erros
    │   ├── guards/
    │   │   └── AuthGuard.jsx         # Proteção de rotas autenticadas e controle por perfil
    │   ├── utils/                    # Utilitários puros testados unitariamente (formatters, status, text, validators)
    │   ├── permissions.js            # Matriz de permissões de navegação por role
    │   └── roleAccess.js             # Regras de autorização visual e redirecionamento inicial
    ├── pages/                        # Telas modulares da aplicação
    │   ├── LoginPage.jsx
    │   ├── DashboardPage.jsx
    │   ├── ClientsPage.jsx
    │   ├── LocationsPage.jsx
    │   ├── EquipmentPage.jsx
    │   ├── TemplatesPage.jsx
    │   ├── OperationsPage.jsx        # Despacho, drawer de revisão e timeline integrada
    │   ├── InspectionListPage.jsx
    │   ├── MyInspectionsPage.jsx
    │   ├── InspectionWorkflowPage.jsx
    │   ├── ServiceOrdersPage.jsx
    │   ├── NonConformitiesPage.jsx
    │   ├── HistoryPage.jsx           # Linha do tempo completa de auditoria (RN-086)
    │   ├── TeamManagementPage.jsx
    │   ├── TechniciansPage.jsx
    │   ├── AnalyticsPage.jsx
    │   ├── ReportsPage.jsx
    │   ├── SettingsPage.jsx
    │   ├── ProfilePage.jsx
    │   └── NotFoundPage.jsx
    ├── services/
    │   ├── api.ts                    # Cliente Axios tipado com interceptores JWT e refresh automático
    │   └── authService.ts            # Integração de autenticação com /api/v1/auth/*
    ├── shared/components/            # Design System (Layout, Sidebar, Topbar, DataTable, ModalDrawer, InspectionTimeline, StatCard, StatusBadge)
    ├── types/
    │   └── api.ts                    # Contratos TypeScript compartilhados
    └── data/
        └── mockData.js               # Dataset de contingência sincronizado com o seed do banco
```

---

## 11.6 Arquitetura da API REST Spring Boot (`backend/`)

### Estrutura implementada (Java 21 + Spring Boot 3.3.4)

```text
backend/src/main/
├── java/com/fieldops/
│   ├── FieldOpsApplication.java      # Bootstrap da aplicação Spring Boot
│   ├── config/
│   │   ├── CorsConfig.java           # Liberação controlada de CORS para Web e Mobile
│   │   ├── DevDataLoader.java        # Carga automática de dados para perfil in-memory H2 (local)
│   │   ├── OpenApiConfig.java        # Configuração do Swagger UI e esquema Bearer JWT
│   │   └── SecurityConfig.java       # Filtro JWT stateless e regras de autorização HTTP
│   ├── security/
│   │   ├── JwtAuthenticationFilter.java
│   │   └── JwtService.java           # Geração e validação HMAC-SHA256 de tokens JWT
│   ├── controller/
│   │   ├── AuthController.java
│   │   ├── UserController.java
│   │   ├── ClientController.java
│   │   ├── SiteController.java
│   │   ├── EquipmentController.java
│   │   ├── InspectionTemplateController.java
│   │   ├── InspectionController.java
│   │   ├── ReviewController.java
│   │   ├── NonConformityController.java
│   │   ├── DashboardController.java
│   │   ├── MobileSyncController.java
│   │   └── MobileCompatibilityController.java # Rotas diretas de compatibilidade com o app mobile e /health
│   ├── service/                      # Regras de negócio, geração de snapshots, ciclo de revisão e auditoria
│   ├── repository/                   # Interfaces Spring Data JPA
│   ├── domain/
│   │   ├── entity/                   # 15 entidades JPA mapeadas para o PostgreSQL
│   │   └── enums/                    # Enums de domínio (InspectionStatus, UserRole, ConformityStatus, Severity, etc.)
│   ├── dto/                          # Contratos de entrada/saída desacoplados das entidades JPA
│   └── common/exception/             # GlobalExceptionHandler e ErrorResponse padronizado
└── resources/
    ├── application.yml               # Perfil padrão PostgreSQL + Flyway
    ├── application-local.yml         # Perfil local H2 em memória
    └── db/migration/
        ├── V1__initial_schema.sql    # DDL de 15 tabelas idêntico a database/schema.sql
        └── V2__seed_data.sql         # Seed oficial idêntico a database/seed.sql
```

---

## 11.7 Persistência Central e Armazenamento de Evidências

1. **Banco de Dados Central (PostgreSQL 16):**
   - Gerenciado por migrações versionadas do **Flyway** (`V1__initial_schema.sql` e `V2__seed_data.sql`) sincronizadas com `database/schema.sql` e `database/seed.sql` (paridade verificada automaticamente por `scripts/__tests__/repoConsistency.test.mjs`).
   - Uso de `UUID` como chave primária em todas as entidades.
   - Colunas `JSONB` (`options_json`, `rules_json`, `value_json`, `previous_value_json`, `new_value_json`, `metadata_json`) para armazenar opções dinâmicas, payloads de fotos/assinaturas e metadados de auditoria com serialização segura via Jackson `ObjectMapper`.
   - Controle de concorrência otimista por coluna `version` e integridade referencial com `ON DELETE RESTRICT` para entidades históricas.
2. **Armazenamento de Evidências:**
   - Metadados estruturados na tabela `evidences` e payloads de foto (`photoUrl` em Base64) e assinatura (`signatureUrl` em SVG data URI) serializados em `inspection_responses.value_json`, garantindo funcionamento 100% autocontido em instâncias AWS Learner Lab sem dependência obrigatória de bucket externo, mantendo suporte arquitetural a driver S3/MinIO (`docker-compose.yml`).

---

## 11.8 Estratégia Offline-First, Fila Outbox e Idempotência

```text
+-----------------------+    Gravação Imediata   +---------------------------+
| Ação do Técnico       | ---------------------> | Armazenamento Local       |
| (Responde / Fotografa)|                        | (Rascunho + Fila Outbox)  |
+-----------------------+                        +-------------+-------------+
                                                               |
                                                               | Reconexão / Sync
                                                               ▼
+-----------------------+   Envio s/ Duplicação  +---------------------------+
| API REST Spring Boot  | <--------------------- | Motor de Sincronização    |
| (PostgreSQL 16)       |   (UUID Idempotente)   | (FIFO / No-Dup Sync)      |
+-----------------------+                        +---------------------------+
```

### Mecanismo de Persistência e Sincronização
1. **Gravação Local Instantânea (`RN-066`):** A cada alteração de resposta, observação, foto ou assinatura no checklist, o aplicativo grava o estado completo no armazenamento local (`@fieldops/rascunho-em-andamento`). Se o processo do app for encerrado ou o dispositivo reiniciar sem internet, o rascunho é restaurado integralmente ao reabrir.
2. **Conclusão Offline e Fila Outbox (`RN-067`):** Ao concluir uma inspeção sem conectividade, a inspeção validada é movida para a fila local de pendências (`@fieldops/inspecoes-pendentes-offline`), bloqueando edições comuns (`RN-043`) e incrementando o contador visual no topo do app (`RN-071`).
3. **Sincronização Idempotente sem Duplicação (`RN-068`):**
   - Quando a conexão é restabelecida (detectada via `NetInfo` ou acionada manualmente pelo botão **Sync**), o motor de sincronização processa a fila em ordem cronológica (`RN-069`).
   - Para inspeções previamente agendadas no servidor, o app reutiliza o `UUID` oficial da inspeção, enviando apenas as respostas (`POST /inspections/{id}/answers`) e a transição de conclusão (`PATCH /inspections/{id}/complete`), impedindo a criação de registros duplicados em caso de reenvio.
   - O endpoint de lote `POST /api/v1/mobile/sync/push` processa operações identificadas por `operationId` (UUIDv4), retornando status `APPLIED` e avançando o cursor (`nextCursor`).
4. **Isolamento de Erros (`RN-070`):** Se uma operação falhar por oscilação de rede, ela permanece retida na fila local para nova tentativa sem descartar as demais operações já confirmadas.

---

## 11.9 Máquina de Estados da Inspeção e Snapshots Imutáveis

### Máquina de Estados Protegida (`RN-024`, `RN-089`)

```text
     [ ASSIGNED / Agendada ] (Disponível no Mobile após Sincronização)
                │
                ▼ (Check-in presencial / Leitura QR Code - RN-034, RN-064)
     [ IN_PROGRESS / Em Execução ]
                │
                ▼ (Validação de Itens Obrigatórios e Evidências - RN-037, RN-038, RN-039)
     [ Concluída no Dispositivo ] (Bloqueada localmente - RN-043)
                │
                ▼ (Sincronização confirmada - RN-042, RN-074)
     [ SUBMITTED / UNDER_REVIEW ] (Disponível no Painel Web do Supervisor)
            ╱               ╲
           ╱                 ╲ (Supervisor Reprova c/ motivo - RN-080)
          ╱                   ▼
         ╱            [ REJECTED / Reprovada ] (Equipamento -> MAINTENANCE; libera correção - RN-083)
        │
        ▼ (Supervisor Aprova - RN-081)
[ APPROVED / Aprovada ] (Equipamento -> ACTIVE; bloqueio permanente de edição - RN-082)
```

### Snapshots Imutáveis (`RN-021`)
Modelos de checklist sofrem evoluções constantes. Para impedir que a edição de um modelo na Web altere retroativamente laudos históricos:
- No agendamento da inspeção vinculada a uma versão publicada (`InspectionTemplateVersion`), o `InspectionService` copia todas as seções e perguntas para a tabela `inspection_item_snapshots`.
- Todas as respostas (`inspection_responses`) e não conformidades (`non_conformities`) apontam diretamente para o `inspection_item_snapshots.id`, garantindo independência total de versões futuras do template.

---

## 11.10 Segurança, Observabilidade e Ambientes

### Segurança
- **Autenticação Stateless:** Token Bearer JWT assinado com HMAC-SHA256 (`JwtService`), com suporte a renovação (`/api/v1/auth/refresh`) e hash de senhas via **BCrypt**.
- **Autorização RBAC:** Validação de perfil nos endpoints e filtro de dados pelo usuário autenticado (`@AuthenticationPrincipal User`).
- **Sanitização Estrita (`RN-007`):** Interceptores HTTP no Web e Mobile e logs do backend nunca expõem cabeçalhos `Authorization`, tokens ou senhas.
- **Erros Padronizados (`RNF-002`):** `GlobalExceptionHandler` captura exceções de negócio (`BusinessException`, `ResourceNotFoundException`, `ConflictException`) e retorna JSON estruturado sem expor stack traces internos.

### Ambientes de Execução
| Ambiente | Banco de Dados | Como Executar | Finalidade |
| :--- | :--- | :--- | :--- |
| **Local Rápido (`local`)** | H2 In-Memory (modo PostgreSQL) + `DevDataLoader` | `./mvnw spring-boot:run -Dspring-boot.run.profiles=local` | Avaliação imediata sem necessidade de Docker. |
| **Local Docker** | PostgreSQL 16 (`:5433`) + Flyway | `docker compose up -d postgres` + `./mvnw spring-boot:run` | Desenvolvimento integrado com persistência real. |
| **Produção / AWS EC2** | PostgreSQL 16 + Backend (`:8080`) + Frontend Nginx (`:80`) + Adminer (`:8085`) | `bash deploy_aws.sh` (ou `docker compose up -d --build`) | Implantação completa em instância única no AWS Learner Lab. |

---

## 11.11 Requisitos Não Funcionais Arquiteturais

| ID | Requisito | Status na Arquitetura |
| :---: | :--- | :--- |
| **RNF-001** | A aplicação mobile deverá preservar dados pendentes após reinicialização. | Atendido via `AsyncStorage` (`@fieldops/rascunho-em-andamento` e fila offline). |
| **RNF-002** | A API deverá responder erros em formato padronizado. | Atendido via `GlobalExceptionHandler` e `ErrorResponse`. |
| **RNF-003** | Listagens administrativas deverão suportar filtragem e paginação. | Atendido via `DataTable.jsx` e filtros nos endpoints REST. |
| **RNF-004** | O aplicativo deverá apresentar estados de carregamento, vazio, erro e offline. | Atendido com indicadores `[ONLINE]`/`[OFFLINE]`, spinners e mensagens claras. |
| **RNF-005** | Operações de sincronização deverão ser idempotentes. | Atendido via reconciliação por UUID e `MobileSyncController`. |
| **RNF-006** | A interface mobile deverá ser utilizável em telas Android comuns. | Atendido e compilado em APK Android nativo via EAS Build. |
| **RNF-007** | A interface administrativa deverá ser responsiva para notebook e desktop. | Atendido via layout CSS modular responsivo no React 19. |
| **RNF-008** | O contrato da API deverá ser documentado. | Atendido via Springdoc OpenAPI 3 (`/swagger-ui.html` e `/v3/api-docs`). |
| **RNF-009** | O código deverá passar por análise de tipos e lint. | Atendido via TypeScript, Oxlint, Maven compile e `scripts/check_repo.sh`. |
| **RNF-010** | Dados sensíveis não deverão ser incluídos no repositório. | Atendido via `.env.example` e variáveis de ambiente. |
| **RNF-011** | Alterações críticas deverão ser auditáveis. | Atendido via tabela `audit_events` e endpoint `/api/v1/inspections/{id}/history`. |
| **RNF-012** | Os componentes deverão poder ser executados por instruções documentadas. | Atendido nos READMEs, `deploy_aws.sh` e guia do AWS Learner Lab. |
