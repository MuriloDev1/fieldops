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
