import { Damage } from '../types'
import { fileToDataUrl, dataUrlToBlob, compressBlobForStorage } from './imageUtils'
import { createId } from './id'
import { db } from './db'
import {
  buildStoragePath,
  downloadPhotoBlob,
  getStoragePublicUrl,
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

export { isStorageRef, toStorageRef, normalizeRemotePhotoRef, getStoragePublicUrl }

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

    return getStoragePublicUrl(path)
  }

  return ref
}

export async function deletePhotoRef(ref: string): Promise<void> {
  if (isPhotoRef(ref)) {
    await db.deletePhoto(ref.slice(PHOTO_REF_PREFIX.length))
  }
}

/** Faz upload das fotos locais e devolve damages com caminhos relativos para o Postgres. */
export async function uploadDamagePhotosForSync(
  damages: Damage[],
  userId: string,
  inspectionId: string,
): Promise<{ remoteDamages: Damage[]; localDamages: Damage[] }> {
  const remoteDamages: Damage[] = []
  const localDamages: Damage[] = []
  const uploadTotal = countPhotosNeedingUpload(damages)
  let uploadDone = 0

  if (uploadTotal > 0) {
    startPhotoUploadProgress(uploadTotal, 'Sincronizando fotos com a nuvem…')
  }

  try {
    for (const d of damages) {
      const remotePhotos: string[] = []
      const localPhotos: string[] = []

      for (const ref of d.photos) {
        if (isStorageRef(ref)) {
          const path = storagePathFromRef(ref)
          remotePhotos.push(path)
          localPhotos.push(ref)
          continue
        }

        if (!isPhotoRef(ref) && !isInlinePhoto(ref) && ref.includes('/')) {
          remotePhotos.push(ref)
          localPhotos.push(toStorageRef(ref))
          continue
        }

        if (!photoNeedsCloudUpload(ref)) {
          remotePhotos.push(ref)
          localPhotos.push(ref)
          continue
        }

        const blob = await blobFromRef(ref)
        if (!blob) {
          remotePhotos.push(ref)
          localPhotos.push(ref)
          continue
        }

        updatePhotoUploadProgress({
          phase: 'compressing',
          current: uploadDone,
          label: `Otimizando foto ${uploadDone + 1} de ${uploadTotal}`,
        })

        const compressed = await compressBlobForStorage(blob)
        const photoId = createId()
        const path = buildStoragePath(userId, inspectionId, d.id, photoId)

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

        remotePhotos.push(path)
        localPhotos.push(toStorageRef(path))
      }

      remoteDamages.push({ ...d, photos: remotePhotos })
      localDamages.push({ ...d, photos: localPhotos })
    }

    return { remoteDamages, localDamages }
  } finally {
    if (uploadTotal > 0) finishPhotoUploadProgress()
  }
}

export async function resolvePhotosForSync(photos: string[]): Promise<string[]> {
  return Promise.all(photos.map(async (ref) => {
    if (isStorageRef(ref) || (!isInlinePhoto(ref) && !isPhotoRef(ref) && ref.includes('/'))) {
      const path = storagePathFromRef(normalizeRemotePhotoRef(ref))
      return getStoragePublicUrl(path)
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

export async function prefetchReportPhotoCache(damages: Damage[]): Promise<void> {
  if (!supabaseEnabled || !navigator.onLine) return
  for (const d of damages) {
    for (const ref of d.photos) {
      if (isStorageRef(ref) || (!isInlinePhoto(ref) && !isPhotoRef(ref) && ref.includes('/'))) {
        await cacheStoragePhoto(ref)
      }
    }
  }
}

export function normalizeDamagePhotos(photos: string[]): string[] {
  return photos.map(normalizeRemotePhotoRef)
}
