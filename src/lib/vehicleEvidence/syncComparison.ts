/**
 * Sync de comparações derivadas → Supabase (FASE 11).
 * FASE 18 — hidratação local a partir da nuvem.
 * Best-effort / fail-open — nunca bloqueia a vistoria.
 */

import { supabase, supabaseEnabled } from '../supabase'
import type { ComparisonDecision, ComparisonItem, ComparisonResult, ComparisonReviewDecision } from './types'
import {
  getStoredComparison,
  type StoredComparisonReview,
  upsertStoredComparison,
} from './comparisonReview'
import { resolveTenantId } from '../tenant/resolveTenant'

function itemsForStorage(result: ComparisonResult): unknown[] {
  return result.items.map((item: ComparisonItem) => ({
    category: item.category,
    identityKey: item.identityKey,
    message: item.message,
    previousSeverity: item.previousSeverity ?? null,
    currentSeverity: item.currentSeverity ?? null,
    previousPart: item.previous?.partName ?? null,
    currentPart: item.current?.partName ?? null,
    previousType: item.previous?.typeName ?? null,
    currentType: item.current?.typeName ?? null,
  }))
}

export async function syncComparisonToCloud(input: {
  stored: StoredComparisonReview
  result?: ComparisonResult
  userId: string
}): Promise<void> {
  if (!supabaseEnabled || !supabase) return
  try {
    const tenantId = await resolveTenantId(input.userId)
    const { error } = await supabase.from('inspection_comparisons').upsert({
      id: input.stored.comparisonId,
      user_id: input.userId,
      tenant_id: tenantId,
      vehicle_id: input.stored.vehicleId.startsWith('local:') ? null : input.stored.vehicleId,
      previous_inspection_id: input.stored.previousInspectionId,
      current_inspection_id: input.stored.currentInspectionId,
      summary: input.stored.summary,
      items: input.result ? itemsForStorage(input.result) : [],
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' })
    if (error) {
      console.warn('syncComparisonToCloud:', error.message)
      return
    }

    for (const d of input.stored.decisions) {
      const { error: dErr } = await supabase.from('inspection_comparison_decisions').upsert({
        comparison_id: input.stored.comparisonId,
        identity_key: d.itemIdentityKey,
        decision: d.decision,
        user_id: d.userId,
        justification: d.justification ?? null,
        decided_at: d.timestamp,
      }, { onConflict: 'comparison_id,identity_key' })
      if (dErr) console.warn('syncComparisonDecision:', dErr.message)
    }
  } catch (e) {
    console.warn('syncComparisonToCloud failed', e)
  }
}

/**
 * FASE 18 — busca comparação + decisões na nuvem e mescla no storage local.
 * Não sobrescreve decisões locais mais recentes para a mesma identity_key.
 */
export async function hydrateComparisonFromCloud(input: {
  comparisonId: string
  vehicleId: string
  previousInspectionId: string
  currentInspectionId: string
  tenantId: string
}): Promise<StoredComparisonReview | null> {
  if (!supabaseEnabled || !supabase) return getStoredComparison(input.comparisonId)
  try {
    const { data: row, error } = await supabase
      .from('inspection_comparisons')
      .select('id, vehicle_id, previous_inspection_id, current_inspection_id, summary, created_at')
      .eq('id', input.comparisonId)
      .maybeSingle()

    if (error || !row) {
      return getStoredComparison(input.comparisonId)
    }

    const { data: decisionsRows } = await supabase
      .from('inspection_comparison_decisions')
      .select('identity_key, decision, user_id, justification, decided_at')
      .eq('comparison_id', input.comparisonId)

    const local = getStoredComparison(input.comparisonId)
    const remoteDecisions: ComparisonReviewDecision[] = (decisionsRows ?? []).map((d) => ({
      comparisonId: input.comparisonId,
      itemIdentityKey: String(d.identity_key),
      decision: d.decision as ComparisonDecision,
      userId: String(d.user_id),
      timestamp: String(d.decided_at || new Date().toISOString()),
      justification: d.justification ? String(d.justification) : undefined,
    }))

    const byKey = new Map<string, ComparisonReviewDecision>()
    for (const d of remoteDecisions) byKey.set(d.itemIdentityKey, d)
    for (const d of local?.decisions ?? []) {
      const existing = byKey.get(d.itemIdentityKey)
      if (!existing || Date.parse(d.timestamp) >= Date.parse(existing.timestamp)) {
        byKey.set(d.itemIdentityKey, d)
      }
    }

    const summary =
      (row.summary as StoredComparisonReview['summary'] | null) ??
      local?.summary ?? {
        unchanged: 0,
        newDamages: 0,
        removedOrRepaired: 0,
        severityChanged: 0,
        uncertain: 0,
      }

    const merged: StoredComparisonReview = {
      comparisonId: input.comparisonId,
      vehicleId: String(row.vehicle_id || input.vehicleId),
      previousInspectionId: String(row.previous_inspection_id || input.previousInspectionId),
      currentInspectionId: String(row.current_inspection_id || input.currentInspectionId),
      tenantId: local?.tenantId ?? input.tenantId,
      createdAt: String(row.created_at || local?.createdAt || new Date().toISOString()),
      summary,
      decisions: [...byKey.values()],
    }

    upsertStoredComparison(merged)
    return merged
  } catch (e) {
    console.warn('hydrateComparisonFromCloud failed', e)
    return getStoredComparison(input.comparisonId)
  }
}
