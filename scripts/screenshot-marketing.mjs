// Gera screenshots de marketing (hero da landing page, posts do blog, etc.) via Playwright.
// Uso:
//   node scripts/screenshot-marketing.mjs <url-ou-path> [saida.png] [--width=1440] [--height=900] [--full]
// Exemplos:
//   node scripts/screenshot-marketing.mjs /                     -> public/screenshots/home.png
//   node scripts/screenshot-marketing.mjs /blog/meu-post out.png --full
//
// Requer o servidor de dev rodando (npm run dev) e a dependência "playwright" instalada.
import { chromium } from 'playwright'
import { resolve, dirname } from 'node:path'
import { mkdirSync } from 'node:fs'

const BASE_URL = process.env.SCREENSHOT_BASE_URL || 'http://localhost:3000'

function parseArgs(argv) {
  const args = { width: 1440, height: 900, fullPage: false }
  const positional = []
  for (const raw of argv) {
    if (raw.startsWith('--width=')) args.width = Number(raw.split('=')[1])
    else if (raw.startsWith('--height=')) args.height = Number(raw.split('=')[1])
    else if (raw === '--full') args.fullPage = true
    else positional.push(raw)
  }
  const [pathArg, outArg] = positional
  if (!pathArg) {
    console.error('Uso: node scripts/screenshot-marketing.mjs <url-ou-path> [saida.png] [--width=] [--height=] [--full]')
    process.exit(1)
  }
  args.url = pathArg.startsWith('http') ? pathArg : new URL(pathArg, BASE_URL).toString()
  const slug = pathArg.replace(/^\/+|\/+$/g, '').replace(/\//g, '-') || 'home'
  args.out = resolve(outArg || `public/screenshots/${slug}.png`)
  return args
}

const { url, out, width, height, fullPage } = parseArgs(process.argv.slice(2))

mkdirSync(dirname(out), { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({
  viewport: { width, height },
  deviceScaleFactor: 2, // HiDPI/retina, padrão para screenshots de marketing
})

await page.goto(url, { waitUntil: 'networkidle' })
await page.screenshot({ path: out, fullPage })
await browser.close()

console.log(`Screenshot salvo em: ${out} (${width}x${height} @2x, fullPage=${fullPage})`)
