import { describe, expect, it } from 'vitest'
import { API_KEY_PREFIX, generateApiKey, hashApiKey } from './apiKeys'

describe('apiKeys', () => {
  it('gera chave com prefixo da_live_ e hash estável', () => {
    const a = generateApiKey()
    expect(a.rawKey.startsWith(API_KEY_PREFIX)).toBe(true)
    expect(a.prefix.startsWith(API_KEY_PREFIX)).toBe(true)
    expect(a.hash).toHaveLength(64)
    expect(hashApiKey(a.rawKey)).toBe(a.hash)
  })

  it('gera chaves distintas a cada chamada', () => {
    const a = generateApiKey()
    const b = generateApiKey()
    expect(a.rawKey).not.toBe(b.rawKey)
    expect(a.hash).not.toBe(b.hash)
  })
})
