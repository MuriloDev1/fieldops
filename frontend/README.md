# FieldOps Frontend - Painel Administrativo Web

Interface administrativa web oficial da plataforma **FieldOps**, desenvolvida em **React 19**, **Vite**, **Oxlint** e **CSS Moderno**, voltada para supervisores operacionais, engenheiros de manutenção e administradores da plataforma.

A interface provê controle centralizado de clientes, plantas operacionais, catálogo de equipamentos com QR Code, construtor de modelos de checklist versionados, despacho de ordens de serviço, painel analítico com KPIs e **histórico completo com linha do tempo de mudanças de estado e auditoria de inspeções (Task #51 e RN-086)**.

---

## 💻 Tecnologias

- **React 19.2** (Componentes Funcionais, Hooks customizados, Context API)
- **Vite 8.2** (Build tool e servidor de desenvolvimento ultra-rápido com HMR)
- **React Router Dom 7**
- **Lucide React** (Ícones modernos e acessíveis)
- **Oxlint** (Linter de alta performance em Rust)
- **CSS Modular & Custom Properties** (Design system limpo, responsivo e com suporte a dark mode)

---

## 🚀 Como Executar o Frontend

### Pré-requisitos
- **Node.js (v18+)**
- **npm** (incluso com Node)

### 1. Instalação das Dependências
Na pasta `frontend`:
```bash
npm install
```

### 2. Configurar Variáveis de Ambiente (Opcional)
Crie um arquivo `.env` na raiz da pasta `frontend` caso queira apontar para uma API em host customizado:
```env
VITE_API_URL=http://localhost:8080/api/v1
```
*Se não configurado, o valor padrão automático é `http://localhost:8080/api/v1`.*

### 3. Iniciar o Servidor de Desenvolvimento
```bash
npm run dev
```
O painel administrativo estará acessível no seu navegador em:
👉 **[http://localhost:5173](http://localhost:5173)**

### 4. Build de Produção
Para validar e compilar o bundle estático otimizado:
```bash
npm run build
```
Para testar a versão compilada localmente:
```bash
npm run preview
```

---

## 🔑 Credenciais de Teste

| Papel | E-mail | Senha |
|---|---|---|
| Administrador Geral | `admin@fieldops.com` | `123456` |
| Supervisor Operacional | `supervisor@fieldops.com` | `123456` |
| Técnico em Campo | `tecnico@fieldops.com` | `123456` |

---

## 🧭 Módulos e Funcionalidades

1. **Dashboard (`/dashboard`):**
   - Cartões com KPIs consolidados (Total de Inspeções, Taxa de Conformidade, Ativos Críticos, Equipes em Campo).
   - Ações rápidas para agendamento e alertas prioritários.
   - Tabela de ocorrências recentes.

2. **Clientes & Locais (`/clients`, `/locations`):**
   - Cadastro e gestão de empresas parceiras (Petrobras, Vale, Klabin).
   - Gestão de plantas, unidades de extração e refinarias com contagem de equipamentos vinculados.

3. **Equipamentos (`/equipment`):**
   - Catálogo de ativos industriais (bombas, compressores, caldeiras, painéis elétricos).
   - Identificação visual e geração de tags com códigos QR Code para check-in em campo.

4. **Modelos de Checklist (`/templates`):**
   - Construtor visual de templates de inspeção.
   - Criação de seções e perguntas dinâmicas (Conformidade, Booleano, Número, Texto).
   - Versionamento imutável garantindo snapshots íntegros.

5. **Operações & Despacho (`/operations`):**
   - Agendamento de inspeções atribuindo Modelo + Equipamento + Técnico + Data Prevista.
   - Drawer de detalhes com botões para início imediato, aprovação formal ou reprovação com justificativa obrigatória.
   - **Linha do tempo integrada de auditoria (Task #51).**

6. **Histórico do Ciclo de Vida (`/history`):**
   - Tela especializada para auditoria e rastreabilidade total (RN-086).
   - Filtros por código, equipamento, cliente, técnico e status operacional.
   - Visualização em stepper vertical de cada estágio do ciclo:
     - **Inspeção Criada:** data/hora e usuário que agendou.
     - **Técnico Atribuído:** profissional responsável.
     - **Execução Iniciada em Campo:** check-in presencial com QR Code.
     - **Respostas Enviadas:** submissão do checklist e não conformidades abertas.
     - **Revisão Iniciada:** auditoria do supervisor.
     - **Aprovação / Reprovação:** decisão formal com parecer técnico e justificativas registradas.

7. **Não Conformidades (`/non-conformities`):**
   - Acompanhamento das falhas apontadas em campo por grau de severidade (Baixa, Média, Alta, Crítica).

---

## ⚠️ Limitações Conhecidas Registradas

1. **Fallback de Demonstração:** Caso a API backend não esteja em execução no momento da navegação, o frontend entra automaticamente em modo de resiliência com dados mockados sincronizados, permitindo a demonstração completa da interface e da linha do tempo.
2. **Exportação de Relatórios:** A geração de relatórios completos em PDF requer integração com o serviço backend em execução; no modo estático, a visualização ocorre diretamente na tela do navegador.
