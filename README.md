# FieldOps — Plataforma de Inspeção em Campo

Uma plataforma digital integrada para planejamento, execução, acompanhamento e revisão de inspeções técnicas realizadas em campo, desenvolvida com suporte prioritário a operações *offline-first*.

## Visão Geral

O FieldOps substitui processos manuais baseados em formulários impressos e planilhas por um fluxo digital ponta a ponta. A solução conecta o trabalho do técnico em campo à gestão administrativa, garantindo a preservação de evidências, histórico, localização e o cumprimento estrito de regras de negócio em um ambiente rastreável.

## Arquitetura da Solução

O ecossistema do projeto é dividido em quatro componentes principais:

* **Aplicativo Mobile:** Focado na operação do técnico de campo. Suporta a execução de checklists dinâmicos, captura de mídias, leitura de QR Code e funcionamento totalmente autônomo sem conexão com a internet.
* **Interface Administrativa Web:** Portal destinado a administradores e supervisores para o gerenciamento de modelos de inspeção, agendamentos, revisão de não conformidades e aprovação de resultados.
* **API REST:** O núcleo central do sistema. Responsável por garantir a segurança, validar as regras de negócio, gerenciar a sincronização idempotente e manter a trilha de auditoria.
* **Infraestrutura de Dados:**
  * **PostgreSQL:** Banco de dados relacional central.
  * **SQLite:** Banco de dados embarcado para persistência local no dispositivo móvel.
  * **Object Storage:** Armazenamento otimizado para arquivos de evidências e fotografias.

## Principais Funcionalidades

* **Sincronização Resiliente:** Operações realizadas offline são enfileiradas (*Outbox*) e sincronizadas automaticamente quando a rede é restabelecida, utilizando identificadores únicos para evitar duplicidade.
* **Checklists Dinâmicos (Snapshots):** Inspeções são geradas a partir de cópias imutáveis (*snapshots*) de modelos previamente configurados, garantindo que alterações futuras no template não quebrem o histórico.
* **Máquina de Estados Segura:** Controle rigoroso do ciclo de vida da inspeção e bloqueio de edições comuns após a aprovação pelo supervisor.
* **Controle de Não Conformidades:** Lógica condicional que exige o preenchimento de observações e captura de fotos para itens reprovados com criticidade alta ou crítica.

## Como Executar o Projeto (Local)

### Pré-requisitos
* Node.js (v18+)
* PostgreSQL
* Expo CLI (para o ambiente Mobile)

### Passo a Passo

1. **Clone o repositório:**
   ```bash
   git clone [https://github.com/seu-usuario/fieldops.git](https://github.com/seu-usuario/fieldops.git)
   cd fieldops
