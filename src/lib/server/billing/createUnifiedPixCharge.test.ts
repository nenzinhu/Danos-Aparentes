import { describe, expect, it, vi, beforeEach } from 'vitest'

vi.mock('@/src/lib/server/asaasPix', () => ({
  createAsaasPixCharge: vi.fn(async () => ({
    id: 'asaas:pay_1',
    qrCodeBase64: 'base64img',
    copyPaste: '00020126...',
  })),
}))

vi.mock('@/src/lib/server/asaasClient', () => ({
  getAsaasApiKey: vi.fn(() => 'asaas_test_key'),
  assertAsaasSafeForProduction: vi.fn(() => null),
}))

vi.mock('@/src/lib/server/pixClient', () => ({
  createPixCharge: vi.fn(async () => ({
    id: 999,
    point_of_interaction: {
      transaction_data: { qr_code: 'mp-copy', qr_code_base64: 'mp-qr' },
    },
  })),
}))

import { createAsaasPixCharge } from '@/src/lib/server/asaasPix'
import { createPixCharge } from '@/src/lib/server/pixClient'
import {
  assertPixProviderConfigured,
  createUnifiedPixCharge,
  resolvePixProvider,
} from './createUnifiedPixCharge'

describe('billing/createUnifiedPixCharge', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    delete process.env.PIX_PROVIDER
  })

  it('resolvePixProvider defaults to asaas', () => {
    expect(resolvePixProvider()).toBe('asaas')
    expect(resolvePixProvider('mercadopago')).toBe('mercadopago')
  })

  it('createUnifiedPixCharge normalizes Asaas response', async () => {
    const charge = await createUnifiedPixCharge({
      amountCents: 7990,
      email: 'a@b.com',
      plan: 'pro',
      durationMonths: 1,
    })
    expect(createAsaasPixCharge).toHaveBeenCalled()
    expect(charge).toMatchObject({
      id: 'asaas:pay_1',
      provider: 'asaas',
      copyPaste: '00020126...',
    })
  })

  it('createUnifiedPixCharge normalizes Mercado Pago response', async () => {
    const charge = await createUnifiedPixCharge({
      amountCents: 2990,
      email: 'a@b.com',
      plan: 'starter',
      durationMonths: 2,
      provider: 'mercadopago',
    })
    expect(createPixCharge).toHaveBeenCalled()
    expect(charge).toMatchObject({
      id: '999',
      provider: 'mercadopago',
      copyPaste: 'mp-copy',
      qrCodeBase64: 'mp-qr',
    })
  })

  it('createUnifiedPixCharge aceita plano corporativo', async () => {
    const charge = await createUnifiedPixCharge({
      amountCents: 29900,
      email: 'corp@b.com',
      plan: 'corporativo',
      durationMonths: 1,
    })
    expect(createAsaasPixCharge).toHaveBeenCalledWith(
      29900,
      'corp@b.com',
      expect.objectContaining({
        description: expect.stringContaining('Corporativo Start'),
      }),
    )
    expect(charge.provider).toBe('asaas')
  })

  it('assertPixProviderConfigured detects missing keys', () => {
    expect(assertPixProviderConfigured('asaas')).toBeNull()
    const prev = process.env.PIX_MERCADO_PAGO_ACCESS_TOKEN
    delete process.env.PIX_MERCADO_PAGO_ACCESS_TOKEN
    expect(assertPixProviderConfigured('mercadopago')).toMatch(/não configurado/i)
    if (prev) process.env.PIX_MERCADO_PAGO_ACCESS_TOKEN = prev
  })
})
