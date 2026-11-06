# Matriz de Rede de Poder / Interesse — Projeto FieldOps

> **Documento de Gestão de Partes Interessadas (Stakeholders)**  
> **Referência Teórica:** CARVALHO, Fábio Câmara Araújo de. *Gestão de Projetos*. São Paulo: Pearson Education do Brasil.  
> **Projeto:** FieldOps — Sistema Integrado de Inspeções em Campo (*Offline-First*)  
> **Curso:** Análise e Desenvolvimento de Sistemas — SENAI / Projeto Integrador (4º Semestre)  
> **Equipe do Projeto:** Murilo, Pedro, Julio, Matheus, Juan, Gizela  
> **Data:** Outubro de 2026 | **Versão:** 1.0  

---

## 1. Introdução e Fundamentação Metodológica

A gestão eficaz dos stakeholders em projetos de tecnologia da informação é determinante para o alcance dos objetivos acordados no Termo de Abertura do Projeto (TAP) e para a validação das entregas perante os critérios de avaliação técnica e acadêmica.

Conforme preconizado por **Fábio Câmara Araújo de Carvalho (Gestão de Projetos)** e alinhado às boas práticas do *PMBOK® Guide* (Project Management Institute), a **Matriz de Poder/Interesse** é um instrumento analítico bidimensional que mapeia o nível de autoridade formal/influência (Poder) e a expectativa/preocupação direta com os resultados (Interesse) de cada parte envolvida no projeto.

Essa classificação agrupa os stakeholders em quatro quadrantes táticos bem delineados:

1. **Alto Poder / Alto Interesse $\longrightarrow$ Gerenciar com Atenção (*Manage Closely*):** Stakeholders cruciais que impactam diretamente o sucesso e a continuidade do projeto. Demandam engajamento constante, comunicação ativa e alinhamento minucioso de expectativas.
2. **Alto Poder / Baixo Interesse $\longrightarrow$ Manter Satisfeito (*Keep Satisfied*):** Partes com autoridade decisória, institucional ou financeira que não acompanham a rotina diária técnica, mas cujos requisitos e restrições regulatórias devem ser rigorosamente atendidos para evitar bloqueios.
3. **Baixo Poder / Alto Interesse $\longrightarrow$ Manter Informado (*Keep Informed*):** Atores diretamente impactados no seu dia a dia operacional pela solução, que colaboram como usuários-chave e geradores de requisitos. Devem receber atualizações frequentes e canais de feedback contínuos.
4. **Baixo Poder / Baixo Interesse $\longrightarrow$ Monitorar (*Monitor*):** Partes com baixo impacto direto e interesse secundário. Demandam esforço mínimo de comunicação através de canais gerais ou monitoramento passivo de comportamento.

```
       ▲ PODER (Influência / Autoridade)
       │
  ALTO │   [ MANTER SATISFEITO ]        │   [ GERENCIAR COM ATENÇÃO ]
       │   • Administradores de TI/Sec  │   • Banca Avaliadora / Docentes
       │   • Gestores Contratantes      │   • Supervisores de Operações
       │   • Infraestrutura / Cloud AWS │   • Time de Desenvolvimento
───────┼────────────────────────────────┼──────────────────────────────
       │   [ MONITORAR ]                │   [ MANTER INFORMADO ]
       │   • Auditores Externos         │   • Técnicos de Campo
 BAIXO │   • Usuários Observadores      │   • Clientes Finais (Unidades)
       │   • Fornecedores de Hardware   │   • Equipe de Suporte / Help Desk
       └────────────────────────────────┴──────────────────────────────►
                     BAIXO                            ALTO
                                  INTERESSE (Impacto / Expectativa)
```

---

## 2. Identificação das Partes Interessadas (Stakeholders) do FieldOps

Com base nos artefatos oficiais do projeto ([TAP](TAP.md), [Personas](../04_personas.md), [Perfis de Usuário](../05_perfis_de_usuario.md), [Regras de Negócio](../09_regras_de_negocio.md), [Critérios de Avaliação](../19_criterios_de_avaliacao.md) e [Guia de Apresentação](../../GUIA_PROJETO_E_STATUS_APRESENTACAO.md)), foram identificadas as seguintes partes interessadas:

| ID | Parte Interessada (Stakeholder) | Categoria | Descrição e Papel no Projeto |
| :---: | :--- | :--- | :--- |
| **SH-01** | **Banca Avaliadora e Professores/Orientadores (SENAI)** | Acadêmico / Patrocinador | Responsáveis pela avaliação oficial (100 pontos), definição de rubricas acadêmicas, validação dos marcos (M1 a M8) e aprovação final do Projeto Integrador. |
| **SH-02** | **Supervisor de Operações (Persona: *Marina*)** | Operacional / Negócio | Usuário-chave do painel Web. Responsável por planejar, cadastrar modelos de checklists, agendar inspeções, revisar evidências e formalizar aprovação/reprovação. |
| **SH-03** | **Equipe de Desenvolvimento e Gestão (Alunos)** | Execução / Equipe | Murilo, Pedro, Julio, Matheus, Juan e Gizela. Responsáveis pela arquitetura, backend Spring Boot, frontend React, mobile Expo, testes e deploy AWS. |
| **SH-04** | **Técnico de Campo (Persona: *Carlos*)** | Operacional / Campo | Usuário direto do aplicativo mobile Android. Realiza inspeções em campo com ou sem internet (offline-first), lê QR Codes, responde formulários e captura fotos/assinatura. |
| **SH-05** | **Administrador de TI e Sistema (Persona: *Ana*)** | Corporativo / Segurança | Responsável pela gestão de acesso (RBAC), controle de segurança JWT, segurança de credenciais, manutenção de cadastros mestres e integridade da infraestrutura. |
| **SH-06** | **Responsável / Gestor do Cliente Contratante (Persona: *Roberto*)** | Cliente / Contratante | Gestor de plantas industriais (ex: Petrobras, Vale, Klabin) que contrata os serviços de inspeção e necessita de confiabilidade, laudos técnicos e controle de não conformidades. |
| **SH-07** | **Equipe de Suporte e Operações de Campo** | Operacional / Suporte | Equipe responsável por auxiliar técnicos em dúvidas de uso do aplicativo, falhas de sincronização e contingências operacionais. |
| **SH-08** | **Provedores de Infraestrutura e Nuvem (AWS / Expo EAS)** | Técnico / Infra | Serviços terceirizados (AWS EC2/Docker, EAS Build Cloud) que sustentam o ambiente de produção, limites de consumo (Learner Lab) e distribuição de artefatos. |
| **SH-09** | **Auditores de Qualidade e Órgãos Reguladores** | Governança / Compliance | Entidades de normatização técnica e segurança do trabalho (ex: NR-10, NR-12, ISO 9001) interessadas na imutabilidade de snapshots, auditoria e rastreabilidade. |
| **SH-10** | **Usuários Observadores / Visitantes (Perfil: *CLIENT_VIEWER*)** | Cliente / Consulta | Usuários com permissão estrita de consulta para visualização de relatórios consolidados e histórico de equipamentos. |

---

## 3. Matriz de Classificação Poder vs. Interesse

| ID | Stakeholder | Nível de Poder | Nível de Interesse | Quadrante / Estratégia de Engajamento | Justificativa Analítica da Classificação |
| :---: | :--- | :---: | :---: | :---: | :--- |
| **SH-01** | **Banca Avaliadora e Professores** | **Alto** | **Alto** | **Gerenciar com Atenção** | Possuem autoridade máxima para aprovação/reprovação da entrega (100 pontos). Exigem estrita conformidade com as rubricas de engenharia de software e demonstração real. |
| **SH-02** | **Supervisor de Operações (*Marina*)** | **Alto** | **Alto** | **Gerenciar com Atenção** | Define o fluxo operacional do produto, valida a usabilidade das telas administrativas, construtor de checklists e necessita de dados confiáveis para tomada de decisão. |
| **SH-03** | **Equipe de Desenvolvimento (Alunos)** | **Alto** | **Alto** | **Gerenciar com Atenção** | Responsáveis diretos pela construção, decisões de arquitetura técnica, commits, esteira CI/CD e resolução dos impedimentos técnicos para a entrega. |
| **SH-05** | **Administrador de TI (*Ana*)** | **Alto** | **Médio/Baixo** | **Manter Satisfeito** | Detém poder de veto por segurança da informação, conformidade com LGPD e políticas corporativas de IAM. Não atua na operação diária, mas suas diretrizes são impeditivas. |
| **SH-06** | **Gestor do Cliente Contratante (*Roberto*)** | **Alto** | **Médio/Baixo** | **Manter Satisfeito** | Patrocinador financeiro das ordens de serviço corporativas. Exige relatórios consolidados e ausência de paradas em equipamentos industriais. |
| **SH-08** | **Infraestrutura Cloud (AWS / Expo EAS)** | **Alto** | **Baixo** | **Manter Satisfeito** | Impõe restrições rígidas de execução (ex: limite de cotas do AWS Learner Lab, expiração de sessão a cada 4h, portas de firewall). Deve ser atendido via arquitetura Docker compacta. |
| **SH-04** | **Técnico de Campo (*Carlos*)** | **Baixo** | **Alto** | **Manter Informado** | Não define o escopo do projeto, mas é o usuário vital para a adoção da tecnologia. Se o app travar offline ou perder fotos, a operação colapsa. Necessita de treinamento e escuta ativa. |
| **SH-07** | **Equipe de Suporte e Help Desk** | **Baixo** | **Alto** | **Manter Informado** | Acompanha falhas de sincronização e dúvidas dos técnicos. Precisa de documentação clara e logs rastreáveis para resolução de chamados. |
| **SH-10** | **Usuários Observadores (*CLIENT_VIEWER*)** | **Baixo** | **Médio/Baixo** | **Monitorar** | Acessam o sistema apenas para leitura passiva de laudos emitidos. Não possuem ingerência técnica nem dependência operacional imediata. |
| **SH-09** | **Auditores de Qualidade / Reguladores** | **Médio/Baixo** | **Baixo** | **Monitorar** | Avaliam a conformidade legal quando convocados. O sistema deve atender preventivamente às normas de imutabilidade (snapshots e logs de auditoria). |

---

## 4. Detalhamento das Estratégias por Quadrante

### 4.1 Quadrante: Gerenciar com Atenção (Alto Poder / Alto Interesse)
*Foco: Gestão ativa de expectativas, comunicação frequente e alinhamento contínuo dos entregáveis.*

- **Banca Avaliadora / Docentes:**
  - **Estratégia:** Realização de demonstrações práticas de ponta a ponta ("Fluxo Dourado"), exibição de código limpo, cobertura de testes e apresentação do APK autônomo com stack Docker em nuvem.
  - **Canal / Frequência:** Apresentações parciais por Sprint, checkpoints de projeto, repositório GitHub atualizado e documentação executiva.
  - **Métricas de Sucesso:** Cumprimento integral dos 12 testes do [`GUIA_PROJETO_E_STATUS_APRESENTACAO.md`](../../GUIA_PROJETO_E_STATUS_APRESENTACAO.md) totalizando 100 pontos.

- **Supervisor de Operações (Marina):**
  - **Estratégia:** Disponibilização de painel com interface intuitiva para construtor de checklists dinâmicos, acompanhamento em tempo real das inspeções no Web e fluxo transparente de aprovação/reprovação com motivo formal.
  - **Canal / Frequência:** Sessões de homologação e validação de interface a cada ciclo de entrega de funcionalidades da interface web.
  - **Métricas de Sucesso:** Redução a zero do retrabalho com planilhas paralelas e capacidade de revisar evidências item a item com validação imediata de status do equipamento.

- **Time de Desenvolvimento (Alunos):**
  - **Estratégia:** Rituais de Scrum ágeis (Daily Standups, Sprint Planning, Code Reviews, PRs no GitHub com branch protection e Definition of Done estrito).
  - **Canal / Frequência:** Comunicação diária (Discord/WhatsApp), boards no GitHub Projects e pipelines de integração contínua (CI).
  - **Métricas de Sucesso:** Velocidade consistente de entregas, ausência de bugs bloqueantes em produção e branches saneadas (`develop` / `main`).

---

### 4.2 Quadrante: Manter Satisfeito (Alto Poder / Baixo Interesse)
*Foco: Garantir conformidade com requisitos técnicos, limites de recursos e segurança sem sobrecarregar com detalhes operacionais.*

- **Administradores de TI e Segurança (Ana):**
  - **Estratégia:** Implementação rigorosa do princípio do menor privilégio (RBAC), expiração e rotação de tokens JWT, armazenamento encriptado de senhas (BCrypt), proteção de rotas e política de sanitização estrita (RN-007: credenciais e tokens nunca registrados em logs).
  - **Canal / Frequência:** Relatórios de conformidade arquitetural, especificações de endpoints OpenAPI (Swagger) e auditoria de segurança sob demanda.

- **Gestores dos Clientes Contratantes (Roberto):**
  - **Estratégia:** Garantir a disponibilidade e integridade das inspeções realizadas nas plantas industriais (Petrobras, Vale, Klabin), evidenciando não conformidades críticas antes que gerem acidentes ou paradas não programadas.
  - **Canal / Frequência:** Relatórios periódicos automatizados e reuniões de encerramento de ciclos operacionais.

- **Infraestrutura Cloud e Serviços Terceirizados (AWS / EAS):**
  - **Estratégia:** Adequação aos limites do AWS Learner Lab através de uma arquitetura compacta em instância única EC2 (`docker-compose.yml` orquestrando Frontend Nginx, Backend Spring Boot e PostgreSQL 16) e uso de APK compilado standalone via EAS.
  - **Canal / Frequência:** Monitoramento contínuo de utilização de CPU/Memória e verificação de uptime dos containers via endpoint `/health`.

---

### 4.3 Quadrante: Manter Informado (Baixo Poder / Alto Interesse)
*Foco: Fornecer feedback imediato, usabilidade refinada e capacitação, garantindo engajamento e alta adoção.*

- **Técnicos de Campo (Carlos):**
  - **Estratégia:** Experiência mobile extremamente simplificada, com áreas de toque generosas, salvamento automático de rascunhos para sobrevivência a reinicializações sem internet (Offline-First Real), leitura instantânea de QR Code para check-in e feedback visual claro de sincronização (`[ONLINE]` / `[OFFLINE]`).
  - **Canal / Frequência:** Mensagens claras no aplicativo, guias visuais rápidos de uso e capacitação inicial no APK.
  - **Métricas de Sucesso:** Conclusão de checklists sem perda de evidências fotográficas, eliminação de formulários em papel e zero registros duplicados ao reconectar.

- **Equipe de Suporte Operacional:**
  - **Estratégia:** Manuais de instrução operacional, FAQ de dúvidas técnicas e padronização de códigos de erro retornados pela API REST.
  - **Canal / Frequência:** Atualizações documentadas no repositório (`docs/`) e canal interno de comunicação.

---

### 4.4 Quadrante: Monitorar (Baixo Poder / Baixo Interesse)
*Foco: Acompanhamento de baixo esforço e atendimento a conformidades estruturais básicas.*

- **Auditores e Órgãos Reguladores:**
  - **Estratégia:** Manutenção de trilhas imutáveis de auditoria (`audit_logs`), versionamento estrito de modelos de inspeção (`InspectionTemplateVersion`) e cópias imutáveis em snapshots (`InspectionItemSnapshot`) para fiscalizações eventuais.
  - **Canal / Frequência:** Extração de relatórios e trilhas de auditoria apenas quando solicitado.

- **Usuários Observadores (CLIENT_VIEWER):**
  - **Estratégia:** Disponibilização de telas simplificadas de consulta apenas leitura com filtros por local e equipamento.
  - **Canal / Frequência:** Acesso passivo via portal web quando o perfil for homologado em sprints futuras.

---

## 5. Plano de Comunicação e Engajamento dos Stakeholders

A tabela abaixo sintetiza a cadência, o meio e o responsável pela comunicação com cada parte interessada, garantindo o alinhamento com a literatura de Fábio Câmara Araújo de Carvalho:

| Stakeholder | Estratégia | Informação / Conteúdo Principal | Veículo / Canal | Frequência | Responsável |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Banca Avaliadora** | Gerenciar com Atenção | Status de conformidade dos 12 testes, demonstração ao vivo, repositório GitHub e APK funcional. | Reuniões de avaliação, GitHub e Slides | A cada marco / Sprint | Líder de Projeto & Equipe |
| **Supervisor de Operações** | Gerenciar com Atenção | Protótipos de alta fidelidade, fluxo de revisão, métricas de dashboard e validação de regras. | Homologação Web, reuniões de feedback | Semanal | UX Designer & Frontend Lead |
| **Time de Desenvolvimento** | Gerenciar com Atenção | Tarefas do backlog, PRs, débitos técnicos, padronização de código e integração de APIs. | Daily, GitHub Projects, Discord | Diária | Todos os membros |
| **Administrador de TI** | Manter Satisfeito | Relatórios de segurança, validação de rotas RBAC, política de senhas e logs de auditoria. | Documentação técnica e Swagger OpenAPI | Quinzenal / Sob demanda | Backend Lead / DevOps |
| **Gestores Contratantes** | Manter Satisfeito | Resultados consolidados de inspeções nas plantas, indicadores de confiabilidade e alertas de NCs. | Relatórios executivos | Mensal / Marcos | Product Owner |
| **Infra Cloud (AWS)** | Manter Satisfeito | Consumo de créditos, estabilidade dos contêineres e configurações de portas/firewalls. | Painel AWS Console / Docker logs | Semanal | DevOps / Equipe de Infra |
| **Técnico de Campo** | Manter Informado | Versões atualizadas do APK, instruções sobre offline-first, status de upload e melhorias de UI. | Notas de versão no App, testes piloto | A cada nova release do APK | Mobile Lead |
| **Suporte Operacional** | Manter Informado | Guias de troubleshooting, resolução de pendências de sync e procedimentos de contingência. | Documentos na pasta `docs/` | Conforme atualização | Equipe Técnica |
| **Auditores / Compliance** | Monitorar | Evidências de conformidade com normas técnicas, snapshots imutáveis e registros históricos. | Registros de auditoria no PostgreSQL | Eventual / Sob auditoria | Backend Lead |

---

## 6. Conclusão e Próximos Passos

A aplicação da **Matriz de Rede de Poder/Interesse** no FieldOps consolida a convergência entre os requisitos de negócio e as exigências acadêmicas do Projeto Integrador:

1. **Prioridade Máxima:** A atenção da equipe está concentrada nos quadrantes de alto poder e alto interesse (**Banca Avaliadora, Supervisores e Equipe Interna**), garantindo que a entrega final cumpra todos os requisitos da rubrica avaliativa sem desvios de escopo.
2. **Garantia de Adoção:** O cuidado em *manter informado* o **Técnico de Campo** traduziu-se na implementação prioritária da arquitetura *Offline-First Real* e no leitor de QR Code, removendo fricções operacionais no uso do aplicativo.
3. **Sustentação em Nuvem:** A gestão das restrições de infraestrutura (*manter satisfeito*) resultou na criação de uma stack Docker coesa e resiliente para execução contínua no ambiente **AWS EC2**.

Este artefato passa a compor a suíte oficial de governança do projeto na pasta [`docs/gestao/`](file:///c:/Users/PEDRO%20VIEIRA/Documents/FieldOps/fieldops/docs/gestao/) do repositório GitHub.

---

### 📚 Referências Bibliográficas

1. **CARVALHO, Fábio Câmara Araújo de.** *Gestão de Projetos*. São Paulo: Pearson Education do Brasil, 2015.
2. **PROJECT MANAGEMENT INSTITUTE (PMI).** *A Guide to the Project Management Body of Knowledge (PMBOK® Guide)*. 7ª ed. Newtown Square: PMI, 2021.
3. **DOCUMENTAÇÃO OFICIAL FIELDOPS:** *Termo de Abertura do Projeto (TAP)*, *Critérios de Aceite (17)*, *Critérios de Avaliação (19)* e *Guia de Apresentação Final (2026)*.
