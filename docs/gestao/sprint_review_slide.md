# ⚡ FieldOps — Sprint Review Executiva

> **Apresentação em Slide Único**  
> **Branch Oficial:** `develop` | **Contexto:** Projeto Integrador SENAI / 4º Semestre  
> **Equipe:** Murilo, Pedro, Julio, Matheus, Juan, Gizela  

---

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  ⚡ FIELDOPS — SPRINT REVIEW: PLATAFORMA INTEGRADA DE INSPEÇÕES (OFFLINE-FIRST)                                 │
│  Meta: 100 Pontos da Banca Evaluadora • Status: 85 pts Validados / 15 pts Deploy AWS                             │
├─────────────────────────────────────┬─────────────────────────────────────┬──────────────────────────────────────┤
│ 📱 MOBILE (Técnico de Campo)        │ 💻 WEB & BACKEND (Supervisor/Gestão)│ ☁️ INFRA, DOCKER & GOVERNANÇA        │
├─────────────────────────────────────┼─────────────────────────────────────┼──────────────────────────────────────┤
│ ✔ Offline-First Real (Teste 09):    │ ✔ Auditoria & Revisão (Teste 11):   │ ✔ Containerização Completa:          │
│   Rascunho persistido localmente;   │   Gaveta no Web com fotos, respostas│   docker-compose.yml pronto com      │
│   sobrevive a fechamento do app sem │   e aprovação/reprovação justificada│   PostgreSQL 16, Spring Boot e Nginx.│
│   conexão com a internet.           │                                     │                                      │
│                                     │ ✔ Regras de Negócio Automáticas:    │ ✔ Governança de Stakeholders:        │
│ ✔ Sincronização Segura (Teste 10):  │   Aprovação define ACTIVE;          │   Matriz de Poder/Interesse conforme │
│   Envio em lotes idempotentes sem   │   reprovação altera para MAINTENANCE│   Fábio Carvalho em docs/gestao/.    │
│   duplicar registros no PostgreSQL. │                                     │                                      │
│                                     │ ✔ RBAC Estrito (Backend Seguro):    │ ⏳ Próximo Passo (Teste 01):         │
│ ✔ QR Code Nativo (Teste 07):        │   TECHNICIAN bloqueado de auditar.  │   Subir na EC2 do AWS Learner Lab via│
│   Validação do equipamento (EQ-101).│                                     │   docker compose up -d.              │
│                                     │ ✔ Zero Dados Mockados:              │                                      │
│ ✔ APK Standalone (Teste 02):        │   100% integrado ao PostgreSQL 16   │ ★ Qualidade e Build:                 │
│   Build gerada com configurador de  │   com seeds de Clientes e Plantas.  │   TypeScript e Maven test-compile    │
│   IP dinâmico da AWS no login.      │                                     │   validados com 0 erros.             │
├─────────────────────────────────────┴─────────────────────────────────────┴──────────────────────────────────────┤
│ 🔗 Artefatos Prontos: APK Android Instalável • Guia da Banca (12 Testes) • Matriz de Stakeholders • Docker Stack │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```
