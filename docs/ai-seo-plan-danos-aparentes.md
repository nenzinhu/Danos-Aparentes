# Plano AI SEO — Danos Aparentes (path D)

**Data:** 2026-07-26  
**Depende de:** [`docs/ai-seo-audit-danos-aparentes.md`](./ai-seo-audit-danos-aparentes.md)  
**ICP wedge:** locadoras SME · prova retirada×devolução · sem fake metrics  
**Princípio:** Google = people-first; ChatGPT/Perplexity = blocos extraíveis + arquivos machine-readable

---

## Backlog ordenado

### Semana 1 — P0 quick wins

| # | Ação | Owner sugerido | Done quando |
|---|------|----------------|-------------|
| 1 | Publicar **`/pricing.md`** espelhando preços reais de `PricingCards.tsx` | Eng | Arquivo em `public/pricing.md` servido em `/pricing.md`; link no `llms.txt` e (opcional) no rodapé de `/planos` |
| 2 | **Refresh `llms.txt`** — landings de segmento + Starter nos planos + link pricing | Eng | `/locadoras`, `/oficinas`, `/frotas`, `/seguradoras`, `/sobre`, `/pricing.md` listados; descrição de planos honesta |
| 3 | Alinhar FAQ Corporativo em `/planos` às faixas publicadas (Start R$ 299 / Growth R$ 699 / Enterprise a partir de R$ 1.490) | Eng/Copy | Texto FAQ = cards; sem “só sob consulta” contradizendo preços |
| 4 | Melhorar **answer blocks** em `/locadoras`: 1 parágrafo 40–60w sob Amplify (“por que cobrança cai sem entrada”) + 1 sob Solution (“o que é laudo verificável”) | Copy | Cada bloco citável sozinho; manter ConJur/TJDFT; zero ROI inventado |
| 5 | Criar planilha DIY de citação (abaixo) e rodar baseline das 14 queries | Marketing | Planilha com data da 1ª medição |

**Preços canônicos (não inventar — fonte `src/components/PricingCards.tsx` + FAQ home):**

| Plano | Preço | Limites / notas |
|-------|-------|-----------------|
| Starter | R$ 29,90/mês | até 20 laudos PDF/mês · offline · hash · assinatura · placa · WhatsApp |
| Pro | R$ 49,90/mês | até 80 laudos · marca no PDF · dashboard · layouts extras · suporte prioritário |
| Corporativo Start | R$ 299/mês | até 5 usuários · laudos ilimitados |
| Corporativo Growth | R$ 699/mês | até 15 usuários |
| Corporativo Enterprise | a partir de R$ 1.490/mês | 15+ · API · SLA |
| Trial | 7 dias grátis | sem cartão · PIX disponível no SME |

PIX API confirma centavos: Starter `2990`, Pro `4990` (`create-pix-charge`).

### Semanas 2–4 — P1

| # | Ação | Detalhe |
|---|------|---------|
| 6 | **Fortalecer** `/blog/laudo-cautelar-vs-laudo-de-avarias` (preferir vs criar `/comparisons` agora) | Converter diferenças em **`<table>`** (pergunta, quem exige, o que olha, quando usar); lead 40–60w no topo; 3–4 FAQs + `faq:` no post; H2 “Qual laudo eu preciso na locadora?” |
| 7 | FAQ extractability nos posts ICP | Adicionar `faq:` a: cautelar vs avarias, avarias pré-existentes, checklist devolução (reusar padrão de outros posts) |
| 8 | HowTo no checklist de devolução | Espelhar steps já listados no conteúdo |
| 9 | `updatedDate` nos posts sem frescor | checklist + avarias-preexistentes (e outros ICP ao tocar) |
| 10 | Answer leads nos H2 dos 3 posts ICP | 1–2 frases diretas antes de expandir |
| 11 | Decisão produto: `sameAs` LinkedIn (pessoa ou empresa) | Desbloqueia Person/Organization authority — só com URL real |

**Não abrir `/alternatives` nesta janela** a menos que apareça concorrente nomeado com demanda de query — o post cautelar vs avarias cobre a comparação de *categoria* mais importante para o wedge.

### P2 — presença third-party (sem spam)

| Ideia | Como (autêntico) | Evitar |
|-------|------------------|--------|
| LinkedIn empresa + founder | Página oficial, posts de mecanismo (QR demo), sem “N clientes” | Comprar followers |
| Diretórios SaaS BR / listagens de frota-tech | Ficha honesta: trial, preço SME, offline, hash | Reviews falsos |
| Grupos de locadoras / associações | Responder dúvidas de processo (entrada×devolução) com link para checklist | Drop de link spam |
| YouTube curto | Screencast do fluxo no celular (já há MP4 no site) | Thumb clickbait com ROI |
| Imprensa / blog de nicho | Pitch: “como funciona prova técnica no laudo” + ConJur como contexto de mercado | Press release com métricas inventadas |
| Reddit / fóruns | Só se houver pergunta orgânica e resposta experiente | Astroturf / multi-contas |

Wikipedia: **adiar** (notabilidade insuficiente).

---

## Métricas de sucesso (DIY mensal — sem ferramenta paga)

Planilha (Google Sheets / Excel) com colunas:

`data | query | Google AIO? | citamos? | URL citada | ChatGPT citou? | Perplexity citou? | concorrente citado | notas`

Queries seed = as 14 da auditoria. Cadência:

1. **Mensal:** as 14 queries nos 3 motores  
2. **Trimestral:** re-auditar extratabilidade das 7 URLs da tabela  
3. **Search Console:** Performance (impressões/cliques) — Google não tem relatório “AI Overview” dedicado  
4. **Sucesso qualitativo P0 (30 dias):** pelo menos 1 citação orgânica em Perplexity ou ChatGPT em query comercial (#8 ou #9), **ou** menção correta de preço Starter/Pro quando perguntarem “quanto custa”

Não use “share of voice” pago como gate — DIY basta até volume justificar Otterly/Peec.

---

## Notas sobre arquivos machine-readable nesta entrega

| Arquivo | Ação nesta sessão |
|---------|-------------------|
| `public/pricing.md` | **Criado** — preços espelhados de `PricingCards` |
| `public/llms.txt` | **Atualizado** — landings + pricing + planos com Starter; sem claims falsos |

Se preços mudarem no código, atualizar **os dois** arquivos no mesmo PR.

---

## Docs relacionados

- [`docs/ai-seo-audit-danos-aparentes.md`](./ai-seo-audit-danos-aparentes.md) — gaps e checklist  
- [`aeo-geo-strategy.md`](../aeo-geo-strategy.md) — auditoria estrutural 2026-07-11 (parcialmente supersedida)  
- [`docs/icp-danos-aparentes.md`](./icp-danos-aparentes.md) — wedge locadoras + ban de fake proof  
- [`docs/offer-diagnosis-danos-aparentes.md`](./offer-diagnosis-danos-aparentes.md) — oferta / pricing SME (se existir no repo)  
- [`docs/message-mining-danos-aparentes.md`](./message-mining-danos-aparentes.md) — linguagem de dor (se existir)

---

## Checklist de publicação (conteúdo novo / refresh)

- [ ] Resposta direta no topo (40–60w)  
- [ ] H2 = pergunta real  
- [ ] Tabela se for comparação  
- [ ] FAQ + schema se Q&A  
- [ ] HowTo se procedural  
- [ ] `updatedDate` real  
- [ ] Sem cases/ROI inventados  
- [ ] Link interno para `/locadoras` ou `/planos` quando intent comercial  
- [ ] Atualizar `llms.txt` se for URL estratégica nova  
