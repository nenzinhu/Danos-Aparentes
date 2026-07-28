import { describe, expect, it, beforeEach } from 'vitest'
import {
  assertInspectionsUnchanged,
  compareInspections,
  damageIdentityKey,
  normalizePlate,
  resetAuditIdSeqForTests,
  withUpdatedPlate,
  type DamageRecord,
  type Inspection,
  type Vehicle,
} from '../src/domain'
import { VehicleEvidenceStore } from '../src/store/memoryStore'

const TENANT_A = 'tenant-a'
const TENANT_B = 'tenant-b'

function damage(partial: Partial<DamageRecord> & Pick<DamageRecord, 'id' | 'partId' | 'partName' | 'type'>): DamageRecord {
  return {
    view: 'lateral-right',
    typeName: partial.type === 'dent' ? 'Amassado' : partial.type === 'scratch' ? 'Arranhado' : 'Quebrado',
    severity: 'low',
    ...partial,
  }
}

function inspection(
  id: string,
  vehicleId: string,
  damages: DamageRecord[],
  opts?: Partial<Inspection>,
): Inspection {
  return {
    id,
    vehicleId,
    tenantId: TENANT_A,
    status: 'issued',
    plateAtInspection: 'ABC1D23',
    inspectedAt: '2026-03-01T12:00:00.000Z',
    damages,
    ...opts,
  }
}

describe('compareInspections — casos do MVP', () => {
  it('Caso 1: anterior sem danos, atual sem danos → 0 novos, 0 existentes', () => {
    const prev = inspection('p1', 'v1', [])
    const curr = inspection('c1', 'v1', [], { inspectedAt: '2026-03-15T12:00:00.000Z' })
    const r = compareInspections(prev, curr)
    expect(r.summary.newDamages).toBe(0)
    expect(r.summary.unchanged).toBe(0)
    expect(r.summary.removedOrRepaired).toBe(0)
    expect(r.summary.severityChanged).toBe(0)
  })

  it('Caso 2: anterior sem danos, atual com dano → 1 novo', () => {
    const prev = inspection('p2', 'v1', [])
    const curr = inspection('c2', 'v1', [
      damage({ id: 'd1', partId: 'bumper-front', partName: 'Para-choque dianteiro', type: 'scratch' }),
    ])
    const r = compareInspections(prev, curr)
    expect(r.summary.newDamages).toBe(1)
    expect(r.items[0].category).toBe('new')
  })

  it('Caso 3: mesmo dano em ambas → 1 existente', () => {
    const d = damage({ id: 'd1', partId: 'door-fl', partName: 'Porta dianteira esquerda', type: 'dent' })
    const prev = inspection('p3', 'v1', [{ ...d, id: 'd-prev' }])
    const curr = inspection('c3', 'v1', [{ ...d, id: 'd-curr' }])
    const r = compareInspections(prev, curr)
    expect(r.summary.unchanged).toBe(1)
    expect(r.summary.newDamages).toBe(0)
  })

  it('Caso 4: mesma identidade, severidade diferente → 1 alterado', () => {
    const base = damage({ id: 'd1', partId: 'door-rr', partName: 'Porta traseira direita', type: 'dent' })
    const prev = inspection('p4', 'v1', [{ ...base, id: 'a', severity: 'low' }])
    const curr = inspection('c4', 'v1', [{ ...base, id: 'b', severity: 'high' }])
    const r = compareInspections(prev, curr)
    expect(r.summary.severityChanged).toBe(1)
    expect(r.items[0].message).toContain('low → high')
  })

  it('Caso 5: dano anterior ausente no atual → não identificado (não afirma reparo)', () => {
    const prev = inspection('p5', 'v1', [
      damage({ id: 'd1', partId: 'hood', partName: 'Capô', type: 'scratch' }),
    ])
    const curr = inspection('c5', 'v1', [])
    const r = compareInspections(prev, curr)
    expect(r.summary.removedOrRepaired).toBe(1)
    expect(r.items[0].message).toMatch(/não identificado|Possível reparo/i)
    expect(r.items[0].message.toLowerCase()).not.toMatch(/^reparado$/)
  })

  it('Caso 6: peças diferentes → 1 novo + 1 não identificado', () => {
    const prev = inspection('p6', 'v1', [
      damage({ id: 'd1', partId: 'door-fl', partName: 'Porta FL', type: 'scratch' }),
    ])
    const curr = inspection('c6', 'v1', [
      damage({ id: 'd2', partId: 'door-rr', partName: 'Porta RR', type: 'dent' }),
    ])
    const r = compareInspections(prev, curr)
    expect(r.summary.newDamages).toBe(1)
    expect(r.summary.removedOrRepaired).toBe(1)
  })

  it('Caso 7: dois danos na mesma peça — identidades distintas', () => {
    const prev = inspection('p7', 'v1', [
      damage({ id: 'd1', partId: 'door-rr', partName: 'Porta RR', type: 'scratch', view: 'lateral-right' }),
      damage({ id: 'd2', partId: 'door-rr', partName: 'Porta RR', type: 'dent', view: 'lateral-right' }),
    ])
    const curr = inspection('c7', 'v1', [
      damage({ id: 'd3', partId: 'door-rr', partName: 'Porta RR', type: 'scratch', view: 'lateral-right' }),
      damage({ id: 'd4', partId: 'door-rr', partName: 'Porta RR', type: 'dent', view: 'lateral-right' }),
    ])
    const r = compareInspections(prev, curr)
    expect(r.summary.unchanged).toBe(2)
    const keys = new Set(prev.damages.map(damageIdentityKey))
    expect(keys.size).toBe(2)
  })

  it('Caso 7b: mesma peça, tipos diferentes sem match → incerto', () => {
    const prev = inspection('p7b', 'v1', [
      damage({ id: 'd1', partId: 'door-fr', partName: 'Porta FR', type: 'scratch' }),
    ])
    const curr = inspection('c7b', 'v1', [
      damage({ id: 'd2', partId: 'door-fr', partName: 'Porta FR', type: 'dent' }),
    ])
    const r = compareInspections(prev, curr)
    expect(r.summary.uncertain).toBe(1)
    expect(r.summary.newDamages).toBe(0)
    expect(r.summary.removedOrRepaired).toBe(0)
  })

  it('Caso 8: mudança de placa — histórico preservado pelo id interno', () => {
    const vehicle: Vehicle = {
      id: 'veh-1',
      tenantId: TENANT_A,
      plate: 'ABC1D23',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    }
    const updated = withUpdatedPlate(vehicle, 'XYZ9K88')
    expect(updated.id).toBe('veh-1')
    expect(normalizePlate(updated.plate)).toBe('XYZ9K88')

    const store = new VehicleEvidenceStore()
    store.createVehicle(vehicle)
    store.linkInspection(inspection('i1', 'veh-1', [], { plateAtInspection: 'ABC1D23' }))
    store.updatePlate('veh-1', 'XYZ9K88')
    store.linkInspection(
      inspection('i2', 'veh-1', [
        damage({ id: 'd1', partId: 'bumper-front', partName: 'Para-choque', type: 'dent' }),
      ], { plateAtInspection: 'XYZ9K88', inspectedAt: '2026-03-20T00:00:00.000Z' }),
    )
    const history = store.listInspectionsForVehicle('veh-1', TENANT_A)
    expect(history).toHaveLength(2)
    expect(store.vehicles.get('veh-1')?.plate).toBe('XYZ9K88')
  })

  it('Caso 9: multi-tenant — isolamento', () => {
    const prev = inspection('p9', 'v1', [], { tenantId: TENANT_A })
    const curr = inspection('c9', 'v1', [], { tenantId: TENANT_B })
    expect(() => compareInspections(prev, curr)).toThrow(/Multi-tenant/)

    const store = new VehicleEvidenceStore()
    store.createVehicle({ id: 'va', tenantId: TENANT_A, plate: 'AAA1A11' })
    store.createVehicle({ id: 'vb', tenantId: TENANT_B, plate: 'BBB2B22' })
    expect(store.listVehicles(TENANT_A)).toHaveLength(1)
    expect(store.listVehicles(TENANT_A)[0].id).toBe('va')
    expect(store.listVehicles(TENANT_B)[0].id).toBe('vb')
  })

  it('Caso 10: comparação de laudo issued — nenhum dado do laudo é alterado', () => {
    const prev = inspection('p10', 'v1', [
      damage({ id: 'd1', partId: 'hood', partName: 'Capô', type: 'scratch', severity: 'medium' }),
    ], { status: 'issued' })
    const curr = inspection('c10', 'v1', [
      damage({ id: 'd2', partId: 'hood', partName: 'Capô', type: 'scratch', severity: 'high' }),
    ], { status: 'issued' })
    const prevSnap = structuredClone(prev)
    const currSnap = structuredClone(curr)
    compareInspections(prev, curr)
    assertInspectionsUnchanged(prevSnap, currSnap, prev, curr)
    expect(prev.status).toBe('issued')
    expect(curr.status).toBe('issued')
    expect(prev.damages[0].severity).toBe('medium')
  })

  it('Caso 11: comparação offline — disponível localmente vs pendente sync', () => {
    const store = new VehicleEvidenceStore()
    store.createVehicle({ id: 'v11', tenantId: TENANT_A, plate: 'OFF1L11' })
    store.linkInspection(inspection('local-a', 'v11', []), { offline: false })
    store.linkInspection(
      inspection('local-b', 'v11', [
        damage({ id: 'd1', partId: 'door-fl', partName: 'Porta', type: 'dent' }),
      ], { inspectedAt: '2026-04-01T00:00:00.000Z' }),
      { offline: true },
    )

    const blocked = store.compare('local-a', 'local-b', 'user-1', { requireSynced: true })
    expect(blocked.ok).toBe(false)
    if (!blocked.ok) {
      expect(blocked.reason).toMatch(/sincronizados/)
    }

    const localOk = store.compare('local-a', 'local-b', 'user-1', { requireSynced: false })
    expect(localOk.ok).toBe(true)
    if (localOk.ok) expect(localOk.comparison.summary.newDamages).toBe(1)

    store.markSynced('local-b')
    const afterSync = store.compare('local-a', 'local-b', 'user-1', { requireSynced: true })
    expect(afterSync.ok).toBe(true)
  })

  it('Caso 12: auditoria — eventos esperados', () => {
    resetAuditIdSeqForTests()
    const store = new VehicleEvidenceStore()
    store.createVehicle({ id: 'v12', tenantId: TENANT_A, plate: 'AUD1T12' })
    store.linkInspection(inspection('a12', 'v12', []))
    store.linkInspection(
      inspection('b12', 'v12', [
        damage({ id: 'd1', partId: 'bumper-front', partName: 'Para-choque', type: 'dent' }),
      ], { inspectedAt: '2026-05-01T00:00:00.000Z' }),
    )
    const result = store.compare('a12', 'b12', 'user-auditor')
    expect(result.ok).toBe(true)
    if (!result.ok) return

    const types = store.audit.map((e) => e.eventType)
    expect(types).toContain('vehicle_created')
    expect(types).toContain('inspection_linked_to_vehicle')
    expect(types).toContain('comparison_created')

    store.review(result.comparison.id, {
      itemIdentityKey: result.comparison.items[0].identityKey,
      decision: 'accept',
      userId: 'user-auditor',
      justification: 'Confirmado visualmente',
    })
    const after = store.audit.map((e) => e.eventType)
    expect(after).toContain('comparison_reviewed')
    expect(after).toContain('damage_marked_existing')
  })
})
