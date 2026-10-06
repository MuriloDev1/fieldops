# 1. Visão Geral

## 1.1 Nome do Produto
**FieldOps** — Plataforma de Inspeção em Campo

---

## 1.2 Resumo Executivo
O **FieldOps** é uma plataforma digital para planejamento, execução, acompanhamento e revisão de inspeções técnicas realizadas em campo.

A solução substituirá processos baseados em formulários impressos, planilhas, mensagens e registros informais por um fluxo digital integrado. 

* **Técnicos** utilizarão um aplicativo mobile para consultar as inspeções atribuídas, identificar equipamentos, responder checklists, registrar evidências e concluir atividades, inclusive em locais sem conexão com a internet.
* **Administradores e Supervisores** utilizarão uma interface administrativa web para cadastrar informações, criar modelos de inspeção, agendar atividades, atribuir técnicos, acompanhar a execução, analisar não conformidades e aprovar ou reprovar os resultados.
* **API REST** centralizará as regras de negócio, a autenticação, a autorização, a persistência, a auditoria e a integração entre o aplicativo mobile e a interface administrativa.

---

## 1.3 Declaração da Visão do Produto
> Para organizações que precisam executar inspeções técnicas de forma padronizada e rastreável, o **FieldOps** é uma plataforma integrada que permite planejar, executar e revisar inspeções em campo, mesmo sem conexão com a internet. Diferentemente de formulários em papel, planilhas ou aplicativos genéricos, o FieldOps conecta o trabalho do técnico à gestão administrativa, preservando evidências, histórico, localização e regras de negócio em um único fluxo digital.

---

## 1.4 Componentes da Solução
A solução será composta por quatro componentes principais:

### Aplicativo Mobile
Aplicação destinada principalmente aos técnicos de campo.
* **Responsabilidades principais:**
  * Autenticação e gerenciamento da sessão;
  * Consulta das inspeções atribuídas;
  * Identificação de equipamentos por QR Code;
  * Execução de checklists dinâmicos;
  * Captura de fotografias;
  * Registro de observações e não conformidades;
  * Captura de localização;
  * Armazenamento local;
  * Funcionamento offline;
  * Sincronização com o servidor.

### Interface Administrativa Web
Aplicação destinada aos administradores e supervisores.
* **Responsabilidades principais:**
  * Gerenciamento de usuários e perfis;
  * Cadastro de clientes, locais e equipamentos;
  * Criação e versionamento de modelos de inspeção;
  * Agendamento e atribuição de inspeções;
  * Acompanhamento do andamento;
  * Visualização de respostas e evidências;
  * Revisão, aprovação e reprovação;
  * Acompanhamento de não conformidades;
  * Consulta de indicadores.

### API REST
Aplicação central responsável pela segurança, regras de negócio e persistência.
* **Responsabilidades principais:**
  * Autenticação e autorização;
  * Validação das operações;
  * Aplicação das regras de negócio;
  * Persistência em banco de dados;
  * Upload e consulta de evidências;
  * Sincronização de dados;
  * Histórico e auditoria;
  * Fornecimento de dados para mobile e web;
  * Documentação do contrato da API.

### Infraestrutura de Dados
Componente formado pelo banco de dados, armazenamento de arquivos e mecanismos locais do aplicativo.
* **Elementos principais:**
  * **PostgreSQL:** Armazenamento dos dados centrais;
  * **SQLite:** Persistência local no dispositivo móvel;
  * **Armazenamento de Objetos (Object Storage):** Armazenamento de arquivos e evidências;
  * Logs e registros de auditoria;
  * Ambientes segregados de desenvolvimento, teste e produção.

---

## 1.5 Escopo do Produto
O FieldOps cobrirá o fluxo compreendido entre a preparação de uma inspeção e sua aprovação final:

```text
Configuração administrativa
         ↓
Criação do modelo de inspeção
         ↓
Agendamento e atribuição
         ↓
Disponibilização ao técnico
         ↓
Execução em campo
         ↓
Registro de respostas e evidências
         ↓
Sincronização
         ↓
Revisão do supervisor
         ↓
Aprovação ou solicitação de correção
```
