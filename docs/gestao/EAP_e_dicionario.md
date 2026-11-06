# 📊 EAP — Estrutura Analítica do Projeto e Dicionário — FieldOps

---

## 📌 Identificação

| Campo | Informação |
|---|---|
| **Projeto** | FieldOps — Sistema de Gerenciamento e Execução de Inspeções em Campo |
| **Docente Orientador** | Prof. Deivison Takatu |
| **Equipe Responsável** | Pedro (Backend), Murilo (Repo/DevOps), Matheus (Web), Juan (DB), Julio & Gizela (Mobile) |
| **Data de Elaboração** | 21/08/2026 |
| **Data da Revisão** | 06/11/2026 |
| **Versão** | 2.0 (Consolidada para Avaliação 1 & 2) |

---

## 🧩 Estrutura Analítica do Projeto (EAP Visual e Textual)

A EAP abaixo decompõe 100% do escopo do FieldOps em entregas tangíveis e pacotes de trabalho (orientados a entregas e resultados, e não a simples atividades):

```text
FIELDOPS — SISTEMA INTEGRADO DE INSPEÇÕES
│
├── 1. GERENCIAMENTO DO PROJETO
│   ├── 1.1 Termo de Abertura e Partes Interessadas Aprovados
│   ├── 1.2 Declaração de Escopo e EAP Consolidadas
│   ├── 1.3 Cronograma e Matriz de Recursos (RACI) Estabelecidos
│   ├── 1.4 Planos de Custos, Qualidade, Riscos e Comunicação Homologados
│   └── 1.5 Relatório Técnico-Acadêmico e Apresentação Executiva Finalizados
│
├── 2. ENGENHARIA DE DADOS E ARQUITETURA
│   ├── 2.1 Modelo Conceitual e Lógico de Dados Normalizado
│   ├── 2.2 Banco de Dados PostgreSQL Implantado e Configurado
│   ├── 2.3 Scripts DDL de Migrations e Seeds de Teste Versionados
│   └── 2.4 Arquitetura da Solução e Contratos de Integração Definidos
│
├── 3. SERVIÇOS DE BACKEND E API REST
│   ├── 3.1 Módulo de Segurança e Autenticação JWT com RBAC Desenvolvido
│   ├── 3.2 Microsserviço de Gerenciamento de Equipamentos e QR Code Implementado
│   ├── 3.3 Motor de Modelos Dinâmicos e Mecanismo de Snapshots JSONB Concluído
│   ├── 3.4 API de Agendamento, Atribuição e Workflow de Vistorias Finalizada
│   ├── 3.5 Endpoints de Sincronização em Lote Idempotente Validados
│   └── 3.6 Suíte de Testes Automatizados e Documentação Swagger/OpenAPI Publicada
│
├── 4. INTERFACE ADMINISTRATIVA WEB (SUPERVISOR)
│   ├── 4.1 Painel de Autenticação e Controle de Sessão Implementado
│   ├── 4.2 Dashboard Executivo com Indicadores de Conformidade Construído
│   ├── 4.3 Módulo de Cadastro de Equipamentos com Geração de QR Code Operacional
│   ├── 4.4 Construtor Visual de Formulários e Modelos de Inspeção Entregue
│   ├── 4.5 Módulo de Agendamento e Atribuição com Visão de Calendário Concluído
│   └── 4.6 Painel de Revisão, Auditoria e Aprovação de Laudos Homologado
│
├── 5. APLICATIVO MOBILE DE CAMPO (TÉCNICO)
│   ├── 5.1 Módulo de Login e Criptografia Local de Credenciais Ativo
│   ├── 5.2 Leitor de QR Code para Identificação Instantânea de Equipamento Desenvolvido
│   ├── 5.3 Interface Dinâmica de Checklist com Captura de Evidências Fotográficas Entregue
│   ├── 5.4 Mecanismo de Armazenamento Local Offline-First Operante
│   └── 5.5 Fila de Sincronização Bidirecional com Tratamento de Conflitos Validada
│
└── 6. QUALIDADE, DEVOPS E IMPLANTAÇÃO
    ├── 6.1 Pipeline de Integração e Entrega Contínua (CI/CD) GitHub Actions Configurado
    ├── 6.2 Ambientes Conteinerizados Docker Compose Validados
    ├── 6.3 Testes de Carga, Estresse e Validação em Campo Executados
    └── 6.4 Pacote de Release e Demonstração Executiva Prontos para Homologação
```

---

## 📋 Dicionário da EAP

O dicionário da EAP detalha cada pacote de trabalho, especificando seu objetivo, o responsável técnico primário e o critério de aceitação formal:

| Código | Elemento / Pacote de Trabalho | Descrição Detalhada da Entrega | Responsável Técnico | Critério de Aceitação Formal |
|---|---|---|---|---|
| **1.0** | **Gerenciamento do Projeto** | Conjunto de artefatos de planejamento, monitoramento e encerramento da disciplina. | Equipe Completa | 100% dos documentos entregues conforme as diretrizes do Prof. Deivison Takatu. |
| 1.1 | Termo de Abertura e Partes Interessadas | Formalização do projeto, objetivos SMART, justificativa e matriz de poder/interesse (Fábio Carvalho). | Murilo & Pedro | TAP assinado e matriz de stakeholders alinhada com as expectativas da banca. |
| 1.2 | Declaração de Escopo e EAP | Delimitação formal de limites, exclusões, requisitos e decomposição em pacotes de trabalho. | Pedro | Escopo validado sem ambiguidades; árvore da EAP contemplando 100% das entregas. |
| 1.3 | Cronograma e Matriz RACI | Cronograma com dependências lógicas, caminho crítico, marcos e matriz de responsabilidade. | Murilo | Cronograma em formato Gantt com datas factíveis e alocação sem sobrecarga. |
| 1.4 | Planos de Custos, Qualidade, Riscos e Comunicação | Planos complementares de gestão com estimativas orçamentárias, ISO 25010 e matriz de riscos. | Pedro & Murilo | Planos detalhados com ações preventivas e contingenciais comprovadas. |
| 1.5 | Relatório Técnico e Apresentação Executiva | Documento consolidado e deck de slides executivos monocromático para a banca avaliadora. | Equipe Completa | Apresentação executiva em conformidade com o tempo e relatório ABNT/SENAI. |
| **2.0** | **Engenharia de Dados e Arquitetura** | Infraestrutura de persistência, modelagem relacional e arquitetura do ecossistema FieldOps. | Juan | Banco de dados estável, modelado e integrado aos microsserviços. |
| 2.1 | Modelo Conceitual e Lógico Normalizado | Diagrama Entidade-Relacionamento (DER) normalizado até a 3ª Forma Normal (3FN). | Juan | DER aprovado com cardinalidades corretas entre usuários, equipamentos e inspeções. |
| 2.2 | Banco PostgreSQL Implantado | Instância do PostgreSQL configurada com suporte a transações ACID e extensão JSONB. | Juan & Murilo | Banco operacional em container Docker com backups automáticos configurados. |
| 2.3 | Scripts DDL e Seeds de Teste | Scripts de criação de tabelas, índices de performance e dados fictícios para testes de carga. | Juan | Script `seed.sql` executa sem erros populando usuários, equipamentos e vistorias. |
| 2.4 | Arquitetura e Contratos de Integração | Definição da arquitetura em camadas e contratos OpenAPI/Swagger dos endpoints. | Pedro & Juan | Documento de arquitetura versionado e aprovado por todas as frentes de front. |
| **3.0** | **Serviços de Backend e API REST** | Núcleo de regras de negócio, persistência e integrações desenvolvido em Spring Boot. | Pedro | API REST funcional, segura, documentada e com testes unitários passando. |
| 3.1 | Segurança e Autenticação JWT com RBAC | Autenticação via login e senha, geração de tokens JWT seguros e filtros de autorização por perfil. | Pedro | Rotas protegidas retornam `401 Unauthorized` para acessos não autenticados e `403` sem papel. |
| 3.2 | Gerenciamento de Equipamentos e QR Code | CRUD completo de equipamentos industriais e codificação de identificadores únicos para QR Code. | Pedro | Operações de CRUD respondendo com status HTTP padronizados e validação de duplicidade. |
| 3.3 | Motor de Modelos e Snapshots JSONB | Criação de templates de checklist dinâmicos e geração de snapshot imutável no momento da vistoria. | Pedro | Alteração posterior em modelo de checklist não afeta vistorias históricas salvas. |
| 3.4 | API de Agendamento e Workflow | Controle do ciclo de vida das inspeções: `AGENDADA`, `EM_ANDAMENTO`, `CONCLUIDA`, `APROVADA`, etc. | Pedro | Transição de estados válida de acordo com as regras de negócio documentadas. |
| 3.5 | Sincronização em Lote Idempotente | Endpoint de reconciliação de dados em lote recebendo respostas e fotos enviadas pelo app mobile. | Pedro | Requisições repetidas de sincronização não duplicam registros no banco de dados. |
| 3.6 | Testes Automatizados e Swagger Publicado | Testes unitários com JUnit 5/Mockito e interface Swagger UI acessível no endpoint `/swagger-ui.html`. | Pedro | Cobertura de testes dos fluxos críticos acima de 75% e Swagger 100% atualizado. |
| **4.0** | **Interface Administrativa Web (Supervisor)** | Aplicação Web moderna para gestão, agendamento e revisão de vistorias em campo. | Matheus | Painel Web responsivo, sem falhas de console e com fluxo completo operacional. |
| 4.1 | Painel de Autenticação Web | Interface de login com armazenamento seguro de token JWT no navegador e logout automático. | Matheus | Redirecionamento correto conforme perfil de usuário e expiração de sessão. |
| 4.2 | Dashboard Executivo com Indicadores | Gráficos e cartões com métricas de inspeções realizadas, taxa de conformidade e alertas críticos. | Matheus | Dashboard consome dados em tempo real da API e renderiza em menos de 1 segundo. |
| 4.3 | Cadastro de Equipamentos e QR Code Web | Tela de cadastro de equipamentos com botão para impressão/download da etiqueta com QR Code. | Matheus | Leitura do QR Code gerado direciona exatamente para o identificador do equipamento. |
| 4.4 | Construtor Visual de Formulários | Interface intuitiva para adição de perguntas, seções, tipos de resposta e fotos obrigatórias. | Matheus | Supervisor consegue montar checklist completo e salvar sem recarregar a página. |
| 4.5 | Agendamento e Calendário de Inspeções | Visão de calendário com filtros por técnico e data para distribuição balanceada de vistorias. | Matheus | Atribuição de vistoria reflete imediatamente no aplicativo do técnico correspondente. |
| 4.6 | Painel de Revisão e Auditoria de Laudos | Tela com visualização das respostas do técnico, galeria de fotos e botões de aprovar/devolver. | Matheus | Supervisor consegue aprovar ou devolver apontando não conformidades com justificativa. |
| **5.0** | **Aplicativo Mobile de Campo (Técnico)** | App móvel híbrido (React Native / Expo) com total resiliência para trabalho sem sinal. | Julio & Gizela | App executa em smartphones Android/iOS com suporte completo à operação offline. |
| 5.1 | Login e Criptografia Local de Credenciais | Autenticação do técnico com cache seguro de credenciais para permitir login mesmo offline. | Julio & Gizela | Técnico consegue abrir o app e trabalhar em áreas sem cobertura de rede celular. |
| 5.2 | Leitor de QR Code para Equipamentos | Integração com a câmera do smartphone para escanear a etiqueta do equipamento e abrir o checklist. | Julio & Gizela | Escaneamento instantâneo (< 500ms) carregando os dados do equipamento no app. |
| 5.3 | Interface de Checklist e Captura de Fotos | Telas fluidas de preenchimento, validação de campos obrigatórios e disparo de fotos da câmera. | Julio & Gizela | Fotos comprimidas localmente em formato adequado sem travamento do aplicativo. |
| 5.4 | Armazenamento Local Offline-First | Banco local (SQLite/AsyncStorage) persistindo vistorias em andamento com integridade garantida. | Julio & Gizela | Fechar o aplicativo ou descarregar a bateria não provoca perda das respostas preenchidas. |
| 5.5 | Fila de Sincronização Bidirecional | Serviço em background que detecta restauração da conexão Wi-Fi/4G e descarrega a fila na API. | Julio & Gizela | Notificação visual de sincronização concluída com sucesso com zero dados duplicados. |
| **6.0** | **Qualidade, DevOps e Implantação** | Infraestrutura de integração contínua, homologação, testes de estresse e entrega. | Murilo | Repositório governado, pipeline verde e ambiente executável sem falhas manuais. |
| 6.1 | Pipeline CI/CD GitHub Actions | Automação de linter, testes e build a cada commit nas branches `develop` e `main`. | Murilo | Bloqueio de merges que não passem no pipeline automatizado de testes. |
| 6.2 | Ambientes Conteinerizados Docker | Arquivos `Dockerfile` e `docker-compose.yml` orquestrando banco, backend e web em único comando. | Murilo | Comando `docker compose up -d` sobe toda a infraestrutura em qualquer máquina sem erros. |
| 6.3 | Testes de Carga e Validação em Campo | Execução de testes de estresse na API e teste piloto de inspeção real em campo com técnicos. | Equipe Completa | Sistema sustenta requisições concorrentes sem degradação perceptível de performance. |
| 6.4 | Release e Demonstração Executiva | Congelamento da versão estável, geração de tags Git e preparação do roteiro de apresentação. | Murilo & Equipe | Demonstração técnica sem falhas executada dentro do tempo estipulado pela banca. |

---

## 📝 Regras Metodológicas da EAP Adotadas

1. **Regra dos 100%:** A EAP engloba a totalidade do trabalho do projeto FieldOps. O que não consta na EAP está fora do escopo.
2. **Orientação a Entregas:** Todos os nós da EAP foram redigidos com substantivos qualificados ou particípios passados ("API Desenvolvida", "Banco Implantado"), evitando verbos no infinitivo que representam atividades passageiras.
3. **Mútuo Exclusivismo:** Não há sobreposição de escopo entre os pacotes de trabalho (cada pacote tem limites claros e um único líder técnico responsável).
4. **Nível de Decomposição:** A estrutura foi decomposta até o 2º nível analítico (X.Y), nível ideal para permitir rastreabilidade, orçamentação e atribuição sem microgerenciamento desnecessário.

---

## ✅ Checklist de Qualidade da EAP (Modelo do Professor)

- [x] O projeto está representado no nível superior
- [x] As principais entregas foram identificadas em 6 grandes componentes
- [x] As entregas foram decompostas em pacotes de trabalho tangíveis
- [x] Os pacotes de trabalho foram definidos com código padronizado (1.0 a 6.4)
- [x] Os elementos possuem descrições claras e detalhadas no Dicionário
- [x] A EAP representa entregas (produtos e resultados) e não listas de tarefas
- [x] O escopo completo foi contemplado respeitando a regra dos 100%
- [x] O dicionário da EAP foi preenchido com responsáveis e critérios de aceite
- [x] A estrutura reflete com precisão os papéis da equipe (Pedro no Back, Murilo no DevOps/Repo, Matheus na Web, Juan no Banco, Julio e Gizela no Mobile)
