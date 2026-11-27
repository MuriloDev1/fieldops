# FieldOps — Documentação do Banco de Dados (PostgreSQL 16)

Este diretório centraliza a definição relacional oficial da plataforma **FieldOps**, em total conformidade com a [Seção 10 — Modelo de Dados](../docs/arquitetura/10_modelo_de_dados.md), a [Seção 12 — API REST](../docs/arquitetura/12_api_rest.md) e as regras de negócio [RN-001 a RN-090](../docs/produto/09_regras_de_negocio.md).

---

## 1. Arquivos deste Diretório

| Arquivo | Finalidade |
| :--- | :--- |
| [`schema.sql`](./schema.sql) | Script DDL completo com as **15 tabelas relacionais**, constraints, chaves estrangeiras e índices de performance do PostgreSQL 16. Espelhado em `backend/src/main/resources/db/migration/V1__initial_schema.sql`. |
| [`seed.sql`](./seed.sql) | Carga inicial reproduzível (usuários com hash BCrypt, clientes industriais, plantas, 7 equipamentos com QR Code, modelo publicado, 5 inspeções em todos os estágios do ciclo de vida, snapshots, respostas, não conformidades, revisões e eventos de auditoria). Espelhado em `backend/src/main/resources/db/migration/V2__seed_data.sql`. |
| [`erd.mmd`](./erd.mmd) | Diagrama Entidade-Relacionamento (DER) em sintaxe Mermaid. |
| [`dashboard-queries.sql`](./dashboard-queries.sql) | Consultas analíticas SQL para agregação de KPIs e relatórios operacionais. |

---

## 2. Catálogo das 15 Tabelas Relacionais (`schema.sql`)

O modelo relacional é normalizado em 3ª Forma Normal (3FN), utilizando chaves primárias `UUID` (`gen_random_uuid()`), colunas `JSONB` para estruturas dinâmicas e controle de concorrência otimista (`version`):

### A. Identidade e Estrutura Organizacional
1. **`users`** — Usuários autorizados (`ADMIN`, `SUPERVISOR`, `TECHNICIAN`, `CLIENT_VIEWER`), com `email` único, `password_hash` BCrypt e `status` (`ACTIVE`, `INACTIVE`, `BLOCKED`).
2. **`clients`** — Empresas contratantes atendidas pela operação (ex.: Petrobras S.A., Vale Indústrias, Klabin Papel e Celulose).
3. **`inspection_sites`** — Plantas, refinarias ou unidades operacionais vinculadas a um cliente (`client_id` com `ON DELETE RESTRICT`), incluindo endereço, coordenadas GPS e contato local.
4. **`equipment`** — Ativos físicos inspecionáveis vinculados a um local (`site_id`), contendo patrimônio (`asset_number`), número de série, fabricante, modelo, tipo, status e etiqueta única **`qr_code`** (`UNIQUE`).

### B. Modelos de Inspeção e Versionamento Imutável
5. **`inspection_templates`** — Identidade lógica do modelo de checklist (`title`, `category`, `status`, `current_version`).
6. **`inspection_template_versions`** — Publicações imutáveis numeradas sequencialmente por modelo (`UNIQUE (template_id, version_number)`).
7. **`template_sections`** — Agrupamento ordenado de perguntas dentro de uma versão publicada (`display_order`).
8. **`template_items`** — Perguntas e verificações de cada seção, definindo `response_type` (`CONFORMITY`, `BOOLEAN`, `NUMBER`, `TEXT_SHORT`, `TEXT_LONG`, `SINGLE_CHOICE`, `DATE`, `PHOTO`), obrigatoriedade (`required`), regras condicionais (`observation_required_on_failure`, `evidence_required_on_failure`) e opções em `options_json` (`JSONB`).

### C. Execução da Inspeção, Snapshots e Respostas
9. **`inspections`** — Execução agendada/realizada de uma versão de checklist, vinculando `template_version_id`, `client_id`, `site_id`, `equipment_id`, `technician_id` e `supervisor_id`. Controla a máquina de estados (`DRAFT`, `ASSIGNED`, `IN_PROGRESS`, `SUBMITTED`, `UNDER_REVIEW`, `APPROVED`, `REJECTED`, `CANCELED`) e o **duplo carimbo de data/hora** (`started_at_device` vs. `started_at_server`; `completed_at_device` vs. `submitted_at_server`, `RN-074`).
10. **`inspection_item_snapshots`** — Cópia imutável (`RN-021`) das seções, perguntas, tipos e regras no momento da criação da inspeção, garantindo que evoluções futuras no modelo não desfigurem laudos históricos.
11. **`inspection_responses`** — Resposta atual do técnico para cada item do snapshot (`UNIQUE(inspection_item_id)`), suportando valores tipados (`value_text`, `value_number`, `value_boolean`, `value_date`), payload `value_json` (`JSONB` com `photoUrl` Base64 e `signatureUrl` SVG), `observation` e `conformity` (`CONFORMING`, `NON_CONFORMING`, `NOT_APPLICABLE`).

### D. Evidências, Não Conformidades, Revisão e Auditoria
12. **`evidences`** — Metadados de fotografias e arquivos comprobatórios vinculados à inspeção, resposta ou não conformidade (`storage_key`, `mime_type`, `size_bytes`, coordenadas GPS e timestamps).
13. **`non_conformities`** — Desvios e falhas técnicas registradas em campo, vinculadas à inspeção, ao item do snapshot e à resposta geradora, com `severity` (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`) e `status` (`OPEN`, `IN_PROGRESS`, `RESOLVED`, `CANCELLED`).
14. **`inspection_reviews`** — Histórico de rodadas de revisão técnica realizadas pelo supervisor (`decision`: `APPROVED` ou `REJECTED`, `reason`, `comments`, `review_cycle`).
15. **`audit_events`** — Trilha imutável de auditoria (`RN-086`) registrando cada mudança de estado e ação crítica (`INSPECTION_CREATED`, `INSPECTION_ASSIGNED`, `INSPECTION_STARTED`, `INSPECTION_SUBMITTED`, `REVIEW_STARTED`, `INSPECTION_APPROVED`, `INSPECTION_REJECTED`), alimentando a linha do tempo em `GET /api/v1/inspections/{id}/history`.

---

## 3. Regras de Integridade e Índices Principais

- **Unicidade garantida no SGBD:** `users(email)`, `equipment(qr_code)`, `inspection_template_versions(template_id, version_number)` e `inspection_responses(inspection_item_id)`.
- **Proteção contra exclusão física (`RN-013`, `RN-088`):** `ON DELETE RESTRICT` nas referências históricas críticas (`clients`, `inspection_sites`).
- **Índices compostos de alta performance:**
  - `idx_inspections_tech_status (technician_id, status)` e `idx_inspections_super_status (supervisor_id, status)`
  - `idx_inspections_status_sched (status, scheduled_for)`
  - `idx_snapshots_order (inspection_id, section_order, item_order)`
  - `idx_audit_entity (entity_type, entity_id)` e `idx_audit_inspection (inspection_id)`

---

## 4. Sincronia com Docker Compose e Flyway

O `docker-compose.yml` inicializa o container PostgreSQL 16 montando `database/schema.sql` e `database/seed.sql` em `/docker-entrypoint-initdb.d/`, enquanto o backend Spring Boot executa as migrações Flyway (`backend/src/main/resources/db/migration/V1__initial_schema.sql` e `V2__seed_data.sql`).

Sempre que alterar tabelas ou dados iniciais em `database/`, mantenha os arquivos equivalentes do Flyway sincronizados e valide com o teste automatizado de consistência:

```bash
node --test scripts/__tests__/repoConsistency.test.mjs
```
