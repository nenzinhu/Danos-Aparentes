import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/src/lib/server/auth'
import { supabaseAdmin } from '@/src/lib/server/supabaseAdmin'
import { resolveFipeQuote } from '@/src/lib/server/plateLookupFipe'

export const runtime = 'nodejs'

function errorJson(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

/**
 * Auto-preenchimento de dados do veículo.
 * 1) Histórico PRÓPRIO do usuário (offline-first, sem dependência externa).
 * 2) Enriquecimento FIPE REAL (tabela de preços) quando há marca/modelo/ano.
 * Placa→marca/modelo/ano completa exige Denatran (pago) — deixado como gancho opcional.
 */
export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req)
  if (!user?.id) {
    return errorJson('Não autenticado', 401)
  }

  const url = new URL(req.url)
  const plate = (url.searchParams.get('plate') || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '')
  if (!plate) {
    return errorJson('Placa obrigatória', 400)
  }

  if (!supabaseAdmin) {
    return errorJson('Serviço indisponível', 503)
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('vehicle_inspections')
      .select('brand, color, city, state, vehicle_type, model, year, fipe')
      .eq('user_id', user.id)
      .ilike('plate', `%${plate}%`)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error || !data) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 })
    }

    const fipeRaw = data.fipe as Record<string, unknown> | null
    let fipe: Record<string, unknown> | null = fipeRaw || null

    // Enriquecimento FIPE real se houver marca/modelo/ano.
    if ((!fipe || !fipe.valor) && data.brand && data.model) {
      const quote = await resolveFipeQuote({
        brand: String(data.brand),
        model: String(data.model),
        year: data.year ? String(data.year) : undefined,
        vehicleType: data.vehicle_type ? String(data.vehicle_type) : undefined,
      })
      if (quote) fipe = quote as unknown as Record<string, unknown>
    }

    const found = {
      brand: (data.brand as string) || '',
      color: (data.color as string) || '',
      city: (data.city as string) || '',
      state: (data.state as string) || '',
      vehicleTypeDesc: (data.vehicle_type as string) || '',
      svgType: (data.vehicle_type as string) || '',
      model: (data.model as string) || '',
      year: (data.year as string) || '',
      fipe,
    }
    return NextResponse.json(found)
  } catch (err) {
    console.error('[plate-lookup]', err)
    return errorJson('Falha na consulta de placa', 500)
  }
}

