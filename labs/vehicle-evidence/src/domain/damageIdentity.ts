import type { DamageRecord, DamageType, Severity, ViewType } from './types'

/**
 * Identidade comparável do dano.
 * NÃO depende do texto da observação.
 * Base: view + partId + type
 */
export function damageIdentityKey(d: {
  view: ViewType
  partId: string
  type: DamageType
}): string {
  return `${d.view}::${d.partId}::${d.type}`
}

/** Chave parcial (peça+vista) — usada para detectar incerteza quando o tipo muda. */
export function partLocationKey(d: { view: ViewType; partId: string }): string {
  return `${d.view}::${d.partId}`
}

export function severityRank(s: Severity): number {
  switch (s) {
    case 'low':
      return 1
    case 'medium':
      return 2
    case 'high':
      return 3
    default:
      return 0
  }
}

export function cloneDamage(d: DamageRecord): DamageRecord {
  return {
    ...d,
    photoRefs: d.photoRefs ? [...d.photoRefs] : undefined,
    gps: d.gps ? { ...d.gps } : d.gps,
  }
}
