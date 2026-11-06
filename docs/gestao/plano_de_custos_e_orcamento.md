# 💰 Plano de Gerenciamento de Custos e Orçamento — FieldOps

---

## 📌 1. Identificação e Informações Gerais

| Campo | Detalhamento |
|---|---|
| **Projeto** | FieldOps — Sistema Integrado de Gestão e Execução de Inspeções em Campo |
| **Área do Conhecimento** | Gerenciamento dos Custos do Projeto (PMBOK / SENAI ADS) |
| **Docente Orientador** | Prof. Deivison Takatu |
| **Data de Elaboração** | 21/08/2026 |
| **Data da Revisão** | 06/11/2026 |
| **Versão** | 2.0 (Consolidada para Avaliação 2) |
| **Equipe Responsável** | Pedro (Backend), Murilo (Repo/DevOps), Matheus (Web), Juan (DB), Julio & Gizela (Mobile) |

---

## 🎯 2. Objetivos e Diretrizes Orçamentárias

O objetivo deste plano é estimar, orçar e controlar os recursos financeiros necessários para viabilizar o desenvolvimento, testes, implantação em nuvem e suporte inicial do FieldOps ao longo de 15 semanas (semestre acadêmico/projeto piloto).

### Premissas e Hipóteses Adotadas:
1. **Cálculo de Horas Técnicas:** A equipe é composta por 6 profissionais com dedicação média de 12 horas semanais cada, totalizando 180 horas por integrante ao longo do semestre (1.080 horas totais de projeto).
2. **Valor Hora Médio de Mercado (Base Estágio/Júnior ADS):** Fixado em R$ 35,00/hora para efeitos de precificação e análise de viabilidade econômica de software.
3. **Infraestrutura em Nuvem (AWS):** Dimensionada no nível gratuito (*Free Tier*) complementado com instâncias reservadas básicas (RDS PostgreSQL `db.t3.micro`, EC2 `t3.small` para Spring Boot e bucket S3 para fotos/evidências).
4. **Moeda:** Valores expressos em Reais (BRL - R$). Taxa cambial estimada para serviços faturados em dólar (AWS): US$ 1,00 = R$ 5,60.

---

## 📊 3. Composição Analítica dos Custos

Os custos do projeto foram classificados em:
- **Custos Diretos de Mão de Obra:** Esforço de desenvolvimento, arquitetura, design e testes.
- **Custos de Infraestrutura e Licenças (OPEX):** Hospedagem em nuvem, armazenamento de evidências e domínios.
- **Custos de Hardware e Materiais (CAPEX/Consumíveis):** Aparelhos smartphones de teste em campo, tags de QR Code e conectividade 4G/5G.

### 📋 3.1 Detalhamento de Mão de Obra (Recursos Humanos)

| Função / Frente | Responsável | Carga Horária Total | Custo/Hora | Subtotal (R$) |
|---|---|---:|---:|---:|
| **Engenheiro Backend & API REST** | Pedro | 180 h | R$ 35,00 | R$ 6.300,00 |
| **Especialista em DevOps & Governança** | Murilo | 180 h | R$ 35,00 | R$ 6.300,00 |
| **Engenheiro Frontend Web** | Matheus | 180 h | R$ 35,00 | R$ 6.300,00 |
| **Administrador de Banco de Dados (DBA)** | Juan | 180 h | R$ 35,00 | R$ 6.300,00 |
| **Engenheiro Mobile (React Native / UX)** | Julio | 180 h | R$ 35,00 | R$ 6.300,00 |
| **Engenheira Mobile (Offline / Câmera)** | Gizela | 180 h | R$ 35,00 | R$ 6.300,00 |
| **Subtotal Mão de Obra Direta** | | **1.080 h** | — | **R$ 37.800,00** |

---

### ☁️ 3.2 Infraestrutura Cloud, Ferramentas e Licenças (Período: 4 meses)

| Item de Infraestrutura / Serviço | Finalidade Técnica | Custo Mensal Estimado | Período | Subtotal (R$) |
|---|---|---:|:---:|---:|
| **AWS EC2 (t3.small)** | Execução do Backend Spring Boot | R$ 120,00 | 4 meses | R$ 480,00 |
| **AWS RDS PostgreSQL (db.t3.micro)** | Banco de Dados relacional gerenciado | R$ 140,00 | 4 meses | R$ 560,00 |
| **AWS S3 Standard (Storage + PUT/GET)** | Armazenamento de evidências fotográficas | R$ 40,00 | 4 meses | R$ 160,00 |
| **Vercel / Netlify (Plano Pro)** | Hospedagem da aplicação Web React | R$ 0,00 *(Free Tier)* | 4 meses | R$ 0,00 |
| **GitHub Team & Actions (Build CI/CD)** | Automação de pipelines e repositório | R$ 0,00 *(Student Pack)*| 4 meses | R$ 0,00 |
| **Domínio DNS e Certificado SSL Let's Encrypt**| Registro de domínio e segurança HTTPS | R$ 60,00 (anual) | 1 ano | R$ 60,00 |
| **Subtotal Nuvem e Serviços** | | — | — | **R$ 1.260,00** |

---

### 📱 3.3 Hardware de Teste e Materiais de Apoio

| Recurso Material | Quantidade | Justificativa | Custo Unitário | Subtotal (R$) |
|---|---:|---|---:|---:|
| **Smartphones Android de Teste (Motorola/Samsung)** | 2 un. | Validação de câmera, foco, leitor QR Code e modo offline | R$ 750,00 | R$ 1.500,00 |
| **Chips 4G/5G com Plano de Dados M2M** | 2 un. | Testes de reconexão de rede e sincronização em campo | R$ 50,00/mês | R$ 400,00 |
| **Rolo de Etiquetas Térmicas Sintéticas QR Code** | 1 un. (1.000 un) | Etiquetagem real de equipamentos industriais de bancada | R$ 120,00 | R$ 120,00 |
| **Subtotal Equipamentos e Materiais** | | — | — | **R$ 2.020,00** |

---

## 📈 4. Linha de Base dos Custos (Cost Baseline) e Orçamento Consolidado

A consolidação do orçamento do projeto adota a estrutura formal do PMBOK, prevendo reservas para riscos conhecidos e imprevistos:

```text
Custo das Atividades (Mão de Obra + Cloud + Materiais)
                 ↓
      + Reserva de Contingência (10% - Riscos Mapeados)
                 ↓
     = LINHA DE BASE DE CUSTOS (Cost Baseline)
                 ↓
     + Reserva de Gerenciamento (5% - Imprevistos do Escopo)
                 ↓
       = ORÇAMENTO TOTAL DO PROJETO (BAC)
```

| Componente Orçamentário | Valor (R$) | % do Orçamento Total |
|---|---:|---:|
| **Custos de Mão de Obra (1.080 horas)** | R$ 37.800,00 | 80,07% |
| **Custos de Infraestrutura Cloud e Licenças** | R$ 1.260,00 | 2,67% |
| **Custos de Hardware, Chips e Etiquetas** | R$ 2.020,00 | 4,28% |
| **Subtotal de Custos Diretos** | **R$ 41.080,00** | **87,02%** |
| **Reserva de Contingência (10%)** *(Para oscilações de dólar AWS, falhas de sincronização e retrabalho)* | R$ 4.108,00 | 8,70% |
| **Linha de Base de Custos (Cost Baseline)** | **R$ 45.188,00** | **95,72%** |
| **Reserva de Gerenciamento (5%)** *(Para eventuais mudanças formais de escopo solicitadas pela banca)* | R$ 2.020,00 | 4,28% |
| **ORÇAMENTO TOTAL APROVADO (BAC - Budget at Completion)** | **R$ 47.208,00** | **100,00%** |

---

## 📉 5. Acompanhamento dos Custos: Metodologia de Valor Agregado (EVM)

O controle econômico-financeiro utiliza a técnica de **Análise do Valor Agregado (Earned Value Management - EVM)**, confrontando o trabalho planejado com o trabalho realizado e o custo real incorrido:

### 📐 Principais Fórmulas e Indicadores:
- **Valor Planejado (VP / PV):** Orçamento autorizado previsto para a data corrente.
- **Valor Agregado (VA / EV):** Orçamento correspondente ao trabalho efetivamente concluído.
- **Custo Real (CR / AC):** Custo total incorrido para realizar o trabalho até o momento.
- **Variação de Custo (VC / CV):** \( VC = VA - CR \) *(Se \( VC > 0 \), o projeto está abaixo do orçamento).*
- **Variação de Prazo (VPR / SV):** \( VPR = VA - VP \) *(Se \( VPR > 0 \), o projeto está adiantado).*
- **Índice de Desempenho de Custo (IDC / CPI):** \( IDC = \frac{VA}{CR} \) *(Se \( IDC \ge 1,0 \), alta eficiência financeira).*
- **Índice de Desempenho de Prazo (IDP / SPI):** \( IDP = \frac{VA}{VP} \) *(Se \( IDP \ge 1,0 \), cronograma eficiente).*

### 📊 Simulação de Status EVM na Sprint 5 (Situação Atual):
- **VP:** R$ 38.500,00 (81,5% do escopo total planejado até 06/11)
- **VA:** R$ 38.800,00 (Trabalho entregue com módulos core do Back, Web e Mobile já operantes)
- **CR:** R$ 37.100,00 (Economia obtida pelo aproveitamento otimizado dos créditos gratuitos da nuvem)
- **IDC (CPI):** \(\frac{38.800}{37.100} = \mathbf{1,04}\) *(Projeto saudável, gastando menos do que agregou valor!)*
- **IDP (SPI):** \(\frac{38.800}{38.500} = \mathbf{1,01}\) *(Projeto perfeitamente alinhado ao cronograma físico!)*

---

## ⚠️ 6. Tratamento de Desvios e Limites de Tolerância

Para evitar surpresas orçamentárias, foram instituídos os seguintes limites de alarme:

| Indicador | Faixa Verde (Normal) | Faixa Amarela (Alerta) | Faixa Vermelha (Crítico) | Ação Requerida na Faixa Crítica |
|---|:---:|:---:|:---:|---|
| **IDC (CPI)** | \( \ge 0,95 \) | \( 0,85 \le IDC < 0,95 \) | \( < 0,85 \) | Reunião imediata de emergência; renegociação do escopo de menor prioridade ou absorção via Reserva de Contingência. |
| **IDP (SPI)** | \( \ge 0,95 \) | \( 0,85 \le IDP < 0,95 \) | \( < 0,85 \) | Realocação de membros com folga (ex: pareamento temporário no backend ou mobile). |
| **Custos AWS** | \( \le 100\% \) previsto | \( 101\% - 120\% \) | \( > 120\% \) | Auditoria de queries lentas no RDS e acionamento de políticas de ciclo de vida no S3 para arquivamento. |

---

## ✅ Checklist de Custos e Orçamento (Requisitos da Avaliação 2)

- [x] Principais itens de custo identificados (Pessoal, Nuvem, Materiais, Riscos)
- [x] Estimativas e premissas técnicas explicitadas com fundamentação econômica
- [x] Orçamento consolidado com Linha de Base (Cost Baseline) e BAC definido
- [x] Reservas de contingência (10%) e gerenciamento (5%) calculadas
- [x] Metodologia de acompanhamento por Valor Agregado (EVM: VP, VA, CR, IDC, IDP)
- [x] Matriz de tolerância a desvios e ações corretivas pré-programadas
