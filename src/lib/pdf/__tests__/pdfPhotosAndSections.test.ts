import { describe, expect, it } from 'vitest'
import type { Damage, DamageId, VehicleInfo } from '../../../types'
import {
  buildDamageTable,
  buildInfoTable,
  buildInteriorSection,
  buildPhotoSection,
  buildSignature,
  buildStatusBadge,
  buildSummary,
} from '../sections'
import { resolveTheme } from '../theme'

const theme = resolveTheme('modern')

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
    photos: [],
    photoNotes: [],
    ...overrides,
  }
}

function makeVehicleInfo(overrides: Partial<VehicleInfo> = {}): VehicleInfo {
  return {
    owner: 'Maria Silva',
    phone: '11999999999',
    brand: 'Fiat Uno',
    plate: 'ABC1D23' as VehicleInfo['plate'],
    generalNotes: '',
    interiorNotes: '',
    interiorPhotos: [],
    interiorPhotoNotes: [],
    profile: 'oficina',
    ref: 'OS-000123',
    color: 'Branco',
    vehicleTypeDesc: 'Hatch',
    city: 'São Paulo',
    state: 'SP',
    ...overrides,
  }
}

describe('buildStatusBadge', () => {
  it('reports a clean vehicle when there are no damages', () => {
    expect(buildStatusBadge([], theme)).toContain('SEM AVARIAS REGISTRADAS')
  })

  it('escalates to GRAVE when any damage is high severity, even if others are lower', () => {
    const html = buildStatusBadge([makeDamage({ severity: 'low' }), makeDamage({ severity: 'high' })], theme)
    expect(html).toContain('GRAU GRAVE')
  })

  it('reports MÉDIO when the worst damage is medium', () => {
    const html = buildStatusBadge([makeDamage({ severity: 'low' }), makeDamage({ severity: 'medium' })], theme)
    expect(html).toContain('GRAU MÉDIO')
  })

  it('includes the occurrence count when damages exist', () => {
    const html = buildStatusBadge([makeDamage(), makeDamage()], theme)
    expect(html).toContain('2 ocorrências')
  })
})

describe('buildSummary', () => {
  it('counts damages per severity bucket and the total', () => {
    const html = buildSummary([
      makeDamage({ severity: 'low' }),
      makeDamage({ severity: 'low' }),
      makeDamage({ severity: 'medium' }),
      makeDamage({ severity: 'high' }),
    ], theme)
    // one <p> per stat box holds the number; check the counts appear in order low,medium,high,total
    const numbers = [...html.matchAll(/font-weight:800;color:[^;]+;line-height:1;margin:0;font-family:[^"]+">(\d+)</g)].map(m => m[1])
    expect(numbers).toEqual(['2', '1', '1', '4'])
  })

  it('renders zeros for an empty damage list', () => {
    const html = buildSummary([], theme)
    const numbers = [...html.matchAll(/font-weight:800;color:[^;]+;line-height:1;margin:0;font-family:[^"]+">(\d+)</g)].map(m => m[1])
    expect(numbers).toEqual(['0', '0', '0', '0'])
  })
})

describe('buildDamageTable', () => {
  it('shows an empty-state message when there are no damages', () => {
    const html = buildDamageTable([], undefined, theme)
    expect(html).toContain('Nenhuma avaria registrada')
  })

  it('renders one table row per damage, numbered sequentially', () => {
    const damages = [makeDamage({ partName: 'Porta dianteira' }), makeDamage({ partName: 'Capô' })]
    const html = buildDamageTable(damages, undefined, theme)
    expect(html).toContain('Porta dianteira')
    expect(html).toContain('Capô')
    expect((html.match(/page-break-inside:avoid;break-inside:avoid;">/g) ?? []).length).toBe(2)
  })

  it('falls back to an em-dash when a damage has no notes', () => {
    const html = buildDamageTable([makeDamage({ notes: '' })], undefined, theme)
    expect(html).toContain('>—<')
  })

  it('adds Status column and shows Sugestão da IA', () => {
    const damages = [
      makeDamage({
        evidenceStatus: 'sugerido',
      }),
    ]
    const html = buildDamageTable(damages, undefined, theme)
    expect(html).toMatch(/Status/i)
    expect(html).toContain('Sugestão da IA')
  })

  it('omits ignorado damages from the table', () => {
    const damages = [
      makeDamage({
        id: 'a' as DamageId,
        partName: 'Porta',
        evidenceStatus: 'confirmado',
        evidenceDecidedBy: 'Ana',
        evidenceDecidedAt: '2026-08-05T12:00:00.000Z',
      }),
      makeDamage({ id: 'b' as DamageId, partName: 'Capô', evidenceStatus: 'ignorado' }),
    ]
    const html = buildDamageTable(damages, undefined, theme)
    expect(html).toContain('Porta')
    expect(html).not.toContain('Capô')
    expect(html).toMatch(/Confirmado/)
  })
})

describe('buildInfoTable', () => {
  it('falls back to em-dash placeholders for missing fields', () => {
    const html = buildInfoTable({}, theme)
    expect(html).toContain('—')
  })

  it('renders known vehicle info fields', () => {
    const html = buildInfoTable(makeVehicleInfo({ owner: 'João Souza', plate: 'XYZ9A87' as VehicleInfo['plate'] }), theme)
    expect(html).toContain('João Souza')
    expect(html).toContain('XYZ9A87')
  })

  it('paginates custom fields two per row', () => {
    const html = buildInfoTable(makeVehicleInfo({
      customFields: [
        { id: '1', label: 'Chassi', value: 'AAA111' },
        { id: '2', label: 'Renavam', value: 'BBB222' },
        { id: '3', label: 'KM', value: '50000' },
      ],
    }), theme)
    expect(html).toContain('Chassi')
    expect(html).toContain('Renavam')
    expect(html).toContain('KM')
  })
})

describe('buildPhotoSection', () => {
  it('returns empty string when no damage has photos', () => {
    expect(buildPhotoSection([makeDamage({ photos: [] })], theme)).toBe('')
  })

  it('chunks photos into rows of 2, padding the last incomplete row', () => {
    const damage = makeDamage({ photos: ['blob:1', 'blob:2', 'blob:3', 'blob:4'], photoNotes: [] })
    const html = buildPhotoSection([damage], theme)
    const rows = html.match(/<tr style="page-break-inside:avoid[^>]*>/g) ?? []
    expect(rows).toHaveLength(2)
    expect(html).toContain('width:50%')
    expect(html).toContain('Evidência de avaria')
    expect(html).toContain('damage-evidence-photo')
  })

  it('chunks photos into rows of 3 when compact (single-page)', () => {
    const damage = makeDamage({
      photos: ['blob:1', 'blob:2', 'blob:3', 'blob:4', 'blob:5'],
      photoNotes: [],
    })
    const html = buildPhotoSection([damage], theme, true)
    expect(html).toContain('width:33.3%')
    expect(html).toContain('height:72px')
    const rows = html.match(/<tr style="page-break-inside:avoid[^>]*>/g) ?? []
    expect(rows).toHaveLength(2)
  })

  it('attaches captions from the parallel photoNotes array', () => {
    const damage = makeDamage({ photos: ['blob:1'], photoNotes: ['Risco profundo na lateral'] })
    const html = buildPhotoSection([damage], theme)
    expect(html).toContain('Risco profundo na lateral')
  })

  it('shows the total photo count in the section title', () => {
    const damages = [makeDamage({ photos: ['blob:1', 'blob:2'] }), makeDamage({ photos: ['blob:3'] })]
    const html = buildPhotoSection(damages, theme)
    expect(html).toContain('3 evidências')
  })
})

describe('buildInteriorSection', () => {
  it('returns empty string when there are no notes and no photos', () => {
    expect(buildInteriorSection(makeVehicleInfo(), theme)).toBe('')
  })

  it('renders notes-only content', () => {
    const html = buildInteriorSection(makeVehicleInfo({ interiorNotes: 'Bancos com desgaste' }), theme)
    expect(html).toContain('Bancos com desgaste')
  })

  it('renders photos-only content with captions', () => {
    const html = buildInteriorSection(makeVehicleInfo({
      interiorPhotos: ['blob:1'],
      interiorPhotoNotes: ['Painel arranhado'],
    }), theme)
    expect(html).toContain('Painel arranhado')
  })
})

describe('buildSignature', () => {
  it('reserves signature space even without captured signatures', () => {
    const html = buildSignature(makeVehicleInfo(), theme, '24/07/2026')
    expect(html).toContain('Assinatura do Vistoriador')
    expect(html).toContain('Assinatura do Responsável')
    expect(html).toContain('24/07/2026')
  })

  it('embeds captured signature images when present', () => {
    const html = buildSignature(makeVehicleInfo({
      inspectorSignature: 'data:image/png;base64,AAA',
      clientSignature: 'data:image/png;base64,BBB',
    }), theme, '24/07/2026')
    expect(html).toContain('data:image/png;base64,AAA')
    expect(html).toContain('data:image/png;base64,BBB')
  })
})
