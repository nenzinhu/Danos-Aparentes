# Danos Aparentes — Anúncio 60s (Meta / TikTok / YouTube Shorts)

## Meta

| Campo | Valor |
|-------|-------|
| Duração total | **60.0s** |
| Formato | 9:16 (1080×1920) — versão 16:9 opcional por letterbox |
| FPS | 30 |
| Idioma VO | PT-BR |
| TTS | ElevenLabs — Antoni (`ErXwobaYiN019PkySvjV`) |
| Público | Vistoriadores, oficinas, frotas (misto) |
| CTA final | Trial Pro 7 dias · R$ 49,90/mês após trial (mencionar só no ONSCREEN, não no VO) |

## Shots

### Shot 01 — Hook emocional

| Campo | Valor |
|-------|-------|
| **duration** | 5.0s |
| **slot** | CUT |
| **VO** | Cada vistoria no papel é tempo perdido, cliente impaciente e laudo que ninguém confia. |
| **ONSCREEN** | kind: `headline` · text: `Laudos que o cliente não contesta` |
| **CLIP** | Montagem rápida: papel, relógio, cliente cruzando braços |
| **flags** | `broll` |

### Shot 02 — Placa automática

| Campo | Valor |
|-------|-------|
| **duration** | 7.0s |
| **slot** | CUT |
| **VO** | Digite a placa — marca, modelo, cor e município preenchidos na hora. |
| **ONSCREEN** | kind: `step` · text: `01 · Consulte a placa` |
| **CLIP** | Campo de placa no app preenchendo dados automaticamente |
| **flags** | `brand`, `screenshot-ref` |

### Shot 03 — Marcar danos

| Campo | Valor |
|-------|-------|
| **duration** | 8.0s |
| **slot** | CUT |
| **VO** | Toque na área exata do veículo, escolha o tipo de avaria, tire fotos HD e adicione notas. |
| **ONSCREEN** | kind: `step` · text: `02 · Marque as avarias` |
| **CLIP** | Carro SVG lateral; highlight porta dianteira; badge "Avaria: Porta Dianteira" |
| **flags** | `brand` |

### Shot 04 — Seis veículos

| Campo | Valor |
|-------|-------|
| **duration** | 5.0s |
| **slot** | CUT |
| **VO** | Carro, moto, caminhão, van, ônibus e modelo personalizado. |
| **ONSCREEN** | kind: `grid` · text: `6 tipos de veículo` |
| **CLIP** | Grid rápido dos ícones de veículos (usar `/public/icons/vehicles/*.svg`) |
| **flags** | `brand`, `library` |

### Shot 05 — Assinatura + PDF

| Campo | Valor |
|-------|-------|
| **duration** | 8.0s |
| **slot** | CUT |
| **VO** | Vistoriador e cliente assinam na tela. O PDF sai com hash SHA-256 e QR Code de verificação. |
| **ONSCREEN** | kind: `step` · text: `03 · Assine e envie` |
| **CLIP** | Assinatura digital na tela → transição para PDF com QR |
| **flags** | `brand`, `screenshot-ref` |

### Shot 06 — WhatsApp

| Campo | Valor |
|-------|-------|
| **duration** | 5.0s |
| **slot** | CUT |
| **VO** | Envie o laudo pelo WhatsApp do cliente em um clique. |
| **ONSCREEN** | kind: `badge` · text: `PDF → WhatsApp` |
| **CLIP** | Animação envio WhatsApp; ícone verde `#22c55e` |
| **flags** | `broll` |

### Shot 07 — Offline + sync

| Campo | Valor |
|-------|-------|
| **duration** | 6.0s |
| **slot** | CUT |
| **VO** | Funciona cem por cento offline no pátio. Sincroniza na nuvem quando houver internet. |
| **ONSCREEN** | kind: `bullet` · text: `Offline · Sync automático` |
| **CLIP** | Celular sem sinal → nuvem com check animado |
| **flags** | `broll` |

### Shot 08 — CTA + prova social

| Campo | Valor |
|-------|-------|
| **duration** | 16.0s |
| **slot** | FREEZE |
| **VO** | Teste sete dias grátis no plano Pro, sem cartão de crédito. Cancele quando quiser. Danos Aparentes — a vistoria digital que o pátio precisa. |
| **ONSCREEN** | kind: `cta` · text: `7 dias grátis · Sem cartão · danosaparentes.vercel.app` |
| **CLIP** | Logo full + três badges: `Laudo em 1 clique` · `Fotos como prova` · `Funciona offline` |
| **flags** | `brand`, `logo` |

---

**Soma durações:** 5 + 7 + 8 + 5 + 8 + 5 + 6 + 16 = **60.0s** ✓

## Orçamento de VO (PT-BR)

~145 palavras no total · ritmo natural ~2,4 pal/s → ~60s com pausas entre shots.  
Se `validate-timing` falhar, encurtar Shot 08 VO em até 2s ou reduzir `speed` ElevenLabs para 0,95 (nunca `atempo` > 1,3 no mux).

## Derivados

| Versão | Como gerar |
|--------|------------|
| 30s | Shots 01, 02, 03, 05 (parcial), 08 (6s) — ver `video-30s.pt.md` |
| 15s | Shots 01 (4s), 03 (6s cortado), 08 (5s) — ver `video-15s.pt.md` |
