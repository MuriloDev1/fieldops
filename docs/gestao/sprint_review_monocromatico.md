# [FIELDOPS // SPRINT_REVIEW]

> **SISTEMA INTEGRADO DE INSPEÇÕES EM CAMPO (OFFLINE-FIRST)**  
> **Metodologia de Gestão:** Fábio Câmara Araújo de Carvalho & PMBOK®  
> **Status:** 85/100 pontos validados (+15 pts deploy AWS) | Aderência MoSCoW: 100%  
> **Branch:** `develop`  

---

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  [FIELDOPS // SPRINT_REVIEW] — GESTÃO DO PROJETO, ESCOPO, RISCOS E ARTEFATOS                                     │
│  Metodologia: Fábio Carvalho & PMBOK • Aderência ao Escopo: 100% MoSCoW • Avaliação da Banca: 85 pts / 100 pts    │
├───────────────────────────────────┬───────────────────────────────────┬──────────────────────────────────────────┤
│ 01 // GOVERNANÇA & STAKEHOLDERS   │ 02 // ESCOPO & CICLO OPERACIONAL  │ 03 // RISCOS, QA & 12 TESTES DA BANCA    │
├───────────────────────────────────┼───────────────────────────────────┼──────────────────────────────────────────┤
│ ■ Matriz Poder / Interesse:       │ ■ Ciclo Completo da Inspeção:     │ ■ Matriz de Riscos & Mitigações:         │
│   - Gerenciar c/ Atenção (A/A):   │   [Configuração] → [Agendamento]  │   - Risco 1: Queda de rede na banca.     │
│     Banca Avaliadora e Supervisor.│   → [Leitura QR] → [Exec. Offline]│     Mitigação: Rascunho persistido local │
│     Foco na demonstração do fluxo │   → [Sync No-Dup] → [Revisão Web] │     e conclusão offline (15 pts).        │
│     e métricas em tempo real.     │                                   │   - Risco 2: Troca de IP na AWS EC2.     │
│                                   │ ■ Gestão de Escopo (MoSCoW):      │     Mitigação: Modal de IP dinâmico no   │
│   - Manter Satisfeito (A/B):      │   - Must-Have (100% Concluído):   │     login do APK em 5 segundos.          │
│     Admin de TI e Contratantes.   │     Checklists c/ snapshots,      │                                          │
│     Foco em segurança JWT e RBAC. │     leitor de QR Code, rascunhos  │ ■ Checklist dos 12 Testes da Banca:      │
│                                   │     persistentes e gaveta Web.    │   [X] T02 APK Nativo  [X] T03 Login JWT  │
│   - Manter Informado (B/A):       │                                   │   [X] T04 Cadastros   [X] T05 Checklist  │
│     Técnico em Campo e Suporte.   │   - Should-Have (Entregue):       │   [X] T06 Atribuição  [X] T07 QR Code    │
│     Foco em UX simplificada e     │     Docker Compose em produção    │   [X] T08 Fotos/NC    [X] T09 Offline    │
│     feedback visual de sync.      │     e APK standalone compilado.   │   [X] T10 Sync No-Dup [X] T11 Revisão    │
│                                   │                                   │   [X] T12 Parecer App [ ] T01 Deploy AWS │
│ ■ Estrutura Analítica (EAP):      │   - Won't-Have (Controlado):      │                                          │
│   4 macro-pacotes integrados:     │     Telemetria GPS contínua em    │ ■ Qualidade de Software:                 │
│   Gestão/Docs, API & Postgres 16, │     tempo real e integração com   │   TypeScript strict sem erros (0 lints), │
│   Interface Web e App Mobile.     │     ERP corporativo (fora escopo).│   Maven build success e 0 bugs abertos.  │
├───────────────────────────────────┴───────────────────────────────────┴──────────────────────────────────────────┤
│ > PRÓXIMO_MARCO: docker compose up -d (Execução da stack na EC2 no AWS Learner Lab para fechar 100/100 pontos)   │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```
