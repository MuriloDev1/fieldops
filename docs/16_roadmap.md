# 16. Roadmap

## 16.1 Premissa acadêmica

O planejamento considera **16 semanas efetivas de aula**, embora o calendário institucional possua 20 semanas. As demais semanas poderão ser comprometidas por avaliações, palestras, feriados, eventos e atividades institucionais e não deverão ser utilizadas como dependência para concluir o MVP.

Na disciplina de Expo, cada semana terá:

- **2 aulas de 50 minutos para conteúdo e demonstração**;
- **3 aulas de 50 minutos para desenvolvimento orientado do projeto**.

Carga efetiva da disciplina:

- 32 aulas de conteúdo;
- 48 aulas de projeto;
- 80 aulas de 50 minutos.

---

## 16.2 Rotina semanal da disciplina de Expo

| Aula | Finalidade |
| --- | --- |
| Aula 1 | Conceitos, arquitetura, decisões e exemplos. |
| Aula 2 | Demonstração prática guiada e exercício controlado. |
| Aula 3 | Refinamento da história, critérios de aceitação e preparação da integração. |
| Aula 4 | Desenvolvimento da funcionalidade no FieldOps. |
| Aula 5 | Integração, testes, revisão de código e demonstração parcial. |

---

## 16.3 Organização em oito sprints

Cada sprint terá duas semanas:

- 4 aulas de conteúdo Expo;
- 6 aulas de projeto Expo;
- Entregas correspondentes no backend e na interface administrativa;
- Incremento demonstrável ao final.

---

## 16.4 Roadmap integrado

| Sprint | Semanas | Conteúdo principal de Expo | Entrega mobile | Entrega administrativa | Entrega backend | Incremento demonstrável |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1–2 | Arquitetura, TypeScript, Expo Router, componentes e qualidade | Projeto base, rotas protegidas simuladas, design system e dados mockados | Projeto Angular, layout, rotas e telas iniciais | API base, PostgreSQL, migrações e OpenAPI inicial | Três aplicações executáveis com contrato inicial |
| 2 | 3–4 | Consumo de API, autenticação, sessão segura e tratamento de erros | Login real, sessão, logout e tela inicial | Login, usuários e cadastros básicos | JWT, autorização, usuários, clientes, locais e equipamentos | Usuários autenticados e cadastros disponíveis |
| 3 | 5–6 | Dados remotos, cache, listas, filtros e estados de interface | Lista e detalhes de inspeções inicialmente mockados e depois integrados | Construtor de modelos e agendamento | Modelos versionados, snapshot, inspeções e atribuição | Supervisor cria e atribui uma inspeção |
| 4 | 7–8 | React Hook Form, validação e formulários dinâmicos | Início, checklist, respostas, observações e progresso | Acompanhamento das inspeções | Consulta mobile, respostas, transições e validações | Técnico executa uma inspeção online |
| 5 | 9–10 | Câmera, imagens, permissões, QR Code e localização | Evidências, leitura do equipamento, GPS e não conformidade | Visualização de evidências e ocorrências | Upload, QR Code, localização e não conformidades | Inspeção online com recursos nativos |
| 6 | 11–12 | SQLite, conectividade, repositórios locais, outbox e sincronização | Download, operação offline, fila, tela de sincronização | Visualização do estado recebido | Push/pull, idempotência, cursor e conflitos básicos | Inspeção concluída offline e sincronizada |
| 7 | 13–14 | Testes, performance, acessibilidade e tratamento de falhas | Correção, robustez, testes e estados de erro | Revisão, aprovação, reprovação e histórico | Revisão, auditoria e testes de integração | Ciclo completo com reprovação e correção |
| 8 | 15–16 | EAS, ambientes, versionamento e distribuição | Build Android, documentação e ajustes finais | Build e publicação web | Contêiner, ambiente de demonstração e OpenAPI final | Produto integrado apresentado ponta a ponta |

---

## 16.5 Detalhamento por semana

### Semana 1 — Fundação e diagnóstico

**Conteúdo Expo**

- Revisão do ecossistema;
- Diagnóstico do conhecimento anterior;
- Arquitetura do produto;
- TypeScript aplicado ao domínio;
- Convenções do repositório.

**Projeto Expo**

- Criar o projeto;
- Configurar TypeScript, lint e aliases;
- Criar estrutura por features;
- Registrar decisões no README;
- Preparar o fluxo Git.

**Dependências integradas**

- Repositórios criados;
- Contrato inicial de autenticação e inspeção;
- Definição dos identificadores e enums.

### Semana 2 — Navegação e base visual

**Conteúdo Expo**

- Expo Router;
- Grupos de rotas;
- Layouts;
- Proteção de rotas;
- Design system e componentes reutilizáveis.

**Projeto Expo**

- Rotas públicas e protegidas;
- Shell da aplicação;
- Login visual;
- Início e lista simulada;
- Componentes de botão, campo, cartão e estado.

**Marco**

- Demonstração navegável com mocks.

### Semana 3 — Comunicação com API

**Conteúdo Expo**

- Cliente HTTP;
- Variáveis por ambiente;
- DTOs;
- Interceptação;
- Estados de carregamento e erro.

**Projeto Expo**

- Serviço de API;
- Integração com endpoint de login simulado ou real;
- Tratamento padronizado de falhas;
- Configuração local e de integração.

### Semana 4 — Autenticação e sessão

**Conteúdo Expo**

- JWT no cliente;
- Renovação;
- Armazenamento seguro;
- Logout;
- Sessão offline limitada.

**Projeto Expo**

- Login real;
- Persistência segura;
- Carregamento da sessão;
- Proteção de rotas;
- Logout e expiração.

**Marco**

- Autenticação integrada com Spring Boot.

### Semana 5 — Dados remotos e cache

**Conteúdo Expo**

- TanStack Query;
- Chaves de consulta;
- Cache;
- Invalidação;
- Separação entre estado remoto e estado da interface.

**Projeto Expo**

- Consulta de inspeções;
- Estados de carregamento, vazio e erro;
- Atualização manual;
- Estrutura inicial do repositório de inspeções.

### Semana 6 — Listas, filtros e detalhes

**Conteúdo Expo**

- Listas virtualizadas;
- Paginação;
- Filtros;
- Navegação parametrizada;
- Otimização inicial.

**Projeto Expo**

- Lista completa;
- Filtros locais ou remotos;
- Tela de detalhes;
- Apresentação de prioridade, prazo e estado.

**Marco**

- Técnico visualiza inspeção atribuída.

### Semana 7 — Formulários e validação

**Conteúdo Expo**

- React Hook Form;
- Schemas;
- Validação;
- Componentes controlados;
- Mensagens de erro.

**Projeto Expo**

- Componentes para tipos básicos;
- Validação de item;
- Observação;
- Estrutura de resposta.

### Semana 8 — Checklist dinâmico

**Conteúdo Expo**

- Renderização por configuração;
- Seções;
- Progresso;
- Otimização de formulários longos;
- Resumo e confirmação.

**Projeto Expo**

- Checklist dinâmico;
- Início da inspeção;
- Respostas online;
- Progresso;
- Conclusão com validação.

**Marco**

- Execução online completa sem evidências.

### Semana 9 — Câmera e arquivos

**Conteúdo Expo**

- Permissões;
- Captura;
- Seleção de imagem;
- URI local;
- Tamanho e qualidade;
- Upload multipart.

**Projeto Expo**

- Componente de evidência;
- Captura e prévia;
- Vínculo com item;
- Upload online;
- Tratamento de falha.

### Semana 10 — QR Code e localização

**Conteúdo Expo**

- Scanner;
- Ciclo de leitura;
- GPS;
- Precisão;
- Consentimento;
- Uso pontual da localização.

**Projeto Expo**

- Confirmar equipamento por QR Code;
- Registrar início e conclusão;
- Apresentar divergência;
- Criar não conformidade.

**Marco**

- Inspeção online com recursos nativos.

### Semana 11 — SQLite e repositórios locais

**Conteúdo Expo**

- Modelagem local;
- Migração;
- Consultas;
- Repositório;
- Consistência local.

**Projeto Expo**

- Banco local;
- Download da inspeção;
- Persistência das respostas;
- Retomada após reiniciar o aplicativo.

### Semana 12 — Outbox e sincronização

**Conteúdo Expo**

- Detecção de conectividade;
- Outbox;
- Idempotência;
- Dependências;
- Repetição;
- Conflitos.

**Projeto Expo**

- Fila persistente;
- Envio em lote;
- Download por cursor;
- Tela de sincronização;
- Conclusão offline.

**Marco**

- Inspeção executada offline e recebida pelo servidor.

### Semana 13 — Testes e falhas

**Conteúdo Expo**

- Testes de componentes;
- Testes de regras;
- Mocks de rede;
- Erros recuperáveis;
- Logging controlado.

**Projeto Expo**

- Testes dos componentes dinâmicos;
- Testes da outbox;
- Cenários de permissão negada;
- Cenários de falha de envio.

### Semana 14 — Performance e acessibilidade

**Conteúdo Expo**

- Profiling;
- Renderizações;
- Listas;
- Imagens;
- Acessibilidade;
- Feedback de estado.

**Projeto Expo**

- Otimizações;
- Correções de acessibilidade;
- Fluxo de inspeção reprovada;
- Revisão de experiência.

**Marco**

- Fluxo de revisão e correção estável.

### Semana 15 — Build e ambientes

**Conteúdo Expo**

- Configuração do aplicativo;
- Ambientes;
- Versionamento;
- EAS Build;
- Distribuição interna.

**Projeto Expo**

- Ícones e configurações;
- Variáveis por ambiente;
- Build Android;
- Instalação em dispositivo;
- Correção de problemas de build.

### Semana 16 — Integração e apresentação

**Conteúdo Expo**

- Preparação de release;
- Checklist de publicação;
- Documentação;
- Análise retrospectiva.

**Projeto Expo**

- Teste ponta a ponta;
- Dados de demonstração;
- Vídeo ou apresentação;
- README final;
- Entrega das evidências.

**Marco final**

- Demonstração completa: criar → atribuir → executar offline → sincronizar → revisar → aprovar ou reprovar.

---

## 16.6 Marcos obrigatórios

| Marco | Final da semana | Evidência |
| --- | --- | --- |
| M1 — Fundação | 2 | Aplicações base e navegação simulada. |
| M2 — Autenticação | 4 | Login integrado nos dois frontends. |
| M3 — Planejamento | 6 | Modelo e inspeção criados pela web. |
| M4 — Execução online | 8 | Checklist dinâmico enviado à API. |
| M5 — Recursos nativos | 10 | Foto, QR Code e localização. |
| M6 — Offline | 12 | Inspeção concluída sem rede e sincronizada. |
| M7 — Revisão | 14 | Aprovação ou reprovação com histórico. |
| M8 — Release | 16 | Build, painel e API demonstrados. |

---

## 16.7 Gestão de risco do cronograma

Caso exista atraso, a redução de escopo deverá seguir esta ordem:

1. Remover dashboard avançado;
2. Limitar tipos de resposta aos essenciais;
3. Manter apenas fotografia capturada, sem galeria;
4. Simplificar o construtor de modelos sem arrastar e soltar;
5. Limitar o conflito à detecção e bloqueio;
6. Adiar notificações, PDF e assinatura;
7. Manter obrigatoriamente autenticação, planejamento, checklist, foto, offline, sincronização e revisão.
