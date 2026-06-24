import { getSupabaseUrl } from '@/lib/supabaseEnv'
import { supabase } from './supabase'

export const STORAGE_BUCKET = 'damage-photos'
export const STORAGE_REF_PREFIX = 'storage:'

export function isStorageRef(ref: string): boolean {
  return ref.startsWith(STORAGE_REF_PREFIX)
}

export function toStorageRef(path: string): string {
  if (isStorageRef(path)) return path
  if (path.startsWith('data:')) return path
  return `${STORAGE_REF_PREFIX}${path}`
}

/** Caminho no bucket: {userId}/{inspectionId}/{damageId}/{photoId}.jpg */
export function buildStoragePath(
  userId: string,
  inspectionId: string,
  damageId: string,
  photoId: string,
): string {
  return `${userId}/${inspectionId}/${damageId}/${photoId}.jpg`
}

export function storagePathFromRef(ref: string): string {
  return ref.startsWith(STORAGE_REF_PREFIX) ? ref.slice(STORAGE_REF_PREFIX.length) : ref
}

export function normalizeRemotePhotoRef(ref: string): string {
  if (ref.startsWith('data:')) return ref
  if (isStorageRef(ref)) return ref
  // Caminho relativo vindo do Postgres
  return toStorageRef(ref)
}

export function getStoragePublicUrl(path: string): string {
  const base = getSupabaseUrl()
  if (!base) return ''
  const clean = path.replace(/^\//, '')
  return `${base}/storage/v1/object/public/${STORAGE_BUCKET}/${clean}`
}

export async function uploadPhotoBlob(
  blob: Blob,
  path: string,
): Promise<string> {
  if (!supabase) throw new Error('Supabase não configurado')
  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, blob, {
    upsert: true,
    contentType: blob.type || 'image/jpeg',
    cacheControl: '31536000',
  })
  if (error) throw error
  return toStorageRef(path)
}

export async function downloadPhotoBlob(path: string): Promise<Blob | null> {
  if (!supabase) return null
  const { data, error } = await supabase.storage.from(STORAGE_BUCKET).download(path)
  if (error || !data) return null
  return data
}

export async function deleteStoragePaths(paths: string[]): Promise<void> {
  if (!supabase || paths.length === 0) return
  const { error } = await supabase.storage.from(STORAGE_BUCKET).remove(paths)
  if (error) console.warn('Falha ao remover fotos do Storage:', error.message)
}

async function listStorageFiles(folder: string): Promise<string[]> {
  if (!supabase) return []
  const { data, error } = await supabase.storage.from(STORAGE_BUCKET).list(folder, { limit: 500 })
  if (error || !data) return []

  const paths: string[] = []
  for (const item of data) {
    const itemPath = `${folder}/${item.name}`
    if (item.metadata) {
      paths.push(itemPath)
    } else {
      paths.push(...await listStorageFiles(itemPath))
    }
  }
  return paths
}

export async function deleteInspectionPhotos(userId: string, inspectionId: string): Promise<void> {
  const prefix = `${userId}/${inspectionId}`
  const paths = await listStorageFiles(prefix)
  await deleteStoragePaths(paths)
}

export function collectStoragePathsFromReport(
  damages: { photos: string[] }[],
): string[] {
  const paths: string[] = []
  for (const d of damages) {
    for (const ref of d.photos) {
      if (isStorageRef(ref)) paths.push(storagePathFromRef(ref))
      else if (!ref.startsWith('data:') && !ref.startsWith('blob:') && ref.includes('/')) {
        paths.push(ref)
      }
    }
  }
  return paths
}
