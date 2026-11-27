# 13. Aplicativo Mobile (`fieldops-mobile/`)

## 13.1 Objetivo

Oferecer ao técnico de campo uma ferramenta confiável, ergonômica e 100% resiliente à falta de internet (**Offline-First Real**) para receber, validar por QR Code e executar inspeções técnicas, capturando fotografias e assinatura digital sem perda ou duplicação de dados.

---

## 13.2 Usuário principal

- **Técnico de campo (`TECHNICIAN`)** — execução de checklists, leitura de QR Code, captura de evidências e sincronização.
- Supervisores e administradores também podem autenticar-se para homologação e consulta operacional.

---

## 13.3 Estrutura e Mapa de Navegação Implementados

O aplicativo foi desenvolvido em **React Native 0.86 + Expo SDK 57 + TypeScript**, compilável em **APK Android autônomo** via EAS Build (`eas.json`), estruturado em abas inferiores e modais especializados gerenciados em `fieldops-mobile/App.tsx`, apoiado pelos serviços tipados em `fieldops-mobile/src/`:

```text
fieldops-mobile/
├── App.tsx                           # Aplicação principal (Login, Configurador AWS, Abas, Checklist, Scanner QR, Assinatura SVG)
├── index.ts                          # Registro do componente raiz no Expo
├── app.json                          # Permissões Android (CAMERA, STORAGE), pacote com.fieldops.mobile e plugins
├── eas.json                          # Configuração de build nativo Android (buildType: "apk")
└── src/
    ├── services/
    │   ├── api.ts                    # Cliente Axios tipado, fila de refresh JWT e updateApiBaseUrl dinâmico
    │   ├── authService.ts            # Login, sessão e sanitização estrita de logs (RN-001, RN-007)
    │   └── tokenStorage.ts           # Armazenamento seguro em expo-secure-store (com fallback AsyncStorage na Web)
    └── types/
        └── api.ts                    # Contratos TypeScript estritos (sem uso de any)
```

### Fluxo de Navegação por Abas e Modais
1. **Tela de Login + Modal de Configuração de Servidor AWS:**
   - Autenticação com e-mail e senha (`POST /api/v1/auth/login`).
   - Botão **"Configurar Servidor AWS"** que permite alterar em tempo de execução o IP/URL da API (`@fieldops/custom-api-url`), ideal para sessões do AWS Learner Lab cujo IP público muda a cada reinício.
2. **Cabeçalho Global de Conectividade (`RN-071`):**
   - Badge dinâmico `[ONLINE]` (verde) ou `[OFFLINE]` (vermelho) monitorado em tempo real via `@react-native-community/netinfo`.
   - Botão manual **Sync** com contador de inspeções pendentes na fila offline.
3. **Aba `Dashboard` (Início):**
   - Indicadores operacionais, andamento semanal, ações rápidas e lista de não conformidades recentes.
4. **Aba `Inspeções` (Execução e Sincronização):**
   - Lista de inspeções atribuídas/agendadas e histórico de inspeções concluídas.
   - Botão **"Ler QR Code"** por inspeção e **"Escanear QR Code"** no topo (`CameraView` de `expo-camera`).
   - Execução do checklist dinâmico com salvamento automático de rascunho a cada alteração.
   - Modal de detalhes da inspeção concluída exibindo o parecer formal do supervisor (`APROVADA` ou `REPROVADA` com justificativa).
5. **Aba `Equipamentos`:**
   - Catálogo pesquisável de ativos industriais com filtros por status (`Ativo`, `Manutenção`, `Inativo`), especificações técnicas e código QR.
6. **Aba `Perfil`:**
   - Dados do usuário autenticado, informações de sessão e encerramento seguro de sessão (`logout`).

---

## 13.4 Componentes Dinâmicos do Checklist e Evidências

O formulário de execução adapta-se dinamicamente aos itens da inspeção:

- **Conformidade (`CONFORMITY` / `Sim` / `Não`):**
  - Quando marcado como **"Não"** (Não Conforme), o aplicativo aciona automaticamente a regra de criticidade condicional (`RN-038`, `RN-039`), destacando o item e exigindo justificativa na observação e evidência fotográfica.
- **Texto e Observações (`TEXT_SHORT`, `TEXT_LONG`):**
  - Campos de entrada textual para medições, anotações técnicas e detalhamento de falhas.
- **Captura de Fotografias (`PHOTO` / Evidências):**
  - Escolha entre **Câmera Nativa** e **Galeria** via `expo-image-picker`.
  - Conversão e persistência imediata em **Base64** (`data:image/jpeg;base64,...`), garantindo que a imagem sobreviva offline junto com o rascunho e seja transmitida de forma atômica no payload JSON para a coluna `value_json` (JSONB) do PostgreSQL.
- **Assinatura Digital (`SignaturePad`):**
  - Componente nativo construído com `react-native-svg` e `PanResponder` (sem dependência de WebView), gerando um vetor SVG serializado (`data:image/svg+xml;utf8,...`) compatível com Android, iOS e Web.

---

## 13.5 Estratégia de Persistência Offline-First e Sincronização sem Duplicação

O aplicativo utiliza chaves estruturadas no `AsyncStorage` combinadas com `expo-secure-store` para garantir resiliência total em campo:

| Chave de Armazenamento | Finalidade |
| :--- | :--- |
| `@fieldops/rascunho-em-andamento` | **Rascunho Persistente (`RN-066`):** grava instantaneamente cada resposta, observação, foto Base64, validação de QR Code e assinatura da inspeção aberta. Se o aplicativo for fechado no gerenciador de tarefas do Android e reaberto sem internet, todo o preenchimento é restaurado automaticamente. |
| `@fieldops/inspecoes-pendentes-offline` | **Fila Outbox de Conclusão (`RN-067`):** armazena inspeções concluídas enquanto o dispositivo estava sem internet, aguardando reconexão para envio. |
| `@fieldops/inspecoes-agendadas-cache` | Cache local das inspeções atribuídas ao técnico para abertura offline (`RN-065`). |
| `@fieldops/inspecoes-concluidas-cache` | Cache local das inspeções finalizadas e revisadas pelo supervisor. |
| `@fieldops/equipamentos-cache` | Cache local do catálogo de equipamentos e códigos QR para validação offline. |
| `@fieldops/modelos-cache` | Cache local dos modelos de checklist e perguntas. |
| `@fieldops/custom-api-url` | URL customizada do servidor backend/AWS configurada na tela de login. |

### Algoritmo de Sincronização sem Duplicação (`RN-068`)
Ao detectar reconexão ou quando o técnico aciona o botão **Sync**, a rotina `sincronizarInspecoesPendentesInterno()`:
1. Percorre a fila `@fieldops/inspecoes-pendentes-offline` em ordem FIFO.
2. Verifica se a inspeção já possui um ID pré-agendado pelo servidor (status `ASSIGNED` / `IN_PROGRESS`):
   - **Se pré-agendada:** **não** executa `POST /inspections` (evitando duplicar a inspeção no banco). Envia diretamente as respostas (`POST /inspections/{id}/answers`) e finaliza a ordem existente (`PATCH /inspections/{id}/complete`).
   - **Se criada avulsa offline:** cria o registro no servidor, envia as respostas e conclui a inspeção.
3. Remove da fila local apenas os itens confirmados pelo servidor e recarrega a lista atualizada (incluindo pareceres de aprovação ou reprovação emitidos pelo supervisor na Web).

---

## 13.6 Recursos Nativos Obrigatórios

### 1. Scanner de QR Code (`expo-camera` / `CameraView`)
- Solicita permissão de câmera ao sistema operacional (`RN-058`).
- Lê o código QR físico do equipamento e compara com o código esperado da inspeção (ex.: `QR-BOMBA-04-ALPHA`, `COMP-001`, `EQ-101`, `RN-064`).
- Exibe selo verde de equipamento validado e libera o checklist.
- Oferece campo de digitação manual do código para contingência ou uso em emuladores sem câmera (`RN-059`).

### 2. Câmera e Galeria de Evidências (`expo-image-picker`)
- Solicita permissão de câmera e mídia.
- Exibe prévia imediata da foto capturada no cartão da pergunta, permitindo substituir ou remover antes da conclusão.

### 3. Monitoramento de Rede (`@react-native-community/netinfo`)
- Detecta transições online/offline em tempo real sem bloquear o preenchimento do checklist.

---

## 13.7 Escopo Validado no MVP (Critérios da Banca)

O aplicativo mobile atende integralmente aos testes oficiais da banca examinadora:
1. **Teste 02 (APK Android instalado):** Build `.apk` autônoma configurada via EAS Build, executando sem Expo Go ou Metro Bundler.
2. **Teste 07 (Recebimento mobile e QR Code):** Sincronização da agenda e leitura/validação do QR Code do equipamento.
3. **Teste 08 (Execução da inspeção):** Resposta de itens, marcação de não conformidade e captura de foto de evidência.
4. **Teste 09 (Offline-first real):** Preenchimento sem Wi-Fi/dados, fechamento completo do app, reabertura offline com rascunho preservado e conclusão sem internet.
5. **Teste 10 (Reconexão e sincronização):** Envio das pendências ao religar a internet sem duplicação de registros em sincronizações subsequentes.
6. **Teste 12 (Atualização no APK):** Exibição do estado atualizado (`APROVADA` / `REPROVADA`) e do motivo registrado pelo supervisor após revisão na Web.
