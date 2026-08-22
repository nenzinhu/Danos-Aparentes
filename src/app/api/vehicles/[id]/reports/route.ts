import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/src/lib/server/auth'
import { supabaseAdmin } from '@/src/lib/server/supabaseAdmin'

export const runtime = 'nodejs'

function errorJson(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromRequest(_req)
  if (!user?.id) return errorJson('Não autenticado', 401)
  if (!supabaseAdmin) return errorJson('Serviço indisponível', 503)

  const { id } = await params
  const { data, error } = await supabaseAdmin
    .from('vehicle_inspections')
    .select('*')
    .eq('vehicle_id', id)
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('[vehicles:id:reports]', error)
    return errorJson('Falha ao carregar relatórios', 500)
  }
  return NextResponse.json({ reports: data || [] })
}
