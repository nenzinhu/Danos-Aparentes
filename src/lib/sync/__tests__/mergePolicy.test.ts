import { describe, expect, it } from 'vitest'
import { decideMergeWinner } from '../mergePolicy'

describe('decideMergeWinner', () => {
  it('usa last-write-wins entre drafts', () => {
    expect(decideMergeWinner(
      { savedAt: 1000, status: 'complete' },
      { savedAt: 2000, status: 'complete' },
    )).toBe('take-remote')

    expect(decideMergeWinner(
      { savedAt: 3000, status: 'draft' },
      { savedAt: 1000, status: 'complete' },
    )).toBe('keep-local-and-push')
  })

  it('empate de timestamp mantém o local', () => {
    expect(decideMergeWinner(
      { savedAt: 1000, status: 'complete' },
      { savedAt: 1000, status: 'complete' },
    )).toBe('keep-local')
  })

  it('protege laudo local emitido contra remoto unlocked mais novo', () => {
    expect(decideMergeWinner(
      { savedAt: 1000, status: 'issued' },
      { savedAt: 9000, status: 'complete' },
    )).toBe('keep-local-and-push')
  })

  it('aceita remoto emitido quando o local ainda é draft', () => {
    expect(decideMergeWinner(
      { savedAt: 5000, status: 'draft' },
      { savedAt: 1000, status: 'issued' },
    )).toBe('take-remote')
  })

  it('entre dois locked usa last-write-wins (issued → superseded)', () => {
    expect(decideMergeWinner(
      { savedAt: 1000, status: 'issued' },
      { savedAt: 2000, status: 'superseded' },
    )).toBe('take-remote')

    expect(decideMergeWinner(
      { savedAt: 3000, status: 'issued' },
      { savedAt: 1000, status: 'cancelled' },
    )).toBe('keep-local-and-push')
  })
})
