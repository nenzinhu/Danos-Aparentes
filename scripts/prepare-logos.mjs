import sharp from 'sharp'
import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const iconSvg = readFileSync(join(root, 'public/brand/logo-icon.svg'))
const fullSvg = readFileSync(join(root, 'public/brand/logo-full.svg'))
const favSvg = readFileSync(join(root, 'public/favicon.svg'))

const pngOpts = { quality: 95, compressionLevel: 9 }
const BG = { r: 2, g: 6, b: 23, alpha: 1 } // #020617 — Apple Touch sem transparência

/** ICO com PNG embutido (Vista+ / Chrome / Edge). Buffers devem ter `.__size`. */
function writeIco(path, pngBuffers) {
  const count = pngBuffers.length
  const headerSize = 6 + count * 16
  const total = headerSize + pngBuffers.reduce((n, b) => n + b.length, 0)
  const out = Buffer.alloc(total)
  out.writeUInt16LE(0, 0)
  out.writeUInt16LE(1, 2)
  out.writeUInt16LE(count, 4)
  let o = headerSize
  for (let i = 0; i < count; i++) {
    const size = pngBuffers[i].__size ?? 32
    const buf = pngBuffers[i]
    const entry = 6 + i * 16
    out.writeUInt8(size >= 256 ? 0 : size, entry)
    out.writeUInt8(size >= 256 ? 0 : size, entry + 1)
    out.writeUInt8(0, entry + 2)
    out.writeUInt8(0, entry + 3)
    out.writeUInt16LE(1, entry + 4)
    out.writeUInt16LE(32, entry + 6)
    out.writeUInt32LE(buf.length, entry + 8)
    out.writeUInt32LE(o, entry + 12)
    buf.copy(out, o)
    o += buf.length
  }
  writeFileSync(path, out)
}

async function pngAt(svg, size, { flatten = false } = {}) {
  let pipeline = sharp(svg).resize(size, size)
  if (flatten) pipeline = pipeline.flatten({ background: BG })
  const buf = await pipeline.png(pngOpts).toBuffer()
  buf.__size = size
  return buf
}

// ── PWA / brand mark (logo-icon completo) ──────────────────────────────────
await sharp(iconSvg).resize(512, 512).png(pngOpts).toFile(join(root, 'public/icon-512.png'))
await sharp(iconSvg).resize(192, 192).png(pngOpts).toFile(join(root, 'public/icon-192.png'))
await sharp(iconSvg).resize(512, 512).png(pngOpts).toFile(join(root, 'public/icon-maskable-512.png'))
await sharp(iconSvg).resize(256, 256).png(pngOpts).toFile(join(root, 'public/logo.png'))
await sharp(iconSvg).resize(256, 256).png(pngOpts).toFile(join(root, 'public/brand/logo-icon.png'))
await sharp(fullSvg).resize(880, 226).png(pngOpts).toFile(join(root, 'public/brand/logo-full.png'))

// ── Favicon set (mark lupa simplificado) ───────────────────────────────────
const fav16 = await pngAt(favSvg, 16)
const fav32 = await pngAt(favSvg, 32)
const fav48 = await pngAt(favSvg, 48) // Google Search preferência >48px

writeFileSync(join(root, 'public/favicon-16.png'), fav16)
writeFileSync(join(root, 'public/favicon-32.png'), fav32)
writeFileSync(join(root, 'public/favicon-48.png'), fav48)
writeFileSync(join(root, 'public/favicon.png'), fav32)
writeIco(join(root, 'public/favicon.ico'), [fav16, fav32, fav48])

// Apple Touch — fundo opaco (iOS não usa transparência bem)
await sharp(iconSvg)
  .resize(140, 140)
  .extend({ top: 20, bottom: 20, left: 20, right: 20, background: BG })
  .flatten({ background: BG })
  .png(pngOpts)
  .toFile(join(root, 'public/apple-touch-icon.png'))

console.log(
  'Ícones gerados: favicon.ico/16/32/48, apple-touch-icon, icon-192/512/maskable, logo.png',
)
