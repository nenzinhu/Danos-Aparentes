import { NextResponse } from 'next/server'
import { validateApiKeyHeader } from '@/src/lib/server/apiKeyAuth'
import { supabaseAdmin } from '@/src/lib/server/supabaseAdmin'

function requireScope(scopes: string[], needed: 'read' | 'write'): boolean {
  return scopes.includes(needed)
}

/**
 * Colunas expostas na API pública. Lista explícita (nunca `*`) para que
 * colunas internas — `user_id`, `tenant_id` — e qualquer coluna futura não
 * vazem sozinhas para integradores.
 */
const PUBLIC_VEHICLE_COLUMNS =
  'id, plate, vin, vehicle_type, brand, model, year, color, created_at, updated_at'

const DEFAULT_PAGE_SIZE = 50
const MAX_PAGE_SIZE = 200

function parsePositiveInt(raw: string | null, fallback: number): number {
  if (raw === null) return fallback
  const n = Number(raw)
  if (!Number.isInteger(n) || n < 1) return fallback
  return n
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('Authorization')
  const apiCtx = await validateApiKeyHeader(authHeader)

  if (!apiCtx) {
    return NextResponse.json(
      { error: 'Chave de API inválida ou ausente (Bearer da_live_...)' },
      { status: 401 },
    )
  }

  if (!requireScope(apiCtx.scopes, 'read')) {
    return NextResponse.json({ error: 'Escopo read necessário' }, { status: 403 })
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ vehicles: [] }, { status: 200 })
  }

  if (!apiCtx.companyId) {
    return NextResponse.json(
      { error: 'Chave sem empresa associada' },
      { status: 403 },
    )
  }

  const { searchParams } = new URL(request.url)
  const plate = searchParams.get('plate')

  const page = parsePositiveInt(searchParams.get('page'), 1)
  const pageSize = Math.min(
    parsePositiveInt(searchParams.get('pageSize'), DEFAULT_PAGE_SIZE),
    MAX_PAGE_SIZE,
  )
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabaseAdmin
    .from('vehicles')
    .select(PUBLIC_VEHICLE_COLUMNS, { count: 'exact' })
    .eq('tenant_id', apiCtx.companyId)
    .order('updated_at', { ascending: false })

  if (plate) {
    const normalized = String(plate).toUpperCase().replace(/[^A-Z0-9]/g, '')
    query = query.eq('plate', normalized)
  }

  const { data, error, count } = await query.range(from, to)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const totalItems = count ?? 0

  return NextResponse.json(
    {
      vehicles: data || [],
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages: Math.ceil(totalItems / pageSize),
      },
    },
    { status: 200 },
  )
}

export async function POST(request: Request) {
  const authHeader = request.headers.get('Authorization')
  const apiCtx = await validateApiKeyHeader(authHeader)

  if (!apiCtx) {
    return NextResponse.json(
      { error: 'Chave de API inválida ou ausente (Bearer da_live_...)' },
      { status: 401 },
    )
  }

  if (!requireScope(apiCtx.scopes, 'write')) {
    return NextResponse.json({ error: 'Escopo write necessário' }, { status: 403 })
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Supabase não configurado' }, { status: 500 })
  }

  if (!apiCtx.companyId) {
    return NextResponse.json(
      { error: 'Chave sem empresa associada' },
      { status: 403 },
    )
  }

  try {
    const body = await request.json()
    const { plate, vin, brand, model, year, color } = body

    if (typeof plate !== 'string') {
      return NextResponse.json({ error: 'plate é obrigatório' }, { status: 400 })
    }

    const normalizedPlate = plate.toUpperCase().replace(/[^A-Z0-9]/g, '')
    if (!normalizedPlate) {
      return NextResponse.json(
        { error: 'plate é obrigatório (deve conter letras ou números)' },
        { status: 400 },
      )
    }

    let normalizedYear: number | null = null
    if (year !== undefined && year !== null && year !== '') {
      normalizedYear = Number(year)
      if (!Number.isInteger(normalizedYear)) {
        return NextResponse.json(
          { error: 'year deve ser um número inteiro' },
          { status: 400 },
        )
      }
    }

    const { data, error } = await supabaseAdmin
      .from('vehicles')
      .upsert(
        {
          tenant_id: apiCtx.companyId,
          plate: normalizedPlate,
          vin: vin || null,
          brand: brand || null,
          model: model || null,
          year: normalizedYear,
          color: color || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'tenant_id,plate' },
      )
      .select('*')
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: error?.message || 'Falha ao salvar veículo' },
        { status: 500 },
      )
    }

    return NextResponse.json({ vehicle: data }, { status: 201 })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erro interno' },
      { status: 500 },
    )
  }
}
