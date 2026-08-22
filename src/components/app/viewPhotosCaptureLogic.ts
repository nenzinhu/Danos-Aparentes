import type { Damage, DamageType, VehicleInfo, ViewType } from '@/src/types'
import { VIEW_FACE_PART_ID } from '@/src/lib/viewSideAssign'

export const TYPE_LABEL: Record<DamageType, string> = {
  scratch: 'Risco / Arranhado',
  dent: 'Amassado',
  broken: 'Quebrado',
}

export type Phase = 'batch' | 'confirm' | 'done'

export function createDamageId(): Damage['id'] {
  return (typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `dmg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`) as Damage['id']
}

export function computePhase(
  info: VehicleInfo,
  pendingLength: number,
  localAssignmentsLength: number,
  filled: number,
): Phase {
  if (pendingLength > 0 || localAssignmentsLength > 0) {
    if (localAssignmentsLength > 0) return 'confirm'
    return 'batch'
  }
  if (filled > 0 || info.viewSidesConfirmedAt) return 'done'
  return 'batch'
}

export function groupFaceDamagesByView(damages: Damage[]): Partial<Record<ViewType, Damage[]>> {
  const map: Partial<Record<ViewType, Damage[]>> = {}
  for (const d of damages) {
    if (d.partId !== VIEW_FACE_PART_ID) continue
    if (d.evidenceStatus === 'ignorado') continue
    const list = map[d.view] || []
    list.push(d)
    map[d.view] = list
  }
  return map
}

/**
 * Protege contra lados duplicados sugeridos pela IA: mantém só o primeiro
 * assignment por lado.
 */
export function dedupeAssignmentsByView<T extends { view: ViewType }>(assignments: T[]): T[] {
  const seen = new Set<ViewType>()
  return assignments.filter((a) => {
    if (seen.has(a.view)) return false
    seen.add(a.view)
    return true
  })
}
