import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Damage, DamageId, Plate, VehicleInfo } from '../../../types'
import { computeHash, generateQrDataUrl } from '../hash'
import { pillBadge, resolveTheme, sectionTitle, THEMES } from '../theme'
import type { PdfThemeId } from '../theme'

// buildFullHtml reads window.location.origin (browser API) — shim it for the
// node test environment, matching how the real app runs client-side only.
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

describe('computeHash', () => {
  it('is deterministic for the same payload', async () => {
    const info = makeVehicleInfo()
    const damages = [makeDamage()]
    const ts = 1700000000000
    const h1 = await computeHash(info, damages, ts)
    const h2 = await computeHash(info, damages, ts)
    expect(h1).toBe(h2)
  })

  it('returns a 32-character uppercase hex string', async () => {
    const hash = await computeHash(makeVehicleInfo(), [makeDamage()], 1700000000000)
    expect(hash).toMatch(/^[0-9A-F]{32}$/)
  })

  it('changes when any damage field is tampered with after issuance', async () => {
    const info = makeVehicleInfo()
    const ts = 1700000000000
    const original = await computeHash(info, [makeDamage({ severity: 'low' })], ts)
    const tampered = await computeHash(info, [makeDamage({ severity: 'high' })], ts)
    expect(tampered).not.toBe(original)
  })

  it('changes when vehicle info is tampered with after issuance', async () => {
    const damages = [makeDamage()]
    const ts = 1700000000000
    const original = await computeHash(makeVehicleInfo({ owner: 'Maria Silva' }), damages, ts)
    const tampered = await computeHash(makeVehicleInfo({ owner: 'Outra Pessoa' }), damages, ts)
    expect(tampered).not.toBe(original)
  })

  it('changes when the timestamp changes', async () => {
    const info = makeVehicleInfo()
    const damages = [makeDamage()]
    const h1 = await computeHash(info, damages, 1700000000000)
    const h2 = await computeHash(info, damages, 1700000000001)
    expect(h1).not.toBe(h2)
  })
})

describe('generateQrDataUrl', () => {
  it('produces a base64 PNG data URL for a verification link', async () => {
    const url = await generateQrDataUrl('https://app.test/verify?hash=ABC123')
    expect(url).toMatch(/^data:image\/png;base64,/)
  })
})

describe('resolveTheme', () => {
  const themeIds: PdfThemeId[] = ['modern', 'editorial', 'tecnico', 'corporativo', 'minimalista', 'vibrante']

  it.each(themeIds)('resolves the %s static theme', (id) => {
    const theme = resolveTheme(id)
    expect(theme).toBe(THEMES[id])
    expect(theme.accentColor).toMatch(/^#[0-9a-f]{6}$/i)
  })

  it('defaults to modern when no theme id is given', () => {
    expect(resolveTheme(undefined)).toBe(THEMES.modern)
  })

  it('falls back to modern for an unknown theme id', () => {
    // @ts-expect-error — deliberately passing an invalid id to test the fallback
    expect(resolveTheme('nonexistent')).toBe(THEMES.modern)
  })
})

describe('theme render helpers', () => {
  it('pillBadge embeds the label and theme font', () => {
    const theme = resolveTheme('modern')
    const html = pillBadge('Grave', '#be123c', '#fff1f2', theme)
    expect(html).toContain('Grave')
    expect(html).toContain(theme.fontTitle)
  })

  it('sectionTitle embeds the accent color and text', () => {
    const theme = resolveTheme('tecnico')
    const html = sectionTitle('RESUMO', theme)
    expect(html).toContain('RESUMO')
    expect(html).toContain(theme.accentColor)
  })
})
