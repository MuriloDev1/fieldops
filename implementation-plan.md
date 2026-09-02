# Plano de Implantacao do Banco

## Fase 1 - Fundacao

Objetivo: tirar os dados do mock e preparar uma fonte oficial.

Entregas:

- Subir PostgreSQL para desenvolvimento.
- Aplicar `schema.sql`.
- Criar seed inicial com:
  - organizacao padrao;
  - usuarios de exemplo;
  - locais usados no app;
  - tipos de equipamento;
  - equipamentos de `equipamentosIniciais`;
  - modelo "Inspecao de Compressores Industriais";
  - perguntas de `perguntasIniciais`.

## Fase 2 - Backend

Objetivo: expor os dados para o app mobile.

Endpoints iniciais sugeridos:

- `GET /me`
- `GET /dashboard/summary`
- `GET /dashboard/non-conformities`
- `GET /dashboard/quick-actions`
- `GET /equipment`
- `GET /equipment/:id`
- `POST /equipment`
- `PATCH /equipment/:id`
- `GET /inspection-templates`
- `POST /inspection-templates`
- `GET /inspection-templates/:id`
- `PATCH /inspection-templates/:id`
- `POST /inspection-assignments`
- `GET /inspection-assignments`
- `POST /inspection-runs`
- `PATCH /inspection-runs/:id/answers`
- `POST /inspection-runs/:id/submit`
- `GET /non-conformities`
- `POST /non-conformities`
- `PATCH /non-conformities/:id`
- `POST /corrective-actions`
- `PATCH /corrective-actions/:id`

## Fase 3 - Mobile conectado

Objetivo: substituir estado local por dados reais.

Alteracoes no app:

- Criar cliente HTTP em `fieldops-mobile`.
- Trocar `equipamentosIniciais` por `GET /equipment`.
- Trocar `perguntasIniciais` por `GET /inspection-templates/:id`.
- Salvar modelos via `POST /inspection-templates`.
- Carregar dashboard via endpoints agregados.
- Carregar perfil via `GET /me`.

## Fase 4 - Execucao de inspecao

Objetivo: permitir operacao real em campo.

Fluxo:

1. Supervisor cria modelo de inspecao.
2. Supervisor atribui modelo a equipamento e tecnico.
3. Tecnico abre a atribuicao no mobile.
4. Mobile cria `inspection_run`.
5. Mobile grava respostas em `inspection_answers`.
6. Mobile envia a execucao.
7. Backend cria nao conformidades quando uma resposta viola criterio configurado.
8. Supervisor aprova ou rejeita a execucao.

## Fase 5 - Offline e sincronizacao

Objetivo: suportar operacao sem internet.

Abordagem recomendada:

- Usar banco local no app apenas como cache/sync queue.
- O PostgreSQL continua sendo a fonte oficial.
- Cada alteracao offline recebe um identificador local e status de sincronizacao.
- Ao reconectar, o app envia eventos pendentes para o backend.
- O backend resolve conflitos usando `updated_at`, ownership e regras de dominio.

## Decisoes pendentes

- Qual backend sera usado: Node/Express, NestJS, Spring Boot, Supabase ou outro.
- Se a autenticacao sera propria, Firebase Auth, Supabase Auth ou outro provedor.
- Se fotos vao para storage local, S3, Supabase Storage ou outro servico.
- Se modelos publicados terao versionamento obrigatorio desde o MVP.
- Se o app precisa funcionar offline ja na primeira versao.

