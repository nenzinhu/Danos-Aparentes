import { describe, expect, it } from 'vitest'
import { buildEventPayload, computeEventHash, verifyEventChain } from '../../audit/auditLog'
import { auditIdempotencyKey } from '../../sync/idempotency'
import { resolveVerifyOutcome } from '../../verify/publicVerify'

describe('integrity roadmap integration (pure)', () => {
  it('verify outcome + audit idempotency key are stable', () => {
    const outcome = resolveVerifyOutcome({ found: true })
    expect(outcome).toBe('integrity_confirmed')
    const key = auditIdempotencyKey('verification', 'insp-1', 'verify:HASH:outcome')
    expect(key).toBe('audit:verification:insp-1:verify:HASH:outcome')
  })

  it('audit chain links verification after issuance', async () => {
    const issuance = buildEventPayload({
      event_id: 'e1',
      inspection_id: 'insp-1',
      user_id: 'u1',
      actor_id: 'u1',
      event_type: 'issuance',
      previous_event_hash: '',
      timestamp: '2026-07-27T12:00:00.000Z',
    })
    const h1 = await computeEventHash(issuance)
    const verify = buildEventPayload({
      event_id: 'e2',
      inspection_id: 'insp-1',
      user_id: 'u1',
      actor_id: 'public-verify',
      actor_type: 'service',
      event_type: 'verification',
      previous_event_hash: h1,
      timestamp: '2026-07-27T12:05:00.000Z',
      metadata: { outcome: 'integrity_confirmed' },
    })
    const h2 = await computeEventHash(verify)
    const result = await verifyEventChain([
      { ...issuance, event_hash: h1 },
      { ...verify, event_hash: h2 },
    ])
    expect(result.ok).toBe(true)
  })
})
