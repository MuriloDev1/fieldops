# 5. Perfis de Usuário

## 5.1 Perfis previstos

- **Administrador — `ADMIN`**
- **Supervisor — `SUPERVISOR`**
- **Técnico — `TECHNICIAN`**
- **Cliente somente leitura — `CLIENT_VIEWER`** — futuro ou opcional

---

## 5.2 Matriz de permissões

| Funcionalidade | Administrador | Supervisor | Técnico | Cliente |
| --- | --- | --- | --- | --- |
| Acessar interface administrativa | ✅ | ✅ | Opcional | Futuro |
| Acessar aplicativo de campo | Opcional | Opcional | ✅ | ❌ |
| Gerenciar usuários | ✅ | ❌ | ❌ | ❌ |
| Gerenciar perfis | ✅ | ❌ | ❌ | ❌ |
| Cadastrar clientes | ✅ | ✅ | ❌ | ❌ |
| Cadastrar locais | ✅ | ✅ | ❌ | ❌ |
| Cadastrar equipamentos | ✅ | ✅ | Consulta | Consulta própria |
| Criar modelos de inspeção | ✅ | ✅ | ❌ | ❌ |
| Publicar versão de modelo | ✅ | ✅ | ❌ | ❌ |
| Agendar inspeção | ✅ | ✅ | ❌ | ❌ |
| Atribuir técnico | ✅ | ✅ | ❌ | ❌ |
| Consultar todas as inspeções | ✅ | ✅ | ❌ | ❌ |
| Consultar inspeções atribuídas | ✅ | ✅ | ✅ | ❌ |
| Iniciar inspeção | ❌ | Opcional | ✅ | ❌ |
| Responder checklist | ❌ | Opcional | ✅ | ❌ |
| Registrar evidência | ❌ | Opcional | ✅ | ❌ |
| Registrar não conformidade | ❌ | Opcional | ✅ | ❌ |
| Enviar para revisão | ❌ | Opcional | ✅ | ❌ |
| Revisar inspeção | ❌ | ✅ | ❌ | ❌ |
| Aprovar ou reprovar | ❌ | ✅ | ❌ | ❌ |
| Consultar auditoria | ✅ | ✅ | Próprias ações | ❌ |
| Consultar indicadores | ✅ | ✅ | Próprios | Futuro |
| Consultar resultado do cliente | ✅ | ✅ | Conforme atribuição | Futuro |

---

## 5.3 Princípios de autorização

- O sistema deverá aplicar o princípio do menor privilégio.
- A interface não deverá ser considerada mecanismo suficiente de segurança; as permissões serão validadas pela API.
- O técnico somente poderá alterar inspeções atribuídas a ele e em estado compatível.
- O supervisor poderá revisar as inspeções pertencentes ao seu escopo operacional.
- O administrador gerenciará acesso e cadastros, mas não será automaticamente autorizado a alterar respostas de uma inspeção.
- Registros aprovados deverão ser protegidos contra edição comum.
- Operações não autorizadas deverão retornar erro padronizado e não revelar dados sensíveis.

---

## 5.4 Situação do usuário

Um usuário poderá estar:

- Ativo;
- Inativo;
- Bloqueado temporariamente.

Usuários inativos ou bloqueados não poderão iniciar novas sessões. A inativação não excluirá o histórico relacionado ao usuário.
