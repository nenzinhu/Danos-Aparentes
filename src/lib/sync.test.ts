import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { SavedReport } from '../types'

// mergeRemoteReports é o coração da lógica que já quebrou em produção
// (ver comentário em .github/workflows/ci.yml sobre sync silenciosamente
// quebrado por semanas). Aqui isolamos a lógica de merge/last-write-wins
// mockando toda I/O real (IndexedDB, Supabase, upload de fotos) com estado
// mutável simples, sem depender de resetModules/doMock (que se mostrou
// instável entre execuções).

const dbState = {
  saved: new Map<string, SavedReport>(),
  queue: [] as { type: 'upsert' | 'delete'; reportId: string; report?: SavedReport }[],
  deleted: [] as string[],
}

const remoteState = {
  inspections: [] as SavedReport[],
}

vi.mock('./db', () => ({
  db: {
    getAllSaved: async () => [...dbState.saved.values()],
    getSyncQueue: async () => dbState.queue,
    putSaved: async (r: SavedReport) => { dbState.saved.set(r.id, r) },
    deleteSaved: async (id: string) => { dbState.deleted.push(id); dbState.saved.delete(id) },
    addToSyncQueue: async (item: { type: 'upsert' | 'delete'; reportId: string; report?: SavedReport }) => {
      dbState.queue.push(item)
    },
  },
}))

vi.mock('./supabase', () => ({
  supabase: {
    from: (table: string) => ({
      select: () => ({
        eq: async () => ({
          data: table === 'vehicle_inspections' ? remoteState.inspections : [],
          error: null,
        }),
      }),
    }),
  },
  supabaseEnabled: true,
}))

vi.mock('./reportMapping', () => ({
  // Passthrough: os testes já constroem os fixtures remotos no formato final
  // de SavedReport, então não precisamos remontar do formato raw de linhas.
  mapRemoteInspection: (insp: Record<string, unknown>) => insp as unknown as SavedReport,
}))

vi.mock('./photoStore', () => ({
  normalizeDamagePhotos: (photos: string[]) => photos,
  prefetchReportPhotoCache: vi.fn(async () => {}),
  uploadDamagePhotosForSync: vi.fn(),
  uploadInteriorPhotosForSync: vi.fn(),
}))

vi.mock('./photoStorage', () => ({
  deleteInspectionPhotos: vi.fn(async () => {}),
}))

const { mergeRemoteReports } = await import('./sync')

function makeReport(overrides: Partial<SavedReport> = {}): SavedReport {
  return {
    id: 'r1',
    savedAt: 1000,
    damages: [],
    vehicleType: 'car',
    vehicleInfo: {
      owner: '', phone: '', brand: '', plate: '', generalNotes: '', profile: '', ref: '',
      color: '', interiorNotes: '', interiorPhotos: [], interiorPhotoNotes: [],
      vehicleTypeDesc: '', city: '', state: '',
    },
    ...overrides,
  } as unknown as SavedReport
}

describe('mergeRemoteReports', () => {
  beforeEach(() => {
    dbState.saved.clear()
    dbState.queue.length = 0
    dbState.deleted.length = 0
    remoteState.inspections = []
  })

  it('remoto mais novo vence e sobrescreve o local', async () => {
    dbState.saved.set('r1', makeReport({ id: 'r1', savedAt: 1000, syncedAt: 1000 }))
    remoteState.inspections = [makeReport({ id: 'r1', savedAt: 2000 })]

    const merged = await mergeRemoteReports('user-1')

    expect(merged).toHaveLength(1)
    expect(merged[0].savedAt).toBe(2000)
    expect(dbState.saved.get('r1')?.savedAt).toBe(2000)
  })

  it('local mais novo vence e entra na fila de upsert', async () => {
    dbState.saved.set('r1', makeReport({ id: 'r1', savedAt: 3000 }))
    remoteState.inspections = [makeReport({ id: 'r1', savedAt: 1000 })]

    const merged = await mergeRemoteReports('user-1')

    expect(merged).toHaveLength(1)
    expect(merged[0].savedAt).toBe(3000)
    expect(dbState.queue).toHaveLength(1)
    expect(dbState.queue[0]).toMatchObject({ type: 'upsert', reportId: 'r1' })
  })

  it('não duplica na fila se já existe upsert pendente para o mesmo id', async () => {
    dbState.saved.set('r1', makeReport({ id: 'r1', savedAt: 3000 }))
    dbState.queue.push({ type: 'upsert', reportId: 'r1' })
    remoteState.inspections = [makeReport({ id: 'r1', savedAt: 1000 })]

    await mergeRemoteReports('user-1')

    expect(dbState.queue).toHaveLength(1)
  })

  it('remove localmente um laudo já sincronizado que sumiu do remoto', async () => {
    dbState.saved.set('r1', makeReport({ id: 'r1', savedAt: 1000, syncedAt: 1000 }))

    const merged = await mergeRemoteReports('user-1')

    expect(merged).toHaveLength(0)
    expect(dbState.deleted).toContain('r1')
  })

  it('preserva um laudo local novo (nunca sincronizado) mesmo sem contraparte remota', async () => {
    dbState.saved.set('r1', makeReport({ id: 'r1', savedAt: 1000, syncedAt: undefined }))

    const merged = await mergeRemoteReports('user-1')

    expect(merged).toHaveLength(1)
    expect(dbState.deleted).not.toContain('r1')
  })

  it('preserva um laudo local com upsert pendente mesmo sem contraparte remota', async () => {
    dbState.saved.set('r1', makeReport({ id: 'r1', savedAt: 1000, syncedAt: 1000 }))
    dbState.queue.push({ type: 'upsert', reportId: 'r1' })

    const merged = await mergeRemoteReports('user-1')

    expect(merged).toHaveLength(1)
    expect(dbState.deleted).not.toContain('r1')
  })

  it('traz um laudo novo do remoto que não existe localmente', async () => {
    remoteState.inspections = [makeReport({ id: 'r2', savedAt: 5000 })]

    const merged = await mergeRemoteReports('user-1')

    expect(merged).toHaveLength(1)
    expect(merged[0].id).toBe('r2')
    expect(dbState.saved.get('r2')?.id).toBe('r2')
  })
})
