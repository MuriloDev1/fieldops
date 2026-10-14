# 11. Arquitetura

## 11.1 Visão arquitetural

O FieldOps adotará uma arquitetura distribuída composta por aplicações independentes que compartilham um contrato de API.

```text
┌─────────────────────────────┐
│ Aplicativo Mobile           │
│ Expo + React Native         │
│ SQLite + Secure Store       │
└──────────────┬──────────────┘
               │ HTTPS / JSON / Multipart
               ▼
┌─────────────────────────────┐
│ API REST                    │
│ Java + Spring Boot          │
│ Segurança + Regras          │
└───────┬──────────────┬──────┘
        │              │
        ▼              ▼
┌──────────────┐  ┌──────────────────┐
│ PostgreSQL   │  │ Armazenamento de │
│ Dados        │  │ evidências       │
└──────────────┘  └──────────────────┘
        ▲
        │ HTTPS / JSON
┌───────┴─────────────────────┐
│ Interface Administrativa    │
│ Angular + TypeScript        │
└─────────────────────────────┘
```

---

## 11.2 Princípios arquiteturais

- Separação clara entre interface, aplicação, domínio e infraestrutura.
- API como ponto central de regras e autorização.
- Contrato documentado antes da integração.
- Aplicativo mobile preparado para rede instável.
- Persistência local como parte da arquitetura, não como correção posterior.
- Operações de sincronização idempotentes.
- Modelos de inspeção versionados.
- Entidades históricas preservadas.
- Erros padronizados.
- Configurações sensíveis fora do repositório.
- Componentes independentes implantáveis separadamente.

---

## 11.3 Contextos funcionais

### Identidade e acesso

Responsável por usuários, perfis, autenticação, tokens e autorização.

### Cadastros

Responsável por clientes, locais e equipamentos.

### Modelos de inspeção

Responsável por rascunhos, seções, itens, tipos de resposta e publicação de versões.

### Planejamento

Responsável por criação, agendamento, atribuição e cancelamento de inspeções.

### Execução de campo

Responsável por início, respostas, evidências, localização, QR Code e conclusão.

### Sincronização

Responsável por lotes, idempotência, cursores, conflitos e confirmação de operações.

### Revisão

Responsável por análise, aprovação, reprovação e ciclos de correção.

### Auditoria e indicadores

Responsável por histórico, métricas e rastreabilidade.

---

## 11.4 Arquitetura do aplicativo mobile (Sugestão)

Estrutura sugerida:

```text
src/
├── app/                      # Rotas do Expo Router
├── features/
│   ├── auth/
│   ├── home/
│   ├── inspections/
│   ├── checklist/
│   ├── evidence/
│   ├── scanner/
│   ├── location/
│   └── synchronization/
├── components/               # Componentes compartilhados
├── design-system/            # Tokens, tema e componentes visuais
├── application/              # Casos de uso e orquestração
├── domain/                   # Tipos e regras independentes da interface
├── infrastructure/
│   ├── api/
│   ├── database/
│   ├── repositories/
│   ├── storage/
│   └── sync/
├── hooks/
├── schemas/
├── utils/
└── config/
```

### Responsabilidades por camada

- **Rotas e telas:** navegação, composição e estados visuais.
- **Features:** organização por capacidade de negócio.
- **Aplicação:** coordenação de ações como iniciar, salvar, concluir e sincronizar.
- **Domínio:** tipos, estados e validações independentes da plataforma.
- **Infraestrutura:** API, SQLite, armazenamento de arquivos e conectividade.
- **Design system:** consistência visual e acessibilidade.

---

## 11.5 Arquitetura da interface administrativa

Estrutura sugerida:

```text
src/app/
├── core/
│   ├── auth/
│   ├── guards/
│   ├── interceptors/
│   ├── http/
│   └── layout/
├── shared/
│   ├── components/
│   ├── directives/
│   ├── pipes/
│   └── validators/
├── features/
│   ├── dashboard/
│   ├── users/
│   ├── clients/
│   ├── sites/
│   ├── equipment/
│   ├── templates/
│   ├── inspections/
│   ├── reviews/
│   └── non-conformities/
└── app.routes.ts
```

### Princípios

- Carregamento de módulos por rota.
- Proteção por guard e autorização real na API.
- Serviços tipados.
- Componentes reutilizáveis para tabelas, filtros, estados e formulários.
- Formulários reativos.
- Interceptador de autenticação e tratamento de erros.
- Separação entre modelos de API e modelos de apresentação quando necessário.

---

## 11.6 Arquitetura da API Spring Boot

Estrutura sugerida por domínio ou feature:

```text
com.fieldops
├── auth/
├── user/
├── client/
├── site/
├── equipment/
├── template/
├── inspection/
├── evidence/
├── synchronization/
├── review/
├── audit/
└── shared/
```

Cada feature poderá conter:

```text
controller/
application/
domain/
repository/
dto/
mapper/
validation/
```

### Responsabilidades

- **Controller:** transporte HTTP e conversão de entrada e saída.
- **Application/Service:** orquestração dos casos de uso.
- **Domain:** regras e transições de estado.
- **Repository:** acesso aos dados.
- **DTO:** contrato externo, separado das entidades JPA.
- **Validation:** validações de negócio adicionais.
- **Mapper:** conversão explícita entre camadas.

---

## 11.7 Persistência central

- PostgreSQL como banco relacional.
- Migrações versionadas.
- Índices para e-mail, QR Code, estados, técnico e datas.
- Restrições de unicidade no banco para regras críticas.
- Controle otimista com campo de versão onde necessário.
- Exclusão lógica para entidades históricas.
- Transações em casos de uso que alteram múltiplas entidades.

---

## 11.8 Armazenamento de evidências

- O banco armazenará metadados e a chave do objeto.
- Em desenvolvimento poderá ser utilizado armazenamento local controlado ou serviço compatível com S3.
- Em produção, recomenda-se armazenamento de objetos.
- O acesso deverá ocorrer por endpoint autorizado ou URL temporária, evitando exposição pública permanente.
- Uploads deverão validar formato, tamanho e vínculo com a inspeção.

---

## 11.9 Estratégia offline-first

### Dados baixados

O aplicativo armazenará somente os dados necessários ao técnico:

- Perfil mínimo;
- Inspeções atribuídas;
- Cliente e local relacionados;
- Equipamento relacionado;
- Snapshot dos itens;
- Respostas existentes;
- Revisões e solicitações de correção pertinentes.

### Escrita local

Toda alteração de campo será gravada primeiro no SQLite. A interface não dependerá de uma resposta imediata da rede para considerar a alteração salva localmente.

### Outbox

Cada alteração sincronizável criará uma operação com:

- Identificador idempotente;
- Tipo de entidade;
- Identificador global;
- Tipo de operação;
- Payload;
- Dependências;
- Número de tentativas;
- Estado e erro.

### Envio

- Operações serão ordenadas por dependência.
- Dados estruturados poderão ser enviados antes dos arquivos.
- A API retornará resultado individual por operação.
- Operações confirmadas sairão da fila ativa.
- Falhas permanecerão disponíveis para nova tentativa.

### Download de alterações

- A API disponibilizará alterações desde um cursor ou instante confiável.
- O aplicativo atualizará a base local após concluir o envio ou de forma independente.
- O cursor será atualizado somente após persistência local bem-sucedida.

### Conflitos

No MVP:

- Inspeções aprovadas no servidor não aceitarão alterações atrasadas comuns;
- Versões divergentes gerarão conflito explícito;
- A aplicação não descartará silenciosamente o valor local;
- Casos complexos poderão exigir nova inspeção ou ação administrativa.

---

## 11.10 Segurança

- Todo tráfego externo deverá utilizar HTTPS em ambientes publicados.
- Senhas serão armazenadas com hash seguro no backend.
- Tokens de acesso terão duração limitada.
- Tokens sensíveis no mobile serão armazenados em mecanismo seguro.
- A interface administrativa evitará persistir tokens em locais desnecessariamente expostos.
- A API validará autorização em cada endpoint.
- Uploads serão validados.
- Logs não conterão senhas, tokens ou arquivos.
- Segredos serão fornecidos por variáveis de ambiente ou mecanismo equivalente.
- CORS será configurado somente para origens autorizadas.
- Erros externos não deverão expor stack trace.

---

## 11.11 Observabilidade

O MVP deverá oferecer:

- Identificador de correlação por requisição;
- Logs de autenticação sem conteúdo sensível;
- Logs de falha de sincronização;
- Auditoria de transições de estado;
- Registro de upload com identificador da evidência;
- Tratamento global de exceções;
- Mensagens amigáveis na interface e detalhes técnicos controlados no servidor.

---

## 11.12 Ambientes

| Ambiente | Finalidade |
| --- | --- |
| Local | Desenvolvimento individual. |
| Integração | Integração contínua entre mobile, web e API. |
| Teste/Demonstração | Avaliação e apresentação. |
| Produção acadêmica | Opcional, com acesso controlado. |

Cada ambiente deverá possuir:

- URL própria da API;
- Configuração de banco;
- Configuração de armazenamento;
- Credenciais separadas;
- Dados de teste adequados;
- Indicação visual quando necessário.

---

## 11.13 CI/CD e qualidade

Pipelines sugeridos:

### API

- Compilação;
- Testes;
- Análise estática;
- Criação de imagem de contêiner;
- Publicação no ambiente de integração.

### Interface administrativa

- Instalação reproduzível;
- Lint;
- Testes;
- Build;
- Publicação estática.

### Aplicativo mobile

- Verificação de tipos;
- Lint;
- Testes;
- Validação de configuração;
- Build de distribuição com EAS no marco final.

---

## 11.14 Requisitos não funcionais arquiteturais

| ID | Requisito |
| --- | --- |
| **RNF-001** | A aplicação mobile deverá preservar dados pendentes após reinicialização. |
| **RNF-002** | A API deverá responder erros em formato padronizado. |
| **RNF-003** | Listagens administrativas deverão utilizar paginação. |
| **RNF-004** | O aplicativo deverá apresentar estados de carregamento, vazio, erro e offline. |
| **RNF-005** | Operações de sincronização deverão ser idempotentes. |
| **RNF-006** | A interface mobile deverá ser utilizável em telas Android comuns. |
| **RNF-007** | A interface administrativa deverá ser responsiva para notebook e desktop. |
| **RNF-008** | O contrato da API deverá ser documentado. |
| **RNF-009** | O código deverá passar por análise de tipos e lint. |
| **RNF-010** | Dados sensíveis não deverão ser incluídos no repositório. |
| **RNF-011** | Alterações críticas deverão ser auditáveis. |
| **RNF-012** | Os componentes deverão poder ser executados por instruções documentadas. |