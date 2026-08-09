import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Damage, DamageId, Plate, VehicleInfo } from '../../../types'
import { buildFullHtml } from '../html'

beforeEach(() => {
  vi.stubGlobal('window', { location: { origin: 'https://app.test' } })
})

vi.mock('../../supabase', () => ({ supabase: null, supabaseEnabled: false }))

function makeVehicleInfo(overrides: Partial<VehicleInfo> = {}): VehicleInfo {
  return {
    owner: 'Maria Silva',
    phone: '11999999999',
    brand: 'Fiat Uno',
    plate: 'ABC1D23' as Plate,
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

describe('buildFullHtml — boundary scenarios', () => {
  it('renders a clean "no damages" report and still returns a valid hash', async () => {
    const { html, hash } = await buildFullHtml(makeVehicleInfo(), [])
    expect(html).toContain('VEÍCULO SEM AVARIAS REGISTRADAS')
    expect(html).toContain('Nenhuma avaria registrada')
    expect(hash).toMatch(/^[0-9A-F]{32}$/)
  })

  it('renders a high-volume damage report (15+ damages) without throwing', async () => {
    const damages = Array.from({ length: 17 }, (_, i) =>
      makeDamage({ id: `d${i}` as DamageId, partName: `Peça ${i}`, severity: i % 3 === 0 ? 'high' : 'low' }))
    const { html } = await buildFullHtml(makeVehicleInfo(), damages)
    expect(html).toContain('Peça 0')
    expect(html).toContain('Peça 16')
    expect(html).toContain('AVARIAS DE GRAU GRAVE DETECTADAS')
  })

  it('omits the photo gallery section entirely when no damage has photos', async () => {
    const { html } = await buildFullHtml(makeVehicleInfo(), [makeDamage({ photos: [] })])
    expect(html).not.toContain('GALERIA FOTOGRÁFICA')
    expect(html).not.toContain('FOTOS DAS AVARIAS')
  })

  it('renders a high photo count (12+) chunked into the gallery grid', async () => {
    const photos = Array.from({ length: 13 }, (_, i) => `blob:${i}`)
    const { html } = await buildFullHtml(makeVehicleInfo(), [makeDamage({ photos })])
    expect(html).toContain('13 evidências')
    expect(html).toContain('FOTOS DAS AVARIAS')
  })

  it('preserves very long free-text notes (1000+ chars) verbatim', async () => {
    const longNote = 'A'.repeat(1200)
    const { html } = await buildFullHtml(makeVehicleInfo({ generalNotes: longNote }), [])
    expect(html).toContain(longNote)
  })

  it('preserves UTF-8 / emoji content in notes without corruption', async () => {
    const note = 'Arranhão profundo 🚗💥 — revisar amanhã'
    const { html } = await buildFullHtml(makeVehicleInfo(), [makeDamage({ notes: note })])
    expect(html).toContain(note)
  })

  it('escapes HTML in free-text fields to prevent XSS / markup corruption', async () => {
    const payload = '<img src=x onerror=alert(1)>'
    const { html } = await buildFullHtml(makeVehicleInfo({ generalNotes: payload }), [])
    expect(html).not.toContain('<img src=x onerror=alert(1)>')
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;')
  })

  it('renders custom logo alignment via header (logo takes precedence over company name text)', async () => {
    const { html } = await buildFullHtml(makeVehicleInfo(), [], undefined, {
      companyName: 'Oficina Central',
      companyLogo: 'data:image/png;base64,ZZZ',
    })
    expect(html).toContain('data:image/png;base64,ZZZ')
  })

  it('shows the plain company name text when no logo is provided', async () => {
    const { html } = await buildFullHtml(makeVehicleInfo(), [], undefined, { companyName: 'Oficina Central' })
    expect(html).toContain('Oficina Central')
    expect(html).not.toContain('logo-full.png')
  })

  it('omits header logo and company name when client branding is unset', async () => {
    const { html } = await buildFullHtml(makeVehicleInfo(), [])
    expect(html).not.toContain('logo-full.png')
    // No forced client brand in header/footer extremity; minimal product attribution stays
    expect(html).not.toContain('>Danos Aparentes</p>')
    expect(html).toContain('Danos Aparentes · vistoria')
  })

  it('shows client logo and company name in footer extremity only when set', async () => {
    const { html } = await buildFullHtml(makeVehicleInfo(), [], undefined, {
      companyName: 'Oficina Norte',
      companyLogo: 'data:image/png;base64,FOOTERLOGO',
    })
    expect(html).toContain('pdf-footer-extremity')
    expect(html).toContain('Oficina Norte')
    expect(html).toContain('data:image/png;base64,FOOTERLOGO')
  })

  it('combines 4-side photos with SVG only on damaged sides', async () => {
    const info = makeVehicleInfo({
      viewPhotos: {
        'lateral-left': 'blob:left',
        frontal: 'blob:front',
        'lateral-right': 'blob:right',
        traseira: 'blob:rear',
      },
    })
    const svgData = {
      svgCaptures: {
        'lateral-left': '<svg data-view="ll"></svg>',
        frontal: '<svg data-view="f"></svg>',
        'lateral-right': '<svg data-view="lr"></svg>',
        traseira: '<svg data-view="t"></svg>',
      },
    }
    const { html } = await buildFullHtml(info, [makeDamage({ view: 'frontal' })], svgData as any)
    expect(html).toContain('section-views-combined')
    expect(html).toContain('FOTOS DOS 4 LADOS')
    expect(html).toContain('view-side-em')
    expect(html).toContain('view-side-mini')
    expect(html).toContain('AVARIAS DESTACADAS')
    expect(html).toContain('DIAGRAMAS COM AVARIA')
    expect(html).toContain('Dados do cliente')
    expect(html).toContain('Dados do veículo')
    // SVG só na vista com avaria (frontal) — não dumpa os 4 vazios
    expect(html).toContain('data-view="f"')
    expect(html).not.toContain('data-view="ll"')
    expect(html).not.toContain('DIAGNÓSTICO VISUAL — 4 VISTAS')
  })

  it('renders a diagonal watermark overlay when settings.watermark is set', async () => {
    const { html } = await buildFullHtml(makeVehicleInfo(), [], undefined, { watermark: 'AMOSTRA' })
    expect(html).toContain('AMOSTRA')
    expect(html).toContain('rotate(-32deg)')
    expect(html).toContain('pointer-events:none')
  })

  it('omits the watermark overlay entirely when not set', async () => {
    const { html } = await buildFullHtml(makeVehicleInfo(), [])
    expect(html).not.toContain('rotate(-32deg)')
  })
})

describe('buildFullHtml — theme matrix', () => {
  const themes = ['modern', 'editorial', 'tecnico', 'corporativo', 'minimalista', 'vibrante'] as const

  it.each(themes)('compiles cleanly under the %s theme', async (pdfTheme) => {
    const { html, hash } = await buildFullHtml(makeVehicleInfo(), [makeDamage()], undefined, { pdfTheme })
    expect(html).toContain(`theme-${pdfTheme}`)
    expect(hash).toMatch(/^[0-9A-F]{32}$/)
  })
})

describe('buildFullHtml — workload benchmark', () => {
  it('compiles a 50-damage report within a reasonable time budget', async () => {
    const damages = Array.from({ length: 50 }, (_, i) =>
      makeDamage({ id: `d${i}` as DamageId, partName: `Peça ${i}` }))
    const start = performance.now()
    const { html } = await buildFullHtml(makeVehicleInfo(), damages)
    const elapsed = performance.now() - start
    expect(html).toContain('Peça 49')
    // Generous budget for a node test runner (no CI hardware guarantee) — this benchmark exists
    // to catch pathological O(n^2) regressions, not to enforce a tight production SLA.
    expect(elapsed).toBeLessThan(1000)
  })
})
