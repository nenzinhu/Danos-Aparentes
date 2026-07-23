import { createHmac } from 'crypto'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { hasActiveSubscriptionAccess } from '@/src/lib/subscriptionAccess'
import { buildMercadoPagoManifest } from '@/src/lib/server/mercadoPagoWebhook'
import { resetRateLimitMemoryForTests } from '@/src/lib/server/rateLimit'

type SubRow = {
  user_id: string
  status: string
  pix_charge_id: string | null
  pending_months: number
  expires_at: string | null
  trial_ends_at?: string | null
}

const { mockFrom, mockMercadoPagoRequest, subscriptionStore } = vi.hoisted(() => {
  const subscriptionStore: { row: SubRow | null } = { row: null }

  function matches(col: string, val: string) {
    const row = subscriptionStore.row
    if (!row) return false
    if (col === 'user_id') return row.user_id === val
    if (col === 'pix_charge_id') return row.pix_charge_id === val
    return false
  }

  const mockFrom = vi.fn(() => ({
    select: (_cols?: string) => ({
      eq: (col: string, val: string) => ({
        maybeSingle: async () => {
          if (!matches(col, val) || !subscriptionStore.row) {
            return { data: null, error: null }
          }
          return {
            data: {
              user_id: subscriptionStore.row.user_id,
              status: subscriptionStore.row.status,
              trial_ends_at: subscriptionStore.row.trial_ends_at ?? null,
              expires_at: subscriptionStore.row.expires_at,
              pending_months: subscriptionStore.row.pending_months,
            },
            error: null,
          }
        },
      }),
    }),
    update: (payload: Record<string, unknown>) => ({
      eq: (col: string, val: string) => ({
        select: (_cols?: string) => ({
          maybeSingle: async () => {
            if (!matches(col, val) || !subscriptionStore.row) {
              return { data: null, error: null }
            }
            Object.assign(subscriptionStore.row, payload)
            return { data: { user_id: subscriptionStore.row.user_id }, error: null }
          },
        }),
      }),
    }),
  }))

  return {
    mockFrom,
    mockMercadoPagoRequest: vi.fn(),
    subscriptionStore,
  }
})

vi.mock('@/src/lib/server/supabaseAdmin', () => ({
  supabaseAdmin: { from: mockFrom },
}))

vi.mock('@/src/lib/server/mercadoPagoClient', () => ({
  mercadoPagoRequest: (...args: unknown[]) => mockMercadoPagoRequest(...args),
}))

vi.mock('@/src/lib/server/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/src/lib/server/auth')>()
  return {
    ...actual,
    getUserFromRequest: vi.fn(),
  }
})

vi.mock('@/src/lib/server/pixClient', () => ({
  createPixCharge: vi.fn(),
}))

import { getUserFromRequest } from '@/src/lib/server/auth'
import { createPixCharge } from '@/src/lib/server/pixClient'
import { POST as createPixChargePost } from './create-pix-charge/route'
import { POST as pixWebhookPost } from './pix-webhook/route'

const SECRET = 'pix-webhook-unit-secret'
const REQUEST_ID = 'req-unit-1'
const TS = '1700000000'
const PAYMENT_ID = '987654321'
const USER_ID = 'user-pix-1'
const NOW = Date.parse('2026-07-15T12:00:00.000Z')

function sign(dataId: string) {
  const manifest = buildMercadoPagoManifest(dataId, REQUEST_ID, TS)
  const v1 = createHmac('sha256', SECRET).update(manifest).digest('hex')
  return `ts=${TS},v1=${v1}`
}

function webhookRequest(body: { type?: string; data?: { id?: string | number } }, signature?: string) {
  const raw = JSON.stringify(body)
  const dataId = String(body?.data?.id ?? '')
  return new NextRequest('https://danosaparentes.com.br/api/pix-webhook', {
    method: 'POST',
    body: raw,
    headers: {
      'content-type': 'application/json',
      'x-signature': signature ?? sign(dataId),
      'x-request-id': REQUEST_ID,
    },
  })
}

describe('fluxo PIX charge → webhook → access', () => {
  afterEach(() => {
    resetRateLimitMemoryForTests()
  })

  beforeEach(() => {
    vi.clearAllMocks()
    resetRateLimitMemoryForTests()
    subscriptionStore.row = {
      user_id: USER_ID,
      status: 'trialing',
      pix_charge_id: null,
      pending_months: 0,
      expires_at: null,
      trial_ends_at: new Date(Date.now() + 7 * 86400000).toISOString(),
    }
    process.env.PIX_WEBHOOK_SECRET = SECRET
    process.env.PIX_MERCADO_PAGO_ACCESS_TOKEN = 'TEST-MP-TOKEN'
    process.env.PIX_PROVIDER = 'mercadopago'
    vi.mocked(getUserFromRequest).mockResolvedValue({
      id: USER_ID,
      email: 'cliente@teste.com',
    } as never)
  })

  it('create-pix-charge retorna 429 após exceder limite por usuário', async () => {
    vi.mocked(createPixCharge).mockResolvedValue({
      id: PAYMENT_ID,
      point_of_interaction: {
        transaction_data: { qr_code: 'pix-copy', qr_code_base64: 'base64qr' },
      },
    } as never)

    const req = () =>
      new NextRequest('https://danosaparentes.com.br/api/create-pix-charge?duration=1', {
        method: 'POST',
      })

    for (let i = 0; i < 8; i += 1) {
      const res = await createPixChargePost(req())
      expect(res.status).toBe(200)
    }

    const blocked = await createPixChargePost(req())
    expect(blocked.status).toBe(429)
    expect(blocked.headers.get('Retry-After')).toBeTruthy()
    const json = await blocked.json()
    expect(json.error).toMatch(/Muitas requisições/)
    expect(createPixCharge).toHaveBeenCalledTimes(8)
  })

  it('create-pix-charge durante trial mantém status e preserva acesso', async () => {
    vi.mocked(createPixCharge).mockResolvedValue({
      id: PAYMENT_ID,
      point_of_interaction: {
        transaction_data: { qr_code: 'pix-copy', qr_code_base64: 'base64qr' },
      },
    } as never)

    const res = await createPixChargePost(
      new NextRequest('https://danosaparentes.com.br/api/create-pix-charge?duration=1', {
        method: 'POST',
      }),
    )
    expect(res.status).toBe(200)
    expect(subscriptionStore.row?.status).toBe('trialing')
    expect(subscriptionStore.row?.pix_charge_id).toBe(PAYMENT_ID)
    expect(subscriptionStore.row?.pending_months).toBe(1)
    expect(
      hasActiveSubscriptionAccess({
        status: subscriptionStore.row!.status,
        trialEndsAt: subscriptionStore.row!.trial_ends_at,
        expiresAt: subscriptionStore.row!.expires_at,
        now: NOW,
      }),
    ).toBe(true)
  })

  it('create-pix-charge sem acesso grava pending_pix', async () => {
    subscriptionStore.row = {
      user_id: USER_ID,
      status: 'canceled',
      pix_charge_id: null,
      pending_months: 0,
      expires_at: null,
      trial_ends_at: '2026-07-01T00:00:00.000Z',
    }
    vi.mocked(createPixCharge).mockResolvedValue({
      id: PAYMENT_ID,
      point_of_interaction: {
        transaction_data: { qr_code: 'pix-copy', qr_code_base64: 'base64qr' },
      },
    } as never)

    const res = await createPixChargePost(
      new NextRequest('https://danosaparentes.com.br/api/create-pix-charge?duration=1', {
        method: 'POST',
      }),
    )
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.copyPaste).toBe('pix-copy')
    expect(json.qrCode).toBe('base64qr')
    expect(subscriptionStore.row?.status).toBe('pending_pix')
    expect(subscriptionStore.row?.pix_charge_id).toBe(PAYMENT_ID)
    expect(subscriptionStore.row?.pending_months).toBe(1)
    expect(
      hasActiveSubscriptionAccess({
        status: subscriptionStore.row!.status,
        expiresAt: subscriptionStore.row!.expires_at,
        now: NOW,
      }),
    ).toBe(false)
  })

  it('webhook approved ativa active_pix e libera hasActiveSubscriptionAccess', async () => {
    subscriptionStore.row = {
      user_id: USER_ID,
      status: 'pending_pix',
      pix_charge_id: PAYMENT_ID,
      pending_months: 1,
      expires_at: null,
    }
    mockMercadoPagoRequest.mockResolvedValue({ status: 'approved' })

    const res = await pixWebhookPost(
      webhookRequest({ type: 'payment', data: { id: PAYMENT_ID } }),
    )
    expect(res.status).toBe(200)
    expect(subscriptionStore.row?.status).toBe('active_pix')
    expect(subscriptionStore.row?.pending_months).toBe(0)
    expect(subscriptionStore.row?.expires_at).toBeTruthy()
    expect(
      hasActiveSubscriptionAccess({
        status: subscriptionStore.row!.status,
        expiresAt: subscriptionStore.row!.expires_at,
        now: NOW,
      }),
    ).toBe(true)
  })

  it('rejeita webhook com HMAC inválido sem alterar subscription', async () => {
    subscriptionStore.row = {
      user_id: USER_ID,
      status: 'pending_pix',
      pix_charge_id: PAYMENT_ID,
      pending_months: 1,
      expires_at: null,
    }

    const res = await pixWebhookPost(
      webhookRequest(
        { type: 'payment', data: { id: PAYMENT_ID } },
        `ts=${TS},v1=${'ab'.repeat(32)}`,
      ),
    )
    expect(res.status).toBe(400)
    expect(subscriptionStore.row?.status).toBe('pending_pix')
    expect(mockMercadoPagoRequest).not.toHaveBeenCalled()
  })

  it('pagamento não approved não ativa acesso', async () => {
    subscriptionStore.row = {
      user_id: USER_ID,
      status: 'pending_pix',
      pix_charge_id: PAYMENT_ID,
      pending_months: 1,
      expires_at: null,
    }
    mockMercadoPagoRequest.mockResolvedValue({ status: 'pending' })

    const res = await pixWebhookPost(
      webhookRequest({ type: 'payment', data: { id: PAYMENT_ID } }),
    )
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.status).toBe('pending')
    expect(subscriptionStore.row?.status).toBe('pending_pix')
  })

  it('fluxo ponta a ponta: charge → pay → access', async () => {
    subscriptionStore.row = {
      user_id: USER_ID,
      status: 'canceled',
      pix_charge_id: null,
      pending_months: 0,
      expires_at: null,
      trial_ends_at: '2026-07-01T00:00:00.000Z',
    }
    vi.mocked(createPixCharge).mockResolvedValue({
      id: PAYMENT_ID,
      point_of_interaction: {
        transaction_data: { qr_code: 'x', qr_code_base64: 'y' },
      },
    } as never)

    const chargeRes = await createPixChargePost(
      new NextRequest('https://danosaparentes.com.br/api/create-pix-charge?duration=2', {
        method: 'POST',
      }),
    )
    expect(chargeRes.status).toBe(200)
    expect(subscriptionStore.row?.status).toBe('pending_pix')
    expect(subscriptionStore.row?.pending_months).toBe(2)

    mockMercadoPagoRequest.mockResolvedValue({ status: 'approved' })
    const hookRes = await pixWebhookPost(
      webhookRequest({ type: 'payment', data: { id: PAYMENT_ID } }),
    )
    expect(hookRes.status).toBe(200)
    expect(subscriptionStore.row?.status).toBe('active_pix')

    const expires = new Date(subscriptionStore.row!.expires_at!).getTime()
    expect(expires).toBeGreaterThan(NOW)
    expect(
      hasActiveSubscriptionAccess({
        status: 'active_pix',
        expiresAt: subscriptionStore.row!.expires_at,
        now: NOW,
      }),
    ).toBe(true)
    expect(
      hasActiveSubscriptionAccess({
        status: 'active_pix',
        expiresAt: subscriptionStore.row!.expires_at,
        now: expires + 1000,
      }),
    ).toBe(false)
  })
})
