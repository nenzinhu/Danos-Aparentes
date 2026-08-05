/**
 * Gestão de API keys — apenas owner autenticado do plano Corporativo.
 * companyId/userId NUNCA vêm do client (anti-spoof).
 */
import { NextRequest, NextResponse } from 'next/server'
import { generateApiKey } from '@/src/lib/server/apiKeyAuth'
import { getUserFromRequest } from '@/src/lib/server/auth'
import { resolveTenantContextForUser } from '@/src/lib/server/tenantScope'
import { supabaseAdmin } from '@/src/lib/server/supabaseAdmin'
import { hasActiveSubscriptionAccess } from '@/src/lib/subscriptionAccess'

const ALLOWED_SCOPES = new Set(['read', 'write'])

async function isCorporate(userId: string): Promise<boolean> {
  if (!supabaseAdmin) return false
  const { data } = await supabaseAdmin
    .from('subscriptions')
    .select('status, trial_ends_at, expires_at, plan_tier')
    .eq('user_id', userId)
    .maybeSingle()
  if (!data || data.plan_tier !== 'corporativo') return false
  return hasActiveSubscriptionAccess({
    status: data.status as string,
    trialEndsAt: data.trial_ends_at as string | null,
    expiresAt: data.expires_at as string | null,
  })
}

async function requireApiKeyManager(req: NextRequest): Promise<
  | { userId: string; companyId: string }
  | NextResponse
> {
  const user = await getUserFromRequest(req)
  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Supabase não configurado' }, { status: 500 })
  }

  if (!(await isCorporate(user.id))) {
    return NextResponse.json(
      { error: 'Recurso disponível apenas no plano Corporativo' },
      { status: 403 },
    )
  }

  const { role, tenantId } = await resolveTenantContextForUser(user.id)
  if (role !== 'owner' || !tenantId) {
    return NextResponse.json(
      { error: 'Apenas o gestor da empresa pode gerenciar API keys' },
      { status: 403 },
    )
  }

  const { data: company } = await supabaseAdmin
    .from('companies')
    .select('id')
    .eq('owner_id', user.id)
    .eq('id', tenantId)
    .maybeSingle()

  if (!company?.id) {
    return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 403 })
  }

  return { userId: user.id, companyId: company.id as string }
}

function normalizeScopes(raw: unknown): string[] {
  if (!Array.isArray(raw)) return ['read', 'write']
  const scopes = raw
    .filter((s): s is string => typeof s === 'string')
    .map((s) => s.trim().toLowerCase())
    .filter((s) => ALLOWED_SCOPES.has(s))
  return scopes.length > 0 ? [...new Set(scopes)] : ['read', 'write']
}

export async function GET(req: NextRequest) {
  const authz = await requireApiKeyManager(req)
  if (authz instanceof NextResponse) return authz

  const { data, error } = await supabaseAdmin!
    .from('api_keys')
    .select('id, name, prefix, scopes, created_at, revoked_at, last_used_at')
    .eq('company_id', authz.companyId)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ apiKeys: data || [] }, { status: 200 })
}

export async function POST(req: NextRequest) {
  const authz = await requireApiKeyManager(req)
  if (authz instanceof NextResponse) return authz

  try {
    const body = await req.json().catch(() => ({}))
    const name = typeof body?.name === 'string' ? body.name.trim() : ''
    if (!name || name.length > 80) {
      return NextResponse.json({ error: 'name é obrigatório (máx. 80)' }, { status: 400 })
    }

    const { rawKey, keyHash, prefix } = generateApiKey()
    const scopes = normalizeScopes(body?.scopes)

    const { data, error } = await supabaseAdmin!
      .from('api_keys')
      .insert({
        company_id: authz.companyId,
        user_id: authz.userId,
        name,
        key_hash: keyHash,
        prefix,
        scopes,
      })
      .select('id, name, prefix, scopes, created_at')
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: error?.message || 'Falha ao criar chave' },
        { status: 500 },
      )
    }

    return NextResponse.json(
      {
        apiKey: data,
        secretKey: rawKey, // Exibida apenas UMA vez
      },
      { status: 201 },
    )
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erro interno' },
      { status: 500 },
    )
  }
}
