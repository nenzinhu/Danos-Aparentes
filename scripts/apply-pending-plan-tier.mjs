#!/usr/bin/env node
/**
 * Aplica só a migration do pending_plan_tier / quota Starter.
 * Uso: npx vercel env run -e production -- node scripts/apply-pending-plan-tier.mjs
 */
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'

const __dirname = dirname(fileURLToPath(import.meta.url))
const sqlPath = resolve(__dirname, '..', 'src', 'supabase', 'migrations', '20260724_starter_plan_quota.sql')

const conn =
  (process.env.POSTGRES_URL_NON_POOLING ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL ||
    process.env.SUPABASE_DB_URL ||
    '').trim()

if (!conn || conn.length < 20 || /SENSITIVE|@encrypted/i.test(conn)) {
  console.error('❌ Connection string Postgres ausente (rode via vercel env run -e production).')
  process.exit(1)
}

const sql = readFileSync(sqlPath, 'utf8')
const client = new pg.Client({
  connectionString: conn,
  ssl: { rejectUnauthorized: false },
})

try {
  await client.connect()
  console.log('Conectado. Aplicando 20260724_starter_plan_quota.sql…')
  await client.query(sql)
  const check = await client.query(`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'subscriptions'
      AND column_name IN ('pending_plan_tier', 'laudos_used', 'laudos_period_start')
    ORDER BY column_name
  `)
  console.log('Colunas OK:', check.rows.map((r) => r.column_name).join(', '))
  console.log('✅ Migration aplicada.')
} catch (err) {
  console.error('❌', err.message || err)
  process.exit(1)
} finally {
  await client.end().catch(() => {})
}
