# 8. Funcionalidades

## 8.1 Classificação de prioridade

| Prioridade | Significado |
| --- | --- |
| **P0** | Obrigatória para o MVP e para a demonstração final. |
| **P1** | Importante, implementada após a estabilidade do fluxo principal. |
| **P2** | Evolução futura ou desafio adicional. |

---

## 8.2 Funcionalidades do MVP — P0

### Autenticação e acesso

- Login por e-mail e senha;
- Emissão e renovação de token;
- Encerramento de sessão;
- Armazenamento seguro da sessão no mobile;
- Proteção de rotas no mobile e na web;
- Autorização por perfil na API;
- Inativação de usuário.

### Cadastros administrativos

- Usuários;
- Clientes;
- Locais de inspeção;
- Equipamentos;
- Código QR único por equipamento;
- Pesquisa, paginação e filtros básicos;
- Inativação lógica de registros.

### Modelos de inspeção

- Criação de modelo em rascunho;
- Criação e ordenação de seções;
- Criação e ordenação de itens;
- Definição do tipo de resposta;
- Definição de item obrigatório;
- Definição de exigência de observação ou evidência;
- Prévia do checklist;
- Publicação de versão;
- Preservação de versões já utilizadas.

### Planejamento de inspeções

- Seleção de modelo publicado;
- Seleção de cliente, local e equipamento;
- Definição de técnico responsável;
- Definição de prioridade e data prevista;
- Instruções adicionais;
- Cancelamento com justificativa;
- Acompanhamento por estado.

### Aplicativo do técnico

- Login;
- Tela inicial com resumo;
- Lista de inspeções atribuídas;
- Filtros por estado, data e prioridade;
- Detalhes da inspeção;
- Leitura de QR Code;
- Início da inspeção;
- Checklist dinâmico;
- Salvamento automático local;
- Indicador de progresso;
- Observações;
- Fotografias;
- Registro de localização no início e na conclusão, quando autorizado;
- Criação de não conformidade;
- Validação dos itens obrigatórios;
- Conclusão da inspeção;
- Tela de sincronização;
- Retomada de inspeção em andamento;
- Visualização de erro de sincronização.

### Operação offline e sincronização

- Download das inspeções atribuídas;
- Armazenamento em SQLite;
- Persistência de respostas;
- Persistência da referência local das evidências;
- Outbox de operações;
- Envio em lote;
- Identificação idempotente;
- Repetição controlada em caso de falha;
- Atualização do estado local;
- Download de alterações do servidor;
- Apresentação da última sincronização.

### Revisão administrativa

- Lista de inspeções enviadas;
- Filtros por técnico, cliente, estado e período;
- Visualização do resumo;
- Visualização por seção e item;
- Visualização das fotografias;
- Consulta da localização registrada;
- Consulta de não conformidades;
- Abertura da revisão;
- Aprovação;
- Reprovação com motivo obrigatório;
- Histórico mínimo de mudanças de estado.

### API e plataforma

- API versionada;
- Documentação OpenAPI;
- Validação de entrada;
- Tratamento global de erros;
- Paginação e ordenação;
- Upload de imagens;
- Controle de acesso;
- Auditoria de ações críticas;
- Scripts de banco ou migrações;
- Dados de demonstração;
- Instruções de execução.

---

## 8.3 Funcionalidades importantes — P1

- Dashboard administrativo com indicadores;
- Contagem de inspeções atrasadas;
- Pesquisa textual avançada;
- Comentários de revisão por item;
- Histórico detalhado das respostas;
- Notificações locais;
- Notificações push;
- Exportação simples de dados;
- Geração de relatório em PDF;
- Assinatura desenhada no dispositivo;
- Reatribuição de técnico;
- Múltiplas evidências por item com descrição;
- Comparação entre inspeções do mesmo equipamento;
- Resolução assistida de conflitos;
- Modo escuro;
- Biometria para reabrir sessão local;
- Painel de sincronizações com detalhes técnicos para suporte.

---

## 8.4 Funcionalidades futuras — P2

- Portal completo do cliente;
- Múltiplas organizações e multi-tenancy;
- Fluxo de tratamento de não conformidades;
- Planos de ação;
- Ordens de serviço;
- Manutenção preventiva;
- Assinatura eletrônica avançada;
- Geofencing;
- Rotas e otimização de deslocamentos;
- Registro de áudio;
- Vídeo;
- Reconhecimento óptico de caracteres;
- Análise de imagens por inteligência artificial;
- Sugestão automática de criticidade;
- Integração com sensores IoT;
- Integração com ERP;
- Webhooks;
- Integrações com armazenamento corporativo;
- Relatórios regulatórios específicos;
- Painéis analíticos avançados.

---

## 8.5 Tipos de resposta previstos

### Obrigatórios no MVP

- Texto curto;
- Texto longo;
- Número;
- Verdadeiro ou falso;
- Conforme ou não conforme;
- Seleção única;
- Data;
- Fotografia ou evidência associada.

### Opcionais no MVP ou P1

- Seleção múltipla;
- Escala numérica;
- Horário;
- Assinatura;
- Localização como resposta;
- QR Code como resposta;
- Arquivo;
- Medição com unidade.

---

## 8.6 Recorte de escopo recomendado para 16 semanas

Para preservar a qualidade, o projeto deverá priorizar:

1. Um único técnico responsável por inspeção;
2. Um único fluxo de revisão;
3. Tipos de resposta essenciais;
4. Fotografia como principal evidência;
5. Android como validação mobile;
6. Sincronização baseada em fila e idempotência, sem edição colaborativa simultânea;
7. Dashboard administrativo simples;
8. Portal do cliente fora do MVP.
