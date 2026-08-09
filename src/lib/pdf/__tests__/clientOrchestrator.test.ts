import { describe, expect, it, vi, beforeEach } from 'vitest'
import type { Damage, Plate, VehicleInfo } from '../../../types'

const generatePdfClient = vi.fn(async () => 'CLIENTHASH')
const generatePdfBlobClient = vi.fn(async () => new Blob(['client'], { type: 'application/pdf' }))

vi.mock('../render', () => ({
  generatePdf: (...args: unknown[]) => (generatePdfClient as (...a: unknown[]) => unknown)(...args),
  generatePdfBlob: (...args: unknown[]) => (generatePdfBlobClient as (...a: unknown[]) => unknown)(...args),
  revokeObjectUrlLater: vi.fn(),
}))

function makeInfo(): VehicleInfo {
  return {
    owner: 'A', phone: '', brand: 'Fiat', plate: 'ABC1D23' as Plate,
    generalNotes: '', interiorNotes: '', interiorPhotos: [], interiorPhotoNotes: [],
    profile: 'oficina', ref: 'OS-1', color: '', vehicleTypeDesc: '', city: '', state: '',
  }
}

describe('clientOrchestrator', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.unstubAllGlobals()
  })

  it('usa client quando forceClient=true', async () => {
    const { generatePdf } = await import('../clientOrchestrator')
    const hash = await generatePdf(makeInfo(), [] as Damage[], undefined, undefined, {
      accessToken: 'tok',
      forceClient: true,
    })
    expect(hash).toBe('CLIENTHASH')
    expect(generatePdfClient).toHaveBeenCalled()
  })

  it('usa client quando offline mesmo com token', async () => {
    vi.resetModules()
    vi.doMock('../render', () => ({
      generatePdf: (...args: unknown[]) => (generatePdfClient as (...a: unknown[]) => unknown)(...args),
      generatePdfBlob: (...args: unknown[]) => (generatePdfBlobClient as (...a: unknown[]) => unknown)(...args),
      revokeObjectUrlLater: vi.fn(),
    }))
    vi.stubGlobal('navigator', { onLine: false })
    const { generatePdf } = await import('../clientOrchestrator')
    await generatePdf(makeInfo(), [], undefined, undefined, { accessToken: 'tok' })
    expect(generatePdfClient).toHaveBeenCalled()
  })

  it('tenta servidor e cai no client em 503', async () => {
    vi.resetModules()
    vi.doMock('../render', () => ({
      generatePdf: (...args: unknown[]) => (generatePdfClient as (...a: unknown[]) => unknown)(...args),
      generatePdfBlob: (...args: unknown[]) => (generatePdfBlobClient as (...a: unknown[]) => unknown)(...args),
      revokeObjectUrlLater: vi.fn(),
    }))
    vi.stubGlobal('navigator', { onLine: true })
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: false,
      status: 503,
      json: async () => ({ error: 'PDF server-side indisponível' }),
    })))
    const { generatePdf } = await import('../clientOrchestrator')
    const hash = await generatePdf(makeInfo(), [], undefined, undefined, { accessToken: 'tok' })
    expect(hash).toBe('CLIENTHASH')
    expect(generatePdfClient).toHaveBeenCalled()
  })
})
