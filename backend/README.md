# FieldOps - Backend Spring Boot

Backend oficial da plataforma **FieldOps**, desenvolvido em **Java 21** e **Spring Boot 3**, em conformidade com o **Modelo de Dados (Seção 10)** e a **Especificação da API REST (Seção 12)**.

O backend foi modelado para atender e se adaptar perfeitamente aos requisitos do **Front-end Web (React/Vite)** e do **Aplicativo Mobile (React Native/Expo)**.

---

## 🚀 Tecnologias

- **Java 21 LTS**
- **Spring Boot 3.3.4**
  - Spring Web
  - Spring Data JPA
  - Spring Security (Stateless + Bearer JWT)
  - Spring Validation
- **PostgreSQL 16** (com migrações automatizadas via **Flyway**)
- **OpenAPI 3 / Swagger UI** (Springdoc OpenAPI)
- **Lombok**

---

## 🏛️ Estrutura e Conformidade com os Requisitos

### 1. Modelo de Dados (Seção 10)
- Identificadores globais via `UUID`.
- Controle de concorrência otimista (`version`).
- Auditoria (`created_at`, `updated_at`).
- Entidades organizacionais: `Client`, `InspectionSite`, `Equipment`, `User`.
- Tabelas e migrações preparadas para o ciclo completo: `InspectionTemplate`, `InspectionTemplateVersion`, `TemplateSection`, `TemplateItem`, `Inspection`, `InspectionItemSnapshot`, `InspectionResponse`, `Evidence`, `NonConformity`, `InspectionReview`, `AuditEvent`.

### 2. Adaptação ao Front-end (Web e Mobile)
- **`ClientsPage.jsx`**: DTOs expõem tanto `document` quanto `cnpj`, além de `locationsCount` (Plantas Ativas).
- **`LocationsPage.jsx`**: DTOs expõem `clientId`/`customerId`, `customerName`, `addressLine`/`address`, `contactName`/`supervisor`, e `equipmentsCount`.
- **`EquipmentPage.jsx`**: DTOs expõem `qrCode`/`qrCodeId`, `type`, `customerId`, `customerName`, `locationId`/`siteId`, `serialNumber`, `assetNumber`, e `status`.
- **Mobile QR Code**: Endpoint dedicado `/api/v1/equipment/by-qr/{qrCode}` para identificação instantânea de ativos em campo.

---

## 🛠️ Como Executar

### 1. Iniciar o Banco de Dados (PostgreSQL)
Na raiz do projeto (`fieldops`):
```bash
docker compose up -d postgres
```
O PostgreSQL iniciará na porta `5433` (ou configurável via `.env`) com o banco `fieldops_db`.

### 2. Iniciar o Backend
Dentro da pasta `backend`:
```bash
# Windows
.\mvnw.cmd spring-boot:run

# Linux / macOS
./mvnw spring-boot:run
```

O Flyway aplicará automaticamente as migrações:
- `V1__initial_schema.sql`: Criação de todas as tabelas e índices da Seção 10.
- `V2__seed_data.sql`: Carga inicial de usuários, clientes, plantas operacionais e equipamentos.

---

## 📖 Documentação da API (Swagger UI)

Com o backend em execução, acesse a documentação interativa no navegador:

- **Swagger UI:** [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- **OpenAPI JSON:** [http://localhost:8080/v3/api-docs](http://localhost:8080/v3/api-docs)

---

## 🔑 Credenciais de Teste (Seed Inicial)

| Papel | E-mail | Senha |
|---|---|---|
| Administrador | `admin@fieldops.com` | `123456` |
| Supervisor | `supervisor@fieldops.com` | `123456` |
| Técnico | `tecnico@fieldops.local` | `123456` |

---

## 📡 Endpoints Implementados (Fase 1)

### Autenticação (`/api/v1/auth`)
- `POST /api/v1/auth/login`: Autenticação e geração de token Bearer JWT.
- `GET /api/v1/auth/me`: Retorna os dados do usuário autenticado.

### Clientes (`/api/v1/clients`)
- `GET /api/v1/clients`: Lista todas as empresas/clientes com contagem de plantas.
- `GET /api/v1/clients/{id}`: Detalhes do cliente por UUID.
- `POST /api/v1/clients`: Cadastro de nova empresa/cliente.
- `PATCH /api/v1/clients/{id}/status`: Alteração de status (ACTIVE / INACTIVE).

### Locais / Plantas (`/api/v1/sites`)
- `GET /api/v1/sites`: Lista todas as plantas com contagem de equipamentos.
- `GET /api/v1/sites/{id}`: Detalhes da planta por UUID.
- `GET /api/v1/clients/{clientId}/sites`: Lista plantas de um cliente específico.
- `POST /api/v1/sites`: Cadastro de nova planta.
- `PATCH /api/v1/sites/{id}/status`: Alteração de status.

### Equipamentos (`/api/v1/equipment`)
- `GET /api/v1/equipment`: Lista equipamentos com filtros por cliente e local.
- `GET /api/v1/equipment/{id}`: Detalhes do equipamento por UUID.
- `GET /api/v1/equipment/by-qr/{qrCode}`: Busca equipamento pelo QR Code (uso no mobile).
- `GET /api/v1/sites/{siteId}/equipment`: Lista equipamentos de uma planta.
- `POST /api/v1/equipment`: Cadastro de novo equipamento com código QR.
- `PATCH /api/v1/equipment/{id}/status`: Alteração do status operacional.

### Usuários (`/api/v1/users`)
- `GET /api/v1/users`: Lista de colaboradores cadastrados.
- `GET /api/v1/users/{id}`: Detalhes de um colaborador.
- `PATCH /api/v1/users/{id}/status`: Alteração de status.

### Modelos de Inspeção e Versões (`/api/v1/inspection-templates`)
- `GET /api/v1/inspection-templates`: Lista todos os modelos de checklist.
- `GET /api/v1/inspection-templates/{id}`: Detalhes do modelo.
- `GET /api/v1/inspection-templates/{id}/active-version`: Versão ativa com seções e itens.
- `GET /api/v1/inspection-template-versions/{versionId}`: Versão imutável específica.
- `POST /api/v1/inspection-templates`: Cadastro de modelo com seções e itens.
- `POST /api/v1/inspection-templates/{id}/publish`: Publicação de nova versão imutável.

### Inspeções em Campo (`/api/v1/inspections`)
- `GET /api/v1/inspections`: Lista todas as inspeções (painel administrativo).
- `GET /api/v1/inspections/{id}`: Detalhes da inspeção com snapshot de itens e respostas.
- `GET /api/v1/mobile/inspections`: Lista inspeções atribuídas ao técnico autenticado.
- `POST /api/v1/inspections`: Agenda inspeção e gera snapshot imutável dos itens.
- `POST /api/v1/inspections/{id}/start`: Inicia a inspeção em campo.
- `POST /api/v1/inspections/{id}/submit`: Envia respostas preenchidas para revisão.
- `POST /api/v1/inspections/{id}/cancel`: Cancela inspeção com justificativa.

### Não Conformidades (`/api/v1/non-conformities`)
- `GET /api/v1/non-conformities`: Lista todas as não conformidades.
- `GET /api/v1/inspections/{inspectionId}/non-conformities`: Não conformidades de uma inspeção.
- `POST /api/v1/inspections/{inspectionId}/non-conformities`: Registra ocorrência.
- `PATCH /api/v1/non-conformities/{id}/status`: Altera status (OPEN, RESOLVED, etc.).

### Ciclos de Revisão (`/api/v1/inspections/{id}`)
- `GET /api/v1/inspections/{id}/reviews`: Histórico de rodadas de revisão.
- `POST /api/v1/inspections/{id}/begin-review`: Inicia revisão pelo supervisor.
- `POST /api/v1/inspections/{id}/approve`: Aprova a inspeção.
- `POST /api/v1/inspections/{id}/reject`: Reprova a inspeção com motivo obrigatório.

### Dashboard e Indicadores (`/api/v1/dashboard`)
- `GET /api/v1/dashboard/summary`: Métricas em tempo real (clientes, plantas, equipamentos críticos, inspeções concluídas/pendentes, não conformidades).

### Sincronização Offline (`/api/v1/mobile/sync`)
- `GET /api/v1/mobile/sync/pull`: Baixa dados pendentes para o SQLite local.
- `POST /api/v1/mobile/sync/push`: Envia lote de operações da Outbox com idempotência.
