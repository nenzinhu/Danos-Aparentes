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
  queue: [] as {
    qid: number
    type: 'upsert' | 'delete'
    reportId: string
    report?: SavedReport
    timestamp: number
    retry_count: number
    last_error?: string
  }[],
  deleted: [] as string[],
  nextQid: 1,
}

const remoteState = {
  inspections: [] as SavedReport[],
  syncErrors: [] as Record<string, unknown>[],
  upsertShouldFail: false,
}

vi.mock('./db', () => ({
  db: {
    getAllSaved: async () => [...dbState.saved.values()],
    getSyncQueue: async () => dbState.queue,
    putSaved: async (r: SavedReport) => { dbState.saved.set(r.id, r) },
    deleteSaved: async (id: string) => { dbState.deleted.push(id); dbState.saved.delete(id) },
    addToSyncQueue: async (item: {
      type: 'upsert' | 'delete'
      reportId: string
      report?: SavedReport
      timestamp: number
    }) => {
      const queue = dbState.queue
      if (item.type === 'upsert') {
        const existing = queue.find(q => q.type === 'upsert' && q.reportId === item.reportId)
        if (existing) {
          existing.report = item.report
          existing.timestamp = item.timestamp
          existing.last_error = undefined
          return
        }
      }
      if (item.type === 'delete') {
        dbState.queue = queue.filter(q => !(q.type === 'upsert' && q.reportId === item.reportId))
        if (dbState.queue.some(q => q.type === 'delete' && q.reportId === item.reportId)) return
      }
      dbState.queue.push({
        ...item,
        qid: dbState.nextQid++,
        retry_count: 0,
      })
    },
    removeFromSyncQueue: async (qid: number) => {
      dbState.queue = dbState.queue.filter(q => q.qid !== qid)
    },
    updateSyncQueueItem: async (item: (typeof dbState.queue)[number]) => {
      const idx = dbState.queue.findIndex(q => q.qid === item.qid)
      if (idx >= 0) dbState.queue[idx] = item
    },
  },
}))

vi.mock('./supabase', () => ({
  supabase: {
    from: (table: string) => {
      if (table === 'sync_errors') {
        return {
          insert: async (row: Record<string, unknown>) => {
            remoteState.syncErrors.push(row)
            return { error: null }
          },
        }
      }

      // Chainable builder that supports both:
      //   await select().eq()  → { data, error }  (pullRemote)
      //   await select().eq().eq().maybeSingle()  (issued lock / delete guard)
      function makeSelectChain() {
        const state: { filters: Array<[string, unknown]> } = { filters: [] }
        const api: Record<string, unknown> = {}
        api.eq = (col: string, val: unknown) => {
          state.filters.push([col, val])
          return api
        }
        api.maybeSingle = async () => {
          const idFilter = state.filters.find(([c]) => c === 'id')
          const list = remoteState.inspections as SavedReport[]
          const found = idFilter
            ? list.find(r => r.id === idFilter[1])
            : list[0]
          return {
            data: found ? { status: found.status ?? 'complete', id: found.id } : null,
            error: null,
          }
        }
        // Thenable: `await select().eq(...)` resolves to { data, error }
        api.then = (
          resolve: (v: { data: unknown; error: null }) => void,
          reject?: (e: unknown) => void,
        ) => {
          try {
            resolve({
              data: table === 'vehicle_inspections' ? remoteState.inspections : [],
              error: null,
            })
          } catch (e) {
            reject?.(e)
          }
        }
        return api
      }

      return {
        select: () => makeSelectChain(),
        upsert: async () => ({
          error: remoteState.upsertShouldFail ? { message: 'upsert failed' } : null,
        }),
        update: () => {
          const api: Record<string, unknown> = {}
          api.eq = () => api
          api.then = (resolve: (v: { error: null }) => void) => resolve({ error: null })
          return api
        },
        delete: () => ({
          eq: async () => ({ error: null }),
        }),
      }
    },
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
  uploadDamagePhotosForSync: vi.fn(async (damages: SavedReport['damages']) => ({
    remoteDamages: damages,
    localDamages: damages,
  })),
  uploadInteriorPhotosForSync: vi.fn(async (photos: string[], notes: string[]) => ({
    remotePhotos: photos,
    localPhotos: photos,
    localNotes: notes,
  })),
  uploadViewPhotosForSync: vi.fn(async (viewPhotos: Record<string, string | undefined>) => ({
    remoteViewPhotos: viewPhotos,
    localViewPhotos: viewPhotos,
  })),
}))

vi.mock('./photoStorage', () => ({
  deleteInspectionPhotos: vi.fn(async () => {}),
}))

const { mergeRemoteReports, flushQueue } = await import('./sync')

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
    dbState.nextQid = 1
    remoteState.inspections = []
    remoteState.syncErrors = []
    remoteState.upsertShouldFail = false
  })

  it('remoto mais novo vence e sobrescreve o local', async () => {
    dbState.saved.set('r1', makeReport({ id: 'r1', savedAt: 1000, syncedAt: 1000 }))
    remoteState.inspections = [makeReport({ id: 'r1', savedAt: 2000 })]

    const merged = await mergeRemoteReports('user-1')

    expect(merged.reports).toHaveLength(1)
    expect(merged.reports[0].savedAt).toBe(2000)
    expect(dbState.saved.get('r1')?.savedAt).toBe(2000)
  })

  it('local mais novo vence e entra na fila de upsert', async () => {
    dbState.saved.set('r1', makeReport({ id: 'r1', savedAt: 3000 }))
    remoteState.inspections = [makeReport({ id: 'r1', savedAt: 1000 })]

    const merged = await mergeRemoteReports('user-1')

    expect(merged.reports).toHaveLength(1)
    expect(merged.reports[0].savedAt).toBe(3000)
    expect(dbState.queue).toHaveLength(1)
    expect(dbState.queue[0]).toMatchObject({ type: 'upsert', reportId: 'r1' })
  })

  it('não duplica na fila se já existe upsert pendente para o mesmo id', async () => {
    dbState.saved.set('r1', makeReport({ id: 'r1', savedAt: 3000 }))
    dbState.queue.push({ qid: 1, type: 'upsert', reportId: 'r1', timestamp: 1000, retry_count: 0 })
    remoteState.inspections = [makeReport({ id: 'r1', savedAt: 1000 })]

    await mergeRemoteReports('user-1')

    expect(dbState.queue).toHaveLength(1)
  })

  it('remove localmente um laudo já sincronizado que sumiu do remoto', async () => {
    dbState.saved.set('r1', makeReport({ id: 'r1', savedAt: 1000, syncedAt: 1000 }))

    const merged = await mergeRemoteReports('user-1')

    expect(merged.reports).toHaveLength(0)
    expect(dbState.deleted).toContain('r1')
  })

  it('preserva um laudo local novo (nunca sincronizado) mesmo sem contraparte remota', async () => {
    dbState.saved.set('r1', makeReport({ id: 'r1', savedAt: 1000, syncedAt: undefined }))

    const merged = await mergeRemoteReports('user-1')

    expect(merged.reports).toHaveLength(1)
    expect(dbState.deleted).not.toContain('r1')
  })

  it('preserva um laudo local com upsert pendente mesmo sem contraparte remota', async () => {
    dbState.saved.set('r1', makeReport({ id: 'r1', savedAt: 1000, syncedAt: 1000 }))
    dbState.queue.push({ qid: 1, type: 'upsert', reportId: 'r1', timestamp: 1000, retry_count: 0 })

    const merged = await mergeRemoteReports('user-1')

    expect(merged.reports).toHaveLength(1)
    expect(dbState.deleted).not.toContain('r1')
  })

  it('traz um laudo novo do remoto que não existe localmente', async () => {
    remoteState.inspections = [makeReport({ id: 'r2', savedAt: 5000 })]

    const merged = await mergeRemoteReports('user-1')

    expect(merged.reports).toHaveLength(1)
    expect(merged.reports[0].id).toBe('r2')
    expect(dbState.saved.get('r2')?.id).toBe('r2')
  })

  it('protege laudo local emitido contra remoto unlocked mais novo', async () => {
    dbState.saved.set('r1', makeReport({ id: 'r1', savedAt: 1000, status: 'issued', syncedAt: 1000 }))
    remoteState.inspections = [makeReport({ id: 'r1', savedAt: 9000, status: 'complete' })]

    const merged = await mergeRemoteReports('user-1')

    expect(merged.reports[0].status).toBe('issued')
    expect(merged.reports[0].savedAt).toBe(1000)
    expect(dbState.queue).toHaveLength(1)
    expect(dbState.queue[0]).toMatchObject({ type: 'upsert', reportId: 'r1' })
  })

  it('aceita remoto emitido quando o local ainda é draft', async () => {
    dbState.saved.set('r1', makeReport({ id: 'r1', savedAt: 5000, status: 'draft' }))
    remoteState.inspections = [makeReport({ id: 'r1', savedAt: 1000, status: 'issued' })]

    const merged = await mergeRemoteReports('user-1')

    expect(merged.reports[0].status).toBe('issued')
    expect(merged.reports[0].savedAt).toBe(1000)
  })

  it('não apaga laudo local emitido se sumiu do pull remoto', async () => {
    dbState.saved.set('r1', makeReport({ id: 'r1', savedAt: 1000, status: 'issued', syncedAt: 1000 }))

    const merged = await mergeRemoteReports('user-1')

    expect(merged.reports).toHaveLength(1)
    expect(merged.reports[0].status).toBe('issued')
    expect(dbState.deleted).not.toContain('r1')
    expect(dbState.queue).toHaveLength(1)
  })

  it('une danos de dois dispositivos no mesmo draft', async () => {
    const localDmg = {
      id: 'd-local',
      vehicle: 'car',
      view: 'frontal',
      partId: 'hood',
      partName: 'Capô',
      type: 'dent',
      typeName: 'Amassado',
      severity: 'low',
      notes: '',
      photos: [],
      photoNotes: [],
    }
    const remoteDmg = {
      id: 'd-remote',
      vehicle: 'car',
      view: 'traseira',
      partId: 'trunk',
      partName: 'Porta-malas',
      type: 'scratch',
      typeName: 'Risco',
      severity: 'medium',
      notes: '',
      photos: [],
      photoNotes: [],
    }
    dbState.saved.set('r1', makeReport({
      id: 'r1',
      savedAt: 1000,
      status: 'complete',
      damages: [localDmg as never],
    }))
    remoteState.inspections = [makeReport({
      id: 'r1',
      savedAt: 2000,
      status: 'complete',
      damages: [remoteDmg as never],
    })]

    const merged = await mergeRemoteReports('user-1')

    expect(merged.reports[0].damages).toHaveLength(2)
    expect(merged.merges.some((m) => m.multiContributor)).toBe(true)
    expect(dbState.queue.some((q) => q.type === 'upsert' && q.reportId === 'r1')).toBe(true)
  })
})

describe('flushQueue', () => {
  beforeEach(() => {
    dbState.saved.clear()
    dbState.queue.length = 0
    dbState.deleted.length = 0
    dbState.nextQid = 1
    remoteState.inspections = []
    remoteState.syncErrors = []
    remoteState.upsertShouldFail = false
  })

  it('drena upsert com sucesso e remove da fila', async () => {
    const report = makeReport({ id: 'r1', savedAt: 1000 })
    dbState.queue.push({
      qid: 1,
      type: 'upsert',
      reportId: 'r1',
      report,
      timestamp: 1000,
      retry_count: 0,
    })
    dbState.saved.set('r1', report)

    const { ok, dropped } = await flushQueue('user-1')

    expect(ok).toBe(true)
    expect(dropped).toHaveLength(0)
    expect(dbState.queue).toHaveLength(0)
    expect(dbState.saved.get('r1')?.syncedAt).toBeTypeOf('number')
  })

  it('incrementa retry_count em falha transitória', async () => {
    remoteState.upsertShouldFail = true
    const report = makeReport({ id: 'r1' })
    dbState.queue.push({
      qid: 1,
      type: 'upsert',
      reportId: 'r1',
      report,
      timestamp: 1000,
      retry_count: 0,
    })

    const { ok, dropped } = await flushQueue('user-1')

    expect(ok).toBe(false)
    expect(dropped).toHaveLength(0)
    expect(dbState.queue).toHaveLength(1)
    expect(dbState.queue[0].retry_count).toBe(1)
    expect(dbState.queue[0].last_error).toBe('upsert failed')
  })

  it('após MAX_RETRIES registra sync_errors e remove da fila', async () => {
    remoteState.upsertShouldFail = true
    const report = makeReport({ id: 'r1' })
    dbState.queue.push({
      qid: 1,
      type: 'upsert',
      reportId: 'r1',
      report,
      timestamp: Date.now() - 60_000,
      retry_count: 4,
    })

    const { ok, dropped } = await flushQueue('user-1')

    expect(ok).toBe(false)
    expect(dropped).toHaveLength(1)
    expect(dropped[0]).toMatchObject({ reportId: 'r1', error: 'upsert failed' })
    expect(dbState.queue).toHaveLength(0)
    expect(remoteState.syncErrors).toHaveLength(1)
    expect(remoteState.syncErrors[0]).toMatchObject({
      user_id: 'user-1',
      type: 'upsert',
      report_id: 'r1',
      retry_count: 4,
    })
  })
})
