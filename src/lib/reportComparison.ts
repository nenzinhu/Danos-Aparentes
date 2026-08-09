export interface PreviousReportSummary {
  /** ISO date da última atualização do laudo anterior. */
  updatedAt: string
  damageKeys: Set<string>
}

export function normalizePlate(plate: string): string {
  return plate.toUpperCase().replace(/[^A-Z0-9]/g, '')
}

export function damageKey(partId: string, type: string): string {
  return `${partId}::${type}`
}

export function buildPreviousReportSummary(
  updatedAt: string,
  damages: { partId: string; type: string }[],
): PreviousReportSummary {
  return {
    updatedAt,
    damageKeys: new Set(damages.map(d => damageKey(d.partId, d.type))),
  }
}

export function isNewDamage(damage: { partId: string; type: string }, previous: PreviousReportSummary | null): boolean {
  if (!previous) return false
  return !previous.damageKeys.has(damageKey(damage.partId, damage.type))
}
