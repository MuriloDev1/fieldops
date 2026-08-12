# Documentação de Arquitetura — Plataforma FieldOps

Esta documentação descreve a arquitetura técnica, as decisões de design e as regras de sincronização da plataforma **FieldOps**, um ecossistema integrado para planejamento, execução, acompanhamento e revisão de inspeções técnicas realizadas em campo.

O sistema foi concebido sob a premissa de **resiliência máxima**, com foco em uma experiência **local-first (offline-first)** para os técnicos em campo, sem comprometer a integridade e rastreabilidade dos dados exigidos pelo nível administrativo.

---

## 1. Visão Geral do Ecossistema

O ecossistema FieldOps é composto por quatro componentes centrais integrados que cobrem todo o fluxo operacional: do agendamento à auditoria das inspeções.

```
+-------------------------------------------------------+
|                Interface Administrativa Web           |
|                (Administração / Supervisão)           |
+---------------------------+---------------------------+
                            | (API REST)
                            v
+-------------------------------------------------------+
|                       API REST                        |
|                  (Núcleo de Negócios)                 |
+-------------+---------------------------+-------------+
              |                           |
              v                           v
+-------------+-------------+ +-----------+-------------+
|    PostgreSQL (Central)   | |      Object Storage     |
| (Cadastro, Regras, Audit) | |    (Arquivos / Fotos)   |
+---------------------------+ +-------------------------+
                            ^
                            | (Sincronização Idempotente)
                            |
+---------------------------+---------------------------+
|                     Aplicativo Mobile                 |
|             (Técnicos de Campo - SQLite)              |
+-------------------------------------------------------+
```

### 1.1. Aplicativo Mobile (Local-First)
* **Objetivo:** Canal principal de trabalho dos técnicos em campo [8].
* **Tecnologia Sugerida:** React Native com Expo (com suporte prioritário ao Android) [11].
* **Responsabilidades Técnicas:**
  * Autenticação segura e gerenciamento de sessão local [8].
  * Persistência de dados estruturados em banco de dados embarcado [10].
  * Execução offline de checklists dinâmicos baseados em estruturas mutáveis [8].
  * Captura de evidências (fotografias), metadados e localização geográfica (GPS) no início e fim das inspeções [8, 14].
  * Sincronização em segundo plano via fila local de transações (**Outbox**) [11, 12].

### 1.2. Interface Administrativa Web
* **Objetivo:** Portal de gestão para administradores e supervisores de inspeção [8].
* **Tecnologia Sugerida:** React (TypeScript) ou framework equivalente conectado à API.
* **Responsabilidades Técnicas:**
  * Gestão de cadastros base: clientes, locais (plantas) e equipamentos [8, 10].
  * Construtor de modelos de inspeção dinâmicos com definição de seções, itens, tipos de resposta e regras de criticidade [10].
  * Agendamento, planejamento e atribuição de inspeções a técnicos [8, 10].
  * Painel de revisão de inspeções finalizadas (mecanismo de aprovação e reprovação motivada) [8, 10].
  * Rastreamento de não conformidades identificadas em campo [8, 10].

### 1.3. API REST (Core Engine)
* **Objetivo:** Orquestrador central de regras de negócio, autenticação, autorização e persistência de dados do sistema [8].
* **Responsabilidades Técnicas:**
  * Validação rígida de estado e controle de acesso baseado em perfis (RBAC) [8, 10].
  * Processamento idempotente de lotes de sincronização vindos dos dispositivos móveis [10, 14].
  * Geração e fornecimento de contratos seguros de API documentados [10].
  * Registro detalhado de logs e trilhas de auditoria para ações críticas [10].

### 1.4. Infraestrutura de Dados
* **PostgreSQL:** Banco de dados relacional central para armazenamento do estado consolidado do sistema, cadastros, usuários, logs de auditoria e tabelas de configuração [10].
* **SQLite:** Banco de dados relacional embarcado no aplicativo mobile, garantindo consultas de alta performance e persistência local resiliente mesmo se o aplicativo for reiniciado ou fechado [10, 11].
* **Object Storage (S3-Compatible):** Armazenamento de arquivos binários (evidências fotográficas) associados às respostas não conformes das inspeções [10].

---

## 2. Estratégia Offline-First e Sincronização (Outbox)

O aplicativo FieldOps adota um padrão de arquitetura **local-first**, no qual todas as alterações feitas pelo técnico em campo são imediatamente gravadas no banco de dados local **SQLite** antes de serem enviadas à rede [13].

```
+-------------------+      Gravação Local      +-------------------+
| Ação do Técnico   | -----------------------> | SQLite Local      |
| (Salva Resposta)  |                          +---------+---------+
+-------------------+                                    |
                                                         | Cria Registro
                                                         v
+-------------------+      Sincronização       +-------------------+
| Servidor API REST | <----------------------- | Fila Outbox       |
| (PostgreSQL)      |        (Network)         | (SQLite)          |
+-------------------+                          +-------------------+
```

### 2.1. O Mecanismo de Outbox
1. **Gravação Atômica:** Quando o técnico confirma uma resposta ou conclui uma etapa, o aplicativo realiza uma transação atômica no SQLite local. Essa transação atualiza o estado da inspeção e insere a operação correspondente na tabela `outbox` [13, 14].
2. **Resiliência a Desligamentos:** Como a fila de sincronização reside no SQLite, os dados pendentes de envio **sobrevivem ao fechamento forçado ou descarga do dispositivo** (Regra **RN-066**) [14].
3. **Sincronização em Lote (Queue Processing):** O aplicativo monitora o estado de conectividade. Ao detectar conexão ativa (ou quando o usuário aciona o botão manual "Sincronizar agora" [1]), o motor de sincronização processa a fila de forma sequencial, respeitando a ordem cronológica e dependência das operações (Regra **RN-069**) [14].
4. **Isolamento de Erros:** Se uma transação falhar durante a transmissão, o sistema interrompe o processamento do lote dependente, mas as demais operações não dependentes na fila local permanecem intactas (Regra **RN-070**) [14].

---

## 3. Mecanismo de Sincronização e Idempotência

Em ambientes de operação de campo, a instabilidade da rede móvel é frequente. Um problema comum é o envio de dados pelo aplicativo, processamento correto pelo servidor e, em seguida, queda da conexão antes do cliente receber a resposta de sucesso. Sem garantias técnicas, um reenvio geraria dados duplicados.

### 3.1. Idempotência com UUIDs Clientes (Regras RN-067 e RN-068)
Para mitigar a duplicidade e falhas de rede, o FieldOps implementa **Idempotência Baseada em Chaves de Transação** [14]:

* **Geração da Chave no Cliente:** Toda mutação de dados (iniciar inspeção, salvar resposta, adicionar não conformidade, concluir inspeção) gera um identificador único universal (UUIDv4) no dispositivo móvel no instante da criação da ação local [14].
* **Envio da Operação:** Ao sincronizar, o aplicativo envia o payload acompanhado de seu respectivo `idempotency_key` (UUID) [14].
* **Tratamento na API REST:**
  1. O servidor recebe a requisição e verifica na tabela de controle de transações se o UUID recebido já foi processado com sucesso.
  2. **Caso não exista:** A operação é executada de forma atômica no PostgreSQL e o resultado (sucesso) é salvo associado àquele UUID.
  3. **Caso já exista:** O servidor descarta o reprocessamento e retorna imediatamente o mesmo payload de sucesso que foi gerado na primeira chamada (Regra **RN-068**) [14].

Isso garante que falhas de conexão durante a sincronização não gerem registros duplicados, mantendo a integridade do banco de dados central [14].

---

## 4. Ciclo de Vida da Inspeção e Snapshots

O ciclo de vida de uma inspeção técnica garante que a integridade histórica dos dados seja preservada ao longo de meses ou anos, independentemente de mudanças nas definições de engenharia.

### 4.1. Máquina de Estados da Inspeção
O fluxo de estados segue uma transição estrita protegida por regras na API (Regra **RN-089**) [15]:

```
    [ Agendada ] (Disponível no Mobile após Sincronização)
         |
         v (Ação de Início - RN-034)
   [ Em Execução ]
         |
         v (Validação de Itens Obrigatórios - RN-037)
 [ Concluída Local ] (Bloqueada para edição local - RN-043)
         |
         v (Sincronização bem-sucedida - RN-042)
  [ Em Revisão ] (Visualização do Supervisor)
     /       \
    /         \ (Supervisor Reprova - RN-080)
   /           v
  /      [ Reprovada ] (Desbloqueia para correções do técnico - RN-043)
  |            |
  |            v (Ajuste técnico preservando histórico - RN-083)
  |      [ Em Execução ]
  |
  v (Supervisor Aprova - RN-081)
[ Aprovada ] (Bloqueio total e permanente de edição - RN-082)
```

### 4.2. O Conceito de Snapshots Imutáveis (Regra RN-021)
Modelos de inspeção administrativa (formulários/checklists) sofrem revisões frequentes para adição ou remoção de perguntas [8, 10, 13]. Se uma inspeção em campo usasse apenas referências diretas ao modelo "pai", qualquer atualização no modelo web alteraria ou quebraria retroativamente as inspeções já realizadas [6].

* **A Solução:** No momento em que uma inspeção é agendada e vinculada a uma versão específica publicada do modelo (Regra **RN-024**), o sistema gera um **Snapshot Imutável** da estrutura de seções, itens e tipos de respostas daquela versão [13].
* **Persistência do Snapshot:** Esse snapshot é serializado e armazenado na própria estrutura de dados daquela inspeção técnica [13].
* **Independência de Versão:** Se o supervisor atualizar o modelo de inspeção criando uma nova versão (Regras **RN-019** e **RN-020**), as inspeções existentes continuam lendo e respondendo o snapshot imutável original [13]. A desativação de modelos não afeta inspeções legadas (Regra **RN-022**) [13].

---

## 5. Políticas de Auditoria, Segurança e Rastreabilidade

A plataforma FieldOps lida com segurança física de equipamentos industriais e técnicos ativos. Portanto, a integridade da auditoria é um requisito primordial do sistema.

### 5.1. Controle de Acesso e Permissões (RBAC)
* **Técnico em Campo:** Possui privilégios de leitura apenas das inspeções atribuídas a ele (Regra **RN-004**). Só ele pode iniciar e responder o checklist técnico designado (Regras **RN-032** e **RN-033**) [13].
* **Supervisor:** Pode acompanhar a execução, revisar respostas, mídias e aprovar/reprovar inspeções dentro do seu escopo territorial/administrativo (Regras **RN-005** e **RN-079**) [13, 14]. Não pode alterar respostas originais fornecidas pelo técnico (Regra **RN-084**) [14].
* **Administrador:** Gerencia usuários, clientes e modelos [13]. Não altera respostas por padrão (Regra **RN-006**) [13].

### 5.2. Preservação de Duplo Carimbo de Data/Hora (RN-042 e RN-074)
Devido à natureza offline, as ações ocorrem em um momento técnico e são registradas pelo servidor em outro momento cronológico. O FieldOps resolve isso exigindo dois campos separados para eventos temporais de início e fim da inspeção (Regra **RN-074**) [14]:

* **Timestamp de Execução (`executed_at`):** Capturado diretamente do relógio do dispositivo do técnico no momento exato em que a atividade de início ou finalização ocorreu em campo (mesmo se o aparelho estiver offline) [14]. Este é o valor real da realização do serviço usado para auditorias contratuais e produtividade [14, 18].
* **Timestamp de Sincronização (`synchronized_at`):** Gerado pelo servidor da API REST no instante exato em que a transação é processada pelo banco central [14].

### 5.3. Rastreabilidade de Não Conformidades (RN-038, RN-039 e RN-055)
O sistema implementa regras condicionais que automatizam a fiscalização de falhas graves:
* **Observação Obrigatória:** Se uma pergunta for respondida como "Não Conforme", o formulário exige automaticamente uma justificativa em texto (`observação`) (Regra **RN-038**) [13].
* **Evidência Obrigatória em Itens Críticos:** Se um item classificado como "Crítico" for apontado como "Não Conforme", o aplicativo exige obrigatoriamente anexar ao menos uma imagem/foto comprobatória (evidência fotográfica) antes de permitir a conclusão da inspeção (Regras **RN-039** e **RN-055**) [13, 14].
