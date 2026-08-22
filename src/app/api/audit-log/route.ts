import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/src/lib/server/auth'
import { supabaseAdmin } from '@/src/lib/server/supabaseAdmin'

export const runtime = 'nodejs'

function errorJson(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

export async function GET(req: NextRequest) {
  const ctx = await getUserFromRequest(req)
  if (!ctx?.id) {
    return errorJson('Não autenticado', 401)
  }

  const url = new URL(req.url)
  const limit = Math.min(Number(url.searchParams.get('limit') || 50), 200)
  const inspectionId = url.searchParams.get('inspection_id')?.trim() || undefined
  const eventType = url.searchParams.get('event_type')?.trim() || undefined

  if (!supabaseAdmin) {
    return errorJson('Serviço de auditoria indisponível', 503)
  }

  try {
    let query = supabaseAdmin
      .from('audit_log')
      .select('*')
      .eq('user_id', ctx.id)
      .order('timestamp', { ascending: false })
      .limit(limit)

    if (inspectionId) query = query.eq('inspection_id', inspectionId)
    if (eventType) query = query.eq('event_type', eventType)

    const { data, error } = await query
    if (error) {
      console.error('[audit-log]', error)
      return errorJson('Falha ao carregar auditoria', 500)
    }

    const rows = (data || []).map((r) => ({
      event_id: r.event_id,
      inspection_id: r.inspection_id,
      tenant_id: r.tenant_id,
      user_id: r.user_id,
      actor_id: r.actor_id,
      actor_type: r.actor_type,
      event_type: r.event_type,
      timestamp: r.timestamp,
      ip: r.ip,
      metadata: r.metadata,
      event_hash: r.event_hash,
      previous_event_hash: r.previous_event_hash,
    }))

    const eventTypes = Array.from(new Set(rows.map((r) => r.event_type).filter(Boolean)))

    return NextResponse.json({ events: rows, eventTypes })
  } catch (err) {
    console.error('[audit-log] unexpected', err)
    return errorJson('Falha ao carregar auditoria', 500)
  }
}
