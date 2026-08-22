import { beforeEach, describe, expect, it } from 'vitest'
import {
  completeOnboarding,
  dismissOnboarding,
  markJustSignedUp,
  shouldShowFirstInspectionOnboarding,
  ONBOARDING_COMPLETE_KEY,
  ONBOARDING_DISMISSED_KEY,
  ONBOARDING_SNOOZED_KEY,
  FIRST_INSPECTION_KEY,
} from './onboarding'

function memoryStorage(): Storage {
  const map = new Map<string, string>()
  return {
    get length() {
      return map.size
    },
    clear: () => map.clear(),
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => {
      map.set(k, String(v))
    },
    removeItem: (k: string) => {
      map.delete(k)
    },
    key: (i: number) => [...map.keys()][i] ?? null,
  }
}

describe('onboarding activation', () => {
  beforeEach(() => {
    const local = memoryStorage()
    const session = memoryStorage()
    Object.defineProperty(globalThis, 'localStorage', { value: local, configurable: true })
    Object.defineProperty(globalThis, 'sessionStorage', { value: session, configurable: true })
    Object.defineProperty(globalThis, 'window', {
      value: { localStorage: local, sessionStorage: session },
      configurable: true,
    })
  })

  it('mostra checklist quando não há vistoria salva', () => {
    expect(shouldShowFirstInspectionOnboarding(false)).toBe(true)
  })

  it('não mostra se já há reports', () => {
    expect(shouldShowFirstInspectionOnboarding(true)).toBe(false)
  })

  it('dismiss só snooze a sessão (volta depois)', () => {
    dismissOnboarding()
    expect(sessionStorage.getItem(ONBOARDING_SNOOZED_KEY)).toBe('1')
    expect(shouldShowFirstInspectionOnboarding(false)).toBe(false)
    sessionStorage.removeItem(ONBOARDING_SNOOZED_KEY)
    expect(shouldShowFirstInspectionOnboarding(false)).toBe(true)
  })

  it('legado ONBOARDING_DISMISSED não bloqueia mais sozinho', () => {
    localStorage.setItem(ONBOARDING_DISMISSED_KEY, '1')
    expect(shouldShowFirstInspectionOnboarding(false)).toBe(true)
  })

  it('complete bloqueia de forma permanente', () => {
    completeOnboarding()
    expect(localStorage.getItem(ONBOARDING_COMPLETE_KEY)).toBe('1')
    expect(shouldShowFirstInspectionOnboarding(false)).toBe(false)
  })

  it('first_inspection key bloqueia', () => {
    localStorage.setItem(FIRST_INSPECTION_KEY, '1')
    expect(shouldShowFirstInspectionOnboarding(false)).toBe(false)
  })

  it('markJustSignedUp limpa snooze', () => {
    dismissOnboarding()
    markJustSignedUp()
    expect(sessionStorage.getItem(ONBOARDING_SNOOZED_KEY)).toBeNull()
  })
})
