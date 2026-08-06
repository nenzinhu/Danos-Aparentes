import { describe, expect, it } from 'vitest'
import { computeReliability, levelForScore } from '../reliability'

const FULL_INPUT = {
  eventTypes: [
    'creation',
    'photo_capture',
    'gps',
    'review_completed',
    'signature',
    'issuance',
  ],
  eventsCount: 6,
  chainOk: true,
  anchoredCount: 2,
  anchorsOk: true,
}

describe('computeReliability', () => {
  it('scores 100 when every criterion is met', () => {
    const s = computeReliability(FULL_INPUT)
    expect(s.score).toBe(100)
    expect(s.level).toBe('alto')
    expect(s.levelLabel).toBe('CONFIABILIDADE ALTA')
    expect(s.criteria.every((c) => c.met)).toBe(true)
    expect(s.photoAlertCount).toBe(0)
  })

  it('fails chain_integrity when the chain is broken', () => {
    const s = computeReliability({ ...FULL_INPUT, chainOk: false })
    const chain = s.criteria.find((c) => c.id === 'chain_integrity')
    expect(chain?.met).toBe(false)
    expect(s.score).toBe(75)
  })

  it('fails anchored when anchors are orphaned even if count > 0', () => {
    const s = computeReliability({ ...FULL_INPUT, anchorsOk: false })
    const anchored = s.criteria.find((c) => c.id === 'anchored')
    expect(anchored?.met).toBe(false)
  })

  it('fails photo_authenticity when reuse/context alerts exist', () => {
    const s = computeReliability({
      ...FULL_INPUT,
      eventTypes: [...FULL_INPUT.eventTypes, 'photo_reuse_alert'],
    })
    const auth = s.criteria.find((c) => c.id === 'photo_authenticity')
    expect(auth?.met).toBe(false)
    expect(s.photoAlertCount).toBe(1)
    expect(s.score).toBe(85)
  })

  it('photo_authenticity requires photos', () => {
    const s = computeReliability({
      ...FULL_INPUT,
      eventTypes: FULL_INPUT.eventTypes.filter((t) => t !== 'photo_capture'),
    })
    expect(s.criteria.find((c) => c.id === 'photos')?.met).toBe(false)
    expect(s.criteria.find((c) => c.id === 'photo_authenticity')?.met).toBe(false)
  })

  it('accepts hasGeo as GPS fallback when there is no gps event', () => {
    const withoutGps = {
      ...FULL_INPUT,
      eventTypes: FULL_INPUT.eventTypes.filter((t) => t !== 'gps'),
    }
    expect(
      computeReliability(withoutGps).criteria.find((c) => c.id === 'gps')?.met,
    ).toBe(false)
    expect(
      computeReliability({ ...withoutGps, hasGeo: true }).criteria.find(
        (c) => c.id === 'gps',
      )?.met,
    ).toBe(true)
  })

  it('accepts human_decision or review as human review evidence', () => {
    for (const t of ['human_decision', 'review', 'review_completed']) {
      const s = computeReliability({
        ...FULL_INPUT,
        eventTypes: ['creation', 'photo_capture', t],
      })
      expect(s.criteria.find((c) => c.id === 'human_review')?.met).toBe(true)
    }
  })

  it('scores basico for an empty timeline', () => {
    const s = computeReliability({
      eventTypes: [],
      eventsCount: 0,
      chainOk: true,
      anchoredCount: 0,
      anchorsOk: true,
    })
    expect(s.score).toBe(0)
    expect(s.level).toBe('basico')
    expect(s.levelLabel).toBe('REGISTRO BÁSICO')
  })
})

describe('levelForScore', () => {
  it('maps thresholds 80 and 50', () => {
    expect(levelForScore(100)).toBe('alto')
    expect(levelForScore(80)).toBe('alto')
    expect(levelForScore(79)).toBe('medio')
    expect(levelForScore(50)).toBe('medio')
    expect(levelForScore(49)).toBe('basico')
    expect(levelForScore(0)).toBe('basico')
  })
})
