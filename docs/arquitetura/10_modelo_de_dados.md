# 10. Modelo de Dados

## 10.1 Objetivo do modelo

O modelo de dados do FieldOps deverá suportar todo o ciclo de vida das inspeções:

```text
Cadastro do cliente
        ↓
Cadastro dos locais e equipamentos
        ↓
Criação do modelo de inspeção
        ↓
Publicação de uma versão imutável
        ↓
Agendamento da inspeção
        ↓
Criação do snapshot do checklist
        ↓
Execução em campo
        ↓
Registro de respostas e evidências
        ↓
Sincronização
        ↓
Revisão e aprovação
        ↓
Auditoria e preservação do histórico
```

O FieldOps utilizará dois contextos de persistência:

| Contexto | Tecnologia | Responsabilidade |
| --- | --- | --- |
| Persistência central | PostgreSQL | Fonte oficial dos dados sincronizados, regras de integridade, histórico e auditoria |
| Persistência local | SQLite | Operação offline, armazenamento das inspeções do técnico, respostas, evidências pendentes e fila de sincronização |

---

## 10.2 Princípios de modelagem

### Identificadores globais

As entidades deverão utilizar identificadores UUID.

Isso permitirá:

- Criar registros no dispositivo sem depender do servidor;
- Evitar identificadores locais temporários;
- Reduzir remapeamentos durante a sincronização;
- Reenviar operações sem criar registros duplicados;
- Identificar entidades de forma consistente entre SQLite e PostgreSQL.

### Separação entre modelo e execução

O modelo reutilizável de inspeção não deverá ser confundido com uma inspeção realizada.

```text
Modelo de inspeção
        ↓
Versão publicada
        ↓
Inspeção agendada
        ↓
Snapshot dos itens
        ↓
Respostas
```

O modelo define como futuras inspeções deverão funcionar.

A inspeção representa uma execução real em determinada data, cliente, local ou equipamento.

### Versionamento imutável

Uma versão publicada de um modelo não poderá ser alterada de forma destrutiva.

Quando houver mudanças no checklist, uma nova versão deverá ser criada.

Isso garante que inspeções antigas continuem associadas ao conteúdo que estava válido no momento do agendamento.

### Snapshot da inspeção

Cada inspeção possuirá uma cópia dos itens da versão utilizada.

Essa cópia será armazenada em `InspectionItemSnapshot`.

O snapshot preservará:

- Título da seção;
- Ordem da seção;
- Texto do item;
- Descrição;
- Tipo de resposta;
- Obrigatoriedade;
- Regras de observação;
- Regras de evidência;
- Opções de seleção;
- Ordem do item.

### Preservação histórica

Entidades utilizadas por inspeções não deverão ser excluídas fisicamente pelo fluxo comum.

Deverão ser utilizados:

- Inativação;
- Exclusão lógica;
- Versionamento;
- Snapshots;
- Eventos de auditoria.

### Estado de negócio e sincronização

O estado da inspeção deverá permanecer separado do estado de sincronização do dispositivo.

Exemplo:

```text
Estado de negócio: EM_ANDAMENTO
Estado local: PENDENTE
```

Isso significa que a inspeção está sendo executada, mas possui alterações locais ainda não enviadas.

### Arquivos fora do banco relacional

Fotografias e outros arquivos grandes não serão armazenados diretamente no PostgreSQL.

O banco guardará:

- Identificador da evidência;
- Tipo;
- Tamanho;
- Formato;
- Chave do arquivo;
- Vínculo com a inspeção;
- Vínculo com a resposta ou não conformidade;
- Datas de captura e envio.

O arquivo será mantido em armazenamento de objetos ou mecanismo equivalente.

### Controle de concorrência

Entidades sujeitas a alterações concorrentes deverão possuir controle de versão otimista.

Exemplo:

```text
version = 3
```

Uma atualização baseada na versão 2 deverá ser rejeitada ou tratada como conflito caso o servidor já esteja na versão 3.

---

## 10.3 Diagrama conceitual textual

```text
USER
 ├── cria ou agenda ── N INSPECTION
 ├── executa ───────── N INSPECTION
 ├── revisa ────────── N INSPECTION_REVIEW
 └── realiza ações ─── N AUDIT_EVENT

CLIENT 1 ── N INSPECTION_SITE
INSPECTION_SITE 1 ── 0..N EQUIPMENT

INSPECTION_TEMPLATE 1 ── N INSPECTION_TEMPLATE_VERSION
INSPECTION_TEMPLATE_VERSION 1 ── N TEMPLATE_SECTION
TEMPLATE_SECTION 1 ── N TEMPLATE_ITEM

INSPECTION_TEMPLATE_VERSION 1 ── N INSPECTION

CLIENT 1 ── N INSPECTION
INSPECTION_SITE 1 ── N INSPECTION
EQUIPMENT 1 ── 0..N INSPECTION
USER 1 ── N INSPECTION

INSPECTION 1 ── N INSPECTION_ITEM_SNAPSHOT
INSPECTION_ITEM_SNAPSHOT 1 ── 0..1 INSPECTION_RESPONSE
INSPECTION_RESPONSE 1 ── 0..N EVIDENCE

INSPECTION 1 ── 0..N NON_CONFORMITY
INSPECTION_RESPONSE 1 ── 0..N NON_CONFORMITY
NON_CONFORMITY 1 ── 0..N EVIDENCE

INSPECTION 1 ── 0..N INSPECTION_REVIEW
INSPECTION 1 ── N AUDIT_EVENT
```

---

## 10.4 Como interpretar as cardinalidades

### Cardinalidade `1 ── N`

Representa um relacionamento de um para muitos.

Exemplo:

```text
CLIENT 1 ── N INSPECTION_SITE
```

Um cliente pode possuir vários locais de inspeção.

Cada local pertence a um cliente.

### Cardinalidade `1 ── 0..N`

Representa um relacionamento de um para zero ou muitos.

Exemplo:

```text
INSPECTION_RESPONSE 1 ── 0..N EVIDENCE
```

Uma resposta pode não possuir evidências ou pode possuir várias evidências.

### Cardinalidade `1 ── 0..1`

Representa um relacionamento de um para zero ou um.

Exemplo:

```text
INSPECTION_ITEM_SNAPSHOT 1 ── 0..1 INSPECTION_RESPONSE
```

Um item pode ainda não ter sido respondido ou pode possuir uma única resposta.

---

## 10.5 Estrutura organizacional

### 10.5.1 Client

A entidade `Client` representa a empresa, instituição ou organização atendida pela operação de inspeções.

Um cliente poderá possuir vários locais de inspeção.

```text
CLIENT
    ├── INSPECTION_SITE
    ├── INSPECTION_SITE
    └── INSPECTION_SITE
```

#### Campos

| Campo | Tipo sugerido | Regra |
| --- | --- | --- |
| id | UUID | Chave primária |
| name | string | Nome de exibição obrigatório |
| legal_name | string | Razão social opcional no MVP |
| document | string | Documento opcional e validado |
| email | string | Opcional |
| phone | string | Opcional |
| status | enum | ACTIVE ou INACTIVE |
| created_at | datetime | Gerado pelo servidor |
| updated_at | datetime | Gerado pelo servidor |
| version | integer | Controle otimista |

#### Relacionamentos

```text
CLIENT 1 ── N INSPECTION_SITE
CLIENT 1 ── N INSPECTION
```

Um cliente inativo continuará relacionado às inspeções históricas, mas não poderá ser selecionado em novos agendamentos.

---

### 10.5.2 InspectionSite

A entidade `InspectionSite` representa uma unidade, fábrica, loja, obra, depósito, prédio, setor ou outra localização pertencente ao cliente.

#### Exemplo

```text
Cliente: Indústria Alfa
    ├── Unidade Sorocaba
    ├── Unidade Itu
    └── Unidade Campinas
```

#### Campos

| Campo | Tipo sugerido | Regra |
| --- | --- | --- |
| id | UUID | Chave primária |
| client_id | UUID | Cliente proprietário |
| name | string | Obrigatório |
| description | string | Opcional |
| address_line | string | Endereço |
| city | string | Cidade |
| state | string | Estado |
| postal_code | string | CEP |
| latitude | decimal | Coordenada opcional |
| longitude | decimal | Coordenada opcional |
| contact_name | string | Responsável local opcional |
| contact_phone | string | Opcional |
| status | enum | ACTIVE ou INACTIVE |
| created_at | datetime | Auditoria |
| updated_at | datetime | Auditoria |
| version | integer | Controle otimista |

#### Relacionamentos

```text
CLIENT 1 ── N INSPECTION_SITE
INSPECTION_SITE 1 ── 0..N EQUIPMENT
INSPECTION_SITE 1 ── N INSPECTION
```

Todo local deverá pertencer a um cliente.

---

### 10.5.3 Equipment

A entidade `Equipment` representa o ativo físico que poderá ser identificado e inspecionado.

#### Exemplo

```text
Unidade Sorocaba
    ├── Empilhadeira 01
    ├── Gerador 02
    ├── Compressor 03
    └── Extintor 15
```

#### Campos

| Campo | Tipo sugerido | Regra |
| --- | --- | --- |
| id | UUID | Chave primária |
| site_id | UUID | Local ao qual pertence |
| name | string | Obrigatório |
| asset_number | string | Número patrimonial opcional |
| serial_number | string | Número de série opcional |
| manufacturer | string | Fabricante opcional |
| model | string | Modelo opcional |
| description | string | Opcional |
| qr_code | string | Único |
| status | enum | ACTIVE, INACTIVE ou DECOMMISSIONED |
| installed_at | date | Opcional |
| created_at | datetime | Auditoria |
| updated_at | datetime | Auditoria |
| version | integer | Controle otimista |

#### Relacionamentos

```text
INSPECTION_SITE 1 ── 0..N EQUIPMENT
EQUIPMENT 1 ── 0..N INSPECTION
```

No MVP, todo equipamento deverá pertencer a um local.

Uma inspeção poderá não possuir equipamento quando for destinada ao ambiente ou ao local como um todo.

---

## 10.6 Usuários e responsabilidades

### 10.6.1 User

A entidade `User` representa as pessoas autorizadas a utilizar o FieldOps.

#### Perfis previstos

```text
ADMIN
SUPERVISOR
TECHNICIAN
CLIENT_VIEWER
```

#### Campos

| Campo | Tipo sugerido | Regra |
| --- | --- | --- |
| id | UUID | Chave primária |
| name | string | Obrigatório |
| email | string | Obrigatório e único |
| password_hash | string | Nunca exposto pela API |
| role | enum | Perfil autorizado |
| status | enum | ACTIVE, INACTIVE ou BLOCKED |
| phone | string | Opcional |
| created_at | datetime | Gerado pelo servidor |
| updated_at | datetime | Gerado pelo servidor |
| version | integer | Controle otimista |

#### Relacionamentos principais

```text
USER
 ├── cria ou agenda → INSPECTION
 ├── executa → INSPECTION
 ├── supervisiona → INSPECTION
 ├── revisa → INSPECTION_REVIEW
 └── realiza → AUDIT_EVENT
```

Uma inspeção poderá possuir referências distintas para:

- Usuário que criou;
- Técnico responsável;
- Supervisor responsável;
- Usuário que cancelou;
- Usuário que aprovou ou reprovou.

A inativação de um usuário não excluirá seu histórico.

---

## 10.7 Modelos de inspeção

### 10.7.1 InspectionTemplate

A entidade `InspectionTemplate` representa a identidade lógica e reutilizável de um modelo de inspeção.

Exemplo:

```text
Checklist de Inspeção de Extintores
```

Ela não representa diretamente uma versão publicada.

#### Campos

| Campo | Tipo sugerido | Regra |
| --- | --- | --- |
| id | UUID | Identidade lógica do modelo |
| title | string | Obrigatório |
| description | string | Opcional |
| category | string | Obrigatório |
| status | enum | DRAFT, ACTIVE ou INACTIVE |
| current_version | integer | Última versão publicada |
| created_by | UUID | Usuário criador |
| created_at | datetime | Auditoria |
| updated_at | datetime | Auditoria |
| version | integer | Controle otimista do registro |

#### Relacionamento

```text
INSPECTION_TEMPLATE 1 ── N INSPECTION_TEMPLATE_VERSION
```

Um modelo pode possuir várias versões.

---

### 10.7.2 InspectionTemplateVersion

A entidade `InspectionTemplateVersion` representa uma publicação imutável do modelo.

#### Exemplo

```text
Checklist de Extintores
    ├── Versão 1
    ├── Versão 2
    └── Versão 3
```

#### Campos

| Campo | Tipo sugerido | Regra |
| --- | --- | --- |
| id | UUID | Chave da versão |
| template_id | UUID | Modelo lógico |
| version_number | integer | Sequencial por modelo |
| title_snapshot | string | Título preservado |
| description_snapshot | string | Descrição preservada |
| published_by | UUID | Usuário responsável |
| published_at | datetime | Data de publicação |
| active_for_new_inspections | boolean | Permite novos agendamentos |
| created_at | datetime | Auditoria |

#### Relacionamentos

```text
INSPECTION_TEMPLATE 1 ── N INSPECTION_TEMPLATE_VERSION
INSPECTION_TEMPLATE_VERSION 1 ── N TEMPLATE_SECTION
INSPECTION_TEMPLATE_VERSION 1 ── N INSPECTION
```

Cada inspeção deverá utilizar uma versão específica.

A versão utilizada não poderá ser alterada após a publicação.

---

### 10.7.3 TemplateSection

A entidade `TemplateSection` organiza os itens do checklist em grupos.

#### Exemplo

```text
Checklist de Empilhadeira
    ├── Identificação
    ├── Condições externas
    ├── Sistema elétrico
    ├── Sistema hidráulico
    └── Resultado final
```

#### Campos

| Campo | Tipo sugerido | Regra |
| --- | --- | --- |
| id | UUID | Chave primária |
| template_version_id | UUID | Versão proprietária |
| title | string | Obrigatório |
| description | string | Opcional |
| display_order | integer | Ordem explícita |
| created_at | datetime | Auditoria |

#### Relacionamento

```text
INSPECTION_TEMPLATE_VERSION 1 ── N TEMPLATE_SECTION
```

A seção pertence à versão publicada, e não diretamente ao modelo lógico.

---

### 10.7.4 TemplateItem

A entidade `TemplateItem` representa uma pergunta, verificação, instrução ou medição pertencente a uma seção.

#### Exemplo

```text
Seção: Sistema elétrico
    ├── A bateria apresenta danos?
    ├── Os cabos estão corretamente isolados?
    ├── As luzes estão funcionando?
    └── A buzina está funcionando?
```

#### Campos

| Campo | Tipo sugerido | Regra |
| --- | --- | --- |
| id | UUID | Chave primária |
| section_id | UUID | Seção proprietária |
| code | string | Código legível opcional |
| title | string | Pergunta ou instrução |
| description | string | Texto de ajuda opcional |
| response_type | enum | Tipo da resposta |
| required | boolean | Define obrigatoriedade |
| observation_required_on_failure | boolean | Exige observação na falha |
| evidence_required_on_failure | boolean | Exige evidência na falha |
| options_json | JSON | Alternativas e configurações |
| display_order | integer | Ordem explícita |
| created_at | datetime | Auditoria |

#### Tipos de resposta do MVP

```text
TEXT_SHORT
TEXT_LONG
NUMBER
BOOLEAN
CONFORMITY
SINGLE_CHOICE
DATE
```

#### Relacionamento

```text
TEMPLATE_SECTION 1 ── N TEMPLATE_ITEM
```

---

### 10.7.5 Exemplo completo de modelo

```text
INSPECTION_TEMPLATE
Checklist de Extintores

    └── INSPECTION_TEMPLATE_VERSION
        Versão 2

            ├── TEMPLATE_SECTION
            │   Identificação
            │       ├── Número do patrimônio
            │       └── Localização
            │
            ├── TEMPLATE_SECTION
            │   Condições físicas
            │       ├── O lacre está intacto?
            │       ├── O manômetro está na faixa verde?
            │       └── Existe corrosão?
            │
            └── TEMPLATE_SECTION
                Evidências
                    └── Fotografar o extintor
```

---

## 10.8 Execução da inspeção

### 10.8.1 Inspection

A entidade `Inspection` representa uma execução real de um checklist.

Ela estará relacionada:

- A uma versão publicada;
- A um cliente;
- A um local;
- Opcionalmente a um equipamento;
- A um técnico;
- A um supervisor;
- A uma data prevista;
- A um estado de negócio.

#### Campos

| Campo | Tipo sugerido | Regra |
| --- | --- | --- |
| id | UUID | Identificador global |
| template_version_id | UUID | Versão utilizada |
| client_id | UUID | Cliente |
| site_id | UUID | Local |
| equipment_id | UUID | Opcional conforme o tipo |
| technician_id | UUID | Técnico responsável |
| supervisor_id | UUID | Supervisor responsável |
| created_by | UUID | Usuário que criou ou agendou |
| title | string | Nome de apresentação |
| instructions | string | Orientações adicionais |
| priority | enum | LOW, MEDIUM, HIGH ou CRITICAL |
| status | enum | Estado de negócio |
| scheduled_for | datetime | Data prevista |
| started_at_device | datetime | Horário registrado no dispositivo |
| started_at_server | datetime | Horário recebido pelo servidor |
| completed_at_device | datetime | Horário registrado no dispositivo |
| submitted_at_server | datetime | Horário confirmado pelo servidor |
| approved_at | datetime | Data de aprovação |
| canceled_at | datetime | Data do cancelamento |
| canceled_by | UUID | Usuário que cancelou |
| canceled_reason | string | Obrigatório no cancelamento |
| created_at | datetime | Auditoria |
| updated_at | datetime | Auditoria |
| version | integer | Controle otimista |

#### Estados de negócio

```text
DRAFT
ASSIGNED
IN_PROGRESS
SUBMITTED
UNDER_REVIEW
APPROVED
REJECTED
CANCELED
```

#### Relacionamentos

```text
INSPECTION_TEMPLATE_VERSION 1 ── N INSPECTION
CLIENT 1 ── N INSPECTION
INSPECTION_SITE 1 ── N INSPECTION
EQUIPMENT 1 ── 0..N INSPECTION
USER 1 ── N INSPECTION
```

Uma inspeção poderá estar relacionada a um equipamento ou somente ao local.

---

### 10.8.2 Criação da inspeção

Ao confirmar o agendamento, a API deverá:

1. Validar cliente, local, equipamento, técnico e supervisor;
2. Validar que a versão do modelo está publicada;
3. Criar a inspeção;
4. Copiar as seções e os itens da versão;
5. Criar os registros de `InspectionItemSnapshot`;
6. Registrar o evento de auditoria;
7. Disponibilizar a inspeção para sincronização pelo técnico.

---

### 10.8.3 InspectionItemSnapshot

A entidade `InspectionItemSnapshot` preserva o conteúdo do checklist utilizado pela inspeção.

#### Por que o snapshot é necessário

Considere a pergunta original:

```text
O extintor está dentro da validade?
```

Em uma versão futura, ela pode ser alterada para:

```text
O extintor está dentro da validade indicada no selo?
```

A inspeção antiga deverá continuar exibindo a pergunta original.

Sem o snapshot, um relatório histórico poderia apresentar um texto diferente daquele que o técnico respondeu.

#### Campos

| Campo | Tipo sugerido | Regra |
| --- | --- | --- |
| id | UUID | Chave primária |
| inspection_id | UUID | Inspeção proprietária |
| source_template_item_id | UUID | Referência histórica opcional |
| section_title | string | Texto preservado |
| section_description | string | Descrição preservada |
| section_order | integer | Ordem preservada |
| item_code | string | Código preservado |
| item_title | string | Texto preservado |
| item_description | string | Ajuda preservada |
| response_type | enum | Tipo preservado |
| required | boolean | Obrigatoriedade preservada |
| rules_json | JSON | Configurações preservadas |
| options_json | JSON | Alternativas preservadas |
| item_order | integer | Ordem preservada |
| created_at | datetime | Data de criação do snapshot |

#### Relacionamento

```text
INSPECTION 1 ── N INSPECTION_ITEM_SNAPSHOT
```

Uma inspeção terá um snapshot para cada item do checklist.

---

### 10.8.4 InspectionResponse

A entidade `InspectionResponse` armazena a resposta fornecida para um item do snapshot.

#### Cardinalidade

```text
INSPECTION_ITEM_SNAPSHOT 1 ── 0..1 INSPECTION_RESPONSE
```

Um item poderá:

- Não possuir resposta enquanto estiver pendente;
- Possuir uma resposta depois de preenchido.

Não deverão existir duas respostas atuais para o mesmo item.

#### Restrição recomendada

```sql
UNIQUE(inspection_item_id)
```

#### Campos

| Campo | Tipo sugerido | Regra |
| --- | --- | --- |
| id | UUID | Gerável no dispositivo |
| inspection_id | UUID | Inspeção |
| inspection_item_id | UUID | Item do snapshot |
| value_text | string | Valor textual |
| value_number | decimal | Valor numérico |
| value_boolean | boolean | Valor lógico |
| value_date | date | Data |
| value_json | JSON | Seleções ou estruturas adicionais |
| observation | string | Comentário do técnico |
| conformity | enum | NOT_APPLICABLE, CONFORMING ou NON_CONFORMING |
| answered_by | UUID | Técnico |
| answered_at_device | datetime | Horário do dispositivo |
| server_received_at | datetime | Horário de recebimento |
| created_at | datetime | Auditoria |
| updated_at | datetime | Auditoria |
| version | integer | Controle otimista |

#### Exemplos

##### Resposta lógica

```text
Pergunta: O lacre está intacto?
Resposta: Sim
```

##### Resposta numérica

```text
Pergunta: Qual é a pressão medida?
Resposta: 8,5
```

##### Resposta textual

```text
Pergunta: Descreva a irregularidade.
Resposta: Cabo elétrico com isolamento danificado.
```

---

## 10.9 Evidências

### 10.9.1 Evidence

A entidade `Evidence` representa um arquivo ou registro utilizado para comprovar uma resposta ou ocorrência.

No MVP, o principal tipo será fotografia.

#### Possíveis vínculos

Uma evidência poderá estar relacionada:

- Diretamente à inspeção;
- A uma resposta;
- A uma não conformidade.

#### Relacionamentos

```text
INSPECTION 1 ── 0..N EVIDENCE
INSPECTION_RESPONSE 1 ── 0..N EVIDENCE
NON_CONFORMITY 1 ── 0..N EVIDENCE
```

Uma evidência sempre pertencerá a uma inspeção.

Os vínculos com resposta e não conformidade serão opcionais conforme o contexto.

#### Campos

| Campo | Tipo sugerido | Regra |
| --- | --- | --- |
| id | UUID | Gerável no dispositivo |
| inspection_id | UUID | Obrigatório |
| response_id | UUID | Opcional |
| non_conformity_id | UUID | Opcional |
| type | enum | PHOTO no MVP |
| storage_key | string | Referência no serviço de arquivos |
| local_uri | string | Somente no banco local |
| original_file_name | string | Opcional e não utilizado como identificador |
| mime_type | string | Formato validado |
| size_bytes | long | Tamanho do arquivo |
| checksum | string | Integridade e deduplicação opcional |
| description | string | Opcional |
| latitude | decimal | Opcional |
| longitude | decimal | Opcional |
| captured_at_device | datetime | Horário da captura |
| server_received_at | datetime | Recebimento dos metadados |
| uploaded_at | datetime | Confirmação do arquivo |
| created_by | UUID | Técnico |
| created_at | datetime | Auditoria |

#### Exemplo

```text
Pergunta:
A bateria está em boas condições?

Resposta:
Não

Evidências:
    ├── Foto geral da bateria
    └── Foto aproximada dos terminais com corrosão
```

O arquivo local não poderá ser removido enquanto o servidor não confirmar o upload.

---

## 10.10 Não conformidades

### 10.10.1 NonConformity

A entidade `NonConformity` representa um problema, desvio ou irregularidade identificada durante a inspeção.

#### Exemplo

```text
Inspeção da Empilhadeira 01
    ├── Pneu dianteiro desgastado
    ├── Buzina não funciona
    └── Vazamento hidráulico
```

#### Campos

| Campo | Tipo sugerido | Regra |
| --- | --- | --- |
| id | UUID | Gerável no dispositivo |
| inspection_id | UUID | Obrigatório |
| inspection_item_id | UUID | Item relacionado opcional |
| response_id | UUID | Resposta relacionada opcional |
| title | string | Obrigatório |
| description | string | Obrigatório |
| severity | enum | LOW, MEDIUM, HIGH ou CRITICAL |
| status | enum | OPEN no MVP |
| created_by | UUID | Técnico |
| created_at_device | datetime | Data de campo |
| server_received_at | datetime | Data de recebimento |
| created_at | datetime | Auditoria |
| updated_at | datetime | Auditoria |
| version | integer | Controle otimista |

#### Relacionamentos

```text
INSPECTION 1 ── 0..N NON_CONFORMITY
INSPECTION_RESPONSE 1 ── 0..N NON_CONFORMITY
NON_CONFORMITY 1 ── 0..N EVIDENCE
```

A associação com a resposta permite localizar diretamente:

- A pergunta;
- A resposta;
- A observação;
- As evidências;
- A não conformidade gerada.

#### Exemplo completo

```text
Pergunta:
O manômetro está na faixa adequada?

Resposta:
Não

Não conformidade:
Manômetro fora da faixa operacional.

Gravidade:
Alta

Evidências:
    └── Fotografia do manômetro
```

---

## 10.11 Revisão da inspeção

### 10.11.1 InspectionReview

A entidade `InspectionReview` registra cada ciclo de revisão executado por um supervisor.

Uma inspeção poderá ser revisada mais de uma vez.

#### Exemplo

```text
1. Técnico envia a inspeção
2. Supervisor solicita correção
3. Técnico corrige
4. Supervisor revisa novamente
5. Supervisor aprova
```

#### Campos

| Campo | Tipo sugerido | Regra |
| --- | --- | --- |
| id | UUID | Chave primária |
| inspection_id | UUID | Inspeção revisada |
| reviewer_id | UUID | Supervisor |
| decision | enum | APPROVED ou REJECTED |
| reason | string | Obrigatório na reprovação |
| comments | string | Opcional |
| reviewed_at | datetime | Data do servidor |
| review_cycle | integer | Número da rodada |
| created_at | datetime | Auditoria |

#### Relacionamento

```text
INSPECTION 1 ── 0..N INSPECTION_REVIEW
```

#### Exemplo de registros

| Ciclo | Responsável | Decisão |
| --- | --- | --- |
| 1 | Supervisor João | REJECTED |
| 2 | Supervisor João | APPROVED |

Não deverão ser utilizados apenas campos como `approved_by` para representar todo o processo, pois isso eliminaria o histórico das revisões anteriores.

---

## 10.12 Auditoria

### 10.12.1 AuditEvent

A entidade `AuditEvent` registra as ações relevantes realizadas no sistema.

#### Exemplos de eventos

```text
INSPECTION_CREATED
INSPECTION_ASSIGNED
INSPECTION_STARTED
RESPONSE_CREATED
RESPONSE_UPDATED
EVIDENCE_ADDED
EVIDENCE_REMOVED
NON_CONFORMITY_CREATED
INSPECTION_COMPLETED
INSPECTION_SUBMITTED
REVIEW_STARTED
INSPECTION_APPROVED
INSPECTION_REJECTED
INSPECTION_CANCELED
```

#### Campos

| Campo | Tipo sugerido | Regra |
| --- | --- | --- |
| id | UUID | Chave primária |
| inspection_id | UUID | Inspeção relacionada, quando aplicável |
| actor_id | UUID | Usuário responsável, quando conhecido |
| action | string | Ação realizada |
| entity_type | string | Tipo da entidade afetada |
| entity_id | UUID | Identificador afetado |
| occurred_at | datetime | Data do servidor |
| device_occurred_at | datetime | Data do dispositivo, quando aplicável |
| previous_value_json | JSON | Estado anterior não sensível |
| new_value_json | JSON | Novo estado não sensível |
| metadata_json | JSON | Metadados adicionais |
| request_id | string | Correlação técnica |
| device_id | string | Dispositivo, quando aplicável |

#### Relacionamento

```text
INSPECTION 1 ── N AUDIT_EVENT
```

#### Exemplo de histórico

```text
08:00 — Inspeção criada
08:05 — Inspeção atribuída ao técnico
08:12 — Técnico iniciou a inspeção
08:20 — Resposta registrada
08:23 — Fotografia capturada
08:30 — Não conformidade criada
08:50 — Inspeção concluída no dispositivo
09:15 — Sincronização confirmada
09:40 — Supervisor iniciou a revisão
09:50 — Supervisor solicitou correção
11:20 — Técnico enviou a correção
12:00 — Supervisor aprovou
```

Os registros de auditoria não poderão ser alterados ou excluídos por usuários comuns.

---

## 10.13 Estruturas locais do aplicativo mobile

O SQLite deverá armazenar os dados necessários para que o técnico execute as inspeções sem conexão.

### 10.13.1 Dados centrais replicados localmente

O aplicativo poderá manter representações locais de:

- Usuário autenticado;
- Cliente relacionado;
- Local relacionado;
- Equipamento relacionado;
- Inspeções atribuídas;
- Snapshots dos itens;
- Respostas;
- Evidências;
- Não conformidades;
- Revisões e solicitações de correção.

A base local não será uma cópia completa do PostgreSQL.

Somente os dados autorizados e necessários ao técnico serão baixados.

---

### 10.13.2 Estado local das entidades

Entidades sincronizáveis poderão possuir metadados locais adicionais.

| Campo local | Finalidade |
| --- | --- |
| local_sync_status | Indicar sincronizado, pendente, erro ou conflito |
| is_dirty | Informar se existem alterações locais |
| last_synced_at | Data da última confirmação |
| base_version | Versão do servidor usada como base |
| local_updated_at | Última alteração no dispositivo |
| sync_error | Último erro sanitizado |
| deleted_locally | Exclusão lógica ainda não confirmada |

Esses campos não precisam existir da mesma forma no PostgreSQL.

---

### 10.13.3 SyncOperation

A entidade local `SyncOperation` representa uma operação pendente na outbox.

Cada alteração sincronizável deverá gerar ou atualizar uma operação.

#### Campos

| Campo | Tipo sugerido | Regra |
| --- | --- | --- |
| operation_id | UUID | Chave idempotente |
| entity_type | string | Tipo da entidade |
| entity_id | UUID | Registro afetado |
| operation_type | enum | CREATE, UPDATE, DELETE_LOGICAL, TRANSITION ou UPLOAD |
| base_version | integer | Versão usada como base |
| payload_json | JSON | Dados necessários |
| dependency_ids | JSON | Operações que devem ser concluídas antes |
| status | enum | PENDING, PROCESSING, FAILED, CONFLICT ou COMPLETED |
| attempt_count | integer | Número de tentativas |
| last_error | string | Mensagem sanitizada |
| created_at | datetime | Data local |
| updated_at | datetime | Última alteração |
| last_attempt_at | datetime | Última tentativa |
| completed_at | datetime | Confirmação local |

#### Exemplo de dependência

```text
Operação 1: criar resposta
        ↓
Operação 2: enviar fotografia vinculada à resposta
```

A operação de upload não deverá ser enviada antes da criação da resposta relacionada.

---

### 10.13.4 SyncMetadata

A estrutura `SyncMetadata` armazena informações gerais da sincronização local.

#### Campos

| Campo | Tipo sugerido | Regra |
| --- | --- | --- |
| user_id | UUID | Usuário da base local |
| device_id | UUID | Identificador da instalação |
| last_pull_cursor | string | Cursor de alterações do servidor |
| last_sync_started_at | datetime | Início da última tentativa |
| last_successful_sync | datetime | Última sincronização completa |
| last_sync_result | enum | SUCCESS, PARTIAL ou FAILED |
| pending_operations | integer | Quantidade pendente, quando mantida |
| schema_version | integer | Versão do banco local |

O cursor somente deverá ser atualizado após as alterações recebidas serem gravadas com sucesso no SQLite.

---

## 10.14 Fluxo de persistência offline

### 10.14.1 Download inicial

```text
Aplicativo solicita alterações
        ↓
API identifica o técnico
        ↓
API retorna inspeções autorizadas
        ↓
Aplicativo grava os dados em transação
        ↓
SQLite confirma a persistência
        ↓
Cursor local é atualizado
        ↓
Inspeções ficam disponíveis offline
```

### 10.14.2 Salvamento de resposta

```text
Técnico responde um item
        ↓
Aplicativo valida o valor
        ↓
Resposta é salva no SQLite
        ↓
Operação é criada ou consolidada na outbox
        ↓
Interface informa "Salvo no dispositivo"
```

A interface não deverá aguardar uma resposta da API para considerar o valor salvo localmente.

### 10.14.3 Salvamento de evidência

```text
Técnico captura a fotografia
        ↓
Arquivo é mantido no dispositivo
        ↓
Metadados são salvos no SQLite
        ↓
Operação de upload é criada
        ↓
Evidência aparece como pendente
```

O arquivo somente poderá ser removido após confirmação segura do servidor ou exclusão explícita permitida.

### 10.14.4 Conclusão offline

```text
Aplicativo valida o checklist
        ↓
Técnico confirma a conclusão
        ↓
Data do dispositivo é registrada
        ↓
Inspeção é bloqueada localmente
        ↓
Operação de conclusão entra na outbox
        ↓
Interface exibe "Aguardando sincronização"
```

### 10.14.5 Envio da outbox

```text
Conectividade disponível
        ↓
Aplicativo seleciona operações pendentes
        ↓
Operações são ordenadas por dependência
        ↓
Lote é enviado com IDs idempotentes
        ↓
API processa cada operação
        ↓
Aplicativo registra o resultado individual
        ↓
Operações confirmadas são encerradas
        ↓
Falhas continuam pendentes
```

---

## 10.15 Regras de integridade

### 10.15.1 Restrições obrigatórias

Deverão existir restrições para garantir:

- E-mail de usuário único;
- QR Code de equipamento único;
- Número da versão único dentro do modelo;
- Ordem de seção coerente dentro da versão;
- Ordem de item coerente dentro da seção;
- No máximo uma resposta atual por item do snapshot;
- Vínculo válido entre cliente, local e equipamento;
- Vínculo válido entre inspeção e versão publicada;
- Vínculo da resposta com item pertencente à mesma inspeção;
- Vínculo da evidência com a inspeção correta;
- Vínculo da não conformidade com a inspeção correta;
- Identificador de operação de sincronização único.

### 10.15.2 Índices recomendados

#### User

```sql
UNIQUE(email)
INDEX(status)
INDEX(role)
```

#### Equipment

```sql
UNIQUE(qr_code)
INDEX(site_id)
INDEX(status)
INDEX(asset_number)
```

#### Inspection

```sql
INDEX(technician_id, status)
INDEX(supervisor_id, status)
INDEX(client_id)
INDEX(site_id)
INDEX(equipment_id)
INDEX(scheduled_for)
INDEX(status, scheduled_for)
```

#### InspectionItemSnapshot

```sql
INDEX(inspection_id)
INDEX(inspection_id, section_order, item_order)
```

#### InspectionResponse

```sql
UNIQUE(inspection_item_id)
INDEX(inspection_id)
INDEX(answered_by)
```

#### Evidence

```sql
INDEX(inspection_id)
INDEX(response_id)
INDEX(non_conformity_id)
INDEX(uploaded_at)
```

#### NonConformity

```sql
INDEX(inspection_id)
INDEX(severity)
INDEX(status)
```

#### AuditEvent

```sql
INDEX(entity_type, entity_id)
INDEX(inspection_id)
INDEX(actor_id)
INDEX(occurred_at)
INDEX(request_id)
```

---

## 10.16 Exclusão, inativação e histórico

### Exclusão lógica

Deverão ser inativados, em vez de excluídos fisicamente:

- Usuários;
- Clientes;
- Locais;
- Equipamentos;
- Modelos de inspeção.

### Registros históricos

Não deverão ser excluídos pelo fluxo comum:

- Versões publicadas;
- Inspeções;
- Snapshots;
- Respostas sincronizadas;
- Revisões;
- Eventos de auditoria.

### Evidências

A exclusão de uma evidência sincronizada deverá:

1. Validar o estado da inspeção;
2. Validar a permissão do usuário;
3. Registrar auditoria;
4. Remover ou bloquear o acesso ao objeto;
5. Preservar os metadados necessários para rastreabilidade.

---

## 10.17 Exemplo completo

### Contexto

```text
Cliente:
Indústria ABC

Local:
Fábrica Sorocaba

Equipamento:
Gerador Diesel GD-001

Modelo:
Checklist de Inspeção de Geradores

Versão:
Versão 3

Inspeção:
Inspeção #2026-00045
```

### Itens do snapshot

```text
1. O nível de óleo está adequado?
2. Existem vazamentos?
3. A bateria está em boas condições?
4. O gerador iniciou corretamente?
```

### Respostas

```text
1. Sim
2. Não existem vazamentos
3. Não
4. Sim
```

### Evidências da bateria

```text
- Foto geral da bateria
- Foto aproximada dos terminais
```

### Não conformidade

```text
Título:
Corrosão nos terminais da bateria

Descrição:
Foram identificados sinais de corrosão nos terminais.

Gravidade:
HIGH

Status:
OPEN
```

### Revisão

```text
Ciclo: 1
Decisão: APPROVED
Comentário: Inspeção aprovada com não conformidade aberta.
```

### Eventos de auditoria

```text
- Inspeção criada
- Snapshot gerado
- Inspeção atribuída
- Inspeção iniciada
- Respostas registradas
- Evidências adicionadas
- Não conformidade criada
- Inspeção concluída
- Dados sincronizados
- Revisão iniciada
- Inspeção aprovada
```

---

## 10.18 Resumo das entidades

| Entidade | Responsabilidade |
| --- | --- |
| `User` | Representar usuários, perfis e responsáveis pelas ações |
| `Client` | Representar a organização atendida |
| `InspectionSite` | Representar o local onde a inspeção ocorre |
| `Equipment` | Representar o ativo físico inspecionado |
| `InspectionTemplate` | Representar a identidade lógica do checklist |
| `InspectionTemplateVersion` | Representar uma publicação imutável do modelo |
| `TemplateSection` | Organizar os itens da versão em grupos |
| `TemplateItem` | Definir perguntas, verificações e regras |
| `Inspection` | Representar uma execução agendada do checklist |
| `InspectionItemSnapshot` | Preservar os itens utilizados na execução |
| `InspectionResponse` | Armazenar a resposta do técnico |
| `Evidence` | Armazenar metadados de fotografias e arquivos |
| `NonConformity` | Registrar problemas encontrados |
| `InspectionReview` | Registrar ciclos de revisão e decisões |
| `AuditEvent` | Registrar ações e mudanças relevantes |
| `SyncOperation` | Representar operações pendentes da outbox |
| `SyncMetadata` | Armazenar o estado geral da sincronização local |

---

## 10.19 Decisões consolidadas do modelo

1. O PostgreSQL será a fonte oficial após a sincronização.
2. O SQLite será uma persistência operacional, e não apenas um cache descartável.
3. Todas as entidades sincronizáveis utilizarão UUID.
4. O modelo de inspeção possuirá versões publicadas imutáveis.
5. Seções e itens pertencerão à versão publicada.
6. Cada inspeção utilizará uma única versão do modelo.
7. Cada inspeção possuirá snapshots dos itens.
8. Cada item do snapshot poderá possuir no máximo uma resposta atual.
9. Uma resposta poderá possuir nenhuma ou várias evidências.
10. A evidência sempre estará vinculada a uma inspeção.
11. A não conformidade poderá ser vinculada à resposta que a originou.
12. Uma inspeção poderá passar por vários ciclos de revisão.
13. Alterações críticas serão registradas por eventos de auditoria.
14. O estado de negócio permanecerá separado do estado de sincronização.
15. Operações offline serão registradas em uma outbox persistente.
16. Operações de sincronização serão idempotentes.
17. Arquivos serão sincronizados separadamente dos dados estruturados.
18. O aplicativo não descartará silenciosamente dados locais pendentes.
19. Registros históricos serão preservados por versionamento, snapshot, inativação e auditoria.
