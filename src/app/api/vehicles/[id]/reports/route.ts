import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/src/lib/server/supabaseAdmin'
import { getAuthzFromRequest } from '@/src/lib/server/rbac'
import { resolveReadableUserIds } from '@/src/lib/server/vehicleScope'
import { mapRemoteInspection } from '@/src/lib/reportMapping'

/**
 * FASE 23 — laudos completos de um veículo (próprio + equipe quando permitido).
 * GET /api/vehicles/[id]/reports
 */
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const authz = await getAuthzFromRequest(req)
  if (!authz) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Supabase não configurado' }, { status: 500 })
  }

  const { id: vehicleId } = await ctx.params
  if (!vehicleId || vehicleId.startsWith('local:')) {
    return NextResponse.json({ reports: [] })
  }

  try {
    const readable = await resolveReadableUserIds(authz)

    const { data: vehicle, error: vErr } = await supabaseAdmin
      .from('vehicles')
      .select('id, plate, brand, color, vehicle_type, user_id, tenant_id')
      .eq('id', vehicleId)
      .maybeSingle()

    if (vErr) throw vErr
    if (!vehicle) {
      return NextResponse.json({ error: 'Veículo não encontrado' }, { status: 404 })
    }

    const ownerOk = readable.includes(String(vehicle.user_id))
    const tenantOk =
      Boolean(vehicle.tenant_id) &&
      Boolean(authz.tenantId) &&
      String(vehicle.tenant_id) === authz.tenantId &&
      (authz.role === 'owner' || authz.role === 'inspector')

    if (!ownerOk && !tenantOk) {
      return NextResponse.json({ error: 'Veículo não encontrado' }, { status: 404 })
    }

    let inspQuery = supabaseAdmin
      .from('vehicle_inspections')
      .select('*')
      .eq('vehicle_id', vehicleId)
      .in('user_id', readable)
      .order('updated_at', { ascending: false })
      .limit(50)

    if (vehicle.tenant_id && authz.tenantId && String(vehicle.tenant_id) === authz.tenantId && authz.role === 'owner') {
      inspQuery = supabaseAdmin
        .from('vehicle_inspections')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .eq('tenant_id', authz.tenantId)
        .order('updated_at', { ascending: false })
        .limit(50)
    }

    const { data: inspections, error: iErr } = await inspQuery
    if (iErr) throw iErr

    const rows = (inspections ?? []) as Record<string, unknown>[]
    if (rows.length === 0) {
      return NextResponse.json({ vehicle, reports: [] })
    }

    const ids = rows.map((r) => String(r.id))
    const ownerIds = [...new Set(rows.map((r) => String(r.user_id)))]
    const { data: damages, error: dErr } = await supabaseAdmin
      .from('damages')
      .select('*')
      .in('user_id', ownerIds)
      .in('inspection_id', ids)
    if (dErr) throw dErr

    const damageRows = (damages ?? []) as Record<string, unknown>[]
    const reports = rows.map((insp) => mapRemoteInspection(insp, damageRows))

    return NextResponse.json({ vehicle, reports })
  } catch (err) {
    console.error('GET /api/vehicles/[id]/reports', err)
    return NextResponse.json({ error: 'Falha ao carregar laudos' }, { status: 500 })
  }
}
