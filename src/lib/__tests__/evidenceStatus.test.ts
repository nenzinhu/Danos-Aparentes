import { describe, expect, it } from 'vitest'
import {
  deriveEvidenceStatusFromDecision,
  formatEvidenceStatusLabel,
  filterDamagesForPdf,
} from '../evidenceStatus'

describe('deriveEvidenceStatusFromDecision', () => {
  it('returns sugerido when AI suggested and human has not decided', () => {
    expect(deriveEvidenceStatusFromDecision(undefined, true)).toBe('sugerido')
  })

  it('returns confirmado on accept or edit', () => {
    expect(deriveEvidenceStatusFromDecision('accept', true)).toBe('confirmado')
    expect(deriveEvidenceStatusFromDecision('edit', true)).toBe('confirmado')
  })

  it('returns ignorado on ignore', () => {
    expect(deriveEvidenceStatusFromDecision('ignore', true)).toBe('ignorado')
  })

  it('returns undefined when no AI suggestion and no decision', () => {
    expect(deriveEvidenceStatusFromDecision(undefined, false)).toBeUndefined()
  })
})

describe('formatEvidenceStatusLabel', () => {
  it('formats sugerido', () => {
    expect(formatEvidenceStatusLabel('sugerido')).toBe('Sugestão da IA')
  })

  it('formats confirmado with who and date', () => {
    const label = formatEvidenceStatusLabel('confirmado', {
      decidedBy: 'João',
      decidedAt: '2026-08-05T12:00:00.000Z',
    })
    expect(label).toContain('Confirmado')
    expect(label).toContain('João')
    expect(label.length).toBeGreaterThan(10)
  })
})

describe('filterDamagesForPdf', () => {
  it('drops ignorado rows', () => {
    const rows = [
      { id: '1', evidenceStatus: 'sugerido' as const },
      { id: '2', evidenceStatus: 'confirmado' as const },
      { id: '3', evidenceStatus: 'ignorado' as const },
      { id: '4' },
    ]
    expect(filterDamagesForPdf(rows).map((r) => r.id)).toEqual(['1', '2', '4'])
  })
})
