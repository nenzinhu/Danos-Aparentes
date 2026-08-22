export type PhotoUploadPhase = 'idle' | 'compressing' | 'uploading'

export interface PhotoUploadProgressState {
  active: boolean
  phase: PhotoUploadPhase
  current: number
  total: number
  label: string
}

const IDLE: PhotoUploadProgressState = {
  active: false,
  phase: 'idle',
  current: 0,
  total: 0,
  label: '',
}

let state: PhotoUploadProgressState = { ...IDLE }
const listeners = new Set<(s: PhotoUploadProgressState) => void>()

function emit() {
  for (const fn of listeners) fn(state)
}

export function getPhotoUploadProgress(): PhotoUploadProgressState {
  return state
}

export function subscribePhotoUploadProgress(listener: (s: PhotoUploadProgressState) => void): () => void {
  listeners.add(listener)
  listener(state)
  return () => listeners.delete(listener)
}

export function setPhotoUploadProgress(patch: Partial<PhotoUploadProgressState>): void {
  state = { ...state, ...patch }
  emit()
}

export function startPhotoUploadProgress(total: number, label = 'Sincronizando fotos…'): void {
  state = {
    active: total > 0,
    phase: 'compressing',
    current: 0,
    total,
    label,
  }
  emit()
}

export function updatePhotoUploadProgress(
  patch: Partial<Pick<PhotoUploadProgressState, 'phase' | 'current' | 'label'>>,
): void {
  state = { ...state, ...patch }
  emit()
}

export function finishPhotoUploadProgress(): void {
  state = { ...IDLE }
  emit()
}

export function photoNeedsCloudUpload(ref: string): boolean {
  if (ref.startsWith('storage:')) return false
  if (ref.startsWith('data:') || ref.startsWith('blob:')) return true
  return !ref.includes('/')
}

export function countPhotosNeedingUpload(damages: { photos: string[] }[]): number {
  let count = 0
  for (const d of damages) {
    for (const ref of d.photos) {
      if (photoNeedsCloudUpload(ref)) count++
    }
  }
  return count
}
