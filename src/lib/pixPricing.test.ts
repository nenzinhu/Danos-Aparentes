import { describe, expect, it } from 'vitest'
import { calculatePixAmount, DEFAULT_PIX_UNIT_BRL } from './pixPricing'

describe('calculatePixAmount', () => {
  it('usa 1 unidade sem acréscimo por padrão', () => {
    expect(calculatePixAmount({ units: 1 })).toEqual({
      units: 1,
      unitPriceBrl: DEFAULT_PIX_UNIT_BRL,
      unitsSubtotalBrl: DEFAULT_PIX_UNIT_BRL,
      surchargeBrl: 0,
      totalBrl: DEFAULT_PIX_UNIT_BRL,
    })
  })

  it('acrescenta o valor em cima das unidades', () => {
    const r = calculatePixAmount({ units: 2, surchargeBrl: 10.5 })
    expect(r.units).toBe(2)
    expect(r.unitsSubtotalBrl).toBe(99.8)
    expect(r.surchargeBrl).toBe(10.5)
    expect(r.totalBrl).toBe(110.3)
  })

  it('limita unidades entre 1 e 12', () => {
    expect(calculatePixAmount({ units: 0 }).units).toBe(1)
    expect(calculatePixAmount({ units: 99 }).units).toBe(12)
  })

  it('ignora acréscimo negativo', () => {
    expect(calculatePixAmount({ units: 1, surchargeBrl: -5 }).surchargeBrl).toBe(0)
  })
})
