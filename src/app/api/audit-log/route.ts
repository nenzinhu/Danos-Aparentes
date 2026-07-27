import { NextRequest, NextResponse } from 'next/server'
import { AUDIT_EVENT_TYPES } from '@/src/lib/audit/auditLog'
import {
  clampAuditDashboardLimit,
  clampAuditDashboardOffset,
} from '@/src/lib/audit/dashboardQuery'
import { requirePermission } from '@/src/lib/server/rbac'
import { supabaseAdmin } from '@/src/lib/server/supabaseAdmin'

export async function GET(req: NextRequest) {
  const authz = await requirePermission(req, 'view_audit_dashboard')
  if (authz instanceof NextResponse) return authz

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Supabase não configurado' }, { status: 500 })
  }

  const params = req.nextUrl.searchParams
  const inspectionId = (params.get('inspection_id') || '').trim() || undefined
  const eventType = (params.get('event_type') || '').trim() || undefined
  const limit = clampAuditDashboardLimit(Number(params.get('limit')))
  const offset = clampAuditDashboardOffset(Number(params.get('offset')))

  if (eventType && !/^[a-z][a-z0-9_]{0,63}$/.test(eventType)) {
    return NextResponse.json({ error: 'Tipo de evento inválido' }, { status: 400 })
  }

  try {
    let q = supabaseAdmin.from('audit_log').select('*', { count: 'exact' })

    if (authz.role === 'owner' && authz.tenantId) {
      q = q.eq('tenant_id', authz.tenantId)
    } else {
      q = q.eq('user_id', authz.userId)
    }

    if (inspectionId) q = q.eq('inspection_id', inspectionId)
    if (eventType) q = q.eq('event_type', eventType)

    const { data, error, count } = await q
      .order('timestamp', { ascending: false })
      .order('event_id', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return NextResponse.json({
      events: data ?? [],
      total: count ?? (data?.length ?? 0),
      limit,
      offset,
      eventTypes: AUDIT_EVENT_TYPES,
    })
  } catch (err) {
    console.error('audit-log list:', err)
    return NextResponse.json(
      { error: 'Erro ao carregar trilha de auditoria' },
      { status: 500 },
    )
  }
}
