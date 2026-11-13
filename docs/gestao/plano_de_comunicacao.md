# 📢 Plano de Gerenciamento das Comunicações — FieldOps

---

## 📌 1. Identificação e Informações Gerais

| Campo | Detalhamento |
|---|---|
| **Projeto** | FieldOps — Sistema Integrado de Gestão e Execução de Inspeções em Campo |
| **Área do Conhecimento** | Gerenciamento das Comunicações do Projeto (PMBOK / SENAI ADS) |
| **Docente / Orientador** | Prof. Deivison Takatu |
| **Data de Elaboração** | 21/08/2026 |
| **Última Revisão** | 06/11/2026 |
| **Versão** | 2.0 (Alinhado com Avaliação 1 & 2 da Disciplina de Gestão de Projetos) |
| **Equipe Responsável** | Pedro (Backend), Murilo (Repo/DevOps), Matheus (Web), Juan (DB), Julio & Gizela (Mobile) |

---

## 🎯 2. Objetivos do Plano de Comunicação

O objetivo deste plano é garantir que as informações corretas sejam geradas, coletadas, distribuídas, armazenadas e recuperadas pelas partes interessadas adequadas no momento oportuno, utilizando os canais e formatos mais eficazes.

### Metas Específicas:
1. **Transparência e Alinhamento:** Manter alinhamento contínuo entre os membros técnicos da equipe (Backend, Web, Mobile, Banco, DevOps).
2. **Engajamento dos Stakeholders:** Atender às expectativas mapeadas na [Matriz de Rede de Poder/Interesse dos Stakeholders](matriz_poder_interesse_stakeholders.md).
3. **Prevenção de Ruídos e Retrabalho:** Definir rituais ágeis e canais oficiais para decisões arquiteturais, mudanças de escopo e homologações.
4. **Rastreabilidade:** Documentar decisões técnicas, reuniões e atas diretamente no repositório GitHub e nas documentações do projeto.

---

## 👥 3. Mapeamento das Partes Interessadas e Necessidades de Informação

Com base na matriz de influência x interesse, as partes interessadas do FieldOps demandam fluxos de informação distintos:

| Stakeholder / Grupo | Nível de Interesse | Nível de Poder | Necessidade de Informação | Formato Preferido |
|---|---|---|---|---|
| **Banca Avaliadora / Prof. Deivison Takatu** | Alto | Alto (Decisório) | Status de entregas, conformidade metodológica PMBOK, relatórios parciais, código-fonte e apresentação executiva | Relatório Técnico, Slides Executivos, GitHub Issues/PRs |
| **Supervisores de Campo** | Alto | Alto | Facilidade de agendamento de inspeções, visibilidade do dashboard, relatórios de não conformidade | Protótipos navegáveis, reuniões de demonstração (Sprint Review) |
| **Técnicos de Campo** | Alto | Médio | Usabilidade móvel, funcionamento offline sem perda de fotos, rapidez no preenchimento de checklists | Testes de usabilidade no app, formulários de feedback |
| **Equipe de Desenvolvimento (Pedro, Murilo, Matheus, Juan, Julio, Gizela)** | Alto | Alto | Contratos de API REST (Swagger), scripts de migração de banco, branches e releases, bloqueios diários | Discord/WhatsApp diário, GitHub Projects, Pull Requests |
| **Administradores do Sistema** | Médio | Médio | Segurança, controle de acesso RBAC, políticas JWT, logs de auditoria | Documentação de arquitetura, manuais de configuração |

---

## 📋 4. Matriz do Plano de Comunicação

A tabela abaixo consolida **o quê**, **para quem**, **com qual frequência**, **por qual canal** e **quem é o responsável**:

| Informação / Evento | Público-Alvo | Conteúdo Transmitido | Frequência | Canal / Ferramenta | Responsável |
|---|---|---|---|---|---|
| **Daily Scrum (Alinhamento Técnico)** | Equipe Interna (Pedro, Murilo, Matheus, Juan, Julio, Gizela) | O que foi feito ontem, o que será feito hoje, impedimentos técnicos | Diária (15 min) | Discord / Canal de Voz e Texto | Pedro (Backend) & Murilo (DevOps) |
| **Sprint Planning (Planejamento da Sprint)** | Equipe Interna e PO/Orientador | Definição de metas da sprint, quebra de tarefas do backlog, estimativas de esforço | A cada 15 dias (Início de Sprint) | Google Meet / GitHub Projects | Toda a equipe |
| **Sprint Review & Demonstração de Incremento** | Banca Avaliadora, Orientador, Supervisores | Demonstração do software em funcionamento (API, Web, Mobile), validação dos critérios de aceitação | Quinzenal / Marcos de Entrega | Apresentação presencial / Google Meet + Slides | Equipe Integrada (Oradores revezados) |
| **Sprint Retrospective (Melhoria Contínua)** | Equipe Interna | O que deu certo, o que deu errado, ações de melhoria no fluxo de trabalho | A cada 15 dias (Fim de Sprint) | Miro / Notion / Discord | Murilo (DevOps/Governança) |
| **Status Report & Relatório de Desempenho** | Prof. Deivison Takatu / Banca | Acompanhamento do cronograma, desvio de escopo, análise de riscos, indicadores EVM | Mensal e nas datas das avaliações | Relatório Markdown/PDF no repositório | Murilo & Pedro |
| **Atualizações de API & Contratos de Dados** | Matheus (Web), Julio & Gizela (Mobile), Juan (DB) | Novas rotas REST, modificações nos payloads JSON, status de códigos HTTP | Conforme evolução (contínuo) | Swagger/OpenAPI (`/swagger-ui.html`) e Canal `#api-contracts` | Pedro (Backend) |
| **Atualizações de Banco & Migrations** | Pedro (Backend), Matheus (Web) | Criação de tabelas, índices de consulta, scripts DDL/DML, constraints | Conforme evolução | Repositório (`/db` scripts) e `#database` | Juan (Banco de Dados) |
| **Releases & Gestão de Versões (CI/CD)** | Toda a equipe | Deploy de novas versões de backend, build do APK Expo e artefatos de release | A cada Merge na branch `develop` / `main` | Notificações do GitHub Actions / Discord Webhook | Murilo (DevOps/Repo) |
| **Escalonamento de Impedimentos Críticos (Bugs Bloqueantes)** | Responsável pela frente afetada e Líder Técnico | Notificação de quebra de build, regressão de banco de dados ou erro de sincronização | Imediata (sob demanda) | Menção `@urgente` no canal do Discord / Chamada rápida | Identificador do bug |

---

## 🛠️ 5. Ferramentas, Canais e Tecnologias de Comunicação

1. **GitHub (Governança e Código):**
   - **Issues & Milestones:** Registro de tarefas, bugs e histórias de usuário.
   - **Pull Requests (PRs):** Comunicação técnica via Code Review antes de qualquer merge na `develop`.
   - **Wiki / Docs:** Repositório oficial de documentações acadêmicas e de arquitetura.
2. **Discord (Comunicação Síncrona e Rápida):**
   - Canal `#backend`: Pedro e Juan (APIs, consultas, performance).
   - Canal `#frontend-web`: Matheus (telas do supervisor, dashboard).
   - Canal `#frontend-mobile`: Julio e Gizela (telas do técnico, sincronização offline, câmera).
   - Canal `#devops-infra`: Murilo (GitHub Actions, Docker, AWS).
   - Canal `#geral-gestao`: Alinhamentos da disciplina de Gestão de Projetos.
3. **Swagger / OpenAPI 3.0:**
   - Documentação viva e interativa dos endpoints da API REST mantida pelo Pedro.
4. **Google Meet / Presencial no SENAI:**
   - Reuniões de alinhamento com o orientador, revisões de entrega e ensaios da apresentação executiva.

---

## 🚨 6. Fluxo de Escalonamento e Resolução de Conflitos

Quando ocorrer divergência técnica ou impedimento que comprometa o cronograma:
```text
Identificação do Impedimento
        ↓
Discussão direta entre os envolvidos (ex: Pedro e Julio sobre contrato da API) [Limite: 24 horas]
        ↓
Não houve consenso?
        ↓
Reunião técnica com o time todo + consulta às regras de negócio documentadas
        ↓
Decisão orientada à viabilidade do escopo e critérios de aceite
        ↓
Registro formal da decisão na Ata de Reunião ou GitHub Issue
```

---

## 📈 7. Monitoramento da Eficácia da Comunicação

A equipe avaliará a eficácia da comunicação ao final de cada Sprint através de:
- **Taxa de retrabalho por falha de especificação:** Monitorar se houve divergência entre o backend e os frontends.
- **Tempo médio de resposta nos canais críticos:** Resolução de dúvidas de integração em menos de 12 horas úteis.
- **Participação nas Dailies:** Presença superior a 90% dos membros.

---

## ✅ Checklist de Comunicação da Disciplina

- [x] Partes interessadas mapeadas e classificadas
- [x] Necessidades de informação identificadas para cada perfil
- [x] Matriz de comunicação completa (público, informação, frequência, responsável, canal)
- [x] Ferramentas e canais padronizados
- [x] Processo de escalonamento e resolução de conflitos documentado
- [x] Alinhamento com a Matriz de Poder x Interesse de Fábio Carvalho
