import { describe, it, expect } from 'vitest'
import { buildLifeHistory, type LifeHistory } from '../lifeHistory'
import type { SavedReport, InspectionStatus } from '../../../types'
import type { VehicleHistorySummaryWithCloud } from '../mergeRemoteVehicles'
import type { ProntuarioIntel } from '../prontuarioIntel'

function report(over: Partial<SavedReport> = {}): SavedReport {
  return {
    id: Math.random().toString(36).slice(2),
    vehicleInfo: { plate: 'ABC1234' },
    damages: [],
    status: 'draft',
    savedAt: Date.now(),
    ...over,
  } as unknown as SavedReport
}

function intel(over: Partial<ProntuarioIntel> = {}): ProntuarioIntel {
  return {
    integrityPct: 90,
    lastInspectionLabel: 'hoje',
    lastInspectionAt: Date.now(),
    inspectionCount: 1,
    eventEstimate: 1,
    activeDamages: 0,
    evidenceCount: 0,
    lastSyncLabel: '—',
    aiStatus: 'sem_dados',
    aiStatusLabel: 'Sem dados',
    aiConfidenceAvg: null,
    newDamages: 0,
    removedOrRepaired: 0,
    pendingCount: 0,
    issuedCount: 0,
    avgDaysBetween: null,
    daysSinceLast: 0,
    totalChanges: 0,
    vehicleType: 'car',
    modelLabel: 'Veículo',
    color: '',
    year: '',
    plate: 'ABC1234',
    historyStatusLabel: 'Íntegro',
    executiveMetrics: [],
    contextualKpis: [],
    statusLines: [],
    summaryRows: [],
    ...over,
  }
}

function vehicle(reports: SavedReport[], over: Partial<VehicleHistorySummaryWithCloud> = {}): VehicleHistorySummaryWithCloud {
  return {
    id: 'v1',
    plate: 'ABC1234',
    reports,
    ...over,
  } as VehicleHistorySummaryWithCloud
}

describe('buildLifeHistory', () => {
  it('sem inspeções -> periodo vazio, 0 tudo', () => {
    const r = buildLifeHistory(vehicle([]), intel())
    expect(r.totalInspections).toBe(0)
    expect(r.months).toHaveLength(0)
    expect(r.periodLabel).toContain('Sem inspeções')
    expect(r.integrityPct).toBe(90)
  })

  it('1 inspeção -> 1 mês, totalInspections=1', () => {
    const r = buildLifeHistory(vehicle([report()]), intel({ inspectionCount: 1 }))
    expect(r.months).toHaveLength(1)
    expect(r.totalInspections).toBe(1)
    expect(r.months[0].inspections).toBe(1)
  })

  it('agrupa múltiplas inspeções no mesmo mês', () => {
    const base = new Date(2025, 4, 10).getTime() // mai/25
    const r = buildLifeHistory(
      vehicle([
        report({ savedAt: base }),
        report({ savedAt: base + 86_400_000 }),
        report({ savedAt: base + 2 * 86_400_000 }),
      ]),
      intel({ inspectionCount: 3 }),
    )
    expect(r.months).toHaveLength(1)
    expect(r.months[0].label).toMatch(/mai\/25/)
    expect(r.months[0].inspections).toBe(3)
    expect(r.totalInspections).toBe(3)
  })

  it('separa meses diferentes e calcula label de período', () => {
    const jan = new Date(2025, 0, 15).getTime()
    const mar = new Date(2025, 2, 20).getTime()
    const r = buildLifeHistory(
      vehicle([report({ savedAt: jan }), report({ savedAt: mar })]),
      intel({ inspectionCount: 2 }),
    )
    expect(r.months).toHaveLength(2)
    expect(r.months[0].label).toMatch(/jan\/25/)
    expect(r.months[1].label).toMatch(/mar\/25/)
    expect(r.periodLabel).toMatch(/jan\/25.*mar\/25/)
  })

  it('FIPE mês referência propagado', () => {
    const fipe = { valor: 'R$ 45.000', mesReferencia: 'maio/2025', textoMarca: 'Fiat', textoModelo: 'Mobi', anoModelo: '2021' }
    const r = buildLifeHistory(
      vehicle([report({ vehicleInfo: { plate: 'ABC1234', fipe } as any })]),
      intel({ inspectionCount: 1 }),
    )
    expect(r.fipe?.mesReferencia).toBe('maio/2025')
    expect(r.fipe?.valor).toBe('R$ 45.000')
    expect(r.months[0].fipeRef).toBe('maio/2025')
  })

  it('statusMix soma 100% sobre inspeções emitidas', () => {
    const base = new Date(2025, 4, 1).getTime()
    const r = buildLifeHistory(
      vehicle([
        report({ savedAt: base, status: 'issued' }),
        report({ savedAt: base + 1000, status: 'issued' }),
        report({ savedAt: base + 2000, status: 'complete' }),
      ]),
      intel({ inspectionCount: 3, issuedCount: 2 }),
    )
    const soma = r.statusMix.reduce((s, x) => s + x.pct, 0)
    expect(soma).toBe(100)
    const emitido = r.statusMix.find((x) => x.label === 'Emitido')
    expect(emitido?.pct).toBe(67) // 2/3 arredondado
  })

  it('danos novos vs reparados vêm do intel na última inspeção', () => {
    const base = new Date(2025, 4, 1).getTime()
    const r = buildLifeHistory(
      vehicle([
        report({ savedAt: base }),
        report({ savedAt: base + 86_400_000 }),
      ]),
      intel({ inspectionCount: 2, newDamages: 2, removedOrRepaired: 1 }),
    )
    expect(r.newDamages).toBe(2)
    expect(r.removedOrRepaired).toBe(1)
    expect(r.months[r.months.length - 1].newDamages).toBe(2)
    expect(r.months[r.months.length - 1].repairs).toBe(1)
  })
})
