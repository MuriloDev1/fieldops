# FieldOps Mobile - Aplicativo do Técnico de Campo

Aplicativo móvel da plataforma **FieldOps**, desenvolvido em **React Native** com **Expo** e arquitetura **Offline-First**, em conformidade com as regras de negócio **RN-001 a RN-090** e os requisitos acadêmicos do SENAI.

O aplicativo é a ferramenta de trabalho em campo dos técnicos, permitindo consulta de ordens de serviço, check-in por leitura de QR Code, execução de checklists dinâmicos, captura de fotos para não conformidades, registro de coordenadas GPS e sincronização idempotente via Outbox Pattern.

---

## 📱 Tecnologias Utilizadas

- **React Native 0.86+**
- **Expo SDK 57** (Expo Router, Expo Camera, Expo Barcode Scanner, Expo Location)
- **TypeScript**
- **SQLite Local (expo-sqlite)** para persistência e fila Outbox resiliente
- **Lucide Icons / Expo Vector Icons**

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- **Node.js (v18+)** instalado
- **npm** ou **yarn** instalado
- Smartphone físico com o aplicativo **Expo Go** instalado (Android recomendado) OU um emulador Android configurado no Android Studio.

### 1. Instalação das Dependências
Na pasta `fieldops-mobile`:
```bash
npm install
```

### 2. Configurar a Conexão com o Backend
Crie ou edite o arquivo `.env` (ou `app.json`):
```env
EXPO_PUBLIC_API_URL=http://<SEU_IP_LOCAL>:8080/api/v1
```
> **Nota para execução em celular físico ou emulador:** Substitua `<SEU_IP_LOCAL>` pelo IP da máquina de desenvolvimento na rede Wi-Fi local (ex: `192.168.1.100`), pois `localhost` dentro do dispositivo aponta para o próprio celular.

### 3. Iniciar o Servidor Expo
```bash
npx expo start
```

### 4. Abrir no Dispositivo
- **Celular Físico:** Abra o aplicativo Expo Go e escaneie o QR Code exibido no terminal.
- **Emulador Android:** Pressione a tecla `a` no terminal após abrir o emulador.
- **Web (Pré-visualização):** Pressione `w` no terminal.

---

## 🔑 Credenciais de Teste

| Papel | E-mail | Senha |
|---|---|---|
| Técnico de Campo | `tecnico@fieldops.com` | `123456` |
| Administrador / Suporte | `admin@fieldops.com` | `123456` |

---

## 🎯 Fluxo de Operação em Campo (Demonstração da Banca)

1. **Login e Download da Agenda:**
   - O técnico autentica-se e o aplicativo sincroniza automaticamente as inspeções atribuídas a ele via endpoint `GET /api/v1/mobile/inspections`.
   - Os dados e os snapshots do checklist são salvos no SQLite local.

2. **Simulação Sem Conectividade (Offline-First):**
   - Ative o Modo Avião do celular.
   - O técnico continua acessando suas ordens de serviço, equipamentos e formulários normalmente.

3. **Check-in via QR Code (RN-025):**
   - Ao abrir a inspeção, o app aciona o scanner de câmera para ler o QR Code do equipamento (ex: `QR-KSB-01`, `QR-CCM-02`).
   - Se o código conferir, a inspeção transiciona para `IN_PROGRESS` e captura a localização GPS inicial (RN-042).

4. **Preenchimento do Checklist Dinâmico:**
   - Respostas conformes e não conformes.
   - Caso um item receba status **Não Conforme**, o app obriga a inserção de justificativa textual e disparo de foto pela câmera nativa (RN-030 e RN-039).

5. **Finalização e Fila Outbox:**
   - Ao concluir a inspeção, uma transação é registrada na tabela local `outbox` com UUID idempotente.

6. **Reconexão e Sincronização:**
   - Desative o Modo Avião.
   - O app detecta a conexão e envia o lote pendente via `POST /api/v1/mobile/sync/push`.
   - O backend processa a submissão, cria a Não Conformidade formal e disponibiliza a inspeção para revisão no painel Web.

---

## ⚠️ Limitações Conhecidas Registradas

1. **Plataforma iOS:** O foco do desenvolvimento e homologação de hardware (câmera e GPS) foi na plataforma Android e Web. No iOS através do Expo Go, permissões de câmera exigem aprovação explícita nas configurações de privacidade.
2. **Resolução de Conflitos Offline:** Quando uma inspeção for cancelada pelo supervisor no painel central enquanto o técnico estiver sem internet, o backend descarta o envio e preserva o histórico de cancelamento (RN-048).
3. **Persistência de Mídia no Mock:** No modo puramente mockado sem backend conectado, fotos são representadas por URIs locais temporárias do cache do dispositivo.
