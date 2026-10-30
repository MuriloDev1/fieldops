# 📊 FieldOps — Sprint Review com Foco em Gestão de Projetos

> **Governança, Escopo, Riscos e Partes Interessadas**  
> **Fundamentação:** CARVALHO, Fábio Câmara Araújo de. *Gestão de Projetos*. / Guia PMBOK®  
> **Contexto:** Projeto Integrador — 4º Semestre ADS (SENAI)  
> **Equipe:** Murilo, Pedro, Julio, Matheus, Juan, Gizela  

---

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  📊 FIELDOPS — SPRINT REVIEW: GOVERNANÇA, GESTÃO ÁGIL & CONTROLE DE PROJETO (METODOLOGIA FÁBIO CARVALHO)        │
│  Metodologia: Scrum + PMBOK® • Aderência ao Escopo: 100% MoSCoW • Avaliação da Banca: 85 pts OK / 15 pts AWS    │
├───────────────────────────────────┬───────────────────────────────────┬──────────────────────────────────────────┤
│ 🎯 GESTÃO DE ESCOPO (MoSCoW)      │ 👥 MATRIZ RACI DA EQUIPE          │ 📈 GESTÃO DE STAKEHOLDERS (F. CARVALHO)  │
├───────────────────────────────────┼───────────────────────────────────┼──────────────────────────────────────────┤
│ • Must-Have (100% Entregue):      │ • Murilo & Matheus:               │ • Gerenciar com Atenção (Alto/Alto):     │
│   - Offline-first com persistência;  API REST, PostgreSQL 16 e JWT    │   Banca Avaliadora, Supervisor (Marina)  │
│   - Leitor nativo de QR Code;        [Accountable / Responsible]       │   e Time de Desenvolvimento.             │
│   - CRUD e versionamento de modelos;                                  │                                          │
│   - Revisão e auditoria Web.      │ • Pedro:                          │ • Manter Satisfeito (Alto/Baixo):        │
│                                   │   Frontend Web, Dashboard de KPIs   Admin de TI (Ana), Gestores Clientes     │
│ • Should-Have (Concluído):        │   e Painel de Revisão [A/R]         (Roberto) e Infraestrutura AWS.          │
│   - Docker Compose em produção;   │                                   │                                          │
│   - Build APK nativo compilado.   │ • Gizela & Julio:                 │ • Manter Informado (Baixo/Alto):         │
│                                   │   Mobile Expo, QR Code, Câmera e    Técnicos de Campo (Carlos) e             │
│ • Won't-Have (Controlado):        │   Sincronização Offline-first [A/R] Equipe de Suporte Operacional.           │
│   - Telemetria GPS em tempo real; │                                   │                                          │
│   - Integração legada SAP/ERP.    │ • Juan:                           │ • Monitorar (Baixo/Baixo):               │
│                                   │   QA, Validação e Gestão [R/C]      Auditores Técnicos e Usuários Visitantes │
├───────────────────────────────────┴───────────────────────────────────┴──────────────────────────────────────────┤
│ 🛡️ GESTÃO DE RISCOS & CONTINGÊNCIAS                                                                             │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ • Risco 1 (Queda de Rede na Apresentação): Mitigado com Offline-first Real (Rascunho salvo no SQLite/AsyncStorage) │
│ • Risco 2 (Troca de IP no AWS Learner Lab): Mitigado com Configurador Dinâmico de Servidor no login do APK     │
│ • Risco 3 (Erros de Payload em Fotos/Assinaturas): Mitigado com Jackson ObjectMapper na coluna JSONB (Postgres)  │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```
