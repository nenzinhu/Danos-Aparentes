import { NextResponse } from 'next/server'
import { validateApiKeyHeader } from '@/src/lib/server/apiKeyAuth'
import { supabaseAdmin } from '@/src/lib/server/supabaseAdmin'

function requireScope(scopes: string[], needed: 'read' | 'write'): boolean {
  return scopes.includes(needed)
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

  let query = supabaseAdmin
    .from('vehicles')
    .select('*')
    .eq('tenant_id', apiCtx.companyId)
    .order('updated_at', { ascending: false })

  if (plate) {
    const normalized = String(plate).toUpperCase().replace(/[^A-Z0-9]/g, '')
    query = query.eq('plate', normalized)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ vehicles: data || [] }, { status: 200 })
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

    if (!plate) {
      return NextResponse.json({ error: 'plate é obrigatório' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('vehicles')
      .upsert(
        {
          tenant_id: apiCtx.companyId,
          plate: String(plate).toUpperCase().replace(/[^A-Z0-9]/g, ''),
          vin: vin || null,
          brand: brand || null,
          model: model || null,
          year: year ? Number(year) : null,
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
