import { describe, expect, it } from 'vitest'
import {
  auditIdempotencyKey,
  hashRegisterIdempotencyKey,
  syncUpsertIdempotencyKey,
} from '../idempotency'

describe('sync idempotency keys', () => {
  it('builds stable sync upsert keys', () => {
    expect(syncUpsertIdempotencyKey('r1', 1000)).toBe('sync_upsert:r1:1000')
    expect(syncUpsertIdempotencyKey('r1', 1000)).toBe(syncUpsertIdempotencyKey('r1', 1000))
  })

  it('builds audit and hash register keys', () => {
    expect(auditIdempotencyKey('change', 'insp-1', 'x')).toBe('audit:change:insp-1:x')
    expect(hashRegisterIdempotencyKey('HASH', 'insp-1')).toBe('hash_register:insp-1:HASH')
  })
})
