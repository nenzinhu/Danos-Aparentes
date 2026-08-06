import { describe, expect, it } from 'vitest'
import {
  buildSeveritySummary,
  DEFAULT_NEW_DISCLOSURE_SCOPE,
  fieldsForDisclosureScope,
  LEGACY_DISCLOSURE_SCOPE,
  normalizeDisclosureScope,
  parseSeveritySummary,
} from '../disclosureScope'

describe('normalizeDisclosureScope', () => {
  it('defaults new issues to authenticity and legacy to summary', () => {
    expect(DEFAULT_NEW_DISCLOSURE_SCOPE).toBe('authenticity')
    expect(LEGACY_DISCLOSURE_SCOPE).toBe('summary')
    expect(normalizeDisclosureScope(null, { forNewIssue: true })).toBe('authenticity')
    expect(normalizeDisclosureScope(undefined)).toBe('summary')
    expect(normalizeDisclosureScope('')).toBe('summary')
  })

  it('accepts long names and a/b/c aliases', () => {
    expect(normalizeDisclosureScope('authenticity')).toBe('authenticity')
    expect(normalizeDisclosureScope('A')).toBe('authenticity')
    expect(normalizeDisclosureScope('summary')).toBe('summary')
    expect(normalizeDisclosureScope('b')).toBe('summary')
    expect(normalizeDisclosureScope('full')).toBe('full')
    expect(normalizeDisclosureScope('C')).toBe('full')
  })
})

describe('fieldsForDisclosureScope', () => {
  it('hides damages and geo on authenticity', () => {
    const f = fieldsForDisclosureScope('authenticity')
    expect(f.showPlate).toBe(true)
    expect(f.showDamagesCount).toBe(false)
    expect(f.showSeverityBreakdown).toBe(false)
    expect(f.showRef).toBe(false)
    expect(f.showGeo).toBe(false)
    expect(f.showReliability).toBe(true)
  })

  it('shows severity on summary but not geo', () => {
    const f = fieldsForDisclosureScope('summary')
    expect(f.showDamagesCount).toBe(true)
    expect(f.showSeverityBreakdown).toBe(true)
    expect(f.showRef).toBe(true)
    expect(f.showGeo).toBe(false)
  })

  it('shows geo only on full', () => {
    expect(fieldsForDisclosureScope('full').showGeo).toBe(true)
  })
})

describe('severity summary', () => {
  it('counts severities', () => {
    expect(
      buildSeveritySummary([
        { severity: 'low' },
        { severity: 'low' },
        { severity: 'medium' },
        { severity: 'high' },
        { severity: 'other' },
      ]),
    ).toEqual({ low: 2, medium: 1, high: 1 })
  })

  it('parses jsonb-like objects', () => {
    expect(parseSeveritySummary({ low: 1, medium: 0, high: 2 })).toEqual({
      low: 1,
      medium: 0,
      high: 2,
    })
    expect(parseSeveritySummary(null)).toBeNull()
  })
})
