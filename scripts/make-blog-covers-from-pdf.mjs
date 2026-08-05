/**
 * Capas reais a partir do print do laudo (antes × depois / check-in × check-out).
 */
import { mkdirSync, unlinkSync } from 'node:fs'
import { resolve, join } from 'node:path'
import sharp from 'sharp'

const OUT = resolve('public/blog-covers')
const SRC = resolve('public/Laudo/laudo-antes-depois-fonte.png')
mkdirSync(OUT, { recursive: true })

const W = 828
const H = 352
const HALF = Math.floor(W / 2)

const meta = await sharp(SRC).metadata()
const pw = meta.width
const ph = meta.height

function region(l, t, w, h) {
  const left = Math.max(0, Math.round(pw * l))
  const top = Math.max(0, Math.round(ph * t))
  const width = Math.max(1, Math.min(Math.round(pw * w), pw - left))
  const height = Math.max(1, Math.min(Math.round(ph * h), ph - top))
  return { left, top, width, height }
}

async function cropCover(r) {
  return sharp(SRC).extract(r).resize(HALF, H, { fit: 'cover', position: 'centre' }).png().toBuffer()
}

// Print 544×805: galeria fica bem no terço inferior; croqui no meio.
const diagram = await cropCover(region(0.05, 0.38, 0.90, 0.15))
const photoLeft = await cropCover(region(0.05, 0.70, 0.45, 0.14))
const photoRight = await cropCover(region(0.50, 0.70, 0.45, 0.14))
const pageTop = await sharp(SRC)
  .extract(region(0, 0, 1, 0.52))
  .resize(HALF, H, { fit: 'cover', position: 'top' })
  .png()
  .toBuffer()

async function compose({ left, right, leftLabel, rightLabel, title, slug, accent }) {
  const overlay = Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="veil" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#020617" stop-opacity="0.18"/>
      <stop offset="0.55" stop-color="#020617" stop-opacity="0"/>
      <stop offset="1" stop-color="#020617" stop-opacity="0.7"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#veil)"/>
  <rect x="${HALF - 2}" y="0" width="4" height="${H}" fill="${accent}"/>
  <circle cx="${HALF}" cy="${H / 2}" r="24" fill="${accent}"/>
  <text x="${HALF}" y="${H / 2 + 6}" font-family="Arial,sans-serif" font-weight="900" font-size="16" fill="#fff" text-anchor="middle">×</text>
  <rect x="14" y="14" width="180" height="28" rx="8" fill="#0f172a" fill-opacity="0.92"/>
  <text x="104" y="33" font-family="Arial,sans-serif" font-weight="800" font-size="12" fill="#fff" text-anchor="middle">${leftLabel}</text>
  <rect x="${HALF + 14}" y="14" width="190" height="28" rx="8" fill="${accent}"/>
  <text x="${HALF + 109}" y="33" font-family="Arial,sans-serif" font-weight="800" font-size="12" fill="#fff" text-anchor="middle">${rightLabel}</text>
  <rect x="70" y="${H - 42}" width="688" height="30" rx="10" fill="#020617" fill-opacity="0.84"/>
  <text x="${W / 2}" y="${H - 22}" font-family="Arial,sans-serif" font-weight="800" font-size="12" fill="#e2e8f0" text-anchor="middle">${title}</text>
</svg>`)

  await sharp({ create: { width: W, height: H, channels: 3, background: '#0b1220' } })
    .composite([
      { input: left, left: 0, top: 0 },
      { input: right, left: HALF, top: 0 },
      { input: await sharp(overlay).png().toBuffer(), left: 0, top: 0 },
    ])
    .webp({ quality: 88 })
    .toFile(join(OUT, `${slug}.webp`))
  console.log('✓', slug)
}

await compose({
  left: photoLeft,
  right: photoRight,
  leftLabel: 'ANTES · RETIRADA',
  rightLabel: 'DEPOIS · DEVOLUÇÃO',
  title: 'CONTROLE DE AVARIAS PARA LOCADORA — FOTOS DO LAUDO',
  slug: 'controle-de-avarias-para-locadora',
  accent: '#0369a1',
})

await compose({
  left: pageTop,
  right: diagram,
  leftLabel: 'CHECK-OUT',
  rightLabel: 'CHECK-IN',
  title: 'SISTEMA CHECK-IN / CHECK-OUT DE FROTA — LAUDO REAL',
  slug: 'sistema-check-in-check-out-frota',
  accent: '#0e7490',
})

for (const f of ['_debug-foto-esq.webp', '_debug-foto-dir.webp', '_debug-diagrama.webp', '_crop-diagram.webp', '_crop-photo.webp']) {
  try { unlinkSync(join(OUT, f)) } catch { /* ignore */ }
}

console.log('Capas atualizadas com a imagem do laudo.')
