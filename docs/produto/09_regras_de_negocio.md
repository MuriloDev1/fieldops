# 9. Regras de Negócio (RN-001 a RN-090)

Este documento consolida o catálogo canônico de **Regras de Negócio (RN-001 a RN-090)** da plataforma **FieldOps**, unificando as especificações funcionais e técnicas que regem o Aplicativo Mobile (React Native / Expo), a Interface Administrativa Web (React 19 / Vite), a API REST (Java 21 / Spring Boot 3) e o banco de dados PostgreSQL 16.

---

## 9.1 Usuários, autenticação e controle de acesso

**RN-001.** Somente usuários ativos (`status = ACTIVE`) poderão iniciar uma nova sessão.
- **Comportamento no App e Web:** Caso um usuário seja inativado ou bloqueado administrativamente na plataforma Web, sua sessão deverá ser encerrada automaticamente no próximo fluxo de sincronização ou verificação online (`401 Unauthorized`), bloqueando novas autenticações.

**RN-002.** A inativação de um usuário não excluirá seus registros históricos (inspeções, respostas, revisões e eventos de auditoria).

**RN-003.** A API deverá validar o perfil (`ADMIN`, `SUPERVISOR`, `TECHNICIAN`, `CLIENT_VIEWER`) em todas as operações protegidas (RBAC).

**RN-004.** O técnico somente poderá consultar integralmente as inspeções atribuídas a ele.

**RN-005.** O supervisor poderá consultar e revisar inspeções pertencentes ao seu escopo operacional.

**RN-006.** O administrador poderá gerenciar usuários e cadastros, mas não deverá alterar respostas de inspeção por padrão.

**RN-007.** Credenciais, senhas e tokens JWT não poderão ser gravados em logs ou console (sanitização estrita tanto no cliente quanto no servidor).

**RN-008.** A troca de senha ou o bloqueio do usuário deverá invalidar sessões conforme a política definida pela API.

---

## 9.2 Clientes, locais e equipamentos

**RN-009.** Todo local (`InspectionSite`) deverá pertencer a um cliente (`Client`).

**RN-010.** Todo equipamento (`Equipment`) deverá pertencer a um local no MVP.

**RN-011.** O código QR (`qr_code`) de um equipamento deverá ser único.

**RN-012.** Um equipamento inativo (`INACTIVE` ou `DECOMMISSIONED`) não poderá ser utilizado em uma nova inspeção.

**RN-013.** Registros já utilizados em inspeções deverão ser inativados logicamente, e não excluídos fisicamente do banco de dados.

**RN-014.** O local selecionado para a inspeção deverá ser compatível com o equipamento selecionado (filtro encadeado Cliente → Local → Equipamento).

---

## 9.3 Modelos de inspeção e snapshots imutáveis

**RN-015.** Todo modelo (`InspectionTemplate`) deverá possuir título, categoria e ao menos uma seção com item válido antes da publicação.

**RN-016.** Todo item (`TemplateItem`) deverá possuir um tipo de resposta definido (`TEXT_SHORT`, `TEXT_LONG`, `NUMBER`, `BOOLEAN`, `CONFORMITY`, `SINGLE_CHOICE`, `DATE`, `PHOTO`).

**RN-017.** A ordem de exibição de seções (`section_order`) e itens (`display_order`) deverá ser explícita.

**RN-018.** Um modelo em rascunho (`DRAFT`) poderá ser alterado livremente por usuário autorizado.

**RN-019.** Uma versão publicada (`InspectionTemplateVersion`) não poderá ser alterada de forma destrutiva.

**RN-020.** Alterações estruturais em um modelo já publicado deverão gerar uma nova versão numerada sequencialmente.

**RN-021.** Uma inspeção deverá preservar um **snapshot imutável** (`InspectionItemSnapshot`) dos itens da versão do modelo utilizada.
- **Comportamento Técnico:** No agendamento e início da inspeção, os itens, seções, tipos de resposta e regras da versão publicada são congelados em `inspection_item_snapshots`. Se um supervisor alterar a estrutura do checklist ou criar uma nova versão posteriormente na interface Web, as inspeções em andamento ou concluídas permanecem intactas sob o snapshot original, preservando a integridade histórica e jurídica dos laudos.

**RN-022.** A desativação de um modelo não afetará inspeções existentes.

**RN-023.** Tipos de resposta não suportados pelo aplicativo não poderão ser publicados para uso no MVP.

---

## 9.4 Planejamento, atribuição e ciclo de vida

**RN-024.** Uma inspeção deverá estar vinculada a uma versão publicada de modelo e seguir o fluxo formal do ciclo de vida:

```text
[ASSIGNED / Agendada] ──(Check-in / QR Code)──> [IN_PROGRESS / Em Execução]
                                                         │
                                              (Conclusão validada)
                                                         ▼
                                            [Concluída Local / Outbox]
                                                         │
                                                  (Sincronização)
                                                         ▼
  [APPROVED / Aprovada] <──(Revisão)── [SUBMITTED / UNDER_REVIEW]
           OU
  [REJECTED / Reprovada c/ Motivo] ──(Correção)──> [IN_PROGRESS]
```

**RN-025.** Uma inspeção deverá possuir cliente, local, técnico e data prevista.

**RN-026.** O equipamento poderá ser opcional somente quando o tipo de inspeção for definido para local ou ambiente.

**RN-027.** Somente técnico ativo poderá receber nova atribuição.

**RN-028.** Uma inspeção atribuída deverá aparecer para o técnico no aplicativo móvel após sincronização.

**RN-029.** O cancelamento (`CANCELED`) deverá registrar usuário, data e justificativa obrigatória.

**RN-030.** Uma inspeção aprovada (`APPROVED`) não poderá ser cancelada pelo fluxo comum.

**RN-031.** O MVP permitirá somente um técnico responsável por inspeção.

---

## 9.5 Execução em campo e criticidade condicional

**RN-032.** Somente inspeções atribuídas poderão ser iniciadas.

**RN-033.** Somente o técnico responsável poderá iniciar e responder a inspeção, salvo permissão administrativa excepcional.

**RN-034.** O início deverá registrar data e hora do dispositivo (`started_at_device`) e, após sincronização, data e hora de recebimento no servidor (`started_at_server`).

**RN-035.** Cada resposta (`InspectionResponse`) deverá estar vinculada a um item do snapshot da inspeção (`inspection_item_id`).

**RN-036.** Respostas deverão ser validadas conforme seu tipo.

**RN-037.** Itens obrigatórios deverão ser respondidos antes da conclusão (**Bloqueio de Finalização por Incompletude**).
- **Comportamento no App:** O encerramento da inspeção deve ser bloqueado enquanto houver itens obrigatórios sem resposta ou itens marcados como "Não Conforme" sem as exigências condicionais (observação textual e evidência fotográfica) preenchidas, alertando visualmente o técnico sobre as pendências.

**RN-038.** Quando configurado (`observation_required_on_failure`), uma resposta não conforme (`NON_CONFORMING`) deverá exigir observação textual detalhando a falha.

**RN-039.** Quando configurado como crítico (`evidence_required_on_failure`), um item não conforme deverá exigir ao menos uma evidência fotográfica anexada à resposta.
- **Comportamento na Interface (RN-038 e RN-039):** Ao marcar qualquer pergunta como "Não Conforme", o aplicativo móvel destaca o alerta de não conformidade e exige o preenchimento da observação e a captura/anexo da fotografia de evidência antes de permitir a conclusão da inspeção.

**RN-040.** O progresso deverá considerar itens respondidos em relação ao total de itens aplicáveis do checklist.

**RN-041.** O aplicativo deverá salvar localmente cada alteração confirmada no rascunho persistente.

**RN-042.** A conclusão deverá registrar o momento real informado pelo dispositivo (`completed_at_device`) e o momento de recebimento pelo servidor (`submitted_at_server`).

**RN-043.** Após a conclusão local, as respostas ficarão bloqueadas para edição comum pelo técnico até eventual reprovação pelo supervisor que reabra a inspeção para correção.

**RN-044.** A inspeção enviada (`SUBMITTED`) deverá ser revisada por um supervisor antes da aprovação final.

---

## 9.6 Evidências fotográficas e assinaturas

**RN-045.** Toda evidência (`Evidence`) deverá estar vinculada a uma inspeção e, quando aplicável, a uma resposta ou não conformidade.

**RN-046.** O sistema aceitará somente formatos e tamanhos de imagem permitidos (armazenando metadados ou payload Base64/SVG sanitizado via Jackson `ObjectMapper` em `value_json`).

**RN-047.** Uma evidência ainda não sincronizada não poderá ser apagada silenciosamente por limpeza de cache.

**RN-048.** A exclusão de uma evidência já sincronizada deverá ser auditada e respeitar o estado da inspeção.

**RN-049.** Evidências de inspeções aprovadas serão somente leitura.

**RN-050.** O nome original do arquivo não será utilizado como único identificador (uso de UUID e `storage_key`).

**RN-051.** Metadados sensíveis desnecessários poderão ser removidos ou ignorados conforme política do produto.

---

## 9.7 Não conformidades

**RN-052.** Toda não conformidade (`NonConformity`) deverá pertencer a uma inspeção.

**RN-053.** A não conformidade poderá ser associada a um item específico do snapshot e à resposta que a originou.

**RN-054.** A criticidade (`severity`) deverá assumir um valor válido: `LOW` (baixa), `MEDIUM` (média), `HIGH` (alta) ou `CRITICAL` (crítica).

**RN-055.** Não conformidades críticas deverão exigir descrição e evidência fotográfica.

**RN-056.** A exclusão de uma não conformidade após envio deverá ser substituída por alteração de estado (`OPEN`, `IN_PROGRESS`, `RESOLVED`, `CANCELLED`) ou operação auditável.

**RN-057.** O tratamento completo de planos de ação pós-aprovação pertence a evolução futura (P2), mas o registro e rastreamento da não conformidade fazem parte do MVP.

---

## 9.8 Localização GPS, câmera e leitura de QR Code

**RN-058.** O aplicativo deverá solicitar consentimento explícito do usuário antes de acessar recursos de hardware (câmera e localização GPS).

**RN-059.** A recusa da permissão deverá produzir orientação clara e alternativa manual quando a regra da inspeção permitir (ex.: digitação manual do código em emuladores sem câmera).

**RN-060.** A localização GPS não será coletada continuamente em segundo plano no MVP.

**RN-061.** A localização GPS poderá ser registrada pontualmente nos momentos de início (check-in) e conclusão (check-out) da inspeção.

**RN-062.** O sistema deverá armazenar latitude, longitude, precisão e horário quando disponíveis, permitindo auditoria de presença física na planta do cliente.

**RN-063.** A leitura de QR Code não deverá, sozinha, autorizar acesso a dados de equipamentos fora do escopo permitido ao usuário.

**RN-064.** A leitura do QR Code do equipamento (`CameraView`) deve ser comparada com o código do ativo previsto na inspeção; qualquer divergência deverá ser informada por alerta impeditivo ou confirmação antes da continuidade.

---

## 9.9 Operação offline-first e sincronização idempotente

**RN-065.** Inspeções previamente baixadas deverão permanecer integralmente acessíveis sem conexão com a internet.

**RN-066.** Dados não sincronizados e rascunhos em andamento (`@fieldops/rascunho-em-andamento` e fila local) deverão sobreviver ao fechamento completo do aplicativo, encerramento pelo sistema operacional ou reinicialização do aparelho.
- **Comportamento no App:** Todas as respostas, observações, fotos em Base64 e assinatura digital são persistidas imediatamente no armazenamento local do dispositivo antes de qualquer tentativa de envio por rede.

**RN-067.** Cada operação enviada pela fila Outbox deverá possuir identificador idempotente único (UUID) e respeitar a ordem cronológica de criação (FIFO).

**RN-068.** O reenvio da mesma operação ou a sincronização repetida não poderá criar duplicidade no servidor.
- **Comportamento na Sincronização:** Inspeções pré-atribuídas utilizam seu UUID existente para enviar respostas (`POST /inspections/{id}/answers` ou `/submit`) e conclusão (`PATCH /inspections/{id}/complete`), sem recriar a inspeção com `POST /inspections` duplicado.

**RN-069.** Operações deverão ser processadas respeitando dependências lógicas (ex.: respostas antes de evidências ou conclusão).

**RN-070.** Falha em uma operação específica não deverá apagar ou descartar outras operações pendentes na fila local (isolamento de erros).

**RN-071.** O aplicativo deverá exibir de forma persistente o estado de conectividade (`[ONLINE]` em verde ou `[OFFLINE]` em alerta), a quantidade de operações/inspeções pendentes de envio e o botão de sincronização manual.

**RN-072.** O aplicativo deverá informar data e resultado da última sincronização.

**RN-073.** O servidor PostgreSQL será a fonte oficial da verdade após a confirmação da sincronização.

**RN-074.** O sistema deverá preservar o **duplo carimbo de data/hora** (timestamp de execução física no dispositivo vs. timestamp de recebimento/sincronização no servidor) em inspeções, respostas, evidências e eventos de auditoria (`device_occurred_at` e `occurred_at`).

**RN-075.** Conflitos deverão ser detectados por versão otimista (`version`), data ou estado da entidade.

**RN-076.** No MVP, dados aprovados no servidor prevalecerão e não aceitarão atualização tardia comum.

**RN-077.** Uma inspeção cancelada no servidor não deverá ter seus dados locais pendentes descartados silenciosamente sem aviso ao técnico.

**RN-078.** Evidências poderão ser sincronizadas de forma resiliente junto às respostas ou separadamente, mantendo rastreamento de integridade.

---

## 9.10 Revisão e aprovação pelo supervisor

**RN-079.** Somente supervisor autorizado poderá iniciar e decidir a revisão de uma inspeção.

**RN-080.** A reprovação (`REJECTED`) deverá exigir obrigatoriamente o registro do motivo/justificativa.

**RN-081.** A aprovação (`APPROVED`) deverá registrar o supervisor revisor, a data/hora e comentário opcional.

**RN-082.** Uma inspeção aprovada ficará bloqueada permanentemente contra edição comum.

**RN-083.** Correções após reprovação deverão preservar o histórico dos ciclos de revisão anteriores (`InspectionReview.review_cycle`).

**RN-084.** O supervisor não deverá alterar silenciosamente a resposta original fornecida pelo técnico em campo.

**RN-085.** Ajustes administrativos deverão ser diferenciados de respostas de campo e devidamente auditados.

---

## 9.11 Auditoria e integridade

**RN-086.** Alterações críticas e mudanças de estado da inspeção deverão gerar registros imutáveis em `AuditEvent` (`audit_events`), contendo usuário ator (`actor_id`), data do servidor (`occurred_at`), data do dispositivo (`device_occurred_at`), ação (`action`) e entidade afetada, disponibilizados na linha do tempo (`GET /api/v1/inspections/{id}/history`).

**RN-087.** Datas de criação (`created_at`) e atualização (`updated_at`) deverão ser mantidas pelo servidor.

**RN-088.** Entidades utilizadas em registros históricos não poderão ser excluídas fisicamente pelo fluxo comum (`ON DELETE RESTRICT` ou inativação lógica).

**RN-089.** A API deverá rejeitar transições de estado inválidas na máquina de estados da inspeção.

**RN-090.** A documentação OpenAPI/Swagger da API deverá refletir os estados, validações, DTOs e erros implementados.

---

## 9.12 Tabela de Correspondência (Mapeamento de Referências Legadas)

Para fins de rastreabilidade histórica com documentos preliminares da Sprint 1 (antigo `regras_de_negocio.md`), a tabela abaixo relaciona a numeração preliminar com a **numeração canônica oficial (`RN-001` a `RN-090`)**:

| Numeração Preliminar (Sprint 1) | Regra Canônica Oficial | Descrição da Regra |
| :---: | :---: | :--- |
| `RN-025` *(legado)* | **RN-063 / RN-064** | Validação e identificação de equipamento por leitura de QR Code (`RN-025` canônica refere-se aos dados obrigatórios do agendamento). |
| `RN-026` *(legado)* | **RN-058** | Solicitação de consentimento para uso de hardware: câmera e GPS (`RN-026` canônica refere-se à opcionalidade de equipamento em inspeção de local). |
| `RN-030` *(legado)* | **RN-038 / RN-039** | Exigência condicional de observação textual e foto ao marcar item como Não Conforme (`RN-030` canônica proíbe cancelar inspeção aprovada). |
| `RN-031` *(legado)* | **RN-037** | Bloqueio de conclusão da inspeção por itens obrigatórios ou condicionais pendentes (`RN-031` canônica define 1 técnico responsável por inspeção). |
| `RN-042` *(legado GPS)* | **RN-061 / RN-062** | Coleta pontual de coordenadas GPS no início e conclusão (`RN-042` canônica refere-se ao duplo carimbo de data/hora na conclusão). |
| `RN-069` *(legado UI)* | **RN-071** | Barra visual persistente de estado Online/Offline e contador de pendências (`RN-069` canônica refere-se à ordenação da fila por dependência). |
