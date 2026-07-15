import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/src/lib/server/auth'
import { supabaseAdmin } from '@/src/lib/server/supabaseAdmin'
import { isCorporateOwner } from '@/src/lib/server/companyScope'

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const user = await getUserFromRequest(req)
  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Supabase não configurado' }, { status: 500 })
  }
  if (!(await isCorporateOwner(user.id))) {
    return NextResponse.json({ error: 'Recurso disponível apenas no plano Corporativo' }, { status: 403 })
  }

  const { id } = await context.params
  if (!id) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  }

  const { data: company } = await supabaseAdmin
    .from('companies')
    .select('id')
    .eq('owner_id', user.id)
    .maybeSingle()

  if (!company) {
    return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })
  }

  const { data, error } = await supabaseAdmin
    .from('company_api_keys')
    .update({ revoked_at: new Date().toISOString() })
    .eq('id', id)
    .eq('company_id', company.id)
    .is('revoked_at', null)
    .select('id')
    .maybeSingle()

  if (error) {
    console.error('[company-api-keys] revoke:', error)
    return NextResponse.json({ error: 'Falha ao revogar chave' }, { status: 500 })
  }
  if (!data) {
    return NextResponse.json({ error: 'Chave não encontrada' }, { status: 404 })
  }

  return NextResponse.json({ ok: true })
}
