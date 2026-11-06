# ⚠️ Plano de Gerenciamento e Matriz de Riscos — FieldOps

---

## 📌 1. Identificação do Projeto

| Campo | Detalhamento |
|---|---|
| **Projeto** | FieldOps — Sistema Integrado de Gestão e Execução de Inspeções em Campo |
| **Área do Conhecimento** | Gerenciamento dos Riscos do Projeto (PMBOK / SENAI ADS) |
| **Docente Orientador** | Prof. Deivison Takatu |
| **Data de Elaboração** | 21/08/2026 |
| **Data da Revisão** | 06/11/2026 |
| **Versão** | 2.0 (Consolidada para Avaliação 2) |
| **Equipe Responsável** | Pedro (Backend), Murilo (Repo/DevOps), Matheus (Web), Juan (DB), Julio & Gizela (Mobile) |

---

## 🎯 2. Objetivos e Estrutura Metodológica

O gerenciamento de riscos no FieldOps tem como objetivo identificar proativamente incertezas que possam comprometer os objetivos de prazo, custo, escopo e qualidade da solução, elaborando estratégias estruturadas para **mitigar ameaças** e **alavancar oportunidades técnicas**.

### 🏷️ Estrutura Analítica de Riscos (EAR / RBS):
- **Técnico (TEC):** Incompatibilidade de bibliotecas, falhas na sincronização offline, problemas com leitura de câmera/QR Code, lentidão de queries.
- **Gerencial / Prazo (GER):** Desvio de cronograma, sobrecarga de integrantes da equipe, falhas de comunicação interna.
- **Operacional / Ambiente (OPE):** Queda de conexão na apresentação presencial, indisponibilidade temporária de serviços na nuvem (AWS), perda de dados locais.
- **Organizacional / Acadêmico (ORG):** Mudança nos critérios de avaliação da banca, divergência nas datas de entrega.

---

## 📏 3. Critérios de Avaliação: Probabilidade e Impacto

Para quantificar os riscos, adotou-se uma escala ordinal de 1 a 5:

### 🎲 Escala de Probabilidade:
| Nível | Classificação | Probabilidade Percentual | Descrição |
|:---:|---|:---:|---|
| **1** | Muito Baixa | < 10% | Evento raro, altamente improvável nas condições normais. |
| **2** | Baixa | 10% a 30% | Pode ocorrer ocasionalmente ao longo do semestre. |
| **3** | Média | 31% a 50% | Possibilidade razoável de ocorrência durante os ciclos de desenvolvimento. |
| **4** | Alta | 51% a 70% | Muito provável que aconteça se não houver ação preventiva prévia. |
| **5** | Muito Alta | > 70% | Quase certeza de ocorrência sem mitigação direta. |

### 💥 Escala de Impacto:
| Nível | Classificação | Impacto em Prazo | Impacto em Qualidade / Custo |
|:---:|---|---|---|
| **1** | Muito Baixo | Atraso < 1 dia | Desvio cosmético sem impacto no funcionamento. |
| **2** | Baixo | Atraso de 2 a 3 dias | Funcionalidade secundária com pequena falha contornável. |
| **3** | Médio | Atraso de 4 a 7 dias | Funcionalidade importante comprometida; exige horas extras. |
| **4** | Alto | Atraso de 8 a 14 dias | Módulo inteiro travado; compromete datas de Sprint Review. |
| **5** | Muito Alto | Atraso > 15 dias | Inviabilização da entrega semestral ou perda de dados em campo. |

### 🧮 Matriz de Severidade (\( \text{Severidade} = \text{Probabilidade} \times \text{Impacto} \)):
- 🟢 **Baixa Prioridade (1 a 6):** Risco monitorado passivamente; aceitação orientada.
- 🟡 **Média Prioridade (8 a 12):** Risco que requer plano de mitigação preventivo.
- 🔴 **Alta Prioridade (15 a 25):** Risco crítico que exige ação de contingência imediata e acompanhamento semanal.

---

## 📋 4. Matriz Completa de Riscos e Planos de Resposta

| ID | Categoria | Descrição do Risco | Causa Raiz | Impacto no Projeto | Prob (P) | Imp (I) | Severidade (P×I) | Estratégia de Resposta | Ação Preventiva (Mitigação) | Ação de Contingência | Responsável Técnico |
|:---:|:---:|---|---|---|:---:|:---:|:---:|:---:|---|---|---|
| **R01** | TEC | **Perda de fotos/respostas durante trabalho offline no aplicativo mobile** | Fechamento acidental do app pelo SO por falta de memória ou queda de bateria do aparelho. | Perda de integridade da vistoria; insatisfação do técnico em campo. | 3 | 5 | 🔴 **15 (Alto)** | **Mitigar** | Gravação transacional imediata no SQLite local a cada pergunta respondida (persistência em tempo real). | Mecanismo de restauração automática da sessão ao reabrir o app apontando itens pendentes. | Julio & Gizela |
| **R02** | TEC | **Conflitos de versão e duplicação de dados durante a sincronização em lote** | Reenvio múltiplo do mesmo lote pelo mobile após instabilidade transitória de sinal 4G. | Vistorias duplicadas no banco PostgreSQL; relatórios corrompidos. | 4 | 4 | 🔴 **16 (Alto)** | **Mitigar** | Implementação de endpoints idempotentes na API Spring Boot utilizando UUID único gerado no mobile para cada vistoria e foto. | Rejeição automática de UUIDs já persistidos retornando status HTTP `200 OK` amigável ao mobile. | Pedro |
| **R03** | OPE | **Indisponibilidade de conexão de internet durante a apresentação à banca** | Instabilidade na rede Wi-Fi da instituição ou sobrecarga de sinal local. | Impossibilidade de demonstrar o sistema funcionando ao vivo perante os avaliadores. | 4 | 5 | 🔴 **20 (Crítico)** | **Evitar** | Configuração de ambiente espelho 100% conteinerizado em Docker local na máquina do apresentador, incluindo banco e backend. | Chaveamento para modo de demonstração local (*Localhost*) ou uso de roteamento 4G dedicado de smartphone. | Murilo |
| **R04** | GER | **Gargalo de integração entre as telas do frontend e os endpoints do backend** | Diferença de ritmo de desenvolvimento ou divergência nos schemas JSON de resposta. | Telas Web ou Mobile prontas mas sem dados reais para exibir; atraso nas revisões. | 3 | 4 | 🟡 **12 (Médio)** | **Mitigar** | Publicação precoce de contratos de API via Swagger/OpenAPI 3.0 e uso de mocks JSON acordados previamente. | Pareamento técnico rápido de 2 horas entre Pedro, Matheus e Julio para alinhar payloads. | Pedro & Matheus |
| **R05** | TEC | **Fotos de alta resolução consumindo todo o armazenamento da nuvem e banda** | Câmeras modernas de celular gerando fotos de 8 a 15 MB por evidência. | Lentidão no upload e estouro do orçamento previsto para armazenamento AWS S3. | 4 | 3 | 🟡 **12 (Médio)** | **Mitigar** | Rotina de compressão e redimensionamento automático de imagens no app mobile antes do upload (máx 1280px e 300 KB). | Script de limpeza e arquivamento para camada Glacier de fotos antigas já homologadas. | Julio & Murilo |
| **R06** | TEC | **Alteração retroativa em modelos de inspeção quebrando vistorias antigas salvas** | Supervisor edita ou remove perguntas de um template de vistoria que já foi respondido meses atrás. | Erro de renderização em laudos antigos e perda de valor jurídico da auditoria. | 2 | 5 | 🟡 **10 (Médio)** | **Evitar** | Arquitetura de Snapshots Imutáveis: no instante do preenchimento, o schema completo é congelado em JSONB no banco de dados. | Versionamento estrito dos templates (`template_version`) sem permissão de exclusão física (*soft delete*). | Pedro & Juan |
| **R07** | GER | **Sobrecarga de tarefas em semanas de avaliações de outras disciplinas do SENAI** | Concorrência de prazos acadêmicos acumulados no final do semestre letivo. | Queda de produtividade e risco de não finalização dos itens da Avaliação 2. | 3 | 3 | 🟡 **9 (Médio)** | **Mitigar** | Antecipação dos entregáveis mais complexos nas primeiras 8 semanas e divisão balanceada por frentes de especialidade. | Redução do escopo para o conjunto essencial (*MVP*) garantindo fluxo completo operacional. | Equipe Completa |
| **R08** | ORG | **Rejeição de Pull Requests por quebra de padrões de código ou conflito de merge** | Desenvolvedores trabalhando em branches desatualizadas por longos períodos. | Dificuldade de consolidar a branch `develop`; instabilidade de build. | 3 | 2 | 🟢 **6 (Baixo)** | **Mitigar** | Políticas de integração contínua (CI), branches de vida curta (*feature branches*) e sync diário com a `develop`. | Resolução conjunta de conflitos de merge mediada pelo responsável de DevOps. | Murilo |

---

## 🌟 5. Oportunidades Identificadas (Riscos Positivos)

O PMBOK orienta que o gerenciamento de riscos também explore eventos positivos:

| ID | Oportunidade | Estratégia | Ação Prática | Benefício Esperado |
|:---:|---|:---:|---|---|
| **O01** | Utilização de créditos gratuitos do GitHub Student Developer Pack e AWS Educate | **Explorar** | Ativação imediata de contas estudantis para zerar custos de infraestrutura em nuvem durante o piloto. | Redução substancial do orçamento real consumido pelo projeto. |
| **O02** | Reutilização de componentes UI já validados do ecossistema React/Tailwind e Expo | **Alavancar** | Adoção de componentes padronizados (Radix UI, Lucide Icons, Expo Camera) acelerando o desenvolvimento. | Ganho de 2 semanas no cronograma de desenvolvimento dos frontends Web e Mobile. |

---

## 🔄 6. Monitoramento e Controle dos Riscos

O monitoramento dos riscos é realizado de forma contínua através dos seguintes rituais:
1. **Revisão Semanal de Riscos:** Ponto fixo de pauta ao início de toda Sprint Planning para reavaliar se algum risco mudou de probabilidade ou severidade.
2. **Gatilhos de Risco (Triggers):** Indicadores que disparam ações imediatas (ex: se o tempo de resposta da API passar de 1 segundo em testes de carga, o gatilho de otimização de banco de dados de Juan é acionado).
3. **Log de Riscos Atualizado:** Registro de quaisquer novos riscos que surjam durante os testes de homologação com apontamento imediato no GitHub Projects.

---

## ✅ Checklist do Plano de Riscos (Requisitos da Avaliação 2)

- [x] Riscos relevantes identificados contemplando frentes técnicas, operacionais e de prazo
- [x] Causas raízes e impactos qualitativos/quantitativos detalhados
- [x] Escalas de Probabilidade (1-5) e Impacto (1-5) padronizadas com matriz de severidade
- [x] Riscos priorizados e categorizados em Alta, Média e Baixa severidade
- [x] Estratégias formais de resposta (Mitigar, Evitar, Aceitar) com planos preventivos e contingenciais
- [x] Responsáveis técnicos claramente alocados para cada risco
- [x] Oportunidades (riscos positivos) mapeadas e plano de monitoramento estabelecido
