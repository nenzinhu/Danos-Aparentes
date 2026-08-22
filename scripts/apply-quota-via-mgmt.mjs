/**
 * Aplica 20260724_starter_plan_quota.sql via Management API.
 * Uso: SUPABASE_ACCESS_TOKEN=sbp_… SUPABASE_PROJECT_REF=… node scripts/apply-quota-via-mgmt.mjs
 */
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const token = (process.env.SUPABASE_ACCESS_TOKEN || '').trim()
const projectRef = (process.env.SUPABASE_PROJECT_REF || 'zlgrydekoqcqyzvzbocn').trim()

if (!token.startsWith('sbp_')) {
  console.error('Defina SUPABASE_ACCESS_TOKEN (token sbp_…).')
  process.exit(1)
}

async function runSql(query, label) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  })
  const text = await res.text()
  let body
  try {
    body = JSON.parse(text)
  } catch {
    body = text
  }
  if (!res.ok) {
    const msg = typeof body === 'object' ? JSON.stringify(body) : String(body)
    throw new Error(`${label}: HTTP ${res.status} ${msg}`)
  }
  console.log(`✓ ${label}`)
  return body
}

// ALTER TYPE ADD VALUE precisa commit próprio antes de usar o enum em outros stmts.
const steps = [
  {
    label: "ADD VALUE 'starter' ao plan_tier",
    query: `ALTER TYPE public.plan_tier ADD VALUE IF NOT EXISTS 'starter';`,
  },
  {
    label: 'Colunas de cota em subscriptions',
    query: `
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS laudos_used INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS laudos_period_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS pending_plan_tier TEXT;
`,
  },
  {
    label: 'Função consume_laudo_quota',
    query: readFileSync(
      resolve(__dirname, '..', 'src', 'supabase', 'migrations', '20260724_starter_plan_quota.sql'),
      'utf8',
    )
      // Já aplicamos o ALTER TYPE no passo 1 — evita reexecutar no mesmo lote.
      .replace(/ALTER TYPE public\.plan_tier ADD VALUE IF NOT EXISTS 'starter';\s*/i, '')
      .replace(/ALTER TABLE public\.subscriptions[\s\S]*?pending_plan_tier TEXT;\s*/i, ''),
  },
]

try {
  console.log(`Projeto: ${projectRef}`)
  for (const step of steps) {
    await runSql(step.query, step.label)
  }
  const cols = await runSql(
    `select column_name from information_schema.columns
     where table_schema='public' and table_name='subscriptions'
       and column_name in ('pending_plan_tier','laudos_used','laudos_period_start')
     order by 1`,
    'Verificar colunas',
  )
  const fn = await runSql(
    `select proname from pg_proc p
     join pg_namespace n on n.oid=p.pronamespace
     where n.nspname='public' and proname='consume_laudo_quota'`,
    'Verificar função',
  )
  const colNames = Array.isArray(cols) ? cols.map((r) => r.column_name).join(', ') : cols
  const fnNames = Array.isArray(fn) ? fn.map((r) => r.proname).join(', ') : fn
  console.log('Colunas:', colNames)
  console.log('Função:', fnNames)
  console.log('✅ Migration aplicada.')
} catch (err) {
  console.error('❌', err.message || err)
  process.exit(1)
}
