# Landing Page — Danos Aparentes (Locadoras)

> Gerado em 2026-07-25 | Skill: `guimkt-landing-page` v1.1.0  
> Fontes: `docs/wireframe-lp-danos-aparentes.md` + `docs/offer-diagnosis-danos-aparentes.md` + `docs/icp-danos-aparentes.md` + `docs/message-mining-danos-aparentes.md`  
> **Wedge:** locadoras / disputa “já estava assim” / prova no ato  
> **Framework:** P.A.S.T.O.R.  
> **Prova social:** 0 cases — prova honesta apenas. Sem depoimentos inventados. Sem métricas de cliente inventadas.  
> **Legenda:** **[E]** = evidência (produto ou problema público citável) · **[H]** = hipótese (não VoC de comprador B2B)

**HTML premium:** `docs/landing-page-danos-aparentes.html`  
**Wireframe origem:** `docs/wireframe-lp-danos-aparentes.md`

---

## Design System (Etapa 2.1)

```yaml
design_system:
  style: "dark-premium + liquid-glass"
  mode: "dark"

  cores:
    primary: "#1E293B"
    primary_rgb: "30, 41, 59"
    accent: "#9E4428"
    accent_rgb: "158, 68, 40"
    background: "#141413"
    background_alt: "#0A0A09"
    surface: "rgba(250, 249, 245, 0.05)"
    text_primary: "#FAF9F5"
    text_secondary: "#B0AEA5"
    text_muted: "#78766F"
    gradient: "linear-gradient(135deg, #9E4428, #C45A38)"

  tipografia:
    font_display: "Saira Condensed"
    font_body: "Outfit"
    font_mono: "IBM Plex Mono"
    scale: "1.25"

  efeitos:
    blur: "20px"
    opacity_glass: "0.05"
    border_glow: true
    grain_texture: false
    gradient_orbs: true
```

---

## Espectro da Proposta de Valor (referência)

| Nível | Resposta | Status |
|-------|----------|--------|
| Empresa | Mecanismo demonstrável (hash+QR+GPS+assinatura dual) — não reputação. 0 cases. | ⚠️ Fraco |
| Persona | Dono/ops de locadora que absorve avaria sem prova na devolução. | ✅ |
| Produto | Par entrega×devolução verificável vs. papel/WhatsApp/PDF editável. | ✅ |
| Aquisição | Message match “já estava assim” + trial 7 dias sem cartão + demo QR. | ✅ |

---

## Copy completa por seção (P.A.S.T.O.R.)

### NAVBAR

| Elemento | Copy |
|----------|------|
| Logo / marca | Danos Aparentes |
| CTA nav | Trial 7 dias → |
| Âncora CTA | `#form` |

---

### HERO — P (Problem)

| Elemento | Copy | Tag |
|----------|------|-----|
| Badge | Para locadoras · prova na devolução | **[E-produto]** |
| H1 | Chega de discutir amassado que já existia no carro. | **[E-produto]** |
| Subheadline | Vistoria digital na retirada e na devolução: diagrama, foto com GPS, assinatura na tela e PDF com hash SHA-256 + QR — prova no ato, não discussão no balcão. | **[E-produto]** |
| CTA primário | Começar 7 dias grátis — sem cartão | **[E-oferta]** |
| CTA secundário | Ver um laudo real com QR | **[E-produto]** → `#demo` |
| Trust 1 | Hash SHA-256 + QR público | **[E]** |
| Trust 2 | Offline no pátio | **[E]** |
| Trust 3 | 7 dias grátis sem cartão | **[E]** |
| Trust 4 | App novo — sem depoimentos inventados | **[E]** (honesty) |

**Nota designer:** Brand “Danos Aparentes” hero-level (logo + nome). Fundo `#141413`. H1 ≤2 linhas. Sem badges promo flutuando sobre mídia.

---

### AMPLIFY — A

| Elemento | Copy | Tag |
|----------|------|-----|
| H2 | Sem vistoria de entrada comparável, a cobrança de avaria vira discussão — e às vezes, processo. | **[E-jurídico+produto]** |
| Card 1 título | “Já estava assim.” | **[E]** |
| Card 1 body | Cliente nega dano novo. Sem laudo de retirada no mesmo padrão, você discute — não compara. | **[E-problema]** |
| Card 2 título | Foto no WhatsApp / vistoria só na devolução | **[E]** |
| Card 2 body | Sem par entrega×devolução, o ônus da prova fica frágil. | **[E]** |
| Card 3 título | Cada vistoriador, um jeito | **[E-produto]** |
| Card 3 body | Prancheta diferente por pessoa = laudos incomparáveis entre filiais. | **[E-produto]** |
| Citação autoridade | “A ausência de uma checagem feita pela locadora antes da entrega do veículo ao cliente impossibilita que se faça a necessária comparação entre o estado do carro antes e depois da locação.” | **[E]** ConJur, 07/03/2024 |
| Label citação | Prova do problema no mercado — não é cliente Danos Aparentes. Fonte: ConJur. | Obrigatório |
| Link fonte | https://www.conjur.com.br/2024-mar-07/sem-vistoria-previa-locadora-nao-pode-cobrar-multa-por-dano-em-veiculo/ | — |

---

### SOLUTION — S

| Elemento | Copy | Tag |
|----------|------|-----|
| H2 | Laudo de avarias aparentes que prova a si mesmo. | **[E-produto]** |
| Sub | Mesmo padrão na retirada e na devolução. Em minutos, no celular — inclusive sem sinal. | **[E]** |
| Step 1 | **Marque no diagrama** — mesma peça, mesma vista, entre vistoriadores. | **[E]** |
| Step 2 | **Foto com GPS + timestamp** — bloqueia o argumento “essa foto foi depois”. | **[E]** |
| Step 3 | **Assinatura vistoriador + cliente na tela, no ato** — não “12 dias depois”. | **[E]** (eco VoC consumidor) |
| Step 4 | **PDF selado:** hash SHA-256 + QR de verificação pública. Se editar o PDF, o hash quebra. | **[E]** |
| Antes | Prancheta / WhatsApp / PDF editável | **[E]** |
| Depois | Laudo verificável (mecanismo) — sem claim de ROI de cliente | **[E]** · sem métrica inventada |

---

### TRANSFORM / PROVA — T* (honesto)

| Elemento | Copy | Tag |
|----------|------|-----|
| H2 | Prova do que existe hoje — sem cases inventados. | Honesty |
| Bloco A título | Escaneie o QR deste laudo demo | **[E-produto]** |
| Bloco A body | Confira o hash. É a prova do mecanismo — não um depoimento. | — |
| Bloco A CTA | Abrir verificação pública | → `https://danosaparentes.com.br/verify` |
| Bloco B título | Como a Justiça trata falta de vistoria prévia | **[E-jurídico]** |
| Bloco B item 1 | ConJur, 07/03/2024 — ausência de checagem prévia impossibilita comparação antes×depois. | **[E]** |
| Bloco B item 2 | TJDFT, 26/01/2022 — cobrança após vistoria que “não constatou avaria” / imputação unilateral. | **[E]** |
| Bloco B label | Prova do problema no mercado — não são clientes Danos Aparentes. | Obrigatório |
| Bloco B link TJDFT | https://www.tjdft.jus.br/institucional/imprensa/noticias/2022/janeiro/locadora-e-condenada-a-devolver-valores-pagos-indevidamente | — |
| Bloco C | **App novo.** Ainda não temos histórico público de clientes. Preferimos trial + laudo verificável a depoimento falso. | **[E]** |
| Anti-padrão | Não usar: “Empresas relatam redução drástica…” sem case nomeado. | — |

---

### OFFER — O

| Elemento | Copy | Tag |
|----------|------|-----|
| H2 | Comece pelo plano que cabe no volume da sua base. | — |
| Starter | **Starter — R$ 29,90/mês** · 20 laudos · ≈ R$ 1,50/laudo · Ideal para testar o fluxo na devolução. | **[E-oferta]** |
| Pro | **Pro — R$ 49,90/mês** · 80 laudos · white-label (logo no PDF) · ≈ R$ 0,62/laudo. | **[E-oferta]** |
| Corp | **Corporativo — a partir de R$ 299/mês** · multi-usuário · piloto sob conversa · sem case inventado para fechar. WhatsApp. | **[E-oferta]** |
| Risk reversal | 7 dias grátis **sem cartão**. Cancele no portal. PIX disponível no SME. | **[E]** |
| CTA | Quero testar na minha locadora | → `#form` |

---

### FAQ — Objeções

**H2:** Perguntas que locadoras fazem antes de testar

| # | Pergunta | Resposta | Tag |
|---|----------|----------|-----|
| 1 | O laudo tem validade jurídica? | Registro documental forte (hash, QR, GPS, assinaturas). Valor probatório depende do contrato e do seu jurídico — **não** prometemos sentença ganha. | **[E]** |
| 2 | Foto no WhatsApp na devolução não basta? | Sem vistoria de entrada comparável, a cobrança fica frágil (ver ConJur). Nossa oferta é o par retirada×devolução no mesmo padrão. | **[E]** |
| 3 | Vocês têm cases / depoimentos? | Ainda não públicos. App novo. Oferecemos laudo demo + trial — sem inventar. | **[E]** |
| 4 | Funciona no pátio sem internet? | Sim — PWA offline + sync quando voltar o sinal. | **[E]** |
| 5 | Precisa treinar a equipe? | O diagrama guia o fluxo; a primeira vistoria costuma ser em minutos. **[H — validar tempo real no onboarding]** | **[E-produto]** + **[H]** |
| 6 | Já tenho laudo cautelar. | Cautelar ≠ laudo de avarias aparentes na entrega/devolução. São finalidades diferentes. | **[E-produto]** |

---

### FORM — R (Response)

| Elemento | Copy |
|----------|------|
| H2 | Ative 7 dias grátis e faça a primeira vistoria na sua base |
| Sub | Sem cartão. Sem depoimento inventado. Só o fluxo na sua devolução. |
| Campos | Nome · E-mail · WhatsApp · Empresa · Cargo · Segmento · Principal desafio · Volume aproximado de devoluções/mês (opcional) |
| Dropdown cargo | Dono/sócio · Gerente de operações/pátio · Coordenador de vistoria · Outro |
| Dropdown segmento | Locadora · Frota de aluguel · Oficina · Gestão de frota · Outro |
| Dropdown desafio | Disputa “já estava assim” · Padronizar vistoriadores · Substituir WhatsApp/papel · White-label no PDF · Offline no pátio · Outro |
| CTA | Quero meu trial de 7 dias |
| Trust | Dados confidenciais. Sem cartão no trial. Resposta em até 1 dia útil no WhatsApp se Corporativo. |

**Nota:** Formulário estático neste HTML — integração CRM/GTM fica a cargo do time de produto.

---

### FOOTER

| Elemento | Copy |
|----------|------|
| Marca | Danos Aparentes |
| Links | Planos · Privacidade · Verificar laudo (`/verify`) · WhatsApp |
| Site | danosaparentes.com.br |
| Copyright | © 2026 Danos Aparentes |
| Credit | Feito com [gui.marketing](https://gui.marketing/?utm_source=esc-skills&utm_medium=deliverable&utm_campaign=guimkt-landing-page&utm_content=footer) |

---

## CTAs — exercício “quando eu clicar, eu quero…”

| CTA | Resultado desejado |
|-----|-------------------|
| Começar 7 dias grátis — sem cartão | Trial ativo / acesso sem fricção de cartão |
| Ver um laudo real com QR | Ver mecanismo (hash/QR) em 2 minutos |
| Abrir verificação pública | Confirmar integridade do PDF demo |
| Quero testar na minha locadora | Ir ao formulário de trial |
| Quero meu trial de 7 dias | Enviar lead + iniciar trial |

---

## Quality Gate — 5 dimensões UX

| Dimensão | Status | Como a LP trata |
|----------|--------|-----------------|
| Motivação (×4) | ✅ | Hero = dor de devolução; message match ads “já estava assim” |
| Proposta de valor (×3) | ✅ | Mecanismo hash/QR/GPS em 2 screenfuls; sem ROI inventado |
| Incentivo (×2+) | ✅ | Trial 7 dias sem cartão; preços literais |
| Fricção (×2−) | ✅ | Form com scoring; CTA cedo no hero; seções escaneáveis |
| Incerteza (×2−) | ✅ | Honesty block + demo QR + FAQ jurídico nuance + zero fake quotes |

---

## Fórmula de Conversão `C = 4m + 3v + 2(i−f) − 2a`

| Fator | Avaliação | Notas |
|-------|-----------|-------|
| **m** | Forte no wedge | Hero locadora |
| **v** | Forte em mecanismo; fraco em ROI | Esperado sem cases |
| **i** | Médio–forte | Trial + preço |
| **f** | Baixo–médio | Form claro |
| **a** | Crítico mitigado | Honesty + demo; risco residual = nível Empresa |

---

## Hipóteses NÃO usar como citação de cliente

| ID | Texto | Status |
|----|-------|--------|
| H1 | “Toda devolução vira discussão; a gente absorve o risco.” | Só se validado em call |
| H9 | “Não compro sem ver laudo/case.” | Respondido por honesty + demo |
| FAQ Q5 | “primeira vistoria em minutos” | Claim produto — validar onboarding |

---

## Próximos passos de implementação (site)

1. Embutir **laudo demo real** com QR na seção `#demo` (placeholder no HTML).
2. Deep-link Google/Meta Ads → esta LP (não home multi-ICP).
3. Integrar form a trial/CRM.
4. Após 5–8 calls: atualizar T* com betas nomeados (com permissão).

---

*Fim do deliverable Landing Page (Markdown). HTML: `docs/landing-page-danos-aparentes.html`.*
