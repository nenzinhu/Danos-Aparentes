const DB_NAME = 'avarias-pwa'
/** v6: photo_evidence store for ORIGINAL bytes (FASE 4). */
const DB_VERSION = 6

export interface SyncQueueItem {
  qid: number
  type: 'upsert' | 'delete'
  reportId: string
  report?: import('../types').SavedReport
  timestamp: number
  retry_count: number
  last_error?: string
}

export interface PhotoRecord {
  id: string
  blob: Blob
  mimeType: string
  createdAt: number
  storagePath?: string
  /** FASE 4: link to photo_evidence.id (original bytes). */
  originalEvidenceId?: string
  role?: 'optimized' | 'legacy'
}

export type PhotoGps = {
  lat: number
  lng: number
  accuracy?: number | null
}

/** ORIGINAL photo bytes + evidence metadata (never overwritten by compress). */
export interface PhotoEvidenceRecord {
  id: string
  blob: Blob
  mimeType: string
  byteSize: number
  sha256: string
  optimizedPhotoId: string
  optimizedSha256?: string
  width?: number | null
  height?: number | null
  capturedAt: number
  createdAt: number
  inspectionId?: string | null
  damageId?: string | null
  userId?: string | null
  device?: string | null
  gps?: PhotoGps | null
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains('damages'))
        db.createObjectStore('damages', { keyPath: 'id' })
      if (!db.objectStoreNames.contains('metadata'))
        db.createObjectStore('metadata')
      if (!db.objectStoreNames.contains('saved_reports'))
        db.createObjectStore('saved_reports', { keyPath: 'id' })
      if (!db.objectStoreNames.contains('sync_queue'))
        db.createObjectStore('sync_queue', { keyPath: 'qid', autoIncrement: true })

      let photoStore: IDBObjectStore
      if (!db.objectStoreNames.contains('damage_photos')) {
        photoStore = db.createObjectStore('damage_photos', { keyPath: 'id' })
      } else {
        photoStore = req.transaction!.objectStore('damage_photos')
      }
      if (!photoStore.indexNames.contains('storagePath')) {
        photoStore.createIndex('storagePath', 'storagePath', { unique: false })
      }

      let evidenceStore: IDBObjectStore
      if (!db.objectStoreNames.contains('photo_evidence')) {
        evidenceStore = db.createObjectStore('photo_evidence', { keyPath: 'id' })
      } else {
        evidenceStore = req.transaction!.objectStore('photo_evidence')
      }
      if (!evidenceStore.indexNames.contains('optimizedPhotoId')) {
        evidenceStore.createIndex('optimizedPhotoId', 'optimizedPhotoId', { unique: false })
      }
      if (!evidenceStore.indexNames.contains('inspectionId')) {
        evidenceStore.createIndex('inspectionId', 'inspectionId', { unique: false })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function tx<T>(
  store: string,
  mode: IDBTransactionMode,
  fn: (s: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const t = db.transaction(store, mode)
    const s = t.objectStore(store)
    const req = fn(s)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export const db = {
  async getAllDamages(): Promise<import('../types').Damage[]> {
    return tx<import('../types').Damage[]>('damages', 'readonly', s => s.getAll())
  },
  async putDamage(d: import('../types').Damage) {
    return tx('damages', 'readwrite', s => s.put(d))
  },
  async deleteDamage(id: string) {
    return tx('damages', 'readwrite', s => s.delete(id))
  },
  async clearDamages() {
    return tx('damages', 'readwrite', s => s.clear())
  },
  async getMeta<T>(key: string): Promise<T | undefined> {
    return tx<T>('metadata', 'readonly', s => s.get(key))
  },
  async setMeta(key: string, value: unknown) {
    return tx('metadata', 'readwrite', s => s.put(value, key))
  },
  async getAllSaved(): Promise<import('../types').SavedReport[]> {
    return tx<import('../types').SavedReport[]>('saved_reports', 'readonly', s => s.getAll())
  },
  async putSaved(r: import('../types').SavedReport) {
    return tx('saved_reports', 'readwrite', s => s.put(r))
  },
  async deleteSaved(id: string) {
    return tx('saved_reports', 'readwrite', s => s.delete(id))
  },
  async getSyncQueue(): Promise<SyncQueueItem[]> {
    return tx<SyncQueueItem[]>('sync_queue', 'readonly', s => s.getAll())
  },
  async addToSyncQueue(item: Omit<SyncQueueItem, 'qid' | 'retry_count'>) {
    const queue = await this.getSyncQueue()
    if (item.type === 'upsert') {
      const existing = queue.find(q => q.type === 'upsert' && q.reportId === item.reportId)
      if (existing) {
        return this.updateSyncQueueItem({
          ...existing,
          report: item.report,
          timestamp: item.timestamp,
          last_error: undefined,
        })
      }
    }
    if (item.type === 'delete') {
      for (const pending of queue.filter(q => q.type === 'upsert' && q.reportId === item.reportId)) {
        await this.removeFromSyncQueue(pending.qid)
      }
      if (queue.some(q => q.type === 'delete' && q.reportId === item.reportId)) {
        return
      }
    }
    return tx('sync_queue', 'readwrite', s => s.add({ ...item, retry_count: 0 }))
  },
  async removeFromSyncQueue(qid: number) {
    return tx('sync_queue', 'readwrite', s => s.delete(qid))
  },
  async updateSyncQueueItem(item: SyncQueueItem) {
    return tx('sync_queue', 'readwrite', s => s.put(item))
  },
  async putPhoto(photo: PhotoRecord) {
    return tx('damage_photos', 'readwrite', s => s.put(photo))
  },
  async getPhoto(id: string): Promise<PhotoRecord | undefined> {
    return tx<PhotoRecord | undefined>('damage_photos', 'readonly', s => s.get(id))
  },
  async getPhotoByStoragePath(path: string): Promise<PhotoRecord | undefined> {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const t = db.transaction('damage_photos', 'readonly')
      const idx = t.objectStore('damage_photos').index('storagePath')
      const req = idx.get(path)
      req.onsuccess = () => resolve(req.result as PhotoRecord | undefined)
      req.onerror = () => reject(req.error)
    })
  },
  async deletePhoto(id: string) {
    return tx('damage_photos', 'readwrite', s => s.delete(id))
  },

  async putPhotoEvidence(record: PhotoEvidenceRecord) {
    return tx('photo_evidence', 'readwrite', s => s.put(record))
  },
  async getPhotoEvidence(id: string): Promise<PhotoEvidenceRecord | undefined> {
    return tx<PhotoEvidenceRecord | undefined>('photo_evidence', 'readonly', s => s.get(id))
  },
  async getPhotoEvidenceByOptimizedId(optimizedPhotoId: string): Promise<PhotoEvidenceRecord | undefined> {
    const database = await openDB()
    return new Promise((resolve, reject) => {
      const t = database.transaction('photo_evidence', 'readonly')
      const idx = t.objectStore('photo_evidence').index('optimizedPhotoId')
      const req = idx.get(optimizedPhotoId)
      req.onsuccess = () => resolve(req.result as PhotoEvidenceRecord | undefined)
      req.onerror = () => reject(req.error)
    })
  },
  async deletePhotoEvidence(id: string) {
    return tx('photo_evidence', 'readwrite', s => s.delete(id))
  },
}
