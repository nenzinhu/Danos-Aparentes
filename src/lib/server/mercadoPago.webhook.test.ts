import { createHmac } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { verifyMercadoPagoWebhookSignature } from './mercadoPago'

describe('verifyMercadoPagoWebhookSignature', () => {
  it('aceita assinatura válida', () => {
    const secret = 'test-secret'
    const dataId = '123456'
    const requestId = 'req-abc'
    const ts = '1700000000'
    const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`
    const v1 = createHmac('sha256', secret).update(manifest).digest('hex')

    expect(
      verifyMercadoPagoWebhookSignature({
        dataId,
        requestId,
        xSignature: `ts=${ts},v1=${v1}`,
        secret,
      }),
    ).toBe(true)
  })

  it('rejeita assinatura inválida', () => {
    expect(
      verifyMercadoPagoWebhookSignature({
        dataId: '1',
        requestId: 'r',
        xSignature: 'ts=1,v1=deadbeef',
        secret: 'secret',
      }),
    ).toBe(false)
  })
})
