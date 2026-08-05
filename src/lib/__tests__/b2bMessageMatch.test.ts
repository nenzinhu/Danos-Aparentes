import { describe, expect, it } from 'vitest'
import { resolveB2bMessageMatch } from '../b2bMessageMatch'

describe('resolveB2bMessageMatch', () => {
  it('returns null without UTMs', () => {
    expect(resolveB2bMessageMatch('locadoras', {})).toBeNull()
  })

  it('matches locadoras ja-estava-assim from utm_content', () => {
    const m = resolveB2bMessageMatch('locadoras', { content: 'ja-estava-assim' })
    expect(m?.id).toBe('ja-estava-assim')
    expect(m?.headline).toMatch(/já estava assim/i)
  })

  it('matches conceito-01 token', () => {
    const m = resolveB2bMessageMatch('locadoras', { content: 'conceito-01' })
    expect(m?.id).toBe('ja-estava-assim')
  })

  it('matches oficinas trial from campaign', () => {
    const m = resolveB2bMessageMatch('oficinas', { campaign: 'oficinas_trial_7-dias' })
    expect(m?.id).toBe('trial-offer')
  })

  it('matches frotas offline from term', () => {
    const m = resolveB2bMessageMatch('frotas', { term: 'offline-patio' })
    expect(m?.id).toBe('offline')
  })

  it('matches seguradoras anti-fraude', () => {
    const m = resolveB2bMessageMatch('seguradoras', { content: 'qr-anti-fraude' })
    expect(m?.id).toBe('anti-fraude')
  })

  it('ignores accents in tokens', () => {
    const m = resolveB2bMessageMatch('locadoras', { content: 'historico-placa' })
    expect(m?.id).toBe('historico-placa')
  })
})
