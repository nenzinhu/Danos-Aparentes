import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Damage, DamageId, Plate, VehicleInfo } from '../../../types'

// registerHash writes the /verify record. This locks in that the company
// logo is actually persisted alongside the name — previously only
// companyName was threaded through, so /verify could never show a logo
// even when the original PDF had one configured.

const insertMock = vi.fn(async () => ({ error: null }))
const selectCountMock = vi.fn(async () => ({ count: 0 }))

vi.mock('../../supabase', () => ({
  supabaseEnabled: true,
  supabase: {
    auth: { getSession: async () => ({ data: { session: { user: { id: 'user-1' } } } }) },
    from: (table: string) => {
      if (table !== 'report_hashes') throw new Error(`unexpected table ${table}`)
      return {
        insert: insertMock,
        select: () => ({ eq: selectCountMock }),
      }
    },
  },
}))

beforeEach(() => {
  vi.clearAllMocks()
})

function makeVehicleInfo(overrides: Partial<VehicleInfo> = {}): VehicleInfo {
  return {
    owner: 'Maria Silva', phone: '11999999999', brand: 'Fiat Uno',
    plate: 'ABC1D23' as Plate, generalNotes: '', interiorNotes: '',
    interiorPhotos: [], interiorPhotoNotes: [], profile: 'oficina',
    ref: 'OS-000123', color: 'Branco', vehicleTypeDesc: 'Hatch',
    city: 'São Paulo', state: 'SP',
    ...overrides,
  }
}

const noDamages: Damage[] = []

describe('registerHash', () => {
  it('stores both companyName and companyLogo in the same insert', async () => {
    const { registerHash } = await import('../hash')
    await registerHash('ABCDEF1234567890ABCDEF1234567890', makeVehicleInfo(), noDamages, '25/07/2026', 'Locadora XPTO', 'data:image/png;base64,FAKELOGO')

    expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({
      company_name: 'Locadora XPTO',
      company_logo: 'data:image/png;base64,FAKELOGO',
    }))
  })

  it('stores empty strings for both when no company branding is set', async () => {
    const { registerHash } = await import('../hash')
    await registerHash('ABCDEF1234567890ABCDEF1234567890', makeVehicleInfo(), noDamages, '25/07/2026')

    expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({
      company_name: '',
      company_logo: '',
    }))
  })

  it('stores a logo even when no company name is set (independent fields)', async () => {
    const { registerHash } = await import('../hash')
    await registerHash('ABCDEF1234567890ABCDEF1234567890', makeVehicleInfo(), noDamages, '25/07/2026', undefined, 'data:image/png;base64,ONLYLOGO')

    expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({
      company_name: '',
      company_logo: 'data:image/png;base64,ONLYLOGO',
    }))
  })
})
