/**
 * Gera anúncio em vídeo 9:16 — Danos Aparentes: PDF Antes × Depois
 * Uso: node scripts/make-promo-video.mjs
 */
import sharp from 'sharp'
import { spawnSync } from 'node:child_process'
import {
  mkdirSync,
  writeFileSync,
  existsSync,
  copyFileSync,
  rmSync,
} from 'node:fs'
import { resolve, join } from 'node:path'

const ROOT = resolve('.')
const ASSETS =
  'C:/Users/Nei/.cursor/projects/c-Users-Nei-final-Danos-Aparentes-Historico-de-Vistoria-Veicular-1/assets'
const WORK = resolve('tmp/promo-ad')
const OUT_DIR = resolve('public/videos')
const W = 1080
const H = 1920
const FPS = 30
const SCENE_SEC = 4.2

const SCENES = [
  {
    file: 'c__Users_Nei_AppData_Roaming_Cursor_User_workspaceStorage_2d7efb525c7604ef4a1253cb922d2230_images_Captura_de_tela_2026-08-03_231507-ef5b27db-453e-403b-b46a-f065c6e22a59.png',
    title: 'Sem entrada comparável,',
    sub: 'a cobrança vira briga.',
  },
  {
    file: 'c__Users_Nei_AppData_Roaming_Cursor_User_workspaceStorage_2d7efb525c7604ef4a1253cb922d2230_images_Captura_de_tela_2026-08-02_212543-9fd47e4c-fa52-47d6-9ef5-c5b2f0ced508.png',
    title: 'Marque o dano no SVG',
    sub: 'A IA sugere. Você confirma.',
  },
  {
    file: 'c__Users_Nei_AppData_Roaming_Cursor_User_workspaceStorage_2d7efb525c7604ef4a1253cb922d2230_images_frame-005-ee38abce-cf47-4c0d-af1d-80e7e2e6253d.png',
    title: 'Do olhar do vistoriador',
    sub: 'ao histórico digital.',
  },
  {
    file: 'c__Users_Nei_AppData_Roaming_Cursor_User_workspaceStorage_2d7efb525c7604ef4a1253cb922d2230_images_frame-004-98ee2165-87f0-42fc-8283-2a2ddfb241a5.png',
    title: 'Histórico do veículo',
    sub: 'Entrada → devolução → novo dano.',
  },
  {
    file: 'c__Users_Nei_AppData_Roaming_Cursor_User_workspaceStorage_2d7efb525c7604ef4a1253cb922d2230_images_pdf_P_gina_1-8856241b-b3ae-4e2a-b153-954ea8076ad5.png',
    title: 'PDF ANTES',
    sub: 'Entrada / Check-out · 0 avarias',
  },
  {
    file: 'c__Users_Nei_AppData_Roaming_Cursor_User_workspaceStorage_2d7efb525c7604ef4a1253cb922d2230_images_pdf_P_gina_3-8cc90332-2cbd-49be-92a3-940f7bd05d07.png',
    title: 'PDF DEPOIS',
    sub: 'Retorno / Check-in · 1 grave',
  },
  {
    file: 'c__Users_Nei_AppData_Roaming_Cursor_User_workspaceStorage_2d7efb525c7604ef4a1253cb922d2230_images_Gemini_Generated_Image_ciwxosciwxosciwx-4c6ddebf-c7f3-4074-80a6-106addd39c97.png',
    title: 'Verificação de laudo',
    sub: 'QR + hash · danosaparentes.com.br',
  },
]

function escapeDrawtext(s) {
  return s
    .replace(/\\/g, '\\\\')
    .replace(/:/g, '\\:')
    .replace(/'/g, "\\'")
    .replace(/%/g, '\\%')
}

if (existsSync(WORK)) rmSync(WORK, { recursive: true, force: true })
mkdirSync(WORK, { recursive: true })
mkdirSync(join(WORK, 'src'), { recursive: true })
mkdirSync(OUT_DIR, { recursive: true })

console.log('Preparing scenes…')

for (let i = 0; i < SCENES.length; i++) {
  const scene = SCENES[i]
  const srcLong = join(ASSETS, scene.file)
  if (!existsSync(srcLong)) {
    console.error('Missing', srcLong)
    process.exit(1)
  }
  const src = join(WORK, 'src', `in-${i}.png`)
  copyFileSync(srcLong, src)
  const frame = join(WORK, `scene-${String(i).padStart(2, '0')}.png`)

  const fitted = await sharp(src)
    .resize(W, Math.round(H * 0.72), {
      fit: 'inside',
      withoutEnlargement: false,
    })
    .png()
    .toBuffer()
  const meta = await sharp(fitted).metadata()
  const left = Math.round((W - (meta.width || W)) / 2)
  const top = Math.round((H - (meta.height || H)) / 2)

  await sharp({
    create: { width: W, height: H, channels: 3, background: '#070b14' },
  })
    .composite([{ input: fitted, left, top }])
    .png()
    .toFile(frame)

  // Overlay bar + captions via SVG
  const svg = Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="top" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#070b14" stop-opacity="0.92"/>
      <stop offset="100%" stop-color="#070b14" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="bot" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#070b14" stop-opacity="0"/>
      <stop offset="100%" stop-color="#070b14" stop-opacity="0.95"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="220" fill="url(#top)"/>
  <rect y="${H - 420}" width="${W}" height="420" fill="url(#bot)"/>
  <text x="54" y="90" font-family="Arial,sans-serif" font-size="28" font-weight="700" fill="#5eead4" letter-spacing="4">DANOS APARENTES</text>
  <text x="54" y="${H - 220}" font-family="Arial,sans-serif" font-size="52" font-weight="800" fill="#ffffff">${scene.title.replace(/&/g, '&amp;')}</text>
  <text x="54" y="${H - 140}" font-family="Arial,sans-serif" font-size="36" font-weight="600" fill="#94a3b8">${scene.sub.replace(/&/g, '&amp;')}</text>
  <text x="54" y="${H - 60}" font-family="Arial,sans-serif" font-size="24" font-weight="700" fill="#38bdf8">PDF Antes × Depois · Histórico do veículo</text>
</svg>`)

  const overlaid = join(WORK, `frame-${String(i).padStart(2, '0')}.png`)
  await sharp(frame)
    .composite([{ input: svg, top: 0, left: 0 }])
    .png()
    .toFile(overlaid)
  console.log(`  scene ${i + 1}/${SCENES.length}`)
}

// Final CTA card
const ctaSvg = Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${W}" height="${H}" fill="#070b14"/>
  <text x="540" y="640" text-anchor="middle" font-family="Arial,sans-serif" font-size="34" font-weight="700" fill="#5eead4" letter-spacing="6">DANOS APARENTES</text>
  <text x="540" y="760" text-anchor="middle" font-family="Arial,sans-serif" font-size="64" font-weight="800" fill="#ffffff">O PDF mostra</text>
  <text x="540" y="840" text-anchor="middle" font-family="Arial,sans-serif" font-size="64" font-weight="800" fill="#38bdf8">o que mudou.</text>
  <text x="540" y="960" text-anchor="middle" font-family="Arial,sans-serif" font-size="32" font-weight="600" fill="#94a3b8">Entrada sem avarias → retorno com evidência</text>
  <rect x="270" y="1080" width="540" height="90" rx="16" fill="#0284c7"/>
  <text x="540" y="1138" text-anchor="middle" font-family="Arial,sans-serif" font-size="34" font-weight="800" fill="#ffffff">Começar agora</text>
  <text x="540" y="1240" text-anchor="middle" font-family="Arial,sans-serif" font-size="26" font-weight="600" fill="#64748b">danosaparentes.com.br</text>
</svg>`)
const ctaPath = join(WORK, `frame-${String(SCENES.length).padStart(2, '0')}.png`)
await sharp(ctaSvg).png().toFile(ctaPath)
console.log('  CTA frame')

const concatList = join(WORK, 'list.txt')
const allFrames = [...SCENES.map((_, i) => i), SCENES.length]
writeFileSync(
  concatList,
  allFrames
    .map((i) => {
      const f = join(WORK, `frame-${String(i).padStart(2, '0')}.png`).replace(/\\/g, '/')
      return `file '${f}'\nduration ${SCENE_SEC}`
    })
    .join('\n') +
    `\nfile '${join(WORK, `frame-${String(SCENES.length).padStart(2, '0')}.png`).replace(/\\/g, '/')}'\n`,
)

const outMp4 = join(OUT_DIR, 'vistoria-digital-promo.mp4')
const outPoster = join(OUT_DIR, 'vistoria-digital-promo-poster.jpg')

console.log('Rendering MP4…')
const ff = spawnSync(
  'ffmpeg',
  [
    '-y',
    '-f',
    'concat',
    '-safe',
    '0',
    '-i',
    concatList,
    '-vf',
    `fps=${FPS},format=yuv420p`,
    '-c:v',
    'libx264',
    '-preset',
    'medium',
    '-crf',
    '18',
    '-movflags',
    '+faststart',
    '-pix_fmt',
    'yuv420p',
    outMp4,
  ],
  { encoding: 'utf8' },
)

if (ff.status !== 0) {
  console.error(ff.stderr)
  process.exit(1)
}

// Poster from PDF depois scene
copyFileSync(join(WORK, 'frame-05.png'), join(WORK, 'poster-src.png'))
await sharp(join(WORK, 'frame-05.png')).jpeg({ quality: 88 }).toFile(outPoster)

const brief = `# Video Ad — Danos Aparentes (PDF Antes × Depois)

## Creative brief
- Product: Danos Aparentes — Histórico Digital do Veículo
- URL: https://danosaparentes.com.br
- Audience: Locadoras, frotas, oficinas, vistoriadores
- Pain: cobrança de dano sem prova de entrada → discussão / processo
- Core benefit: PDF de entrada e retorno comparáveis no histórico
- Format: 9:16 · ~${((allFrames.length) * SCENE_SEC).toFixed(0)}s · Meta/TikTok/Reels
- Structure: PAS + Before/After PDF
- CTA: Começar agora · danosaparentes.com.br

## Storyboard
1. Problema — sem entrada comparável
2. App — marque no SVG + IA sugestiva
3. Como funciona — até o histórico
4. Histórico do veículo (linha do tempo)
5. PDF ANTES — 0 avarias
6. PDF DEPOIS — 1 grave
7. Verificação de laudo (QR/hash)
8. CTA

## Outputs
- ${outMp4}
- ${outPoster}
`

writeFileSync(join(OUT_DIR, 'PROMO-BRIEF.md'), brief)
console.log('OK', outMp4)
console.log('Poster', outPoster)
