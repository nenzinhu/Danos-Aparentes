import { describe, expect, it } from 'vitest'
import { computeProntuarioIntel, estimateDamageDelta } from '../prontuarioIntel'
import type { SavedReport } from '../../../types'
import type { VehicleHistorySummaryWithCloud } from '../mergeRemoteVehicles'

function report(partial: Partial<SavedReport> & Pick<SavedReport, 'id' | 'savedAt'>): SavedReport {
  return {
    status: 'complete',
    vehicleType: 'car',
    vehicleInfo: {
      owner: '',
      phone: '',
      brand: 'VW CrossFox',
      plate: 'ABC1D23' as SavedReport['vehicleInfo']['plate'],
      generalNotes: '',
      interiorNotes: '',
      interiorPhotos: [],
      interiorPhotoNotes: [],
      profile: '',
      ref: '',
      color: 'Prata',
      vehicleTypeDesc: '',
      city: '',
      state: '',
      ...(partial.vehicleInfo || {}),
    },
    damages: [],
    ...partial,
  } as SavedReport
}

describe('estimateDamageDelta', () => {
  it('detecta novos e removidos', () => {
    const prev = report({
      id: 'a' as SavedReport['id'],
      savedAt: 1,
      damages: [
        {
          id: 'd1' as SavedReport['damages'][0]['id'],
          vehicle: 'car',
          view: 'frontal',
          partId: 'hood',
          partName: 'Capô',
          type: 'scratch',
          typeName: 'Risco',
          severity: 'low',
          notes: '',
          photos: [],
          photoNotes: [],
        },
      ],
    })
    const curr = report({
      id: 'b' as SavedReport['id'],
      savedAt: 2,
      damages: [
        {
          id: 'd2' as SavedReport['damages'][0]['id'],
          vehicle: 'car',
          view: 'frontal',
          partId: 'door',
          partName: 'Porta',
          type: 'dent',
          typeName: 'Amassado',
          severity: 'medium',
          notes: '',
          photos: ['blob:1'],
          photoNotes: [],
        },
      ],
    })
    expect(estimateDamageDelta(prev, curr)).toEqual({ newCount: 1, removedCount: 1 })
  })
})

describe('computeProntuarioIntel', () => {
  it('calcula integridade e KPIs com duas inspeções', () => {
    const vehicle: VehicleHistorySummaryWithCloud = {
      id: 'veh-1',
      plate: 'ABC1D23',
      brand: 'VW CrossFox',
      color: 'Prata',
      vehicleType: 'car',
      reports: [
        report({
          id: 'r1' as SavedReport['id'],
          savedAt: Date.parse('2026-07-01T10:00:00Z'),
          syncedAt: Date.parse('2026-07-01T10:05:00Z'),
          damages: [
            {
              id: 'd1' as SavedReport['damages'][0]['id'],
              vehicle: 'car',
              view: 'frontal',
              partId: 'hood',
              partName: 'Capô',
              type: 'scratch',
              typeName: 'Risco',
              severity: 'low',
              notes: '',
              photos: ['blob:a'],
              photoNotes: [],
              evidenceStatus: 'confirmado',
            },
          ],
        }),
        report({
          id: 'r2' as SavedReport['id'],
          savedAt: Date.parse('2026-08-01T14:32:00Z'),
          syncedAt: Date.parse('2026-08-01T14:40:00Z'),
          status: 'issued',
          damages: [
            {
              id: 'd1' as SavedReport['damages'][0]['id'],
              vehicle: 'car',
              view: 'frontal',
              partId: 'hood',
              partName: 'Capô',
              type: 'scratch',
              typeName: 'Risco',
              severity: 'low',
              notes: '',
              photos: ['blob:a'],
              photoNotes: [],
              evidenceStatus: 'confirmado',
            },
            {
              id: 'd2' as SavedReport['damages'][0]['id'],
              vehicle: 'car',
              view: 'traseira',
              partId: 'bumper',
              partName: 'Para-choque',
              type: 'dent',
              typeName: 'Amassado',
              severity: 'medium',
              notes: '',
              photos: ['blob:b', 'blob:c'],
              photoNotes: [],
              evidenceStatus: 'sugerido',
            },
          ],
          vehicleInfo: {
            owner: '',
            phone: '',
            brand: 'VW CrossFox',
            plate: 'ABC1D23' as SavedReport['vehicleInfo']['plate'],
            generalNotes: '',
            interiorNotes: '',
            interiorPhotos: [],
            interiorPhotoNotes: [],
            profile: '',
            ref: '',
            color: 'Prata',
            vehicleTypeDesc: '',
            city: '',
            state: '',
            fipe: {
              mesReferencia: 'maio de 2022',
              valor: 'R$ 28.799,00',
              anoModelo: '2007',
              textoMarca: 'VW - VolksWagen',
              textoModelo: 'CROSSFOX 1.6',
              combustivel: 'Gasolina',
            },
          },
        }),
      ],
      activeDamageCount: 2,
      newDamagesOnLast: 1,
      firstInspectedAt: Date.parse('2026-07-01T10:00:00Z'),
      lastInspectedAt: Date.parse('2026-08-01T14:32:00Z'),
    }

    const intel = computeProntuarioIntel(vehicle, {
      now: Date.parse('2026-08-01T18:00:00Z'),
      eventCount: 8,
    })

    expect(intel.inspectionCount).toBe(2)
    expect(intel.activeDamages).toBe(2)
    expect(intel.newDamages).toBe(1)
    expect(intel.evidenceCount).toBeGreaterThanOrEqual(3)
    expect(intel.integrityPct).toBeGreaterThan(60)
    expect(intel.aiStatus).toBe('em_analise')
    expect(intel.year).toBe('2007')
    expect(intel.executiveMetrics.some((m) => m.id === 'integrity')).toBe(true)
    expect(intel.summaryRows.some((r) => r.label === 'Novos danos')).toBe(true)
    expect(intel.statusLines.length).toBeGreaterThanOrEqual(3)
  })
})
