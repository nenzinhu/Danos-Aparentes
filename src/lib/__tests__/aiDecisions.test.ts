/**
 * Pure helpers for FASE 5 AI decision trail.
 * applyHumanDecision must never mutate the original suggestion.
 */
import { describe, expect, it } from 'vitest'
import {
  applyHumanDecision,
  originalUnchanged,
  type AiOriginalSuggestion,
} from '../aiDecisions'

const originalGrave: AiOriginalSuggestion = {
  type: 'broken',
  severity: 'high',
  description: 'Quebra estrutural na peça',
  confidence: 0.82,
  model: 'qwen/qwen3.6-27b',
  modelVersion: 'qwen/qwen3.6-27b',
  analyzedAt: '2026-07-27T12:00:00.000Z',
  rawPayload: {
    type: 'broken',
    severity: 'high',
    description: 'Quebra estrutural na peça',
    model: 'qwen/qwen3.6-27b',
  },
}

describe('applyHumanDecision', () => {
  it('accept: final equals AI original; original stays frozen', () => {
    const before = structuredClone(originalGrave)
    const { original, patch } = applyHumanDecision(originalGrave, {
      kind: 'accept',
      decidedBy: 'user-1',
      decidedAt: '2026-07-27T12:01:00.000Z',
    })

    expect(patch.human_decision).toBe('accept')
    expect(patch.final_severity).toBe('high')
    expect(patch.final_type).toBe('broken')
    expect(patch.final_description).toBe('Quebra estrutural na peça')
    expect(patch.decided_by).toBe('user-1')
    expect(original.severity).toBe('high')
    expect(originalUnchanged(before, original)).toBe(true)
    expect(originalUnchanged(before, originalGrave)).toBe(true)
  })

  it('edit: AI Grave → human Médio → final Médio; original remains Grave', () => {
    const before = structuredClone(originalGrave)
    const { original, patch } = applyHumanDecision(originalGrave, {
      kind: 'edit',
      type: 'dent',
      severity: 'medium',
      description: 'Amassado moderado — ajustado pelo vistoriador',
      decidedBy: 'user-2',
      decidedAt: '2026-07-27T12:02:00.000Z',
    })

    expect(patch.human_decision).toBe('edit')
    expect(patch.human_severity).toBe('medium')
    expect(patch.final_severity).toBe('medium')
    expect(patch.final_type).toBe('dent')
    expect(patch.final_description).toBe('Amassado moderado — ajustado pelo vistoriador')
    // Immutable original
    expect(original.severity).toBe('high')
    expect(original.type).toBe('broken')
    expect(original.description).toBe('Quebra estrutural na peça')
    expect(original.rawPayload.severity).toBe('high')
    expect(originalUnchanged(before, original)).toBe(true)
    // Input object must not be mutated
    expect(originalGrave.severity).toBe('high')
    expect(originalGrave.rawPayload.severity).toBe('high')
  })

  it('ignore: clears final; original unchanged', () => {
    const before = structuredClone(originalGrave)
    const { original, patch } = applyHumanDecision(originalGrave, {
      kind: 'ignore',
      decidedBy: 'user-3',
      decidedAt: '2026-07-27T12:03:00.000Z',
    })

    expect(patch.human_decision).toBe('ignore')
    expect(patch.final_type).toBeNull()
    expect(patch.final_severity).toBeNull()
    expect(patch.final_description).toBeNull()
    expect(patch.human_type).toBeNull()
    expect(originalUnchanged(before, original)).toBe(true)
  })

  it('does not mutate original.rawPayload via returned clone', () => {
    const { original } = applyHumanDecision(originalGrave, {
      kind: 'edit',
      severity: 'low',
      decidedBy: 'user-4',
    })
    original.rawPayload.severity = 'tampered'
    expect(originalGrave.rawPayload.severity).toBe('high')
  })
})
