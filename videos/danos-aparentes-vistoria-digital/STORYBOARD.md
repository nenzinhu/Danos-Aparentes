---
format: 1920x1080
message: "Danos Aparentes gera um laudo de vistoria que comprova a si mesmo — hash, QR Code, fotos com GPS e assinatura digital — pra você nunca mais discutir avaria que já existia."
arc: PAS — hook → pain → product intro → feature (fluxo) → feature (segurança) → benefit (offline) → CTA → brand outro
audience: vistoriadores autônomos, oficinas, locadoras, frotistas e concessionárias no Brasil
mode: collaborative
music: serious, corporate, minimal tension building to confident resolve
---

## Video direction

- **palette system** — strictly two-ink, from `frame.md`: `paper` (warm cream, the canvas — every frame's ground) + `ink` (near-black, the only type/line/grid color). No accent, no second hue anywhere — the graph-paper grid (`grid`, 10% ink) sits behind every frame as the permanent texture; `ink-faint` for de-emphasized chrome only. This reads the product as an official document (a laudo on paper), not a SaaS dashboard.
- **motion grammar + reveal model** — long-tail `power3` settles everywhere (no bounce, no overshoot, no `back.out`/`elastic.out` as default). Every frame reveals its pieces **on the spoken cue**, never front-loaded: at t=0 only what the VO is saying that instant is on screen; each further card/line/word arrives when the VO names it. Holds during a hold get, at most, subtle jitter (`sine-wave-loop`, low amplitude) — never lazy breathing, never a back-half pan/push.
- **rhythm / held-frame allocation** — Frame 6 (benefit: offline) is the deliberate breather — one calm two-line title-card, static camera, no camera reveal, sitting right before the CTA push. Frame 8 (brand outro) is the second, quieter hold — a persistent mark with a typed URL. Everything else stays in active reveal.
- **negative list** — no bouncy easing; no lazy circular breathing; no slow pan/push in a frame's back half; no floating independent elements ("screensaver"); no second color beyond paper/ink; no browser chrome, cursors-as-decoration, or generic AI gradient blobs; no dumping a frame's full content in its first ~25%.

## Frame 1 — Hook: a frase que todo mundo já ouviu

- scene: Palavras de dano batem em tela cheia, escalando até a frase de contestação
- voiceover: "Risco. Amassado. Sempre \"já estava aí\"?"
- duration: 3.5526530612244898s
- transition_in: cut
- status: animated
- src: compositions/frames/01-hook.html
- type: hook
- persuasion: Pain validation
- beat: tension
- blueprint: kinetic-type-beats (Reproduce — Hook flash sub-shape)
- focal: (typography-only, no asset)
- roles: (none — pure type on paper/grid ground)
- sfx: impact-soft (on "Amassado" hard-cut), riser (leading into the final question)
- asset_candidates:

narrativeRole: Abre validando a dor específica (a disputa de avaria pré-existente) antes de qualquer menção ao produto.
keyMessage: Essa frase — "já estava aí" — é o problema que o vídeo inteiro resolve.

Reproduce: fixed-line token swap (sub-shape A) — the line stays centered, only the accusation word changes by hard cut, landing on the question.

Scene 1 (0.0–1.3s): centered, ~35% of frame — `paper` ground, permanent grid visible. `display-hero` word "Risco." FLASH-cuts in dead-center (`discrete-text-sequence`) — no fade, no slide.
Scene 2 (1.3–2.6s): as the VO names it, "Risco." hard-cuts to "Amassado." at the same center anchor — in-place token swap, instant cut (`discrete-text-sequence`). Ink weight unchanged; only the word changes.
Scene 3 (2.6–4.0s): the line grows to the full question — `headline`-scale "Sempre \"já estava aí\"?" hard-cuts in below the resolved word, `ink-faint` quote marks. Settles and HOLDS to the cut — no further scale, only a `sine-wave-loop` low-amplitude jitter on the question mark to keep the still frame alive.

## Frame 2 — Pain: o processo em papel falha

- scene: Três frases de dor caem sozinhas em tela escura, uma de cada vez
- voiceover: "Fotos soltas. Sem hora, sem local. Vinte minutos de papel — e ainda sobra dúvida."
- duration: 7.993469387755102s
- transition_in: crossfade
- status: animated
- src: compositions/frames/02-pain.html
- type: pain_point
- persuasion: Pain agitation
- beat: frustration
- blueprint: kinetic-type-beats (Reproduce — Problem sub-shape)
- focal: (typography-only, no asset)
- roles: (none — pure type on paper/grid ground)
- sfx: soft whoosh per line entrance, no impact (agitation reads quieter than the hook)
- asset_candidates:

narrativeRole: Nomeia por que o processo atual (papel, fotos soltas) não resolve — sem citar o produto ainda.
keyMessage: O método atual de vistoria não prova nada.

Reproduce: 3 pain statements land alone on the bare canvas, each replacing the last — no product visible yet.

Scene 1 (0.0–1.6s): centered, ~30% of frame. `row-headline` line "Fotos soltas." reveals via per-word staggered fade (`kinetic-beat-slam`) on the `paper` ground; grid stays faintly visible behind.
Scene 2 (1.6–3.2s): "Fotos soltas." clears (motion-blur fly-off, `motion-blur-streak`) as "Sem hora, sem local." fades/blurs in to the same center (`kinetic-beat-slam`) — the VO's second cue triggers this swap, not a timer.
Scene 3 (3.2–5.0s): final, longer line "Vinte minutos de papel — e ainda sobra dúvida." reveals in two chunks (papel / dúvida) via chunk-reveal (`dynamic-content-sequencing`), landing left-aligned upper-third with the second chunk trailing below; holds to the cut, still.

## Frame 3 — Product intro: Danos Aparentes

- scene: A marca (silhueta de carro com lupa) se monta a partir do vazio e assenta no centro
- voiceover: "Chega. Danos Aparentes — o laudo que comprova a si mesmo."
- duration: 3.996734693877551s
- transition_in: zoom-through
- status: animated
- src: compositions/frames/03-product-intro.html
- type: product_intro
- persuasion: Negative contrast
- beat: relief + curiosity
- blueprint: logo-assemble-lockup (Adapt — brand-reveal-assemble-zoom variant)
- focal: assets/logo-b5d5d7ba.svg
- roles: logo-b5d5d7ba.svg = cutout (the hero mark, centered)
- sfx: soft chime on the mark's pop-in; low riser under the push-in
- asset_candidates: assets/logo-b5d5d7ba.svg — silhueta azul de carro com lupa sobreposta, a marca do produto

narrativeRole: Vira a chave da dor para a solução — apresenta o produto pelo nome, na frase de posicionamento já validada no site (TrustSection).
keyMessage: Danos Aparentes é o laudo que se comprova sozinho.

Adapt: keep the signature context-then-focus move (typed companion word sets context, mark pops beside it, camera pushes into a held close-up) — one hero mark, no tagline typing (VO carries the tagline instead), only one push, no orbiting system (too busy for a 5s beat).

Scene 1 (0.0–1.2s): centered, ~25% of frame. On the `paper`/grid ground, the word "Chega." hard-cuts in (`discrete-text-sequence`), small, upper-third — closing the prior beat's tone.
Scene 2 (1.2–3.0s): as the VO says "Danos Aparentes," the logo mark SPRING-POPS in dead-center (`spring-pop-entrance`, smooth long-tail settle, no overshoot) while "Chega." fades up and out; the wordmark "Danos Aparentes" unmask-slides in beside the mark (`svg-path-draw` tail + `spring-pop-entrance`) to complete the lockup — centered, ~45% of frame.
Scene 3 (3.0–5.0s): a single slow camera PUSH-IN (`multi-phase-camera`) tightens on the settled lockup as the tagline "— o laudo que comprova a si mesmo." types on beneath it (`discrete-text-sequence`, caret via `context-sensitive-cursor`); push eases to a stop and HOLDS — no back-half re-push.

## Frame 4 — Key feature: da placa ao laudo

- scene: Três cards de fluxo se montam em cascata — placa, diagrama, assinatura
- voiceover: "Placa preenche sozinha. Toque marca a avaria no diagrama. Assinatura fecha na tela."
- duration: 8.071836734693878s
- transition_in: crossfade
- status: animated
- src: compositions/frames/04-flow.html
- type: feature_showcase
- persuasion: Show-don't-tell proof
- beat: clarity
- blueprint: grid-card-assemble (Reproduce — Key_Feature grid variant)
- focal: assets/diagrama-lateral-do-veculo-carro.png
- roles: diagrama-lateral-do-veculo-carro.png = cutout (card 2's illustration, the diagram card)
- sfx: three soft "tick" clicks, one per card landing
- asset_candidates: assets/diagrama-lateral-do-veculo-carro.png — carro azul-escuro com porta dianteira destacada em vermelho sobre grid claro, diagrama de avaria

narrativeRole: Mostra o fluxo de uso real (consulta de placa → diagrama clicável → assinatura) em um único olhar, provando que o produto é rápido.
keyMessage: Da placa ao laudo assinado, em poucos toques.

Reproduce: 3 labeled feature tiles cascade one-by-one into a horizontal 3-up row (not a 2-col-brick — only 3 items, editorial single row reads cleaner), near-static hold with slow push-in.

Scene 1 (0.0–2.0s): as the VO says "Placa preenche sozinha," card 1 (mono-tag label "PLACA" + `body` caption) fades + slides a short distance into its slot, left third of a 3-up row — asymmetric row, ~40% density (`center-outward-expansion`, direct-into-slot form). Camera static.
Scene 2 (2.0–4.0s): on "Toque marca a avaria no diagrama," card 2 arrives center slot carrying the diagram illustration as its cutout image (label "DIAGRAMA"), same stagger-assemble move; the completed pair floats with a gentle parallax/sine hold (`sine-wave-loop`, amplitude/√N).
Scene 3 (4.0–6.0s): on "Assinatura fecha na tela," card 3 lands right slot (label "ASSINATURA"); the row is complete — a slow camera push-in (`multi-phase-camera`, steady-push) tightens ~5% across the remaining hold; the row settles and reads still.

## Frame 5 — Key feature: segurança do laudo

- scene: Três selos técnicos se montam ao lado do diagrama — hash, QR, GPS
- voiceover: "Hash SHA-256. QR Code de verificação. Fotos com GPS e hora certa."
- duration: 7.915102040816326s
- transition_in: push-slide LEFT
- status: animated
- src: compositions/frames/05-security.html
- type: feature_showcase
- persuasion: Feature-to-benefit translation
- beat: confidence
- blueprint: grid-card-assemble (Reproduce — Key_Feature grid variant)
- focal: assets/og-image.jpg
- roles: og-image.jpg = supporting (small badge accent behind card 1, dimmed ~40%, not a full-bleed background)
- sfx: three soft "tick" clicks matching Frame 4's cadence (continuity), soft glow-swell on the final card
- asset_candidates: assets/og-image.jpg — ícone de carro dentro de um escudo azul, sobre fundo escuro, reforço visual de segurança/proteção

narrativeRole: Traduz os recursos técnicos de segurança (hash, QR, GPS) no motivo real pelo qual o laudo "comprova a si mesmo" — sequência direta do card de fluxo, mesma categoria de card.
keyMessage: Cada laudo carrega prova técnica própria, não depende da palavra de ninguém.

Reproduce: same 3-up card row shape as Frame 4 (visual continuity, same category of card), enumerating the three security proofs instead of the three workflow steps.

Scene 1 (0.0–2.0s): on "Hash SHA-256," card 1 stagger-assembles into the left slot (`center-outward-expansion`, direct-into-slot); the shield-badge asset sits dimmed (~40%) behind it as a supporting texture, not the hero.
Scene 2 (2.0–4.0s): on "QR Code de verificação," card 2 lands center slot (a small `svg-path-draw` self-draw plays on a simple QR-block glyph inside the card — echoes `frame.md`'s native qr-block signature); parallax float on the settled pair.
Scene 3 (4.0–6.0s): on "Fotos com GPS e hora certa," card 3 lands right slot; a single `ambient-glow-bloom` traveling glow sweeps once left→right across all three cards as the row resolves and HOLDS — no further motion.

## Frame 6 — Benefit: funciona sem sinal

- scene: Um único título de valor, calmo, assenta em tela limpa
- voiceover: "Funciona até sem sinal no pátio — sincroniza sozinho depois."
- duration: 4.571428571428571s
- transition_in: crossfade
- status: animated
- src: compositions/frames/06-offline.html
- type: benefit_highlight
- persuasion: Friction reduction
- beat: ease
- blueprint: titlecard-reveal (Reproduce — Benefits variant)
- focal: (typography-only, no asset)
- roles: (none — the calm breather beat, deliberately bare)
- sfx: none (the one silent beat in the video — the calm is the point)
- asset_candidates:

narrativeRole: Beat de respiro — um único benefício, dito com calma, depois de duas cargas de feature — reforça que o produto foi feito pra pátio de verdade, sem depender de internet.
keyMessage: Sem sinal não é desculpa pra vistoria parar.

Reproduce: exactly one restrained move, then a still hold — this IS the video's allocated breather (named in Video direction), no development phase.

Scene 1 (0.0–0.4s): static `paper`/grid ground, empty-to-text — nothing on screen yet.
Scene 2 (0.4–1.8s): "Funciona até sem sinal no pátio" fades in centered while scaling slightly ~95%→100% (`scale-swap-transition`, smooth ease-out), `headline`-scale, and holds.
Scene 3 (1.8–5.0s): the line translates up and fades as "— sincroniza sozinho depois." translates up from below-center and fades in to take its place (`discrete-text-sequence`, one slide-up crossfade — the single move). Holds still to the cut; at most a subtle breathing pulse on the line (`sine-wave-loop`, very low amplitude).

## Frame 7 — CTA: 7 dias grátis

- scene: A marca se condensa no centro e vira o botão de ação
- voiceover: "7 dias grátis. Sem cartão. Teste agora."
- duration: 5.093877551020408s
- transition_in: zoom-through
- status: animated
- src: compositions/frames/07-cta.html
- type: cta
- persuasion: Risk reversal
- beat: motivation
- blueprint: cta-morph-press (Reproduce)
- focal: assets/logo-b5d5d7ba.svg
- roles: logo-b5d5d7ba.svg = cutout (the resting hero mark that condenses into the CTA)
- sfx: soft click + release bloom on the press
- asset_candidates: assets/logo-b5d5d7ba.svg — marca do produto, condensando no centro para virar o clique

narrativeRole: Remove a última objeção (cartão, compromisso) e pede a ação, no mesmo tom direto usado no site ("Sem cartão · 7 dias liberados · Cancele online").
keyMessage: Testar não custa nada — nem o cartão.

Reproduce: hero mark holds, condenses into the CTA at the same center, cursor arrives and presses — the two headline beats stay intact.

Scene 1 (0.0–1.4s): the logo mark holds dead-center, ~30% of frame, alive but resting — only a faint rotational breath (`sine-wave-loop`, low amplitude, scoped to the mark). "7 dias grátis." types on above it as the VO says it (`discrete-text-sequence`).
Scene 2 (1.4–2.4s): on "Sem cartão," the mark CONDENSES at the same center into a smaller, brighter CTA pill labeled "TESTAR AGORA" — shrink-fade ↔ scale-up sharing one `transform-origin` (`scale-swap-transition`), reading as one element transforming.
Scene 3 (2.4–3.4s): a cursor arrives from off-stage on a decelerating path (`gsap-effects`, `power2.out`), landing a few px off the CTA's geometric center — human aim, not scripted.
Scene 4 (3.4–5.0s): on "Teste agora," the cursor lands a physical click — cursor and CTA compress together in lockstep (`physics-press-reaction`), release with a soft ripple/glow bloom (`cursor-click-ripple` + `ambient-glow-bloom`); holds on the clicked state.

## Frame 8 — Brand outro: danosaparentes.com.br

- scene: A marca segura o centro da tela enquanto o endereço digita embaixo
- voiceover: "danosaparentes.com.br"
- duration: 3.866122448979592s
- transition_in: crossfade
- status: animated
- src: compositions/frames/08-outro.html
- type: branding
- persuasion: Memorability — a última tela existe só pra deixar uma coisa memorizável: o endereço.
- beat: peace of mind
- blueprint: typewriter-reveal (Reproduce — Brand_Outro variant)
- focal: assets/logo-b5d5d7ba.svg
- roles: logo-b5d5d7ba.svg = cutout (the persistent mark, held the whole shot)
- sfx: none (quiet close, echoes Frame 6's silence)
- asset_candidates: assets/logo-b5d5d7ba.svg — marca do produto, em repouso no centro

narrativeRole: Fecha o vídeo no único dado que precisa sobreviver depois que a tela apaga — o endereço do site.
keyMessage: danosaparentes.com.br

Reproduce: the mark holds dead-center the whole shot; a sub-line types into the final URL beneath it — no swap, no exit motion (this is the video's true final frame).

Scene 1 (0.0–1.0s): the logo mark (+ wordmark) is already centered, fully visible from t=0, thin concentric guide rings ripple outward once from it (`cursor-click-ripple`, ripple bloom, not a click — an entry flourish only).
Scene 2 (1.0–4.0s): as the VO speaks the URL, "danosaparentes.com.br" types on character-by-character beneath the mark with a trailing caret (`discrete-text-sequence` + `context-sensitive-cursor`); the mark performs one small idle move (gentle rotate, `sine-wave-loop`) but never leaves frame. Holds on the completed lockup — the video's real exit (final frame only).
