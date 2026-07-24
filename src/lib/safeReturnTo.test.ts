import { describe, expect, it } from 'vitest'
import { getSafeReturnTo, loginUrlWithReturnTo } from './safeReturnTo'

describe('getSafeReturnTo', () => {
  it('allows pagamento-pix with duration query', () => {
    expect(getSafeReturnTo('/pagamento-pix?duration=3')).toBe('/pagamento-pix?duration=3')
  })

  it('allows planos and app paths', () => {
    expect(getSafeReturnTo('/planos')).toBe('/planos')
    expect(getSafeReturnTo('/app')).toBe('/app')
  })

  it('rejects external and protocol-relative URLs', () => {
    expect(getSafeReturnTo('https://evil.example')).toBe('/app')
    expect(getSafeReturnTo('//evil.example/path')).toBe('/app')
  })

  it('rejects paths outside allowlist', () => {
    expect(getSafeReturnTo('/admin')).toBe('/app')
    expect(getSafeReturnTo('/blog/foo')).toBe('/app')
  })
})

describe('loginUrlWithReturnTo', () => {
  it('encodes returnTo for login page', () => {
    expect(loginUrlWithReturnTo('/pagamento-pix?duration=6')).toBe(
      '/app?returnTo=%2Fpagamento-pix%3Fduration%3D6',
    )
  })
})
