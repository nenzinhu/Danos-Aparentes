# Roteiros + Storyboards — Vídeos B2B (Danos Aparentes)

Dois vídeos curtos (15s cada) para redes sociais e landing page.
Âncora visual: screenshots reais do app em `public/screenshots/`.
Cores da marca: cyan `#1FB6FF`, verde sucesso `#34d399`.

> Como NENHUMA ferramenta de vídeo está ativa no ambiente (FLUX 3 expirou,
> `video_generate` indisponível), estes roteiros são prontos para gerar em
> Runway / Kling / FLUX / Luma. Os prompts de imagem usam os screenshots
> reais como base (frame 0) onde indicado.

---

## VÍDEO 1 — "Como funciona: a IA analisa, você dá o OK"

**Duração:** 15s · **Formato:** 16:9 · **Tom:** premium SaaS, calmo, confiança
**Público:** operadores (locadoras, oficinas, frotas) + usuário final
**Mensagem central:** a IA faz o trabalho pesado (detectar, sugerir); o humano só aprova.

### Áudio PT-BR (locução off-screen, voz neutra profissional)
```
A IA analisa cada avaria, sugere a gravidade
e você só dá o OK.
Laudo com hash e QR Code, pronto em segundos.
```

### Storyboard (5 cenas)

| # | Tempo | Visual (âncora em home-full.png) | Movimento / Animação | Áudio |
|---|-------|----------------------------------|----------------------|-------|
| 1 | 0–3s | Frame 0 = `home-full.png` (app completo). | Push-in lento no diagrama de avarias do veículo (lateral esquerda). | (silêncio, ambiente suave) |
| 2 | 3–7s | Close no diagrama. | Marcadores cyan `#1FB6FF` acendem sobre riscos/amassados; badge pequeno "IA" pulsa. Painel lateral desliza mostrando sugestões de gravidade por peça. | "A IA analisa cada avaria, sugere a gravidade" |
| 3 | 7–11s | Zoom no botão de aprovação. | Dedo/hand-tap toca um círculo verde `#34d399` "Aprovar" — pulso de confirmação. | "e você só dá o OK." |
| 4 | 11–14s | Pull-back para o laudo PDF. | PDF do laudo aparece embaixo com string de hash SHA-256 e QR Code se formando. | "Laudo com hash e QR Code," |
| 5 | 14–15s | Logo Danos Aparentes + selo. | Fade suave para o selo "Verificado". | "pronto em segundos." |

### Prompt de imagem (se gerar por imagem→vídeo, frame 0 = home-full.png)
```
Animate this vehicle inspection app screenshot. Camera slowly pushes in toward
the car damage diagram on the left. AI-detected scratches and dents light up
with glowing cyan (#1FB6FF) markers and a small 'IA' badge. A suggestion panel
slides in from the right showing the AI proposing severity levels per part. A
human finger taps a green circular 'Aprovar' checkmark (#34d399) — soft confirm
pulse. View pulls back to reveal the PDF laudo at the bottom with a SHA-256 hash
string and a QR code forming. Calm premium SaaS motion, soft UI glow, shallow
depth of field. No on-screen text, no subtitles.
```

### Prompt alternativo (text-to-video, sem âncora)
```
Cinematic UI demo of a vehicle inspection web app on a laptop. Close-up of a car
damage diagram where AI highlights scratches with cyan glow and an 'IA' badge;
a side panel suggests severity per part; a finger taps a green 'Aprovar' button;
the screen pulls back to show a PDF laudo with SHA-256 hash and QR code. Soft
studio light, cyan and emerald accents, 4k, shallow DOF. No burned text.
```

### Music / SFX
- Música: eletrônica minimal, volume baixo.
- SFX: leve "whoosh" no push-in; "tick" suave no toque do Aprovar; "ding" no QR Code.

---

## VÍDEO 2 — "A dor da empresa some: histórico na nuvem, sem incomodação"

**Duração:** 15s · **Formato:** 16:9 · **Tom:** B2B, tensão→alívio, reconhecimento
**Público:** estacionamentos, valets, locadoras, guinchos, depósitos, frotistas
**Mensagem central:** o histórico do veículo fica na nuvem (check-in/check-out) → sem disputa, sem incomodação.

### Áudio PT-BR (locução off-screen)
```
O histórico do veículo fica na nuvem.
Check-in, check-out, sem disputa e sem incomodação.
```

### Storyboard (5 cenas)

| # | Tempo | Visual (âncora em locadoras.png) | Movimento / Animação | Áudio |
|---|-------|----------------------------------|----------------------|-------|
| 1 | 0–3s | Frame 0 = `locadoras.png` (dashboard de locadora/frota). | Cena tensa: carro devolvido com risco destacado, badge vermelho de aviso pulsa. | (silêncio, leve tensão) |
| 2 | 3–7s | Zoom no badge vermelho. | Badge "Avaria disputada" pulsa; expressão de alerta. | "O histórico do veículo fica na nuvem." |
| 3 | 7–11s | Transição para nuvem. | Timeline de histórico desdobra na tela: foto de check-in + foto de check-out por placa, ligadas por linha de auditoria limpa. | "Check-in, check-out," |
| 4 | 11–14s | Badge verde aparece. | Badge vermelho dissolve; badge verde `#34d399` "Sem incomodações" faz fade-in. | "sem disputa e sem incomodação." |
| 5 | 14–15s | Logo + selo. | Fade para selo "Verificado" da Danos Aparentes. | (silêncio fechamento) |

### Prompt de imagem (se gerar por imagem→vídeo, frame 0 = locadoras.png)
```
Animate this rental and fleet company dashboard screenshot. Start tense: a
returned car shows a disputed scratch, a red warning badge pulses next to it.
Then the mood shifts — a cloud history timeline unfolds showing check-in photo
and check-out photo per license plate, connected by a clean audit line. A green
(#34d399) 'Sem incomodações' confirmation badge fades in. The red warning
dissolves into a calm, organized record. Professional reassuring B2B tone, soft
light, clean corporate palette. No on-screen text, no subtitles.
```

### Prompt alternativo (text-to-video, sem âncora)
```
Split-screen B2B story: left side a stressed rental desk clerk facing a disputed
car scratch with a red alert; right side transforms into a clean cloud timeline
showing check-in and check-out photos per plate linked by an audit line, ending
on a green 'Sem incomodações' badge. Calm corporate light, cyan accents, 4k. No
burned text.
```

### Music / SFX
- Música: corporativa suave, volume baixo.
- SFX: "thud" tenso no badge vermelho; "swoosh" de alívio na transição para nuvem; "ding" suave no badge verde.

---

## Como gerar (passo a passo, qualquer ferramenta)

1. **Preparar frames 0** (opcional, para image→video):
   - Vídeo 1: use `public/screenshots/home-full.png`
   - Vídeo 2: use `public/screenshots/locadoras.png`
2. **Runway Gen-3/Gen-4:** cole o "Prompt de imagem" acima; em Image-to-Video,
   faça upload do screenshot como frame inicial; duração 15s; 16:9.
3. **Kling 1.6:** cole o mesmo prompt; modo "Image to Video"; 16:9; 15s.
4. **FLUX (via Fal AI, conta própria):** `image_to_video` com o screenshot +
   o prompt de imagem; áudio gerado pela própria ferramenta (ou grave a
   locução PT-BR à parte e dub).
5. **Áudio PT-BR:** se a ferramenta não dublar bem, gere a locução em
   ElevenLabs / OpenAI TTS (voz pt-BR) e sincronize no editor.
6. **Export:** 1080p, H.264, mp4. Entregue em `public/videos/` com poster WebP.

## Checklist de entrega
- [ ] Vídeo 1: `public/videos/como-funciona-ia-aprova.mp4` + poster
- [ ] Vídeo 2: `public/videos/historico-nuvem-sem-incomodacao.mp4` + poster
- [ ] Ambos 15s, 16:9, locução PT-BR, sem texto queimado na tela
