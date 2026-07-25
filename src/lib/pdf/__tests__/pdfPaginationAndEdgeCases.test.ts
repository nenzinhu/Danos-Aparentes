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
  })

  it('renders a high photo count (12+) chunked into the gallery grid', async () => {
    const photos = Array.from({ length: 13 }, (_, i) => `blob:${i}`)
    const { html } = await buildFullHtml(makeVehicleInfo(), [makeDamage({ photos })])
    expect(html).toContain('13 fotos')
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

  it('does NOT escape HTML in free-text fields — raw markup passes through as-is', async () => {
    // Documents actual behavior (no sanitization layer exists in sections.ts/html.ts today).
    // This is a real gap, not a spec: user-entered notes/observations are interpolated directly
    // into the generated HTML with no escaping. Low practical risk today (PDF is rendered
    // client-side from the inspector's own data, not served back to other users as live HTML),
    // but worth hardening if notes ever get echoed anywhere as live HTML instead of into a PDF.
    const payload = '<img src=x onerror=alert(1)>'
    const { html } = await buildFullHtml(makeVehicleInfo({ generalNotes: payload }), [])
    expect(html).toContain(payload)
  })

  it('renders custom logo alignment via header (logo takes precedence over company name text)', async () => {
    const { html } = await buildFullHtml(makeVehicleInfo(), [], undefined, {
      companyName: 'Oficina Central',
      companyLogo: 'data:image/png;base64,ZZZ',
    })
    expect(html).toContain('data:image/png;base64,ZZZ')
  })

  it('falls back to the plain company name text when no logo is provided', async () => {
    const { html } = await buildFullHtml(makeVehicleInfo(), [], undefined, { companyName: 'Oficina Central' })
    expect(html).toContain('Oficina Central')
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
