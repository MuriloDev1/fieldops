# FieldOps - Backend Spring Boot

Backend oficial da plataforma **FieldOps**, desenvolvido em **Java 21 LTS** e **Spring Boot 3.3.4**, em conformidade com o **Modelo de Dados (Seção 10)**, a **Especificação da API REST (Seção 12)** e as regras de negócio **RN-001 a RN-090**.

O backend atua como o núcleo de segurança, processamento de regras, consolidação de auditoria (**AuditEvent / RN-086**) e sincronização idempotente para o **Front-end Web (React/Vite)** e o **Aplicativo Mobile (React Native/Expo)**.

---

## 🚀 Tecnologias

- **Java 21 LTS**
- **Spring Boot 3.3.4**
  - Spring Web
  - Spring Data JPA / Hibernate
  - Spring Security (Stateless + Bearer JWT)
  - Spring Validation
- **Bancos de Dados:**
  - **H2 In-Memory (Perfil `local`):** Para execução imediata com zero dependências externas e carga automática de dados de demonstração (PBI-066 / Task #34).
  - **PostgreSQL 16 (Perfil padrão):** Base centralizada com migrações automatizadas via **Flyway**.
- **OpenAPI 3 / Swagger UI (Springdoc OpenAPI)**
- **Lombok**

---

## 🛠️ Como Executar o Backend

O backend suporta duas modalidades de execução:

### Opção A: Execução Local com H2 em Memória (Recomendada para Avaliação Rápida)
Não requer Docker nem instalação de PostgreSQL. Cria o banco em memória e popula automaticamente o seed completo de demonstração:

```bash
cd backend

# No Linux / macOS:
./mvnw spring-boot:run -Dspring-boot.run.profiles=local

# No Windows (PowerShell / Prompt):
.\mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=local
```
*A API estará pronta em `http://localhost:8080/api/v1` com todos os dados de clientes, equipamentos, modelos, inspeções em múltiplos estados e trilhas de auditoria carregados!*

---

### Opção B: Execução com PostgreSQL via Docker Compose
Para execução em ambiente idêntico a produção:

1. Na raiz do repositório (`fieldops`):
```bash
docker compose up -d postgres
```
2. Na pasta `backend`:
```bash
# No Linux / macOS:
./mvnw spring-boot:run

# No Windows (PowerShell / Prompt):
.\mvnw.cmd spring-boot:run
```
*O Flyway aplicará automaticamente `V1__initial_schema.sql` (schema com 14 tabelas relacionais) e `V2__seed_data.sql` (carga completa de dados).*

---

## 📖 Documentação Interativa da API (OpenAPI / Swagger UI)

Com o backend em execução, acesse no navegador:

- **Swagger UI:** 👉 **[http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)**
- **Especificação OpenAPI JSON:** 👉 **[http://localhost:8080/v3/api-docs](http://localhost:8080/v3/api-docs)**

A documentação inclui esquemas de requisição/resposta, autenticação Bearer JWT e endpoints descritos conforme as seções 12.1 a 12.16 da documentação do projeto.

---

## 🔑 Credenciais de Teste (Seed Inicial)

Senha padrão para todos os usuários de teste: `123456`

| Papel | Nome | E-mail | Senha |
|---|---|---|---|
| Administrador Geral | Administrador do Sistema | `admin@fieldops.com` | `123456` |
| Supervisor Regional | Roberto Silva | `supervisor@fieldops.com` | `123456` |
| Técnico em Campo | Carlos Lima | `tecnico@fieldops.com` | `123456` |

---

## 📡 Endpoints Implementados

### Autenticação (`/api/v1/auth`)
- `POST /api/v1/auth/login`: Autenticação e geração de token Bearer JWT.
- `GET /api/v1/auth/me`: Retorna os dados do usuário autenticado e suas permissões.

### Clientes (`/api/v1/clients`)
- `GET /api/v1/clients`: Lista todas as empresas/clientes com contagem de plantas.
- `GET /api/v1/clients/{id}`: Detalhes do cliente por UUID.
- `POST /api/v1/clients`: Cadastro de nova empresa/cliente.
- `PATCH /api/v1/clients/{id}/status`: Alteração de status (ACTIVE / INACTIVE).

### Locais / Plantas Operacionais (`/api/v1/sites`)
- `GET /api/v1/sites`: Lista todas as plantas operacionais cadastradas.
- `GET /api/v1/sites/{id}`: Detalhes da planta por UUID.
- `GET /api/v1/clients/{clientId}/sites`: Filtra plantas por cliente.
- `POST /api/v1/sites`: Cadastro de nova planta/unidade industrial.

### Equipamentos (`/api/v1/equipment`)
- `GET /api/v1/equipment`: Lista equipamentos com suporte a busca e filtros por cliente/planta.
- `GET /api/v1/equipment/{id}`: Detalhes do equipamento e especificações técnicas.
- `GET /api/v1/equipment/by-qr/{qrCode}`: Busca equipamento pelo código QR (validação de check-in em campo).
- `POST /api/v1/equipment`: Cadastro de novo ativo com tag e número de série.
- `PATCH /api/v1/equipment/{id}/status`: Alteração de status operacional.

### Modelos de Checklist (`/api/v1/inspection-templates`)
- `GET /api/v1/inspection-templates`: Lista os modelos de inspeção cadastrados.
- `GET /api/v1/inspection-templates/{id}`: Detalhes do modelo.
- `GET /api/v1/inspection-templates/{id}/active-version`: Retorna a versão ativa com seções e itens dinâmicos.
- `POST /api/v1/inspection-templates`: Criação de novo modelo com seções e itens.
- `POST /api/v1/inspection-templates/{id}/publish`: Publica versão imutável do modelo.

### Inspeções em Campo (`/api/v1/inspections`)
- `GET /api/v1/inspections`: Lista todas as inspeções para acompanhamento gerencial.
- `GET /api/v1/inspections/{id}`: Detalhes da inspeção com snapshots dos itens e respostas gravadas.
- **`GET /api/v1/inspections/{id}/history`:** **Retorna a linha do tempo e eventos de auditoria das mudanças de estado da inspeção (Task #51 e RN-086).**
- `GET /api/v1/mobile/inspections`: Lista ordens atribuídas ao técnico para download local.
- `POST /api/v1/inspections`: Agenda inspeção e gera snapshot imutável de itens.
- `POST /api/v1/inspections/{id}/start`: Registra check-in e início presencial dos trabalhos.
- `POST /api/v1/inspections/{id}/submit`: Envia respostas preenchidas e gera não conformidades automáticas.
- `POST /api/v1/inspections/{id}/cancel`: Cancela inspeção com justificativa formal.

### Ciclo de Revisão e Auditoria (`/api/v1/inspections/{id}`)
- `GET /api/v1/inspections/{id}/reviews`: Histórico de rodadas de revisão da inspeção.
- `POST /api/v1/inspections/{id}/begin-review`: Supervisor assume o ciclo de revisão técnica.
- `POST /api/v1/inspections/{id}/approve`: Homologa e aprova a inspeção sem pendências.
- `POST /api/v1/inspections/{id}/reject`: Reprova a inspeção com parecer e motivo obrigatório.

### Não Conformidades (`/api/v1/non-conformities`)
- `GET /api/v1/non-conformities`: Lista geral de não conformidades com filtros por severidade.
- `PATCH /api/v1/non-conformities/{id}/status`: Atualiza status da não conformidade (OPEN, RESOLVED, etc.).

### Sincronização Mobile Idempotente (`/api/v1/mobile/sync`)
- `GET /api/v1/mobile/sync/pull`: Baixa atualizações para o SQLite móvel.
- `POST /api/v1/mobile/sync/push`: Processa lote de transações da Outbox com verificação de UUID idempotente.

---

## 📊 Dados de Demonstração Reproduzíveis (Task #34)

O seed inicial contém dados estruturados cobrindo todas as etapas do fluxo operacional:

1. **3 Clientes e 5 Locais:** Petrobras (Refinaria RPBC e Central), Vale (Terminal Tubarão e Usina Carajás), Klabin (Unidade Monte Alegre).
2. **5 Equipamentos Industriais:** Bombas centrífugas, painéis elétricos, compressores de ar e caldeiras, todos com códigos QR vinculados.
3. **Modelos de Checklist:** Checklist preventivo de bombas hidráulicas e compressores industriais com itens de conformidade, booleano e numérico.
4. **5 Inspeções em Múltiplos Estados do Ciclo de Vida:**
   - `SCHEDULED` (Agendada para manutenção preventiva)
   - `IN_PROGRESS` (Em andamento com check-in registrado)
   - `SUBMITTED` (Em revisão com 1 Não Conformidade aberta)
   - `APPROVED` (Aprovada pelo supervisor com parecer técnico)
   - `REJECTED` (Reprovada formalmente por falta de evidência fotográfica)
5. **Trilha de Auditoria (`audit_events`):** Registros cronológicos de cada transição de estado, permitindo consulta imediata da linha do tempo no painel Web.

---

## ⚠️ Limitações Conhecidas Registradas

1. **Armazenamento de Mídia:** No ambiente de desenvolvimento local, evidências fotográficas são registradas por referência e metadados na base relacional; integração com bucket S3/MinIO está preparada para o perfil de deploy em nuvem.
2. **Autenticação:** O sistema opera em modelo corporativo com papéis predefinidos (ADMIN, SUPERVISOR, TECHNICIAN). Criação dinâmica de novas organizações (*multi-tenancy* estrito) foi postergada para a versão comercial pós-MVP.
