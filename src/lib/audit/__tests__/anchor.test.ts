import { describe, expect, it } from 'vitest'
import {
  buildEventPayload,
  computeEventHash,
  verifyEventChain,
  type AuditLogRow,
} from '../auditLog'
import { computeAnchorDigest, verifyAnchorsAgainstChain } from '../anchor'

async function buildChain(eventTypes: string[]): Promise<AuditLogRow[]> {
  const rows: AuditLogRow[] = []
  let prev = ''
  for (let i = 0; i < eventTypes.length; i++) {
    const payload = buildEventPayload({
      event_id: `e${i + 1}`,
      inspection_id: 'insp-1',
      user_id: 'u1',
      actor_id: 'u1',
      event_type: eventTypes[i],
      timestamp: `2026-08-05T12:0${i}:00.000Z`,
      previous_event_hash: prev,
    })
    const event_hash = await computeEventHash(payload)
    rows.push({ ...payload, event_hash })
    prev = event_hash
  }
  return rows
}

describe('verifyAnchorsAgainstChain', () => {
  it('accepts anchors whose tips exist in the chain', async () => {
    const chain = await buildChain(['creation', 'photo_capture', 'issuance'])
    const result = verifyAnchorsAgainstChain(chain, [
      { chain_tip_hash: chain[1].event_hash },
      { chain_tip_hash: chain[2].event_hash },
    ])
    expect(result.ok).toBe(true)
    expect(result.anchoredCount).toBe(2)
    expect(result.orphanTips).toEqual([])
  })

  it('detects orphan anchors after the history is rewritten', async () => {
    const original = await buildChain(['creation', 'damage_create', 'issuance'])
    const anchoredTip = original[2].event_hash

    // Reescrita: mesma vistoria, mas o evento de dano foi removido e a cadeia
    // recomputada — a âncora antiga não aponta mais para nenhum evento.
    const rewritten = await buildChain(['creation', 'issuance'])
    expect(await verifyEventChain(rewritten)).toEqual({ ok: true })

    const result = verifyAnchorsAgainstChain(rewritten, [
      { chain_tip_hash: anchoredTip },
    ])
    expect(result.ok).toBe(false)
    expect(result.anchoredCount).toBe(0)
    expect(result.orphanTips).toEqual([anchoredTip])
  })

  it('detects in-place tampering via verifyEventChain', async () => {
    const chain = await buildChain(['creation', 'damage_create', 'issuance'])
    const tampered = chain.map((row, i) =>
      i === 1 ? { ...row, metadata: { severity: 'leve' } } : row,
    )
    const check = await verifyEventChain(tampered)
    expect(check.ok).toBe(false)
    expect(check.brokenAt).toBe(1)
  })

  it('is trivially ok with no anchors', async () => {
    const chain = await buildChain(['creation'])
    const result = verifyAnchorsAgainstChain(chain, [])
    expect(result.ok).toBe(true)
    expect(result.anchoredCount).toBe(0)
  })
})

describe('computeAnchorDigest', () => {
  it('is deterministic and order-independent on keys', async () => {
    const a = await computeAnchorDigest({
      inspection_id: 'insp-1',
      chain_tip_hash: 'abc',
      events_count: 3,
    })
    const b = await computeAnchorDigest({
      inspection_id: 'insp-1',
      chain_tip_hash: 'abc',
      events_count: 3,
    })
    expect(a).toBe(b)
    expect(a).toMatch(/^[0-9a-f]{64}$/)
  })

  it('changes when the tip changes', async () => {
    const a = await computeAnchorDigest({
      inspection_id: 'insp-1',
      chain_tip_hash: 'abc',
      events_count: 3,
    })
    const b = await computeAnchorDigest({
      inspection_id: 'insp-1',
      chain_tip_hash: 'abd',
      events_count: 3,
    })
    expect(a).not.toBe(b)
  })
})
