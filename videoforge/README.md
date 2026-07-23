# VideoForge — Danos Aparentes (Meta / TikTok)

**loaded 0 corrections** (nenhum `corrections/videoforge-*.md` no skill)

Roteiros PT-BR derivados da landing (`src/app/page.tsx`) para tráfego pago Meta + TikTok.

## Roteiros

| Arquivo | Duração | Shots | Uso |
|---------|---------|-------|-----|
| `scripts/video-15s.pt.md` | 15s | 3 | Stories, hook rápido |
| `scripts/video-30s.pt.md` | 30s | 5 | **Recomendado** — equilíbrio hook + prova + CTA |
| `scripts/video-60s.pt.md` | 60s | 8 | Remarketing, YouTube Shorts |

Formato master: **9:16** (1080×1920). Crop 4:5 / 1:1 na Fase 7 (FFmpeg).

## Pipeline

```bash
cd videoforge

# Render completo (tenta ElevenLabs; sem chave = só visual)
node scripts/render-30s.mjs --silent

# Com narração ElevenLabs (ELEVENLABS_API_KEY no .env ou .env.local)
node scripts/render-30s.mjs

# Passo a passo manual
node scripts/gen-vo-elevenlabs.mjs scripts/video-30s.pt.md
node scripts/validate-timing.mjs scripts/video-30s.pt.md
node scripts/build-storyboard.mjs scripts/video-30s.pt.md
cd remotion && npx remotion render src/index.ts Ad30 ../out/ad-30s-9x16.mp4 --concurrency=1
```

### Entrega

| Arquivo | Duração | Tamanho |
|---------|---------|---------|
| `out/ad-15s-9x16.mp4` | 15s | ~1,7 MB |
| `out/ad-30s-9x16.mp4` | 30s | ~3,4 MB |
| `out/ad-60s-9x16.mp4` | 60s | ~6,5 MB |

Todos com narração ElevenLabs (Antoni PT-BR) · formato 9:16.

```bash
# Render individual
node scripts/render-ad.mjs scripts/video-15s.pt.md Ad15 ../out/ad-15s-9x16.mp4
node scripts/render-ad.mjs scripts/video-60s.pt.md Ad60 ../out/ad-60s-9x16.mp4
```

### Pré-requisitos

- `ELEVENLABS_API_KEY` no `.env` ou `.env.local` da raiz do PWA (narração)
- `ffprobe` no PATH (timing gate com VO real)
- `ffmpeg` opcional (`gen-silent-vo.mjs` para testes locais)

## TTS

| Campo | Valor |
|-------|-------|
| Provider | ElevenLabs |
| Voz | Antoni — `ErXwobaYiN019PkySvjV` |
| Modelo | `eleven_flash_v2_5` |
| Idioma | `pt` |

## Brand

Ver `brand.json` — paleta alinhada a `src/app/globals.css` (`#1FB6FF`, fundo `#020617`).

## Próximo passo

1. Adicionar `ELEVENLABS_API_KEY` e re-render com narração
2. Substituir placeholders visuais por screenshots reais do app / b-roll Seedance
3. Repetir pipeline para `video-15s.pt.md` e `video-60s.pt.md`

## Regras (video-forge)

- Nunca renderizar sem timing gate ✓
- Nunca `atempo` > 1.3 no mux final
- Remotion com `--concurrency=1`
- Texto ONSCREEN via Remotion (não queimar no clip fonte)
