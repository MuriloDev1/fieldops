# 17. Critérios de Aceitação

## 17.1 Critérios gerais do produto

O incremento somente será aceito quando:

- A funcionalidade atender às regras de negócio relacionadas;
- O perfil correto conseguir executar a ação;
- Perfis não autorizados forem bloqueados pela API;
- Os estados de carregamento, vazio, erro e sucesso estiverem tratados;
- Os dados persistirem no componente adequado;
- Erros não provocarem perda silenciosa de dados;
- O contrato da API estiver atualizado;
- O fluxo estiver integrado quando depender de mais de uma aplicação;
- As evidências de teste estiverem disponíveis;
- Não existirem erros críticos conhecidos no fluxo entregue.

---

## 17.2 AC-AUTH — Autenticação

### Cenário: login válido

**Dado que** o usuário está ativo

**E** informa e-mail e senha válidos

**Quando** solicita o acesso

**Então** a API deve criar uma sessão válida

**E** retornar o perfil autorizado

**E** a aplicação deve direcioná-lo à área protegida.

### Cenário: credenciais inválidas

**Dado que** as credenciais não são válidas

**Quando** o usuário tenta entrar

**Então** o acesso deve ser negado

**E** a mensagem não deve revelar se o e-mail existe.

### Cenário: usuário inativo

**Dado que** o usuário está inativo

**Quando** tenta entrar

**Então** a API deve negar a sessão

**E** a aplicação deve apresentar orientação compreensível.

### Cenário: token expirado

**Dado que** o token de acesso expirou

**E** o token de renovação ainda é válido

**Quando** a aplicação realiza uma operação protegida

**Então** a sessão deve ser renovada de forma controlada

**E** a operação original poderá ser repetida uma única vez.

### Cenário: logout

**Dado que** o usuário está autenticado

**Quando** encerra a sessão

**Então** os dados sensíveis da sessão devem ser removidos

**E** as rotas protegidas não devem permanecer acessíveis.

---

## 17.3 AC-USERS — Usuários e perfis

- O administrador consegue cadastrar usuário com nome, e-mail, perfil e situação.
- O e-mail não pode ser duplicado.
- O perfil deve aceitar somente valores previstos.
- Um usuário inativo não consegue iniciar nova sessão.
- A inativação não remove inspeções ou auditoria associadas.
- Um técnico não consegue acessar endpoints administrativos.
- Um supervisor não consegue gerenciar usuários quando essa permissão não estiver atribuída.

---

## 17.4 AC-MASTER — Clientes, locais e equipamentos

### Cliente

- Nome é obrigatório.
- Registro pode ser pesquisado e filtrado.
- Cliente inativo não pode ser utilizado em nova inspeção.

### Local

- Todo local deve possuir cliente.
- A interface deve filtrar locais pelo cliente selecionado.
- Local inativo não pode receber nova inspeção.

### Equipamento

- Todo equipamento deve possuir local no MVP.
- QR Code deve ser único.
- A seleção administrativa deve mostrar somente equipamentos do local escolhido.
- Equipamento inativo não pode ser utilizado em nova inspeção.
- O técnico consegue consultar os dados mínimos do equipamento relacionado à inspeção.

---

## 17.5 AC-TEMPLATE — Modelo de inspeção

### Cenário: criar rascunho

**Dado que** o supervisor possui permissão

**Quando** cria um modelo

**Então** o modelo deve permanecer em rascunho

**E** poderá receber seções e itens.

### Cenário: publicar modelo válido

**Dado que** o modelo possui título

**E** ao menos uma seção

**E** ao menos um item válido

**Quando** o supervisor publica o modelo

**Então** uma versão numerada deve ser criada

**E** a versão deve ficar disponível para novas inspeções.

### Cenário: publicação inválida

**Dado que** existe item sem tipo de resposta

**Ou** o modelo não possui itens

**Quando** o supervisor tenta publicar

**Então** a operação deve ser bloqueada

**E** as pendências devem ser apresentadas.

### Cenário: alterar modelo já utilizado

**Dado que** uma versão publicada já foi utilizada

**Quando** o supervisor altera a estrutura

**Então** uma nova versão deve ser criada

**E** inspeções existentes devem manter o snapshot anterior.

---

## 17.6 AC-SCHEDULING — Agendamento e atribuição

- O supervisor deve selecionar uma versão publicada.
- Cliente, local, técnico e data prevista são obrigatórios.
- O equipamento é obrigatório quando o modelo exigir inspeção de equipamento.
- O local deve pertencer ao cliente.
- O equipamento deve pertencer ao local.
- O técnico deve estar ativo.
- Após a confirmação, a inspeção deve possuir snapshot dos itens.
- A inspeção deve ficar visível ao técnico após sincronização.
- O cancelamento deve exigir justificativa e registrar auditoria.

---

## 17.7 AC-MOBILE-LIST — Lista e detalhes no mobile

- O técnico visualiza somente inspeções autorizadas.
- A lista apresenta estado, prioridade, data, cliente e local.
- A interface diferencia atrasada, em andamento e pendente de sincronização.
- Filtros não devem apagar os dados locais.
- A ausência de inspeções deve apresentar estado vazio, não erro.
- A falha de atualização não deve remover os dados anteriormente armazenados.
- O detalhe deve funcionar offline para inspeções baixadas.

---

## 17.8 AC-START — Início da inspeção

### Cenário: iniciar inspeção atribuída

**Dado que** a inspeção está atribuída ao técnico

**Quando** o técnico confirma o início

**Então** a data e hora do dispositivo devem ser registradas

**E** a inspeção deve passar a em andamento localmente

**E** uma operação deve ser criada na outbox.

### Cenário: inspeção não autorizada

**Dado que** a inspeção pertence a outro técnico

**Quando** o usuário tenta iniciá-la

**Então** a API deve negar a operação.

### Cenário: localização negada

**Dado que** a localização foi solicitada

**E** o usuário negou a permissão

**Quando** a regra permitir continuidade

**Então** a inspeção poderá iniciar

**E** a ausência da localização deverá ser registrada ou informada.

---

## 17.9 AC-CHECKLIST — Checklist dinâmico

- Itens devem aparecer na ordem definida pelo snapshot.
- O componente deve corresponder ao tipo de resposta.
- Valores inválidos devem ser bloqueados com mensagem clara.
- Resposta confirmada deve ser salva em SQLite.
- Fechar e reabrir o aplicativo deve preservar respostas.
- O progresso deve ser recalculado corretamente.
- Itens obrigatórios pendentes devem ser identificáveis.
- Resposta não conforme deve exigir observação quando configurado.
- Resposta crítica não conforme deve exigir evidência quando configurado.
- Tipo desconhecido deve produzir estado controlado, sem encerrar o aplicativo inesperadamente.

---

## 17.10 AC-EVIDENCE — Evidências

### Cenário: capturar fotografia

**Dado que** a permissão da câmera foi concedida

**Quando** o técnico captura uma fotografia

**Então** a aplicação deve apresentar uma prévia

**E** permitir confirmar ou refazer

**E** associar a imagem ao item correto.

### Cenário: trabalhar offline

**Dado que** não existe conectividade

**Quando** o técnico confirma a fotografia

**Então** o arquivo deve permanecer no dispositivo

**E** um upload pendente deve ser criado

**E** a evidência deve continuar visível.

### Cenário: falha de upload

**Dado que** o servidor não confirmou o arquivo

**Quando** a sincronização termina parcialmente

**Então** a evidência deve permanecer pendente

**E** os demais dados confirmados não devem ser revertidos

**E** o técnico deve poder tentar novamente.

### Critérios adicionais

- Formato e tamanho devem ser validados.
- Evidência deve possuir identificador próprio.
- Evidência sincronizada deve aparecer na interface administrativa.
- Evidência de inspeção aprovada deve ser somente leitura.

---

## 17.11 AC-QR — QR Code

- A câmera deve solicitar permissão antes do uso.
- O código deve ser lido uma única vez por ciclo de confirmação.
- O equipamento deve ser procurado primeiro nos dados autorizados.
- Equipamento não localizado deve produzir mensagem clara.
- Divergência com o equipamento previsto deve exigir confirmação ou bloquear conforme regra.
- A leitura não pode permitir acesso a equipamento fora do escopo do usuário.
- Quando autorizado, deve existir identificação manual alternativa.

---

## 17.12 AC-LOCATION — Localização

- A aplicação deve solicitar consentimento.
- A coleta deve ser pontual, não contínua.
- Latitude, longitude, precisão e horário devem ser armazenados quando disponíveis.
- Falha de localização não deve encerrar o aplicativo.
- A ausência deve ser apresentada quando a localização for obrigatória.
- Os dados sincronizados devem estar visíveis na revisão.

---

## 17.13 AC-NONCONFORMITY — Não conformidades

- Título, descrição e criticidade devem ser validados.
- O registro deve estar relacionado à inspeção.
- O item relacionado deve ser preservado quando informado.
- Criticidade crítica deve exigir evidência.
- O registro deve funcionar offline.
- A não conformidade sincronizada deve aparecer na revisão administrativa.
- A exclusão após envio deve respeitar a regra de auditoria.

---

## 17.14 AC-COMPLETE — Conclusão

### Cenário: inspeção válida

**Dado que** todos os itens obrigatórios estão respondidos

**E** observações e evidências exigidas foram registradas

**Quando** o técnico confirma a conclusão

**Então** o aplicativo deve registrar o horário

**E** bloquear edição comum

**E** criar a operação de conclusão.

### Cenário: inspeção incompleta

**Dado que** existe item obrigatório pendente

**Quando** o técnico tenta concluir

**Então** a operação deve ser bloqueada

**E** a aplicação deve indicar os itens pendentes.

### Cenário: conclusão offline

**Dado que** não existe conectividade

**Quando** a inspeção válida é concluída

**Então** ela deve ficar marcada como aguardando sincronização

**E** os dados devem permanecer no dispositivo.

---

## 17.15 AC-SYNC — Sincronização

### Cenário: envio bem-sucedido

**Dado que** existem operações pendentes

**E** existe conectividade

**Quando** a sincronização é executada

**Então** as operações devem ser enviadas na ordem correta

**E** as confirmações devem ser persistidas localmente

**E** a quantidade pendente deve ser atualizada.

### Cenário: reenvio da mesma operação

**Dado que** uma operação já foi aplicada

**Quando** o aplicativo a envia novamente com o mesmo identificador

**Então** a API deve responder como já processada ou equivalente

**E** não deve criar duplicidade.

### Cenário: falha parcial

**Dado que** um lote possui várias operações

**Quando** uma delas falha

**Então** o resultado individual deve ser retornado

**E** operações confirmadas devem permanecer confirmadas

**E** a falha deve continuar pendente.

### Cenário: conflito

**Dado que** a versão do servidor é diferente da versão-base

**Quando** a alteração é enviada

**Então** a API deve retornar conflito

**E** a aplicação deve preservar a alteração local

**E** apresentar estado de conflito.

### Critérios adicionais

- O cursor somente deve avançar após persistência local.
- A tela deve mostrar última sincronização.
- Sair e entrar no aplicativo não pode apagar a outbox.
- Arquivos pendentes devem ter estado individual.

---

## 17.16 AC-ADMIN-MONITOR — Acompanhamento administrativo

- A listagem deve usar paginação.
- Deve permitir filtros por estado, técnico, cliente, prioridade e período.
- Inspeções atrasadas devem ser identificadas.
- Dados de carregamento, vazio e erro devem ser tratados.
- A visualização deve respeitar o perfil.
- A atualização de estado após sincronização deve aparecer sem necessidade de manipulação direta do banco.

---

## 17.17 AC-REVIEW — Revisão, aprovação e reprovação

### Cenário: iniciar revisão

**Dado que** a inspeção foi enviada

**Quando** o supervisor inicia a revisão

**Então** o estado deve mudar para em revisão

**E** a ação deve ser auditada.

### Cenário: aprovar

**Dado que** a inspeção está em revisão

**Quando** o supervisor confirma a aprovação

**Então** o estado deve mudar para aprovada

**E** o revisor e o horário devem ser registrados

**E** as respostas devem ficar protegidas contra edição comum.

### Cenário: reprovar

**Dado que** a inspeção está em revisão

**Quando** o supervisor tenta reprovar sem motivo

**Então** a ação deve ser bloqueada.

**Dado que** um motivo válido foi informado

**Quando** o supervisor confirma

**Então** o estado deve mudar para reprovada

**E** o técnico deve receber a informação na próxima sincronização.

---

## 17.18 AC-SECURITY — Segurança e autorização

- Endpoints protegidos rejeitam requisições sem sessão válida.
- Um técnico não consulta inspeções de outro técnico por alteração manual de URL.
- Um usuário sem perfil administrativo não gerencia cadastros.
- Arquivos não são disponibilizados publicamente sem controle.
- Senhas e tokens não aparecem em logs.
- Respostas de erro não apresentam stack trace ao cliente.
- Segredos não são versionados.
- A interface não é utilizada como única barreira de autorização.

---

## 17.19 AC-RELEASE — Aceitação da versão final

A versão final deverá demonstrar, sem edição manual do banco durante o fluxo:

1. Login administrativo;
2. Cadastro ou seleção de cliente, local e equipamento;
3. Criação ou seleção de modelo publicado;
4. Agendamento e atribuição;
5. Login do técnico;
6. Download da inspeção;
7. Início;
8. Resposta do checklist;
9. Foto;
10. QR Code;
11. Localização;
12. Perda simulada de conectividade;
13. Conclusão offline;
14. Retorno da conectividade;
15. Sincronização sem duplicidade;
16. Visualização administrativa;
17. Aprovação ou reprovação;
18. Atualização no aplicativo;
19. Consulta do histórico mínimo.
