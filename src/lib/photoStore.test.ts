import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// resolvePhotoUrl feeds the PDF export pipeline (ReportActions -> generatePdf).
// Storage-backed photos ('storage:' refs) that aren't cached locally used to
// fall through to getStorageSignedUrl even while offline — a network call
// that stalls the whole PDF export instead of failing fast. This suite locks
// in the offline-first fallback: uncached + offline => '' immediately.

const photoRecords = new Map<string, { id: string; blob: Blob; storagePath?: string }>()

vi.mock('./db', () => ({
  db: {
    getPhoto: async (id: string) => photoRecords.get(id) ?? null,
    getPhotoByStoragePath: async (path: string) =>
      [...photoRecords.values()].find(r => r.storagePath === path) ?? null,
    putPhoto: async (record: { id: string; blob: Blob; storagePath?: string }) => {
      photoRecords.set(record.id, record)
    },
  },
}))

const signedUrlSpy = vi.fn(async (_path?: string, _expires?: number) => 'https://signed.example/photo.jpg')
const downloadSpy = vi.fn(async (_path?: string) => null as Blob | null)

vi.mock('./photoStorage', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./photoStorage')>()
  return {
    ...actual,
    getStorageSignedUrl: (...args: Parameters<typeof actual.getStorageSignedUrl>) => signedUrlSpy(...args),
    downloadPhotoBlob: (...args: Parameters<typeof actual.downloadPhotoBlob>) => downloadSpy(...args),
  }
})

vi.mock('./supabase', () => ({ supabase: null, supabaseEnabled: true }))

let onLineValue = true
beforeEach(() => {
  photoRecords.clear()
  signedUrlSpy.mockClear()
  downloadSpy.mockClear()
  onLineValue = true
  vi.stubGlobal('navigator', { get onLine() { return onLineValue } })
  // Node test environment has no FileReader — fileToDataUrl() (used by the
  // cache-hit path) needs a minimal shim to turn a Blob into a data: URL.
  vi.stubGlobal('FileReader', class {
    onload: (() => void) | null = null
    onerror: (() => void) | null = null
    result: string | null = null
    readAsDataURL(blob: Blob) {
      blob.arrayBuffer().then((buf) => {
        const base64 = Buffer.from(buf).toString('base64')
        this.result = `data:${blob.type || 'application/octet-stream'};base64,${base64}`
        this.onload?.()
      })
    }
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('resolvePhotoUrl — offline resilience for storage-backed photos', () => {
  it('does not attempt a signed-URL network call when offline and uncached', async () => {
    const { resolvePhotoUrl } = await import('./photoStore')
    onLineValue = false
    const result = await resolvePhotoUrl('storage:user1/insp1/dmg1/photo1.jpg')
    expect(result).toBe('')
    expect(signedUrlSpy).not.toHaveBeenCalled()
    expect(downloadSpy).not.toHaveBeenCalled()
  })

  it('still resolves from the local cache when offline, if the photo was cached before', async () => {
    const { resolvePhotoUrl } = await import('./photoStore')
    const blob = new Blob(['fake-image-bytes'], { type: 'image/jpeg' })
    photoRecords.set('cached-id', { id: 'cached-id', blob, storagePath: 'user1/insp1/dmg1/photo1.jpg' })
    onLineValue = false
    const result = await resolvePhotoUrl('storage:user1/insp1/dmg1/photo1.jpg')
    expect(result).toMatch(/^data:image\/jpeg;base64,/)
    expect(signedUrlSpy).not.toHaveBeenCalled()
  })

  it('falls back to a signed URL only when online and the photo cannot be downloaded/cached', async () => {
    const { resolvePhotoUrl } = await import('./photoStore')
    onLineValue = true
    const result = await resolvePhotoUrl('storage:user1/insp1/dmg1/photo1.jpg')
    expect(downloadSpy).toHaveBeenCalled()
    expect(signedUrlSpy).toHaveBeenCalled()
    expect(result).toBe('https://signed.example/photo.jpg')
  })
})
