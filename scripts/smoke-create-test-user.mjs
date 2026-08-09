/**
 * Smoke: cria usuário temporário, veículo de teste, imprime email/senha.
 * Uso: node scripts/smoke-create-test-user.mjs
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { randomBytes } from 'node:crypto'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
function loadEnv(path) {
  if (!existsSync(path)) return {}
  const env = {}
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const eq = t.indexOf('=')
    if (eq === -1) continue
    env[t.slice(0, eq).trim()] = t.slice(eq + 1).trim()
  }
  return env
}

const env = { ...loadEnv(resolve(root, '.env')), ...process.env }
const url = env.NEXT_PUBLIC_SUPABASE_URL
const service = env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !service) {
  console.error('Falta URL/service role no .env')
  process.exit(1)
}

const admin = createClient(url, service, { auth: { autoRefreshToken: false, persistSession: false } })
const email = `smoke.ve.${Date.now()}@danosaparentes.local`
const password = `Smk!${randomBytes(9).toString('base64url')}`

const { data: created, error: createErr } = await admin.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
})
if (createErr) {
  console.error('createUser', createErr.message)
  process.exit(1)
}
const userId = created.user.id
const vehicleId = crypto.randomUUID()

const { error: vErr } = await admin.from('vehicles').insert({
  id: vehicleId,
  user_id: userId,
  plate: 'ABC1D23',
  brand: 'Smoke',
  color: 'prata',
  vehicle_type: 'car',
})
if (vErr) {
  console.error('insert vehicle', vErr.message)
  process.exit(1)
}

console.log(JSON.stringify({ email, password, userId, vehicleId }, null, 2))
