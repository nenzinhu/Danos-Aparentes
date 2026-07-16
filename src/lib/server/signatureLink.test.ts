import { afterEach, describe, expect, it } from 'vitest'
import {
  createSignatureToken,
  isSignaturePayloadTooLarge,
  MAX_SIGNATURE_DATA_URL_CHARS,
  verifySignatureToken,
} from './signatureLink'

describe('signatureLink', () => {
  afterEach(() => {
    delete process.env.SIGNATURE_LINK_SECRET
  })

  it('falha ao criar token sem SIGNATURE_LINK_SECRET', () => {
    expect(() => createSignatureToken('insp-1')).toThrow('SIGNATURE_LINK_SECRET não configurado')
  })

  it('não usa SUPABASE_SERVICE_ROLE_KEY como fallback', () => {
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-only'
    expect(() => createSignatureToken('insp-1')).toThrow('SIGNATURE_LINK_SECRET não configurado')
    expect(verifySignatureToken('a.b.c')).toBeNull()
  })

  it('rejeita SIGNATURE_LINK_SECRET vazio ou só espaços', () => {
    process.env.SIGNATURE_LINK_SECRET = '   '
    expect(() => createSignatureToken('insp-1')).toThrow('SIGNATURE_LINK_SECRET não configurado')
  })

  it('round-trip: cria e valida token', () => {
    process.env.SIGNATURE_LINK_SECRET = 'unit-test-secret'
    const inspectionId = '11111111-2222-3333-4444-555555555555'
    const now = Date.parse('2026-07-15T12:00:00.000Z')
    const { token, expiresAt } = createSignatureToken(inspectionId, { now, ttlMs: 60_000 })
    expect(expiresAt).toBe(now + 60_000)
    expect(verifySignatureToken(token, { now })).toBe(inspectionId)
  })

  it('rejeita token expirado', () => {
    process.env.SIGNATURE_LINK_SECRET = 'unit-test-secret'
    const { token } = createSignatureToken('insp-1', {
      now: Date.parse('2026-07-01T00:00:00.000Z'),
      ttlMs: 1000,
    })
    expect(
      verifySignatureToken(token, { now: Date.parse('2026-07-01T00:00:02.000Z') }),
    ).toBeNull()
  })

  it('rejeita token adulterado', () => {
    process.env.SIGNATURE_LINK_SECRET = 'unit-test-secret'
    const { token } = createSignatureToken('insp-1')
    const parts = token.split('.')
    parts[2] = parts[2].slice(0, -2) + 'xx'
    expect(verifySignatureToken(parts.join('.'))).toBeNull()
  })

  it('detecta payload de assinatura grande demais', () => {
    expect(isSignaturePayloadTooLarge('data:image/png;base64,abc')).toBe(false)
    expect(isSignaturePayloadTooLarge('x'.repeat(MAX_SIGNATURE_DATA_URL_CHARS + 1))).toBe(true)
  })
})
