import type { VehicleInfo, ViewType } from '@/src/types'

/** Ordem padrão das 4 fotos de contexto (~90° entre faces). */
export const VIEW_PHOTO_ORDER: ViewType[] = [
  'lateral-left',
  'frontal',
  'lateral-right',
  'traseira',
]

export function getViewPhoto(info: VehicleInfo | Partial<VehicleInfo>, view: ViewType): string {
  return info.viewPhotos?.[view] || ''
}

export function countPendingViewPhotos(info: VehicleInfo | Partial<VehicleInfo>): number {
  return (info.pendingViewPhotoRefs || []).filter(Boolean).length
}

/** Conta só fotos já confirmadas em `viewPhotos` (rascunho/pending não conta). */
export function countFilledViewPhotos(info: VehicleInfo | Partial<VehicleInfo>): number {
  const vp = info.viewPhotos || {}
  return VIEW_PHOTO_ORDER.filter((v) => Boolean(vp[v])).length
}

export function hasAllViewPhotos(info: VehicleInfo | Partial<VehicleInfo>): boolean {
  return countFilledViewPhotos(info) === VIEW_PHOTO_ORDER.length
}

export function missingViewPhotos(info: VehicleInfo | Partial<VehicleInfo>): ViewType[] {
  const vp = info.viewPhotos || {}
  return VIEW_PHOTO_ORDER.filter((v) => !vp[v])
}
