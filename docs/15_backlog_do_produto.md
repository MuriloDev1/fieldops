# 15. Backlog do Produto

## 15.1 Estrutura recomendada no Notion (Sugestão)

Criar um banco de dados chamado **Product Backlog — FieldOps** com as seguintes propriedades:

| Propriedade | Tipo no Notion | Finalidade |
| --- | --- | --- |
| ID | Texto | Identificador único do item. |
| Título | Título | Nome curto da história ou tarefa. |
| Épico | Relação ou seleção | Agrupamento funcional. |
| História de usuário | Texto longo | Necessidade sob a perspectiva do usuário. |
| Componente | Seleção múltipla | Mobile, Admin, API, Banco ou Infraestrutura. |
| Prioridade | Seleção | P0, P1 ou P2. |
| Sprint | Relação ou seleção | Sprint planejada. |
| Status | Status | Backlog, Refinamento, Pronto, Em andamento, Em revisão, Concluído ou Bloqueado. |
| Responsável | Pessoa | Responsável principal. |
| Dependências | Relação | Itens que precisam ser concluídos antes. |
| Critérios de aceitação | Texto ou relação | Condições de aprovação. |
| Pontos | Número | Estimativa relativa. |
| Evidências | Arquivos/URL | Pull request, vídeo, prints ou relatório. |
| Disciplina | Seleção múltipla | Expo, Spring Boot, Angular ou Integração. |

---

## 15.2 Épicos

| ID | Épico | Resultado esperado |
| --- | --- | --- |
| EP-01 | Fundação técnica | Projetos executáveis, padronizados e integráveis. |
| EP-02 | Identidade e acesso | Usuários autenticados e autorizados. |
| EP-03 | Cadastros operacionais | Clientes, locais e equipamentos disponíveis. |
| EP-04 | Modelos de inspeção | Checklists configuráveis e versionados. |
| EP-05 | Planejamento | Inspeções agendadas e atribuídas. |
| EP-06 | Execução de campo | Técnico executa checklist pelo mobile. |
| EP-07 | Recursos nativos e evidências | QR Code, câmera e localização integrados. |
| EP-08 | Offline e sincronização | Operação sem rede e envio confiável. |
| EP-09 | Revisão e decisão | Supervisor revisa, aprova ou reprova. |
| EP-10 | Qualidade e entrega | Testes, documentação, builds e demonstração. |

---

## 15.3 Backlog priorizado do MVP

### EP-01 — Fundação técnica

| ID | História de usuário | Componente | Prioridade | Sprint |
| --- | --- | --- | --- | --- |
| PBI-001 | Como equipe, quero repositórios e convenções definidos para desenvolver os componentes de forma coordenada. | Todos | P0 | 1 |
| PBI-002 | Como desenvolvedor mobile, quero um projeto Expo com TypeScript, rotas e estrutura por features para iniciar o produto. | Mobile | P0 | 1 |
| PBI-003 | Como desenvolvedor web, quero um projeto Angular/React com layout, rotas e estrutura modular para iniciar o painel. | Admin | P0 | 1 |
| PBI-004 | Como desenvolvedor backend, quero uma API Spring Boot conectada ao PostgreSQL e com migrações para iniciar os serviços. | API/Banco | P0 | 1 |
| PBI-005 | Como equipe, quero lint, verificação de tipos e fluxo de pull request para manter um padrão mínimo de qualidade. | Todos | P0 | 1 |
| PBI-006 | Como integrador, quero um contrato inicial OpenAPI e dados simulados para que os frontends possam avançar em paralelo. | API/Integração | P0 | 1 |

### EP-02 — Identidade e acesso

| ID | História de usuário | Componente | Prioridade | Sprint |
| --- | --- | --- | --- | --- |
| PBI-007 | Como usuário, quero autenticar-me com e-mail e senha para acessar somente os recursos permitidos. | API | P0 | 2 |
| PBI-008 | Como técnico, quero iniciar e encerrar minha sessão no aplicativo. | Mobile | P0 | 2 |
| PBI-009 | Como administrador ou supervisor, quero iniciar e encerrar minha sessão na interface web. | Admin | P0 | 2 |
| PBI-010 | Como sistema, quero renovar a sessão sem solicitar credenciais a todo momento. | Mobile/Admin/API | P0 | 2 |
| PBI-011 | Como administrador, quero cadastrar, editar e inativar usuários. | Admin/API | P0 | 2 |
| PBI-012 | Como responsável por segurança, quero que a API valide o perfil em cada operação. | API | P0 | 2 |

### EP-03 — Cadastros operacionais

| ID | História de usuário | Componente | Prioridade | Sprint |
| --- | --- | --- | --- | --- |
| PBI-013 | Como supervisor, quero gerenciar clientes para organizar as inspeções por organização atendida. | Admin/API | P0 | 2 |
| PBI-014 | Como supervisor, quero gerenciar locais vinculados a clientes. | Admin/API | P0 | 2 |
| PBI-015 | Como supervisor, quero gerenciar equipamentos vinculados aos locais. | Admin/API | P0 | 2 |
| PBI-016 | Como supervisor, quero atribuir um código QR único ao equipamento. | Admin/API | P0 | 2 |
| PBI-017 | Como usuário administrativo, quero pesquisar, filtrar e paginar os cadastros. | Admin/API | P0 | 2 |

### EP-04 — Modelos de inspeção

| ID | História de usuário | Componente | Prioridade | Sprint |
| --- | --- | --- | --- | --- |
| PBI-018 | Como supervisor, quero criar um modelo de inspeção em rascunho. | Admin/API | P0 | 3 |
| PBI-019 | Como supervisor, quero criar e ordenar seções do checklist. | Admin/API | P0 | 3 |
| PBI-020 | Como supervisor, quero criar itens com diferentes tipos de resposta. | Admin/API | P0 | 3 |
| PBI-021 | Como supervisor, quero definir itens obrigatórios e regras de evidência. | Admin/API | P0 | 3 |
| PBI-022 | Como supervisor, quero visualizar uma prévia antes de publicar. | Admin | P0 | 3 |
| PBI-023 | Como supervisor, quero publicar uma versão imutável do modelo. | Admin/API | P0 | 3 |
| PBI-024 | Como sistema, quero preservar o snapshot utilizado pela inspeção. | API/Banco | P0 | 3 |

### EP-05 — Planejamento

| ID | História de usuário | Componente | Prioridade | Sprint |
| --- | --- | --- | --- | --- |
| PBI-025 | Como supervisor, quero agendar uma inspeção a partir de um modelo publicado. | Admin/API | P0 | 3 |
| PBI-026 | Como supervisor, quero selecionar cliente, local e equipamento de forma encadeada. | Admin/API | P0 | 3 |
| PBI-027 | Como supervisor, quero atribuir a inspeção a um técnico ativo. | Admin/API | P0 | 3 |
| PBI-028 | Como supervisor, quero definir prioridade, prazo e instruções. | Admin/API | P0 | 3 |
| PBI-029 | Como supervisor, quero cancelar uma inspeção com justificativa. | Admin/API | P0 | 3 |
| PBI-030 | Como supervisor, quero acompanhar a inspeção em uma listagem com filtros. | Admin/API | P0 | 4 |

### EP-06 — Execução de campo

| ID | História de usuário | Componente | Prioridade | Sprint |
| --- | --- | --- | --- | --- |
| PBI-031 | Como técnico, quero baixar e visualizar as inspeções atribuídas a mim. | Mobile/API | P0 | 4 |
| PBI-032 | Como técnico, quero filtrar minhas inspeções por estado, data e prioridade. | Mobile | P0 | 4 |
| PBI-033 | Como técnico, quero consultar os detalhes antes de iniciar. | Mobile | P0 | 4 |
| PBI-034 | Como técnico, quero iniciar a inspeção e registrar o horário. | Mobile/API | P0 | 4 |
| PBI-035 | Como técnico, quero visualizar o checklist gerado dinamicamente. | Mobile/API | P0 | 4 |
| PBI-036 | Como técnico, quero responder diferentes tipos de item. | Mobile | P0 | 4 |
| PBI-037 | Como técnico, quero que cada resposta seja salva localmente. | Mobile | P0 | 4 |
| PBI-038 | Como técnico, quero visualizar o progresso e os itens pendentes. | Mobile | P0 | 4 |
| PBI-039 | Como técnico, quero registrar observações em itens. | Mobile/API | P0 | 4 |
| PBI-040 | Como técnico, quero concluir somente quando todas as regras forem atendidas. | Mobile/API | P0 | 4 |

### EP-07 — Recursos nativos e evidências

| ID | História de usuário | Componente | Prioridade | Sprint |
| --- | --- | --- | --- | --- |
| PBI-041 | Como técnico, quero ler o QR Code para confirmar o equipamento. | Mobile/API | P0 | 5 |
| PBI-042 | Como técnico, quero capturar uma fotografia e visualizar a prévia. | Mobile | P0 | 5 |
| PBI-043 | Como técnico, quero associar a fotografia ao item correto. | Mobile/API | P0 | 5 |
| PBI-044 | Como técnico, quero manter a fotografia pendente quando o upload falhar. | Mobile | P0 | 5 |
| PBI-045 | Como técnico, quero registrar a localização no início e na conclusão. | Mobile/API | P0 | 5 |
| PBI-046 | Como técnico, quero registrar uma não conformidade com criticidade e evidência. | Mobile/API | P0 | 5 |
| PBI-047 | Como supervisor, quero visualizar evidências e não conformidades no acompanhamento. | Admin/API | P0 | 5 |

### EP-08 — Offline e sincronização

| ID | História de usuário | Componente | Prioridade | Sprint |
| --- | --- | --- | --- | --- |
| PBI-048 | Como técnico, quero acessar inspeções previamente baixadas sem internet. | Mobile | P0 | 6 |
| PBI-049 | Como técnico, quero que respostas permaneçam após fechar o aplicativo. | Mobile | P0 | 6 |
| PBI-050 | Como sistema, quero registrar alterações em uma outbox persistente. | Mobile | P0 | 6 |
| PBI-051 | Como sistema, quero enviar operações em lote e respeitar dependências. | Mobile/API | P0 | 6 |
| PBI-052 | Como sistema, quero impedir duplicidades quando uma operação for reenviada. | API | P0 | 6 |
| PBI-053 | Como sistema, quero baixar alterações utilizando cursor de sincronização. | Mobile/API | P0 | 6 |
| PBI-054 | Como técnico, quero visualizar pendências, falhas e última sincronização. | Mobile | P0 | 6 |
| PBI-055 | Como sistema, quero detectar conflito de versão e preservar os dados para análise. | Mobile/API | P0 | 6 |

### EP-09 — Revisão e decisão

| ID | História de usuário | Componente | Prioridade | Sprint |
| --- | --- | --- | --- | --- |
| PBI-056 | Como supervisor, quero visualizar inspeções aguardando revisão. | Admin/API | P0 | 7 |
| PBI-057 | Como supervisor, quero revisar respostas por seção e item. | Admin/API | P0 | 7 |
| PBI-058 | Como supervisor, quero ampliar e relacionar fotografias aos itens. | Admin/API | P0 | 7 |
| PBI-059 | Como supervisor, quero iniciar formalmente uma revisão. | Admin/API | P0 | 7 |
| PBI-060 | Como supervisor, quero aprovar uma inspeção. | Admin/API | P0 | 7 |
| PBI-061 | Como supervisor, quero reprovar uma inspeção informando o motivo. | Admin/API | P0 | 7 |
| PBI-062 | Como técnico, quero receber a inspeção reprovada com instruções de correção. | Mobile/API | P0 | 7 |
| PBI-063 | Como responsável por auditoria, quero registrar as mudanças de estado. | API/Banco | P0 | 7 |

### EP-10 — Qualidade e entrega

| ID | História de usuário | Componente | Prioridade | Sprint |
| --- | --- | --- | --- | --- |
| PBI-064 | Como usuário, quero mensagens compreensíveis para carregamento, vazio, erro e offline. | Mobile/Admin | P0 | 7 |
| PBI-065 | Como equipe, quero testes automatizados dos fluxos críticos. | Todos | P0 | 7 |
| PBI-066 | Como equipe, quero dados de demonstração reproduzíveis. | API/Banco | P0 | 8 |
| PBI-067 | Como avaliador, quero executar os projetos a partir do README. | Todos | P0 | 8 |
| PBI-068 | Como técnico, quero instalar uma build Android de demonstração. | Mobile | P0 | 8 |
| PBI-069 | Como usuário administrativo, quero acessar uma versão publicada do painel. | Admin | P0 | 8 |
| PBI-070 | Como equipe, quero uma API publicada ou executável por contêiner para demonstração. | API/Infra | P0 | 8 |
| PBI-071 | Como avaliador, quero consultar o OpenAPI e os principais diagramas. | API/Documentação | P0 | 8 |
| PBI-072 | Como equipe, quero demonstrar o fluxo ponta a ponta com dados reais de teste. | Todos | P0 | 8 |

---

## 15.4 Itens P1 sugeridos

| ID | História resumida | Componente |
| --- | --- | --- |
| PBI-073 | Dashboard com indicadores por estado e criticidade. | Admin/API |
| PBI-074 | Notificações locais de prazo. | Mobile |
| PBI-075 | Notificações push de nova atribuição. | Mobile/API |
| PBI-076 | Assinatura desenhada. | Mobile/API |
| PBI-077 | Relatório PDF básico. | API/Admin |
| PBI-078 | Histórico detalhado de respostas. | Admin/API |
| PBI-079 | Comentários de revisão por item. | Admin/API |
| PBI-080 | Biometria para reabertura local. | Mobile |
| PBI-081 | Tema escuro. | Mobile/Admin |
| PBI-082 | Exportação CSV. | Admin/API |

---

## 15.5 Política de refinamento

Um item poderá entrar em uma sprint somente quando possuir:

- História ou resultado esperado compreensível;
- Responsável funcional;
- Componente afetado;
- Prioridade;
- Dependências identificadas;
- Critérios de aceitação;
- Contrato de API, quando houver integração;
- Tamanho pequeno o suficiente para a sprint;
- Dados ou mock necessários.
