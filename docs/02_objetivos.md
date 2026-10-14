# 2. Objetivos

## 2.1 Objetivo Geral do Produto
Desenvolver uma plataforma integrada que permita configurar, planejar, executar, sincronizar, revisar e auditar inspeções técnicas em campo de forma padronizada, segura e rastreável.

---

## 2.2 Objetivos Específicos de Negócio
* Reduzir o uso de formulários em papel e planilhas isoladas;
* Padronizar a execução das inspeções por meio de modelos e checklists;
* Diminuir a perda e o preenchimento incompleto de informações;
* Permitir que supervisores acompanhem o andamento das atividades;
* Associar respostas a evidências, data, usuário, equipamento e localização;
* Preservar a rastreabilidade das alterações;
* Permitir a execução de inspeções em locais sem conectividade;
* Reduzir o intervalo entre a execução em campo e a disponibilidade do resultado;
* Facilitar a identificação e o acompanhamento de não conformidades.

---

## 2.3 Objetivos Específicos do Aplicativo Mobile
* Disponibilizar ao técnico apenas as inspeções relacionadas ao seu trabalho;
* Apresentar uma interface adequada ao uso em campo;
* Carregar checklists dinamicamente a partir da API;
* Capturar fotos, QR Code e localização mediante autorização;
* Armazenar localmente inspeções e respostas;
* Exibir claramente o estado de sincronização;
* Evitar a perda de dados em caso de falha de rede ou fechamento do aplicativo;
* Permitir retomada de uma inspeção em andamento.

---

## 2.4 Objetivos Específicos da Interface Administrativa
* Permitir que operações administrativas sejam realizadas sem acesso direto ao banco ou ao Swagger;
* Centralizar o cadastro de clientes, locais, equipamentos e usuários;
* Permitir a criação e manutenção de modelos de inspeção;
* Agendar e atribuir inspeções aos técnicos;
* Acompanhar o status das inspeções;
* Apresentar respostas, evidências e não conformidades de maneira organizada;
* Permitir aprovação, reprovação e solicitação de correção;
* Fornecer indicadores básicos para supervisão.

---

## 2.5 Objetivos Específicos da API
* Disponibilizar um contrato REST versionado e documentado;
* Implementar autenticação e autorização por perfil;
* Centralizar e validar as regras de negócio;
* Manter consistência entre mobile, web e banco de dados;
* Disponibilizar operações idempotentes para sincronização;
* Evitar duplicidade de registros em reenvios;
* Registrar auditoria das operações relevantes;
* Tratar erros de forma padronizada.

---

## 2.6 Objetivos Acadêmicos
O projeto deverá permitir que os estudantes apliquem, de maneira integrada:

### Desenvolvimento Mobile
* Expo e React Native;
* TypeScript;
* Expo Router;
* Gerenciamento de estado;
* Consumo de API;
* Formulários dinâmicos;
* Câmera e seleção de imagens;
* QR Code;
* Geolocalização;
* SQLite;
* Conectividade e sincronização;
* Testes, acessibilidade e distribuição.

### Desenvolvimento Backend
* Java e Spring Boot;
* Modelagem de domínio;
* JPA e PostgreSQL;
* Validação;
* Autenticação JWT;
* Controle de acesso;
* APIs REST;
* Upload de arquivos;
* Paginação e filtros;
* Sincronização;
* Testes e documentação OpenAPI.

### Desenvolvimento Web Administrativo
* Angular/React e TypeScript;
* Rotas protegidas;
* Formulários;
* Consumo de API;
* Componentes reutilizáveis;
* Tabelas, filtros e paginação;
* Tratamento de estados de carregamento, vazio e erro;
* Revisão de inspeções e visualização de evidências.

### Engenharia de Software
* Levantamento e refinamento de requisitos;
* Backlog e critérios de aceitação;
* Git e pull requests;
* Separação de responsabilidades;
* Integração entre equipes;
* Revisão de código;
* Testes;
* Documentação técnica;
* Demonstrações incrementais.

---

## 2.7 Indicadores de Sucesso do MVP
O MVP será considerado funcional quando:

1. Um supervisor conseguir cadastrar ou selecionar os dados necessários sem utilizar diretamente o banco de dados;
2. Um modelo de inspeção puder ser configurado pela interface administrativa;
3. Uma inspeção puder ser criada e atribuída a um técnico;
4. O técnico conseguir receber e abrir a inspeção no aplicativo;
5. O checklist for apresentado dinamicamente;
6. Os itens obrigatórios forem validados;
7. Fotografias puderem ser associadas a itens do checklist;
8. O equipamento puder ser identificado por QR Code;
9. A localização puder ser registrada quando autorizada;
10. Uma inspeção puder ser executada sem conexão após ser baixada;
11. O reenvio da mesma operação não criar dados duplicados;
12. O supervisor conseguir revisar, aprovar ou reprovar o resultado;
13. Uma inspeção aprovada ficar protegida contra alterações comuns;
14. A API estiver documentada e puder ser executada a partir das instruções do projeto.

---

## 2.8 Não Objetivos
O projeto **não** tem como objetivo, no MVP:

* Substituir sistemas corporativos completos de manutenção;
* Garantir conformidade com todas as normas de todos os setores industriais;
* Realizar diagnóstico automático;
* Controlar equipes em tempo real;
* Suportar volume corporativo de milhões de inspeções;
* Oferecer todas as funcionalidades de um produto comercial pronto para venda.
