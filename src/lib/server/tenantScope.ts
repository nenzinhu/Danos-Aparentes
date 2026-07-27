import { supabaseAdmin } from './supabaseAdmin'
import { resolveTenantContext, type TenantContext } from '../tenant/resolveTenant'

export async function resolveTenantContextForUser(userId: string): Promise<TenantContext> {
  if (!supabaseAdmin) return { tenantId: null, role: 'solo' }
  return resolveTenantContext(userId, supabaseAdmin)
}

/** ponytail: service-role reads are not filtered by tenant_id yet — callers must pass tenantId explicitly. */
export function tenantMatchesRow(
  ctx: TenantContext,
  rowTenantId: string | null | undefined,
): boolean {
  if (!ctx.tenantId) return true
  if (!rowTenantId) return false
  return ctx.tenantId === rowTenantId
}
