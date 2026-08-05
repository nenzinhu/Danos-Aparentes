// Renderiza a 1ª página do PDF de exemplo e gera um WebP leve para o blog.
// Uso: node scripts/render-pdf.mjs
import { pdf } from 'pdf-to-img'
import sharp from 'sharp'
import { resolve } from 'node:path'

const src = resolve('public/exemplos/modelo-relatorio-vistoria-veicular.pdf')
const outWebp = resolve('public/exemplos/modelo-relatorio.webp')

const doc = await pdf(src, { scale: 2.5 })
for await (const page of doc) {
  const info = await sharp(page).resize({ width: 900 }).webp({ quality: 82 }).toFile(outWebp)
  console.log('escrito:', outWebp, `${info.width}x${info.height}`, `${Math.round(info.size / 1024)}KB`)
  break // apenas a primeira página
}
