import { describe, expect, it } from 'vitest'
import { buildReportKey } from '../hash'

describe('buildReportKey', () => {
  it('combines normalized plate + ref into a stable key', () => {
    expect(buildReportKey({ plate: 'abc-1d23', ref: ' os-000123 ' })).toBe('ABC1D23::OS-000123')
  })

  it('is stable across different casing/formatting of the same plate+ref', () => {
    const a = buildReportKey({ plate: 'ABC1D23', ref: 'OS-123' })
    const b = buildReportKey({ plate: 'abc-1d23', ref: 'os-123' })
    expect(a).toBe(b)
  })

  it('returns empty string when both plate and ref are missing (no grouping)', () => {
    expect(buildReportKey({ plate: '', ref: '' })).toBe('')
  })

  it('still produces a key when only ref is present', () => {
    expect(buildReportKey({ plate: '', ref: 'OS-999' })).toBe('::OS-999')
  })

  it('produces different keys for different plates with the same ref', () => {
    const a = buildReportKey({ plate: 'AAA1111', ref: 'OS-1' })
    const b = buildReportKey({ plate: 'BBB2222', ref: 'OS-1' })
    expect(a).not.toBe(b)
  })
})
