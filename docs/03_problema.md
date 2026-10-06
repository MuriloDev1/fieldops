# 3. Problema
## 3.1 Contexto

Inspeções de equipamentos, instalações e ambientes costumam ocorrer fora do escritório, em locais com conectividade irregular e sob condições que exigem rapidez, clareza e rastreabilidade.

Em muitos cenários, o processo ainda depende de formulários impressos, arquivos de texto, planilhas, fotografias sem identificação e mensagens enviadas por diferentes canais. O resultado é uma cadeia fragmentada entre o planejamento da atividade, sua execução e a análise do resultado.

---

## 3.2 Processo atual representativo

```text
Supervisor prepara formulário ou planilha
        ↓
Técnico recebe informações por mensagem ou arquivo
        ↓
Técnico realiza a inspeção e registra anotações
        ↓
Fotos ficam separadas do formulário
        ↓
Dados são redigitados ou reorganizados
        ↓
Supervisor identifica informações ausentes
        ↓
Correções são solicitadas por mensagens
        ↓
Relatório é consolidado manualmente
```

---

## 3.3 Principais dores

### Para o técnico

- Dificuldade para localizar a versão correta do checklist;
- Excesso de digitação em campo;
- Necessidade de alternar entre vários aplicativos;
- Perda de respostas quando não há internet;
- Falta de clareza sobre itens obrigatórios;
- Dificuldade para relacionar fotografias ao item inspecionado;
- Retrabalho quando o supervisor solicita complementações.

### Para o supervisor

- Falta de visibilidade sobre o andamento;
- Respostas entregues em formatos diferentes;
- Dificuldade para verificar quem executou cada ação;
- Demora para receber as evidências;
- Dificuldade para comparar inspeções;
- Ausência de um fluxo claro de aprovação;
- Controle manual de inspeções atrasadas.

### Para o administrador

- Cadastros espalhados em planilhas;
- Dificuldade para controlar usuários e permissões;
- Duplicidade de clientes, locais e equipamentos;
- Falta de histórico de alterações;
- Dependência de profissionais técnicos para realizar operações simples.

### Para o cliente

- Demora para receber resultados;
- Baixa rastreabilidade;
- Dificuldade para acompanhar não conformidades;
- Evidências incompletas ou sem contexto;
- Ausência de padronização entre inspeções.

---

## 3.4 Causas principais

- Inexistência de uma fonte única de dados;
- Ausência de integração entre planejamento e execução;
- Uso de ferramentas genéricas;
- Falta de modelos de inspeção versionados;
- Dependência de conectividade constante;
- Ausência de validação automática;
- Falta de vínculo estruturado entre respostas e evidências;
- Inexistência de um fluxo formal de revisão.

---

## 3.5 Consequências

- Retrabalho;
- Aumento do tempo de processamento;
- Decisões baseadas em dados incompletos;
- Perda de confiança no resultado;
- Dificuldade de auditoria;
- Aumento do risco operacional;
- Menor produtividade das equipes;
- Dificuldade de expansão da operação.

---

## 3.6 Oportunidade

Uma plataforma integrada pode transformar a inspeção em um fluxo rastreável desde a configuração até a aprovação. A combinação entre aplicativo mobile offline, interface administrativa e API central permite separar adequadamente as responsabilidades, melhorar a experiência de cada perfil e preservar a consistência dos dados.

---

## 3.7 Hipóteses do produto

- Técnicos preencherão checklists com maior qualidade quando os itens obrigatórios forem claramente indicados.
- A associação direta entre foto e item reduzirá dúvidas durante a revisão.
- A operação offline reduzirá perdas e interrupções em campo.
- A visualização do estado de sincronização aumentará a confiança do usuário.
- Modelos versionados permitirão comparar inspeções realizadas em momentos diferentes.
- Um painel administrativo reduzirá a dependência de acesso técnico ao banco e ao Swagger.
- Um fluxo de aprovação explícito aumentará a rastreabilidade.
