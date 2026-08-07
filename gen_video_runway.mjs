import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const env = {}
for (const l of readFileSync(resolve(__dirname, '.env.video'), 'utf8').split(/\r?\n/)) {
  const s = l.trim()
  if (!s || s.startsWith('#')) continue
  const i = s.indexOf('=')
  if (i < 0) continue
  env[s.slice(0, i).trim()] = s.slice(i + 1).trim()
}
const KEY = env.RUNWAY_API_KEY
if (!KEY) { console.error('Sem chave'); process.exit(1) }

const RUNWAY = 'https://api.dev.runwayml.com/v1'

async function submit(prompt, imagePath) {
  const b64 = readFileSync(imagePath).toString('base64')
  const dataUri = `data:image/png;base64,${b64}`
  const body = {
    promptImage: dataUri,
    promptText: prompt,
    model: 'gen4_turbo',
    duration: 5,
    ratio: '1280:720',
  }
  const r = await fetch(`${RUNWAY}/image_to_video`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${KEY}`,
      'Content-Type': 'application/json',
      'X-Runway-Version': '2024-11-06',
    },
    body: JSON.stringify(body),
  })
  const txt = await r.text()
  console.log('submit status:', r.status)
  console.log('submit body:', txt.slice(0, 500))
  if (!r.ok) throw new Error(`submit ${r.status}`)
  return JSON.parse(txt)
}

const prompt = process.argv[2]
const imagePath = process.argv[3]
console.log('PROBE Runway submit...')
const res = await submit(prompt, imagePath)
console.log('TASK:', JSON.stringify(res).slice(0, 400))
