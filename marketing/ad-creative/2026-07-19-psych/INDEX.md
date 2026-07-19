# Ad creative + psychology — Danos Aparentes (2026-07-19-psych)

## Skills
- `ad-creative` (RSA, Meta, 15 static templates)
- `marketing-psychology` (loss aversion, zero-price, anchoring, BJ Fogg, etc.)

## Assumptions
- Product: Danos Aparentes — vistoria de avarias digital
- Offer: **7 dias grátis · sem cartão** → Pro **R$49,90/mês** (≈ **R$1,66/dia**, vistorias ilimitadas)
- Corporativo: sob medida (WhatsApp) — âncora / enterprise, não preço inventado
- Language: pt-BR
- Brand: `marketing/brand-guidelines/BRAND-GUIDELINES.md`
- Grounding: landings + PricingCards + content strategy + blog posts (sem stats/reviews inventados)

## Files
| File | Contents |
|---|---|
| `PSYCHOLOGY-MATRIX.md` | Modelos mentais × ângulos × prioridade de teste |
| `google-rsa.csv` | 8 ad groups · 15 headlines + 4 descriptions |
| `meta-ads.csv` | 21 variations · coluna `psychology` |
| `concepts/` | 15 estáticos (1 por template da library) |
| `/ad-creative-review-psych.html` | Review visual (7 ângulos Meta + psych tags) |

## Angles (RSA)
1. Locadoras — perda da cobrança → `/locadoras`
2. Oficinas — “não era assim” → `/oficinas`
3. Frotas — hoje no pátio → `/frotas`
4. Seguradoras — prova que valida → `/seguradoras`
5. Oferta Pro — grátis + âncora → `/planos`
6. Amassado pré-existente → blog
7. Offline no pátio → blog
8. Placa (primeiro passo fácil) → blog

## Quality gate
- [x] Google headlines ≤ 30
- [x] Google descriptions ≤ 90
- [x] Meta headlines ≤ 40
- [x] Meta descriptions ≤ 30
- [x] Sem ALL CAPS / sem fake testimonials / sem falsa escassez
- [x] Cada concept cita grounding + psychology

## How to use
1. Ler `PSYCHOLOGY-MATRIX.md` (priorizar testes 1–3)
2. Upload `google-rsa.csv` / `meta-ads.csv`
3. Produzir estáticos a partir de `concepts/` (brand tokens)
4. Comparar CTR vs lote `2026-07-19/` (baseline sem tags psych)

## Relação com lote anterior
Não substitui `marketing/ad-creative/2026-07-19/` — é wave psychology + verticais. Manter ambos no ar em testes A/B por ICP.
