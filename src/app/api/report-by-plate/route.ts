import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/src/lib/server/auth'
import { supabaseAdmin } from '@/src/lib/server/supabaseAdmin'

export const runtime = 'nodejs'

function errorJson(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

interface StoredDamage {
  partId?: string
  type?: string
}

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
      .select('damages, updated_at')
      .eq('user_id', user.id)
      .ilike('plate', `%${plate}%`)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error || !data) {
      return NextResponse.json({ found: false })
    }

    const rawDamages = (data.damages as StoredDamage[] | null) || []
    const damages = rawDamages
      .filter((d) => d && d.partId)
      .map((d) => ({ partId: d.partId as string, type: (d.type as string) || 'scratch' }))

    return NextResponse.json({
      found: true,
      updatedAt: data.updated_at || null,
      damages,
    })
  } catch (err) {
    console.error('[report-by-plate]', err)
    return errorJson('Falha na busca de laudo anterior', 500)
  }
}
