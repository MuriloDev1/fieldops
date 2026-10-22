# FieldOps — Guia de Apresentação Final, Critérios de Avaliação e Estado do Projeto (2026)

Este documento foi elaborado para consolidar o estado de implementação do projeto **FieldOps**, listar os critérios de avaliação oficiais da banca examinadora (100 pontos), documentar o que foi implementado e fornecer instruções exatas para que qualquer desenvolvedor ou agente de IA (Antigravity) possa retomar o trabalho em qualquer computador.

---

## 1. Visão Geral e Roteiro de Testes (100 Pontos)

O roteiro de avaliação oficial da banca possui **12 verificações sequenciais** atravessando Frontend Web, Backend Spring Boot, Banco PostgreSQL e APK Android, com foco obrigatório em **Offline-First real** e **Hospedagem na AWS**.

- **Meta do Grupo:** 100 pontos (mínimo exigido: 80 pontos).
- **Branch oficial de trabalho:** `develop`

### Tabela de Pontuação e Status Atual

| Teste | Descrição / Verificação Oficial | Pontos | Status Atual | Detalhes da Implementação |
| :---: | :--- | :---: | :---: | :--- |
| **01** | **AWS em produção**<br>URL pública do frontend Web, API e banco na AWS sem `localhost` ou túnel. | 15 | 🟡 Pendente de deploy | Backend e Frontend prontos em Docker. Falta instanciar no AWS Learner Lab (`docker compose up -d`). |
| **02** | **APK Android instalado**<br>Arquivo APK autônomo gerado pelo Expo, rodando no Android sem Expo Go ou Metro. | 10 | 🟡 Pronto no código | Configurado [`fieldops-mobile/eas.json`](./fieldops-mobile/eas.json) e [`app.json`](./fieldops-mobile/app.json) para gerar APK (`buildType: "apk"`). Falta disparar o build. |
| **03** | **Login no Web**<br>Autenticar no Web com perfil Administrador ou Supervisor. | 5 | ✅ Pronto | Autenticação JWT via Spring Boot `/api/v1/auth/login`. Usuários de seed ativos no banco. |
| **04** | **Cadastros**<br>Cadastrar Cliente, Local e Equipamento vinculado ao local. Recarregar listagem. | 5 | ✅ Pronto | Endpoints e telas de Cliente, Local e Equipamento integrados ao banco via API. |
| **05** | **Modelo de inspeção**<br>Criar e publicar modelo com 1 seção e ao menos 2 itens (1 obrigatório). | 5 | ✅ Pronto | Backend possui `InspectionTemplateController` e versionamento ativo. Tela `TemplatesPage.jsx` integrada. |
| **06** | **Atribuição**<br>Criar inspeção com modelo, cliente, local e equipamento, e atribuir a um técnico. | 5 | ✅ Pronto | Endpoint `/api/v1/inspections` com status `ASSIGNED` e vínculo com o técnico responsável. |
| **07** | **Recebimento mobile e QR Code**<br>Técnico sincroniza a lista no APK, localiza a inspeção e lê o QR Code do equipamento. | 5 | ✅ 100% Pronto no App | Leitor de QR Code integrado com `expo-camera` (`CameraView`), botão de leitura direta e validação contra o código (`EQ-101`). |
| **08** | **Execução da inspeção**<br>Iniciar inspeção, responder item, marcar não conforme ("Não"), registrar foto de evidência. | 10 | ✅ 100% Pronto no App | Checklist funcional, destaque automático de Não Conformidade e captura de fotos via Câmera/Galeria em Base64. |
| **09** | **Offline-first real**<br>Desligar Wi-Fi, preencher checklist, capturar foto, fechar/matar o app completamente, reabrir offline com dados preservados e concluir sem internet. | 15 | ✅ 100% Pronto no App | **Rascunho em andamento persistente** em `@fieldops/rascunho-em-andamento`. Sobrevive a encerramento do processo e reinicialização. Conclusão offline na fila local. |
| **10** | **Reconexão e sincronização**<br>Ligar internet, sincronizar APK, conferir dados no Web; sincronizar novamente sem duplicação. | 15 | ✅ 100% Pronto no App | Algoritmo de sincronização diferencia inspeções pré-atribuídas de avulsas, evitando duplicação de `POST /inspections`. Header com botão Sync e indicador ONLINE/OFFLINE. |
| **11** | **Revisão no Web**<br>Supervisor abre inspeção no Web e aprova ou reprova com motivo. | 5 | ✅ Pronto no Web | `ReviewController` (`POST /api/v1/inspections/{id}/review`) integrado à tela `OperationsPage.jsx`. |
| **12** | **Atualização no APK**<br>Sincronizar novamente o APK e abrir inspeção revisada mostrando estado atualizado. | 5 | ✅ 100% Pronto no App | Ao recarregar, o modal de detalhes do técnico exibe o parecer e status (`APROVADA` / `REPROVADA`) emitido pelo supervisor. |
| **TOTAL** | | **100** | **75 pts funcionais / 25 pts de Deploy/APK** | |

---

## 2. O que foi Implementado na Última Sessão

### A. Mobile e Offline-First (`fieldops-mobile/`)
1. **Configuração de APK Android Autônomo:**
   - Criado [`fieldops-mobile/eas.json`](./fieldops-mobile/eas.json) com profiles `preview` e `production` apontando para `"buildType": "apk"`.
   - Atualizado [`fieldops-mobile/app.json`](./fieldops-mobile/app.json) com package `com.fieldops.mobile`, permissões de `CAMERA`, `READ_EXTERNAL_STORAGE`, `WRITE_EXTERNAL_STORAGE` e plugins nativos.
   - **Configurador Dinâmico de Servidor:** Modal na tela de Login permitindo ao usuário alterar o IP/URL da API em tempo de execução (ideal para **AWS Learner Lab**, onde o IP público muda a cada reinício de sessão, dispensando gerar um novo APK).
2. **Leitor de QR Code Nativo (Teste 07):**
   - Instalado `expo-camera` (`CameraView`) compatível com Expo 57.
   - Adicionado botão *"Ler QR Code"* no card da inspeção agendada e botão *"Escanear QR Code"* no topo da tela.
   - Valida o código lido contra o equipamento da inspeção (ex: `EQ-101`), exibindo selo verde de validação e iniciando o checklist.
   - Inclui campo de digitação manual para testes em emuladores sem câmera.
3. **Persistência de Rascunho Offline-First (Teste 09):**
   - Implementado hook em `InspecoesScreen` que grava a cada alteração o rascunho em `@fieldops/rascunho-em-andamento` no `AsyncStorage`.
   - Ao fechar o app no Android task manager e reabrir offline, o rascunho é restaurado com todas as respostas, observações e fotos preservadas.
4. **Sincronização sem Duplicação (Teste 10):**
   - Refatorada a função `sincronizarInspecoesPendentesInterno()`: inspeções pré-agendadas pelo Web utilizam o ID existente e apenas enviam respostas (`POST /inspections/{id}/answers`) e finalizam (`PATCH /inspections/{id}/complete`), sem recriar a inspeção.
   - Header do aplicativo exibe badge dinâmico `[ONLINE]` (verde) ou `[OFFLINE]` (vermelho) e botão manual de sincronização com contador de pendências.
5. **Fotos e Assinaturas Resilientes (Teste 08):**
   - Captura de fotos com escolha entre Câmera e Galeria.
   - Imagens salvas como Base64 (`data:image/jpeg;base64,...`), garantindo integridade no armazenamento local offline e no payload JSON.

### B. Backend Spring Boot (`backend/`)
1. **Segurança e Robustez JSON:**
   - Atualizados [`InspectionService.java`](./backend/src/main/java/com/fieldops/service/InspectionService.java) e [`InspectionResponseDTO.java`](./backend/src/main/java/com/fieldops/dto/inspection/InspectionResponseDTO.java) para utilizar o Jackson `ObjectMapper` ao serializar e desserializar `photoUrl` e `signatureUrl` na coluna `value_json` (JSONB) do PostgreSQL.
   - Elimina qualquer risco de erro de escape com imagens Base64 ou vetores SVG.
2. **Compilação e Testes:**
   - Compilado com Java 21 e Maven: `BUILD SUCCESS` com 0 erros.

### C. Frontend Web (`frontend/`)
1. **Build de Produção:**
   - Dependências sincronizadas e build Vite executado com sucesso (`built in 685ms`).
   - Telas integradas com a API via cliente HTTP Axios e interceptores de autenticação JWT.

---

## 3. Credenciais e Dados de Teste

O banco de dados possui seeds automáticos gerados pelo Flyway (`V2__seed_data.sql` / `database/seed.sql`):

### Usuários de Acesso
- **Administrador:** `admin@fieldops.com` / Senha: `123456`
- **Supervisor:** `supervisor@fieldops.com` / Senha: `123456`
- **Técnico:** `tecnico@fieldops.com` / Senha: `123456`

### Equipamentos e Códigos QR de Teste
- `EQ-101` — Torno CNC Industrial
- `EQ-202` — Prensa Hidráulica 50T
- `EQ-303` — Compressor de Parafuso
- `EQ-404` — Robô de Solda
- `EQ-505` — Caldeira a Vapor
- `EQ-606` — Ponte Rolante 10T

---

## 4. O que Falta Fazer para a Apresentação

Restam apenas **duas tarefas práticas** para concluir os 100 pontos:

### Tarefa 1: Gerar o arquivo APK instalável (Teste 02)
Execute dentro do diretório `fieldops-mobile`:

```bash
cd fieldops-mobile
# Opção A: Via Expo Application Services (Cloud - Recomendada)
npx eas-cli login
npx eas-cli build -p android --profile preview

# O EAS gerará um link direto para download do arquivo .apk instalável.
```

> **Dica:** Caso deseje gerar localmente e possua o Android SDK configurado:
> `npx eas-cli build -p android --profile preview --local`

---

### Tarefa 2: Subir na AWS Learner Lab (Teste 01)

Como o AWS Learner Lab tem limite de orçamento (~$50-$100), restrições de IAM e expira a cada 4 horas, a arquitetura ideal e mais segura é rodar **tudo em uma única instância EC2** via Docker Compose.

#### 1. Arquitetura na EC2
- **Porta 80:** Nginx servindo o Frontend React Web compilado.
- **Porta 8080:** API Spring Boot conectada ao banco.
- **Porta 5432 (ou rede interna Docker):** PostgreSQL com schema e seeds.

#### 2. Passos no Learner Lab
1. No painel AWS Learner Lab, inicie a sessão e vá para o console **EC2**.
2. Lance uma instância:
   - **Nome:** `fieldops-server`
   - **AMI:** Ubuntu Server 24.04 LTS (ou 22.04 LTS)
   - **Tipo de Instância:** `t3.small` (ou `t3.micro`)
   - **Key pair:** Crie ou utilize uma chave `.pem` para SSH.
   - **Security Group (Regras de Entrada / Inbound):**
     - SSH (Porta 22) — Seu IP
     - HTTP (Porta 80) — Qualquer lugar (`0.0.0.0/0`)
     - Custom TCP (Porta 8080) — Qualquer lugar (`0.0.0.0/0`)
3. Conecte na EC2 via SSH e instale Docker:
   ```bash
   sudo apt update && sudo apt install -y docker.io docker-compose-v2 git
   sudo usermod -aG docker ubuntu
   newgrp docker
   ```
4. Clone o repositório na EC2:
   ```bash
   git clone https://github.com/MuriloDev1/fieldops.git -b develop
   cd fieldops
   ```
5. Suba os containers com Docker Compose:
   ```bash
   docker compose up -d --build
   ```
6. Pronto!
   - Acesse o Web no navegador: `http://<IP-PUBLICO-EC2>/`
   - Teste o health check da API: `http://<IP-PUBLICO-EC2>:8080/health`
   - No APK Android: abra a tela de login, clique em *"Configurar Servidor AWS"* e insira `http://<IP-PUBLICO-EC2>:8080`.

---

## 5. Como Rodar o Projeto Localmente para Testes

### Backend Spring Boot
```bash
# Necessário Java 21 e Maven
cd backend
mvn spring-boot:run
# API disponível em: http://localhost:8080
# Documentação Swagger: http://localhost:8080/swagger-ui.html
```

### Frontend React Web
```bash
cd frontend
npm install
npm run dev
# Web disponível em: http://localhost:5173
```

### Mobile Expo (Ambiente de Dev)
```bash
cd fieldops-mobile
npm install
npx expo start
```

---

## 6. Histórico de Commits Relevantes
- `cc258ee`: *feat(mobile): offline-first draft, no-dup sync, QR Code & standalone APK config (Testes 02, 07, 08, 09, 10)*
- `5bf56cb`: *Merge pull request #52 from MuriloDev1/api* (Unificação do backend Spring Boot)
