import { VehicleEvidenceStore } from '../store/memoryStore'
import type { DamageRecord, Inspection } from '../domain'

const TENANT = 'lab-tenant'

function d(
  id: string,
  partId: string,
  partName: string,
  type: DamageRecord['type'],
  severity: DamageRecord['severity'] = 'low',
  view: DamageRecord['view'] = 'lateral-right',
): DamageRecord {
  return {
    id,
    partId,
    partName,
    type,
    typeName: type === 'dent' ? 'Amassado' : type === 'scratch' ? 'Arranhado' : 'Quebrado',
    severity,
    view,
    notes: '',
    photoRefs: [`photo:${id}:opt`],
  }
}

export function getStore(): VehicleEvidenceStore {
  return new VehicleEvidenceStore('vehicle-evidence-lab-v1')
}

export function seedDemoData(store: VehicleEvidenceStore): void {
  if (store.vehicles.size > 0) return

  store.createVehicle({
    id: 'veh-abc',
    tenantId: TENANT,
    plate: 'ABC1D23',
    brand: 'VW',
    model: 'Gol',
    color: 'Prata',
    vehicleType: 'car',
  })

  const i1: Inspection = {
    id: 'insp-001',
    vehicleId: 'veh-abc',
    tenantId: TENANT,
    status: 'issued',
    plateAtInspection: 'ABC1D23',
    inspectedAt: '2026-02-01T14:00:00.000Z',
    publicCode: 'DA-2026-000001',
    damages: [],
    geo: { lat: -23.55, lng: -46.63, address: 'São Paulo, SP' },
  }

  const i2: Inspection = {
    id: 'insp-002',
    vehicleId: 'veh-abc',
    tenantId: TENANT,
    status: 'issued',
    plateAtInspection: 'ABC1D23',
    inspectedAt: '2026-03-15T10:30:00.000Z',
    publicCode: 'DA-2026-000014',
    damages: [d('d2a', 'bumper-front', 'Para-choque dianteiro', 'scratch', 'low', 'frontal')],
    geo: { lat: -23.56, lng: -46.64, address: 'São Paulo, SP' },
  }

  const i3: Inspection = {
    id: 'insp-003',
    vehicleId: 'veh-abc',
    tenantId: TENANT,
    status: 'issued',
    plateAtInspection: 'ABC1D23',
    inspectedAt: '2026-03-22T16:00:00.000Z',
    publicCode: 'DA-2026-000021',
    damages: [
      d('d3a', 'bumper-front', 'Para-choque dianteiro', 'scratch', 'low', 'frontal'),
      d('d3b', 'door-rr', 'Porta traseira direita', 'dent', 'medium', 'lateral-right'),
    ],
    geo: { lat: -23.57, lng: -46.65, address: 'São Paulo, SP' },
  }

  const i4: Inspection = {
    id: 'insp-004',
    vehicleId: 'veh-abc',
    tenantId: TENANT,
    status: 'issued',
    plateAtInspection: 'ABC1D23',
    inspectedAt: '2026-07-20T11:00:00.000Z',
    publicCode: 'DA-2026-000088',
    damages: [
      d('d4a', 'bumper-front', 'Para-choque dianteiro', 'scratch', 'medium', 'frontal'),
      d('d4b', 'door-rr', 'Porta traseira direita', 'dent', 'medium', 'lateral-right'),
    ],
    geo: { lat: -23.58, lng: -46.66, address: 'São Paulo, SP' },
  }

  store.linkInspection(i1)
  store.linkInspection(i2)
  store.linkInspection(i3)
  store.linkInspection(i4)

  store.createVehicle({
    id: 'veh-xyz',
    tenantId: TENANT,
    plate: 'XYZ9K88',
    brand: 'Fiat',
    model: 'Strada',
    color: 'Branco',
    vehicleType: 'car',
  })
  store.linkInspection({
    id: 'insp-x1',
    vehicleId: 'veh-xyz',
    tenantId: TENANT,
    status: 'issued',
    plateAtInspection: 'XYZ9K88',
    inspectedAt: '2026-06-01T09:00:00.000Z',
    publicCode: 'DA-2026-000050',
    damages: [d('dx1', 'hood', 'Capô', 'dent', 'high', 'frontal')],
  })
}

export const LAB_TENANT = TENANT
