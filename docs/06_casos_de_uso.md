# 6. Casos de Uso

## 6.1 Catálogo resumido

| ID | Caso de uso | Ator principal | Canal | Prioridade |
| --- | --- | --- | --- | --- |
| UC-01 | Autenticar usuário | Todos | Mobile/Web | P0 |
| UC-02 | Gerenciar usuários | Administrador | Web | P0 |
| UC-03 | Gerenciar clientes, locais e equipamentos | Administrador/Supervisor | Web | P0 |
| UC-04 | Criar modelo de inspeção | Supervisor | Web | P0 |
| UC-05 | Publicar versão do modelo | Supervisor | Web | P0 |
| UC-06 | Agendar e atribuir inspeção | Supervisor | Web | P0 |
| UC-07 | Baixar inspeções atribuídas | Técnico | Mobile | P0 |
| UC-08 | Identificar equipamento por QR Code | Técnico | Mobile | P0 |
| UC-09 | Iniciar inspeção | Técnico | Mobile | P0 |
| UC-10 | Responder checklist | Técnico | Mobile | P0 |
| UC-11 | Registrar evidência | Técnico | Mobile | P0 |
| UC-12 | Registrar não conformidade | Técnico | Mobile | P0 |
| UC-13 | Concluir inspeção offline | Técnico | Mobile | P0 |
| UC-14 | Sincronizar alterações | Técnico/Sistema | Mobile/API | P0 |
| UC-15 | Acompanhar inspeções | Supervisor | Web | P0 |
| UC-16 | Revisar inspeção | Supervisor | Web | P0 |
| UC-17 | Aprovar ou reprovar inspeção | Supervisor | Web | P0 |
| UC-18 | Consultar histórico | Administrador/Supervisor | Web | P1 |
| UC-19 | Consultar indicadores | Supervisor | Web | P1 |
| UC-20 | Consultar resultado como cliente | Cliente | Web | P2 |

## 6.2 UC-01 — Autenticar usuário

**Ator principal:** qualquer usuário ativo.

**Pré-condições:** usuário cadastrado e ativo.

**Gatilho:** o usuário informa suas credenciais.

### Fluxo principal

1. O usuário informa e-mail e senha.
2. A aplicação valida o formato dos campos.
3. A aplicação envia as credenciais à API.
4. A API valida o usuário e a senha.
5. A API retorna tokens e informações mínimas do perfil.
6. A aplicação armazena a sessão de forma apropriada ao canal.
7. O usuário é direcionado à área autorizada.

### Fluxos alternativos

- Credenciais inválidas: exibir mensagem sem informar qual campo está incorreto.
- Usuário inativo: negar acesso e orientar contato com a administração.
- Falha de rede no mobile: permitir somente o acesso offline quando existir uma sessão previamente válida e dados locais autorizados.
- Token expirado: tentar renovação conforme contrato da API.

### Pós-condições

- Sessão autenticada criada; ou
- acesso negado sem alteração indevida de dados.

## 6.3 UC-04 — Criar modelo de inspeção

**Ator principal:** supervisor.

**Pré-condições:** usuário autenticado com permissão.

**Gatilho:** necessidade de padronizar um tipo de inspeção.

### Fluxo principal

1. O supervisor cria um modelo em estado de rascunho.
2. Informa título, descrição e categoria.
3. Cria uma ou mais seções.
4. Adiciona itens às seções.
5. Define o tipo de resposta de cada item.
6. Define obrigatoriedade, regras de evidência e ordem.
7. Salva o rascunho.
8. Valida a prévia do checklist.
9. Publica uma versão do modelo.

### Fluxos alternativos

- Modelo sem itens: publicação bloqueada.
- Item sem tipo de resposta: publicação bloqueada.
- Modelo já utilizado: alterações estruturais geram nova versão.

### Pós-condições

- Uma versão imutável do modelo fica disponível para novas inspeções.

## 6.4 UC-06 — Agendar e atribuir inspeção

**Ator principal:** supervisor.

**Pré-condições:** cliente, local, equipamento, técnico e modelo válidos.

**Gatilho:** necessidade de executar uma inspeção.

### Fluxo principal

1. O supervisor seleciona o modelo publicado.
2. Seleciona cliente, local e equipamento, quando aplicável.
3. Define técnico, prioridade e data prevista.
4. Informa orientações adicionais.
5. Confirma o agendamento.
6. A API cria a inspeção e seu snapshot de itens.
7. A inspeção fica disponível para sincronização pelo técnico.

### Fluxos alternativos

- Técnico inativo: operação bloqueada.
- Modelo sem versão publicada: operação bloqueada.
- Equipamento incompatível com o local: operação bloqueada.

### Pós-condições

- Inspeção criada em estado atribuído.

## 6.5 UC-07 — Baixar inspeções atribuídas

**Ator principal:** técnico.

**Pré-condições:** sessão válida e conectividade.

**Gatilho:** atualização manual ou automática dos dados.

### Fluxo principal

1. O aplicativo consulta alterações disponíveis para o técnico.
2. A API retorna inspeções e dados auxiliares autorizados.
3. O aplicativo grava os dados em SQLite.
4. O aplicativo atualiza a data da última sincronização.
5. As inspeções ficam disponíveis offline.

### Fluxos alternativos

- Falha parcial: manter dados anteriores e registrar o erro.
- Inspeção cancelada no servidor: atualizar o estado local sem apagar respostas pendentes de forma silenciosa.

### Pós-condições

- Base local atualizada ou preservada em caso de falha.

## 6.6 UC-08 — Identificar equipamento por QR Code

**Ator principal:** técnico.

**Pré-condições:** permissão de câmera concedida e equipamento com código cadastrado.

**Gatilho:** técnico inicia a leitura.

### Fluxo principal

1. O aplicativo solicita ou verifica a permissão da câmera.
2. O técnico aponta a câmera para o QR Code.
3. O aplicativo lê o identificador.
4. O aplicativo procura o equipamento na base local.
5. Quando necessário e possível, consulta a API.
6. Exibe os dados do equipamento.
7. O técnico confirma o vínculo com a inspeção.

### Fluxos alternativos

- Código desconhecido: informar que o equipamento não foi localizado.
- Equipamento diferente do previsto: solicitar confirmação ou bloquear conforme regra da inspeção.
- Permissão negada: disponibilizar identificação manual quando permitido.

## 6.7 UC-09 — Iniciar inspeção

**Ator principal:** técnico.

**Pré-condições:** inspeção atribuída ao técnico e disponível localmente.

**Gatilho:** seleção da ação “Iniciar inspeção”.

### Fluxo principal

1. O aplicativo apresenta os dados principais.
2. O técnico confirma o início.
3. O aplicativo registra data e hora do dispositivo.
4. Solicita a localização, quando prevista.
5. Altera o estado local para em andamento.
6. Registra a operação na outbox.
7. Apresenta o checklist.

### Fluxos alternativos

- Inspeção cancelada: início bloqueado após atualização do estado.
- Localização negada: continuar somente se a política da inspeção permitir.

## 6.8 UC-10 — Responder checklist

**Ator principal:** técnico.

**Pré-condições:** inspeção em andamento.

**Gatilho:** abertura de uma seção ou item.

### Fluxo principal

1. O aplicativo apresenta as seções e os itens do snapshot.
2. Renderiza o componente adequado ao tipo de resposta.
3. O técnico informa a resposta.
4. O aplicativo valida o valor.
5. A resposta é salva imediatamente no banco local.
6. O progresso é atualizado.
7. A operação pendente é registrada para sincronização.

### Fluxos alternativos

- Resposta não conforme: exigir observação quando configurado.
- Item crítico: exigir evidência quando aplicável.
- Valor inválido: impedir o avanço e apresentar orientação.

## 6.9 UC-11 — Registrar evidência

**Ator principal:** técnico.

**Pré-condições:** permissão de câmera ou arquivos e inspeção editável.

**Gatilho:** ação de adicionar evidência.

### Fluxo principal

1. O técnico escolhe capturar foto ou selecionar imagem.
2. O aplicativo obtém a imagem.
3. Exibe uma prévia.
4. O técnico confirma ou refaz a captura.
5. O aplicativo associa a evidência à inspeção, resposta ou não conformidade.
6. O arquivo é armazenado localmente.
7. A evidência é adicionada à fila de sincronização.

### Fluxos alternativos

- Arquivo excede o limite: informar e permitir nova captura.
- Falha no envio: manter o arquivo local e marcar como pendente.
- Exclusão antes da sincronização: remover localmente e cancelar a operação pendente.

## 6.10 UC-12 — Registrar não conformidade

**Ator principal:** técnico.

**Pré-condições:** inspeção em andamento.

**Gatilho:** identificação de problema ou resposta configurada como não conforme.

### Fluxo principal

1. O técnico seleciona ou confirma a criação da não conformidade.
2. Informa título, descrição e criticidade.
3. Adiciona evidências quando necessário.
4. O aplicativo valida os campos.
5. Salva o registro localmente.
6. Relaciona a não conformidade ao item e à inspeção.
7. Adiciona a operação à outbox.

## 6.11 UC-13 — Concluir inspeção offline

**Ator principal:** técnico.

**Pré-condições:** inspeção em andamento e dados locais disponíveis.

**Gatilho:** ação de concluir.

### Fluxo principal

1. O aplicativo valida os itens obrigatórios.
2. Valida observações e evidências exigidas.
3. Apresenta o resumo.
4. O técnico confirma a conclusão.
5. O aplicativo registra data e hora local.
6. O estado local muda para aguardando sincronização.
7. As respostas ficam bloqueadas para edição comum.
8. A operação de conclusão é adicionada à outbox.

### Fluxos alternativos

- Itens obrigatórios pendentes: conclusão bloqueada e itens destacados.
- Evidência obrigatória ausente: conclusão bloqueada.

## 6.12 UC-14 — Sincronizar alterações

**Ator principal:** sistema, com acompanhamento do técnico.

**Pré-condições:** sessão válida, conectividade e operações pendentes.

**Gatilho:** ação manual, abertura do aplicativo ou evento de conectividade.

### Fluxo principal

1. O aplicativo identifica operações pendentes.
2. Organiza as operações por dependência.
3. Envia um lote com identificadores idempotentes.
4. A API valida autorização e versão dos registros.
5. A API processa cada operação.
6. Retorna o resultado individual de cada item.
7. O aplicativo marca operações concluídas.
8. Mantém falhas como pendentes e registra a mensagem.
9. Baixa alterações do servidor.
10. Atualiza o estado da inspeção.

### Fluxos alternativos

- Token expirado: renovar e repetir de maneira controlada.
- Conflito: preservar a alteração local, informar o usuário e aplicar a política definida.
- Falha de arquivo: sincronizar dados textuais e manter a evidência pendente, quando permitido.
- Reenvio: a API retorna o resultado anterior sem duplicar dados.

## 6.13 UC-16 — Revisar inspeção

**Ator principal:** supervisor.

**Pré-condições:** inspeção enviada e disponível para revisão.

**Gatilho:** abertura da inspeção na interface administrativa.

### Fluxo principal

1. O supervisor visualiza o resumo.
2. Consulta as informações do equipamento e do técnico.
3. Navega pelas seções do checklist.
4. Analisa respostas, observações, localização e evidências.
5. Consulta não conformidades.
6. Registra comentários de revisão quando necessário.
7. Decide aprovar ou reprovar.

## 6.14 UC-17 — Aprovar ou reprovar inspeção

**Ator principal:** supervisor.

**Pré-condições:** inspeção em revisão.

**Gatilho:** decisão do supervisor.

### Fluxo de aprovação

1. O supervisor seleciona aprovar.
2. Confirma a decisão.
3. A API registra usuário, data e comentário.
4. A inspeção passa para aprovada.
5. O conteúdo fica protegido contra alterações comuns.

### Fluxo de reprovação

1. O supervisor seleciona reprovar.
2. Informa obrigatoriamente o motivo.
3. Pode indicar itens que exigem correção.
4. A API registra a revisão.
5. A inspeção passa para reprovada.
6. O técnico poderá recebê-la novamente conforme fluxo de correção.
