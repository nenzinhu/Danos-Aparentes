import { describe, expect, it } from 'vitest'
import { mergeRemoteVehiclesIntoSummaries } from '../mergeRemoteVehicles'
import type { VehicleHistorySummary } from '../groupReports'
import { buildCompareHref, parseCompareDeepLink } from '../compareDeepLink'

const localSummary = (partial: Partial<VehicleHistorySummary> & Pick<VehicleHistorySummary, 'id' | 'plate'>): VehicleHistorySummary => ({
  brand: '',
  color: '',
  reports: [],
  activeDamageCount: 0,
  newDamagesOnLast: 0,
  firstInspectedAt: null,
  lastInspectedAt: null,
  ...partial,
})

describe('mergeRemoteVehiclesIntoSummaries (FASE 17)', () => {
  it('adiciona stub cloud-only quando não há laudo local', () => {
    const merged = mergeRemoteVehiclesIntoSummaries([], [
      {
        id: 'veh-1',
        plate: 'ABC1D23',
        brand: 'VW',
        color: 'prata',
        updated_at: '2026-07-01T12:00:00.000Z',
      },
    ])
    expect(merged).toHaveLength(1)
    expect(merged[0].id).toBe('veh-1')
    expect(merged[0].cloudOnly).toBe(true)
    expect(merged[0].brand).toBe('VW')
  })

  it('não duplica quando já existe grupo local pela placa', () => {
    const local = [
      localSummary({
        id: 'local:ABC1D23',
        plate: 'ABC1D23',
        brand: 'Fiat',
        reports: [{ id: 'r1' } as VehicleHistorySummary['reports'][number]],
      }),
    ]
    const merged = mergeRemoteVehiclesIntoSummaries(local, [
      { id: 'veh-uuid', plate: 'ABC1D23', brand: 'VW' },
    ])
    expect(merged).toHaveLength(1)
    expect(merged[0].id).toBe('local:ABC1D23')
    expect(merged[0].cloudOnly).toBe(false)
  })

  it('enriquece metadados quando o id remoto já existe localmente', () => {
    const local = [localSummary({ id: 'veh-1', plate: 'ABC1D23', brand: '', color: '' })]
    const merged = mergeRemoteVehiclesIntoSummaries(local, [
      { id: 'veh-1', plate: 'ABC1D23', brand: 'Toyota', color: 'preto' },
    ])
    expect(merged[0].brand).toBe('Toyota')
    expect(merged[0].color).toBe('preto')
  })
})

describe('compareDeepLink (FASE 19)', () => {
  it('parseia prev/curr de URLSearchParams', () => {
    const params = new URLSearchParams('prev=a&curr=b')
    expect(parseCompareDeepLink(params)).toEqual({ prevId: 'a', currId: 'b' })
  })

  it('monta href com query', () => {
    expect(buildCompareHref('veh-1', { prevId: 'p', currId: 'c' })).toBe(
      '/app/vehicles/veh-1/compare?prev=p&curr=c',
    )
    expect(buildCompareHref('local:ABC')).toBe('/app/vehicles/local%3AABC/compare')
  })
})
