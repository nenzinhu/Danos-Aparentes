import type { Damage, ViewType } from '@/src/types'

/** Peça sentinela: avaria sugerida na foto da face (sem pin no SVG). */
export const VIEW_FACE_PART_ID = 'view-face'

export type ViewSideSuggestion = {
  photoRef: string
  suggestedView: ViewType
  confidence?: number
}

export type ViewSideAssignment = {
  photoRef: string
  view: ViewType
}

export function hasDuplicateViews(
  assignments: Partial<Record<string, ViewType>> | Array<{ view: ViewType }>,
): boolean {
  const views = Array.isArray(assignments)
    ? assignments.map((a) => a.view)
    : Object.values(assignments).filter(Boolean) as ViewType[]
  return new Set(views).size !== views.length
}

export function buildViewPhotosFromAssignments(
  items: ViewSideAssignment[],
): Partial<Record<ViewType, string>> {
  const out: Partial<Record<ViewType, string>> = {}
  for (const item of items) {
    if (!item.photoRef || !item.view) continue
    out[item.view] = item.photoRef
  }
  return out
}

export function canConfirmSideAssignments(
  items: ViewSideAssignment[],
): { ok: true } | { ok: false; reason: string } {
  if (!items.length) {
    return { ok: false, reason: 'Adicione pelo menos uma foto.' }
  }
  if (items.some((i) => !i.photoRef || !i.view)) {
    return { ok: false, reason: 'Escolha o lado de cada foto.' }
  }
  if (hasDuplicateViews(items)) {
    return { ok: false, reason: 'Cada lado só pode ser usado uma vez.' }
  }
  return { ok: true }
}

/** Sugestões de face ainda abertas que devem sumir ao trocar/substituir foto da vista. */
export function filterDamagesToInvalidateOnViewChange(
  damages: Damage[],
  opts: { view: ViewType; photoRef?: string },
): Damage[] {
  return damages.filter((d) => {
    if (d.partId !== VIEW_FACE_PART_ID) return false
    if (d.view !== opts.view) return false
    if (d.evidenceStatus !== 'sugerido') return false
    if (opts.photoRef && d.photos?.[0] && d.photos[0] !== opts.photoRef) return false
    return true
  })
}

/**
 * Move/troca a foto entre vistas. Se o destino já tinha foto, faz swap.
 */
export function reassignViewPhoto(
  viewPhotos: Partial<Record<ViewType, string>>,
  fromView: ViewType,
  toView: ViewType,
): Partial<Record<ViewType, string>> {
  if (fromView === toView) return { ...viewPhotos }
  const next = { ...viewPhotos }
  const moving = next[fromView]
  if (!moving) return next
  const displaced = next[toView]
  if (displaced) {
    next[fromView] = displaced
  } else {
    delete next[fromView]
  }
  next[toView] = moving
  return next
}
