# 14. Interface Administrativa Web

## 14.1 Objetivo

Fornecer aos administradores e supervisores uma interface adequada para configurar o sistema, planejar inspeções, acompanhar a operação e revisar resultados, sem necessidade de acesso direto ao banco de dados ou à documentação interativa da API.

---

## 14.2 Usuários principais

- Administrador;
- Supervisor.

O perfil de cliente somente leitura será uma evolução posterior.

---

## 14.3 Mapa de navegação sugerido

```text
/login
/app
├── /dashboard
├── /users
├── /clients
│   └── /:clientId/sites
├── /sites
│   └── /:siteId/equipment
├── /equipment
├── /inspection-templates
│   ├── /new
│   ├── /:templateId/edit
│   ├── /:templateId/preview
│   └── /:templateId/versions
├── /inspections
│   ├── /new
│   ├── /:inspectionId
│   └── /:inspectionId/review
├── /non-conformities
└── /audit
```

---

## 14.4 Layout principal

- Menu lateral ou navegação equivalente;
- Cabeçalho com usuário e ambiente;
- Breadcrumbs quando necessários;
- Área central responsiva;
- Mensagens globais controladas;
- Confirmação de ações críticas;
- Tratamento consistente de carregamento, vazio e erro.

---

## 14.5 Dashboard

### MVP

- Total de inspeções por estado;
- Inspeções atrasadas;
- Inspeções aguardando revisão;
- Não conformidades por criticidade;
- Atalhos para criar inspeção e revisar pendências.

### Evoluções

- Tendências por período;
- Desempenho por técnico;
- Tempo médio;
- Distribuição geográfica;
- Comparação entre clientes e equipamentos.

---

## 14.6 Usuários

Funcionalidades:

- Listar;
- Pesquisar;
- Filtrar por perfil e estado;
- Cadastrar;
- Editar dados permitidos;
- Ativar, inativar ou bloquear;
- Redefinir acesso por fluxo controlado;
- Visualizar inspeções relacionadas, quando autorizado.

---

## 14.7 Clientes, locais e equipamentos

### Clientes

- Listagem;
- Cadastro;
- Edição;
- Inativação;
- Acesso aos locais relacionados.

### Locais

- Vínculo com cliente;
- Endereço;
- Coordenadas opcionais;
- Contato local;
- Equipamentos relacionados.

### Equipamentos

- Identificação;
- Patrimônio;
- Número de série;
- Fabricante e modelo;
- QR Code;
- Situação;
- Histórico de inspeções, como P1.

---

## 14.8 Construtor de modelos de inspeção

Esta é uma das principais telas administrativas.

Deverá permitir:

- Criar modelo em rascunho;
- Editar título, descrição e categoria;
- Criar seções;
- Ordenar seções;
- Criar itens;
- Selecionar tipo de resposta;
- Configurar obrigatoriedade;
- Configurar observação e evidência em caso de não conformidade;
- Configurar opções de seleção;
- Reordenar itens;
- Visualizar prévia;
- Validar pendências;
- Publicar versão;
- Consultar versões anteriores.

### Decisão de escopo

Arrastar e soltar é desejável, mas não obrigatório. A ordenação poderá ser implementada inicialmente por botões de mover ou campo de ordem.

---

## 14.9 Planejamento de inspeções

A tela deverá permitir:

- Selecionar modelo e versão publicada;
- Selecionar cliente;
- Selecionar local filtrado pelo cliente;
- Selecionar equipamento filtrado pelo local;
- Selecionar técnico ativo;
- Definir supervisor;
- Definir data prevista;
- Definir prioridade;
- Incluir instruções;
- Validar dados;
- Criar e atribuir;
- Cancelar com justificativa;
- Consultar histórico de estado.

---

## 14.10 Acompanhamento

A listagem de inspeções deverá conter:

- Identificador ou título;
- Cliente;
- Local;
- Equipamento;
- Técnico;
- Prioridade;
- Data prevista;
- Estado;
- Progresso, quando disponível;
- Última atualização;
- Indicação de atraso.

Filtros:

- Texto;
- Estado;
- Técnico;
- Cliente;
- Prioridade;
- Período;
- Atrasadas;
- Aguardando revisão.

---

## 14.11 Tela de revisão

A revisão deverá apresentar:

- Cabeçalho da inspeção;
- Técnico e horários;
- Localização registrada;
- Progresso e resultado;
- Seções do checklist;
- Resposta por item;
- Observação;
- Fotografias relacionadas;
- Não conformidades;
- Histórico de revisões;
- Ação aprovar;
- Ação reprovar;
- Campo de motivo;
- Confirmação da decisão.

A interface não deverá permitir que o supervisor edite silenciosamente a resposta original do técnico.

---

## 14.12 Não conformidades

No MVP:

- Listar por inspeção;
- Exibir criticidade;
- Exibir descrição e evidências;
- Filtrar por criticidade;
- Consultar item relacionado.

O acompanhamento completo de plano de ação será P2.

---

## 14.13 Controle de acesso na interface

- Rotas deverão possuir guards.
- Menus deverão respeitar o perfil.
- Botões não autorizados não deverão ser apresentados.
- A API continuará sendo responsável pela decisão final.
- Um erro `403` deverá ser tratado de forma clara.

---

## 14.14 Integração com a API

- Serviços tipados.
- Interceptador de autenticação.
- Renovação de sessão conforme contrato.
- Tratamento central de erros comuns.
- Cancelamento ou controle de requisições quando necessário.
- Paginação no servidor.
- Filtros refletidos em parâmetros de consulta.
- Modelos de entrada e saída compatíveis com OpenAPI.

---

## 14.15 Estados obrigatórios de interface

Toda tela de dados deverá considerar:

- Carregando;
- Sucesso com dados;
- Sucesso sem dados;
- Erro de validação;
- Erro de autorização;
- Erro de rede;
- Erro interno;
- Ação em processamento;
- Confirmação de sucesso.

---

## 14.16 Testes prioritários

- Guard de rota;
- Permissões por perfil;
- Validação de formulário;
- Filtro encadeado cliente → local → equipamento;
- Criação de modelo;
- Bloqueio de publicação inválida;
- Criação de inspeção;
- Apresentação dos estados;
- Aprovação;
- Motivo obrigatório na reprovação;
- Tratamento de erro da API.

---

## 14.17 Escopo mínimo da interface administrativa

A interface será considerada completa no MVP quando:

1. O administrador gerenciar usuários;
2. O supervisor cadastrar ou selecionar cliente, local e equipamento;
3. O supervisor criar e publicar um modelo;
4. O supervisor agendar e atribuir uma inspeção;
5. A inspeção aparecer no acompanhamento;
6. O supervisor visualizar o resultado sincronizado;
7. As fotografias estiverem vinculadas aos itens;
8. As não conformidades forem apresentadas;
9. O supervisor aprovar ou reprovar;
10. A decisão for refletida no aplicativo após sincronização.
