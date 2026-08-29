import { describe, it, expect } from 'vitest'
import { computeVehicleRiskScore } from '../riskScore'
import { groupReportsByVehicle } from '../groupReports'
import type { Damage, SavedReport } from '../../../types'

const DAY = 24 * 60 * 60 * 1000

function makeDamage(over: Partial<Damage> = {}): Damage {
  return {
    id: Math.random().toString(36).slice(2),
    vehicle: 'car',
    view: 'lateral-right',
    partId: 'front-bumper',
    partName: 'Para-choque dianteiro',
    type: 'scratch',
    typeName: 'Arranhado',
    severity: 'low',
    notes: '',
    photos: [],
    photoNotes: [],
    ...over,
  } as Damage
}

function makeReport(over: Partial<SavedReport> = {}): SavedReport {
  return {
    id: Math.random().toString(36).slice(2),
    vehicleInfo: { plate: 'ABC1234' },
    damages: [],
    status: 'complete',
    savedAt: Date.now(),
    ...over,
  } as SavedReport
}

function riskFor(reports: SavedReport[]) {
  const [summary] = groupReportsByVehicle(reports)
  return computeVehicleRiskScore(summary)
}

describe('computeVehicleRiskScore', () => {
  it('veículo sem avarias, 1 vistoria → score 100, tier green, confidence low', () => {
    const r = riskFor([makeReport()])
    expect(r.score).toBe(100)
    expect(r.tier).toBe('green')
    expect(r.confidence).toBe('low')
    expect(r.factors).toEqual([])
  })

  it('1 avaria leve, 2 vistorias com evidência, sem reincidência → só fator de severidade, confidence high', () => {
    const t0 = Date.now()
    const reports = [
      makeReport({ savedAt: t0, damages: [], vehicleInfo: { plate: 'ABC1234', viewPhotos: { frontal: 'data:x' } } as any }),
      makeReport({
        savedAt: t0 + 30 * DAY,
        damages: [makeDamage({ severity: 'low' })],
        vehicleInfo: { plate: 'ABC1234', viewPhotos: { frontal: 'data:x' } } as any,
      }),
    ]
    const r = riskFor(reports)
    expect(r.confidence).toBe('high')
    expect(r.score).toBe(97)
    expect(r.tier).toBe('green')
    expect(r.factors).toHaveLength(1)
    expect(r.factors[0].points).toBe(-3)
  })

  it('reincidência: severidade piora no mesmo local entre vistorias consecutivas → fator de reincidência aplicado', () => {
    const t0 = Date.now()
    const withEvidence = { viewPhotos: { frontal: 'data:x' } } as any
    const reports = [
      makeReport({
        savedAt: t0,
        damages: [makeDamage({ id: 'd1', severity: 'low' })],
        vehicleInfo: { plate: 'ABC1234', ...withEvidence },
      }),
      makeReport({
        savedAt: t0 + 30 * DAY,
        damages: [makeDamage({ id: 'd2', severity: 'high' })],
        vehicleInfo: { plate: 'ABC1234', ...withEvidence },
      }),
    ]
    const r = riskFor(reports)
    expect(r.confidence).toBe('high')
    const recurrence = r.factors.find((f) => f.label.startsWith('Reincidência'))
    expect(recurrence).toBeDefined()
    expect(recurrence!.points).toBe(-10)
    // -10 (reincidência) + -12 (avaria grave ativa) = score 78
    expect(r.score).toBe(78)
  })

  it('muitas avarias graves → penalidade de severidade respeita o teto de -50', () => {
    const damages = Array.from({ length: 10 }, (_, i) =>
      makeDamage({ id: `d${i}`, partId: `part-${i}`, severity: 'high' }),
    )
    const r = riskFor([makeReport({ damages })])
    const severityTotal = r.factors
      .filter((f) => f.label.startsWith('Avaria'))
      .reduce((acc, f) => acc + f.points, 0)
    expect(severityTotal).toBe(-50)
    expect(r.score).toBe(50)
  })

  it('acúmulo rápido de avarias novas → fator de velocidade aplicado', () => {
    const t0 = Date.now()
    const withEvidence = { viewPhotos: { frontal: 'data:x' } } as any
    const reports = [
      makeReport({ savedAt: t0, damages: [], vehicleInfo: { plate: 'ABC1234', ...withEvidence } }),
      makeReport({
        savedAt: t0 + 1 * DAY,
        damages: [
          makeDamage({ id: 'd1', partId: 'p1' }),
          makeDamage({ id: 'd2', partId: 'p2' }),
        ],
        vehicleInfo: { plate: 'ABC1234', ...withEvidence },
      }),
    ]
    const r = riskFor(reports)
    const velocity = r.factors.find((f) => f.label === 'Acúmulo rápido de avarias novas')
    expect(velocity).toBeDefined()
    expect(velocity!.points).toBe(-8)
  })

  it('poucos dados (1 vistoria) → confidence low, sem penalidade por falta de histórico', () => {
    const r = riskFor([makeReport({ damages: [makeDamage({ severity: 'medium' })] })])
    expect(r.confidence).toBe('low')
    expect(r.factors.every((f) => f.label.startsWith('Avaria'))).toBe(true)
  })

  it('factors sempre ordenado por |points| desc (mais penalizado primeiro)', () => {
    const damages = [
      makeDamage({ id: 'd1', partId: 'p1', severity: 'low' }),
      makeDamage({ id: 'd2', partId: 'p2', severity: 'high' }),
      makeDamage({ id: 'd3', partId: 'p3', severity: 'medium' }),
    ]
    const r = riskFor([makeReport({ damages })])
    const points = r.factors.map((f) => f.points)
    expect(points).toEqual([...points].sort((a, b) => a - b))
  })
})
