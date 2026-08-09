import { Damage } from '../types'
import { fileToDataUrl, dataUrlToBlob, compressBlobForStorage } from './imageUtils'
import { createId } from './id'
import { db } from './db'
import {
  buildStoragePath,
  downloadPhotoBlob,
  getStorageSignedUrl,
  isStorageRef,
  normalizeRemotePhotoRef,
  storagePathFromRef,
  toStorageRef,
  uploadPhotoBlob,
} from './photoStorage'
import {
  countPhotosNeedingUpload,
  finishPhotoUploadProgress,
  photoNeedsCloudUpload,
  startPhotoUploadProgress,
  updatePhotoUploadProgress,
} from './photoUploadProgress'
import { supabaseEnabled } from './supabase'

export const PHOTO_REF_PREFIX = 'blob:'

/** Fotos processam em paralelo (compressão + upload/download), limitadas a N
 *  por vez para não estourar memória/conexões simultâneas num mobile. */
const PHOTO_CONCURRENCY = 4

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length)
  let cursor = 0
  async function worker() {
    while (cursor < items.length) {
      const index = cursor++
      results[index] = await fn(items[index], index)
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker))
  return results
}

export { isStorageRef, toStorageRef, normalizeRemotePhotoRef, getStorageSignedUrl }

export function isPhotoRef(ref: string): boolean {
  return ref.startsWith(PHOTO_REF_PREFIX)
}

export function isInlinePhoto(ref: string): boolean {
  return ref.startsWith('data:')
}

export async function storePhoto(blob: Blob, storagePath?: string): Promise<string> {
  const id = createId()
  await db.putPhoto({
    id,
    blob,
    mimeType: blob.type || 'image/jpeg',
    createdAt: Date.now(),
    storagePath,
  })
  return `${PHOTO_REF_PREFIX}${id}`
}

async function blobFromRef(ref: string): Promise<Blob | null> {
  if (isPhotoRef(ref)) {
    const record = await db.getPhoto(ref.slice(PHOTO_REF_PREFIX.length))
    return record?.blob ?? null
  }
  if (isInlinePhoto(ref)) {
    try {
      return await dataUrlToBlob(ref)
    } catch {
      return null
    }
  }
  if (isStorageRef(ref)) {
    const path = storagePathFromRef(ref)
    const cached = await db.getPhotoByStoragePath(path)
    if (cached) return cached.blob
    if (supabaseEnabled && navigator.onLine) {
      return downloadPhotoBlob(path)
    }
  }
  return null
}

/** Cacheia foto remota no IndexedDB para uso offline. */
export async function cacheStoragePhoto(ref: string): Promise<string> {
  const normalized = normalizeRemotePhotoRef(ref)
  if (!isStorageRef(normalized)) return ref

  const path = storagePathFromRef(normalized)
  const existing = await db.getPhotoByStoragePath(path)
  if (existing) return `${PHOTO_REF_PREFIX}${existing.id}`

  const blob = await downloadPhotoBlob(path)
  if (!blob) return normalized

  const id = createId()
  await db.putPhoto({
    id,
    blob,
    mimeType: blob.type || 'image/jpeg',
    createdAt: Date.now(),
    storagePath: path,
  })
  return `${PHOTO_REF_PREFIX}${id}`
}

export async function resolvePhotoUrl(ref: string): Promise<string> {
  if (isInlinePhoto(ref)) return ref

  if (isPhotoRef(ref)) {
    const record = await db.getPhoto(ref.slice(PHOTO_REF_PREFIX.length))
    if (record) return fileToDataUrl(record.blob)
    return ''
  }

  if (isStorageRef(ref)) {
    const path = storagePathFromRef(ref)
    const cached = await db.getPhotoByStoragePath(path)
    if (cached) return fileToDataUrl(cached.blob)

    if (supabaseEnabled && navigator.onLine) {
      const blob = await downloadPhotoBlob(path)
      if (blob) {
        const id = createId()
        await db.putPhoto({
          id,
          blob,
          mimeType: blob.type || 'image/jpeg',
          createdAt: Date.now(),
          storagePath: path,
        })
        return fileToDataUrl(blob)
      }
    }

    // Offline e sem cache local: não tenta assinar URL (chamada de rede que
    // travaria/demoraria o export do PDF). Melhor devolver vazio (ícone de
    // imagem quebrada no laudo) do que travar a geração inteira.
    if (!navigator.onLine) return ''

    return getStorageSignedUrl(path)
  }

  return ref
}

export async function deletePhotoRef(ref: string): Promise<void> {
  if (isPhotoRef(ref)) {
    const id = ref.slice(PHOTO_REF_PREFIX.length)
    // Best-effort: also drop linked ORIGINAL evidence (FASE 4).
    try {
      const { deleteEvidenceForOptimizedId } = await import('./photoEvidence')
      await deleteEvidenceForOptimizedId(id)
    } catch {
      /* ignore — evidence store may be unavailable on old DBs mid-upgrade */
    }
    await db.deletePhoto(id)
  }
}

/** Faz upload das fotos locais e devolve damages com caminhos relativos para o Postgres. */
export async function uploadDamagePhotosForSync(
  damages: Damage[],
  userId: string,
  inspectionId: string,
): Promise<{ remoteDamages: Damage[]; localDamages: Damage[] }> {
  const uploadTotal = countPhotosNeedingUpload(damages)
  let uploadDone = 0

  if (uploadTotal > 0) {
    startPhotoUploadProgress(uploadTotal, 'Sincronizando fotos com a nuvem…')
  }

  const remotePhotosByDamage: string[][] = damages.map(d => new Array(d.photos.length))
  const localPhotosByDamage: string[][] = damages.map(d => new Array(d.photos.length))

  const tasks: { damageIndex: number; photoIndex: number; ref: string }[] = []
  damages.forEach((d, damageIndex) => {
    d.photos.forEach((ref, photoIndex) => tasks.push({ damageIndex, photoIndex, ref }))
  })

  try {
    await mapWithConcurrency(tasks, PHOTO_CONCURRENCY, async ({ damageIndex, photoIndex, ref }) => {
      if (isStorageRef(ref)) {
        const path = storagePathFromRef(ref)
        remotePhotosByDamage[damageIndex][photoIndex] = path
        localPhotosByDamage[damageIndex][photoIndex] = ref
        return
      }

      if (!isPhotoRef(ref) && !isInlinePhoto(ref) && ref.includes('/')) {
        remotePhotosByDamage[damageIndex][photoIndex] = ref
        localPhotosByDamage[damageIndex][photoIndex] = toStorageRef(ref)
        return
      }

      if (!photoNeedsCloudUpload(ref)) {
        remotePhotosByDamage[damageIndex][photoIndex] = ref
        localPhotosByDamage[damageIndex][photoIndex] = ref
        return
      }

      const blob = await blobFromRef(ref)
      if (!blob) {
        remotePhotosByDamage[damageIndex][photoIndex] = ref
        localPhotosByDamage[damageIndex][photoIndex] = ref
        return
      }

      updatePhotoUploadProgress({
        phase: 'compressing',
        current: uploadDone,
        label: `Otimizando foto ${uploadDone + 1} de ${uploadTotal}`,
      })

      const compressed = await compressBlobForStorage(blob)
      const photoId = createId()
      const path = buildStoragePath(userId, inspectionId, damages[damageIndex].id, photoId)

      updatePhotoUploadProgress({
        phase: 'uploading',
        label: `Enviando foto ${uploadDone + 1} de ${uploadTotal}`,
      })

      await uploadPhotoBlob(compressed, path)
      uploadDone += 1
      updatePhotoUploadProgress({ current: uploadDone })

      if (isPhotoRef(ref)) {
        const record = await db.getPhoto(ref.slice(PHOTO_REF_PREFIX.length))
        if (record) {
          await db.putPhoto({ ...record, storagePath: path })
        }
      }

      remotePhotosByDamage[damageIndex][photoIndex] = path
      localPhotosByDamage[damageIndex][photoIndex] = toStorageRef(path)
    })

    const remoteDamages = damages.map((d, i) => ({ ...d, photos: remotePhotosByDamage[i] }))
    const localDamages = damages.map((d, i) => ({ ...d, photos: localPhotosByDamage[i] }))
    return { remoteDamages, localDamages }
  } finally {
    if (uploadTotal > 0) finishPhotoUploadProgress()
  }
}

/** Mesma lógica de uploadDamagePhotosForSync, para o array plano de fotos do interior
 *  (sem um "damageId" por foto — usa o literal 'interior' no lugar). */
export async function uploadInteriorPhotosForSync(
  photos: string[],
  photoNotes: string[],
  userId: string,
  inspectionId: string,
): Promise<{ remotePhotos: string[]; localPhotos: string[]; photoNotes: string[] }> {
  const uploadTotal = countPhotosNeedingUpload([{ photos }])
  let uploadDone = 0

  if (uploadTotal > 0) {
    startPhotoUploadProgress(uploadTotal, 'Sincronizando fotos do interior…')
  }

  const remotePhotos: string[] = new Array(photos.length)
  const localPhotos: string[] = new Array(photos.length)

  try {
    await mapWithConcurrency(photos, PHOTO_CONCURRENCY, async (ref, index) => {
      if (isStorageRef(ref)) {
        const path = storagePathFromRef(ref)
        remotePhotos[index] = path
        localPhotos[index] = ref
        return
      }

      if (!isPhotoRef(ref) && !isInlinePhoto(ref) && ref.includes('/')) {
        remotePhotos[index] = ref
        localPhotos[index] = toStorageRef(ref)
        return
      }

      if (!photoNeedsCloudUpload(ref)) {
        remotePhotos[index] = ref
        localPhotos[index] = ref
        return
      }

      const blob = await blobFromRef(ref)
      if (!blob) {
        remotePhotos[index] = ref
        localPhotos[index] = ref
        return
      }

      updatePhotoUploadProgress({
        phase: 'compressing',
        current: uploadDone,
        label: `Otimizando foto ${uploadDone + 1} de ${uploadTotal}`,
      })

      const compressed = await compressBlobForStorage(blob)
      const photoId = createId()
      const path = buildStoragePath(userId, inspectionId, 'interior', photoId)

      updatePhotoUploadProgress({
        phase: 'uploading',
        label: `Enviando foto ${uploadDone + 1} de ${uploadTotal}`,
      })

      await uploadPhotoBlob(compressed, path)
      uploadDone += 1
      updatePhotoUploadProgress({ current: uploadDone })

      if (isPhotoRef(ref)) {
        const record = await db.getPhoto(ref.slice(PHOTO_REF_PREFIX.length))
        if (record) {
          await db.putPhoto({ ...record, storagePath: path })
        }
      }

      remotePhotos[index] = path
      localPhotos[index] = toStorageRef(path)
    })

    return { remotePhotos, localPhotos, photoNotes }
  } finally {
    if (uploadTotal > 0) finishPhotoUploadProgress()
  }
}

/** Upload das fotos dos 4 lados (viewPhotos). */
export async function uploadViewPhotosForSync(
  viewPhotos: Partial<Record<string, string>>,
  userId: string,
  inspectionId: string,
): Promise<{
  remoteViewPhotos: Partial<Record<string, string>>
  localViewPhotos: Partial<Record<string, string>>
}> {
  const entries = Object.entries(viewPhotos).filter(([, ref]) => Boolean(ref)) as [string, string][]
  const uploadTotal = countPhotosNeedingUpload([{ photos: entries.map(([, r]) => r) }])
  let uploadDone = 0

  if (uploadTotal > 0) {
    startPhotoUploadProgress(uploadTotal, 'Sincronizando fotos dos 4 lados…')
  }

  const remoteViewPhotos: Partial<Record<string, string>> = {}
  const localViewPhotos: Partial<Record<string, string>> = {}

  try {
    await mapWithConcurrency(entries, PHOTO_CONCURRENCY, async ([view, ref]) => {
      if (isStorageRef(ref)) {
        const path = storagePathFromRef(ref)
        remoteViewPhotos[view] = path
        localViewPhotos[view] = ref
        return
      }

      if (!isPhotoRef(ref) && !isInlinePhoto(ref) && ref.includes('/')) {
        remoteViewPhotos[view] = ref
        localViewPhotos[view] = toStorageRef(ref)
        return
      }

      if (!photoNeedsCloudUpload(ref)) {
        remoteViewPhotos[view] = ref
        localViewPhotos[view] = ref
        return
      }

      const blob = await blobFromRef(ref)
      if (!blob) {
        remoteViewPhotos[view] = ref
        localViewPhotos[view] = ref
        return
      }

      updatePhotoUploadProgress({
        phase: 'compressing',
        current: uploadDone,
        label: `Otimizando foto ${uploadDone + 1} de ${uploadTotal}`,
      })

      const compressed = await compressBlobForStorage(blob)
      const photoId = createId()
      const path = buildStoragePath(userId, inspectionId, `view-${view}`, photoId)

      updatePhotoUploadProgress({
        phase: 'uploading',
        label: `Enviando foto ${uploadDone + 1} de ${uploadTotal}`,
      })

      await uploadPhotoBlob(compressed, path)
      uploadDone += 1
      updatePhotoUploadProgress({ current: uploadDone })

      if (isPhotoRef(ref)) {
        const record = await db.getPhoto(ref.slice(PHOTO_REF_PREFIX.length))
        if (record) {
          await db.putPhoto({ ...record, storagePath: path })
        }
      }

      remoteViewPhotos[view] = path
      localViewPhotos[view] = toStorageRef(path)
    })

    return { remoteViewPhotos, localViewPhotos }
  } finally {
    if (uploadTotal > 0) finishPhotoUploadProgress()
  }
}

export async function resolvePhotosForSync(photos: string[]): Promise<string[]> {
  return Promise.all(photos.map(async (ref) => {
    if (isStorageRef(ref) || (!isInlinePhoto(ref) && !isPhotoRef(ref) && ref.includes('/'))) {
      const path = storagePathFromRef(normalizeRemotePhotoRef(ref))
      return getStorageSignedUrl(path)
    }
    return resolvePhotoUrl(ref)
  }))
}

export async function resolveDamagePhotos<T extends { photos: string[] }>(damages: T[]): Promise<T[]> {
  return Promise.all(
    damages.map(async (d) => ({
      ...d,
      photos: await Promise.all(d.photos.map(resolvePhotoUrl)),
    })),
  )
}

/** Resolve um array plano de refs (usado pelas fotos do interior, sem "damage" pai). */
export async function resolvePhotos(photos: string[]): Promise<string[]> {
  return Promise.all(photos.map(resolvePhotoUrl))
}

export async function prefetchReportPhotoCache(damages: Damage[]): Promise<void> {
  if (!supabaseEnabled || !navigator.onLine) return
  const refs = damages.flatMap(d => d.photos).filter(
    ref => isStorageRef(ref) || (!isInlinePhoto(ref) && !isPhotoRef(ref) && ref.includes('/')),
  )
  await mapWithConcurrency(refs, PHOTO_CONCURRENCY, ref => cacheStoragePhoto(ref))
}

export function normalizeDamagePhotos(photos: string[]): string[] {
  return photos.map(normalizeRemotePhotoRef)
}
