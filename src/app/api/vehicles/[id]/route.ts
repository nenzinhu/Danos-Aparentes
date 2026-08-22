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
    .from('vehicles')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (error || !data) return errorJson('Veículo não encontrado', 404)
  return NextResponse.json({ vehicle: data })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromRequest(_req)
  if (!user?.id) return errorJson('Não autenticado', 401)
  if (!supabaseAdmin) return errorJson('Serviço indisponível', 503)

  const { id } = await params
  const { error } = await supabaseAdmin
    .from('vehicles')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('[vehicles] delete', error)
    return errorJson('Falha ao excluir veículo', 500)
  }
  return NextResponse.json({ ok: true })
}
