import { describe, expect, it } from 'vitest'
import { offlineCompareGate, resolveVehicleIdForSave } from '../resolveVehicle'
import { buildComparativeHtml } from '../../pdf/comparativeReport'
import type { SavedReport } from '../../../types'
import type { ComparisonResult } from '../types'

function minimalReport(id: string, plate: string, opts?: Partial<SavedReport>): SavedReport {
  return {
    id: id as SavedReport['id'],
    savedAt: 1000,
    vehicleInfo: {
      owner: '',
      phone: '',
      brand: '',
      plate: plate as SavedReport['vehicleInfo']['plate'],
      generalNotes: '',
      interiorNotes: '',
      interiorPhotos: [],
      interiorPhotoNotes: [],
      profile: '',
      ref: '',
      color: '',
      vehicleTypeDesc: '',
      city: '',
      state: '',
    },
    damages: [],
    ...opts,
  }
}

describe('resolveVehicleIdForSave', () => {
  it('reusa vehicleId de laudo com a mesma placa', () => {
    const existing = [minimalReport('a', 'ABC1D23', { vehicleId: 'veh-fixed' })]
    expect(resolveVehicleIdForSave('abc-1d23', existing)).toBe('veh-fixed')
  })

  it('respeita preferredVehicleId', () => {
    expect(resolveVehicleIdForSave('ABC1D23', [], 'pref')).toBe('pref')
  })

  it('cria novo id quando placa válida e sem histórico', () => {
    const id = resolveVehicleIdForSave('XYZ9K88', [])
    expect(id).toBeTruthy()
    expect(id!.length).toBeGreaterThan(8)
  })

  it('não cria veículo para placa curta', () => {
    expect(resolveVehicleIdForSave('AB', [])).toBeUndefined()
  })
})

describe('offlineCompareGate', () => {
  it('permite comparação local sem exigir sync', () => {
    const a = minimalReport('a', 'ABC1D23')
    const b = minimalReport('b', 'ABC1D23', { savedAt: 2000 })
    expect(offlineCompareGate(a, b).ok).toBe(true)
  })

  it('bloqueia quando requireSynced e ainda não sincronizou', () => {
    const a = minimalReport('a', 'ABC1D23', { savedAt: 2000 })
    const b = minimalReport('b', 'ABC1D23', { savedAt: 3000 })
    const gate = offlineCompareGate(a, b, { requireSynced: true })
    expect(gate.ok).toBe(false)
    if (!gate.ok) expect(gate.reason).toMatch(/sincronizados/)
  })

  it('permite quando ambos sincronizados', () => {
    const a = minimalReport('a', 'ABC1D23', { savedAt: 1000, syncedAt: 1500 })
    const b = minimalReport('b', 'ABC1D23', { savedAt: 2000, syncedAt: 2500 })
    expect(offlineCompareGate(a, b, { requireSynced: true }).ok).toBe(true)
  })
})

describe('buildComparativeHtml', () => {
  it('marca documento como derivado e inclui hash', () => {
    const result: ComparisonResult = {
      previousInspectionId: 'p',
      currentInspectionId: 'c',
      vehicleId: 'v',
      comparedAt: new Date().toISOString(),
      items: [],
      summary: { unchanged: 0, newDamages: 1, removedOrRepaired: 0, severityChanged: 0, uncertain: 0 },
    }
    const html = buildComparativeHtml({
      plate: 'ABC1D23',
      previousLabel: 'antes',
      currentLabel: 'depois',
      result,
    }, 'deadbeef')
    expect(html).toMatch(/COMPARATIVO \(derivado\)/i)
    expect(html).toContain('deadbeef')
    expect(html).toContain('ABC1D23')
  })
})
