# STORYBOARD.md — Danos Aparentes App Tour

**Message:** Em minutos, no celular, você marca avarias no diagrama, assina com GPS e gera um PDF que prova a si mesmo (hash + QR).  
**Arc:** Demonstration (walkthrough das ferramentas reais do `/app`)  
**Audience:** Locadoras / oficinas / frotas vendo o produto no LinkedIn, WhatsApp ou LP  
**Brand voice:** Profissional, evidência-first, sem hype de “sentença garantida”  
**Why this matters now:** LP `/locadoras` + ads pedem demo do app; tour interno fecha a prova  

**Pacing: Moderate** — 6 beats, ~6–7s cada, total **~40s**, sub-compositions + CSS/GSAP crossfades 200–400ms.  
**Format:** 1920×1080  
**Narration:** Full VO PT-BR  

**Pacing note:** App chrome = Void Navy `#020617` + Signal Cyan `#1fb6ff`. Opener/closer podem usar Cream `#FAF9F5` + Charcoal `#141413` + Terracotta `#9E4428`.

---

## Global Direction

- Camera: mostly locked UI frames; light Ken Burns (~1.02 scale) on diagram/PDF only  
- Transition: 0.25s opacity crossfade between beats  
- Sound: VO continuous; subtle UI ticks on tab changes; soft BGM under −18 dB  
- Text effects: kinetic title on Beat 1 (`fade-up`); labels use `fade` 160ms  

---

## Beats

### Beat 1 — Shell PRO (0.0–6.0s)
**Communicates:** Você está no app de verdade — sync, PRO, fluxo claro.  
**Visual:** Composed dark app chrome (logo, “Plano PRO Ativo”, “Sincronizado”, tabs Dados|Diagrama|Laudo). Breadcrumb: Cliente → Placa → Diagrama → Avarias → Assinatura+GPS → PDF.  
**Techniques:** layered panels; text fade-up; status chip pulse (opacity only).  
**Customize:** Brand logo from `capture/assets/` (logo-full / brand); cyan glow on PRO chip.  
**Assets:** logo SVG/PNG from capture; NO scroll screenshot as plate.  
**Transition out:** Crossfade to Dados.

### Beat 2 — Dados: cliente & placa (6.0–12.5s)
**Communicates:** Cadastro rápido — perfil, cliente, veículo.  
**Visual:** Composed form panels (Perfil Oficina/Perito/Seguradora, campos cliente, CTA Continuar). Optional plate field highlight.  
**Techniques:** staggered field reveal; cursor/caret blink on plate; button scale 1→1.02 on “Continuar”.  
**Customize:** Sample data fictional (“Locadora Horizonte”, placa ABC1D23) — not real PII.  
**Transition out:** Hard cut to Diagrama.

### Beat 3 — Diagrama & tipos (12.5–20.0s)
**Communicates:** O coração do produto — desenho do veículo + vistas.  
**Visual:** Vehicle type row (Carro 4P selected); vista Lat. Esquerda; simplified SVG car silhouette with glow stroke cyan.  
**Techniques:** type-pill stagger; SVG stroke-draw; zoom control opacity.  
**Assets:** Prefer composed SVG; `moto.png` / `truck.png` only as tiny type icons if needed.  
**Transition out:** Click hotspot → Beat 4.

### Beat 4 — Avaria + foto (20.0–27.0s)
**Communicates:** Toque na peça → tipo/gravidade → foto com contexto.  
**Visual:** Part highlight + damage pin (severity medium `#f97316`); mini card “Amassado · Médio”; camera glyph + timestamp chip.  
**Techniques:** pin pop (back.out); card slide-up; camera shutter flash (opacity).  
**Customize:** One damage only — keep readable.  
**Transition out:** Crossfade to Laudo.

### Beat 5 — GPS + assinaturas + PDF (27.0–35.0s)
**Communicates:** Prova no ato — localização, duas assinaturas, export.  
**Visual:** GPS button → coord chip; dual signature pads (stroke animate); PDF button + layout “Modelo Moderno”; hash line mono + QR placeholder.  
**Techniques:** signature path draw; hash typewriter (IBM Plex Mono); QR scale-in.  
**Assets:** `laudo-pericial-diagrama-de-avarias.png` or `gsap-hero-3d-sheet-frame.png` as PDF plate (cropped, no UI chrome from marketing if noisy).  
**Transition out:** Crossfade to closer.

### Beat 6 — Closer (35.0–40.0s)
**Communicates:** Teste grátis — o laudo prova a si mesmo.  
**Visual:** Cream brand card; wordmark; line “Vistoria digital que prova a si mesma”; CTA “Testar 7 dias grátis”; URL danosaparentes.com.br  
**Techniques:** logo settle; CTA pulse once (scale).  
**Assets:** brand logo; no fake stars.

---

## Captured assets referenced
- Brand logos under `capture/assets/logo-*.svg` / brand paths  
- Optional PDF plate: `laudo-pericial-diagrama-de-avarias.png`, `gsap-hero-3d-sheet-frame.png`  
- Type icons: `moto.png`, `truck.png`  
- SVG UI icons from contact sheet: camera, pin, shield, WhatsApp  

**Do NOT place** contact-sheet grids or raw `scroll-*.png` as full-bleed video frames.

---

## Audio plan
- VO: Kokoro or HeyGen (wallet 0 → prefer local/Kokoro)  
- BGM: soft tech bed, ducked under VO  
- SFX: soft click on tab; shutter on Beat 4; paper on PDF  
