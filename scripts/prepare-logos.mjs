import sharp from 'sharp'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const iconSvg = readFileSync(join(root, 'public/brand/logo-icon.svg'))
const fullSvg = readFileSync(join(root, 'public/brand/logo-full.svg'))

const pngOpts = { quality: 95, compressionLevel: 9 }

await sharp(iconSvg).resize(512, 512).png(pngOpts).toFile(join(root, 'public/icon-512.png'))
await sharp(iconSvg).resize(192, 192).png(pngOpts).toFile(join(root, 'public/icon-192.png'))
await sharp(iconSvg).resize(512, 512).png(pngOpts).toFile(join(root, 'public/icon-maskable-512.png'))
await sharp(iconSvg).resize(256, 256).png(pngOpts).toFile(join(root, 'public/logo.png'))
await sharp(iconSvg).resize(256, 256).png(pngOpts).toFile(join(root, 'public/brand/logo-icon.png'))

await sharp(fullSvg).resize(880, 226).png(pngOpts).toFile(join(root, 'public/brand/logo-full.png'))

console.log('Logos PNG gerados: icon-192, icon-512, icon-maskable-512, logo.png, brand/logo-icon.png, brand/logo-full.png')
