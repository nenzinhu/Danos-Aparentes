/**
 * FASE 5 — AI decision trail: immutable original suggestion + human decision.
 * HUMAN picks the part; AI assists classification only.
 */

import { createId } from './id'
import { appendAuditEvent } from './audit/auditLog'
import { supabase, supabaseEnabled } from './supabase'
import type { DamageType, Severity } from '../types'

export type HumanDecisionKind = 'accept' | 'edit' | 'ignore'

/** Frozen AI suggestion (never mutated after classify). */
export type AiOriginalSuggestion = {
  type: DamageType
  severity: Severity
  description: string
  confidence?: number | null
  model: string
  modelVersion: string
  analyzedAt: string
  /** Full original API/model result — immutable snapshot. */
  rawPayload: Record<string, unknown>
}

export type HumanDecisionInput = {
  kind: HumanDecisionKind
  /** Required for accept/edit when overriding; ignored for ignore. */
  type?: DamageType
  severity?: Severity
  description?: string
  decidedBy: string
  decidedAt?: string
}

/** Columns safe to UPDATE after insert — never includes original fields. */
export type AiDecisionHumanPatch = {
  human_decision: HumanDecisionKind
  human_type: string | null
  human_severity: string | null
  human_description: string | null
  final_type: string | null
  final_severity: string | null
  final_description: string | null
  decided_by: string
  decided_at: string
}

export type ApplyHumanDecisionResult = {
  /** Same logical original — deep-cloned so callers cannot mutate input via result. */
  original: AiOriginalSuggestion
  patch: AiDecisionHumanPatch
}

function cloneOriginal(original: AiOriginalSuggestion): AiOriginalSuggestion {
  return {
    type: original.type,
    severity: original.severity,
    description: original.description,
    confidence: original.confidence ?? null,
    model: original.model,
    modelVersion: original.modelVersion,
    analyzedAt: original.analyzedAt,
    rawPayload: { ...original.rawPayload },
  }
}

/**
 * Pure: derive human/final patch from an immutable original.
 * Never mutates `original`. Example: AI Grave → human Médio → final Médio;
 * returned `original` still has Grave.
 */
export function applyHumanDecision(
  original: AiOriginalSuggestion,
  decision: HumanDecisionInput,
): ApplyHumanDecisionResult {
  const frozen = cloneOriginal(original)
  const decidedAt = decision.decidedAt || new Date().toISOString()

  if (decision.kind === 'ignore') {
    return {
      original: frozen,
      patch: {
        human_decision: 'ignore',
        human_type: null,
        human_severity: null,
        human_description: null,
        final_type: null,
        final_severity: null,
        final_description: null,
        decided_by: decision.decidedBy,
        decided_at: decidedAt,
      },
    }
  }

  const type = decision.type ?? frozen.type
  const severity = decision.severity ?? frozen.severity
  const description = decision.description ?? frozen.description

  return {
    original: frozen,
    patch: {
      human_decision: decision.kind,
      human_type: type,
      human_severity: severity,
      human_description: description,
      final_type: type,
      final_severity: severity,
      final_description: description,
      decided_by: decision.decidedBy,
      decided_at: decidedAt,
    },
  }
}

/** Assert helper: original suggestion fields must be unchanged after apply. */
export function originalUnchanged(
  before: AiOriginalSuggestion,
  after: AiOriginalSuggestion,
): boolean {
  return (
    before.type === after.type &&
    before.severity === after.severity &&
    before.description === after.description &&
    (before.confidence ?? null) === (after.confidence ?? null) &&
    before.model === after.model &&
    before.modelVersion === after.modelVersion &&
    before.analyzedAt === after.analyzedAt &&
    JSON.stringify(before.rawPayload) === JSON.stringify(after.rawPayload)
  )
}

export type AppendAiDecisionArgs = {
  partName: string
  suggestion: AiOriginalSuggestion
  inspectionId?: string | null
  damageId?: string | null
  /** Emit audit_log ai_analysis (default true). */
  audit?: boolean
}

export type AiDecisionRow = {
  id: string
  user_id: string
  inspection_id: string | null
  damage_id: string | null
  part_name: string | null
  model: string
  model_version: string
  analyzed_at: string
  suggested_type: string
  suggested_severity: string
  suggested_description: string
  confidence: number | null
  original_payload: Record<string, unknown>
  human_decision: HumanDecisionKind | null
  human_type: string | null
  human_severity: string | null
  human_description: string | null
  final_type: string | null
  final_severity: string | null
  final_description: string | null
  decided_by: string | null
  decided_at: string | null
}

/**
 * Insert trail row on classify done. Best-effort; returns null offline / no session.
 * Never writes human/final fields.
 */
export async function appendAiDecision(
  args: AppendAiDecisionArgs,
): Promise<AiDecisionRow | null> {
  if (!supabaseEnabled || !supabase) return null
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return null

    const id = createId()
    const s = args.suggestion
    const row = {
      id,
      user_id: session.user.id,
      inspection_id: args.inspectionId ?? null,
      damage_id: args.damageId ?? null,
      part_name: args.partName,
      model: s.model,
      model_version: s.modelVersion,
      analyzed_at: s.analyzedAt,
      suggested_type: s.type,
      suggested_severity: s.severity,
      suggested_description: s.description,
      confidence: s.confidence ?? null,
      original_payload: s.rawPayload,
      human_decision: null,
      human_type: null,
      human_severity: null,
      human_description: null,
      final_type: null,
      final_severity: null,
      final_description: null,
      decided_by: null,
      decided_at: null,
    }

    const { error } = await supabase.from('ai_decisions').insert(row)
    if (error) return null

    if (args.audit !== false) {
      void appendAuditEvent({
        event_type: 'ai_analysis',
        inspection_id: args.inspectionId ?? null,
        metadata: {
          ai_decision_id: id,
          part_name: args.partName,
          type: s.type,
          severity: s.severity,
          model: s.model,
          model_version: s.modelVersion,
          source: 'damage_classify',
        },
      })
    }

    return row as AiDecisionRow
  } catch {
    return null
  }
}

export type RecordHumanDecisionArgs = {
  decisionId: string
  original: AiOriginalSuggestion
  decision: HumanDecisionInput
  inspectionId?: string | null
  partName?: string
  /** Emit audit_log human_decision (default true). */
  audit?: boolean
}

/**
 * Update ONLY human/final/decided fields. Never sends original_payload.
 */
export async function recordHumanDecision(
  args: RecordHumanDecisionArgs,
): Promise<AiDecisionHumanPatch | null> {
  const { original, patch } = applyHumanDecision(args.original, args.decision)

  if (!supabaseEnabled || !supabase) return patch
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return patch

    const { error } = await supabase
      .from('ai_decisions')
      .update(patch)
      .eq('id', args.decisionId)
      .eq('user_id', session.user.id)

    if (error) return null

    if (args.audit !== false) {
      void appendAuditEvent({
        event_type: 'human_decision',
        inspection_id: args.inspectionId ?? null,
        metadata: {
          ai_decision_id: args.decisionId,
          part_name: args.partName ?? null,
          human_decision: patch.human_decision,
          final_type: patch.final_type,
          final_severity: patch.final_severity,
          ai_original_severity: original.severity,
          source: 'damage_float',
        },
      })
    }

    return patch
  } catch {
    return null
  }
}
