import { supabaseAdmin } from './supabaseAdmin'

export type CompanyScope = {
  companyId: string
  ownerId: string
  scopeUserIds: string[]
}

export async function isCorporateOwner(userId: string): Promise<boolean> {
  if (!supabaseAdmin) return false
  const { data } = await supabaseAdmin
    .from('subscriptions')
    .select('status, trial_ends_at, plan_tier')
    .eq('user_id', userId)
    .maybeSingle()

  if (!data || data.plan_tier !== 'corporativo') return false
  const trialActive = new Date(data.trial_ends_at as string).getTime() > Date.now()
  return data.status === 'active' || (data.status === 'trialing' && trialActive)
}

/** Garante que o usuário é dono de uma empresa Corporativa; cria a empresa se ainda não existir. */
export async function ensureOwnedCompany(
  ownerId: string,
  name = '',
): Promise<{ id: string } | null> {
  if (!supabaseAdmin) return null

  const { data: existing } = await supabaseAdmin
    .from('companies')
    .select('id')
    .eq('owner_id', ownerId)
    .maybeSingle()

  if (existing?.id) return { id: existing.id as string }

  const { data: created, error } = await supabaseAdmin
    .from('companies')
    .insert({ owner_id: ownerId, name })
    .select('id')
    .single()

  if (error || !created) return null
  return { id: created.id as string }
}

export async function resolveCompanyScope(companyId: string): Promise<CompanyScope | null> {
  if (!supabaseAdmin) return null

  const { data: company } = await supabaseAdmin
    .from('companies')
    .select('id, owner_id')
    .eq('id', companyId)
    .maybeSingle()

  if (!company) return null

  const ownerId = company.owner_id as string
  const { data: members } = await supabaseAdmin
    .from('team_members')
    .select('user_id, status')
    .eq('company_id', companyId)

  const teamIds = (members ?? [])
    .filter(m => m.status === 'accepted' && m.user_id)
    .map(m => m.user_id as string)

  return {
    companyId,
    ownerId,
    scopeUserIds: Array.from(new Set([ownerId, ...teamIds])),
  }
}
