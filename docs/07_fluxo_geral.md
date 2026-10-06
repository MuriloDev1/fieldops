# 7. Fluxo Geral

## 7.1 Fluxo de valor ponta a ponta

```text
ADMINISTRAÇÃO
Cadastrar usuários, clientes, locais e equipamentos
        ↓
CONFIGURAÇÃO
Criar e publicar modelo de inspeção
        ↓
PLANEJAMENTO
Agendar inspeção e atribuir técnico
        ↓
DISTRIBUIÇÃO
Aplicativo baixa a inspeção e o checklist
        ↓
EXECUÇÃO
Técnico inicia, responde, fotografa e registra ocorrências
        ↓
OPERAÇÃO OFFLINE
Dados são preservados em SQLite e na fila local
        ↓
SINCRONIZAÇÃO
Aplicativo envia operações pendentes e baixa atualizações
        ↓
REVISÃO
Supervisor analisa respostas, evidências e não conformidades
        ↓
DECISÃO
Aprovar ou reprovar com solicitação de correção
        ↓
ENCERRAMENTO
Resultado permanece disponível para consulta e auditoria
```

---

## 7.2 Fluxo administrativo

1. O administrador cria ou ativa os usuários.
2. O administrador ou supervisor cadastra cliente, local e equipamento.
3. O supervisor cria um modelo em rascunho.
4. O supervisor organiza o modelo em seções e itens.
5. O supervisor publica uma versão.
6. O supervisor agenda uma inspeção utilizando a versão publicada.
7. O supervisor atribui a inspeção a um técnico.
8. O supervisor acompanha os estados da inspeção.
9. Após o envio, o supervisor abre a revisão.
10. O supervisor aprova ou reprova o resultado.

---

## 7.3 Fluxo do técnico

1. O técnico autentica-se.
2. O aplicativo sincroniza os dados autorizados.
3. O técnico consulta as inspeções atribuídas.
4. Abre os detalhes da inspeção.
5. Confirma o equipamento, opcionalmente por QR Code.
6. Inicia a inspeção.
7. Responde aos itens do checklist.
8. Registra observações, fotografias e não conformidades.
9. O aplicativo salva cada alteração localmente.
10. O técnico verifica o progresso.
11. Conclui a inspeção.
12. O aplicativo envia imediatamente ou mantém o envio pendente.
13. O técnico acompanha o estado da sincronização.
14. Em caso de reprovação, recebe a inspeção para correção.

---

## 7.4 Estados de negócio da inspeção

> O estado de negócio da inspeção não deve ser confundido com o estado de sincronização do dispositivo.

| Estado | Descrição | Quem provoca a entrada |
| --- | --- | --- |
| `RASCUNHO` | Inspeção ainda não disponibilizada ao técnico. | Supervisor |
| `ATRIBUÍDA` | Inspeção vinculada a um técnico e disponível para sincronização. | Supervisor |
| `EM_ANDAMENTO` | Técnico iniciou a execução. | Técnico |
| `ENVIADA` | Resultado recebido pelo servidor e disponível para revisão. | Técnico/API |
| `EM_REVISÃO` | Supervisor iniciou formalmente a análise. | Supervisor |
| `APROVADA` | Resultado aceito e protegido contra edição comum. | Supervisor |
| `REPROVADA` | Resultado devolvido com motivo de correção. | Supervisor |
| `CANCELADA` | Inspeção interrompida administrativamente. | Supervisor/Administrador |

---

## 7.5 Estados locais de sincronização

| Estado local | Significado |
| --- | --- |
| `SINCRONIZADO` | Não existem alterações locais pendentes. |
| `PENDENTE` | Existem operações aguardando envio. |
| `SINCRONIZANDO` | O aplicativo está processando a fila. |
| `ERRO` | Uma ou mais operações falharam. |
| `CONFLITO` | Existe divergência que exige política específica ou intervenção. |

---

## 7.6 Transições permitidas no MVP

| Estado atual | Ação | Próximo estado |
| --- | --- | --- |
| `RASCUNHO` | Atribuir técnico | `ATRIBUÍDA` |
| `ATRIBUÍDA` | Iniciar | `EM_ANDAMENTO` |
| `ATRIBUÍDA` | Cancelar | `CANCELADA` |
| `EM_ANDAMENTO` | Concluir e sincronizar | `ENVIADA` |
| `EM_ANDAMENTO` | Cancelar administrativamente | `CANCELADA` |
| `ENVIADA` | Iniciar revisão | `EM_REVISÃO` |
| `EM_REVISÃO` | Aprovar | `APROVADA` |
| `EM_REVISÃO` | Reprovar | `REPROVADA` |
| `REPROVADA` | Reabrir para correção | `EM_ANDAMENTO` |
| `REPROVADA` | Cancelar | `CANCELADA` |

> Quando a inspeção for concluída sem internet, o estado de negócio local poderá representar a conclusão, mas o servidor continuará com o último estado conhecido. A interface deverá exibir **"Aguardando sincronização"** até a confirmação da API.

---

## 7.7 Fluxo offline

```text
Inspeção é baixada enquanto há conexão
        ↓
Dados são armazenados em SQLite
        ↓
Técnico perde a conexão
        ↓
Respostas e evidências são salvas localmente
        ↓
Cada alteração gera uma operação na outbox
        ↓
Técnico conclui a inspeção
        ↓
Aplicativo marca "Aguardando sincronização"
        ↓
Conexão retorna
        ↓
Outbox é enviada em ordem
        ↓
API confirma ou rejeita cada operação
        ↓
Aplicativo atualiza dados e estado de sincronização
```

---

## 7.8 Fluxo de correção

```text
Supervisor reprova a inspeção
        ↓
Motivo e itens de correção são registrados
        ↓
Técnico sincroniza a atualização
        ↓
Aplicativo apresenta a inspeção como "Requer correção"
        ↓
Técnico altera somente o que está liberado
        ↓
Nova versão das respostas é enviada
        ↓
Supervisor realiza nova revisão
```

---

## 7.9 Tratamento de exceções relevantes

- **Aplicativo fechado durante o preenchimento:** respostas já confirmadas devem permanecer salvas localmente.
- **Falha ao enviar uma foto:** dados textuais não devem ser descartados; a foto permanecerá pendente.
- **Inspeção cancelada enquanto o técnico está offline:** na próxima sincronização, o sistema deverá preservar alterações locais e informar o cancelamento antes de descartar qualquer dado.
- **Sessão expirada:** o aplicativo deverá tentar renovar a sessão; caso não consiga, manter os dados locais e solicitar nova autenticação.
- **Operação reenviada:** a API deverá reconhecer o identificador idempotente e impedir duplicidade.
- **Modelo alterado após o agendamento:** a inspeção continuará utilizando o snapshot da versão selecionada.
