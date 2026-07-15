import { describe, expect, it } from 'vitest'
import { monthsFromPaymentMetadata } from './route'

describe('monthsFromPaymentMetadata', () => {
  it('lê units do metadata', () => {
    expect(monthsFromPaymentMetadata({ units: 3 })).toBe(3)
    expect(monthsFromPaymentMetadata({ units: '2' })).toBe(2)
  })

  it('fallback 1 mês quando ausente', () => {
    expect(monthsFromPaymentMetadata(null)).toBe(1)
    expect(monthsFromPaymentMetadata({})).toBe(1)
  })

  it('respeita limites 1–12', () => {
    expect(monthsFromPaymentMetadata({ units: 0 })).toBe(1)
    expect(monthsFromPaymentMetadata({ units: 40 })).toBe(12)
  })
})
