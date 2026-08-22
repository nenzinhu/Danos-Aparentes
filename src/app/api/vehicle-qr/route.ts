import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/src/lib/server/auth'
import { createVehicleQrToken } from '@/src/lib/server/vehicleQr'

export const runtime = 'nodejs'

function errorJson(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

export async function POST(req: NextRequest) {
  const ctx = await getUserFromRequest(req)
  if (!ctx?.id) {
    return errorJson('Não autenticado', 401)
  }

  let body: { plate?: string }
  try {
    body = await req.json()
  } catch {
    return errorJson('Corpo inválido', 400)
  }

  const plate = (body.plate || '').trim()
  if (!plate) {
    return errorJson('Placa obrigatória', 400)
  }

  const token = createVehicleQrToken(plate)
  return NextResponse.json({ token })
}
