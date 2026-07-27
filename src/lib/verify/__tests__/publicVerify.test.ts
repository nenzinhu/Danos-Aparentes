import { describe, expect, it } from 'vitest'
import {
  isPublicCodeQuery,
  maskCpfInText,
  maskPlate,
  normalizePublicCode,
  presentVerifyOutcome,
  resolveVerifyOutcome,
} from '../publicVerify'

describe('resolveVerifyOutcome', () => {
  it('maps founder-plan statuses', () => {
    expect(resolveVerifyOutcome({ found: false })).toBe('not_found')
    expect(resolveVerifyOutcome({ found: true, integrityMismatch: true })).toBe(
      'integrity_not_confirmed',
    )
    expect(resolveVerifyOutcome({ found: true, inspectionStatus: 'cancelled' })).toBe('cancelled')
    expect(resolveVerifyOutcome({ found: true, isSupersededVersion: true })).toBe(
      'superseded_version',
    )
    expect(resolveVerifyOutcome({ found: true })).toBe('integrity_confirmed')
  })

  it('presents uppercase titles without legal claims', () => {
    const p = presentVerifyOutcome('integrity_confirmed')
    expect(p.title).toBe('INTEGRIDADE CONFIRMADA')
    expect(p.description.toLowerCase()).not.toMatch(/validade jurídica garantida/)
  })
})

describe('public code + masking', () => {
  it('normalizes and detects DA public codes', () => {
    expect(normalizePublicCode(' da-2026-abcdef ')).toBe('DA-2026-ABCDEF')
    expect(isPublicCodeQuery('DA-2026-A1B2C3')).toBe(true)
    expect(isPublicCodeQuery('DA-2026-A1B2C3-R1')).toBe(true)
    expect(isPublicCodeQuery('EEA9011EA43BCD2177DBB4F6CA639B87')).toBe(false)
  })

  it('masks CPF and plate for public surfaces', () => {
    expect(maskCpfInText('CPF 123.456.789-00 ok')).toBe('CPF ***.***.***-00 ok')
    expect(maskPlate('ABC1D23')).toBe('ABC***3')
  })
})
