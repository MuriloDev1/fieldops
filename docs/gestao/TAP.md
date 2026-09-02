# Termo de Abertura do Projeto (TAP)

## 1. Identificação do Projeto

**Nome do projeto:** FieldOps  
**Área:** Aplicações Mobile  
**Tipo de solução:** Sistema para gerenciamento e execução de inspeções em campo.  
**Componentes principais:** Aplicativo Mobile, Interface Administrativa Web e API REST.

---

## 2. Visão Geral do Projeto

O FieldOps é uma solução destinada ao gerenciamento de processos de inspeção realizados em campo. O sistema tem como objetivo facilitar o planejamento, a execução, o acompanhamento e a validação das inspeções realizadas pelos técnicos.

A solução contará com uma interface administrativa destinada aos supervisores, na qual será possível acompanhar indicadores, criar modelos de inspeção, gerenciar equipamentos, agendar atividades, atribuir inspeções aos técnicos e revisar os resultados obtidos.

O técnico realizará as inspeções por meio do aplicativo, seguindo os modelos previamente configurados pelo supervisor e registrando os resultados e evidências durante a execução da atividade.

O processo será integrado por meio de uma API REST, permitindo a comunicação entre o aplicativo mobile, a interface administrativa e os dados do sistema.

---

## 3. Problema

Atualmente, o processo de realização e gerenciamento de inspeções pode apresentar dificuldades relacionadas à organização das atividades, distribuição das tarefas, acompanhamento dos resultados e validação das informações coletadas em campo.

A falta de centralização dessas informações pode dificultar o acompanhamento das inspeções pelo supervisor e aumentar a possibilidade de falhas no controle das atividades.

Dessa forma, o FieldOps busca centralizar e organizar o processo de inspeção, desde a criação do modelo utilizado na atividade até a revisão e aprovação dos resultados.

---

## 4. Justificativa

O desenvolvimento do FieldOps justifica-se pela necessidade de proporcionar maior organização, controle e visibilidade sobre o processo de inspeção.

A solução permitirá que o supervisor tenha uma visão centralizada das atividades, equipamentos, inspeções pendentes e alertas, além de possibilitar o planejamento das atividades e a distribuição das inspeções entre os técnicos.

Para os técnicos, o sistema permitirá a execução das inspeções de maneira estruturada, utilizando modelos previamente definidos e registrando os resultados e evidências necessárias.

Com isso, o projeto busca tornar o processo de inspeção mais organizado, rastreável e eficiente.

---

## 5. Objetivo Geral

Desenvolver uma solução integrada para gerenciar o ciclo completo de inspeções em campo, permitindo que supervisores criem modelos de inspeção, gerenciem equipamentos, agendem e atribuam atividades, enquanto técnicos realizam as inspeções e registram seus resultados, possibilitando posteriormente a revisão e aprovação pelo supervisor.

---

## 6. Objetivos Específicos

- Permitir que o supervisor acompanhe os principais indicadores das inspeções;
- Criar e personalizar modelos de inspeção;
- Definir os itens, perguntas, critérios e regras que serão utilizados nas inspeções;
- Cadastrar e gerenciar equipamentos;
- Consultar o histórico dos equipamentos;
- Agendar inspeções;
- Atribuir inspeções aos técnicos responsáveis;
- Permitir que técnicos executem as inspeções em campo;
- Registrar os resultados das inspeções;
- Permitir o registro de evidências durante a execução;
- Permitir que o supervisor revise os resultados;
- Permitir a aprovação ou reprovação das inspeções;
- Permitir a solicitação de correções quando forem identificadas não conformidades;
- Centralizar as informações necessárias para a tomada de decisões;
- Disponibilizar uma solução integrada por meio de aplicativo mobile, interface Web e API REST.

---

## 7. Escopo do Projeto

O escopo do FieldOps contempla o desenvolvimento das funcionalidades necessárias para apoiar o processo de inspeção, desde o planejamento até a aprovação dos resultados.

### 7.1 Dashboard do Supervisor

A tela inicial do sistema será o Dashboard do Supervisor.

Seu objetivo é permitir que o supervisor acompanhe os principais indicadores do processo de inspeção em tempo real.

O dashboard apresentará informações como:

- Número de inspeções realizadas;
- Quantidade de equipamentos cadastrados;
- Atividades pendentes;
- Alertas do sistema;
- Situação geral das inspeções.

O objetivo é centralizar as informações relevantes e facilitar a tomada de decisões pelo supervisor.

### 7.2 Construtor dos Modelos de Inspeção

O sistema disponibilizará uma funcionalidade para criação e personalização dos modelos de inspeção.

O supervisor poderá:

- Criar modelos de inspeção;
- Definir os itens que serão avaliados;
- Adicionar perguntas;
- Estabelecer critérios de avaliação;
- Configurar regras específicas;
- Associar os modelos aos equipamentos ou tipos de inspeção correspondentes.

Os modelos criados serão utilizados posteriormente pelos técnicos durante a execução das inspeções.

### 7.3 Listagem dos Equipamentos

O sistema contará com uma tela para gerenciamento dos equipamentos cadastrados.

O supervisor poderá:

- Consultar os equipamentos;
- Pesquisar equipamentos;
- Visualizar informações dos equipamentos;
- Acompanhar o histórico de cada equipamento;
- Selecionar equipamentos para realização das inspeções.

As informações serão apresentadas de maneira organizada, facilitando a consulta e o acompanhamento.

### 7.4 Agendamento e Atribuição das Inspeções

Após a criação do modelo de inspeção e seleção dos equipamentos, o supervisor poderá planejar as atividades da equipe.

A funcionalidade permitirá:

- Programar inspeções;
- Selecionar datas para realização das atividades;
- Atribuir inspeções aos técnicos;
- Organizar as tarefas da equipe;
- Visualizar as atividades por meio de um calendário.

Essa funcionalidade tem como objetivo melhorar a distribuição das atividades e facilitar o planejamento da equipe.

### 7.5 Execução da Inspeção pelo Técnico

O técnico realizará a inspeção utilizando o modelo previamente configurado pelo supervisor.

Durante a execução, o técnico poderá:

- Visualizar os itens que devem ser avaliados;
- Responder às perguntas da inspeção;
- Registrar os resultados;
- Informar situações de não conformidade;
- Coletar e registrar evidências;
- Finalizar a inspeção.

Após sua conclusão, os resultados serão disponibilizados para análise do supervisor.

### 7.6 Revisão e Aprovação das Inspeções

Após a execução da inspeção, o supervisor poderá revisar os resultados obtidos pelo técnico.

Nessa etapa será possível:

- Analisar os resultados;
- Verificar as evidências coletadas;
- Identificar não conformidades;
- Aprovar a inspeção;
- Reprovar a inspeção;
- Solicitar correções ao técnico.

Quando forem identificados problemas ou informações que necessitem de correção, o supervisor poderá devolver a inspeção para ajustes antes da aprovação final.

---

## 8. Fluxo Geral do Projeto

O processo principal do FieldOps seguirá o seguinte fluxo:

```text
Dashboard do Supervisor
↓
Criação do Modelo de Inspeção
↓
Cadastro e Seleção dos Equipamentos
↓
Agendamento da Inspeção
↓
Atribuição ao Técnico
↓
Execução da Inspeção pelo Técnico
↓
Registro dos Resultados e Evidências
↓
Revisão pelo Supervisor
↓
Aprovação, Reprovação ou Solicitação de Correção
```

---

## 9. Principais Usuários

### Supervisor

Responsável pelo gerenciamento e acompanhamento das inspeções.

Suas principais atividades são:

- Acompanhar indicadores;
- Criar modelos de inspeção;
- Gerenciar equipamentos;
- Agendar inspeções;
- Atribuir atividades aos técnicos;
- Revisar resultados;
- Analisar evidências;
- Aprovar ou reprovar inspeções;
- Solicitar correções.

### Técnico

Responsável pela execução das inspeções em campo.

Suas principais atividades são:

- Consultar inspeções atribuídas;
- Executar inspeções;
- Avaliar os itens definidos no modelo;
- Registrar resultados;
- Registrar evidências;
- Informar não conformidades;
- Finalizar as inspeções;
- Realizar correções quando solicitadas.

---

## 10. Principais Funcionalidades

As principais funcionalidades previstas para o FieldOps são:

1. Dashboard do Supervisor;
2. Criação de modelos de inspeção;
3. Personalização dos formulários;
4. Definição de perguntas e critérios;
5. Cadastro e gerenciamento de equipamentos;
6. Consulta do histórico dos equipamentos;
7. Agendamento de inspeções;
8. Atribuição de inspeções aos técnicos;
9. Execução das inspeções pelo aplicativo mobile;
10. Registro dos resultados;
11. Registro de evidências;
12. Identificação de não conformidades;
13. Revisão das inspeções;
14. Aprovação das inspeções;
15. Reprovação das inspeções;
16. Solicitação de correções;
17. Acompanhamento das atividades;
18. Exibição de alertas;
19. Integração entre aplicativo mobile e interface administrativa;
20. Comunicação por meio de API REST.

---

## 11. Arquitetura da Solução

O FieldOps será estruturado em três componentes principais:

### Aplicativo Mobile

Utilizado principalmente pelos técnicos para consultar e executar as inspeções em campo, registrar resultados e coletar evidências.

### Interface Administrativa Web

Utilizada principalmente pelos supervisores para gerenciamento dos modelos, equipamentos, atividades, inspeções e resultados.

### API REST

Responsável pela comunicação entre o aplicativo mobile, a interface administrativa e a camada de dados do sistema.

---

## 12. Entregas do Projeto

As principais entregas previstas são:

- Dashboard do Supervisor;
- Construtor de Modelos de Inspeção;
- Listagem e gerenciamento de equipamentos;
- Agendamento e atribuição das inspeções;
- Aplicativo para execução das inspeções;
- Funcionalidade de revisão e aprovação;
- API REST;
- Interface Administrativa Web;
- Modelo de dados;
- Arquitetura da solução;
- Backlog do produto;
- Roadmap;
- Critérios de aceitação;
- Definition of Done;
- Critérios de avaliação;
- Documentação do projeto.

---

## 13. Premissas

Para a execução do projeto, considera-se que:

- O supervisor será responsável pelo planejamento e gerenciamento das inspeções;
- Os técnicos serão responsáveis pela execução das inspeções em campo;
- Os modelos de inspeção serão configurados antes da realização das atividades;
- Os equipamentos estarão cadastrados antes do agendamento das inspeções;
- As inspeções serão atribuídas aos técnicos pelo supervisor;
- Os resultados das inspeções serão disponibilizados para revisão;
- As correções poderão ser solicitadas antes da aprovação final;
- Os componentes do sistema estarão integrados por meio da API REST.

---

## 14. Restrições

- O projeto deverá respeitar o escopo definido;
- O desenvolvimento deverá seguir o cronograma estabelecido no roadmap;
- As funcionalidades deverão atender aos requisitos e regras de negócio definidos;
- As entregas estarão sujeitas aos critérios de aceitação;
- Alterações relevantes de escopo deverão ser avaliadas e documentadas;
- O projeto estará limitado aos recursos e prazo disponíveis para seu desenvolvimento.

---

## 15. Critérios de Sucesso

O projeto será considerado bem-sucedido quando:

- O supervisor conseguir visualizar os principais indicadores no dashboard;
- For possível criar e personalizar modelos de inspeção;
- Os equipamentos puderem ser cadastrados e consultados;
- O supervisor conseguir agendar e atribuir inspeções;
- O técnico conseguir executar as inspeções pelo aplicativo;
- Os resultados e evidências forem registrados corretamente;
- O supervisor conseguir revisar as inspeções;
- O sistema permitir aprovação, reprovação ou solicitação de correção;
- As informações forem integradas entre aplicativo mobile, sistema Web e API REST;
- O fluxo completo de inspeção puder ser executado de ponta a ponta.

---

## 16. Resultado Esperado

Ao final do projeto, espera-se disponibilizar uma solução integrada capaz de organizar todo o ciclo de uma inspeção, desde sua configuração e planejamento até a execução, revisão e aprovação.

O FieldOps deverá proporcionar ao supervisor maior visibilidade sobre as atividades e aos técnicos uma ferramenta estruturada para execução das inspeções em campo.

Dessa forma, o sistema deverá contribuir para um processo de inspeção mais organizado, centralizado, rastreável e eficiente.

---

## 17. Aprovação do Projeto

A aprovação deste Termo de Abertura formaliza o início do projeto FieldOps e estabelece seus objetivos, escopo, principais funcionalidades, usuários, entregas e critérios de sucesso.

**Data:** 21/08/2026  
**Equipe responsável:** Murilo, Pedro, Julio, Matheus, Juan, Gizela.  
**Professor/Orientador:** _________________________________  
**Responsável pela aprovação:** ___________________________
