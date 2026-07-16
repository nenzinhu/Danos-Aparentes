import { afterEach, describe, expect, it } from 'vitest'
import { getTrustedBaseUrl, isAllowedAppHost } from './trustedBaseUrl'

describe('trustedBaseUrl', () => {
  const envSnapshot = { ...process.env }

  afterEach(() => {
    process.env = { ...envSnapshot }
  })

  it('prefere NEXT_PUBLIC_BASE_URL allowlisted', () => {
    process.env.NODE_ENV = 'production'
    process.env.NEXT_PUBLIC_BASE_URL = 'https://danosaparentes.com.br/'
    expect(getTrustedBaseUrl({ origin: 'https://evil.example' })).toBe(
      'https://danosaparentes.com.br',
    )
  })

  it('rejeita NEXT_PUBLIC_BASE_URL fora da allowlist', () => {
    process.env.NODE_ENV = 'production'
    process.env.NEXT_PUBLIC_BASE_URL = 'https://evil.example'
    expect(getTrustedBaseUrl()).toBe('https://danosaparentes.com.br')
  })

  it('usa VERCEL_URL de preview quando BASE_URL ausente', () => {
    process.env.NODE_ENV = 'production'
    delete process.env.NEXT_PUBLIC_BASE_URL
    process.env.VERCEL_URL = 'danos-aparentes-git-main-acme.vercel.app'
    expect(getTrustedBaseUrl()).toBe('https://danos-aparentes-git-main-acme.vercel.app')
  })

  it('em produção ignora Origin malicioso', () => {
    process.env.NODE_ENV = 'production'
    delete process.env.NEXT_PUBLIC_BASE_URL
    delete process.env.VERCEL_URL
    expect(getTrustedBaseUrl({ origin: 'https://phishing.example' })).toBe(
      'https://danosaparentes.com.br',
    )
  })

  it('em development aceita localhost via Origin', () => {
    process.env.NODE_ENV = 'development'
    delete process.env.NEXT_PUBLIC_BASE_URL
    delete process.env.VERCEL_URL
    expect(getTrustedBaseUrl({ origin: 'http://localhost:3000' })).toBe('http://localhost:3000')
  })

  it('isAllowedAppHost cobre produção e preview', () => {
    process.env.NODE_ENV = 'production'
    expect(isAllowedAppHost('danosaparentes.com.br')).toBe(true)
    expect(isAllowedAppHost('preview-abc.vercel.app')).toBe(true)
    expect(isAllowedAppHost('evil.example')).toBe(false)
  })
})
