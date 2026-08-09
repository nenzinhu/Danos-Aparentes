import { NextRequest, NextResponse } from 'next/server'
import { createVehicleEvent, fetchVehicleEvents } from '@/src/lib/vehicleEvidence/vehicleEvents'
import type { VehicleEventType } from '@/src/lib/vehicleEvidence/types'
import { getAuthzFromRequest } from '@/src/lib/server/rbac'
import { toEventsTenantId } from '@/src/lib/vehicleEvidence/vehicleIdentity'
import { supabaseAdmin } from '@/src/lib/server/supabaseAdmin'

async function assertCanAccessVehicle(
  userId: string,
  tenantId: string | null,
  vehicleId: string,
): Promise<boolean> {
  if (!supabaseAdmin) return false
  const { data: vehicle } = await supabaseAdmin
    .from('vehicles')
    .select('id, user_id, tenant_id')
    .eq('id', vehicleId)
    .maybeSingle()
  if (!vehicle) return false
  if (vehicle.user_id === userId) return true
  if (tenantId && vehicle.tenant_id === tenantId) return true
  return false
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: vehicleId } = await params
  if (!vehicleId) {
    return NextResponse.json({ error: 'vehicleId obrigatorio' }, { status: 400 })
  }

  const authz = await getAuthzFromRequest(request)
  if (!authz) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  if (!(await assertCanAccessVehicle(authz.userId, authz.tenantId, vehicleId))) {
    return NextResponse.json({ error: 'Veículo não encontrado' }, { status: 404 })
  }

  const authHeader = request.headers.get('Authorization')
  const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null

  const events = await fetchVehicleEvents(vehicleId, accessToken)
  return NextResponse.json({ events }, { status: 200 })
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: vehicleId } = await params
  if (!vehicleId) {
    return NextResponse.json({ error: 'vehicleId obrigatorio' }, { status: 400 })
  }

  const authz = await getAuthzFromRequest(request)
  if (!authz) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  if (!(await assertCanAccessVehicle(authz.userId, authz.tenantId, vehicleId))) {
    return NextResponse.json({ error: 'Veículo não encontrado' }, { status: 404 })
  }

  try {
    const body = await request.json()
    const { title, type, description, location, photos } = body

    if (!title || !type) {
      return NextResponse.json(
        { error: 'title e type sao obrigatorios' },
        { status: 400 },
      )
    }

    const tenantId = toEventsTenantId(authz.tenantId, authz.userId)

    const authHeader = request.headers.get('Authorization')
    const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null

    const event = await createVehicleEvent(
      {
        vehicleId,
        tenantId,
        type: type as VehicleEventType,
        title,
        description,
        location,
        photos: Array.isArray(photos) ? photos : [],
      },
      accessToken,
    )

    if (!event) {
      return NextResponse.json({ error: 'Falha ao criar evento' }, { status: 500 })
    }

    return NextResponse.json({ event }, { status: 201 })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erro interno' },
      { status: 500 },
    )
  }
}
