import { createHmac } from 'crypto'
import { describe, expect, it } from 'vitest'
import {
  buildMercadoPagoManifest,
  parseMercadoPagoSignatureHeader,
  verifyMercadoPagoHmac,
} from '@/src/lib/server/mercadoPagoWebhook'

describe('parseMercadoPagoSignatureHeader', () => {
  it('extrai ts e v1', () => {
    expect(parseMercadoPagoSignatureHeader('ts=1700000000,v1=abcdef')).toEqual({
      ts: '1700000000',
      v1: 'abcdef',
    })
  })

  it('rejeita header incompleto', () => {
    expect(parseMercadoPagoSignatureHeader('ts=1')).toBeNull()
    expect(parseMercadoPagoSignatureHeader('')).toBeNull()
  })
})

describe('verifyMercadoPagoHmac', () => {
  const secret = 'test-webhook-secret'
  const manifest = buildMercadoPagoManifest('12345', 'req-abc', '1700000000')
  const valid = createHmac('sha256', secret).update(manifest).digest('hex')

  it('aceita HMAC válido', () => {
    expect(verifyMercadoPagoHmac(secret, manifest, valid)).toBe(true)
  })

  it('rejeita HMAC adulterado', () => {
    expect(verifyMercadoPagoHmac(secret, manifest, '00' + valid.slice(2))).toBe(false)
    expect(verifyMercadoPagoHmac(secret, manifest, 'not-hex')).toBe(false)
  })
})
