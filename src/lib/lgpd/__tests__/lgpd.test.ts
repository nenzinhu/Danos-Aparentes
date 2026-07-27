import { describe, expect, it } from 'vitest'
import { PERSONAL_DATA_INVENTORY, sensitiveFields } from '../dataInventory'
import { maskCpfDigits, maskPhone, maskDisplayName, maskSubjectPreview } from '../maskPersonal'
import { buildSubjectDataExport } from '../subjectExport'
import type { SavedReport } from '../../../types'

describe('lgpd inventory', () => {
  it('lists sensitive personal fields', () => {
    const keys = sensitiveFields().map((f) => f.key)
    expect(keys).toContain('cpf')
    expect(keys).toContain('geo')
    expect(PERSONAL_DATA_INVENTORY.length).toBeGreaterThan(5)
  })
})

describe('maskPersonal', () => {
  it('masks CPF, phone and name', () => {
    expect(maskCpfDigits('12345678900')).toBe('***.***.***-00')
    expect(maskPhone('(11) 98888-1234')).toBe('****1234')
    expect(maskDisplayName('Maria Souza Silva')).toBe('Maria ***')
  })

  it('builds minimized subject preview', () => {
    expect(
      maskSubjectPreview({
        owner: 'João Silva',
        cpf: '123.456.789-00',
        phone: '11999998888',
        plate: 'ABC1D23',
      }),
    ).toEqual({
      owner: 'João ***',
      cpf: '***.***.***-00',
      phone: '****8888',
      plate: 'ABC***3',
    })
  })
})

describe('buildSubjectDataExport', () => {
  it('exports subject package without photo blobs', () => {
    const report: SavedReport = {
      id: 'insp-1',
      savedAt: 1,
      publicCode: 'DA-2026-ABCD',
      vehicleInfo: {
        owner: 'Ana',
        phone: '11988887777',
        brand: 'VW',
        plate: 'XYZ1A23',
        generalNotes: '',
        interiorNotes: '',
        interiorPhotos: [],
        interiorPhotoNotes: [],
        profile: '',
        ref: 'OS-1',
        color: '',
        vehicleTypeDesc: 'carro',
        city: 'SP',
        state: 'SP',
        cpf: '12345678900',
        inspectorSignature: 'data:image/png;base64,xxx',
      },
      damages: [
        {
          id: 'd1',
          vehicle: 'car',
          view: 'lateral-left',
          partId: 'p1',
          partName: 'Porta',
          type: 'scratch',
          typeName: 'Risco',
          severity: 'low',
          notes: '',
          photos: ['ref1', 'ref2'],
          photoNotes: [],
        },
      ],
    }

    const pack = buildSubjectDataExport(report)
    expect(pack.schema).toBe('danos-aparentes-subject-export-v1')
    expect(pack.subject.cpf).toBe('12345678900')
    expect(pack.minimized.cpf).toBe('***.***.***-00')
    expect(pack.subject.hasInspectorSignature).toBe(true)
    expect(pack.damagesSummary[0].photoCount).toBe(2)
    expect(JSON.stringify(pack)).not.toContain('data:image/png')
  })
})
