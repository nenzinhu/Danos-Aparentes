import type { Vehicle, DamageRecord, DiffResult } from '@/src/types/index'

type ClassValue = string | false | null | undefined

export function cn(...values: ClassValue[]) {
  return values.filter(Boolean).join(' ')
}

/** Cores de severidade alinhadas ao DESIGN.md (severity-*). */
export function severityColor(severity: DamageRecord['severity']) {
  if (severity === 'high') {
    return 'text-[var(--severity-high)] bg-[color-mix(in_srgb,var(--severity-high)_12%,transparent)]'
  }
  if (severity === 'medium') {
    return 'text-[var(--severity-medium)] bg-[color-mix(in_srgb,var(--severity-medium)_12%,transparent)]'
  }
  return 'text-[var(--severity-low)] bg-[color-mix(in_srgb,var(--severity-low)_12%,transparent)]'
}

export function severityLabel(severity: DamageRecord['severity']) {
  if (severity === 'high') return 'Grave'
  if (severity === 'medium') return 'Médio'
  return 'Leve'
}

export function plateDisplay(plate: string) {
  return plate.toUpperCase()
}

export function diffSummary(diff: DiffResult) {
  return {
    added: diff.added_damages.length,
    removed: diff.removed_damages.length,
    modified: diff.modified_damages.length,
    unchanged: diff.unchanged_damages.length,
  }
}

/** @deprecated Preferir VehicleInfo / SavedReport em `@/src/types`. */
export type { Vehicle }
