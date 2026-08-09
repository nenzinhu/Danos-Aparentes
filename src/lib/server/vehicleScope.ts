/**
 * Helpers de escopo tenant para APIs de veículos (FASE 23).
 */

import type { AppRole } from '@/src/lib/auth/rbac'
import { supabaseAdmin } from '@/src/lib/server/supabaseAdmin'

/** user_ids cujo histórico o solicitante pode ler (próprio + equipe se owner). */
export async function resolveReadableUserIds(input: {
  userId: string
  tenantId: string | null
  role: AppRole
}): Promise<string[]> {
  const ids = new Set<string>([input.userId])
  if (!supabaseAdmin || !input.tenantId) return [...ids]

  if (input.role === 'owner') {
    const { data: members } = await supabaseAdmin
      .from('team_members')
      .select('user_id, status')
      .eq('company_id', input.tenantId)
    for (const m of members ?? []) {
      if (m.status === 'accepted' && m.user_id) ids.add(String(m.user_id))
    }
    const { data: company } = await supabaseAdmin
      .from('companies')
      .select('owner_id')
      .eq('id', input.tenantId)
      .maybeSingle()
    if (company?.owner_id) ids.add(String(company.owner_id))
  }

  return [...ids]
}
