/**
 * Converte assets pesados da landing (PNG/JPG) para WebP.
 * Uso: node scripts/convert-landing-to-webp.mjs
 */
import sharp from 'sharp'
import { existsSync, mkdirSync, statSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const ROOT = resolve('.')

const JOBS = [
  // Laudo preview (maior ganho)
  { from: 'public/Laudo/laudo-vistoria-diagrama-avarias.png', to: 'public/Laudo/laudo-vistoria-diagrama-avarias.webp', quality: 78, maxWidth: 1240 },
  { from: 'public/Laudo/laudo-evidencias-hash-qr.png', to: 'public/Laudo/laudo-evidencias-hash-qr.webp', quality: 80, maxWidth: 1240 },
  { from: 'public/Laudo/vistoria-XXXXXXX-_1_.png', to: 'public/Laudo/vistoria-XXXXXXX-_1_.webp', quality: 78, maxWidth: 1240 },
  { from: 'public/Laudo/verificao.png', to: 'public/Laudo/verificao.webp', quality: 80, maxWidth: 1240 },
  { from: 'public/Laudo/laudo-antes-depois-fonte.png', to: 'public/Laudo/laudo-antes-depois-fonte.webp', quality: 80, maxWidth: 1600 },

  // Brand / PDF screenshot
  { from: 'public/identidade-empresa-config-pdf.png', to: 'public/identidade-empresa-config-pdf.webp', quality: 80, maxWidth: 960 },
  { from: 'public/exemplo-laudo-pdf-marca.png', to: 'public/exemplo-laudo-pdf-marca.webp', quality: 78, maxWidth: 900 },
  { from: 'public/nom.png', to: 'public/nom.webp', quality: 80, maxWidth: 960 },
  { from: 'public/pdf.png', to: 'public/pdf.webp', quality: 78, maxWidth: 900 },

  // Chat mascot
  { from: 'public/chat/mascote-ajuda.png', to: 'public/chat/mascote-ajuda.webp', quality: 85, maxWidth: 256 },

  // Vehicles (Lupa + showcase)
  { from: 'public/vehicles-img/car.png', to: 'public/vehicles-img/car.webp', quality: 82, maxWidth: 800 },
  { from: 'public/vehicles-img/moto.png', to: 'public/vehicles-img/moto.webp', quality: 82, maxWidth: 800 },
  { from: 'public/vehicles-img/truck.png', to: 'public/vehicles-img/truck.webp', quality: 82, maxWidth: 800 },
  { from: 'public/vehicles-img/bus.png', to: 'public/vehicles-img/bus.webp', quality: 82, maxWidth: 800 },
  { from: 'public/vehicles-img/van.png', to: 'public/vehicles-img/van.webp', quality: 82, maxWidth: 800 },
  { from: 'public/vehicles-img/car2d.png', to: 'public/vehicles-img/car2d.webp', quality: 82, maxWidth: 800 },
  { from: 'public/vehicles-img/microbus.png', to: 'public/vehicles-img/microbus.webp', quality: 82, maxWidth: 800 },

  // Video posters
  {
    from: 'public/videos/vistoria-digital-promo-poster.jpg',
    to: 'public/videos/vistoria-digital-promo-poster.webp',
    quality: 78,
    maxWidth: 1280,
  },
  {
    from: 'public/videos/vistoria-digital-tour-poster.jpg',
    to: 'public/videos/vistoria-digital-tour-poster.webp',
    quality: 78,
    maxWidth: 1280,
  },

  // Exemplo PDF page leftover PNG (dead weight if unused, still convert)
  {
    from: 'public/exemplos/relatorio-vistoria-p2.png',
    to: 'public/exemplos/relatorio-vistoria-p2.webp',
    quality: 75,
    maxWidth: 1240,
  },
  // Landing PDF page previews (already webp — also emit -sm for DiffCompare)
  {
    from: 'public/landing/pdf-antes-p1.webp',
    to: 'public/landing/pdf-antes-p1-sm.webp',
    quality: 72,
    maxWidth: 900,
  },
  {
    from: 'public/landing/pdf-antes-p2.webp',
    to: 'public/landing/pdf-antes-p2-sm.webp',
    quality: 72,
    maxWidth: 900,
  },
  {
    from: 'public/landing/pdf-depois-p1.webp',
    to: 'public/landing/pdf-depois-p1-sm.webp',
    quality: 72,
    maxWidth: 900,
  },
  {
    from: 'public/landing/pdf-depois-p2.webp',
    to: 'public/landing/pdf-depois-p2-sm.webp',
    quality: 72,
    maxWidth: 900,
  },
]

function kb(bytes) {
  return `${(bytes / 1024).toFixed(1)} KB`
}

async function convertOne(job) {
  const from = resolve(ROOT, job.from)
  const to = resolve(ROOT, job.to)
  if (!existsSync(from)) {
    console.warn(`SKIP missing: ${job.from}`)
    return
  }
  mkdirSync(dirname(to), { recursive: true })
  const before = statSync(from).size
  let pipeline = sharp(from).rotate()
  const meta = await pipeline.metadata()
  if (job.maxWidth && meta.width && meta.width > job.maxWidth) {
    pipeline = pipeline.resize({ width: job.maxWidth, withoutEnlargement: true })
  }
  await pipeline.webp({ quality: job.quality, effort: 6 }).toFile(to)
  const after = statSync(to).size
  const saved = before - after
  console.log(
    `${job.from} → ${job.to} | ${kb(before)} → ${kb(after)} (−${kb(Math.max(0, saved))})`,
  )
}

for (const job of JOBS) {
  await convertOne(job)
}
console.log('done')
