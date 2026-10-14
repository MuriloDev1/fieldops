# 12. API REST

## 12.1 Convenções gerais

- Prefixo: `/api/v1`.
- Formato principal: JSON.
- Upload: `multipart/form-data` ou fluxo documentado equivalente.
- Identificadores: UUID.
- Datas e horas: formato ISO 8601 com fuso ou UTC conforme contrato.
- Autenticação: token Bearer.
- Paginação: parâmetros `page`, `size`, `sort` ou padrão equivalente documentado.
- Filtros: parâmetros de consulta explícitos.
- Erros: objeto padronizado.
- Documentação: OpenAPI e interface Swagger.

---

## 12.2 Estrutura de erro sugerida

```json
{
  "timestamp": "2026-08-01T14:30:00Z",
  "status": 422,
  "code": "INSPECTION_REQUIRED_ITEMS_MISSING",
  "message": "A inspeção possui itens obrigatórios sem resposta.",
  "path": "/api/v1/inspections/00000000-0000-0000-0000-000000000000/submit",
  "requestId": "req-123",
  "fieldErrors": [
    {
      "field": "responses",
      "message": "Existem 2 itens obrigatórios pendentes."
    }
  ]
}
```

---

## 12.3 Códigos HTTP esperados

| Código | Uso |
| --- | --- |
| `200` | Consulta ou alteração concluída. |
| `201` | Recurso criado. |
| `204` | Operação concluída sem corpo. |
| `400` | Requisição malformada. |
| `401` | Sessão ausente ou inválida. |
| `403` | Usuário autenticado sem permissão. |
| `404` | Recurso não encontrado ou não visível ao usuário. |
| `409` | Conflito de estado, versão ou unicidade. |
| `413` | Arquivo acima do limite. |
| `415` | Formato de arquivo não suportado. |
| `422` | Regra de negócio ou validação semântica não atendida. |
| `500` | Falha interna não prevista, sem exposição de detalhes sensíveis. |

---

## 12.4 Autenticação

```http
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
GET  /api/v1/auth/me
```

### Exemplo de login

```json
{
  "email": "tecnico@fieldops.local",
  "password": "senha-informada-pelo-usuario"
}
```

### Exemplo de resposta

```json
{
  "accessToken": "token",
  "refreshToken": "token-de-renovacao",
  "expiresIn": 900,
  "user": {
    "id": "8a50e30d-2a58-4a24-944e-10a9948abf01",
    "name": "Carlos Técnico",
    "email": "tecnico@fieldops.local",
    "role": "TECHNICIAN"
  }
}
```

---

## 12.5 Usuários

```http
GET    /api/v1/users
GET    /api/v1/users/{id}
POST   /api/v1/users
PUT    /api/v1/users/{id}
PATCH  /api/v1/users/{id}/status
POST   /api/v1/users/{id}/reset-password
```

Filtros sugeridos:

- `name`;
- `email`;
- `role`;
- `status`.

---

## 12.6 Clientes

```http
GET    /api/v1/clients
GET    /api/v1/clients/{id}
POST   /api/v1/clients
PUT    /api/v1/clients/{id}
PATCH  /api/v1/clients/{id}/status
```

---

## 12.7 Locais

```http
GET    /api/v1/sites
GET    /api/v1/sites/{id}
GET    /api/v1/clients/{clientId}/sites
POST   /api/v1/sites
PUT    /api/v1/sites/{id}
PATCH  /api/v1/sites/{id}/status
```

---

## 12.8 Equipamentos

```http
GET    /api/v1/equipment
GET    /api/v1/equipment/{id}
GET    /api/v1/equipment/by-qr/{qrCode}
GET    /api/v1/sites/{siteId}/equipment
POST   /api/v1/equipment
PUT    /api/v1/equipment/{id}
PATCH  /api/v1/equipment/{id}/status
```

---

## 12.9 Modelos de inspeção

```http
GET    /api/v1/inspection-templates
GET    /api/v1/inspection-templates/{id}
POST   /api/v1/inspection-templates
PUT    /api/v1/inspection-templates/{id}
POST   /api/v1/inspection-templates/{id}/sections
PUT    /api/v1/inspection-templates/{id}/sections/{sectionId}
POST   /api/v1/inspection-templates/{id}/sections/{sectionId}/items
PUT    /api/v1/inspection-templates/{id}/items/{itemId}
POST   /api/v1/inspection-templates/{id}/publish
GET    /api/v1/inspection-templates/{id}/versions
GET    /api/v1/inspection-template-versions/{versionId}
```

### Exemplo resumido de item

```json
{
  "title": "A proteção do equipamento está íntegra?",
  "description": "Verifique trincas, ausência de parafusos e partes soltas.",
  "responseType": "CONFORMITY",
  "required": true,
  "observationRequiredOnFailure": true,
  "evidenceRequiredOnFailure": true,
  "displayOrder": 3
}
```

---

## 12.10 Inspeções

```http
GET    /api/v1/inspections
GET    /api/v1/inspections/{id}
POST   /api/v1/inspections
PUT    /api/v1/inspections/{id}
POST   /api/v1/inspections/{id}/assign
POST   /api/v1/inspections/{id}/cancel
POST   /api/v1/inspections/{id}/start
POST   /api/v1/inspections/{id}/submit
POST   /api/v1/inspections/{id}/begin-review
POST   /api/v1/inspections/{id}/approve
POST   /api/v1/inspections/{id}/reject
GET    /api/v1/inspections/{id}/history
```

Filtros administrativos:

- Estado;
- Técnico;
- Supervisor;
- Cliente;
- Local;
- Equipamento;
- Prioridade;
- Período previsto;
- Atraso.

### Endpoints direcionados ao técnico

```http
GET /api/v1/mobile/inspections
GET /api/v1/mobile/inspections/{id}
```

A API deverá filtrar os dados pelo usuário autenticado, sem depender apenas de `technicianId` informado pelo cliente.

---

## 12.11 Respostas

```http
GET  /api/v1/inspections/{inspectionId}/responses
PUT  /api/v1/inspections/{inspectionId}/responses/{responseId}
POST /api/v1/inspections/{inspectionId}/responses:batch
```

### Exemplo de resposta do checklist

```json
{
  "id": "62327a9a-ec19-46a2-89ae-b49086b657f9",
  "inspectionItemId": "ab18a638-1c45-4a15-a444-b4235506e912",
  "valueBoolean": false,
  "conformity": "NON_CONFORMING",
  "observation": "Proteção lateral apresenta trinca.",
  "answeredAtDevice": "2026-08-01T10:12:30-03:00",
  "baseVersion": 0
}
```

---

## 12.12 Evidências

```http
POST   /api/v1/inspections/{inspectionId}/evidence
GET    /api/v1/inspections/{inspectionId}/evidence
GET    /api/v1/evidence/{id}
DELETE /api/v1/evidence/{id}
```

Metadados mínimos do upload:

- Identificador idempotente;
- Inspeção;
- Resposta ou não conformidade relacionada;
- Tipo;
- Data de captura;
- Descrição opcional.

---

## 12.13 Não conformidades

```http
GET    /api/v1/non-conformities
GET    /api/v1/non-conformities/{id}
POST   /api/v1/inspections/{inspectionId}/non-conformities
PUT    /api/v1/non-conformities/{id}
PATCH  /api/v1/non-conformities/{id}/status
```

---

## 12.14 Revisões

```http
GET  /api/v1/inspections/{inspectionId}/reviews
POST /api/v1/inspections/{inspectionId}/begin-review
POST /api/v1/inspections/{inspectionId}/approve
POST /api/v1/inspections/{inspectionId}/reject
```

### Exemplo de reprovação

```json
{
  "reason": "A fotografia do item 4 não permite identificar o número de série.",
  "itemsToCorrect": [
    "ab18a638-1c45-4a15-a444-b4235506e912"
  ]
}
```

---

## 12.15 Sincronização

```http
POST /api/v1/mobile/sync/push
GET  /api/v1/mobile/sync/pull?cursor={cursor}
POST /api/v1/mobile/sync
```

O projeto poderá utilizar um endpoint combinado ou endpoints separados. O contrato escolhido deverá ser único e documentado.

### Exemplo resumido de lote

```json
{
  "deviceId": "b38f54fd-6d7c-4249-b80f-5d0362103f82",
  "lastPullCursor": "cursor-anterior",
  "operations": [
    {
      "operationId": "5f30d6de-a4e0-4da8-b1c1-2acbd6f2850e",
      "entityType": "INSPECTION_RESPONSE",
      "entityId": "62327a9a-ec19-46a2-89ae-b49086b657f9",
      "operationType": "UPSERT",
      "baseVersion": 0,
      "payload": {
        "inspectionItemId": "ab18a638-1c45-4a15-a444-b4235506e912",
        "conformity": "NON_CONFORMING",
        "observation": "Proteção lateral apresenta trinca."
      }
    }
  ]
}
```

### Exemplo resumido de resultado

```json
{
  "results": [
    {
      "operationId": "5f30d6de-a4e0-4da8-b1c1-2acbd6f2850e",
      "status": "APPLIED",
      "entityVersion": 1
    }
  ],
  "changes": [],
  "nextCursor": "novo-cursor",
  "serverTime": "2026-08-01T14:15:00Z"
}
```

### Estados por operação

- `APPLIED`;
- `ALREADY_APPLIED`;
- `REJECTED`;
- `CONFLICT`;
- `DEPENDENCY_FAILED`.

---

## 12.16 Indicadores

```http
GET /api/v1/dashboard/summary
GET /api/v1/dashboard/inspections-by-status
GET /api/v1/dashboard/non-conformities-by-severity
```

Indicadores são P1, mas um resumo básico poderá entrar no MVP administrativo.

---

## 12.17 Contrato entre disciplinas

Antes de uma funcionalidade ser integrada, deverão estar definidos:

- Endpoint;
- Método HTTP;
- Autorização;
- Corpo de entrada;
- Corpo de saída;
- Validações;
- Erros esperados;
- Exemplo no OpenAPI;
- Versão do contrato;
- Responsável pela implementação.

Quando o backend ainda não estiver pronto, mobile e web poderão utilizar mocks baseados no mesmo contrato. A substituição do mock não deverá exigir alteração completa da interface.

---

## 12.18 Compatibilidade e evolução

- Mudanças incompatíveis deverão gerar nova versão ou planejamento explícito de migração.
- Campos novos opcionais não deverão quebrar clientes existentes.
- Valores de enum deverão ser tratados de forma controlada.
- O mobile deverá informar sua versão quando necessário para diagnóstico.
- A API poderá recusar versões incompatíveis com mensagem clara.
