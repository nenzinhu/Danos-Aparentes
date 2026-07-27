import { describe, expect, it } from 'vitest'
import type { Damage, DamageId, Plate, VehicleInfo } from '../../../types'
import { computeHash } from '../hash'
import {
  INTEGRITY_ALGORITHM,
  INTEGRITY_SCHEME,
  SYSTEM_VERSION,
  buildIntegrityManifest,
  hashDataUrlOrRef,
  sha256Hex,
} from '../integrityManifest'

/** 1×1 transparent PNG */
const PNG_A =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
/** 1×1 black PNG — different bytes from PNG_A */
const PNG_B =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII='

function makeVehicleInfo(overrides: Partial<VehicleInfo> = {}): VehicleInfo {
  return {
    owner: 'Maria Silva',
    phone: '11999999999',
    brand: 'Fiat Uno',
    plate: 'ABC1D23' as Plate,
    generalNotes: 'ok',
    interiorNotes: '',
    interiorPhotos: [],
    interiorPhotoNotes: [],
    profile: 'oficina',
    ref: 'OS-000123',
    color: 'Branco',
    vehicleTypeDesc: 'Hatch',
    city: 'São Paulo',
    state: 'SP',
    inspectorSignature: 'data:image/png;base64,SIG1',
    clientSignature: 'data:image/png;base64,SIG2',
    geo: { lat: -23.5, lng: -46.6, accuracy: 12, address: 'SP', capturedAt: 1700000000000 },
    ...overrides,
  }
}

function makeDamage(overrides: Partial<Damage> = {}): Damage {
  return {
    id: 'd1' as DamageId,
    vehicle: 'car',
    view: 'frontal',
    partId: 'bumper-front',
    partName: 'Para-choque dianteiro',
    type: 'scratch',
    typeName: 'Arranhão',
    severity: 'low',
    notes: '',
    photos: [PNG_A],
    photoNotes: [''],
    ...overrides,
  }
}

const TS = 1700000000000
const ISSUED = '25 de julho de 2026 às 12:00'

describe('sha256Hex', () => {
  it('returns 64 lowercase hex for a string', async () => {
    const h = await sha256Hex('hello')
    expect(h).toMatch(/^[0-9a-f]{64}$/)
  })
})

describe('hashDataUrlOrRef', () => {
  it('hashes decoded bytes for data URLs', async () => {
    const a = await hashDataUrlOrRef(PNG_A)
    const b = await hashDataUrlOrRef(PNG_B)
    expect(a).toMatch(/^[0-9a-f]{64}$/)
    expect(a).not.toBe(b)
  })

  it('hashes UTF-8 of non-data refs (storage/blob limitation)', async () => {
    const h = await hashDataUrlOrRef('storage:user/photo.jpg')
    expect(h).toBe(await sha256Hex('storage:user/photo.jpg'))
  })
})

describe('buildIntegrityManifest', () => {
  it('is deterministic for the same inputs', async () => {
    const info = makeVehicleInfo()
    const damages = [makeDamage()]
    const m1 = await buildIntegrityManifest({ info, damages, ts: TS, issuedAt: ISSUED })
    const m2 = await buildIntegrityManifest({ info, damages, ts: TS, issuedAt: ISSUED })
    expect(m1.final_hash).toBe(m2.final_hash)
    expect(m1.scheme).toBe(INTEGRITY_SCHEME)
    expect(m1.algorithm).toBe(INTEGRITY_ALGORITHM)
    expect(m1.system_version).toBe(SYSTEM_VERSION)
    expect(m1.final_hash).toMatch(/^[0-9a-f]{64}$/)
    expect(m1.pdf_hash).toBeNull()
  })

  it('changes photos_hash and final_hash when a photo data-URL changes', async () => {
    const info = makeVehicleInfo()
    const a = await buildIntegrityManifest({
      info, damages: [makeDamage({ photos: [PNG_A] })], ts: TS, issuedAt: ISSUED,
    })
    const b = await buildIntegrityManifest({
      info, damages: [makeDamage({ photos: [PNG_B] })], ts: TS, issuedAt: ISSUED,
    })
    expect(b.photos_hash).not.toBe(a.photos_hash)
    expect(b.final_hash).not.toBe(a.final_hash)
    expect(b.damages_hash).toBe(a.damages_hash)
  })

  it('changes damages_hash and final_hash when severity changes', async () => {
    const info = makeVehicleInfo()
    const a = await buildIntegrityManifest({
      info, damages: [makeDamage({ severity: 'low' })], ts: TS, issuedAt: ISSUED,
    })
    const b = await buildIntegrityManifest({
      info, damages: [makeDamage({ severity: 'high' })], ts: TS, issuedAt: ISSUED,
    })
    expect(b.damages_hash).not.toBe(a.damages_hash)
    expect(b.final_hash).not.toBe(a.final_hash)
  })

  it('changes vehicle_data_hash and final_hash when plate/owner change', async () => {
    const damages = [makeDamage()]
    const a = await buildIntegrityManifest({
      info: makeVehicleInfo({ owner: 'Maria Silva', plate: 'ABC1D23' as Plate }),
      damages, ts: TS, issuedAt: ISSUED,
    })
    const b = await buildIntegrityManifest({
      info: makeVehicleInfo({ owner: 'Outra Pessoa', plate: 'XYZ9Z99' as Plate }),
      damages, ts: TS, issuedAt: ISSUED,
    })
    expect(b.vehicle_data_hash).not.toBe(a.vehicle_data_hash)
    expect(b.final_hash).not.toBe(a.final_hash)
  })

  it('changes pdf_hash and final_hash when pdfBytes differ', async () => {
    const info = makeVehicleInfo()
    const damages = [makeDamage()]
    const a = await buildIntegrityManifest({
      info, damages, ts: TS, issuedAt: ISSUED, pdfBytes: new Uint8Array([1, 2, 3]),
    })
    const b = await buildIntegrityManifest({
      info, damages, ts: TS, issuedAt: ISSUED, pdfBytes: new Uint8Array([4, 5, 6]),
    })
    expect(a.pdf_hash).toMatch(/^[0-9a-f]{64}$/)
    expect(b.pdf_hash).not.toBe(a.pdf_hash)
    expect(b.final_hash).not.toBe(a.final_hash)
  })

  it('keeps pdf_hash null without pdfBytes but still yields a stable final_hash', async () => {
    const info = makeVehicleInfo()
    const damages = [makeDamage()]
    const a = await buildIntegrityManifest({ info, damages, ts: TS, issuedAt: ISSUED })
    const b = await buildIntegrityManifest({ info, damages, ts: TS, issuedAt: ISSUED, pdfBytes: null })
    expect(a.pdf_hash).toBeNull()
    expect(b.pdf_hash).toBeNull()
    expect(a.final_hash).toBe(b.final_hash)
  })
})

describe('v1 computeHash compatibility', () => {
  it('still produces a 32-char uppercase hex QR hash unchanged', async () => {
    const info = makeVehicleInfo()
    const damages = [makeDamage()]
    const h1 = await computeHash(info, damages, TS)
    const h2 = await computeHash(info, damages, TS)
    expect(h1).toBe(h2)
    expect(h1).toMatch(/^[0-9A-F]{32}$/)
  })
})
