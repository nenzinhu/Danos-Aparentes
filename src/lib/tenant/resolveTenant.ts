/**
 * FASE 12 — tenant_id maps to companies.id (corporativo workspace).
 * Solo users without a company return null tenant_id.
 */

import type { AppRole } from '../auth/rbac'
import { supabase } from '../supabase'

export type TenantContext = {
  tenantId: string | null
  role: AppRole
}

const cache = new Map<string, TenantContext>()

export function clearTenantContextCache(userId?: string): void {
  if (userId) cache.delete(userId)
  else cache.clear()
}

/** Resolve tenant + role for the authenticated user (client or server supabase client). */
export async function resolveTenantContext(
  userId: string,
  client: NonNullable<typeof supabase> = supabase!,
): Promise<TenantContext> {
  const hit = cache.get(userId)
  if (hit) return hit

  const { data: owned } = await client
    .from('companies')
    .select('id')
    .eq('owner_id', userId)
    .maybeSingle()

  if (owned?.id) {
    const ctx: TenantContext = { tenantId: owned.id as string, role: 'owner' }
    cache.set(userId, ctx)
    return ctx
  }

  const { data: membership } = await client
    .from('team_members')
    .select('company_id')
    .eq('user_id', userId)
    .eq('status', 'accepted')
    .maybeSingle()

  if (membership?.company_id) {
    const ctx: TenantContext = {
      tenantId: membership.company_id as string,
      role: 'inspector',
    }
    cache.set(userId, ctx)
    return ctx
  }

  const ctx: TenantContext = { tenantId: null, role: 'solo' }
  cache.set(userId, ctx)
  return ctx
}

export async function resolveTenantId(userId: string): Promise<string | null> {
  if (!supabase) return null
  const { tenantId } = await resolveTenantContext(userId, supabase)
  return tenantId
}
