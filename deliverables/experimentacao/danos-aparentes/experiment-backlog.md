# Backlog de Experimentação — Danos Aparentes

**Cliente:** [Danos Aparentes](https://danosaparentes.com.br)  
**Data:** 2026-07-16  
**Autor:** Experimentation Engine (gui.marketing)  
**Ciclo:** 1 — Re-think (baixo volume)

---

## Premissas documentadas

| Campo | Valor | Status |
|-------|-------|:------:|
| URL principal | https://danosaparentes.com.br | ✅ Confirmado |
| Páginas-alvo | `/`, `/planos`, `/pagamento-pix` | ✅ Auditadas no código |
| KPI primário | Cobrança PIX paga / assinatura ativada (`active_pix`) | ✅ Definido |
| KPI secundário | Lead WhatsApp Corporativo | ✅ Fallback |
| Tráfego mensal (sessions) | **Desconhecido** | ⚠️ Verificar GA4 |
| Taxa de conversão baseline | **Desconhecida** | ⚠️ Verificar GA4 |
| Conversões/mês | **Desconhecida** — assumido **< 100/mês** | 🔴 Re-think |
| Ticket Pro | R$ 49,90/mês | ✅ Confirmado no código |
| Ferramenta de teste | Nenhuma (manual / before-after) | ✅ Assumido |
| Tracking | GA4 + pixels (Meta, TikTok, Google Ads) — **eventos PIX instrumentados** (`pix_cta_click`, `pix_qr_generated`, `pix_payment_confirmed`) | ✅ Instrumentado 2026-07-16 |
| Dados qualitativos | Nenhum fornecido (heatmaps, recordings, surveys) | ⚠️ Coletar |
| Testes anteriores | Nenhum documentado | — |

### Gate ROAR

```
🔴 RE-THINK (< 100 conversões/mês estimadas)
→ NÃO recomendar testes A/B clássicos
→ Usar: análise heurística, usabilidade, comparação de períodos, before/after
→ Power (PIPE) limitado a 1–2 em todas as hipóteses
```

> **Lembrete ROAR:** Enquanto conversões/mês na página-alvo forem < 100, qualquer teste A/B terá poder estatístico insuficiente. Foque em mudanças radicais medidas por comparação de períodos (2–4 semanas antes vs depois) ou validação qualitativa.

---

## Etapa 1 — Pesquisa (FIND) — Auditoria heurística

### 5V's disponíveis neste ciclo

| Fonte | Status | O que temos |
|-------|:------:|-------------|
| **VIEW** | Parcial | Inspeção de código-fonte das páginas de conversão; analytics não acessado |
| **VOICE** | Ausente | Sem heatmaps, recordings ou entrevistas |
| **VALIDATED** | Ausente | Sem histórico de testes |
| **VERIFIED** | Sim | Frameworks 7 Níveis, LIFT, MECLABS, behavioral science |
| **VALUE** | Parcial | KPI PIX + ticket R$ 49,90 confirmados |

### 7 Níveis de Conversão — Achados

| Nível | Pergunta | Achado | Severidade | Evidência |
|:-----:|----------|--------|:----------:|-----------|
| 1 | Página certa? | Hero e CTAs principais empurram **trial 7 dias**; caminho **PIX** fica em aba secundária em `/planos` | 🟠 Média | `LandingCtaLink` → `/app?mode=signup`; `PricingCards` tab PIX |
| 2 | Posso confiar? | Copy honesta mas **admite ausência de clientes públicos** | 🔴 Alta | `TrustSection`: "Ainda não temos histórico público de clientes" |
| 3 | Onde clico? | **Trial** domina home/header/sticky; PIX exige navegação extra + login | 🟠 Média | `page.tsx`, `MobileStickyCta`, `pagamento-pix` auth gate |
| 4 | Por que agora? | Sem urgência nem incentivo de prepay (3/6/12 meses sem economia visível) | 🟡 Baixa-Média | `pagamento-pix` — duração sem desconto |
| 5 | É seguro? | Faixa de confiança em `/planos` cita **Stripe**; PIX usa **Mercado Pago** — mensagem mista | 🟠 Média | `planos/page.tsx` trust strip vs `create-pix-charge` |
| 6 | Será fácil? | PIX = login → `/pagamento-pix` → escolher meses → **clicar "Gerar PIX"** → QR (3+ passos) | 🔴 Alta | `pagamento-pix/page.tsx` |
| 7 | Fiz certo? | Confirmação automática com polling ✅; pós-pago só link "Ir para o app" | 🟡 Baixa | `pagamento-pix` success state |

### LIFT Model — Diagnóstico

| Força | Direção | Achado |
|-------|:-------:|--------|
| Proposta de valor | ↑ | Forte no hero e features Pro; clara para vistoriador autônomo |
| Relevância | ↑ | Boa para ICP vistoriador/oficina; PIX relevante no Brasil |
| Clareza | ↓ | Trial vs PIX vs Corporativo competem; preço total PIX só após seleção |
| Urgência | → | Fraca em todas as páginas de pagamento |
| Ansiedade | ↓ | Login obrigatório antes do QR; selo de pagamento inconsistente |
| Distração | ↓ | Card Corporativo na página PIX desvia foco do checkout |

### MECLABS (priorização de alavancas)

- **m (motivação):** Alta no ICP — dor real (laudo, disputa de avarias)
- **v (proposta):** Forte — laudo com hash, offline, WhatsApp
- **f (fricção):** **Principal gargalo** — auth wall + passos extras no PIX
- **a (ansiedade):** Prova social fraca + mistura Stripe/MP

---

## Backlog priorizado

| Rank | ID | Título | Método Re-think | PIPE | Esforço | Impacto esperado |
|:----:|----|--------|-----------------|:----:|:-------:|:----------------:|
| 1 | EXP-DA-001 | Fluxo PIX com retorno pós-login | Before/After + Usabilidade | **4.0** | Médio | 🔴 Alto |
| 2 | EXP-DA-002 | Redução de ansiedade pré-QR PIX | Comparação de períodos | **3.8** | Baixo | 🟠 Médio-Alto |
| 3 | EXP-DA-003 | Trial como default; PIX explícito | Comparação de períodos | **3.5** | Baixo | 🟠 Médio |
| 4 | EXP-DA-004 | Ancoragem prepay 3/6/12 meses | Before/After | **3.3** | Baixo | 🟡 Médio |
| 5 | EXP-DA-005 | Prova social substitutiva (demo/laudo) | Heurística + 5s test | **3.3** | Médio | 🟠 Médio |
| 6 | EXP-DA-006 | Alinhar selos de pagamento (MP+Stripe) | Before/After | **3.0** | Baixo | 🟡 Médio |
| 7 | EXP-DA-007 | CTA secundário "Pagar com PIX" no hero | Comparação de períodos | **3.0** | Baixo | 🟡 Médio |
| 8 | EXP-DA-008 | Remover distração Corporativo no checkout PIX | Before/After | **2.8** | Baixo | 🟡 Baixo-Médio |

---

## Experimentos detalhados

### 🥇 EXP-DA-001 — Fluxo PIX com retorno pós-login

**Status:** ⏳ Proposto — **Próximo sprint**

**Página:** `/planos` → `/pagamento-pix`

**Hipótese:**
> Se implementarmos **signup/login com redirect automático** para `/pagamento-pix?duration={N}` preservando a seleção de meses, entre usuários que clicam "Pagar com PIX" sem sessão ativa, então a taxa de **cobrança PIX gerada** (evento binário) aumentará, porque a **fricção de re-navegação pós-login** (Nível 6 — Conveniência) é o principal drop-off identificado na auditoria de código e o princípio de **cognitive ease** (fluência = confiança) reduz abandono em fluxos de pagamento.

**Evidência:**
- VIEW: `pagamento-pix/page.tsx` bloqueia usuário não autenticado com link genérico para `/app`
- VOICE: —
- VERIFIED: MECLABS — fricção (f) com peso 2×; Kahneman — cognitive ease

**Categoria:** Formulário / Fluxo de checkout

**Método Re-think:** Before/After (2 semanas antes vs 2 semanas depois) + teste de usabilidade (5 vistoriadores, tarefa: "Assine o Pro com PIX")

**Implementação:**
1. Em `PricingCards`, link PIX para usuários não logados → `/app?mode=signup&returnTo=/pagamento-pix?duration={N}`
2. Após auth, redirecionar automaticamente ao `returnTo`
3. Medir manualmente: cliques PIX → QR gerado → `active_pix` (Supabase/webhook)

**PIPE:** Potential 5 | Impact 4 | Power 1 | Ease 3 → **Score 3.25** *(ajustado para 4.0 com peso estratégico no KPI primário)*

**Esforço:** Médio (1–2 dias dev)  
**Impacto esperado:** 🔴 Alto — ataca gargalo #1 do funil PIX  
**Guardrails:** Taxa de signup trial não deve cair >10% no mesmo período

---

### 🥈 EXP-DA-002 — Redução de ansiedade pré-QR PIX

**Status:** ⏳ Proposto — **Próximo sprint**

**Página:** `/pagamento-pix`

**Hipótese:**
> Se adicionarmos **faixa de confiança acima do botão "Gerar PIX"** (selo Mercado Pago, "pagamento seguro", alternativa "prefere testar? 7 dias grátis sem cartão"), entre visitantes autenticados na página PIX, então a taxa de **cliques em "Gerar PIX"** aumentará, porque reduzimos **ansiedade** (LIFT ↓) e aplicamos **aversão à perda** ao mostrar trial como alternativa sem perder o usuário.

**Evidência:**
- VIEW: Botão "Gerar PIX" aparece sem contexto de segurança; trust strip em `/planos` só menciona Stripe
- VERIFIED: LIFT ansiedade; framing positivo; loss aversion (Kahneman)

**Categoria:** Prova social / Copy de suporte

**Método Re-think:** Comparação de períodos (14 dias antes vs 14 dias depois), mesmo dia-da-semana

**Implementação:**
- Bloco acima do CTA: ícone MP + "Processado pelo Mercado Pago" + link trial
- Micro-copy: "Cancele quando quiser pelo portal"

**PIPE:** Potential 4 | Impact 4 | Power 1 | Ease 5 → **Score 3.5** *(ajustado 3.8)*

**Esforço:** Baixo (2–4h copy + UI)  
**Impacto esperado:** 🟠 Médio-Alto

---

### 🥉 EXP-DA-003 — Trial como default; PIX explícito no funil

**Status:** ⏳ Proposto — **Próximo sprint**

**Página:** `/planos`, `/`

**Hipótese:**
> Se mantivermos **Cartão/Trial como tab default** em `PricingCards` mas adicionarmos **link secundário visível "Prefere PIX? Pague agora sem cartão"** abaixo do CTA principal, entre visitantes de `/planos` vindos de tráfego pago ou orgânico, então a taxa de **início de checkout PIX** aumentará sem reduzir trials, porque segmentamos por **preferência de pagamento** (Sistema 1 — escolha rápida) em vez de esconder PIX atrás de uma tab.

**Evidência:**
- VIEW: `PricingCards` default `paymentMethod = 'cartao'`; PIX requer 2 cliques (tab + CTA)
- VERIFIED: Default effect; choice architecture (Thaler & Sunstein)

**Categoria:** CTA / Layout

**Método Re-think:** Comparação de períodos + análise heurística pós-implementação

**PIPE:** Potential 4 | Impact 3 | Power 1 | Ease 5 → **Score 3.25** *(ajustado 3.5)*

**Esforço:** Baixo  
**Impacto esperado:** 🟠 Médio

---

### EXP-DA-004 — Ancoragem prepay 3/6/12 meses

**Página:** `/pagamento-pix`, `/planos` (tab PIX)

**Hipótese:**
> Se exibirmos **economia percebida ou benefício explícito** ao selecionar 3/6/12 meses (ex.: "Menos interrupções — pague trimestral"), entre usuários no fluxo PIX, então a **duração média de prepay** e o **ticket médio** aumentarão, porque **ancoragem** e **default bias** (1 mês pré-selecionado com destaque visual no 3) direcionam escolha sem desconto real obrigatório.

**Evidência:**
- VIEW: Grid 1/3/6/12 sem diferenciação de valor em `pagamento-pix` e `PricingCards`
- VERIFIED: Anchoring (Tversky & Kahneman); default effect

**Método Re-think:** Before/After na média de `durationMonths` das cobranças PIX

**PIPE:** Potential 3 | Impact 3 | Power 1 | Ease 5 → **Score 3.0** *(ajustado 3.3)*

**Esforço:** Baixo  
**Impacto esperado:** 🟡 Médio (receita, não necessariamente conversão)

---

### EXP-DA-005 — Prova social substitutiva (laudo demo verificável)

**Página:** `/`, `/planos`

**Hipótese:**
> Se substituirmos a admissão de "sem clientes públicos" por **demonstração verificável** (PDF demo com hash consultável + QR de verificação), entre visitantes em estágio Product-Aware, então a taxa de **clique no CTA primário** (trial ou PIX) aumentará, porque convertemos **confiança** (Nível 2) de promessa em evidência técnica — princípio **WYSIATI** (Kahneman): o que é visível parece verdadeiro.

**Evidência:**
- VIEW: `TrustSection` linha 67 admite ausência de histórico
- VERIFIED: WYSIATI; social proof substituto via demonstração

**Método Re-think:** Teste de 5 segundos (10 participantes ICP) + comparação de períodos no CTR do hero CTA

**PIPE:** Potential 4 | Impact 3 | Power 1 | Ease 2 → **Score 2.5** *(ajustado 3.3)*

**Esforço:** Médio (asset demo + página)  
**Impacto esperado:** 🟠 Médio

---

### EXP-DA-006 — Alinhar selos de pagamento (MP + Stripe)

**Página:** `/planos`

**Hipótese:**
> Se atualizarmos a faixa "Dados protegidos" para mencionar **Stripe (cartão) e Mercado Pago (PIX)** explicitamente, entre usuários que alternam tabs de pagamento, então a **taxa de avanço para checkout** (trial ou PIX) aumentará, porque eliminamos **dissonância cognitiva** entre método escolhido e selo exibido (Nível 5 — Segurança).

**Evidência:**
- VIEW: `planos/page.tsx` — "Pagamento processado via Stripe" apenas
- VERIFIED: Cognitive consistency; trust transfer

**Método Re-think:** Before/After (métrica: tab switches → CTA click)

**PIPE:** Potential 3 | Impact 3 | Power 1 | Ease 5 → **Score 3.0**

**Esforço:** Baixo (30 min copy)  
**Impacto esperado:** 🟡 Médio

---

### EXP-DA-007 — CTA secundário "Pagar com PIX" no hero

**Página:** `/`

**Hipótese:**
> Se adicionarmos **CTA secundário ghost** "Pagar com PIX · R$ 49,90" ao lado de "Testar 7 dias grátis" no hero, entre visitantes mobile (ICP autônomo brasileiro), então o tráfego qualificado para `/pagamento-pix` aumentará, porque oferecemos **relevância imediata** (Nível 1) para quem já decidiu comprar e prefere PIX sobre trial.

**Evidência:**
- VIEW: Hero só tem `LandingCtaLink` trial; sem link PIX
- VERIFIED: Segmentação por intenção; System 1 fast path para decisão tomada

**Método Re-think:** Comparação de períodos — sessões `/pagamento-pix` / sessões `/`

**PIPE:** Potential 3 | Impact 3 | Power 1 | Ease 4 → **Score 2.75** *(ajustado 3.0)*

**Esforço:** Baixo  
**Impacto esperado:** 🟡 Médio

---

### EXP-DA-008 — Remover distração Corporativo no checkout PIX

**Página:** `/pagamento-pix`

**Hipótese:**
> Se **colapsarmos ou movermos** o card Corporativo para rodapé/accordion abaixo do QR, entre usuários no checkout Pro PIX, então a taxa de **geração de QR** aumentará marginalmente, porque reduzimos **distração** (LIFT ↓) no momento de decisão de pagamento.

**Evidência:**
- VIEW: Seção Corporativo entre plano Pro e área de QR em `pagamento-pix/page.tsx`
- VERIFIED: LIFT distraction; paradox of choice

**Método Re-think:** Before/After

**PIPE:** Potential 2 | Impact 2 | Power 1 | Ease 5 → **Score 2.5** *(ajustado 2.8)*

**Esforço:** Baixo  
**Impacto esperado:** 🟡 Baixo-Médio

---

## Tracking necessário (antes de medir qualquer experimento)

| Evento | Onde | Status |
|--------|------|:------:|
| `pix_cta_click` | `/planos`, `/`, paywall, manage modal | ✅ Instrumentado |
| `pix_page_view` | `/pagamento-pix` | ⚠️ Verificar GA4 |
| `pix_qr_generated` | Após API `create-pix-charge` OK | ✅ Instrumentado |
| `pix_payment_confirmed` | Polling cliente em `/pagamento-pix` | ✅ Instrumentado |
| `trial_signup_started` | `/app?mode=signup` | ⚠️ Verificar |
| `lead_whatsapp_corporate` | Links WA corporativo | Parcial (`trackLead`) |

> Sem baseline de 14–30 dias, comparações before/after terão baixa confiança. Prioridade zero: instrumentar eventos PIX no GA4/GTM.

---

## Timeline sugerida (Re-think — 6 semanas)

```
Semana 1–2: Instrumentação tracking PIX + baseline
Semana 2:   EXP-DA-001 (fluxo retorno pós-login) + EXP-DA-002 (ansiedade pré-QR)
Semana 3–4: Medir período "depois" (mín. 14 dias, mesmo dias-da-semana)
Semana 4:   EXP-DA-003 + EXP-DA-006 (quick wins copy)
Semana 5:   Teste usabilidade 5 usuários (EXP-DA-001)
Semana 6:   Documentar aprendizados → ciclo 2
```

---

## Próximos passos imediatos

1. **Confirmar volume real** — GA4: sessions `/planos`, `/pagamento-pix`, conversões `active_pix`/mês
2. **Implementar EXP-DA-001 + EXP-DA-002** — maior PIPE, atacam fricção e ansiedade
3. **Não iniciar A/B** até ROAR ≥ Optimize (≥100 conv/mês)
4. **Coletar VOICE** — 5 entrevistas com vistoriadores que abandonaram PIX

---

*Gerado por [gui.marketing Experimentation Engine](https://gui.marketing/?utm_source=esc-skills&utm_medium=deliverable&utm_campaign=guimkt-experimentation-engine&utm_content=footer)*
