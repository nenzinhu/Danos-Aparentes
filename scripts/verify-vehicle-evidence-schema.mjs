/**
 * Pós-migration: verifica schema + garante GRANT Data API nas tabelas novas.
 * Uso: node scripts/verify-vehicle-evidence-schema.mjs
 */
import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

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
const projectRef =
  env.SUPABASE_PROJECT_REF ||
  (env.NEXT_PUBLIC_SUPABASE_URL || '').match(/^https?:\/\/([a-z0-9]+)\.supabase\.co/i)?.[1]

if (!token || !projectRef) {
  console.error('Precisa de SUPABASE_ACCESS_TOKEN + SUPABASE_PROJECT_REF no .env')
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
  if (!res.ok) throw new Error(`${label}: HTTP ${res.status} — ${text}`)
  console.log(`OK: ${label}`)
  console.log(text)
  return text
}

const verifySql = `
select
  to_regclass('public.vehicles')::text as vehicles,
  to_regclass('public.inspection_comparisons')::text as comparisons,
  to_regclass('public.inspection_comparison_decisions')::text as decisions,
  (select count(*)::int from information_schema.columns
    where table_schema='public' and table_name='vehicle_inspections' and column_name='vehicle_id') as insp_vehicle_id,
  (select count(*)::int from information_schema.columns
    where table_schema='public' and table_name='vehicle_qr_tokens' and column_name='vehicle_id') as qr_vehicle_id,
  (select count(*)::int from public.vehicles) as vehicles_rows,
  (select count(*)::int from public.vehicle_inspections where vehicle_id is not null) as inspections_linked,
  (select count(*)::int from public.vehicle_inspections) as inspections_total;
`

const grantSql = `
grant select, insert, update on public.vehicles to authenticated, service_role;
grant select, insert, update on public.inspection_comparisons to authenticated, service_role;
grant select, insert, update on public.inspection_comparison_decisions to authenticated, service_role;
`

await runQuery(verifySql, 'verify-schema')
await runQuery(grantSql, 'grant-data-api')
console.log('Pronto.')
