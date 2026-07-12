# STORYBOARD.md — Danos Aparentes (vertical demo)

**Message:** Prova de avaria em minutos — marque a avaria no diagrama do carro, receba um laudo em PDF com hash e QR Code, mande no WhatsApp. Sem discussão.
**Arc:** Demonstration — segue o fluxo real do produto (placa → marcação → laudo → envio) em vez de vender uma promessa abstrata.
**Audience:** donos de frota, locadoras, oficinas e motoristas de app que precisam provar o estado do carro antes que vire discussão. Assiste no feed (Instagram/TikTok) ou recebe compartilhado no WhatsApp.
**Brand voice:** confiante, direto, "prova não desculpa" — sem humor solto, o produto resolve um conflito real.
**Why this matters now:** o vídeo é a demonstração visual da headline já publicada no site ("Chega de discutir amassado que já existia no carro") — reforça a mesma promessa com o produto em ação.

**Pacing: Moderate** — 5 beats, sub-compositions, CSS crossfades + 1 shader transition no beat 4 (o "wow" do laudo). ~24–26s planejado → **29.76s real** após recalibração de áudio (ver nota abaixo).

> **Nota de recalibração (Step 4):** a voz Kokoro local (sem chave de API) fala mais rápido que o planejado e a CLI `hyperframes tts` ignora linhas em branco/`...` como pausa (testado e confirmado — não é um recurso desta versão da CLI, só do pipeline de áudio de outros workflows). Em vez de forçar o vídeo a caber em ~15.6s de fala corrida, gerei cada linha de VO separadamente e montei o `narration.wav` final manualmente (concatenação de PCM + silêncio calculado em Node, sem depender de FFmpeg) para que as pausas caiam exatamente nos limites de cena que este storyboard já previa — cada beat guarda seu tempo de respiro visual (o toque no diagrama, o QR se desenhando, etc.) mesmo com a VO mais curta que a cena. Resultado: vídeo real de ~29.76s + fade final, ligeiramente mais longo que o planejado, mas dentro da faixa "site walkthrough" (30-60s) e ainda curto. `transcript.json` foi construído a partir dos limites reais de cada beat (conhecidos com precisão, pois eu mesmo montei o áudio) com tempo por palavra estimado proporcionalmente por tamanho de caractere — não é uma transcrição real via ASR (`whisper-cpp` não está instalado nesta máquina e não pôde ser configurado sem build tools). Timings por beat abaixo já refletem os valores reais.

**Format:** 1080×1920 (vertical — feed/Stories/WhatsApp)
**Audio:** TTS (voz PT-BR) + underscore minimal eletrônico + SFX pontuais
**VO direction:** feminina ou masculina, tom confiante e direto, ritmo levemente acelerado — "isso resolve seu problema agora", sem pausas dramáticas longas.
**Style basis:** DESIGN.md (tema escuro `#020617`/`#1FB6FF`/`#ffb938`, Saira Condensed + Outfit + IBM Plex Mono)
**Narration start:** 0.3s (a VO entra logo após o punch de abertura — cria urgência, não deixa a cena assentar antes da primeira frase)

**Underscore:** eletrônico minimal, pulso constante desde o frame 1, sobe levemente no beat 4 (reveal do laudo) e resolve no beat 5.

---

## Capabilities Discovery

```
$ ls registry/blocks/ | grep -E 'chromatic|cinematic|cross-warp|domain-warp|flash|glitch|gravitational|light-leak|ridged|ripple|sdf|swirl|thermal|whip'
No shader transitions installed

$ ls registry/blocks/ | grep vfx
No VFX blocks installed

$ npx hyperframes catalog --type block | head -40
data-chart, us-map*, world-map, spain-map, flowchart, logo-outro, instagram-follow,
tiktok-follow, yt-lower-third, news-ticker, lt-* (10 lower-third variants), x-post,
reddit-post, spotify-card, macos-notification, app-showcase, north-korea-locked-down,
apple-money-count, vpn-youtube-spot, blue-sweater-intro-video, nyc-paris-flight,
ui-3d-reveal, domain-warp-dissolve (shader: domain-warp), ridged-burn (shader: ridged),
whip-pan (shader: whip)
```

Nada instalado ainda. **Atualização no Step 5:** o pacote local do HyperShader (`packages/shader-transitions/dist/index.global.js`) não existe na instalação via `npx` deste CLI (esse caminho é do monorepo-fonte do HyperFrames, não do pacote publicado) — não achei um bundle local para copiar com segurança. Para não arriscar quebrar o build com uma dependência que não consigo verificar, troquei a transição shader do beat 4 por um **corte seco (hard cut)**, igual às outras transições. Nenhum shader é usado no vídeo final; todos os beats usam corte seco entre sub-composições. O reveal do laudo continua sendo o clímax visual do vídeo (QR se desenhando, hash em mono, assinatura em stroke-draw) — só a transição de entrada mudou de "dissolve" pra corte direto.

---

## Asset Audit

Contact sheet: `capture/assets/contact-sheet.jpg` (page 1 of 1)
5 assets visíveis (só há 4 no total, listando todos):
1. `diagrama-lateral-do-veculo-carro.png`: carro azul-marinho em vista lateral (estilo cartoon), com uma porta destacada em VERMELHO — é o diagrama real de marcação de avaria do produto.
2. `favicon.png`: ícone borrado azul, baixa resolução (3KB) — não serve para nada além de favicon.
3. `guias-de-vistoria-e-laudo.png`: o mesmo diagrama do carro, mas com a porta destacada em LARANJA sobre fundo com grid — variante quase idêntica ao item 1.
4. `og-image.jpg`: imagem de compartilhamento social — ícone de escudo+carro+check ao lado do carro com porta vermelha, sobre fundo escuro com glow azul.

Contact sheet: `capture/assets/svgs/contact-sheet.jpg` (page 1 of 1)
5 SVGs visíveis:
1. `svgs/svg-4f444583.svg`: seta preta apontando para a direita — ícone de UI genérico.
2. `svgs/svg-63d8eddd.svg`: logo do WhatsApp (telefone dentro de balão de fala).
3. `svgs/svg-a1da4190.svg` (ou `svg-7fd72790.svg`, quase idênticos): carro em line-art branco/azul-marinho, vista lateral, com bagageiro no teto.
4. `svgs/svg-eead9f32.svg`: seta preta apontando para a direita (duplicata do item 1).
5. `logo-b5d5d7ba.svg`: ícone de carro estilizado azul com uma lupa sobreposta na frente — é o ícone literal de "vistoria" (inspeção) do produto.

### Decisão por asset

| Asset | Decisão | Motivo |
|---|---|---|
| `diagrama-lateral-do-veculo-carro.png` | **USE** — Beat 3 (visual principal) | É a ilustração-assinatura do produto: o diagrama real usado para marcar avarias. Ancora o pedido original do usuário ("como é feita a escolha de avarias"). |
| `logo-b5d5d7ba.svg` (carro + lupa) | **USE** — Beat 1 (accent, opener) e Beat 5 (closer, brand icon) | É o ícone literal de "vistoria" do produto — funciona como marca/ícone de abertura e fechamento na ausência de um wordmark SVG dedicado. |
| `svgs/svg-63d8eddd.svg` (WhatsApp) | **USE** — Beat 5 (CTA) | "Manda no WhatsApp" já é uma reivindicação real do produto (presente na headline do site); o ícone reforça literalmente a ação do CTA. |
| `guias-de-vistoria-e-laudo.png` | SKIP | Quase idêntico ao diagrama já usado no Beat 3 (mesma ilustração, cor da porta diferente) — usar os dois seria repetição visual num vídeo de 24s. |
| `favicon.png` | SKIP | 3KB, baixa resolução, sem detalhe suficiente para tela cheia ou close-up em vídeo. |
| `og-image.jpg` | SKIP | Composição fixa em raster (JPG) pensada para preview social, não para animar; o ícone vetorial `logo-b5d5d7ba.svg` cobre a mesma ideia de forma editável. |
| `svgs/svg-a1da4190.svg` / `svg-7fd72790.svg` (carro line-art) | SKIP | Redundante com o diagrama do carro já usado como visual principal no Beat 3. |
| `svgs/svg-4f444583.svg` / `svg-eead9f32.svg` (setas) | SKIP | Ícones de UI genéricos (seta de navegação), não carregam identidade de marca, nenhum beat precisa de uma seta de navegação. |

**Piso de marca**: diagrama do carro (Beat 3, visual assinatura) ✓ · logo/ícone no opener (Beat 1) e closer (Beat 5) ✓.

---

## BEAT 1 — HOOK: A PERGUNTA QUE DESARMA (0:00–0:04)

**Shot type:** Extreme close-up (kinetic type preenche o quadro)
**Camera move:** Push — leve zoom 1.0→1.05 nos primeiros 0.5s no punch inicial, depois hold com drift sutil.
**Depth strategy:** Foreground = tipografia; midground = glow radial azul pulsante atrás do texto; background = grid fininho quase invisível (`rgba(31,182,255,0.03)`) cobrindo `--bg-main`.
**Motion magnitudes:** texto entra com y: 40px→0, scale 0.9→1.0; glow pulsa opacity 0.15→0.3.
**Purpose:** parar o scroll com uma pergunta que o público já viveu — "bateu e agora?" — antes de qualquer explicação do produto.

**Concept:** Sem logo, sem "bem-vindo". Um flash de luz azul no escuro total, e a pergunta que todo mundo que já teve o carro batido já fez. Isso é o gancho.

**VO cue:** "Bateu o carro? Prova que já tava assim."

**Visual:** Tela `--bg-main` (#020617) total. 0.0s: burst radial de luz azul (`--primary` 0.4 opacity → transparente, blur 60px, scale 0.3→1.4, 0.25s expo.out) explode no centro — SLAM. 0.25s: linha fina horizontal se desenha (scaleX 0→1, 0.3s expo.out) com glow `0 0 20px rgba(31,182,255,0.4)`. 0.35s: "BATEU O CARRO?" aparece em Saira Condensed 700, 72px, `--text-main`, char-stagger de baixo pra cima (y: 40→0, back.out(1.6), 0.06s entre chars). 1.2s: segunda linha "PROVA QUE JÁ TAVA ASSIM." em Outfit 400, `--text-muted`, fade+slide (y: 20→0, 0.5s power2.out). 1.8s–3.6s: hold com respiração — glow pulsa (opacity 0.15↔0.3, sine.inOut, 1.2s yoyo), texto drifta y: -2px. 3.6s: tudo desliza pra fora rápido em diagonal (x: -60px, opacity→0, 0.35s power2.in) — hard cut pro beat 2.

**Composition + Accents:**
- **Composed (load-bearing):** kinetic typography em 2 linhas + burst de luz + linha divisória SVG (stroke-draw) — técnicas: char-stagger (techniques.md), radial burst via CSS gradient + GSAP scale/opacity, SVG line draw.
- **Accents:** `logo-b5d5d7ba.svg` (ícone carro+lupa) — canto superior esquerdo, 40×40px, opacity 0→0.7 fade-in em 0.5s, sem protagonismo (é só assinatura de marca discreta no opener).

**Text Animations:**
- "BATEU O CARRO?": efeito de entrada por caractere tipo stagger-up-bounce (mapear no catálogo `/animate-text` — mais próximo de "char cascade" com `back.out`).
- "PROVA QUE JÁ TAVA ASSIM.": fade-slide-up simples (mapear para o efeito de "fade up" do catálogo).

**Beat Timing:** Transition in at: 0s · GSAP timeline duration: 4.2s (real — VO toca em 0.3–3.265s, tail visual até 4.2s)
**SFX:** `impact-bass-1.mp3` em 0.0s, volume 0.5 — no burst de luz inicial.

---

## BEAT 2 — CONSULTA DE PLACA (0:04–0:09)

**Shot type:** Close-up (um card de input preenche 45–55% do quadro)
**Camera move:** Dolly in sutil 1.0→1.06 ao longo do beat, drift x: 4px.
**Depth strategy:** Foreground = card de input com a placa; midground = 2 chips de dado do veículo (marca/modelo) surgindo ao lado; background = glow azul radial fixo + grid.
**Motion magnitudes:** card entra scale 0.92→1.0 com back.out(1.4); chips entram y: 24px→0 stagger 0.15s.
**Purpose:** mostrar que o processo começa em segundos — placa vira dado do carro automaticamente, sem fricção.

**Concept:** Depois do gancho, a primeira ação real do produto: você digita a placa, o carro se identifica sozinho. É o "da placa ao laudo em 3 passos" do site, primeiro passo.

**VO cue:** "Consulta a placa, os dados do carro aparecem na hora."

**Visual:** Crossfade CSS do beat 1 (0.3s). Card estilo "glass" (`background: rgba(2,6,23,0.85)`, `backdrop-filter: blur(12px)`, borda `--card-border`, `border-radius: 20px`) centralizado, 60% da largura do quadro. Dentro: label "PLACA" em IBM Plex Mono 12px `--text-muted`, uppercase, letter-spacing 0.1em. Campo abaixo com efeito de digitação caractere-a-caractere (steps easing) escrevendo "ABC-1D23" em IBM Plex Mono 32px `--primary`, cursor piscando. 1.8s: ao completar a digitação, glow verde-azulado pulsa uma vez atrás do card (confirmação). 2.2s: dois chips surgem abaixo em stagger (0.15s): "Corolla XEi 2022" e "Prata" — fundo `rgba(31,182,255,0.12)`, texto `--text-main`, `border-radius: 4px`. Câmera continua dolly-in lento o beat inteiro. 4.6s: card desliza pra cima e esmaece (y: -30, opacity→0, 0.4s power2.in) preparando o crossfade.

**Composition + Accents:**
- **Composed (load-bearing):** card "glass" com input mono + efeito de digitação + 2 chips de dado — técnicas: typing effect via steps(), stagger de chips com back.out, glass/blur do design system real (`design-styles.json` → `glass`).
- **Accents:** nenhum — o card composto carrega o beat sozinho.

**Text Animations:**
- Placa "ABC-1D23": efeito typewriter/typing (character-by-character reveal do catálogo).
- Chips "Corolla XEi 2022" / "Prata": scale-pop leve (mapear para efeito "pop in" do catálogo).

**Beat Timing:** Transition in at: 4.2s · GSAP timeline duration: 5.5s (real — VO toca em 4.465–8.263s, tail até 9.7s)
**SFX:** `key-press.mp3` (ou `typing`-like curto) em 0.2s–1.6s, volume 0.25 — sutil, sob a digitação. `ping.mp3` em 1.8s, volume 0.3 — na confirmação dos dados do carro.

---

## BEAT 3 — MARCAÇÃO DE AVARIAS NO DIAGRAMA (0:09–0:15) — HERO BEAT

**Shot type:** Medium → Close-up (câmera aproxima do diagrama ao longo do beat)
**Camera move:** Dolly in 1.0→1.25 nos primeiros 3s (revela detalhe), depois push rápido 1.25→1.35 no toque (0.3s) — o momento da marcação é o clímax do beat.
**Depth strategy:** Foreground = diagrama do carro (asset real) + ponto de toque; midground = chip de legenda da avaria; background = grid + glow `--signal-bright` sutil atrás do ponto marcado.
**Motion magnitudes:** diagrama entra scale 0.85→1.0 (0.6s power3.out); ponto de toque pulsa scale 1→1.6→1 com halo; chip entra y: 20→0.
**Purpose:** este é o coração do vídeo — mostrar exatamente como o usuário marca uma avaria: um toque no diagrama, não um formulário burocrático.

**Concept:** O produto inteiro se resume a isto: apontar no desenho do carro onde bateu. Nada de menus complicados. A câmera empurra pra dentro do diagrama até o toque virar o centro do quadro.

**VO cue:** "Marca a avaria direto no diagrama do carro."

**Visual:** Crossfade (0.3s). `diagrama-lateral-do-veculo-carro.png` centralizado, 75% da largura do quadro, sobre `--bg-main` com glow radial `rgba(31,182,255,0.08)` atrás. 0.3s: diagrama entra com leve tilt 3D (rotateY: -8→0deg, scale 0.85→1.0, 0.6s power3.out). 1.5s: um "dedo"/ponto de contato (círculo 24px, `--signal-bright`, blur suave) desce e toca a porta dianteira esquerda do carro — SNAP, scale do ponto 0→1.3→1 (back.out). 1.8s: no ponto de toque, um halo pulsante se expande (`rgba(255,185,56,0.35)`, scale 1→2.2, opacity 0.5→0, 0.6s, repete 2x) — como um "radar" de confirmação. 2.0s: a área da porta no diagrama muda de cor pra `--signal-bright` com contorno (simulando a seleção). 2.3s: chip de legenda desliza da direita: "Porta diant. esq. · risco" (texto real capturado em `design-styles.json`), fundo `rgba(255,185,56,0.15)`, IBM Plex Mono 14px. 3.0s–5.4s: câmera continua dolly-in lento, chip respira (y: ±2px). 5.4s: tudo recua rápido (scale→0.9, opacity→0, 0.4s) — prepara a transição shader pro beat 4.

**Composition + Accents:**
- **Composed (load-bearing):** ponto de toque animado + halo de confirmação + chip de legenda real — técnicas: SVG/CSS radial pulse, back.out entrance, real copy do produto (`design-styles.json` → chips).
- **Primary visual (não é accent, é o conteúdo do beat):** `capture/assets/diagrama-lateral-do-veculo-carro.png` — 75% do quadro, centralizado, com o tratamento 3D tilt + zoom descrito acima.

**Text Animations:**
- Chip "Porta diant. esq. · risco": slide-in lateral com leve overshoot (mapear para "slide + overshoot" do catálogo).

**Beat Timing:** Transition in at: 9.7s · GSAP timeline duration: 6.0s (real — VO toca em 9.963–13.227s, tail até 15.7s)
**SFX:** `pop.mp3` em 1.5s, volume 0.4 — no toque do dedo no diagrama. `sparkle.mp3` em 1.8s, volume 0.3 — no halo de confirmação (sobrepõe levemente o pop, ok pois são momentos de pontuação distintos).

---

## BEAT 4 — O LAUDO EM PDF (0:15–0:20) — MOMENTO DE PROVA

**Shot type:** Close-up (o "documento" preenche 60–70% do quadro)
**Camera move:** Rack focus — fundo desfoca enquanto o documento assenta nítido; leve dolly-out 1.1→1.0 revelando a folha inteira.
**Depth strategy:** Foreground = documento (laudo) com QR/hash/assinatura; midground = glow azul atrás do documento; background = grid desfocado.
**Motion magnitudes:** documento entra via shader dissolve; QR se desenha traço a traço; assinatura é um stroke-draw de 400px.
**Purpose:** o momento "não dá pra contestar" — o laudo em PDF com prova técnica (hash, QR, assinatura) é a resposta final à pergunta do Beat 1.

**Concept:** Depois de marcar a avaria, o produto entrega a prova em si: um documento com hash e QR Code, verificável por qualquer um. Esse é o clímax de credibilidade do vídeo — merece o único shader transition.

**VO cue:** "E o laudo sai em PDF, com hash e QR Code. Não dá pra contestar."

**Visual:** **Transição shader `domain-warp` (bloco `domain-warp-dissolve`)** do beat 3 pro beat 4 — dissolve com ruído fractal, 0.6s, dá a sensação de "materializar" o documento. 0.0s (pós-shader): "folha" do laudo aparece centralizada, fundo `#0a1428` (mais claro que `--bg-main`, simula papel escuro), borda `--card-border`, `border-radius: 16px`, 65% do quadro. Cabeçalho: "ABC-1D23 · Corolla XEi 2022" em IBM Plex Mono 16px `--text-main`. 0.4s: uma linha de avaria some abaixo: "Porta diant. esq. · risco" com um pequeno selo `--signal-bright` "1 avaria registrada". 1.0s: no canto inferior direito, um QR Code se desenha módulo a módulo (stagger de quadradinhos, 0.02s cada, ~0.5s total) em `--text-main`. 1.6s: abaixo do QR, uma string de hash aparece caractere a caractere em IBM Plex Mono 11px `--text-muted`: "a3f9…7e21" (formato realista, truncado). 2.1s: um traço de assinatura se desenha (SVG path stroke-dashoffset, 0.7s power3.out) em `--primary`, com o texto "Assinado digitalmente" surgindo ao lado. 2.9s–4.4s: hold — o documento inteiro tem um leve glow pulsante ao redor (confirmação de "verificado"), dolly-out revela a folha inteira. 4.4s: documento recua (scale→0.95, opacity→0, 0.4s) preparando o crossfade final.

**Composition + Accents:**
- **Composed (load-bearing):** documento/laudo composto do zero (não é screenshot) — cabeçalho mono, linha de avaria com selo, QR code desenhado em SVG/canvas, hash em mono, assinatura em stroke-draw — técnicas: SVG path draw (assinatura), stagger de módulos (QR), tipografia real do produto (IBM Plex Mono para dados verificáveis, conforme DESIGN.md §3.8).
- **Accents:** nenhum asset externo — este beat é 100% composto para poder mostrar o layout real do laudo sem usar screenshot.

**Text Animations:**
- Cabeçalho placa/modelo: fade rápido (mapear "quick fade" do catálogo).
- Hash "a3f9…7e21": reveal caractere a caractere tipo typewriter (reforça "dado técnico").

**Beat Timing:** Transition in at: 15.7s (corte seco — ver nota de shader no topo do arquivo) · GSAP timeline duration: 6.7s (real — VO toca em 15.927–21.111s, tail até 22.4s; beat estendido pois carrega a VO mais longa)
**SFX:** `whoosh-cinematic.mp3` iniciando em `15.2s` (pico casa com o corte do shader em 15.7s: 15.7 − 5.54 seria longo demais, então usar apenas a cauda — trigger em `15.7 − 0.5 = 15.2s` para o pico chegar perto do corte), volume 0.4. `chime.mp3` em 18.0s (sobre o momento da assinatura se desenhar), volume 0.35.

---

## BEAT 5 — CTA: MANDA NO WHATSAPP (0:20–0:24) — CLOSER

**Shot type:** Medium (documento + ícone WhatsApp + wordmark compõem o quadro)
**Camera move:** Push final 1.0→1.08 nos últimos 1.5s, assentando no lockup de marca.
**Depth strategy:** Foreground = ícone WhatsApp + miniatura do laudo "voando" para o ícone; midground = wordmark "Danos Aparentes" + tagline; background = glow radial pulsante.
**Motion magnitudes:** miniatura do laudo encolhe (scale 1→0.15) e voa até o ícone WhatsApp (path motion, 0.5s power3.in); wordmark assembla com back.out(1.8).
**Purpose:** fechar com a ação concreta que o produto promete — "manda no WhatsApp" — e deixar a marca gravada.

**Concept:** A prova não fica presa no app: ela é enviada. O laudo "voa" pro WhatsApp, confirmando a promessa real do produto (mesma reivindicação da headline do site: "pronto pra mandar no WhatsApp"). Fecha com a marca.

**VO cue:** "Manda no WhatsApp. Prova em minutos, sem discussão. Danos Aparentes."

**Visual:** Crossfade (0.3s). Miniatura do documento do beat 4 (12% do quadro) no canto superior, desliza e encolhe em direção ao centro-baixo onde o ícone `svgs/svg-63d8eddd.svg` (WhatsApp) aparece (scale 0→1, back.out(1.6), 0.4s). Ao "chegar", o documento é engolido pelo ícone (scale→0, opacity→0) e o ícone pulsa (scale 1→1.15→1, 0.25s) — SNAP de envio confirmado. 1.0s: logo abaixo, `logo-b5d5d7ba.svg` (ícone carro+lupa) entra central, 80px, com um anel se desenhando ao redor (SVG stroke-draw, 0.5s). 1.3s: wordmark "DANOS APARENTES" assembla letra por letra (char-stagger, back.out(1.8), 0.05s entre chars) abaixo do ícone, Saira Condensed 700, `--text-main`. 1.9s: tagline "Prova em minutos. Sem discussão." fade-slide-up, Outfit 400, `--text-muted`. 2.3s–3.6s: hold com respiração — glow de fundo pulsa (opacity 0.1↔0.18, sine.inOut), ícone WhatsApp continua com halo verde-azulado sutil pulsante (`rgba(31,182,255,0.25)`, já que a marca não usa o verde padrão do WhatsApp — mantém o ícone reconhecível mas o halo na paleta da marca). 3.6s: fade to black final (0.4s).

**Composition + Accents:**
- **Composed (load-bearing):** animação de "envio" (documento → ícone WhatsApp) + assembly do wordmark + tagline — técnicas: path motion (miniatura voando), char-stagger com back.out, SVG stroke-draw no anel do ícone de vistoria.
- **Accents:** `svgs/svg-63d8eddd.svg` (WhatsApp) — usado como conteúdo do beat (ação do CTA), não decoração. `logo-b5d5d7ba.svg` — ícone de marca no lockup final, 80px, centralizado acima do wordmark.

**Text Animations:**
- "DANOS APARENTES": char-stagger com overshoot (efeito de "assembly" do catálogo).
- "Prova em minutos. Sem discussão.": fade-slide-up.

**Beat Timing:** Transition in at: 22.4s · GSAP timeline duration: 7.36s (real — VO toca em 22.611–27.261s, hold de ~2.5s após a última palavra até 29.76s, + 0.4s de fade final)
**SFX:** `whoosh-short.mp3` em 0.3s, volume 0.3 — no documento voando pro ícone. `chime.mp3` em 0.9s, volume 0.4 — na confirmação de envio. `sparkle.mp3` em 1.3s, volume 0.25 — no assembly do wordmark.

---

## Brand Accents Pass

| Asset | Type | Where (beat #) | Role |
|---|---|---|---|
| `logo-b5d5d7ba.svg` (carro + lupa) | SVG | Beat 1 (accent, canto sup. esq.) + Beat 5 (brand mark, lockup final) | Ícone de marca no opener e closer — não há wordmark SVG dedicado no capture, este ícone cobre a função. |
| `diagrama-lateral-do-veculo-carro.png` | PNG (ilustração) | Beat 3 (visual principal) | Visual assinatura do produto — ancora o pedido original de mostrar "como é feita a escolha de avarias". |
| `svgs/svg-63d8eddd.svg` (WhatsApp) | SVG | Beat 5 (conteúdo do CTA) | Reforça literalmente a ação "manda no WhatsApp", reivindicação real do produto. |
| `guias-de-vistoria-e-laudo.png`, `favicon.png`, `og-image.jpg`, demais SVGs | — | SKIP | Ver justificativa por item na tabela do Asset Audit acima. |

Total de acentos de marca: 3 assets reais em uso (dentro da faixa recomendada de 2–4 no vídeo inteiro) + o laudo do Beat 4 é 100% composto (não é asset, é conteúdo original construído a partir da identidade de marca).

---

## Production Architecture

```
videos/danos-aparentes-tour/
├── index.html
├── DESIGN.md
├── SCRIPT.md
├── STORYBOARD.md                 ← este arquivo
├── transcript.json                (Step 4)
├── narration.wav                  (Step 4)
├── capture/
│   ├── screenshots/
│   ├── assets/
│   │   ├── diagrama-lateral-do-veculo-carro.png
│   │   ├── svgs/svg-63d8eddd.svg
│   │   ├── logo-b5d5d7ba.svg
│   │   └── fonts/
│   ├── extracted/
│   ├── AGENTS.md
│   └── CLAUDE.md
└── compositions/
    ├── beat-1-hook.html
    ├── beat-2-placa.html
    ├── beat-3-marcacao.html      ← hero beat
    ├── beat-4-laudo.html         ← shader transition in
    ├── beat-5-cta.html
    └── captions.html
```
