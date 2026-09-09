# Relatório de Estado Atual do Projeto — FieldOps

**Data de Emissão:** 08 de Setembro de 2026  
**Projeto:** FieldOps — Plataforma Integrada de Inspeções em Campo  
**Disciplina / Contexto:** Projeto Integrador — 4º Semestre de Análise e Desenvolvimento de Sistemas (SENAI)  
**Equipe Responsável:** Murilo, Pedro, Julio, Matheus, Juan, Gizela  
**Repositório:** [fieldops (GitHub)](https://github.com/MuriloDev1/fieldops.git)

---

## Sumário Executivo

O **FieldOps** é uma plataforma digital ponta a ponta voltada à gestão, agendamento, execução e validação de inspeções técnicas em campo, com arquitetura prioritariamente *offline-first*. O projeto conecta a operação física dos técnicos (via aplicativo móvel) à gestão e supervisão operacional (via painel administrativo web), assegurando rastreabilidade, cumprimento de normas técnicas e preservação de evidências.

No momento atual, o projeto concluiu com excelência as fases de **Planejamento, Especificação de Negócio, Arquitetura Técnica e Modelagem Relacional de Dados**. As interfaces de usuário para Web e Mobile já possuem protótipos funcionais implementados em branches segregadas, com dados mockados. A próxima fase crítica é a **unificação do repositório (monorepo/organização de pastas)**, a **criação do backend/API REST** e a **ativação da base de dados PostgreSQL**.

### Termômetro do Projeto

```
Documentação e Gestão       [████████████████████] 95% - Concluído / Consolidado
Modelagem de Dados (DDL)    [██████████████████░░] 90% - Schema e queries prontos
Frontend Web (Supervisor)   [████████░░░░░░░░░░░░] 40% - Dashboard inicial em branch
Aplicativo Mobile (Técnico) [████████░░░░░░░░░░░░] 40% - Telas principais em branch
Backend / API REST          [██░░░░░░░░░░░░░░░░░░] 10% - Contratos e rotas mapeados
Integração & Sync Offline   [░░░░░░░░░░░░░░░░░░░░]  0% - Arquitetura desenhada
```

---

## 1. Mapeamento do Repositório e Branches Git

A análise das ramificações no Git revela que o código-fonte está atualmente distribuído entre a branch `main` e branches temáticas remotas:

| Branch | Conteúdo Principal | Tecnologias | Status |
| :--- | :--- | :--- | :--- |
| **`main`** | Documentação de gestão, especificação de regras, DDL do banco e plano de implantação | Markdown, SQL, Mermaid | **Estável / Base da Documentação** |
| **`origin/feature/react`** | Interface administrativa Web (Supervisor) | React 19, Vite, Oxlint, Vanilla CSS | **Funcional (com mocks)** |
| **`origin/gizella`** | Aplicativo móvel em `fieldops-mobile` | React Native 0.86, Expo 57, TypeScript | **Funcional (com mocks)** |
| **`origin/web`** | Histórico preliminar de documentação e configurações | Markdown | Sincronizada com a main antiga |

> [!IMPORTANT]
> **Ação Recomendada de Organização:**
> O código do Web e do Mobile foi desenvolvido em branches separadas. É fundamental estruturar uma convenção clara (monorepo com pastas `/web`, `/mobile`, `/api` e `/database` ou submódulos) e realizar o merge ou rebase dessas ramificações para a branch principal.

---

## 2. Detalhamento por Camada do Sistema

### 2.1. Gestão e Especificação de Requisitos (Status: Concluído)
* **Termo de Abertura do Projeto (TAP):** Formalizado em [TAP.md](file:///c:/Users/muril/OneDrive/Documents/Senai-ADS/SEMESTRE-4/fieldops/docs/gestao/TAP.md), detalhando objetivos, escopo, stakeholders, restrições e critérios de sucesso.
* **Estrutura Analítica do Projeto (EAP):** Mapeada graficamente em [EAP.jpeg](file:///c:/Users/muril/OneDrive/Documents/Senai-ADS/SEMESTRE-4/fieldops/docs/gestao/EAP.jpeg).
* **Regras de Negócio (RN-001 a RN-089):** Documentadas minuciosamente em [regras_de_negocio.md](file:///c:/Users/muril/OneDrive/Documents/Senai-ADS/SEMESTRE-4/fieldops/docs/regras_de_negocio.md). Entre as regras principais:
  * **RN-021:** Snapshots imutáveis de checklists no momento do agendamento/execução.
  * **RN-025:** Check-in com validação obrigatória via leitura de QR Code do equipamento.
  * **RN-030 e RN-039:** Exigência condicional de justificativa escrita e foto obrigatória para itens críticos reprovados.
  * **RN-042:** Coleta de geolocalização (GPS) no check-in e check-out.
  * **RN-068 e RN-074:** Idempotência via UUIDs e duplo carimbo de data/hora (`executed_at` vs `synchronized_at`).
* **Arquitetura da Solução:** Detalhada em [arquitetura.md](file:///c:/Users/muril/OneDrive/Documents/Senai-ADS/SEMESTRE-4/fieldops/docs/arquitetura.md), definindo o fluxo do ciclo de vida da inspeção e a estratégia *Outbox Pattern*.

---

### 2.2. Camada de Dados — PostgreSQL (Status: 90%)
* **Schema DDL Completo:** Arquivo [schema.sql](file:///c:/Users/muril/OneDrive/Documents/Senai-ADS/SEMESTRE-4/fieldops/database/schema.sql) com 14 tabelas relacionais:
  * `organizations`, `users`, `sites`, `equipment_types`, `equipment`
  * `inspection_templates`, `inspection_template_questions`, `inspection_question_options`
  * `inspection_assignments`, `inspection_runs`, `inspection_answers`
  * `non_conformities`, `corrective_actions`, `equipment_status_history`
  * `attachments`, `audit_logs`
* **Integridade e Otimização:**
  * Tipos ENUM nativos (`user_role`, `equipment_status`, `assignment_status`, `run_status`, `severity`, etc.).
  * Índices compostos e índice de busca textual GIN para equipamentos (`idx_equipment_search`).
  * Trilha de auditoria desacoplada e suporte a metadados via `jsonb`.
* **Diagrama ERD:** Disponibilizado em sintaxe Mermaid no arquivo [erd.mmd](file:///c:/Users/muril/OneDrive/Documents/Senai-ADS/SEMESTRE-4/fieldops/database/erd.mmd).
* **Queries Analíticas:** Arquivo [dashboard-queries.sql](file:///c:/Users/muril/OneDrive/Documents/Senai-ADS/SEMESTRE-4/fieldops/database/dashboard-queries.sql) pronto, fornecendo agregações para o painel do supervisor (total de inspeções, taxa de não conformidade, volume semanal e listagem priorizada).
* **Pendência:** Criar o script de carga inicial de testes (`seed.sql`) e provisionar a instância do PostgreSQL.

---

### 2.3. Frontend Web — Painel Administrativo (Status: 40%)
* **Branch:** `origin/feature/react`
* **Stack:** React 19, Vite, Oxlint, HTML5 semântico e CSS modular.
* **Componentes Construídos:**
  * **Shell do Dashboard:** Sidebar com navegação (`Dashboard`, `Operations`, `Team Management`, `Analytics`, `Reports`, `Settings`), Topbar com pesquisa, alertas e perfil.
  * **Indicadores Operacionais:** Cards de métricas (Inspeções Concluídas, Taxa de Não Conformidade, Técnicos em Campo, Inspeções Atrasadas).
  * **Gráfico de Barras Semanal:** Monitoramento do volume de inspeções ao longo dos dias.
  * **Painel de Ações Rápidas:** Alertas prioritários e botão de atribuição de tarefas.
  * **Tabela de Não Conformidades:** Listagem com badges de status, paginação e ações.
* **Pendências:**
  * Telas de Gestão de Equipamentos, Construtor de Modelos (Checklists), Agendamento e Tela de Revisão/Aprovação de Inspeções.
  * Conexão com a API REST (substituição dos dados mockados).

---

### 2.4. Aplicativo Mobile — Técnicos em Campo (Status: 40%)
* **Branch:** `origin/gizella` (diretório `fieldops-mobile`)
* **Stack:** React Native 0.86, Expo SDK 57, TypeScript, Expo Vector Icons.
* **Telas e Componentes Construídos:**
  * **Navegação:** Abas inferiores (`Dashboard`, `Inspeções`, `Equipamentos`, `Perfil`).
  * **Construtor de Modelos / Visualização de Formulários:** Exibição de perguntas com tags de obrigatoriedade e opções.
  * **Gestão de Equipamentos:** Busca dinâmica em tempo real, filtros rápidos (Ativo, Em Manutenção, Inativo), cards estruturados e modal inferior com especificações completas.
  * **Perfil do Técnico:** Visualização de dados cadastrais e botão de logout.
* **Pendências:**
  * Integração com SQLite local (módulo `expo-sqlite`) para persistência offline.
  * Leitor de QR Code (módulo `expo-barcode-scanner` ou `expo-camera`) para check-in (RN-025).
  * Coleta de GPS (módulo `expo-location`) (RN-042).
  * Captura de evidências fotográficas e regra de bloqueio condicional (RN-030 e RN-031).

---

### 2.5. Backend / API REST (Status: 10%)
* **Documentação de Rotas:** 20 endpoints mapeados em [implementation-plan.md](file:///c:/Users/muril/OneDrive/Documents/Senai-ADS/SEMESTRE-4/fieldops/implementation-plan.md).
* **Estado Atual:** Não há código de servidor ativo na branch `main`. Anteriormente existiu uma pasta `/api` básica que foi removida para reestruturação técnica.
* **Necessidade Imediata:** Definir a stack do backend (Node.js/Express, NestJS, ou Supabase Backend) e iniciar a implementação dos controllers e middlewares de validação/idempotência.

---

## 3. Matriz de Riscos e Gaps Identificados

| Item / Risco | Nível | Descrição | Plano de Ação Mitigatório |
| :--- | :---: | :--- | :--- |
| **Fragmentação de Branches** | **Alto** | Web e Mobile desenvolvidos em branches isoladas sem monorepo unificado na `main`. | Criar estrutura monorepo na `main` (`/web`, `/mobile`, `/server`, `/database`) e mesclar as branches. |
| **Ausência da API REST** | **Alto** | O app mobile e o painel web dependem de contratos reais para sair da fase de mock. | Implementar API básica em Node.js/Express ou NestJS conectada ao `schema.sql`. |
| **Complexidade da Sincronização Offline** | **Médio** | O padrão Outbox com SQLite e resolução de conflitos exige rigor na fila FIFO e idempotência. | Iniciar com sincronização simples (envio de payload completo) e evoluir para fila granular de transações. |
| **Ambiente de Banco Não Provisionado** | **Baixo** | O DDL está pronto, mas não há instância Docker ou na nuvem rodando para testes da equipe. | Configurar `docker-compose.yml` com PostgreSQL local ou criar projeto no Supabase/Neon. |

---

## 4. Plano de Ação Recomendado (Próximos Passos)

1. **Unificação do Repositório (Sprint Imediata):**
   * Criar a estrutura monorepo na branch `main`:
     * `/web`: código da branch `origin/feature/react`.
     * `/mobile`: código da branch `origin/gizella` (`fieldops-mobile`).
     * `/database`: scripts SQL e documentação de dados.
     * `/server`: novo projeto para a API REST.
2. **Ambiente de Banco de Dados:**
   * Criar arquivo `docker-compose.yml` na raiz do projeto com serviço PostgreSQL e volumes persistentes.
   * Criar script `database/seed.sql` com dados iniciais realistas (usuários, plantas, compressores e modelo de checklist).
3. **Desenvolvimento da API REST (Fase 1 - Core):**
   * Configurar autenticação JWT básica (RBAC: Admin, Supervisor, Técnico).
   * Implementar endpoints prioritários: `GET /me`, `GET /equipment`, `GET /inspection-templates`, `POST /inspection-runs`.
4. **Evolução Mobile:**
   * Instalar e configurar `expo-sqlite` para armazenar o snapshot do checklist e equipamentos localmente.
   * Conectar a tela de equipamentos ao endpoint real da API.
5. **Evolução Web:**
   * Integrar os dados do Dashboard com as queries de [dashboard-queries.sql](file:///c:/Users/muril/OneDrive/Documents/Senai-ADS/SEMESTRE-4/fieldops/database/dashboard-queries.sql).
