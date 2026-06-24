import sharp from 'sharp'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const logo = readFileSync(join(root, 'public', 'logo.png'))

async function writePng(name, size, padding = 0) {
  const inner = size - padding * 2
  const img = await sharp(logo).resize(inner, inner).png().toBuffer()
  const out = padding > 0
    ? await sharp({
        create: {
          width: size,
          height: size,
          channels: 4,
          background: { r: 2, g: 6, b: 23, alpha: 1 },
        },
      })
        .composite([{ input: img, gravity: 'centre' }])
        .png()
        .toBuffer()
    : img
  const path = join(root, 'public', name)
  await sharp(out).toFile(path)
  console.log(`wrote ${name} (${size}x${size})`)
}

await writePng('favicon.png', 32)
await writePng('apple-touch-icon.png', 180)
await writePng('icon-192.png', 192)
await writePng('icon-512.png', 512)
await writePng('icon-maskable-512.png', 512, 64)
