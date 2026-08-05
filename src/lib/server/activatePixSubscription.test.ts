import { describe, expect, it, vi, beforeEach } from 'vitest'

const updateChain = {
  eq: vi.fn(),
  select: vi.fn(),
  maybeSingle: vi.fn(),
}

const state = {
  sub: null as null | {
    user_id: string
    expires_at: string | null
    pending_months: number
    status: string
  },
  updateError: null as null | { message: string },
}

vi.mock('@/src/lib/server/supabaseAdmin', () => ({
  supabaseAdmin: {
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({ data: state.sub, error: null }),
        }),
      }),
      update: () => ({
        eq: () => ({
          select: () => ({
            maybeSingle: async () => ({
              data: state.sub ? { user_id: state.sub.user_id } : null,
              error: state.updateError,
            }),
          }),
        }),
      }),
    }),
  },
}))

vi.mock('@/src/lib/subscriptionAccess', () => ({
  extendSubscriptionExpiry: (from: string | null, months: number) => {
    const base = from ? new Date(from) : new Date('2026-01-01T00:00:00.000Z')
    base.setMonth(base.getMonth() + months)
    return base
  },
}))

const { activatePixSubscriptionByChargeId } = await import('./activatePixSubscription')

describe('activatePixSubscriptionByChargeId', () => {
  beforeEach(() => {
    state.sub = {
      user_id: 'user-1',
      expires_at: null,
      pending_months: 3,
      status: 'pending_pix',
    }
    state.updateError = null
    vi.clearAllMocks()
  })

  it('ativa active_pix e zera pending_months', async () => {
    const result = await activatePixSubscriptionByChargeId('asaas:pay_123')
    expect(result.ok).toBe(true)
    expect(result.userId).toBe('user-1')
  })

  it('é idempotente se já active_pix sem pending', async () => {
    state.sub = {
      user_id: 'user-1',
      expires_at: '2026-12-01T00:00:00.000Z',
      pending_months: 0,
      status: 'active_pix',
    }
    const result = await activatePixSubscriptionByChargeId('asaas:pay_123')
    expect(result.ok).toBe(true)
    expect(result.userId).toBe('user-1')
  })

  it('retorna 404 se cobrança não existe', async () => {
    state.sub = null
    const result = await activatePixSubscriptionByChargeId('asaas:missing')
    expect(result.ok).toBe(false)
    expect(result.status).toBe(404)
  })
})

describe('parsePixExternalReference', () => {
  it('parseia userId|plan', async () => {
    const { parsePixExternalReference } = await import('./activatePixSubscription')
    expect(parsePixExternalReference('abc|starter')).toEqual({ userId: 'abc', plan: 'starter' })
    expect(parsePixExternalReference('abc|corporativo')).toEqual({ userId: 'abc', plan: 'corporativo' })
    expect(parsePixExternalReference('only-user')).toEqual({ userId: 'only-user' })
  })
})

// silence unused
void updateChain
