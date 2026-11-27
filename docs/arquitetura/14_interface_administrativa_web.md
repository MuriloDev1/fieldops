# 14. Interface Administrativa Web (`frontend/`)

## 14.1 Objetivo

Fornecer aos administradores e supervisores operacionais uma interface web reativa, responsiva e integrada à API REST para gerenciar cadastros mestres (clientes, locais e equipamentos com QR Code), construir modelos de inspeção versionados, agendar ordens de serviço, revisar evidências de campo e auditar a linha do tempo completa das inspeções (`RN-086`), sem necessidade de acesso direto ao banco de dados ou ao Swagger.

---

## 14.2 Stack Tecnológica e Usuários Principais

- **Stack:** **React 19.2**, **Vite 8.2**, **React Router DOM 7.18**, **Axios**, **Lucide React** (ícones), **Oxlint** e **CSS Modular com suporte a Dark Mode**.
- **Usuários principais:**
  - **Supervisor (`SUPERVISOR`):** planejamento, modelos, despacho, revisão/aprovação e indicadores.
  - **Administrador (`ADMIN`):** acesso completo a todos os módulos operacionais, gestão de equipe e configurações do sistema.
  - **Técnico (`TECHNICIAN`) e Cliente (`CLIENT_VIEWER`):** visões filtradas por perfil (`frontend/src/core/permissions.js`).

---

## 14.3 Mapa de Navegação Implementado (`frontend/src/App.jsx`)

Todas as rotas autenticadas são protegidas pelo componente `AuthGuard` e encapsuladas pelo `Layout` principal (`Sidebar`, `Topbar` e `BottomNav` responsivo), com redirecionamento inicial dinâmico (`getHomePath(user.role)`):

```text
/login                        # LoginPage.jsx — Autenticação JWT + modo de contingência demo
/                             # Layout autenticado (AuthGuard + ErrorBoundary)
├── /dashboard                # DashboardPage.jsx — KPIs em tempo real, gráficos e ações rápidas
├── /clients                  # ClientsPage.jsx — Gestão de empresas contratantes (Petrobras, Vale, Klabin)
├── /locations                # LocationsPage.jsx — Gestão de plantas e locais vinculados aos clientes
├── /equipment                # EquipmentPage.jsx — Catálogo de ativos industriais e etiquetas QR Code
├── /templates                # TemplatesPage.jsx — Construtor visual de modelos de checklist e publicação de versões
├── /operations               # OperationsPage.jsx — Agendamento, despacho, drawer de revisão e aprovação/reprovação
├── /inspections              # InspectionListPage.jsx — Listagem geral filtrável de inspeções
├── /my-inspections           # MyInspectionsPage.jsx — Visão dedicada às inspeções do técnico logado
├── /inspection-flow          # InspectionWorkflowPage.jsx — Execução passo a passo de checklist via Web
├── /service-orders           # ServiceOrdersPage.jsx — Acompanhamento de ordens de serviço
├── /non-conformities         # NonConformitiesPage.jsx — Painel de não conformidades filtrado por severidade
├── /history                  # HistoryPage.jsx — Linha do tempo completa e trilha de auditoria (RN-086)
├── /team                     # TeamManagementPage.jsx — Gestão de usuários, técnicos e status de acesso
├── /analytics                # AnalyticsPage.jsx — Indicadores analíticos de conformidade e produtividade
├── /reports                  # ReportsPage.jsx — Consolidação e exportação de laudos técnicos
├── /settings                 # SettingsPage.jsx — Configurações administrativas da plataforma
└── /profile                  # ProfilePage.jsx — Perfil do usuário autenticado
```

---

## 14.4 Principais Módulos e Funcionalidades

### 1. Dashboard Executivo (`/dashboard`)
- Cartões de métricas (`StatCard.jsx`): Total de Inspeções, Taxa de Não Conformidade, Técnicos em Campo e Inspeções Atrasadas.
- Gráfico de acompanhamento semanal e atalhos rápidos para agendamento e revisão.
- Listagem priorizada de não conformidades abertas.

### 2. Clientes, Locais e Equipamentos (`/clients`, `/locations`, `/equipment`)
- **Clientes:** cadastro, edição, busca e ativação/inativação lógica (`RN-013`).
- **Locais / Plantas:** vínculo obrigatório com cliente (`RN-009`), endereço, cidade/UF, contato local e contagem de ativos.
- **Equipamentos:** vínculo com o local (`RN-010`), patrimônio (`asset_number`), número de série, fabricante, modelo, tipo, status operacional e geração/consulta de código QR único (`RN-011`).

### 3. Construtor de Modelos de Inspeção (`/templates`)
- Criação de modelos de checklist (`InspectionTemplate`) com título, descrição e categoria (`RN-015`).
- Organização estruturada em seções (`TemplateSection`) e itens (`TemplateItem`) com tipos de resposta configuráveis (`CONFORMITY`, `BOOLEAN`, `NUMBER`, `TEXT_SHORT`, `TEXT_LONG`, `SINGLE_CHOICE`, `DATE`, `PHOTO`).
- Configuração de obrigatoriedade e regras condicionais de observação e evidência em caso de falha.
- Publicação de versão imutável (`POST /api/v1/inspection-templates/{id}/publish`, `RN-019`, `RN-020`).

### 4. Operações, Agendamento e Revisão (`/operations`)
- **Agendamento com Snapshot:** seleção de modelo publicado, cliente, local, equipamento, técnico responsável, prioridade e data prevista (`POST /api/v1/inspections`), gerando automaticamente os snapshots imutáveis dos itens (`RN-021`).
- **Drawer de Revisão e Decisão do Supervisor (`ModalDrawer.jsx`):**
  - Exibe cabeçalho da inspeção, técnico, horários de execução no dispositivo vs. servidor (`RN-074`), respostas item a item, observações, fotos em Base64, assinatura digital e não conformidades.
  - Botão **Aprovar** (`POST /api/v1/inspections/{id}/approve`, `RN-081`, `RN-082`) e botão **Reprovar** com justificativa obrigatória (`POST /api/v1/inspections/{id}/reject`, `RN-080`).
  - Integra o componente `InspectionTimeline.jsx` exibindo o histórico de eventos daquela inspeção.

### 5. Histórico e Trilha de Auditoria (`/history`)
- Tela dedicada à rastreabilidade de mudanças de estado (`GET /api/v1/inspections/{id}/history`, `RN-086`).
- Apresenta em linha do tempo vertical cada evento registrado em `audit_events`: criação da inspeção, atribuição ao técnico, check-in presencial, submissão das respostas, início da revisão e parecer final (aprovação ou reprovação com motivo).

---

## 14.5 Controle de Acesso, Integração HTTP e Testes Unitários

### Controle de Acesso Visual e na API (`RBAC`)
- As permissões de menu e rota são centralizadas em `src/core/permissions.js` e `src/core/roleAccess.js` e validadas por testes automatizados (`src/core/__tests__/roleAccess.test.mjs`).
- Toda decisão de segurança é revalidada no backend Spring Boot via token Bearer JWT (`RN-003`).

### Cliente HTTP e Modo de Resiliência (`src/services/api.ts`)
- Cliente Axios configurado com `VITE_API_URL` (padrão `http://localhost:8080/api/v1` em dev ou proxy `/api/v1` via Nginx em produção).
- Interceptor de requisição que injeta `Authorization: Bearer <token>` sem registrar credenciais em logs (`RN-007`).
- Interceptor de resposta com fila de renovação automática de token (`POST /api/v1/auth/refresh`) em caso de `401 Unauthorized`.
- Caso o backend esteja offline durante uma demonstração estática e `VITE_ALLOW_DEMO_LOGIN` esteja ativo, a interface dispõe de fallback controlado para demonstração contínua.

### Suíte de Testes Unitários do Frontend
O frontend conta com testes automatizados nativos (`node --test`) em `src/core/__tests__/` e `src/services/__tests__/`:
- `formatters.test.mjs`
- `roleAccess.test.mjs`
- `status.test.mjs`
- `text.test.mjs`
- `validators.test.mjs`
- `api.test.mjs`
