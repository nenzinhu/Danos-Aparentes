import { afterEach, describe, expect, it, vi } from 'vitest'
import { getTrustedBaseUrl, isAllowedAppHost } from './trustedBaseUrl'

describe('trustedBaseUrl', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('prefere NEXT_PUBLIC_BASE_URL allowlisted', () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('NEXT_PUBLIC_BASE_URL', 'https://danosaparentes.com.br/')
    expect(getTrustedBaseUrl({ origin: 'https://evil.example' })).toBe(
      'https://danosaparentes.com.br',
    )
  })

  it('rejeita NEXT_PUBLIC_BASE_URL fora da allowlist', () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('NEXT_PUBLIC_BASE_URL', 'https://evil.example')
    expect(getTrustedBaseUrl()).toBe('https://danosaparentes.com.br')
  })

  it('usa VERCEL_URL de preview quando BASE_URL ausente', () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('VERCEL_URL', 'danos-aparentes-git-main-acme.vercel.app')
    expect(getTrustedBaseUrl()).toBe('https://danos-aparentes-git-main-acme.vercel.app')
  })

  it('em produção ignora Origin malicioso', () => {
    vi.stubEnv('NODE_ENV', 'production')
    expect(getTrustedBaseUrl({ origin: 'https://phishing.example' })).toBe(
      'https://danosaparentes.com.br',
    )
  })

  it('em development aceita localhost via Origin', () => {
    vi.stubEnv('NODE_ENV', 'development')
    expect(getTrustedBaseUrl({ origin: 'http://localhost:3000' })).toBe('http://localhost:3000')
  })

  it('isAllowedAppHost cobre produção e preview', () => {
    vi.stubEnv('NODE_ENV', 'production')
    expect(isAllowedAppHost('danosaparentes.com.br')).toBe(true)
    expect(isAllowedAppHost('preview-abc.vercel.app')).toBe(true)
    expect(isAllowedAppHost('evil.example')).toBe(false)
  })
})
