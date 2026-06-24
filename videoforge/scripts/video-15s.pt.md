# Danos Aparentes — Anúncio 15s (Meta / TikTok)

## Meta

| Campo | Valor |
|-------|-------|
| Duração total | **15.0s** |
| Formato | 9:16 (1080×1920) — exportar também 1:1 e 4:5 por crop |
| FPS | 30 |
| Idioma VO | PT-BR |
| TTS | ElevenLabs — `ErXwobaYiN019PkySvjV` (Antoni), `eleven_flash_v2_5`, `language_code: pt` |
| Música | Sem bed nesta fase (skill: não wired) |
| CTA final | `danosaparentes.vercel.app` — 7 dias grátis, sem cartão |

## Shots

### Shot 01 — Hook (problema)

| Campo | Valor |
|-------|-------|
| **duration** | 4.0s |
| **slot** | CUT |
| **VO** | Laudo manual no pátio? Pare de perder tempo. |
| **ONSCREEN** | kind: `headline` · text: `Laudo manual no pátio?` |
| **CLIP** | Vistoriador no pátio olhando papel/clipboard, frustrado; golden hour; cinematic 9:16 |
| **flags** | `broll` |

### Shot 02 — Solução (app)

| Campo | Valor |
|-------|-------|
| **duration** | 6.0s |
| **slot** | CUT |
| **VO** | Marque a avaria no celular, anexe fotos e gere o PDF em segundos. |
| **ONSCREEN** | kind: `bullet` · text: `Marque · Fotografe · PDF` |
| **CLIP** | Close-up mãos no smartphone; UI de vistoria (usar screenshot app → Seedance image-to-video) |
| **flags** | `brand`, `screenshot-ref:../../public/screenshots/app-inspect.png` |

> **Asset:** capturar screenshot 1080×1920 da aba Inspecionar em `/app` antes da Fase 4.

### Shot 03 — CTA

| Campo | Valor |
|-------|-------|
| **duration** | 5.0s |
| **slot** | FREEZE |
| **VO** | Sete dias grátis. Comece agora — Danos Aparentes. |
| **ONSCREEN** | kind: `cta` · text: `7 dias grátis · Sem cartão` + logo |
| **CLIP** | Fundo dark com grid azul sutil; logo central; glow primary `#1FB6FF` |
| **flags** | `brand`, `logo` |

---

**Soma durações:** 4 + 6 + 5 = **15.0s** ✓

## Notas de plataforma

- **TikTok / Reels:** usar este master 9:16.
- **Meta Feed:** crop central 4:5 ou 1:1 no FFmpeg (Fase 7).
- **Hook nos 3 primeiros segundos:** Shot 01 VO começa no frame 0.
