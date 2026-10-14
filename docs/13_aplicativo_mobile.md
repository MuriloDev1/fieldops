# 13. Aplicativo Mobile

## 13.1 Objetivo

Oferecer ao técnico uma ferramenta confiável para receber e executar inspeções em campo, com interface simples, recursos nativos e funcionamento offline.

---

## 13.2 Usuário principal

- Técnico de campo.

Usuários secundários poderão utilizar o aplicativo para testes ou execução excepcional, mas a experiência será projetada para o técnico.

---

## 13.3 Mapa de navegação sugerido

```text
app/
├── _layout.tsx
├── (public)/
│   └── login.tsx
└── (protected)/
    ├── _layout.tsx
    ├── (tabs)/
    │   ├── index.tsx                 # Início
    │   ├── inspections.tsx           # Lista
    │   ├── sync.tsx                  # Sincronização
    │   └── profile.tsx               # Perfil
    ├── inspections/
    │   ├── [inspectionId]/index.tsx  # Detalhes
    │   ├── [inspectionId]/start.tsx
    │   ├── [inspectionId]/checklist.tsx
    │   ├── [inspectionId]/summary.tsx
    │   └── [inspectionId]/non-conformities.tsx
    ├── scanner.tsx
    ├── evidence/
    │   ├── capture.tsx
    │   └── preview.tsx
    └── sync/
        └── details.tsx
```

---

## 13.4 Catálogo de telas

### Login

- E-mail;
- Senha;
- Ação entrar;
- Carregamento;
- Erro de credenciais;
- Indicação de indisponibilidade de rede;
- Informação sobre acesso offline, quando disponível.

### Início

- Saudação e usuário;
- Inspeções do dia;
- Inspeções atrasadas;
- Inspeções em andamento;
- Pendências de sincronização;
- Ação rápida para sincronizar;
- Ação rápida para QR Code.

### Lista de inspeções

- Pesquisa local;
- Filtros por estado, data e prioridade;
- Cartões com cliente, local, equipamento, prazo e estado;
- Indicador offline;
- Indicador de sincronização;
- Atualização manual.

### Detalhes da inspeção

- Título;
- Cliente;
- Local;
- Equipamento;
- Prioridade;
- Data prevista;
- Instruções;
- Progresso;
- Estado;
- Mapa ou coordenadas, quando disponíveis;
- Ação iniciar, continuar, corrigir ou consultar.

### Checklist

- Seções expansíveis ou navegação por etapas;
- Itens ordenados;
- Componente conforme tipo de resposta;
- Indicação de obrigatoriedade;
- Observação;
- Evidências;
- Não conformidade;
- Salvamento local;
- Progresso;
- Navegação para pendências.

### Captura e evidências

- Solicitação de permissão;
- Câmera;
- Seleção de galeria, quando permitida;
- Prévia;
- Refazer;
- Descrição;
- Vínculo visível com item;
- Estado de upload.

### Scanner

- Leitura de QR Code;
- Indicador de processamento;
- Equipamento encontrado;
- Divergência com equipamento previsto;
- Opção manual quando autorizada.

### Resumo e conclusão

- Total de itens;
- Itens respondidos;
- Itens obrigatórios pendentes;
- Não conformidades;
- Evidências;
- Localização;
- Confirmação de conclusão;
- Aviso de que o envio poderá permanecer pendente.

### Sincronização

- Última sincronização;
- Quantidade pendente;
- Operações com erro;
- Ação tentar novamente;
- Status por evidência;
- Mensagens compreensíveis;
- Detalhes técnicos limitados para suporte.

### Perfil

- Nome;
- E-mail;
- Perfil;
- Versão do aplicativo;
- Identificador do dispositivo quando necessário;
- Ação sincronizar;
- Ação sair.

---

## 13.5 Componentes dinâmicos do checklist

O aplicativo deverá possuir um mapeamento explícito entre tipo e componente:

```text
TEXT_SHORT       → Input de texto
TEXT_LONG        → Área de texto
NUMBER           → Input numérico
BOOLEAN          → Seletor Sim/Não
CONFORMITY       → Conforme/Não conforme/Não aplicável
SINGLE_CHOICE    → Seleção única
DATE             → Seletor de data
```

Tipos desconhecidos não deverão quebrar a tela. O aplicativo deverá indicar incompatibilidade e impedir conclusão quando o item obrigatório não puder ser respondido.

---

## 13.6 Estratégia de estado e dados (Tecnologias)

Sugestão de responsabilidades:

- **TanStack Query:** estado de dados remotos, invalidação e consultas online.
- **SQLite:** fonte de dados operacional das inspeções disponíveis offline.
- **Zustand ou Context:** estado pequeno de interface e sessão, evitando duplicar dados de servidor.
- **React Hook Form:** formulários e composição dos tipos de resposta.
- **Zod ou mecanismo equivalente:** validação de dados e contratos no cliente.
- **Secure Store:** dados sensíveis da sessão.

> O banco local não deve ser tratado apenas como cache descartável enquanto existirem alterações pendentes.

---

## 13.7 Recursos nativos obrigatórios

### Câmera

- Solicitar permissão;
- Capturar imagem;
- Apresentar prévia;
- Refazer;
- Associar ao item;
- Manter arquivo pendente.

### QR Code

- Ler código;
- Localizar equipamento;
- Validar divergência;
- Oferecer alternativa conforme regra.

### Localização

- Solicitar permissão;
- Capturar posição pontual;
- Registrar precisão e horário;
- Tratar indisponibilidade;
- Não coletar continuamente no MVP.

### Conectividade

- Detectar ausência de rede;
- Não bloquear o preenchimento;
- Acionar sincronização de forma controlada;
- Exibir estado atual.

---

## 13.8 Experiência offline

O técnico deverá distinguir claramente:

- **Salvo no dispositivo**;
- **Aguardando envio**;
- **Enviado com sucesso**;
- **Falha no envio**;
- **Conflito**.

A interface não deverá usar apenas mensagens temporárias para essa informação. O estado deverá permanecer visível na lista, no detalhe ou na tela de sincronização.

---

## 13.9 Requisitos de usabilidade

- Botões principais com tamanho adequado para toque.
- Contraste suficiente.
- Texto de erro próximo ao campo ou ação relacionada.
- Evitar formulários excessivamente densos.
- Preservar o contexto ao alternar entre checklist e câmera.
- Permitir retomar a posição no checklist.
- Confirmar ações irreversíveis.
- Exibir progresso.
- Não depender exclusivamente de cor para comunicar estado.
- Utilizar linguagem de negócio, não mensagens técnicas da API.

---

## 13.10 Requisitos de desempenho

- Listas deverão ser virtualizadas quando necessário.
- Imagens deverão ter tamanho e qualidade controlados.
- O aplicativo não deverá carregar todas as fotografias em resolução integral simultaneamente.
- Consultas locais deverão possuir índices adequados.
- Renderizações do checklist deverão evitar atualização de todos os itens a cada digitação.
- Sincronização deverá ser executada em lotes controlados.

---

## 13.11 Testes mobile prioritários

- Proteção de rota;
- Validação de login;
- Renderização de cada tipo de item;
- Validação de obrigatoriedade;
- Cálculo de progresso;
- Persistência local de resposta;
- Criação de operação na outbox;
- Comportamento offline;
- Redução de operações duplicadas;
- Tratamento de permissão negada;
- Conclusão bloqueada por pendências;
- Apresentação de erro de sincronização.

---

## 13.12 Escopo mínimo do mobile

O aplicativo mobile será considerado completo no MVP quando o técnico conseguir:

1. Autenticar-se;
2. Sincronizar suas inspeções;
3. Abrir uma inspeção offline;
4. Identificar o equipamento;
5. Iniciar;
6. Responder itens dinâmicos;
7. Registrar observação;
8. Capturar uma foto;
9. Registrar localização;
10. Registrar não conformidade;
11. Concluir;
12. Sincronizar;
13. Acompanhar o resultado do envio;
14. Receber uma solicitação de correção.
