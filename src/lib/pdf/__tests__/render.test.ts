import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Damage, DamageId, Plate, VehicleInfo } from '../../../types'

// render.ts drives html2pdf.js + jsPDF — real browser rendering (Canvas, DOM
// layout) that node/vitest can't execute. What's actually testable and worth
// locking down here is the ORCHESTRATION: correct filename, correct options
// passed to html2pdf, the aspect-fit-to-A4 math, and that save()/output()
// are called as expected — not pixel-perfect rendering.

const canvasState = { width: 800, height: 600 }

const setMock = vi.fn().mockReturnThis()
const fromMock = vi.fn().mockReturnThis()
const toContainerMock = vi.fn().mockReturnThis()
const toCanvasMock = vi.fn().mockReturnThis()
const getMock = vi.fn(async () => ({
  width: canvasState.width,
  height: canvasState.height,
  toDataURL: () => 'data:image/jpeg;base64,FAKE',
}))

vi.mock('html2pdf.js', () => ({
  default: () => ({
    set: setMock,
    from: fromMock,
    toContainer: toContainerMock,
    toCanvas: toCanvasMock,
    get: getMock,
  }),
}))

const saveMock = vi.fn()
const outputMock = vi.fn(() => new Blob(['fake-pdf-bytes'], { type: 'application/pdf' }))
const addImageMock = vi.fn()

vi.mock('jspdf', () => ({
  jsPDF: vi.fn().mockImplementation(function FakeJsPdf(this: any) {
    this.internal = { pageSize: { getWidth: () => 210, getHeight: () => 297 } }
    this.addImage = addImageMock
    this.save = saveMock
    this.output = outputMock
  }),
}))

vi.mock('../html', () => ({
  buildFullHtml: vi.fn(async () => ({ html: '<html>fake</html>', hash: 'ABCDEF1234567890ABCDEF1234567890' })),
}))

beforeEach(() => {
  vi.clearAllMocks()
  canvasState.width = 800
  canvasState.height = 600
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

describe('generatePdf', () => {
  it('names the file from the plate and saves it', async () => {
    const { generatePdf } = await import('../render')
    await generatePdf(makeVehicleInfo({ plate: 'XYZ9A87' as Plate }), noDamages)
    expect(saveMock).toHaveBeenCalledWith('vistoria-XYZ9A87.pdf')
  })

  it('falls back to "sem-placa" when there is no plate', async () => {
    const { generatePdf } = await import('../render')
    await generatePdf(makeVehicleInfo({ plate: '' as Plate }), noDamages)
    expect(saveMock).toHaveBeenCalledWith('vistoria-sem-placa.pdf')
  })

  it('returns the hash computed by buildFullHtml', async () => {
    const { generatePdf } = await import('../render')
    const hash = await generatePdf(makeVehicleInfo(), noDamages)
    expect(hash).toBe('ABCDEF1234567890ABCDEF1234567890')
  })

  it('passes zero margins and the filename through to html2pdf', async () => {
    const { generatePdf } = await import('../render')
    await generatePdf(makeVehicleInfo({ plate: 'AAA1111' as Plate }), noDamages)
    expect(setMock).toHaveBeenCalledWith(expect.objectContaining({
      margin: [0, 0, 0, 0],
      filename: 'vistoria-AAA1111.pdf',
    }))
  })
})

describe('generatePdfBlob', () => {
  it('returns a Blob without calling save()', async () => {
    const { generatePdfBlob } = await import('../render')
    const blob = await generatePdfBlob(makeVehicleInfo(), noDamages)
    expect(blob).toBeInstanceOf(Blob)
    expect(saveMock).not.toHaveBeenCalled()
    expect(outputMock).toHaveBeenCalledWith('blob')
  })
})

describe('buildBadgeSnippet', () => {
  it('embeds the verify URL with the hash and the badge image', async () => {
    vi.stubGlobal('window', { location: { origin: 'https://danosaparentes.com.br' } })
    const { buildBadgeSnippet } = await import('../render')
    const html = buildBadgeSnippet('ABCDEF1234567890ABCDEF1234567890')
    expect(html).toContain('https://danosaparentes.com.br/verify?hash=ABCDEF1234567890ABCDEF1234567890')
    expect(html).toContain('https://danosaparentes.com.br/selo-laudo-verificado.svg')
    vi.unstubAllGlobals()
  })

  it('falls back to empty origin when window is not available', async () => {
    vi.unstubAllGlobals()
    const { buildBadgeSnippet } = await import('../render')
    const html = buildBadgeSnippet('ABCDEF1234567890ABCDEF1234567890')
    expect(html).toContain('href="/verify?hash=ABCDEF1234567890ABCDEF1234567890"')
  })
})

describe('renderSinglePage — aspect-fit-to-A4 math (via generatePdf)', () => {
  it('fits a wide canvas to full page width, centered vertically with no horizontal offset', async () => {
    canvasState.width = 1000
    canvasState.height = 200 // very wide/short — height-after-fit stays under A4 height
    const { generatePdf } = await import('../render')
    await generatePdf(makeVehicleInfo(), noDamages)
    const [, , x, , w] = addImageMock.mock.calls[0]
    expect(x).toBeCloseTo(0, 5) // full page width used -> no horizontal centering offset
    expect(w).toBeCloseTo(210, 5)
  })

  it('shrinks and horizontally centers a tall canvas that would overflow A4 height', async () => {
    canvasState.width = 400
    canvasState.height = 4000 // very tall — must shrink to fit page height
    const { generatePdf } = await import('../render')
    await generatePdf(makeVehicleInfo(), noDamages)
    const [, , x, y, w, h] = addImageMock.mock.calls[0]
    expect(h).toBeCloseTo(297, 5) // capped to full page height
    expect(w).toBeCloseTo((400 * 297) / 4000, 5)
    expect(x).toBeGreaterThan(0) // centered horizontally since w < pageW
    expect(y).toBe(0)
  })
})
