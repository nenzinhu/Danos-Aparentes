import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/src/lib/server/supabaseAdmin'
import { getAuthzFromRequest } from '@/src/lib/server/rbac'
import { resolveReadableUserIds } from '@/src/lib/server/vehicleScope'
import { normalizePlate } from '@/src/lib/reportComparison'

/** Lista veículos do usuário e, se corporativo, da equipe (tenant). */
export async function GET(req: NextRequest) {
  const authz = await getAuthzFromRequest(req)
  if (!authz) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }
  if (!supabaseAdmin) {
    return NextResponse.json({ vehicles: [] })
  }

  try {
    const q = req.nextUrl.searchParams.get('q')?.trim() || ''
    const readable = await resolveReadableUserIds(authz)

    const { data, error } = await supabaseAdmin
      .from('vehicles')
      .select('id, plate, brand, model, color, vehicle_type, vin, tenant_id, user_id, updated_at, created_at')
      .in('user_id', readable)
      .order('updated_at', { ascending: false })
      .limit(200)

    if (error) {
      console.warn('GET /api/vehicles:', error.message)
      return NextResponse.json({ vehicles: [] })
    }

    let vehicles = data ?? []

    if (authz.tenantId && authz.role === 'owner') {
      const { data: tenantVehicles } = await supabaseAdmin
        .from('vehicles')
        .select('id, plate, brand, model, color, vehicle_type, vin, tenant_id, user_id, updated_at, created_at')
        .eq('tenant_id', authz.tenantId)
        .order('updated_at', { ascending: false })
        .limit(200)
      if (tenantVehicles?.length) {
        const byId = new Map(vehicles.map((v) => [v.id, v]))
        for (const v of tenantVehicles) byId.set(v.id, v)
        vehicles = [...byId.values()]
      }
    }

    if (q) {
      const nq = normalizePlate(q)
      vehicles = vehicles.filter((v) => {
        const plate = normalizePlate(String(v.plate || ''))
        const brand = String(v.brand || '').toLowerCase()
        return plate.includes(nq) || brand.includes(q.toLowerCase())
      })
    }

    return NextResponse.json({ vehicles })
  } catch (err) {
    console.error('GET /api/vehicles', err)
    return NextResponse.json({ vehicles: [] })
  }
}
