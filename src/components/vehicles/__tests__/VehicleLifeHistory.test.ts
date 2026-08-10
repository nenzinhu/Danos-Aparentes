import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { createElement } from 'react'
import VehicleLifeHistory from '../VehicleLifeHistory'
import type { VehicleHistorySummaryWithCloud } from '@/src/lib/vehicleEvidence/mergeRemoteVehicles'
import type { ProntuarioIntel } from '@/src/lib/vehicleEvidence/prontuarioIntel'
import type { SavedReport } from '@/src/types'

function report(over: Partial<SavedReport> = {}): SavedReport {
  return {
    id: Math.random().toString(36).slice(2),
    vehicleInfo: { plate: 'ABC1234' },
    damages: [],
    status: 'issued',
    savedAt: new Date(2025, 4, 10).getTime(),
    syncedAt: new Date(2025, 4, 10).getTime(),
    publicCode: 'X1',
    issuedHash: 'abc',
    ...over,
  } as unknown as SavedReport
}

function intel(over: Partial<ProntuarioIntel> = {}): ProntuarioIntel {
  return {
    integrityPct: 92,
    lastInspectionLabel: 'hoje',
    lastInspectionAt: Date.now(),
    inspectionCount: 3,
    eventEstimate: 4,
    activeDamages: 1,
    evidenceCount: 6,
    lastSyncLabel: '—',
    aiStatus: 'validada',
    aiStatusLabel: 'Validada',
    aiConfidenceAvg: 95,
    newDamages: 2,
    removedOrRepaired: 1,
    pendingCount: 0,
    issuedCount: 3,
    avgDaysBetween: 5,
    daysSinceLast: 0,
    totalChanges: 3,
    vehicleType: 'car',
    modelLabel: 'Fiat Mobi',
    color: 'Branco',
    year: '2021',
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

describe('VehicleLifeHistory (render)', () => {
  it('renderiza a seção com título, anel de integridade e gráficos SVG', () => {
    const html = renderToStaticMarkup(
      createElement(VehicleLifeHistory, {
        vehicle: vehicle([
          report(),
          report({ savedAt: new Date(2025, 4, 12).getTime() }),
          report({ savedAt: new Date(2025, 2, 20).getTime() }),
        ]),
        intel: intel(),
      }),
    )
    expect(html).toContain('Histórico de Vida')
    expect(html).toContain('Confiança do prontuário')
    expect(html).toContain('Status das inspeções')
    expect(html).toContain('Danos novos vs reparados')
    expect(html).toContain('<svg')
    expect(html).toContain('Em linguagem simples')
    expect(html.length).toBeGreaterThan(200)
  })

  it('estado vazio sem inspeções', () => {
    const html = renderToStaticMarkup(
      createElement(VehicleLifeHistory, { vehicle: vehicle([]), intel: intel({ inspectionCount: 0 }) }),
    )
    expect(html).toContain('Ainda não há inspeções')
  })
})
