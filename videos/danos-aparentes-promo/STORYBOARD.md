---
format: 1080x1920
message: "O laudo pronto antes do cliente sair do pátio."
arc: BAB — antes (papel) → ponte (produto) → passos (placa, toque+voz, assinatura/hash) → uau (6 modelos, offline, equipe) → prova social → CTA
audience: Locadoras, frotistas/transportadoras, concessionárias e vistoriadores autônomos no Brasil
---

## Video direction

- **Palette** — warm cream ground (`colors.bg` #E8E6DC) on every frame; single terracota accent (`colors.primary` #9E4428) carries every eyebrow, numeral, CTA, card border, and progress bar. Headlines near-black (`colors.text`); body muted gray (`colors.text-muted`). No second accent color anywhere.
- **Type** — Outfit for display/numerals/chrome and body, per `frame.md`'s ramp (h1/h2/h3, stat-num, tag, body). Headlines near-black −0.02em; eyebrows terracota uppercase 0.08em.
- **Motion grammar** — long-tail eases (`power3`, smooth not bouncy). Every frame reveals paced to its voiceover cue-by-cue — nothing appears before the VO names it; never front-load the whole canvas at t=0. Once content resolves, hold the read (stillness, at most a subtle jitter) rather than keep animating.
- **Rhythm / held frames** — Frame 5 (assinatura/hash) and Frame 8 (CTA) are the deliberate held/breather beats — content resolves early in the window and holds still, giving the eye a rest before/at the two most important trust + action moments. All other frames keep revealing new pieces until their final ~1s.
- **Negative list** — no drop shadows on content (only a soft terracota glow on CTA hover, per `frame.md`); no square corners except the progress bar; no nav bars / browser chrome / real cursors (cursor moves are implied by highlight, not a rendered pointer); no floating bokeh / purple-blue "AI" gradients; avoid both slideshow (front-load-then-freeze) and screensaver (independently drifting elements) failure modes.
- **Caption band** — bottom ~17% reserved on every frame; all content plans into the top ~83%.

## Frame 1 — Antes (a dor do papel)

- scene: Frases de dor aparecem sozinhas numa tela quase vazia
- voiceover: "Vistoria no papel ainda leva vinte minutos. Fotos soltas. Risco discutido no balcão."
- duration: 4.992s
- transition_in: cut
- status: animated
- src: compositions/frames/01-antes.html
- type: hook
- persuasion: Pain validation
- beat: frustração
- blueprint: kinetic-type-beats (Reproduce)
- focal: (typography only, no asset)
- roles: —
- sfx: soft-thud on each phrase landing
- asset_candidates:

narrativeRole: Abre validando a dor de quem ainda vistoria no papel/planilha.
keyMessage: O processo antigo é lento e gera discussão.

Scene 1 (0.0–1.8s): bare cream canvas, centered. "Vistoria no papel ainda leva vinte minutos." lands as one near-black h2 line, word-by-word fade+settle on power3 — Centered template, low density, generous negative space.
Scene 2 (1.8–3.3s): that line dims to ~40% opacity and slides up slightly; "Fotos soltas." punches in below it in the same near-black weight — two-line vertical stack, centered.
Scene 3 (3.3–5.0s): both prior lines dim further; "Risco discutido no balcão." lands heaviest (largest weight) dead-center, terracota underline-accent draws in beneath it and holds — the escalation resolves here; hold the read, no further motion.

## Frame 2 — Apresentando o Danos Aparentes

- scene: Nome do produto entra em Outfit bold sobre o fundo creme, com o accent-line terracota
- voiceover: "Apresentando o Danos Aparentes — o laudo pronto antes do cliente sair do pátio."
- duration: 4.757s
- transition_in: zoom-through
- status: animated
- src: compositions/frames/02-intro.html
- type: product_intro
- persuasion: Negative contrast
- beat: alívio
- blueprint: kinetic-type-beats (Reproduce) — "Introducing…" pattern
- focal: assets/logo-b5d5d7ba.svg
- roles: logo = cutout (small, upper element)
- sfx: soft riser into the name reveal
- asset_candidates: assets/logo-b5d5d7ba.svg — logotipo do app (silhueta de carro com lupa)

narrativeRole: Vira a página da dor pro produto — nome + promessa central.
keyMessage: O laudo fica pronto ainda no pátio, não depois.

Scene 1 (0.0–1.2s): terracota accent-line (60×4) draws in from left, upper-third — Centered template, low density.
Scene 2 (1.2–2.6s): as the VO says "Danos Aparentes", the logo mark (cutout, small, above the line) fades+scales in, and the name types on in near-black h1 beneath the accent-line.
Scene 3 (2.6–4.8s): as the VO reaches "o laudo pronto…", a muted body line ("antes do cliente sair do pátio") settles below the h1 — asymmetric composition tightens to centered; hold on the resolved lockup for the last ~0.8s.

## Frame 3 — Consulta automática de placa

- scene: Um campo de placa é preenchido, e marca/modelo/cor/cidade aparecem em cascata num card
- voiceover: "Digite a placa — marca, modelo, cor e cidade aparecem sozinhos."
- duration: 3.989s
- transition_in: crossfade
- status: animated
- src: compositions/frames/03-placa.html
- type: feature_showcase
- persuasion: Friction reduction
- beat: alívio + controle
- blueprint: cursor-ui-demo (Adapt)
- focal: plate-input card (recreated UI, no captured asset)
- roles: plate-card = cutout, result-fields = supporting
- sfx: light key-tap ticks, soft pop per field
- asset_candidates:

narrativeRole: Primeiro passo do fluxo real do produto — elimina digitação manual.
keyMessage: Um dado só (a placa) preenche o resto sozinho.

Adapt: keep the cursor-led "type → result" signature move; the surface is a tinted plate-input card (no captured screenshot), not a real cursor.

Scene 1 (0.0–1.3s): a single tinted card (frame.md card-tinted) with a plate field seats centered-upper, eyebrow "CONSULTE A PLACA" above it — Centered template, ~35% of frame.
Scene 2 (1.3–2.6s): as the VO says "marca, modelo", the plate characters type in one by one (a highlight sweeps the field, no rendered cursor); immediately below, "Marca" and "Modelo" tags pop into a 2-up row.
Scene 3 (2.6–4.0s): as the VO says "cor e cidade aparecem sozinhos", two more tags ("Cor", "Cidade") pop into the row completing a 2×2 grid beneath the plate field — card now reads dense/resolved; hold the last 0.6s.

## Frame 4 — Toque e confirmação por voz

- scene: Um diagrama do veículo em destaque; um toque marca a porta dianteira esquerda, e uma legenda de fala confirma o local
- voiceover: "Toque na avaria no desenho do carro — e ouça a confirmação na hora."
- duration: 3.691s
- transition_in: crossfade
- status: animated
- src: compositions/frames/04-toque-voz.html
- type: feature_showcase
- persuasion: Show-don't-tell proof
- beat: confiança + controle
- blueprint: device-surface-showcase (Reproduce)
- focal: assets/diagrama-lateral-do-veculo-carro.png
- roles: diagrama = cutout (hero, centered), confirmation caption = supporting (lower)
- sfx: soft tap, then a short confirm chime
- asset_candidates: assets/diagrama-lateral-do-veculo-carro.png — diagrama do carro com a porta dianteira esquerda destacada em vermelho

narrativeRole: O momento central da vistoria — marcar a avaria certa, sem erro.
keyMessage: Marcar avaria é tocar e ouvir a confirmação, sem dúvida.

Scene 1 (0.0–1.4s): the car diagram (cutout) seats centered, ~55% of frame, door already shown highlighted red per the asset — Centered template, single hero surface.
Scene 2 (1.4–2.6s): as the VO says "toque na avaria", a soft pulse ring emits once from the highlighted door (implying the touch) — no rendered cursor, just the ring + a subtle scale-pulse on the door region.
Scene 3 (2.6–3.7s): as the VO says "ouça a confirmação", a small pill caption ("Porta Dianteira Esquerda ✓") fades up beneath the diagram, terracota border, and holds — the confirmation reads as text standing in for the spoken voice cue.

## Frame 5 — Assinatura, hash e QR Code

- scene: Uma assinatura é traçada na tela; em seguida um selo com hash e QR Code se monta ao lado
- voiceover: "Assinatura na tela — e um PDF com hash e QR Code que provam que nada foi alterado."
- duration: 5.12s
- transition_in: crossfade
- status: animated
- src: compositions/frames/05-assinatura-hash.html
- type: feature_showcase
- persuasion: Statistical proof
- beat: confiança
- blueprint: video-text-pivot (Adapt)
- focal: signature-stroke → hash/QR seal card
- roles: signature = cutout (first half), seal-card = cutout (second half)
- sfx: pen-stroke whoosh, then a soft metallic "lock" click
- asset_candidates:

narrativeRole: Fecha o fluxo com a prova de integridade que diferencia o laudo. HELD FRAME (per Video direction) — resolves early, holds still for trust.
keyMessage: O laudo é assinado e à prova de alteração.

Adapt: keep the "show it happen, then hand off to the proof" pivot; the "video" half is a drawn signature stroke, not real footage.

Scene 1 (0.0–2.0s): centered, a signature line draws itself on (SVG path stroke animation) as the VO says "assinatura na tela" — Centered template, ~40% of frame, terracota ink.
Scene 2 (2.0–3.4s): the drawn signature slides/dissolves left-of-frame (30%) as a tinted seal-card assembles right (70%) — a monospace hash string types on, then a small QR block draws in beside it, as the VO names "hash e QR Code".
Scene 3 (3.4–5.1s): both halves settle into a balanced split (signature muted small-left, seal-card resolved right); everything holds fully still for the last ~1.2s — the deliberate held/trust beat, no further motion.

## Frame 6 — 6 modelos, offline, equipe

- scene: Três cartões se montam lado a lado: modelos de PDF, ícone de offline, e um mini-dashboard de equipe
- voiceover: "Seis modelos de laudo. Funciona sem internet. E um painel pra gerir toda a equipe."
- duration: 4.949s
- transition_in: crossfade
- status: animated
- src: compositions/frames/06-beneficios.html
- type: benefit_highlight
- persuasion: Value stacking
- beat: aspiração
- blueprint: grid-card-assemble (Reproduce)
- focal: 3-card row (modelos / offline / equipe)
- roles: card-modelos = cutout, card-offline = cutout, card-equipe = cutout — equal weight, no background
- sfx: three soft pops, one per card landing
- asset_candidates:

narrativeRole: Empilha os diferenciais que justificam a assinatura paga. This is the dashboard-density exception per frame.md.
keyMessage: Flexível, funciona em qualquer lugar, e escala pra equipe inteira.

Scene 1 (0.0–1.8s): eyebrow "MAIS RECURSOS" seats upper-left; as the VO says "seis modelos de laudo", the first tinted card pops in left-third — a small 6-swatch color strip inside it — 3-up grid template, card 1 of 3 present.
Scene 2 (1.8–3.4s): as the VO says "funciona sem internet", the second card pops in center — a simple wifi-off glyph + "100% offline" label — grid now 2 of 3.
Scene 3 (3.4–4.9s): as the VO says "painel pra gerir toda a equipe", the third card pops in right — stacked mini avatar row + "Equipe" label — grid completes 3-up; hold the full row for the last ~0.8s.

## Frame 7 — Laudo que o cliente entende

- scene: Uma tela de WhatsApp recebendo o PDF, com uma legenda que se assenta por cima
- voiceover: "O laudo que o cliente entende — direto no WhatsApp."
- duration: 3.157s
- transition_in: crossfade
- status: animated
- src: compositions/frames/07-whatsapp.html
- type: social_proof
- persuasion: Social proof
- beat: pertencimento
- blueprint: titlecard-reveal (Reproduce)
- focal: WhatsApp bubble mock (recreated UI, no captured asset)
- roles: chat-bubble = cutout, caption = supporting
- sfx: message-received pop
- asset_candidates:

narrativeRole: Mostra a entrega final chegando no bolso do cliente — prova prática.
keyMessage: A distribuição do laudo já é simples e reconhecível (WhatsApp).

Scene 1 (0.0–1.4s): a phone-frame chat bubble (WhatsApp green accent on the bubble only, never as a second brand accent elsewhere) slides up from bottom, centered, ~50% of frame — a small PDF-icon attachment inside it.
Scene 2 (1.4–3.2s): as the VO finishes "direto no WhatsApp", a clean two-line title ("O laudo que o cliente entende") crossfades up beneath the bubble — one slide-up crossfade, then held still for the remaining ~1s (low-motion titlecard signature).

## Frame 8 — CTA final

- scene: O logotipo se monta no centro, com o botão de teste grátis logo abaixo
- voiceover: "Danos Aparentes. Teste sete dias grátis, sem cartão."
- duration: 3.477s
- transition_in: crossfade
- status: animated
- src: compositions/frames/08-cta.html
- type: cta
- persuasion: Risk reversal
- beat: motivação
- blueprint: cta-morph-press (Reproduce)
- focal: assets/logo-b5d5d7ba.svg
- roles: logo = cutout, cta-button = cutout
- sfx: soft chime on CTA landing
- asset_candidates: assets/logo-b5d5d7ba.svg — logotipo do app

narrativeRole: Fecha com a marca + a oferta sem risco (grátis, sem cartão). HELD FRAME (per Video direction).
keyMessage: Comece agora, sem compromisso.

Scene 1 (0.0–1.3s): the logo mark condenses in from a soft scatter to dead-center as the VO says "Danos Aparentes" — Centered template, concentric faint rings behind (atmosphere, closing-only).
Scene 2 (1.3–2.3s): as the VO says "teste sete dias grátis", the one solid terracota `cta-button` pill fades+scales in directly beneath the logo — no other motion.
Scene 3 (2.3–3.5s): "sem cartão" settles as a small muted line under the button; everything holds fully still for the final ~1s — the video's last frame, real exit (soft fade to black), no harness transition after.
