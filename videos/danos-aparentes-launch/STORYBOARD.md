---
format: 1920x1080
message: "O laudo pronto antes do cliente sair do pátio."
arc: BAB — antes (papel, 20min, discussão) → bridge (Danos Aparentes) → passo 1 (placa) → passo 2 (toque + assinatura) → uau (hash/QR comprova a si mesmo) → CTA
audience: Locadoras, frotistas/transportadoras, concessionárias e vistoriadores autônomos no Brasil
---

## Video direction

- **Palette** — warm cream ground (`colors.bg` #E8E6DC) on every frame; single terracota accent (`colors.primary` #9E4428) carries every eyebrow, numeral, CTA, card border, and progress bar. Headlines near-black (`colors.text`); body muted gray (`colors.text-muted`). No second accent color anywhere.
- **Type** — Outfit for display/numerals/chrome and body, per `frame.md`'s ramp. Headlines near-black −0.02em; eyebrows terracota uppercase 0.08em.
- **Motion grammar** — long-tail eases (`power3`, smooth not bouncy). Every frame reveals paced to its voiceover cue-by-cue — nothing appears before the VO names it; never front-load the whole canvas at t=0. Once content resolves, hold the read rather than keep animating.
- **Negative list** — no drop shadows on content; no square corners except the progress bar; no nav bars / browser chrome; no floating bokeh / purple-blue "AI" gradients; avoid slideshow (front-load-then-freeze) and screensaver (independently drifting elements) failure modes.

## Frame 1 — Chega de discutir

- scene: A frase de dor do próprio produto pousa sozinha, escalando em peso
- voiceover: "Chega de discutir amassado. Que já existia no carro."
- duration: 4s
- transition_in: cut
- status: outline
- src: compositions/frames/01-hook.html
- type: hook
- persuasion: Pain validation
- beat: frustração
- blueprint: kinetic-type-beats
- asset_candidates:

narrativeRole: Abre no exato ponto de dor do público — a discussão de avaria pré-existente no balcão.
keyMessage: A dor que todo vistoriador conhece — amassado disputado que já estava lá.

## Frame 2 — O jeito antigo

- scene: Três frases de dor do processo manual pousam uma a uma
- voiceover: "Vistoria no papel ainda leva vinte minutos. Foto solta. Sem prova de nada."
- duration: 4.5s
- transition_in: crossfade
- status: outline
- src: compositions/frames/02-antes.html
- type: pain_point
- persuasion: Pain agitation
- beat: frustração + impaciência
- blueprint: kinetic-type-beats
- asset_candidates:

narrativeRole: Agita a dor nomeando o custo concreto do processo antigo (tempo + falta de prova).
keyMessage: Papel é lento e não prova nada.

## Frame 3 — Danos Aparentes

- scene: O nome do produto e a promessa central se resolvem centralizados
- voiceover: "Com o Danos Aparentes, o laudo fica pronto — antes do cliente sair do pátio."
- duration: 4.5s
- transition_in: zoom-through
- status: outline
- src: compositions/frames/03-bridge.html
- type: product_intro
- persuasion: Negative contrast
- beat: alívio + curiosidade
- blueprint: kinetic-type-beats
- asset_candidates:

narrativeRole: Vira a página da dor para a promessa central da marca — a mensagem do vídeo inteiro.
keyMessage: O laudo pronto antes do cliente sair do pátio.

## Frame 4 — Passo 1: a placa

- scene: Campo de placa recriado; ao digitar, marca/modelo/cor preenchem sozinhos
- voiceover: "Digite a placa. O app preenche marca, modelo e cor sozinho."
- duration: 4.5s
- transition_in: push-slide LEFT
- status: outline
- src: compositions/frames/04-placa.html
- type: feature_showcase
- persuasion: Friction reduction
- beat: controle
- blueprint: cursor-ui-demo
- asset_candidates:

narrativeRole: Primeiro passo do fluxo de 3 passos — mostra a fricção zero de abrir uma vistoria.
keyMessage: A placa sozinha já preenche o veículo.

## Frame 5 — Passo 2: toque e assine

- scene: Diagrama do veículo recebe um toque marcando avaria; assinatura na tela em seguida
- voiceover: "Toque na avaria, foto com GPS. Vistoriador e cliente assinam na tela."
- duration: 5s
- transition_in: push-slide LEFT
- status: outline
- src: compositions/frames/05-toque-assinatura.html
- type: feature_showcase
- persuasion: Show-don't-tell proof
- beat: confiança
- blueprint: cursor-ui-demo
- asset_candidates:

narrativeRole: Segundo e terceiro passo do fluxo — marcar a avaria com prova fotográfica e fechar com assinatura digital.
keyMessage: Toque, foto com GPS e assinatura — tudo na tela, no pátio.

## Frame 6 — Um laudo que se prova

- scene: Hash SHA-256 e QR Code de validação se montam ao redor do PDF do laudo
- voiceover: "Hash SHA-256 em cada PDF. QR Code de verificação. Um laudo que comprova a si mesmo."
- duration: 5s
- transition_in: zoom-through
- status: outline
- src: compositions/frames/06-hash-qr.html
- type: benefit_highlight
- persuasion: Risk reversal
- beat: confiança + segurança
- blueprint: grid-card-assemble
- asset_candidates:

narrativeRole: A prova de que o laudo não depende da palavra da vistoriadora — o argumento de confiança central do produto.
keyMessage: Hash e QR tornam o laudo inviolável e verificável por qualquer pessoa.

## Frame 7 — CTA

- scene: A logo se monta enquanto a chamada final e as garantias (sem cartão, 7 dias) surgem
- voiceover: "Sua próxima avaria pode virar laudo em um minuto. Comece grátis por sete dias."
- duration: 5.5s
- transition_in: crossfade
- status: outline
- src: compositions/frames/07-cta.html
- type: cta
- persuasion: Risk reversal
- beat: motivação + urgência-para-agir
- blueprint: logo-assemble-lockup
- asset_candidates:

narrativeRole: Fecha com a ação — reduz o risco percebido (sem cartão) e cria urgência leve para começar agora.
keyMessage: Comece grátis por 7 dias, sem cartão.
