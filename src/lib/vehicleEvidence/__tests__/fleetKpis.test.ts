import { describe, it, expect } from 'vitest'
import { computeFleetKpis, FleetKpis } from '../fleetKpis'
import { countEvidencePhotos } from '../groupReports'
import type { SavedReport } from '../../../types'

function makeReport(over: any = {}): SavedReport {
  return {
    id: Math.random().toString(36).slice(2),
    vehicleInfo: { plate: 'ABC1234' },
    damages: [],
    status: 'draft',
    savedAt: Date.now(),
    ...over,
  } as SavedReport
}

describe('countEvidencePhotos', () => {
  it('conta fotos de dano', () => {
    const r = makeReport({ damages: [{ photos: ['x', 'y'] } as any] })
    expect(countEvidencePhotos(r)).toBe(2)
  })

  it('conta vistas com foto (viewPhotos é Record<ViewType, string>, não array)', () => {
    const r = makeReport({
      vehicleInfo: {
        plate: 'ABC1234',
        viewPhotos: { frontal: 'data:img1', lateral: 'data:img2' },
      } as any,
    })
    // 0 fotos de dano + 2 vistas com URL => 2
    expect(countEvidencePhotos(r)).toBe(2)
  })

  it('ignora vistas com valor vazio/nulo', () => {
    const r = makeReport({
      vehicleInfo: {
        plate: 'ABC1234',
        viewPhotos: { frontal: '', lateral: undefined } as any,
      } as any,
    })
    expect(countEvidencePhotos(r)).toBe(0)
  })

  it('retorna 0 quando não há fotos nem vistas', () => {
    expect(countEvidencePhotos(makeReport())).toBe(0)
  })
})

describe('computeFleetKpis', () => {
  it('estado vazio: sem divisão por zero', () => {
    const k: FleetKpis = computeFleetKpis([])
    expect(k.totalVehicles).toBe(0)
    expect(k.histCompletePct).toBe(0)
    expect(k.evidencePct).toBe(0)
    expect(k.integrityPct).toBe(0)
    expect(k.damageRate).toBe(0)
    expect(k.compared).toBe(0)
  })

  it('veículo com 1 inspeção => hist. completo 0%, sem comparação', () => {
    const k = computeFleetKpis([makeReport({ vehicleInfo: { plate: 'ABC1234' } })])
    expect(k.totalVehicles).toBe(1)
    expect(k.completeHistory).toBe(0)
    expect(k.histCompletePct).toBe(0)
    expect(k.compared).toBe(0)
    expect(k.damageRate).toBe(0)
  })

  it('veículo com 2 inspeções => hist. completo 100%, entra no compared', () => {
    const base = { vehicleInfo: { plate: 'ABC1234' } }
    const k = computeFleetKpis([
      makeReport({ ...base, savedAt: 1 }),
      makeReport({ ...base, savedAt: 2, damages: [{ photos: ['p'] } as any] }),
    ])
    expect(k.totalVehicles).toBe(1)
    expect(k.completeHistory).toBe(1)
    expect(k.histCompletePct).toBe(100)
    expect(k.compared).toBe(1)
  })

  it('cobertura de evidências inclui vistas (não só fotos de dano)', () => {
    // 1 laudo só com vista, sem foto de dano => deve contar como coberto
    const r = makeReport({
      vehicleInfo: { plate: 'ABC1234', viewPhotos: { traseira: 'data:img' } } as any,
    })
    const k = computeFleetKpis([r])
    expect(k.evidencePct).toBe(100)
  })

  it('integridade conta issued_hash', () => {
    const k = computeFleetKpis([
      makeReport({ issuedHash: 'abc123', status: 'issued' }),
      makeReport({ status: 'draft' }),
    ])
    expect(k.issued).toBe(1)
    expect(k.integrityPct).toBe(50)
  })

  it('damageRate = newDamages / compared (sem NaN quando compared=0)', () => {
    const k = computeFleetKpis([makeReport({ vehicleInfo: { plate: 'ZZZ9999' } })])
    expect(Number.isNaN(k.damageRate)).toBe(false)
    expect(k.damageRate).toBe(0)
  })
})
