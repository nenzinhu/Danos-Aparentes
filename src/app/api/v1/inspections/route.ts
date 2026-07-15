import { NextRequest, NextResponse } from 'next/server'
import { authenticateApiKey } from '@/src/lib/server/apiKeys'
import { getClientIp } from '@/src/lib/server/auth'
import { checkRateLimit } from '@/src/lib/server/rateLimit'
import { supabaseAdmin } from '@/src/lib/server/supabaseAdmin'
import {
  filterByPlate,
  mapOutboundInspection,
  sortByUpdatedDesc,
} from '@/src/lib/server/outboundInspections'

const MAX_LIMIT = 100
const DEFAULT_LIMIT = 20

/**
 * API de saída — lista laudos da empresa (plano Corporativo).
 *
 * Auth: `Authorization: Bearer da_live_...` ou header `X-API-Key`.
 * Query: plate, updated_since (ISO), limit (1–100), offset, include_damages=true|false
 */
export async function GET(req: NextRequest) {
  const auth = await authenticateApiKey(req)
  if (!auth) {
    return NextResponse.json({ error: 'Chave de API inválida ou ausente' }, { status: 401 })
  }

  const ip = getClientIp(req)
  const rl = checkRateLimit(`outbound-api:${auth.keyId}:${ip}`, 120, 60_000)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Limite de requisições excedido' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfterSec) } },
    )
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Serviço indisponível' }, { status: 500 })
  }

  const sp = req.nextUrl.searchParams
  const plate = sp.get('plate') || ''
  const updatedSince = sp.get('updated_since') || ''
  const includeDamages = sp.get('include_damages') !== 'false'
  const limit = Math.min(MAX_LIMIT, Math.max(1, Number(sp.get('limit')) || DEFAULT_LIMIT))
  const offset = Math.max(0, Number(sp.get('offset')) || 0)

  let sinceMs = 0
  if (updatedSince) {
    const parsed = Date.parse(updatedSince)
    if (Number.isNaN(parsed)) {
      return NextResponse.json({ error: 'updated_since inválido (use ISO-8601)' }, { status: 400 })
    }
    sinceMs = parsed
  }

  try {
    const { data: inspections, error: inspError } = await supabaseAdmin
      .from('vehicle_inspections')
      .select('*')
      .in('user_id', auth.scopeUserIds)
    if (inspError) throw inspError

    let rows = sortByUpdatedDesc((inspections ?? []) as Record<string, unknown>[])
    if (plate) rows = filterByPlate(rows, plate)
    if (sinceMs) rows = rows.filter(r => Number(r.updated_at || 0) >= sinceMs)

    const total = rows.length
    const page = rows.slice(offset, offset + limit)

    let damages: Record<string, unknown>[] = []
    if (includeDamages && page.length > 0) {
      const ids = page.map(r => String(r.id))
      const { data: dmgRows, error: dmgError } = await supabaseAdmin
        .from('damages')
        .select('*')
        .in('inspection_id', ids)
      if (dmgError) throw dmgError
      damages = (dmgRows ?? []) as Record<string, unknown>[]
    }

    const data = page.map(insp =>
      mapOutboundInspection(insp, damages, { includeDamages }),
    )

    return NextResponse.json({
      data,
      meta: { total, limit, offset, has_more: offset + limit < total },
    })
  } catch (err) {
    console.error('[v1/inspections] list:', err)
    return NextResponse.json({ error: 'Erro ao listar laudos' }, { status: 500 })
  }
}
