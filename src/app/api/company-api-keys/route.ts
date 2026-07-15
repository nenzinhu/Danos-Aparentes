import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/src/lib/server/auth'
import { supabaseAdmin } from '@/src/lib/server/supabaseAdmin'
import { generateApiKey } from '@/src/lib/server/apiKeys'
import { ensureOwnedCompany, isCorporateOwner } from '@/src/lib/server/companyScope'

export async function GET(req: NextRequest) {
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

  const { data: company } = await supabaseAdmin
    .from('companies')
    .select('id')
    .eq('owner_id', user.id)
    .maybeSingle()

  if (!company) {
    return NextResponse.json({ keys: [] })
  }

  const { data, error } = await supabaseAdmin
    .from('company_api_keys')
    .select('id, name, key_prefix, created_at, last_used_at, revoked_at')
    .eq('company_id', company.id)
    .is('revoked_at', null)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[company-api-keys] list:', error)
    return NextResponse.json({ error: 'Falha ao listar chaves' }, { status: 500 })
  }

  return NextResponse.json({
    keys: (data ?? []).map(k => ({
      id: k.id,
      name: k.name,
      prefix: k.key_prefix,
      created_at: k.created_at,
      last_used_at: k.last_used_at,
    })),
  })
}

export async function POST(req: NextRequest) {
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

  const body = await req.json().catch(() => ({}))
  const name = String(body.name || 'Integração ERP').trim().slice(0, 80) || 'Integração ERP'

  const company = await ensureOwnedCompany(user.id)
  if (!company) {
    return NextResponse.json({ error: 'Não foi possível criar/localizar a empresa' }, { status: 500 })
  }

  const { data: existing } = await supabaseAdmin
    .from('company_api_keys')
    .select('id')
    .eq('company_id', company.id)
    .is('revoked_at', null)

  if ((existing ?? []).length >= 5) {
    return NextResponse.json({ error: 'Limite de 5 chaves ativas por empresa' }, { status: 400 })
  }

  const { rawKey, prefix, hash } = generateApiKey()

  const { data: created, error } = await supabaseAdmin
    .from('company_api_keys')
    .insert({
      company_id: company.id,
      name,
      key_prefix: prefix,
      key_hash: hash,
      created_by: user.id,
    })
    .select('id, name, key_prefix, created_at')
    .single()

  if (error || !created) {
    console.error('[company-api-keys] create:', error)
    return NextResponse.json({ error: 'Falha ao criar chave' }, { status: 500 })
  }

  // A chave em texto claro só aparece nesta resposta.
  return NextResponse.json({
    id: created.id,
    name: created.name,
    prefix: created.key_prefix,
    created_at: created.created_at,
    api_key: rawKey,
    warning: 'Guarde esta chave agora. Ela não será exibida novamente.',
  })
}
