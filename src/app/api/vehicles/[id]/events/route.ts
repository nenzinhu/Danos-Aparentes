import { NextResponse } from 'next/server'
import { createVehicleEvent, fetchVehicleEvents } from '@/src/lib/vehicleEvidence/vehicleEvents'
import type { VehicleEventType } from '@/src/lib/vehicleEvidence/types'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: vehicleId } = await params
  if (!vehicleId) {
    return NextResponse.json({ error: 'vehicleId obrigatorio' }, { status: 400 })
  }

  const authHeader = request.headers.get('Authorization')
  const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null

  const events = await fetchVehicleEvents(vehicleId, accessToken)
  return NextResponse.json({ events }, { status: 200 })
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: vehicleId } = await params
  if (!vehicleId) {
    return NextResponse.json({ error: 'vehicleId obrigatorio' }, { status: 400 })
  }

  try {
    const body = await request.json()
    const { title, type, description, tenantId, location, photos } = body

    if (!title || !type || !tenantId) {
      return NextResponse.json(
        { error: 'title, type e tenantId sao obrigatorios' },
        { status: 400 },
      )
    }

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
