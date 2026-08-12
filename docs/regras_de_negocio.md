# Especificação de Regras de Negócio (RN) — Plataforma FieldOps

Este documento compila as **Regras de Negócio (RN)** que regem o comportamento funcional e técnico da plataforma **FieldOps**. Estas definições guiam diretamente o desenvolvimento do aplicativo mobile, da interface web administrativa, da API REST e das rotinas de sincronização e banco de dados.


## 1. Controle de Acesso e Sessão (AUT)

### RN-001 — Acesso Exclusivo a Técnicos Ativos
* **Descrição:** A autenticação e o uso do aplicativo mobile são restritos a usuários cadastrados com o perfil de técnico e que estejam marcados com o status ativo no sistema corporativo central.
* **Comportamento no App:** Caso um usuário seja inativado administrativamente na plataforma Web, sua sessão no aplicativo móvel deverá ser encerrada automaticamente no próximo fluxo de sincronização ou verificação online, bloqueando novas autenticações.


## 2. Estratégia Offline-First e Sincronização (OFF)

### RN-066 — Resiliência e Persistência Local da Fila
* **Descrição:** Todas as ações executadas pelo técnico em campo durante uma inspeção (respostas, observações, fotos capturadas e metadados) devem ser gravadas de forma imediata e atômica no banco de dados local SQLite antes de qualquer tentativa de transmissão por rede.
* **Comportamento no App:** O aplicativo móvel deve garantir que nenhuma alteração ou evidência fotográfica seja perdida se o app for forçado a fechar pelo sistema operacional, se houver descarga de bateria ou reinicialização abrupta do aparelho.

### RN-067 — Sincronização em Lote (Fila Outbox)
* **Descrição:** O aplicativo deve reter as operações pendentes em uma fila do tipo Outbox persistida no SQLite. O processamento das transações locais para o servidor remoto deve respeitar rigidamente a ordem cronológica em que foram efetuadas pelo técnico (padrão FIFO - *First-In, First-Out*).
* **Comportamento no App:** Operações dependentes (como a vinculação de fotos a uma resposta) nunca devem ser enviadas antes do registro da própria resposta associada.

### RN-068 — Idempotência de Transações na API
* **Descrição:** Toda e qualquer alteração de estado gerada pelo dispositivo móvel deve ser acompanhada de uma chave de idempotência única (UUID) gerada no momento em que a ação de fato ocorreu no cliente.
* **Comportamento no Servidor:** Se houver oscilação de sinal e o aplicativo reenviar a mesma transação, a API REST do servidor deve identificar o UUID duplicado, persistindo a operação apenas uma vez no PostgreSQL e retornando o status de sucesso para evitar a geração de duplicidades ou inconsistência de dados.

### RN-069 — Sinalização Visual de Estado de Conectividade
* **Descrição:** A interface do aplicativo deve possuir uma barra visual persistente no topo que reflita com clareza o estado atual de conectividade do dispositivo móvel.
* **Comportamento no App:** 
  * **Modo Online:** Barra em tom neutro ou azul corporativo, indicando "Online".
  * **Modo Offline:** Barra em tom de alerta (Laranja), exibindo o texto "Modo Offline", o contador de inspeções locais não sincronizadas ("X inspeções pendentes de envio") e o botão de ação "Sincronizar agora".

### RN-070 — Isolamento de Erros e Bloqueio de Fila
* **Descrição:** Caso ocorra um erro de validação de negócio de uma transação específica durante o processamento do lote no servidor, o sistema deve pausar apenas as transações subsequentes que tenham dependência técnica direta desta transação que falhou.
* **Comportamento no App:** Transações independentes na fila devem prosseguir, e o usuário deve ser notificado visualmente sobre qual item exato da inspeção gerou conflito técnico ou erro de rede persistente.


## 3. Ciclo de Vida da Inspeção e Snapshots (INSP)

### RN-021 — Snapshots Imutáveis de Modelos de Inspeção
* **Descrição:** Quando o técnico aciona o início de uma inspeção em campo, o aplicativo móvel deve capturar e salvar localmente um snapshot completo do modelo (template) do checklist em vigência naquele exato segundo.
* **Comportamento Técnico:** Se um administrador alterar a estrutura do checklist, as perguntas ou os critérios de avaliação na interface administrativa Web após o início da inspeção, a inspeção que já está em andamento (ou já foi concluída) permanece intocável, executando-se sob a versão antiga armazenada em seu snapshot. Isso impede a quebra de relatórios históricos.

### RN-024 — Ciclo de Vida das Inspeções
* **Descrição:** O fluxo de estados de uma inspeção é controlado por uma máquina de estados rígida, passando sequencialmente pelas seguintes etapas:
  ```
  [Agendada] ──(Check-in)──> [Em Execução] ──(Finalização)──> [Concluída (Local)]
                                                                     │
                                                               (Sincronização)
                                                                     v
  [Aprovada] <──(Revisão)── [Aguardando Revisão] <───────────────────┘
        OR
  [Reprovada (Com Justificativa)]
  ```
* **Comportamento no Servidor:** Uma inspeção no estado "Concluída" ou "Aguardando Revisão" é bloqueada para qualquer tipo de edição por parte do técnico de campo. A edição ou alteração de notas só pode ocorrer de forma motivada por meio da plataforma administrativa Web sob o perfil de um supervisor.

### RN-025 — Validação de Equipamento por QR Code
* **Descrição:** O início de qualquer preenchimento de checklist de inspeção é condicionado à leitura física de um QR Code afixado no equipamento de campo.
* **Comportamento no App:** O aplicativo móvel deve acionar o leitor de câmera e comparar o identificador lido do QR Code físico com o identificador do equipamento associado ao agendamento no banco de dados local. Caso haja divergência, a interface deve exibir um alerta impeditivo, bloqueando a inicialização do formulário.

### RN-026 — Consentimento de Recursos de Hardware
* **Descrição:** O aplicativo FieldOps necessita obrigatoriamente do uso dos recursos de geolocalização por satélite (GPS) e da câmera fotográfica do celular do usuário.
* **Comportamento no App:** No momento imediatamente anterior ao início do trabalho, o aplicativo deve exibir de forma clara e objetiva uma janela modal simulando a solicitação de consentimento para ativação de câmera e localização do dispositivo móvel. Se as permissões forem revogadas nas configurações do celular, as ações críticas devem ser suspensas temporariamente.


## 4. Execução de Checklists e Criticidade (EXE)

### RN-030 — Regra de Criticidade Condicional para Não Conformidades
* **Descrição:** Quando o técnico marcar qualquer item ou pergunta técnica do formulário dinâmico como "Não Conforme", o aplicativo móvel deve, por regra imperativa, alterar a estrutura da tela expandindo novas exigências.
* **Comportamento na Interface:** O técnico torna-se obrigado a preencher dois campos condicionais para que o formulário de resposta seja aceito:
  1. Uma descrição textual detalhando o problema (Observação de falha).
  2. A captura de ao menos uma evidência fotográfica anexada à resposta (Evidência Fotográfica).

### RN-031 — Bloqueio de Finalização por Incompletude
* **Descrição:** O botão de encerramento da inspeção ("Finalizar Inspeção") deve permanecer em estado inativo (desabilitado) no aplicativo enquanto houver pendências obrigatórias de preenchimento.
* **Comportamento no App:** Se houver itens obrigatórios não respondidos no checklist, ou se houver respostas marcadas como "Não Conforme" cujas exigências condicionais de justificativa em texto e foto (conforme RN-030) ainda não tenham sido integralmente fornecidas, o aplicativo deve alertar visualmente o usuário sobre quais perguntas de qual seção exigem atenção corretiva.


## 5. Auditoria, Rastreabilidade e Segurança (AUD)

### RN-042 — Rastreamento de Coordenadas de GPS
* **Descrição:** O sistema deve registrar as coordenadas exatas de latitude e longitude do técnico móvel em momentos cruciais do processo de auditoria de campo.
* **Comportamento no App:** O app deve colher e armazenar a geolocalização do dispositivo nos seguintes momentos:
  1. No instante em que o técnico clica em "Iniciar Inspeção" (Check-in/Início).
  2. No instante em que o técnico clica em "Finalizar Inspeção" (Check-out/Fim).
* **Finalidade:** Estes dados de localização devem ser exibidos na plataforma Web para comparação com o endereço cadastrado da planta industrial do cliente para impedir fraudes ou auditoria fantasma.

### RN-074 — Duplo Carimbo de Data/Hora (Timestamps)
* **Descrição:** Toda modificação estrutural de dados ou conclusão de inspeção armazenada na plataforma central deve registrar de forma segregada dois carimbos de data/hora distintos no banco de dados central (PostgreSQL).
* **Mapeamento de Dados:**
  * `data_execucao_dispositivo`: A data e hora exatas de quando a operação ocorreu sob a perspectiva física do celular do técnico (gravada pelo SQLite local com base no relógio local no momento da resposta).
  * `data_sincronizacao_servidor`: A data e hora exatas de quando os dados de fato chegaram e foram inseridos com sucesso no PostgreSQL central (servidor).
* **Finalidade:** Garantir que atrasos na transmissão por conectividade offline não mascarem a ordem lógica de execução das rotinas de inspeção e permitam medir com exatidão os prazos e ANS de sincronização.
