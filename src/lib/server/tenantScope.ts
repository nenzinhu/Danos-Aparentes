import { supabaseAdmin } from './supabaseAdmin'
import { resolveTenantContext, type TenantContext } from '../tenant/resolveTenant'

export async function resolveTenantContextForUser(userId: string): Promise<TenantContext> {
  if (!supabaseAdmin) return { tenantId: null, role: 'solo' }
  return resolveTenantContext(userId, supabaseAdmin)
}

/**
 * Isolamento de linhas tenant-scoped:
 * - corp: tenant_id da linha deve bater com o contexto
 * - solo: exige userId e tenant_id null na linha
 */
export function tenantMatchesRow(
  ctx: TenantContext,
  row: { tenant_id?: string | null; user_id?: string | null },
  userId?: string,
): boolean {
  if (ctx.tenantId) {
    return row.tenant_id === ctx.tenantId
  }
  if (!userId) return false
  return row.user_id === userId && (row.tenant_id == null || row.tenant_id === '')
}
