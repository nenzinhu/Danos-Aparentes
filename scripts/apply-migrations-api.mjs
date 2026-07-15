/**
 * Aplica migrations SQL via Management API do Supabase (Personal Access Token).
 * Uso: SUPABASE_ACCESS_TOKEN=sbp_... node scripts/apply-migrations-api.mjs [arquivo.sql...]
 * Sem args: aplica só as migrations 20260715_*.sql
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve, join, basename } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

function loadEnv(path) {
  if (!existsSync(path)) return {}
  const env = {}
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim()
  }
  return env
}

const env = { ...loadEnv(resolve(root, '.env')), ...process.env }
const token = env.SUPABASE_ACCESS_TOKEN
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || env.VITE_SUPABASE_URL || ''
const projectRef =
  env.SUPABASE_PROJECT_REF ||
  supabaseUrl.match(/^https?:\/\/([a-z0-9]+)\.supabase\.co/i)?.[1]

if (!token) {
  console.error('Defina SUPABASE_ACCESS_TOKEN (Personal Access Token sbp_...).')
  process.exit(1)
}
if (!projectRef) {
  console.error('Não achei o project ref. Defina NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_PROJECT_REF.')
  process.exit(1)
}

const migrationsDir = resolve(root, 'src', 'supabase', 'migrations')
const args = process.argv.slice(2)
let files
if (args.length > 0) {
  files = args.map((f) => (f.includes('/') || f.includes('\\') ? f : join(migrationsDir, f)))
} else {
  files = readdirSync(migrationsDir)
    .filter((f) => f.startsWith('20260715_') && f.endsWith('.sql'))
    .sort()
    .map((f) => join(migrationsDir, f))
}

if (files.length === 0) {
  console.error('Nenhuma migration para aplicar.')
  process.exit(1)
}

async function runQuery(sql, label) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  })
  const text = await res.text()
  if (!res.ok) {
    throw new Error(`${label}: HTTP ${res.status} — ${text}`)
  }
  console.log(`OK: ${label}`)
  return text
}

console.log(`Projeto: ${projectRef}`)
console.log(`Migrations: ${files.map((f) => basename(f)).join(', ')}`)

for (const file of files) {
  const sql = readFileSync(file, 'utf8')
  await runQuery(sql, basename(file))
}

// Verificação rápida
const verify = await runQuery(
  `
  select
    (select public from storage.buckets where id = 'damage-photos') as damage_photos_public,
    (select count(*)::int from information_schema.columns
      where table_schema = 'public' and table_name = 'subscriptions' and column_name = 'pix_charge_id') as has_pix_charge_id,
    (select pg_get_constraintdef(oid) from pg_constraint
      where conrelid = 'public.subscriptions'::regclass and conname = 'subscriptions_status_check') as status_check;
  `,
  'verify',
)
console.log('Estado:', verify)
console.log('Migrations aplicadas via Management API.')
