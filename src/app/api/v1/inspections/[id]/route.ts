import { NextRequest, NextResponse } from 'next/server'
import { authenticateApiKey } from '@/src/lib/server/apiKeys'
import { getClientIp } from '@/src/lib/server/auth'
import { checkRateLimit } from '@/src/lib/server/rateLimit'
import { supabaseAdmin } from '@/src/lib/server/supabaseAdmin'
import { mapOutboundInspection } from '@/src/lib/server/outboundInspections'

/**
 * API de saída — detalhe de um laudo por id.
 * Auth: `Authorization: Bearer da_live_...` ou `X-API-Key`.
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
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

  const { id } = await context.params
  if (!id) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  }

  try {
    const { data: insp, error: inspError } = await supabaseAdmin
      .from('vehicle_inspections')
      .select('*')
      .eq('id', id)
      .in('user_id', auth.scopeUserIds)
      .maybeSingle()
    if (inspError) throw inspError

    if (!insp) {
      return NextResponse.json({ error: 'Laudo não encontrado' }, { status: 404 })
    }

    const { data: damages, error: dmgError } = await supabaseAdmin
      .from('damages')
      .select('*')
      .eq('inspection_id', id)
    if (dmgError) throw dmgError

    return NextResponse.json({
      data: mapOutboundInspection(
        insp as Record<string, unknown>,
        (damages ?? []) as Record<string, unknown>[],
        { includeDamages: true },
      ),
    })
  } catch (err) {
    console.error('[v1/inspections/:id]:', err)
    return NextResponse.json({ error: 'Erro ao buscar laudo' }, { status: 500 })
  }
}
