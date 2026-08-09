import { describe, expect, it, afterEach, vi } from 'vitest'
import { suggestCompareDamageFromPhoto } from '../compareAiSuggest'

describe('compareAiSuggest (FASE 16/20)', () => {
  const originalOnline = Object.getOwnPropertyDescriptor(navigator, 'onLine')

  afterEach(() => {
    vi.unstubAllGlobals()
    if (originalOnline) {
      Object.defineProperty(navigator, 'onLine', originalOnline)
    }
  })

  it('nunca classifica sem accessToken (fail-open)', async () => {
    const result = await suggestCompareDamageFromPhoto({
      photoRef: 'photo:1',
      partName: 'porta',
      accessToken: null,
    })
    expect(result).toBeNull()
  })

  it('nunca classifica offline', async () => {
    Object.defineProperty(navigator, 'onLine', { configurable: true, get: () => false })
    const result = await suggestCompareDamageFromPhoto({
      photoRef: 'photo:1',
      partName: 'porta',
      accessToken: 'tok',
    })
    expect(result).toBeNull()
  })

  it('nunca classifica sem foto', async () => {
    Object.defineProperty(navigator, 'onLine', { configurable: true, get: () => true })
    const result = await suggestCompareDamageFromPhoto({
      photoRef: null,
      partName: 'porta',
      accessToken: 'tok',
    })
    expect(result).toBeNull()
  })
})
