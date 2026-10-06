# FieldOps — Plataforma de Inspeção em Campo

[![Architecture](https://img.shields.io/badge/Architecture-Distributed%20Offline--First-blue.svg)](#2-arquitetura-da-solução)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](#)
[![Status](https://img.shields.io/badge/Status-In%20Development-orange.svg)](#)

---

## 1. Apresentação e Proposta de Valor

O **FieldOps** é uma plataforma digital integrada para planejamento, execução, acompanhamento e revisão de inspeções técnicas em campo.

### O Problema Operacional
Processos tradicionais de inspeção técnica baseados em formulários impressos (pranchetas de papel), planilhas isoladas, aplicativos de mensagens instantâneas e fotografias desvinculadas sofrem com:
- **Fragmentação e perda de dados:** evidências separadas dos relatórios e preenchimento incompleto de checklists;
- **Vulnerabilidade à conectividade:** paralisação do trabalho técnico em zonas industriais, rurais ou subsolos sem acesso à internet;
- **Falta de padronização e rastreabilidade:** ausência de um histórico imutável das respostas, revisões e não conformidades.

### A Solução FieldOps
O FieldOps substitui essa cadeia fragmentada por um ecossistema digital unificado com suporte nativo a operações ***offline-first***. O sistema garante a integridade dos dados coletados no dispositivo móvel do técnico, enfileira e sincroniza alterações de forma idempotente e oferece aos supervisores uma interface centralizada de gestão, auditoria e aprovação.

---

## 2. Arquitetura da Solução

O ecossistema FieldOps adota uma arquitetura distribuída e descentralizada, conectando quatro pilares fundamentais:

```text
┌─────────────────────────────────────────┐
│           Aplicativo Mobile             │
│        (Expo / React Native)            │
│  - Leitura de QR Code & Câmera Nativa   │
│  - Persistência Local (SQLite)          │
│  - Fila de Operações Outbox Pattern     │
└────────────────────┬────────────────────┘
                     │ HTTPS / JSON / Multipart
                     ▼
┌─────────────────────────────────────────┐
│                API REST                 │
│           (Java / Spring Boot)          │
│  - Autenticação JWT & Autorização       │
│  - Regras de Negócio (RN-001 a RN-090)  │
│  - Sincronização Idempotente            │
│  - Trilhas de Auditoria (AuditEvent)    │
└─────────┬──────────────────────┬────────┘
          │                      │
          ▼                      ▼
┌──────────────────┐    ┌──────────────────┐
│    PostgreSQL    │    │ Object Storage   │
│  (Base Central)  │    │  (Fotos / Mídia) │
└──────────────────┘    └──────────────────┘
          ▲
          │ HTTPS / JSON
┌─────────┴───────────────────────────────┐
│       Interface Administrativa Web      │
│          (React / Angular / TS)         │
│  - Gestão de Clientes, Locais e Ativos  │
│  - Construtor de Modelos Versionados    │
│  - Painel de Revisão (InspectionReview) │
└─────────────────────────────────────────┘
```

### Pilares da Solução:
1. **Aplicativo Mobile (Técnico de Campo):** Interface móvel focada em produtividade. Carrega checklists dinâmicos, captura fotografias, lê QR Codes de equipamentos e opera de forma 100% autônoma através de persistência local em SQLite.
2. **Interface Administrativa Web (Gestão e Supervisão):** Painel corporativo para cadastro de ativos, construção de modelos de inspeção versionados, agendamento de ordens de serviço e revisão rigorosa de não conformidades.
3. **API REST (Núcleo de Regras e Segurança):** Serviços backend em Spring Boot responsáveis por validar autorizações, processar lotes de sincronização idempotentes, gerar snapshots imutáveis e manter logs de auditoria.
4. **Infraestrutura de Dados & Armazenamento:** PostgreSQL como fonte oficial centralizada, SQLite para armazenamento relacional móvel e Object Storage (S3/MinIO) para preservação de mídias.

---

## 3. Fluxo do Ciclo de Vida da Inspeção

O fluxo operacional do FieldOps é modelado para assegurar total rastreabilidade desde a configuração até o encerramento da inspeção:

```text
  ┌────────────────────────────────────────────────────────┐
  │ 1. CONFIGURAÇÃO                                        │
  │    Supervisor cria modelo e publica versão imutável.   │
  └───────────────────────────┬────────────────────────────┘
                              │
                              ▼
  ┌────────────────────────────────────────────────────────┐
  │ 2. AGENDAMENTO COM SNAPSHOT                            │
  │    Agendamento gera InspectionItemSnapshot imutável    │
  │    com filtro encadeado: Cliente → Local → Equipamento.│
  └───────────────────────────┬────────────────────────────┘
                              │
                              ▼
  ┌────────────────────────────────────────────────────────┐
  │ 3. EXECUÇÃO MOBILE (OFFLINE-FIRST)                     │
  │    Técnico baixa inspeção, valida QR Code, preenche    │
  │    checklist e registra fotografias e não conformidades│
  └───────────────────────────┬────────────────────────────┘
                              │
                              ▼
  ┌────────────────────────────────────────────────────────┐
  │ 4. FILA OUTBOX (SQLITE)                                │
  │    Alterações geram operações ordenadas e com IDs      │
  │    idempotentes no banco local do dispositivo.         │
  └───────────────────────────┬────────────────────────────┘
                              │
                              ▼
  ┌────────────────────────────────────────────────────────┐
  │ 5. SINCRONIZAÇÃO                                       │
  │    Conexão restabelecida: envio em lote à API REST,    │
  │    processamento idempotente e avanço do cursor.       │
  └───────────────────────────┬────────────────────────────┘
                              │
                              ▼
  ┌────────────────────────────────────────────────────────┐
  │ 6. AUDITORIA E DECISÃO DO SUPERVISOR                   │
  │    Supervisor avalia respostas/mídias em Web Panel.    │
  │    Gera InspectionReview (Aprovada / Reprovada) e     │
  │    dispara registro imutável em AuditEvent.            │
  └────────────────────────────────────────────────────────┘
```

---

## 4. Stack Tecnológica Oficial

| Camada | Tecnologia | Descrição / Uso |
| --- | --- | --- |
| **Mobile** | **Expo / React Native** | Desenvolvimento móvel cross-platform (Android priorizado) |
| **Mobile State/DB** | **SQLite & SecureStore** | Persistência local offline e armazenamento seguro de tokens |
| **Web Admin** | **React / Angular + TS** | Interface administrativa web responsiva e reativa |
| **API Backend** | **Java 17+ / Spring Boot 3+** | Framework backend para APIs REST, Spring Security (JWT), JPA/Hibernate |
| **Banco Principal** | **PostgreSQL 15+** | Relacional central com suporte a JSONB e restrições de integridade |
| **Armazenamento** | **Object Storage (S3 / MinIO)** | Armazenamento dedicado para fotos e mídias das evidências |
| **DevOps & Infra** | **Docker & Docker Compose** | Padronização e orquestração dos ambientes de desenvolvimento |

---

## 5. Estrutura do Repositório (Monorepo)

```text
fieldops/
├── docs/                             # Base de conhecimento técnica modular em Markdown
│   ├── gestao/                       # TAP, EAP e relatórios de acompanhamento do projeto
│   ├── 01_visao_geral.md             # Visão geral do produto e componentes
│   ├── 02_objetivos.md               # Objetivos de negócio, técnicos e acadêmicos
│   ├── 03_problema.md                # Análise detalhada de dores e oportunidade
│   ├── 04_personas.md                # Perfis de uso (Carlos, Marina, Ana, Roberto)
│   ├── 05_perfis_de_usuario.md       # Matriz de permissões por perfil (ADMIN, SUPERVISOR, TECHNICIAN)
│   ├── 06_casos_de_uso.md            # Casos de uso de UC-01 a UC-20
│   ├── 07_fluxo_geral.md             # Estados de negócio e sincronização
│   ├── 08_funcionalidades.md         # Escopo detalhado (P0, P1, P2)
│   ├── 09_regras_de_negocio.md       # Regras RN-001 a RN-090
│   ├── 10_modelo_de_dados.md         # Modelo ER, entidades, SQLite e Outbox
│   ├── 11_arquitetura.md             # Visão arquitetural e padrões de infraestrutura
│   ├── 12_api_rest.md                # Contratos HTTP, payloads e endpoints REST
│   ├── 13_aplicativo_mobile.md       # Telas, rotas Expo Router e recursos nativos
│   ├── 14_interface_administrativa_web.md # Mapa de navegação e componentes Web
│   ├── 15_backlog_do_produto.md      # Épicos e PBIs priorizados
│   ├── 16_roadmap.md                 # Cronograma de 16 semanas e marcos M1 a M8
│   ├── 17_criterios_aceite.md        # Especificações BDD de aceitação
│   ├── 18_definition_of_done.md      # Definição de Pronto (DoD) por camada
│   └── 19_criterios_de_avaliacao.md  # Rubrica e critérios de avaliação do projeto
├── api/                              # Backend Java / Spring Boot REST API
├── web/                              # Painel Web Administrativo
├── fieldops-mobile/                  # Aplicativo Mobile Expo / React Native
├── database/                         # Scripts de banco de dados (schema.sql, seed.sql, queries)
├── docker-compose.yml                # Containers do banco PostgreSQL e infraestrutura local
└── README.md                         # Documentação principal da solução
```

---

## 6. Índice da Base de Conhecimento

A base de conhecimento do FieldOps foi estruturada de forma modular na pasta `/docs`:

### Gestão do Projeto
* [Documento de Abertura do Projeto (TAP)](file:///c:/Users/muril/OneDrive/Imagens/Documentos/Eu/SENAI/fieldops/docs/gestao/TAP.md)
* [01. Visão Geral](file:///c:/Users/muril/OneDrive/Imagens/Documentos/Eu/SENAI/fieldops/docs/01_visao_geral.md)
* [02. Objetivos](file:///c:/Users/muril/OneDrive/Imagens/Documentos/Eu/SENAI/fieldops/docs/02_objetivos.md)
* [03. Análise do Problema](file:///c:/Users/muril/OneDrive/Imagens/Documentos/Eu/SENAI/fieldops/docs/03_problema.md)
* [04. Personas](file:///c:/Users/muril/OneDrive/Imagens/Documentos/Eu/SENAI/fieldops/docs/04_personas.md)
* [15. Backlog do Produto (PBIs)](file:///c:/Users/muril/OneDrive/Imagens/Documentos/Eu/SENAI/fieldops/docs/15_backlog_do_produto.md)
* [16. Roadmap & Sprints](file:///c:/Users/muril/OneDrive/Imagens/Documentos/Eu/SENAI/fieldops/docs/16_roadmap.md)
* [19. Critérios de Avaliação](file:///c:/Users/muril/OneDrive/Imagens/Documentos/Eu/SENAI/fieldops/docs/19_criterios_de_avaliacao.md)

### Especificação & Regras de Negócio
* [05. Perfis de Usuário & Permissões](file:///c:/Users/muril/OneDrive/Imagens/Documentos/Eu/SENAI/fieldops/docs/05_perfis_de_usuario.md)
* [06. Catálogo de Casos de Uso](file:///c:/Users/muril/OneDrive/Imagens/Documentos/Eu/SENAI/fieldops/docs/06_casos_de_uso.md)
* [07. Fluxo Geral & Estados](file:///c:/Users/muril/OneDrive/Imagens/Documentos/Eu/SENAI/fieldops/docs/07_fluxo_geral.md)
* [08. Matriz de Funcionalidades (P0/P1/P2)](file:///c:/Users/muril/OneDrive/Imagens/Documentos/Eu/SENAI/fieldops/docs/08_funcionalidades.md)
* [09. Regras de Negócio (RN-001 a RN-090)](file:///c:/Users/muril/OneDrive/Imagens/Documentos/Eu/SENAI/fieldops/docs/09_regras_de_negocio.md)
* [17. Critérios de Aceitação (BDD)](file:///c:/Users/muril/OneDrive/Imagens/Documentos/Eu/SENAI/fieldops/docs/17_criterios_aceite.md)
* [18. Definição de Pronto (DoD)](file:///c:/Users/muril/OneDrive/Imagens/Documentos/Eu/SENAI/fieldops/docs/18_definition_of_done.md)

### Arquitetura & Engenharia
* [10. Modelo de Dados (PostgreSQL & SQLite Outbox)](file:///c:/Users/muril/OneDrive/Imagens/Documentos/Eu/SENAI/fieldops/docs/10_modelo_de_dados.md)
* [11. Arquitetura da Solução](file:///c:/Users/muril/OneDrive/Imagens/Documentos/Eu/SENAI/fieldops/docs/11_arquitetura.md)
* [12. API REST (Contrato HTTP)](file:///c:/Users/muril/OneDrive/Imagens/Documentos/Eu/SENAI/fieldops/docs/12_api_rest.md)
* [13. Aplicativo Mobile (Expo / SQLite)](file:///c:/Users/muril/OneDrive/Imagens/Documentos/Eu/SENAI/fieldops/docs/13_aplicativo_mobile.md)
* [14. Interface Administrativa Web](file:///c:/Users/muril/OneDrive/Imagens/Documentos/Eu/SENAI/fieldops/docs/14_interface_administrativa_web.md)

---

## 7. Guia de Inicialização Rápida (Quick Start)

### Pré-requisitos
- **Git** instalado;
- **Docker & Docker Compose** (para serviços de infraestrutura e PostgreSQL);
- **Java JDK 17+** e **Maven** (para o backend);
- **Node.js (v18+)** e **npm** / **yarn** / **pnpm**;
- **Expo Go** no smartphone ou emulador Android/iOS.

### 1. Clonar o Repositório
```bash
git clone https://github.com/MuriloDev1/fieldops.git
cd fieldops
```

### 2. Inicializar Infraestrutura e Banco de Dados (PostgreSQL)
```bash
docker-compose up -d
```
*O container PostgreSQL estará disponível na porta `5432` com os scripts de schema inicializados automaticamente.*

### 3. Executar o Backend (Spring Boot API)
```bash
cd api
./mvnw spring-boot:run
```
*A API REST estará disponível em `http://localhost:8080/api/v1` e a documentação OpenAPI Swagger em `http://localhost:8080/swagger-ui.html`.*

### 4. Executar o Painel Web Administrativo
```bash
cd web
npm install
npm run dev
```
*A interface administrativa estará acessível em `http://localhost:3000` ou `http://localhost:4200`.*

### 5. Executar o Aplicativo Mobile (Expo)
```bash
cd fieldops-mobile
npm install
npx expo start
```
*Escaneie o QR Code com o aplicativo Expo Go (Android/iOS) ou pressione `a` para iniciar no emulador Android.*

---

## 8. Equipe e Governança

O desenvolvimento do FieldOps segue práticas ágeis de Engenharia de Software com papéis bem definidos:

| Papel de Engenharia | Atribuições |
| --- | --- |
| **Software Engineer Lead & Solutions Architect** | Arquitetura geral, governança de dados, contratos de API e conformidade com regras RN-001 a RN-090 |
| **Mobile Software Engineer** | Aplicativo Expo/React Native, banco SQLite local, Outbox Pattern e sincronização resiliente |
| **Backend & Data Engineer** | API REST Spring Boot, segurança JWT, migrações relacional PostgreSQL e auditoria |
| **Fullstack Web Engineer** | Painel Web administrativo, construtor de checklists, fluxo de agendamento e módulo de revisão |

---

*Projeto desenvolvido no âmbito do SENAI como referência prática de Engenharia de Software e Arquitetura de Sistemas Distribuídos.*
