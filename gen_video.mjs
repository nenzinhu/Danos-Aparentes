import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(__dirname, '.env.video')
const txt = readFileSync(envPath, 'utf8')
const env = {}
for (const l of txt.split(/\r?\n/)) {
  const s = l.trim()
  if (!s || s.startsWith('#')) continue
  const i = s.indexOf('=')
  if (i < 0) continue
  env[s.slice(0, i).trim()] = s.slice(i + 1).trim()
}
const KEY = env.RUNWAY_API_KEY // chave Fal AI (formato UUID:hex)
if (!KEY) { console.error('Sem chave'); process.exit(1) }

// Modelo: Luma Dream Machine (image-to-video, aceita image_url base64) via fila
const MODEL = 'fal-ai/luma-dream-machine'
const QUEUE = 'https://queue.fal.run'

async function submit(prompt, imagePath) {
  const b64 = readFileSync(imagePath).toString('base64')
  const dataUri = `data:image/png;base64,${b64}`
  const body = {
    prompt,
    image_url: dataUri,
    aspect_ratio: '16:9',
    duration: '5',
  }
  const r = await fetch(`${QUEUE}/${MODEL}`, {
    method: 'POST',
    headers: { Authorization: `Key ${KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!r.ok) {
    const t = await r.text()
    throw new Error(`submit ${r.status}: ${t.slice(0, 500)}`)
  }
  const j = await r.json()
  return j.request_id
}

async function status(reqId) {
  const r = await fetch(`${QUEUE}/${MODEL}/requests/${reqId}/status`, {
    headers: { Authorization: `Key ${KEY}` },
  })
  return r.json()
}

async function result(reqId) {
  const r = await fetch(`${QUEUE}/${MODEL}/requests/${reqId}`, {
    headers: { Authorization: `Key ${KEY}` },
  })
  return r.json()
}

const prompt = process.argv[2]
const imagePath = process.argv[3]
const outPath = process.argv[4]

console.log('submitting (queue)...')
const reqId = await submit(prompt, imagePath)
console.log('request_id:', reqId)
for (let i = 0; i < 70; i++) {
  await new Promise(r => setTimeout(r, 10000))
  const st = await status(reqId)
  console.log(`status ${i}:`, st.status)
  if (st.status === 'COMPLETED') break
  if (st.status === 'FAILED') { console.error('FAILED', st); process.exit(1) }
}
const res = await result(reqId)
console.log('RESULT:', JSON.stringify(res).slice(0, 600))
const url = res?.video?.url || res?.output?.[0]?.url || (Array.isArray(res?.output) ? res.output[0] : null) || res?.url
if (url) {
  const v = await fetch(url)
  const buf = Buffer.from(await v.arrayBuffer())
  writeFileSync(outPath, buf)
  console.log('VIDEO SALVO:', outPath, buf.length, 'bytes')
} else {
  console.log('Sem URL de video no resultado; salve manualmente.')
}
