import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/src/lib/server/auth'
import { supabaseAdmin } from '@/src/lib/server/supabaseAdmin'

export const runtime = 'nodejs'

function errorJson(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req)
  if (!user?.id) {
    return errorJson('Não autenticado', 401)
  }
  if (!supabaseAdmin) {
    return errorJson('Serviço indisponível', 503)
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('vehicles')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('[vehicles]', error)
      return errorJson('Falha ao carregar veículos', 500)
    }

    // Conta inspeções por veículo (best-effort).
    const ids = (data || []).map((v) => v.id)
    let counts: Record<string, number> = {}
    if (ids.length) {
      const { data: insp } = await supabaseAdmin
        .from('vehicle_inspections')
        .select('vehicle_id')
        .in('vehicle_id', ids)
      counts = (insp || []).reduce<Record<string, number>>((acc, r) => {
        acc[r.vehicle_id] = (acc[r.vehicle_id] || 0) + 1
        return acc
      }, {})
    }

    const vehicles = (data || []).map((v) => ({ ...v, reportCount: counts[v.id] || 0 }))
    return NextResponse.json({ vehicles, reports: [] })
  } catch (err) {
    console.error('[vehicles]', err)
    return errorJson('Falha ao carregar veículos', 500)
  }
}

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req)
  if (!user?.id) {
    return errorJson('Não autenticado', 401)
  }
  if (!supabaseAdmin) {
    return errorJson('Serviço indisponível', 503)
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return errorJson('Corpo inválido', 400)
  }

  const plate = String(body.plate || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '')
  if (!plate) {
    return errorJson('Placa obrigatória', 400)
  }

  const row = {
    id: crypto.randomUUID(),
    user_id: user.id,
    plate,
    vin: body.vin ? String(body.vin) : null,
    vehicle_type: body.vehicle_type ? String(body.vehicle_type) : '',
    brand: body.brand ? String(body.brand) : '',
    model: body.model ? String(body.model) : '',
    year: typeof body.year === 'number' ? body.year : null,
    color: body.color ? String(body.color) : '',
    updated_at: new Date().toISOString(),
  }

  try {
    const { data, error } = await supabaseAdmin.from('vehicles').insert(row).select('*').single()
    if (error) {
      console.error('[vehicles] insert', error)
      return errorJson('Falha ao criar veículo', 500)
    }
    return NextResponse.json({ vehicle: data })
  } catch (err) {
    console.error('[vehicles]', err)
    return errorJson('Falha ao criar veículo', 500)
  }
}
