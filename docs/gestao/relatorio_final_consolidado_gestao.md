# 📘 Relatório Técnico-Acadêmico Final Consolidado — Gestão do Projeto FieldOps

---

## 1. Capa e Identificação

**INSTITUIÇÃO:** Serviço Nacional de Aprendizagem Industrial — SENAI  
**CURSO:** Tecnologia em Análise e Desenvolvimento de Sistemas  
**DISCIPLINA:** Gestão de Projetos  
**DOCENTE ORIENTADOR:** Prof. Deivison Takatu  
**TÍTULO DO PROJETO:** FieldOps — Sistema Integrado de Gestão e Execução de Inspeções em Campo  
**DATA DE ENTREGA:** 04 de Dezembro de 2026  
**CIDADE / ESTADO:** São Paulo — SP  

### 👥 Equipe de Desenvolvimento e Atribuições Técnicas:
- **Pedro Vieira:** Arquitetura de Backend, API RESTful Spring Boot, Segurança Spring Security & JWT, RBAC e Regras de Negócio.
- **Murilo:** Governança de Repositório, DevOps, Pipelines de CI/CD no GitHub Actions, Conteinerização Docker e Gestão de Releases.
- **Matheus:** Engenharia de Frontend Web, Dashboard Administrativo React + Vite + TailwindCSS, Construtor de Formulários e Telas de Auditoria.
- **Juan:** Modelagem Relacional de Banco de Dados, PostgreSQL 15, Scripts DDL de Migrations, Otimização de Índices e Seeds de Teste.
- **Julio & Gizela:** Engenharia de Frontend Mobile de Campo, React Native / Expo, Operação Offline-First com SQLite, Captura de Evidências Fotográficas e Leitura de QR Code.

---

## 2. Introdução

A realização de inspeções técnicas em ambientes industriais, prediais e de telecomunicações é um processo crítico para a prevenção de sinistros, conformidade regulatória e garantia da continuidade operacional. Tradicionalmente, essas atividades são conduzidas através de pranchetas de papel ou planilhas despadronizadas, resultando em dados inconsistentes, fotos desvinculadas dos laudos, morosidade na consolidação de relatórios e ausência de trilhas auditáveis.

O projeto **FieldOps** foi concebido e planejado para transformar esse cenário por meio de uma plataforma digital integrada, estruturada sob as melhores práticas do gerenciamento de projetos do Guia PMBOK e metodologias ágeis (Scrum/Kanban). O presente relatório consolida todo o ciclo de planejamento integrado, englobando a iniciação, definição de escopo, decomposição analítica (EAP), cronograma com caminho crítico, gestão orçamentária (EVM), padrões de qualidade de software (ISO/IEC 25010), matriz de riscos com planos de contingência, governança de monitoramento e ritos de encerramento.

---

## 3. Caracterização do Projeto

O FieldOps é uma solução distribuída composta por três pilares tecnológicos integrados:
1. **Interface Administrativa Web (React / Vite):** Destinada aos supervisores técnicos para visualização de indicadores em tempo real, cadastro de ativos industriais com QR Code, criação flexível de checklists e aprovação de laudos.
2. **Aplicativo Mobile de Campo (React Native / Expo):** Destinado aos técnicos em campo, operando com total autonomia sem conexão de internet (*offline-first*), com leitura instantânea de QR Code, checklist dinâmico e anexação de fotos.
3. **Serviços de Backend & API REST (Spring Boot / PostgreSQL):** Camada centralizadora de regras de negócio, autenticação stateless JWT, controle de acesso baseado em papéis (RBAC) e persistência de snapshots imutáveis em formato JSONB.

---

## 4. Termo de Abertura e Integração

O projeto foi formalizado através do [Termo de Abertura do Projeto (TAP)](TAP.md), fixando:
- **Objetivo Geral:** Entregar uma plataforma integrada capaz de gerenciar o ciclo completo de vistorias (planejamento, atribuição, execução em campo, sincronização e homologação).
- **Justificativa Estratégica:** Eliminar 100% do extravio de laudos em papel, reduzir em 70% o tempo de liberação de auditorias e assegurar validade jurídica dos relatórios através de snapshots imutáveis de templates.
- **Premissas Principais:** Os técnicos utilizam aparelhos móveis compatíveis com Android ou iOS; a equipe tem autonomia técnica sobre a arquitetura; o cronograma é delimitado pelas 15 semanas do semestre letivo.
- **Restrições Críticas:** Orçamento estritamente baseado em camadas gratuitas (*Free Tier* / GitHub Student Pack); cumprimento rigoroso dos critérios de aceite da disciplina.

---

## 5. Partes Interessadas e Comunicação

A identificação e engajamento das partes interessadas foi fundamentada na metodologia de redes de poder e interesse de Fábio Câmara Araújo de Carvalho, detalhada na [Matriz de Stakeholders](matriz_poder_interesse_stakeholders.md) e operacionalizada pelo [Plano de Gerenciamento das Comunicações](plano_de_comunicacao.md):

### Síntese da Matriz de Comunicação:
- **Banca Avaliadora (Prof. Deivison Takatu):** Status Reports quinzenais, entregas parciais no GitHub e Apresentação Executiva com foco em governança e entrega de valor.
- **Supervisores de Campo:** Demonstrações funcionais (*Sprint Reviews*) validando usabilidade do construtor de formulários e do dashboard.
- **Técnicos de Campo:** Sessões de homologação de usabilidade móvel com testes de campo e feedback estruturado.
- **Equipe Técnica:** Reuniões diárias assíncronas (*Daily Standups* de 15 min no Discord), contratos de API via Swagger/OpenAPI e revisões de código via Pull Requests no GitHub.

---

## 6. Gerenciamento do Escopo e EAP

O gerenciamento do escopo estabeleceu com precisão os limites do projeto, conforme registrado na [Declaração de Escopo](declaracao_de_escopo.md) e na [Estrutura Analítica do Projeto e Dicionário (EAP)](EAP_e_dicionario.md).

### 🌳 Resumo da Estrutura Analítica do Projeto (EAP):
- **1.0 Gerenciamento do Projeto:** TAP, Escopo, EAP, Cronograma, Planos Integrados e Relatório Final.
- **2.0 Engenharia de Dados e Arquitetura:** Modelagem 3FN no PostgreSQL, Migrations, Seeds e Contratos OpenAPI.
- **3.0 Serviços de Backend e API REST:** Autenticação JWT/RBAC, CRUD de Equipamentos, Snapshots JSONB, Workflow de Vistorias e Sincronização em Lote.
- **4.0 Interface Administrativa Web:** Dashboard de Indicadores, Cadastro de Equipamentos/QR Code, Construtor de Checklists e Painel de Auditoria.
- **5.0 Aplicativo Mobile de Campo:** Shell React Native, Leitor QR Code, Formulários Dinâmicos com Fotos, Cache Offline (SQLite) e Fila de Sync.
- **6.0 Qualidade, DevOps e Implantação:** Pipeline CI/CD GitHub Actions, Docker Compose, Testes de Carga e Homologação Final.

---

## 7. Cronograma, Recursos e Responsabilidades

O planejamento temporal e a alocação de esforços foram consolidados no [Cronograma e Matriz de Recursos (RACI)](cronograma_e_recursos.md):
- **Duração Total:** 15 semanas (Início em 21/08/2026 e encerramento em 04/12/2026).
- **Caminho Crítico do Projeto:**
  \[
  \text{A01 (TAP)} \rightarrow \text{A03 (DER Banco)} \rightarrow \text{A04 (Migrations)} \rightarrow \text{A06 (Auth JWT)} \rightarrow \text{A08 (Snapshots)} \rightarrow \text{A09 (Sync API)} \rightarrow \text{A15 (Sync Mobile)} \rightarrow \text{A16 (E2E)} \rightarrow \text{A18 (Banca)}
  \]
- **Matriz de Responsabilidades (RACI):** Pedro é *Accountable* e *Responsible* pelo Backend; Murilo pelo Repositório, DevOps e CI/CD; Matheus pela Interface Web; Juan pela Modelagem e Banco de Dados; Julio e Gizela pelo Aplicativo Mobile.

---

## 8. Custos e Orçamento

Conforme detalhado no [Plano de Gerenciamento de Custos e Orçamento](plano_de_custos_e_orcamento.md), o projeto possui estimativas financeiras fundamentadas em hipóteses realistas de mercado:
- **Mão de Obra Direta:** 1.080 horas técnicas de engenharia de software @ R$ 35,00/h = **R$ 37.800,00**.
- **Infraestrutura Cloud e Conectividade:** Instâncias AWS (EC2, RDS, S3), domínio e chips de dados = **R$ 3.280,00**.
- **Linha de Base de Custos (Cost Baseline com 10% de Contingência):** **R$ 45.188,00**.
- **Orçamento Total Aprovado (BAC com 5% de Gerenciamento):** **R$ 47.208,00**.
- **Acompanhamento por Valor Agregado (EVM na Sprint 5):** \( IDC (CPI) = 1,04 \) e \( IDP (SPI) = 1,01 \), indicando perfeita eficiência econômico-temporal.

---

## 9. Qualidade e Critérios de Aceitação

A qualidade da solução segue as diretrizes da norma internacional **ISO/IEC 25010**, conforme o [Plano de Gerenciamento da Qualidade](plano_de_qualidade.md):
- **Critérios de Entrada e Conclusão:** Adoção estrita de *Definition of Ready (DoR)* e *Definition of Done (DoD)* em todas as histórias de usuário.
- **Garantia da Qualidade:** Revisão por pares (*Peer Code Review*) obrigatória em 100% dos Pull Requests e pipeline de CI automatizado com checagem de linter e compilação limpa.
- **Controle da Qualidade:** Suíte de testes unitários com JUnit 5/Mockito no backend com cobertura superior a 75%; testes de integração de endpoints; testes de persistência local SQLite no mobile.
- **Gestão de Defeitos:** Matriz de severidade de S1 (Crítico - SLA 12h) a S4 (Cosmético).

---

## 10. Gerenciamento dos Riscos

A incerteza técnica e operacional foi gerenciada proativamente no [Plano e Matriz de Riscos](matriz_e_plano_de_riscos.md):
- **Principais Riscos Mitigados:**
  1. *Perda de dados em áreas sem sinal:* Mitigado com gravação transacional instantânea no SQLite a cada resposta preenchida no mobile.
  2. *Duplicação de vistorias durante sincronização:* Mitigado pela criação de endpoints idempotentes baseados em UUID imutável na API Spring Boot.
  3. *Queda de conexão durante a banca:* Evitado pela criação de ambiente 100% espelhado em Docker local com chaveamento instantâneo.
  4. *Ruptura de laudos antigos por alteração de templates:* Evitado pela arquitetura de snapshots imutáveis em JSONB.

---

## 11. Monitoramento, Controle e Encerramento

A governança do projeto foi mantida através de métricas contínuas, documentadas em [Monitoramento, Controle e Encerramento](monitoramento_controle_encerramento.md):
- **Acompanhamento de KPIs:** Monitoramento quinzenal de SPI, CPI, taxa de falhas de sync (< 1%), densidade de defeitos e velocidade da equipe.
- **Controle de Mudanças (CCR):** Fluxo formal de solicitação com análise prévia de impacto em prazo e custo antes de qualquer aprovação.
- **Encerramento Formal:** Emissão do Termo de Encerramento do Projeto (TEP), congelamento da versão estável `v1.0.0` no GitHub e catálogo de lições aprendidas.

---

## 12. Considerações Finais

O desenvolvimento do FieldOps comprovou que a integração harmoniosa entre a disciplina do PMBOK (planejamento estruturado, escopo delimitado, análise de riscos e controle de custos) e o dinamismo das práticas ágeis (sprints quinzenais, código limpo, testes contínuos e entrega frequente de incrementos) constitui o alicerce essencial para o sucesso de projetos tecnológicos complexos.

A equipe multidisciplinar operou com papéis claramente demarcados, superando desafios expressivos de engenharia — como a sincronização assíncrona tolerante a falhas e a imutabilidade histórica de dados em JSONB —, entregando um produto de software robusto, pronto para uso em campo e plenamente documentado segundo as exigências acadêmicas do curso de Tecnologia em Análise e Desenvolvimento de Sistemas do SENAI.

---

## 13. Referências Bibliográficas

1. **PROJECT MANAGEMENT INSTITUTE (PMI).** *A Guide to the Project Management Body of Knowledge (PMBOK Guide)*. 6th and 7th Editions. Newtown Square: Project Management Institute, 2017/2021.
2. **SCHWABER, Ken; SUTHERLAND, Jeff.** *O Guia do Scrum: As Regras do Jogo*. Scrum.org, 2020.
3. **CARVALHO, Fábio Câmara Araújo de.** *Gestão de Projetos: Da Estratégia à Execução*. São Paulo: Atlas, 2018.
4. **INTERNATIONAL ORGANIZATION FOR STANDARDIZATION (ISO).** *ISO/IEC 25010: Systems and software engineering — Systems and software Quality Requirements and Evaluation (SQuaRE) — System and software quality models*. Genebra: ISO, 2011.
5. **PRESSMAN, Roger S.; MAXIM, Bruce R.** *Engenharia de Software: Uma Abordagem Profissional*. 8ª Edição. Porto Alegre: AMGH, 2016.
6. **TAKATU, Deivison.** *Material Didático e Diretrizes da Disciplina de Gestão de Projetos*. SENAI, 2026.

---

## 14. Apêndices e Anexos

- **Apêndice A:** [Termo de Abertura do Projeto (TAP)](TAP.md)
- **Apêndice B:** [Matriz de Stakeholders e Rede de Poder/Interesse](matriz_poder_interesse_stakeholders.md)
- **Apêndice C:** [Plano de Gerenciamento das Comunicações](plano_de_comunicacao.md)
- **Apêndice D:** [Declaração de Escopo do Projeto](declaracao_de_escopo.md)
- **Apêndice E:** [Estrutura Analítica do Projeto e Dicionário da EAP](EAP_e_dicionario.md)
- **Apêndice F:** [Cronograma do Projeto e Matriz RACI](cronograma_e_recursos.md)
- **Apêndice G:** [Plano de Custos, Orçamento e EVM](plano_de_custos_e_orcamento.md)
- **Apêndice H:** [Plano de Gerenciamento da Qualidade e Aceitação](plano_de_qualidade.md)
- **Apêndice I:** [Plano de Gerenciamento e Matriz de Riscos](matriz_e_plano_de_riscos.md)
- **Apêndice J:** [Monitoramento, Controle e Encerramento](monitoramento_controle_encerramento.md)
- **Anexo 1:** [Apresentação Executiva Monocromática para Banca](sprint_review_monocromatico.md)
