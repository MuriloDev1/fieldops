# ☁️ Guia Passo a Passo: Deploy do FieldOps no AWS Academy Learner Lab

---

## 📌 Visão Geral

Este guia ensina como implantar o ecossistema completo do **FieldOps** (Banco de Dados PostgreSQL, Backend Spring Boot, Frontend Web React e Adminer) em uma instância **AWS EC2** utilizando o ambiente acadêmico do **AWS Academy Learner Lab**.

---

## 🚀 Passo 1: Iniciar o Laboratório no AWS Academy

1. Acesse o **AWS Academy Canvas** com seu login de estudante.
2. Entre no módulo **AWS Academy Learner Lab**.
3. Clique no botão **"Start Lab"** no canto superior direito.
4. Aguarde alguns minutos até que o círculo ao lado da palavra **"AWS"** mude de vermelho para **🟢 VERDE**.
5. Assim que o círculo estiver verde, clique no link **"AWS"** (ao lado do círculo verde). Uma nova aba será aberta diretamente no **Console de Gerenciamento da AWS** (região `us-east-1` N. Virginia).

---

## 🖥️ Passo 2: Criar e Configurar a Instância EC2

1. Na barra de pesquisa superior da AWS, digite **EC2** e clique no primeiro resultado.
2. No painel do EC2, clique no botão laranja **"Launch Instance"** (Executar Instância).
3. Preencha as configurações conforme abaixo:

### 1. Nome da Máquina:
- **Name:** `fieldops-server`

### 2. Sistema Operacional (AMI):
- Selecione **Ubuntu**.
- Escolha **Ubuntu Server 24.04 LTS (HVM), SSD Volume Type** (64-bit x86).

### 3. Tipo de Instância (Instance Type):
- Selecione **t3.small** (Recomendado: 2 vCPU, 2 GB RAM — suportado pelos créditos do Learner Lab).
- *Caso só esteja disponível t2.micro (1 GB RAM), nosso script ativa automaticamente 2 GB de memória Swap para garantir que o build não trave!*

### 4. Par de Chaves (Key Pair):
- Selecione **vockey** (chave padrão criada automaticamente pelo Learner Lab) ou selecione *"Proceed without a key pair"* se for conectar direto pelo navegador via EC2 Instance Connect.

### 5. Configurações de Rede (Security Group) — ⚠️ PASSO CRUCIAL!
Na seção **Network settings**, selecione **Create security group** e marque:
- [x] **Allow SSH traffic from** ➔ `Anywhere` (`0.0.0.0/0`)
- [x] **Allow HTTP traffic from the internet** ➔ `0.0.0.0/0` (Porta 80 — Frontend Web)

Em seguida, clique em **"Edit"** (Editar configurações de rede) e adicione as regras personalizadas clicando em **"Add security group rule"**:
- **Regra para API REST / Swagger:**
  - *Type:* **Custom TCP**
  - *Port range:* **8080**
  - *Source type:* **Anywhere** (`0.0.0.0/0`)
- **Regra para Adminer (Banco de Dados):**
  - *Type:* **Custom TCP**
  - *Port range:* **8085**
  - *Source type:* **Anywhere** (`0.0.0.0/0`)

### 6. Armazenamento (Configure Storage):
- Altere o tamanho do disco de `8 GiB` para **`20 GiB`** (General Purpose SSD `gp3`). O Learner Lab permite até 30 GiB gratuitos.

4. Clique no botão laranja **"Launch Instance"** no canto inferior direito.
5. Aguarde cerca de 1 a 2 minutos até que a instância esteja com status **"Running"** (Em execução).

---

## 💻 Passo 3: Conectar na Instância (Pelo Próprio Navegador)

1. No menu lateral esquerdo do EC2, clique em **Instances**.
2. Marque a caixinha da instância **`fieldops-server`**.
3. Clique no botão **"Connect"** (Conectar) na barra superior.
4. Na aba **EC2 Instance Connect**, mantenha o usuário como `ubuntu` e clique no botão laranja **"Connect"**.
5. Uma janela de terminal preta abrirá **diretamente no seu navegador**! Não é necessário baixar PuTTY ou configurar chaves SSH.

---

## ⚡ Passo 4: Executar o Deploy Automatizado (1 Único Comando)

No terminal preto que abriu, copie e cole o seguinte comando e pressione **ENTER**:

```bash
git clone -b develop https://github.com/MuriloDev1/fieldops.git && cd fieldops && bash deploy_aws.sh
```

### O que este script faz sozinho:
1. Ativa **2 GB de Swap** para que a compilação do Java 21 e Vite nunca dê erro de falta de memória.
2. Instala o **Docker Engine** e o **Docker Compose** oficiais.
3. Compila o Backend Spring Boot e o Frontend React em containers isolados.
4. Inicializa o banco de dados **PostgreSQL** com todas as tabelas e dados fictícios (`schema.sql` e `seed.sql`).
5. Descobre o **IP Público da sua EC2** e imprime na tela os links diretos para você acessar!

---

## 🌐 Passo 5: Acessar e Testar o FieldOps na Nuvem

Após o script concluir, copie o **IP Público** da sua instância (exemplo: `54.234.10.85`) e acesse no navegador:

- 🖥️ **Interface Administrativa Web (Supervisor):**
  👉 `http://<SEU-IP-PUBLICO>`
  *(Exemplo: `http://54.234.10.85`)*

- 📄 **Documentação Interativa da API (Swagger UI):**
  👉 `http://<SEU-IP-PUBLICO>:8080/swagger-ui.html`

- ⚙️ **Verificação de Saúde da API (Healthcheck):**
  👉 `http://<SEU-IP-PUBLICO>:8080/api/v1/health`

- 🗄️ **Adminer (Visualização do Banco PostgreSQL):**
  👉 `http://<SEU-IP-PUBLICO>:8085`
  *(Servidor: `postgres` | Usuário: `fieldops_admin` | Senha: `fieldops_secret_dev` | Banco: `fieldops_db`)*

### 🔑 Credenciais de Teste pré-cadastradas:
| Perfil | E-mail | Senha |
|---|---|---|
| **Supervisor** | `carlos.supervisor@fieldops.com.br` | `Senha@123` |
| **Técnico de Campo** | `marcos.tecnico@fieldops.com.br` | `Senha@123` |
| **Administrador** | `admin@fieldops.com.br` | `Senha@123` |

---

## 💡 Dicas Importantes para o AWS Academy Learner Lab

1. **Sessão do Learner Lab (Tempo Limite):**
   - O Learner Lab desliga a sessão a cada 4 horas. Se você for apresentar no dia seguinte ou após uma pausa, basta entrar no AWS Academy e clicar em **"Start Lab"** novamente.
   - Os arquivos e containers salvos no disco da EC2 **NÃO são perdidos** quando você reinicia o Lab.
2. **Mudança de IP Público:**
   - Sempre que a instância EC2 for interrompida e ligada de novo, a AWS pode atribuir um novo IP Público. Basta olhar na tela da EC2 qual é o novo IP e acessar.
3. **Comandos Úteis de Gerenciamento na EC2:**
   - Ver containers rodando: `sudo docker compose ps`
   - Ver logs do backend: `sudo docker compose logs -f backend`
   - Reiniciar aplicação: `sudo docker compose restart`
