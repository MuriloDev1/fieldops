# 📚 Documentação Técnica e de Gestão — FieldOps

Bem-vindo à base de conhecimento oficial do **FieldOps — Plataforma Integrada de Inspeção em Campo (Offline-First)**.

Esta documentação está organizada por domínio em subpastas temáticas, sem duplicidades, cobrindo desde a concepção de produto e regras de negócio (`RN-001` a `RN-090`) até a arquitetura técnica, contratos da API REST, modelo relacional, guias de deploy AWS e artefatos de Gestão de Projetos (PMBOK / SENAI ADS).

---

## 🧭 Mapa Rápido por Perfil de Leitura

| Seu Objetivo / Perfil | Por Onde Começar |
| :--- | :--- |
| **☁️ Subir o Ambiente / Deploy AWS & APK** | 1. [Guia Passo a Passo: Deploy no AWS Learner Lab](./guias/deploy_aws_learner_lab.md)<br>2. [Guia de Apresentação, Roteiro dos 12 Testes (100 pts) e Status](./guias/guia_apresentacao_e_status.md)<br>3. [README Principal do Repositório](../README.md) |
| **🏗️ Entender Arquitetura, API e Banco** | 1. [10. Modelo de Dados (PostgreSQL 16, Snapshots & Outbox)](./arquitetura/10_modelo_de_dados.md)<br>2. [11. Arquitetura da Solução (Consolidada)](./arquitetura/11_arquitetura.md)<br>3. [12. API REST (Contratos HTTP `/api/v1` e Compatibilidade Mobile)](./arquitetura/12_api_rest.md)<br>4. [13. Aplicativo Mobile (Expo / React Native / Offline-First)](./arquitetura/13_aplicativo_mobile.md)<br>5. [14. Interface Administrativa Web (React 19 / Vite 8)](./arquitetura/14_interface_administrativa_web.md) |
| **📋 Consultar Produto e Regras de Negócio** | 1. [01. Visão Geral](./produto/01_visao_geral.md) e [02. Objetivos](./produto/02_objetivos.md)<br>2. [05. Perfis de Usuário e Matriz RBAC](./produto/05_perfis_de_usuario.md)<br>3. [06. Catálogo de Casos de Uso (`UC-01` a `UC-20`)](./produto/06_casos_de_uso.md)<br>4. [07. Fluxo Geral e Máquina de Estados](./produto/07_fluxo_geral.md)<br>5. [09. Regras de Negócio Consolidadas (`RN-001` a `RN-090`)](./produto/09_regras_de_negocio.md) |
| **🧪 Qualidade, Critérios de Aceite e Rubricas** | 1. [15. Backlog do Produto (`EP-01` a `EP-10` / `PBI-001` a `PBI-082`)](./qualidade/15_backlog_do_produto.md)<br>2. [17. Critérios de Aceitação BDD](./qualidade/17_criterios_aceite.md)<br>3. [18. Definição de Pronto (DoD)](./qualidade/18_definition_of_done.md)<br>4. [19. Critérios de Avaliação e Rubricas (100 pontos)](./qualidade/19_criterios_de_avaliacao.md) |
| **📊 Gestão de Projetos (PMBOK / Prof. Deivison Takatu)** | 1. [Índice Central de Gestão de Projetos](./gestao/README.md)<br>2. [Termo de Abertura do Projeto (TAP)](./gestao/tap.md)<br>3. [EAP e Dicionário da EAP](./gestao/eap_e_dicionario.md)<br>4. [Matriz de Poder/Interesse dos Stakeholders (Fábio Carvalho)](./gestao/matriz_poder_interesse_stakeholders.md)<br>5. [Relatório Técnico-Acadêmico Final Consolidado](./gestao/relatorio_final_consolidado_gestao.md) |

---

## 📂 Estrutura Completa do Diretório `docs/`

```text
docs/
├── README.md                                      # Índice Mestre da documentação
├── produto/                                       # Especificação de produto, domínio e regras (01 a 09)
│   ├── 01_visao_geral.md
│   ├── 02_objetivos.md
│   ├── 03_problema.md
│   ├── 04_personas.md
│   ├── 05_perfis_de_usuario.md
│   ├── 06_casos_de_uso.md
│   ├── 07_fluxo_geral.md
│   ├── 08_funcionalidades.md
│   └── 09_regras_de_negocio.md
├── arquitetura/                                   # Engenharia de software, banco, API, mobile e web (10 a 14)
│   ├── 10_modelo_de_dados.md
│   ├── 11_arquitetura.md
│   ├── 12_api_rest.md
│   ├── 13_aplicativo_mobile.md
│   └── 14_interface_administrativa_web.md
├── qualidade/                                     # Planejamento ágil, BDD, DoD e avaliação (15 a 19)
│   ├── 15_backlog_do_produto.md
│   ├── 16_roadmap.md
│   ├── 17_criterios_aceite.md
│   ├── 18_definition_of_done.md
│   └── 19_criterios_de_avaliacao.md
├── guias/                                         # Manuais operacionais de deploy AWS e apresentação à banca
│   ├── deploy_aws_learner_lab.md
│   └── guia_apresentacao_e_status.md
└── gestao/                                        # Artefatos formais PMBOK / Scrum (Avaliações 1 e 2)
    ├── README.md
    ├── tap.md
    ├── declaracao_de_escopo.md
    ├── eap_e_dicionario.md
    ├── eap.jpeg
    ├── cronograma_e_recursos.md
    ├── matriz_poder_interesse_stakeholders.md
    ├── plano_de_comunicacao.md
    ├── plano_de_custos_e_orcamento.md
    ├── plano_de_qualidade.md
    ├── matriz_e_plano_de_riscos.md
    ├── monitoramento_controle_encerramento.md
    ├── relatorio_final_consolidado_gestao.md
    ├── desafio_gestao_portfolio_metaltech.md
    ├── planejamento_entregas_fim_semestre.md
    ├── sprint_review_monocromatico.md
    ├── sprint_review_slide.md
    ├── sprint_review_gestao_slide.md
    ├── templates_abnt_docx/
    └── historico/
        ├── especificacao_inicial_v01.md
        ├── plano_implantacao_inicial.md
        └── relatorio_estado_atual_set2026.md
```

---

## 📑 Sumário Detalhado dos Módulos

### 1. Produto e Negócio (`docs/produto/`)
- **[01. Visão Geral](./produto/01_visao_geral.md):** Proposta de valor, declaração da visão e os 4 pilares da plataforma.
- **[02. Objetivos](./produto/02_objetivos.md):** Objetivos gerais, específicos por camada, acadêmicos e indicadores de sucesso do MVP.
- **[03. Problema](./produto/03_problema.md):** Dores operacionais de técnicos, supervisores, administradores e clientes.
- **[04. Personas](./produto/04_personas.md):** Perfis de uso (*Carlos* — Técnico, *Marina* — Supervisora, *Ana* — Admin, *Roberto* — Cliente).
- **[05. Perfis de Usuário](./produto/05_perfis_de_usuario.md):** Matriz de permissões RBAC (`ADMIN`, `SUPERVISOR`, `TECHNICIAN`, `CLIENT_VIEWER`).
- **[06. Casos de Uso](./produto/06_casos_de_uso.md):** Especificação de `UC-01` a `UC-20` com fluxos principais e alternativos.
- **[07. Fluxo Geral](./produto/07_fluxo_geral.md):** Ciclo de vida ponta a ponta, máquina de estados de negócio e estados de sincronização.
- **[08. Funcionalidades](./produto/08_funcionalidades.md):** Priorização `P0` (MVP), `P1` e `P2` e tipos de resposta suportados.
- **[09. Regras de Negócio (`RN-001` a `RN-090`)](./produto/09_regras_de_negocio.md):** Catálogo canônico consolidado com comportamentos detalhados no App e no Servidor.

### 2. Arquitetura e Engenharia (`docs/arquitetura/`)
- **[10. Modelo de Dados](./arquitetura/10_modelo_de_dados.md):** Modelagem relacional completa das 15 tabelas PostgreSQL, snapshots imutáveis, fila Outbox e índices.
- **[11. Arquitetura da Solução](./arquitetura/11_arquitetura.md):** Visão distribuída, árvore real dos módulos (`backend/`, `frontend/`, `fieldops-mobile/`), Outbox, idempotência por UUID e RNF-001 a RNF-012.
- **[12. API REST](./arquitetura/12_api_rest.md):** Contratos HTTP `/api/v1/*`, rotas de compatibilidade mobile, payloads JSON, códigos HTTP e Swagger.
- **[13. Aplicativo Mobile](./arquitetura/13_aplicativo_mobile.md):** Arquitetura React Native + Expo SDK 57, rascunho persistente offline (`AsyncStorage`), scanner QR Code (`CameraView`), assinatura SVG e APK Android.
- **[14. Interface Administrativa Web](./arquitetura/14_interface_administrativa_web.md):** Arquitetura React 19 + Vite 8 + React Router 7, rotas reais, construtor de modelos, drawer de revisão e linha do tempo de auditoria (`HistoryPage`).

### 3. Qualidade, Backlog e Avaliação (`docs/qualidade/`)
- **[15. Backlog do Produto](./qualidade/15_backlog_do_produto.md):** Épicos `EP-01` a `EP-10` e histórias de usuário `PBI-001` a `PBI-082`.
- **[16. Roadmap](./qualidade/16_roadmap.md):** Planejamento de 16 semanas em 8 sprints e marcos `M1` a `M8`.
- **[17. Critérios de Aceitação](./qualidade/17_criterios_aceite.md):** Cenários BDD (*Dado / Quando / Então*) para todos os módulos.
- **[18. Definition of Done (DoD)](./qualidade/18_definition_of_done.md):** Critérios de conclusão por história, camada, sprint e MVP.
- **[19. Critérios de Avaliação](./qualidade/19_criterios_de_avaliacao.md):** Rubricas de 100 pontos do produto integrado, Mobile Expo, Backend Spring Boot e Web React.

### 4. Guias Operacionais e READMEs por Módulo
- **[Guia de Deploy no AWS Academy Learner Lab](./guias/deploy_aws_learner_lab.md):** Passo a passo com `deploy_aws.sh` em instância EC2.
- **[Guia de Apresentação Final e Roteiro dos 12 Testes da Banca](./guias/guia_apresentacao_e_status.md):** Checklist de 100 pontos, link do APK Android e resumo técnico.
- **Documentação específica de cada pacote de código:**
  - [Backend Spring Boot (`backend/README.md`)](../backend/README.md)
  - [Frontend Web React (`frontend/README.md`)](../frontend/README.md)
  - [Aplicativo Mobile Expo (`fieldops-mobile/README.md`)](../fieldops-mobile/README.md)
  - [Banco de Dados PostgreSQL (`database/README.md`)](../database/README.md)
