const DB_NAME = 'avarias-pwa'
const DB_VERSION = 3

export interface SyncQueueItem {
  qid: number
  type: 'upsert' | 'delete'
  reportId: string
  report?: import('../types').SavedReport
  timestamp: number
  retry_count: number
  last_error?: string
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
    return tx('sync_queue', 'readwrite', s => s.add({ ...item, retry_count: 0 }))
  },
  async removeFromSyncQueue(qid: number) {
    return tx('sync_queue', 'readwrite', s => s.delete(qid))
  },
  async updateSyncQueueItem(item: SyncQueueItem) {
    return tx('sync_queue', 'readwrite', s => s.put(item))
  },
}
