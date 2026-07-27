import { NextRequest, NextResponse } from 'next/server'
import { appendAuditEventAdmin } from '@/src/lib/server/auditAppend'
import { checkRateLimit } from '@/src/lib/server/rateLimit'
import { supabaseAdmin } from '@/src/lib/server/supabaseAdmin'

const ALLOWED_OUTCOMES = new Set([
  'integrity_confirmed',
  'integrity_not_confirmed',
  'not_found',
  'cancelled',
  'superseded_version',
])

function clientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('x-real-ip')
    || 'unknown'
  )
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req)
  const rl = await checkRateLimit(`verify-audit:${ip}`, 30, 60_000)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Muitas verificações. Tente novamente em instantes.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfterSec) } },
    )
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ ok: true, skipped: 'no_db' })
  }

  let body: {
    hash?: string
    outcome?: string
    inspection_id?: string
    method?: string
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const hash = (body.hash || '').trim().toUpperCase()
  const outcome = (body.outcome || '').trim()
  const method = (body.method || 'lookup').trim().slice(0, 32)

  if (!hash || hash.length < 8 || hash.length > 64) {
    return NextResponse.json({ error: 'Hash inválido' }, { status: 400 })
  }
  if (!ALLOWED_OUTCOMES.has(outcome)) {
    return NextResponse.json({ error: 'Outcome inválido' }, { status: 400 })
  }

  try {
    let userId: string | null = null
    let tenantId: string | null = null
    let inspectionId = (body.inspection_id || '').trim() || null

    const { data: rec } = await supabaseAdmin
      .from('report_hashes')
      .select('user_id, tenant_id, inspection_id')
      .eq('hash', hash)
      .maybeSingle()

    if (rec) {
      userId = (rec.user_id as string) || null
      tenantId = (rec.tenant_id as string) || null
      if (!inspectionId && rec.inspection_id) {
        inspectionId = rec.inspection_id as string
      }
    }

    if (!userId) {
      return NextResponse.json({ ok: true, skipped: 'no_owner' })
    }

    const idempotencyKey = `verify:${hash}:${outcome}:${method}`
    const row = await appendAuditEventAdmin({
      user_id: userId,
      tenant_id: tenantId,
      inspection_id: inspectionId,
      event_type: 'verification',
      actor_type: 'service',
      actor_id: 'public-verify',
      idempotency_key: idempotencyKey,
      metadata: {
        hash: hash.slice(0, 16),
        outcome,
        method,
        ip,
      },
    })

    return NextResponse.json({ ok: true, logged: Boolean(row) })
  } catch (err) {
    console.error('verify-audit:', err)
    return NextResponse.json({ ok: true, skipped: 'error' })
  }
}
