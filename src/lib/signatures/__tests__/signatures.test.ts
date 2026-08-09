import { describe, expect, it } from 'vitest'
import {
  getSignatureProvider,
  hashSignatureImage,
  sealOnScreenSignature,
  signatureImagePayload,
  SIGNATURE_PROVIDERS,
} from '../index'

const TINY_PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

describe('SignatureProvider registry', () => {
  it('exposes on_screen as the default modular provider', () => {
    expect(SIGNATURE_PROVIDERS.some((p) => p.id === 'on_screen')).toBe(true)
    expect(getSignatureProvider('on_screen')?.supportsExternalFlow).toBe(false)
  })
})

describe('sealOnScreenSignature', () => {
  it('records name, timestamp, UA, session and content hash without claiming legal validity', async () => {
    const meta = await sealOnScreenSignature({
      role: 'inspector',
      imageDataUrl: TINY_PNG,
      signerName: '  Ana Silva ',
      signerDocument: '123.456.789-00',
      sessionId: 'sess-1',
      documentHash: 'DOCDOCDOCDOCDOCDOCDOCDOCDOCDOCDO',
      userAgent: 'TestAgent/1.0',
      capturedAt: 1_700_000_000_000,
    })

    expect(meta.providerId).toBe('on_screen')
    expect(meta.role).toBe('inspector')
    expect(meta.signerName).toBe('Ana Silva')
    expect(meta.signerDocument).toBe('123.456.789-00')
    expect(meta.capturedAt).toBe(1_700_000_000_000)
    expect(meta.userAgent).toBe('TestAgent/1.0')
    expect(meta.sessionId).toBe('sess-1')
    expect(meta.documentHash).toBe('DOCDOCDOCDOCDOCDOCDOCDOCDOCDOCDO')
    expect(meta.contentHash).toMatch(/^[a-f0-9]{64}$/)
  })

  it('rejects empty signer name', async () => {
    await expect(
      sealOnScreenSignature({
        role: 'client',
        imageDataUrl: TINY_PNG,
        signerName: '   ',
      }),
    ).rejects.toThrow(/nome/i)
  })

  it('content hash changes when image payload changes', async () => {
    const a = await hashSignatureImage(TINY_PNG)
    const b = await hashSignatureImage(TINY_PNG + 'X')
    expect(a).not.toBe(b)
    expect(signatureImagePayload(TINY_PNG).startsWith('iVBOR')).toBe(true)
  })
})
