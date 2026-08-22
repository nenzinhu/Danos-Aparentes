# Wireframe Landing Page — Danos Aparentes

> Gerado em 2026-07-25 | Skill: `guimkt-wireframe-landing-page` v1.1.0  
> Fontes: `docs/message-mining-danos-aparentes.md` + `docs/offer-diagnosis-danos-aparentes.md` + `docs/icp-danos-aparentes.md`  
> **Wedge:** locadoras / disputa “já estava assim” / prova no ato  
> **Prova social:** 0 cases — prova honesta apenas (demo QR, citação jurídica com fonte, trial). Sem depoimentos inventados.  
> Copy marcada **[H]** = hipótese (não VoC de comprador B2B). Copy **[E]** = evidência de produto/problema público.

**HTML companheiros:**
- Fase 1 (tabela): `docs/wireframe-tabela-danos-aparentes.html`
- Fase 2 (sketch): `docs/wireframe-sketch-danos-aparentes.html`

---

## Intake compilado (Etapa 0)

```yaml
briefing:
  empresa: Danos Aparentes
  produto_servico: SaaS vistoria veicular digital — diagrama, foto+GPS, assinaturas, PDF hash SHA-256 + QR, offline, white-label
  publico: Locadoras SME (dono/ops/pátio) — ICP Real wedge; Problem→Solution Aware
  dor: Disputa "já estava assim" na devolução; cobrança sem prova comparável entrega×devolução
  diferencial: Laudo que se verifica (hash+QR) + prova no ato (GPS+assinatura dual) vs. papel/WhatsApp/PDF editável
  prova_social: 0 cases públicos; PDF demo + QR; ConJur/TJDFT (prova do PROBLEMA, não do cliente); trial 7 dias sem cartão
  tom_de_voz: direto, operacional, balcão; nuance jurídica no FAQ
  objetivo: SQL / trial SME (Starter R$29,90 / Pro R$49,90); Corp WhatsApp só inbound
  canal: Google Ads Search (40%) + Meta (25%) deep-link LP focada; não home multi-ICP
  site_url: https://danosaparentes.com.br
```

**3 dores (ICP):** (1) “já estava assim” na devolução **[E]**; (2) vistoriadores inconsistentes / foto WhatsApp **[E-produto]**; (3) cobrança sem vistoria prévia cai na Justiça **[E-jurídico]**.  
**Critérios de decisão:** prova comparável; mecanismo verificável em 2 min (QR); risco baixo (trial); white-label **[H]**; filtro negativo “sem cases” **[H-H9]**.  
**Consciência:** Problem-Aware → Solution-Aware.  
**Objeções:** validade jurídica; WhatsApp basta?; sem cases; offline; treinamento; preço/Corp.

---

## Etapa 1.0 — Espectro da Proposta de Valor

| Nível | Resposta | Status |
|-------|----------|--------|
| **1. Empresa** | Por que Danos Aparentes e não “qualquer app de vistoria”? Hoje a resposta honesta é o **mecanismo demonstrável** (hash SHA-256 + QR público + GPS + assinatura dual), não reputação de marca. **Gap:** 0 cases — nível Empresa ainda fraco; LP deve admitir e substituir prova social falsa por prova de produto. | ⚠️ Fraco (sinalizado) |
| **2. Persona** | Por que o **dono/ops de locadora**? Porque absorve avaria que não consegue provar na devolução; precisa do **par entrega×devolução** no mesmo padrão — não dashboard genérico. | ✅ Médio–forte (problema de mercado) |
| **3. Produto** | Por que **este** produto vs. papel/WhatsApp/planilha? Porque foto solta discute; laudo com GPS+assinatura+hash **compara** — e o QR prova se o PDF foi adulterado. | ✅ Forte |
| **4. Aquisição** | Por que **este anúncio/LP**? Message match no gancho “já estava assim” + CTA trial 7 dias sem cartão + prova jurídica citada (fonte) + QR demo — não home multi-segmento. | ✅ Médio (trial cobre “por que agora” no SME) |

> Sem nível 1 resolvido por cases: **não inventar depoimentos**. Usar bloco honesto + demo.

---

## Etapa 1.1 — Framework escolhido: P.A.S.T.O.R.

| Critério | Decisão |
|----------|---------|
| **Escolhido** | **P.A.S.T.O.R.** (Problem → Amplify → Story/Solution → Transformation/Testimony* → Offer → Response) |
| **Por quê** | Venda B2B com educação de mecanismo; ICP Problem-Aware precisa amplificar custo da disputa e **entender a cadeia causal** antes da oferta; formulário no fim com lead scoring. |
| **Alinhamento consciência** | Problem→Solution Aware: P+A validam a dor; S educa o “como”; T* = prova honesta (não fake testimonials); O+R convertem SME. |
| **Funil** | Ad “já estava” → Hero (P) → dor+jurídico (A) → mecanismo (S) → demo/QR+honestidade (T*) → preço/trial (O) → form trial (R). |

\*Testimony adaptado: **prova de mecanismo + prova de problema**, zero depoimento fictício.

### Frameworks descartados

| Framework | Motivo |
|-----------|--------|
| **AIDA** | Jornada simples demais; não educa mecanismo hash/QR nem trata ansiedade “sem cases”. |
| **PAS** | Bom para dor, curto demais para B2B consultivo + FAQ jurídico + pricing. |
| **BAB** | Sem métrica de “depois” de clientes reais — transformação seria inventada. |
| **4 P's** | Urgência/escassez falsa não cabe (app novo, sem lançamento limitado). |
| **ACCA** | Forte em ceticismo, mas menos nativo para oferta/pricing + CTA trial no fim. |

---

## Etapa 1.2 — Wireframe-Tabela

Framework: **P.A.S.T.O.R.** · Objetivo: trial / SQL locadoras · Canal: Search + Meta → esta LP

| Seção | Framework | Elemento | Conteúdo | Notas para Designer |
|-------|-----------|----------|----------|---------------------|
| **HERO** | P — Problem | Headline (H1) | Chega de discutir amassado que já existia no carro. | Fundo escuro (#141413) ou full-bleed pátio/balcão. Tipografia Outfit/Saira Condensed. H1 ≤2 linhas. Brand “Danos Aparentes” hero-level (logo + nome), não só nav. |
| Hero | P | Subheadline | Vistoria digital na retirada e na devolução: diagrama, foto com GPS, assinatura na tela e PDF com hash SHA-256 + QR — prova no ato, não discussão no balcão. | Máx. 3 linhas. Tom operacional. |
| Hero | P | CTA primário | Começar 7 dias grátis — sem cartão | Botão alto contraste (accent #9E4428 ou claro no dark). CTA = resultado (trial), não “Saiba mais”. |
| Hero | P | CTA secundário | Ver um laudo real com QR | Link texto ou ghost button → âncora #demo. |
| Hero | P | Trust bar | (1) Hash SHA-256 + QR público · (2) Offline no pátio · (3) 7 dias grátis sem cartão · (4) App novo — sem depoimentos inventados | 4 badges honestos. **Não** logos de clientes fictícios. Badge 4 = honesty strip. |
| **AMPLIFY** | A — Amplify | Headline (H2) | Sem vistoria de entrada comparável, a cobrança de avaria vira discussão — e às vezes, processo. | Fundo rose/quente suave. |
| Amplify | A | Card dor 1 | **“Já estava assim.”** Cliente nega dano novo. Sem laudo de retirada no mesmo padrão, você discute — não compara. **[E-problema]** | Ícone alerta. Linguagem de balcão. |
| Amplify | A | Card dor 2 | **Foto no WhatsApp / vistoria só na devolução.** Sem par entrega×devolução, o ônus da prova fica frágil. **[E]** | Contraste visual: print WhatsApp genérico (placeholder) riscado. |
| Amplify | A | Card dor 3 | **Cada vistoriador, um jeito.** Prancheta diferente por pessoa = laudos incomparáveis entre filiais. **[E-produto]** | Ícone checklist inconsistente. |
| Amplify | A | Bloco autoridade (problema) | Citação curta ConJur (2024): ausência de checagem antes da entrega impossibilita comparação estado antes×depois. Link/fonte no rodapé do bloco. **Não** apresentar como cliente do app. | Layout citação + fonte. Tipografia mono pequena na fonte. |
| Amplify | A | Nota visual | Placeholder: balcão de locadora / devolução contestada — **sem** overlay de badges promo. | Full-bleed ou edge-to-edge se hero; nesta seção, imagem de contexto. |
| **SOLUTION** | S — Story/Solution | Headline (H2) | Laudo de avarias aparentes que prova a si mesmo. | Fundo branco/limpo. |
| Solution | S | Sub | Mesmo padrão na retirada e na devolução. Em minutos, no celular — inclusive sem sinal. | — |
| Solution | S | Step 1 | **Marque no diagrama** — mesma peça, mesma vista, entre vistoriadores. | Stepper horizontal 4 passos. |
| Solution | S | Step 2 | **Foto com GPS + timestamp** — bloqueia o argumento “essa foto foi depois”. | — |
| Solution | S | Step 3 | **Assinatura vistoriador + cliente na tela, no ato** — não “12 dias depois”. | Eco VoC “vistoria posterior”. |
| Solution | S | Step 4 | **PDF selado:** hash SHA-256 + QR de verificação pública. Se editar o PDF, o hash quebra. | Destacar QR. |
| Solution | S | Contraste | **Antes:** prancheta / WhatsApp / PDF editável. **Depois (mecanismo):** laudo verificável — *sem* claim de ROI de cliente. | Tabela 2 colunas ou split visual. |
| **TRANSFORMATION / PROVA** | T — Testimony* (honesto) | Headline (H2) | Prova do que existe hoje — sem cases inventados. | Fundo ice/azul claro. Honesty first. |
| Prova | T | Bloco A — Demo produto | **Escaneie o QR deste laudo demo.** Confira o hash. É a prova do mecanismo — não um depoimento. CTA: “Abrir verificação pública”. | Mock PDF + QR real. Placeholder se QR ainda não embedado: “Inserir laudo demo live”. |
| Prova | T | Bloco B — Problema de mercado | Decisões/notícias: ConJur 07/03/2024; TJDFT 26/01/2022 — cobrança sem vistoria prévia / unilateral. Citar fonte. | Cards com link externo. Label: “Prova do problema no mercado — não são clientes Danos Aparentes”. |
| Prova | T | Bloco C — Honesty | **App novo.** Ainda não temos histórico público de clientes. Preferimos trial + laudo verificável a depoimento falso. | Tipografia sóbria. Sem fake stars. |
| Prova | T | Anti-padrão | **Não usar:** “Empresas relatam redução drástica…” sem case nomeado. | Nota interna designer/copy. |
| **OFFER** | O — Offer | Headline (H2) | Comece pelo plano que cabe no volume da sua base. | Fundo lavender/peach suave. |
| Offer | O | Card Starter | **Starter — R$ 29,90/mês** · 20 laudos · ≈ R$ 1,50/laudo · Ideal para testar o fluxo na devolução. | Pricing cards sem “mais popular” falso se não houver dado. |
| Offer | O | Card Pro | **Pro — R$ 49,90/mês** · 80 laudos · white-label (logo no PDF) · ≈ R$ 0,62/laudo. | Destacar white-label para B2B. |
| Offer | O | Card Corp | **Corporativo — a partir de R$ 299/mês** · multi-usuário · piloto sob conversa · **sem case inventado para fechar.** WhatsApp. | Não overpromise API no Starter. |
| Offer | O | Risk reversal | 7 dias grátis **sem cartão**. Cancele no portal. PIX disponível no SME. | Trust line sob cards. |
| Offer | O | CTA | Quero testar na minha locadora | Scroll to #form. |
| **FAQ** | Objeções | Headline (H2) | Perguntas que locadoras fazem antes de testar | Fundo gray. Accordion. |
| FAQ | — | Q1 | O laudo tem validade jurídica? | Registro documental forte (hash, QR, GPS, assinaturas). Valor probatório depende do contrato/jurídico — **não** prometemos sentença ganha. |
| FAQ | — | Q2 | Foto no WhatsApp na devolução não basta? | Sem vistoria de entrada comparável, a cobrança fica frágil (ver ConJur). Oferta = par retirada×devolução. |
| FAQ | — | Q3 | Vocês têm cases / depoimentos? | Ainda não públicos. App novo. Oferecemos laudo demo + trial — sem inventar. |
| FAQ | — | Q4 | Funciona no pátio sem internet? | Sim — PWA offline + sync. |
| FAQ | — | Q5 | Precisa treinar a equipe? | Diagrama guia; primeira vistoria em minutos **[claim produto — validar onboarding]**. |
| FAQ | — | Q6 | Já tenho laudo cautelar. | Cautelar ≠ laudo de avarias aparentes (entrega/devolução). |
| **FORM** | R — Response | Headline (H2) | Ative 7 dias grátis e faça a primeira vistoria na sua base | Fundo peach. Form max-width ~500px. |
| Form | R | Campos | Nome · E-mail · WhatsApp · Empresa · **Cargo** (dropdown) · **Segmento** (dropdown) · **Principal desafio** (dropdown) · Volume aproximado de devoluções/mês (opcional) | Lead scoring via dropdowns. |
| Form | R | Dropdown cargo | Dono/sócio · Gerente de operações/pátio · Coordenador de vistoria · Outro | — |
| Form | R | Dropdown segmento | Locadora · Frota de aluguel · Oficina · Gestão de frota · Outro | Preferir Locadora pré-selecionável via UTM. |
| Form | R | Dropdown desafio | Disputa “já estava assim” · Padronizar vistoriadores · Substituir WhatsApp/papel · White-label no PDF · Offline no pátio · Outro | — |
| Form | R | CTA | Quero meu trial de 7 dias | Resultado = trial ativo / acesso. |
| Form | R | Trust | Dados confidenciais. Sem cartão no trial. Resposta em até 1 dia útil no WhatsApp se Corp. | — |
| **FOOTER** | — | Info | Logo Danos Aparentes · WhatsApp · danosaparentes.com.br · © 2026 · Links: Planos, Privacidade, Verificar laudo | Minimalista. Fundo escuro marca. |

---

## Defesa do Wireframe

### 1. Justificativa da escolha

**P.A.S.T.O.R.** estrutura a LP para locadora Problem-Aware: valida a dor no hero, amplifica com custo jurídico/operacional, ensina o mecanismo (único moat comunicável sem cases), substitui “testimonials” por prova honesta, fecha com oferta SME transparente e formulário com scoring.

Pontos fortes:
- **P+A** batem message match com ads “já estava assim” (m↑).
- **S** torna o valor verificável em 2 screenfuls (v↑).
- **T\* honesto** reduz ansiedade de marca nova sem mentir (−a).
- **O+R** alinham trial 7 dias / Starter-Pro (i↑, f↓).

### 2. Adequação ao contexto

- **Consciência:** Problem→Solution Aware — não Unaware puro.
- **Produto:** SaaS com mecanismo técnico; precisa de Story/Solution, não só PAS curto.
- **Objetivo SQL:** form com cargo/segmento/desafio filtra locadora vs. curiosidade.
- **Canal:** Search/Meta → LP wedge; **não** redesenhar site inteiro.

### 3. Resultado esperado (estimativa — sem baseline no repo)

| Métrica | Estimativa | Nota |
|---------|------------|------|
| Tempo na página | 2–4 min | LP longa (PASTOR + FAQ); ok para B2B SME |
| CVR visita→trial/lead | 3–8% Search intent; 1–3% Meta frio | Hipótese — calibrar em 2 semanas |
| Qualidade | Alta se dropdown “Locadora” + desafio “já estava” | SQL = trial iniciado ou WhatsApp com caso de disputa |

### 4. Validação — Fórmula de Conversão `C = 4m + 3v + 2(i−f) − 2a`

| Fator | Avaliação | Como a LP trata |
|-------|-----------|-----------------|
| **m (×4)** | Forte no wedge | Hero = dor de devolução; message match ads |
| **v (×3)** | Forte em mecanismo; fraco em ROI | Hash/QR/GPS em 2 screens; sem métrica de cliente |
| **i (×2)** | Médio | Trial 7 dias sem cartão; preço literal |
| **f (×2−)** | Baixo–médio | Form com scoring mas campos claros; CTA cedo no hero |
| **a (×2−)** | Crítico mitigado | Honesty block + demo QR + FAQ jurídico nuance + **zero fake quotes** |

**Risco residual:** nível Empresa (cases) ainda fraco — esperado até coleta VoC/betas.

---

## Etapa 1.3 — Enriquecimento (só o que existe)

| Elemento | Incluir? | Como |
|----------|:--------:|------|
| Stats de mercado inventados | ❌ | — |
| Cases nomeados | ❌ | Gap admitido |
| ConJur / TJDFT | ✅ | Citação + link + label “prova do problema” |
| Demo PDF/QR | ✅ | Prova de mecanismo |
| Preços literais | ✅ | Starter/Pro/Corp |
| Trial 7 dias | ✅ | Risk reversal |
| Glossário balcão | ✅ | “já estava assim”, avaria, devolução, laudo |

---

## Quality Gate — 5 dimensões UX

| Dimensão | Status | Ajuste aplicado |
|----------|--------|-----------------|
| Motivação | ✅ | Hero wedge locadora |
| Proposta de valor | ✅ | Mecanismo > feature soup |
| Incentivo | ✅ | Trial sem cartão |
| Fricção | ✅ | Form scoring sem wall of text |
| Incerteza | ✅ | Honesty + FAQ + demo; sem fake testimonials |

---

## Hipóteses de copy (não usar como citação de cliente)

| ID | Texto | Uso |
|----|-------|-----|
| H1 | “Toda devolução vira discussão; a gente absorve o risco.” | Só se validado em call |
| H9 | “Não compro sem ver laudo/case.” | Já respondido pelo bloco honesty + demo |

---

## Próximos passos

1. Validar sketch HTML com stakeholder (`docs/wireframe-sketch-danos-aparentes.html`).
2. Embutir **laudo demo real** com QR na seção Prova.
3. Deep-link ads → esta LP (não home).
4. Após 5–8 calls: atualizar T\* com betas nomeados (com permissão).

---

*Fim do Wireframe-Tabela (Markdown). HTML: `wireframe-tabela-danos-aparentes.html` · Sketch: `wireframe-sketch-danos-aparentes.html`.*
