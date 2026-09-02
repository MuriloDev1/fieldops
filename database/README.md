# FieldOps - Documentacao do Banco de Dados

## 1. Analise do repositorio atual

O repositorio clonado contem um app Expo/React Native em `fieldops-mobile`. A aplicacao ainda nao possui backend, banco de dados, camada de API ou persistencia local. O arquivo principal e `fieldops-mobile/App.tsx`, onde ficam:

- Navegacao por estado local entre quatro telas: `dashboard`, `inspecoes`, `equipamentos` e `perfil`.
- Dados mockados de equipamentos em `equipamentosIniciais`.
- Dados mockados de perguntas de modelo de inspecao em `perguntasIniciais`.
- Dashboard com indicadores, andamento semanal, acoes rapidas e nao conformidades mockadas.
- Tela de construtor de modelo de inspecao, com nome do modelo e lista de perguntas.
- Tela de equipamentos, com busca, filtros visuais e modal de detalhes.
- Tela de perfil com informacoes fixas de supervisor.

O banco precisa substituir esses mocks e suportar o crescimento natural da aplicacao: multiplos usuarios, locais operacionais, equipamentos, modelos de inspecao, execucoes em campo, respostas, nao conformidades, tarefas e indicadores.

## 2. Objetivo do banco

O banco deve permitir que a equipe operacional:

- Cadastre usuarios e seus papeis.
- Cadastre locais/unidades operacionais.
- Cadastre equipamentos por local, tipo, codigo e responsavel.
- Crie modelos de inspecao reutilizaveis.
- Configure perguntas e opcoes de resposta por modelo.
- Atribua inspecoes a tecnicos.
- Registre execucoes de inspecao em campo.
- Armazene respostas por pergunta, inclusive texto, numero, booleano, escolha e foto.
- Registre nao conformidades geradas a partir das respostas ou criadas manualmente.
- Acompanhe tarefas/acoes corretivas.
- Alimentar o dashboard com metricas confiaveis.

## 3. Banco recomendado

Recomendacao: PostgreSQL.

Motivos:

- Modelo relacional combina bem com cadastros, inspecoes, respostas e historico.
- Constraints ajudam a manter codigos unicos, status validos e integridade entre entidades.
- JSONB permite armazenar metadados flexiveis de respostas sem perder estrutura relacional.
- Bom suporte para relatorios, agregacoes e dashboards.
- Pode ser usado por um backend Node/NestJS, Express, Spring Boot, Django ou Supabase.

Para o app mobile, o fluxo ideal e:

- PostgreSQL no backend como fonte oficial.
- API REST ou GraphQL entre mobile e backend.
- Persistencia local opcional no mobile para modo offline, sincronizando depois.

## 4. Entidades principais

### organizations

Representa a empresa/cliente. Mesmo que o MVP tenha uma unica empresa, essa tabela evita retrabalho se houver multiempresa no futuro.

### users

Representa supervisores, tecnicos e administradores. Hoje a tela de perfil mostra um supervisor fixo; no banco isso vira usuario autenticado.

### sites

Representa locais/unidades operacionais, como "Refinaria Central", "Unidade Alpha" e "Unidade Beta".

### equipment_types

Classifica equipamentos: compressor, gerador, bomba, valvula, painel etc.

### equipment

Representa os equipamentos exibidos na tela de equipamentos. Substitui o mock `Equipamento`.

### inspection_templates

Representa modelos de inspecao criados no construtor. Exemplo atual: "Inspecao de Compressores Industriais".

### inspection_template_questions

Representa perguntas de um modelo. Substitui o mock `Pergunta`.

### inspection_question_options

Representa opcoes para perguntas de multipla escolha.

### inspection_assignments

Representa uma inspecao planejada/atribuida para um equipamento, tecnico e prazo.

### inspection_runs

Representa a execucao real da inspecao em campo. Permite historico e evita sobrescrever dados antigos.

### inspection_answers

Representa as respostas dadas em uma execucao.

### attachments

Representa fotos e arquivos anexados a respostas, equipamentos, nao conformidades ou tarefas.

### non_conformities

Representa problemas identificados em inspecoes. Alimenta a area de "Nao Conformidades" do dashboard.

### corrective_actions

Representa tarefas/acoes corretivas ou operacionais. Alimenta "Acoes Rapidas" e controle de pendencias.

### equipment_status_history

Mantem historico de mudancas de status do equipamento.

### audit_logs

Registra alteracoes importantes para rastreabilidade.

## 5. Diagrama ER

Arquivo Mermaid separado: [erd.mmd](erd.mmd).

Resumo dos relacionamentos:

- Uma organizacao possui usuarios, locais, tipos de equipamento e modelos de inspecao.
- Um local possui muitos equipamentos.
- Um equipamento pertence a um tipo e pode ter um usuario responsavel.
- Um modelo de inspecao possui muitas perguntas.
- Uma pergunta pode possuir varias opcoes.
- Uma atribuicao conecta modelo, equipamento e tecnico.
- Uma execucao nasce de uma atribuicao.
- Uma execucao possui varias respostas.
- Uma resposta pode gerar uma nao conformidade.
- Uma nao conformidade pode possuir varias acoes corretivas.
- Anexos podem se ligar a respostas, nao conformidades, equipamentos ou acoes.

## 6. Status e enums propostos

### user_role

- `admin`
- `supervisor`
- `technician`

### equipment_status

- `active`
- `maintenance`
- `inactive`

Equivalencia com o app atual:

- `Ativo` -> `active`
- `Manutencao` -> `maintenance`
- `Inativo` -> `inactive`

### question_type

- `boolean`
- `single_choice`
- `multi_choice`
- `text`
- `number`
- `photo`

Equivalencia com o app atual:

- `Sim / Nao` -> `boolean`
- `Multipla escolha` -> `single_choice` ou `multi_choice`
- `Texto` -> `text`
- `Foto` -> `photo`

### assignment_status

- `scheduled`
- `in_progress`
- `completed`
- `late`
- `cancelled`

### run_status

- `draft`
- `submitted`
- `approved`
- `rejected`

### severity

- `low`
- `medium`
- `high`
- `critical`

Equivalencia com o app atual:

- `Baixa` -> `low`
- `Alta` -> `high`
- `Critico` -> `critical`

### non_conformity_status

- `open`
- `in_progress`
- `resolved`
- `cancelled`

### corrective_action_status

- `open`
- `in_progress`
- `done`
- `cancelled`

## 7. Mapeamento das telas para o banco

### Dashboard

Dados derivados de:

- `inspection_runs` para inspecoes concluidas.
- `non_conformities` para taxa de nao conformidade.
- `inspection_assignments` e `users` para tecnicos em campo.
- `inspection_assignments` para inspecoes atrasadas.
- `corrective_actions` e `non_conformities` para acoes rapidas.

### Inspecoes

Dados gravados em:

- `inspection_templates`
- `inspection_template_questions`
- `inspection_question_options`

Quando o usuario clica em "Salvar Modelo", o app deve criar/atualizar o modelo e suas perguntas.

### Equipamentos

Dados lidos e gravados em:

- `equipment`
- `equipment_types`
- `sites`
- `users`
- `equipment_status_history`

Busca deve consultar nome, codigo e local, como o app ja faz no estado local.

### Perfil

Dados lidos de:

- `users`
- `organizations`

Configuracoes futuras podem ir para `user_preferences`.

## 8. Estrategia de historico

Nao e recomendado gravar somente o estado atual quando o dado representa operacao de campo. O banco proposto separa:

- Estado atual: `equipment.status`, `non_conformities.status`, `corrective_actions.status`.
- Historico: `equipment_status_history`, `inspection_runs`, `inspection_answers`, `audit_logs`.

Isso permite responder perguntas como:

- Quantas inspecoes foram feitas no mes?
- Qual tecnico executou cada inspecao?
- Qual equipamento gerou mais nao conformidades?
- Quanto tempo uma nao conformidade ficou aberta?
- Quem alterou o status de um equipamento?

## 9. Regras de integridade importantes

- `equipment.code` deve ser unico por organizacao.
- Perguntas devem ter ordem unica dentro do modelo.
- Opcoes devem ter ordem unica dentro da pergunta.
- Uma execucao deve pertencer a uma atribuicao.
- Uma resposta deve pertencer a uma execucao e a uma pergunta do modelo usado.
- Nao conformidades podem existir sem resposta vinculada, para permitir abertura manual.
- Usuarios inativos nao devem receber novas atribuicoes.
- Modelos publicados nao devem ser editados destrutivamente; o ideal e versionar ou duplicar.

## 10. Proximos passos tecnicos

1. Criar um backend para expor API para o app mobile.
2. Aplicar o SQL de [schema.sql](schema.sql) em um PostgreSQL.
3. Criar seeds com os equipamentos e perguntas hoje mockados em `App.tsx`.
4. Substituir os arrays locais por chamadas de API.
5. Definir autenticacao e autorizacao por papel.
6. Planejar modo offline se a equipe trabalha sem internet em campo.

