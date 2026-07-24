import fs from 'fs'
import { createClient } from '@supabase/supabase-js'

const email = process.argv[2]
if (!email) {
  console.error('Usage: node scripts/grant-lifetime-access.mjs <email>')
  process.exit(1)
}

for (const file of ['.env', '.env.local']) {
  if (!fs.existsSync(file)) continue
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq)
    let value = trimmed.slice(eq + 1)
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (!process.env[key]) process.env[key] = value
  }
}

const url = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error('Missing VITE_SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const admin = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
})

let user = null
let page = 1

while (!user) {
  const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 })
  if (error) {
    console.error('listUsers error:', error.message)
    process.exit(1)
  }
  user = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase()) ?? null
  if (!user && data.users.length < 200) break
  page += 1
}

if (!user) {
  console.error('User not found:', email)
  process.exit(1)
}

const lifetime = new Date('2099-12-31T23:59:59.000Z').toISOString()
const { data: sub, error: subErr } = await admin
  .from('subscriptions')
  .upsert(
    {
      user_id: user.id,
      status: 'active',
      trial_ends_at: lifetime,
      current_period_end: lifetime,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  )
  .select()
  .single()

if (subErr) {
  console.error('subscription upsert error:', subErr.message)
  process.exit(1)
}

console.log(
  JSON.stringify(
    { ok: true, email: user.email, user_id: user.id, subscription: sub },
    null,
    2,
  ),
)
