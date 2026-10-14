# 18. Definição de Pronto — Definition of Done

## 18.1 DoD de história de usuário

Uma história somente poderá ser marcada como **Concluída** quando:

### Requisitos

- [ ] A história possui critérios de aceitação claros.
- [ ] As regras de negócio relacionadas foram verificadas.
- [ ] Dependências foram resolvidas ou explicitamente aceitas.
- [ ] O comportamento de erro foi definido.

### Código

- [ ] O código está no repositório correto.
- [ ] A implementação foi realizada em branch apropriada.
- [ ] Existe pull request ou processo equivalente de revisão.
- [ ] O código passa no lint.
- [ ] O código passa na verificação de tipos.
- [ ] Não existem segredos ou credenciais no repositório.
- [ ] Não existem logs sensíveis.
- [ ] Não existem erros ou warnings relevantes ignorados sem justificativa.

### Testes

- [ ] Os critérios de aceitação foram testados.
- [ ] Casos principais e ao menos uma exceção relevante foram verificados.
- [ ] Testes automatizados foram adicionados quando a regra for crítica ou repetível.
- [ ] Regressões visíveis foram verificadas.

### Interface

- [ ] Estado de carregamento foi tratado.
- [ ] Estado vazio foi tratado quando aplicável.
- [ ] Estado de erro foi tratado.
- [ ] A ação em processamento evita envio acidental duplicado.
- [ ] Mensagens são compreensíveis.
- [ ] A interface respeita as permissões.
- [ ] Acessibilidade básica foi verificada.

### Integração

- [ ] O contrato da API está implementado ou atualizado.
- [ ] DTOs de entrada e saída estão coerentes.
- [ ] Erros esperados são tratados.
- [ ] A autorização foi validada no backend.
- [ ] A funcionalidade foi testada no ambiente de integração quando aplicável.

### Documentação e evidência

- [ ] README ou documentação relacionada foi atualizada.
- [ ] OpenAPI foi atualizado quando necessário.
- [ ] A história possui evidência de funcionamento.
- [ ] Limitações conhecidas foram registradas.

---

## 18.2 DoD específico do mobile

Além do DoD geral:

- [ ] A funcionalidade foi testada em dispositivo ou emulador Android.
- [ ] O comportamento sem conectividade foi considerado.
- [ ] Alterações locais relevantes persistem após reinicialização.
- [ ] Permissões negadas são tratadas.
- [ ] Dados sensíveis utilizam armazenamento adequado.
- [ ] Rotas protegidas não ficam acessíveis sem sessão.
- [ ] A funcionalidade não provoca perda de operações pendentes.
- [ ] O estado de sincronização é apresentado quando relevante.

---

## 18.3 DoD específico da interface administrativa

Além do DoD geral:

- [ ] A rota possui proteção compatível.
- [ ] A tela usa paginação quando lista dados potencialmente numerosos.
- [ ] Filtros são coerentes com os parâmetros da API.
- [ ] Formulários possuem validação visual e no servidor.
- [ ] A tela não permite ação crítica sem confirmação.
- [ ] Erros `401`, `403`, `404`, `409` e `422` são tratados de forma adequada.
- [ ] A interface foi testada em resolução comum de notebook.

---

## 18.4 DoD específico da API

Além do DoD geral:

- [ ] Endpoint documentado no OpenAPI.
- [ ] DTO separado da entidade de persistência.
- [ ] Validação de entrada implementada.
- [ ] Autorização implementada.
- [ ] Regra de negócio testada.
- [ ] Erro padronizado.
- [ ] Migração de banco incluída quando necessária.
- [ ] Restrições críticas também protegidas no banco quando aplicável.
- [ ] Operação de sincronização testada para repetição quando aplicável.
- [ ] Logs não expõem conteúdo sensível.

---

## 18.5 DoD da sprint

Uma sprint somente será concluída quando:

- [ ] O incremento planejado estiver integrado.
- [ ] Mobile, admin e API utilizarem o mesmo contrato nos itens entregues.
- [ ] A demonstração da sprint puder ser executada com dados de teste.
- [ ] Não houver defeito bloqueador no fluxo principal.
- [ ] Itens não concluídos retornarem ao backlog com novo planejamento.
- [ ] O backlog e o status das histórias estiverem atualizados.
- [ ] Pull requests relevantes estiverem revisados.
- [ ] Riscos e débitos técnicos estiverem registrados.
- [ ] A equipe realizar uma revisão curta do incremento.
- [ ] A equipe registrar ao menos uma ação de melhoria para a próxima sprint.

---

## 18.6 DoD do MVP

O MVP somente será considerado pronto quando:

- [ ] O fluxo ponta a ponta descrito em `AC-RELEASE` funcionar.
- [ ] A build Android puder ser instalada.
- [ ] A interface administrativa possuir build executável ou publicada.
- [ ] A API puder ser executada por instruções documentadas.
- [ ] O banco puder ser criado por migrações.
- [ ] Existirem usuários e dados de demonstração.
- [ ] A autenticação e autorização estiverem funcionais.
- [ ] O checklist dinâmico estiver integrado.
- [ ] Fotografia, QR Code e localização funcionarem.
- [ ] A inspeção puder ser realizada offline após o download.
- [ ] A sincronização não criar duplicidade no cenário testado.
- [ ] O supervisor puder aprovar ou reprovar.
- [ ] A documentação principal estiver atualizada.
- [ ] Não existirem defeitos críticos conhecidos sem plano de contenção.

---

## 18.7 Definição de defeitos por severidade

| Severidade | Definição | Conduta |
| --- | --- | --- |
| **Crítico** | Perda de dados, falha de segurança, impossibilidade de executar o fluxo principal ou duplicidade grave. | Bloqueia a entrega. |
| **Alto** | Funcionalidade P0 indisponível sem alternativa aceitável. | Deve ser corrigido antes da release. |
| **Médio** | Problema com alternativa conhecida, sem perda de dados. | Pode ser aceito com registro e plano. |
| **Baixo** | Problema visual ou melhoria não essencial. | Pode permanecer no backlog. |
