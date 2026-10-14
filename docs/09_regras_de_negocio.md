# 9. Regras de Negócio

## 9.1 Usuários e acesso

**RN-001.** Somente usuários ativos poderão iniciar uma nova sessão.

**RN-002.** A inativação de um usuário não excluirá seus registros históricos.

**RN-003.** A API deverá validar o perfil em todas as operações protegidas.

**RN-004.** O técnico somente poderá consultar integralmente as inspeções atribuídas a ele.

**RN-005.** O supervisor poderá consultar e revisar inspeções pertencentes ao seu escopo.

**RN-006.** O administrador poderá gerenciar usuários e cadastros, mas não deverá alterar respostas de inspeção por padrão.

**RN-007.** Credenciais e tokens não poderão ser gravados em logs.

**RN-008.** A troca de senha ou o bloqueio do usuário deverá invalidar sessões conforme a política definida pela API.

---

## 9.2 Clientes, locais e equipamentos

**RN-009.** Todo local deverá pertencer a um cliente.

**RN-010.** Todo equipamento deverá pertencer a um local no MVP.

**RN-011.** O código QR de um equipamento deverá ser único.

**RN-012.** Um equipamento inativo não poderá ser utilizado em uma nova inspeção.

**RN-013.** Registros já utilizados em inspeções deverão ser inativados, não excluídos fisicamente.

**RN-014.** O local selecionado para a inspeção deverá ser compatível com o equipamento selecionado.

---

## 9.3 Modelos de inspeção

**RN-015.** Todo modelo deverá possuir título, categoria e ao menos uma seção com item válido antes da publicação.

**RN-016.** Todo item deverá possuir um tipo de resposta.

**RN-017.** A ordem de seções e itens deverá ser explícita.

**RN-018.** Um modelo em rascunho poderá ser alterado livremente por usuário autorizado.

**RN-019.** Uma versão publicada não poderá ser alterada de forma destrutiva.

**RN-020.** Alterações em um modelo publicado deverão gerar nova versão.

**RN-021.** Uma inspeção deverá preservar um snapshot dos itens da versão utilizada.

**RN-022.** A desativação de um modelo não afetará inspeções existentes.

**RN-023.** Tipos de resposta não suportados pelo aplicativo não poderão ser publicados para uso no MVP.

---

## 9.4 Planejamento e atribuição

**RN-024.** Uma inspeção deverá estar vinculada a uma versão publicada de modelo.

**RN-025.** Uma inspeção deverá possuir cliente, local, técnico e data prevista.

**RN-026.** O equipamento poderá ser opcional somente quando o tipo de inspeção for definido para local ou ambiente.

**RN-027.** Somente técnico ativo poderá receber nova atribuição.

**RN-028.** Uma inspeção atribuída deverá aparecer para o técnico após sincronização.

**RN-029.** O cancelamento deverá registrar usuário, data e justificativa.

**RN-030.** Uma inspeção aprovada não poderá ser cancelada pelo fluxo comum.

**RN-031.** O MVP permitirá somente um técnico responsável por inspeção.

---

## 9.5 Execução

**RN-032.** Somente inspeções atribuídas poderão ser iniciadas.

**RN-033.** Somente o técnico responsável poderá iniciar e responder a inspeção, salvo permissão administrativa excepcional não prevista no MVP.

**RN-034.** O início deverá registrar data e hora do dispositivo e, após sincronização, data e hora de recebimento no servidor.

**RN-035.** Cada resposta deverá estar vinculada a um item do snapshot da inspeção.

**RN-036.** Respostas deverão ser validadas conforme seu tipo.

**RN-037.** Itens obrigatórios deverão ser respondidos antes da conclusão.

**RN-038.** Quando configurado, uma resposta não conforme deverá exigir observação.

**RN-039.** Quando configurado como crítico, um item não conforme deverá exigir ao menos uma evidência.

**RN-040.** O progresso deverá considerar itens respondidos em relação aos itens aplicáveis.

**RN-041.** O aplicativo deverá salvar localmente cada alteração confirmada.

**RN-042.** A conclusão deverá registrar o momento real informado pelo dispositivo e o momento de recebimento pelo servidor.

**RN-043.** Após a conclusão local, as respostas ficarão bloqueadas até eventual reprovação ou falha que permita correção.

**RN-044.** A inspeção enviada deverá ser revisada antes da aprovação.

---

## 9.6 Evidências

**RN-045.** Toda evidência deverá estar vinculada a uma inspeção e, quando aplicável, a uma resposta ou não conformidade.

**RN-046.** O sistema aceitará somente formatos e tamanhos permitidos.

**RN-047.** Uma evidência ainda não sincronizada não poderá ser apagada silenciosamente por limpeza de cache.

**RN-048.** A exclusão de uma evidência já sincronizada deverá ser auditada e respeitar o estado da inspeção.

**RN-049.** Evidências de inspeções aprovadas serão somente leitura.

**RN-050.** O nome original do arquivo não será utilizado como único identificador.

**RN-051.** Metadados sensíveis desnecessários poderão ser removidos ou ignorados conforme política do produto.

---

## 9.7 Não conformidades

**RN-052.** Toda não conformidade deverá pertencer a uma inspeção.

**RN-053.** A não conformidade poderá ser associada a um item específico.

**RN-054.** A criticidade deverá assumir um valor válido: baixa, média, alta ou crítica.

**RN-055.** Não conformidades críticas deverão exigir descrição e evidência.

**RN-056.** A exclusão de uma não conformidade após envio deverá ser substituída por alteração de estado ou operação auditável.

**RN-057.** O tratamento completo da não conformidade após a aprovação pertence a uma versão futura, mas seu registro fará parte do MVP.

---

## 9.8 Localização e QR Code

**RN-058.** O aplicativo deverá solicitar consentimento antes de acessar câmera ou localização.

**RN-059.** A recusa da permissão deverá produzir orientação e alternativa quando a regra permitir.

**RN-060.** A localização não será coletada continuamente no MVP.

**RN-061.** A localização poderá ser registrada no início e na conclusão.

**RN-062.** O sistema deverá armazenar latitude, longitude, precisão e horário quando disponíveis.

**RN-063.** A leitura de QR Code não deverá, sozinha, autorizar acesso a dados não permitidos ao usuário.

**RN-064.** Divergência entre o equipamento previsto e o lido deverá ser informada antes da continuidade.

---

## 9.9 Offline e sincronização

**RN-065.** Inspeções previamente baixadas deverão permanecer acessíveis sem conexão.

**RN-066.** Dados não sincronizados deverão sobreviver ao fechamento e à reabertura do aplicativo.

**RN-067.** Cada operação enviada deverá possuir identificador idempotente único.

**RN-068.** O reenvio da mesma operação não poderá criar duplicidade.

**RN-069.** Operações deverão ser processadas respeitando dependências.

**RN-070.** Falha em uma operação não deverá apagar outras operações pendentes.

**RN-071.** O aplicativo deverá exibir a quantidade de operações pendentes.

**RN-072.** O aplicativo deverá informar data e resultado da última sincronização.

**RN-073.** O servidor será a fonte oficial após a confirmação da sincronização.

**RN-074.** O aplicativo deverá preservar a data de execução capturada no dispositivo, além da data de recebimento no servidor.

**RN-075.** Conflitos deverão ser detectados por versão, data ou outro mecanismo explícito.

**RN-076.** No MVP, dados aprovados no servidor prevalecerão e não aceitarão atualização tardia comum.

**RN-077.** Uma inspeção cancelada no servidor não deverá ter seus dados locais pendentes descartados sem aviso.

**RN-078.** Arquivos poderão ser sincronizados separadamente dos dados estruturados, mantendo rastreamento do estado individual.

---

## 9.10 Revisão e aprovação

**RN-079.** Somente supervisor autorizado poderá iniciar a revisão.

**RN-080.** A reprovação deverá possuir motivo.

**RN-081.** A aprovação deverá registrar supervisor, data e comentário opcional.

**RN-082.** Uma inspeção aprovada ficará bloqueada para edição comum.

**RN-083.** Correções após reprovação deverão preservar histórico das versões anteriores.

**RN-084.** O supervisor não deverá alterar silenciosamente a resposta fornecida pelo técnico.

**RN-085.** Ajustes administrativos deverão ser diferenciados de respostas de campo e auditados.

---

## 9.11 Auditoria e integridade

**RN-086.** Alterações críticas deverão registrar usuário, data, ação e entidade.

**RN-087.** Datas de criação e atualização deverão ser mantidas pelo servidor.

**RN-088.** Entidades utilizadas em registros históricos não poderão ser excluídas fisicamente pelo fluxo comum.

**RN-089.** A API deverá rejeitar transições de estado inválidas.

**RN-090.** A documentação da API deverá refletir os estados, validações e erros implementados.
