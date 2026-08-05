import { damageIdentityKey, partLocationKey } from './damageIdentity'
import { assertSameTenant } from './vehicleIdentity'
import type {
  ComparisonItem,
  ComparisonResult,
  DamageRecord,
  Inspection,
} from './types'

function messageFor(
  category: ComparisonItem['category'],
  prev?: DamageRecord,
  curr?: DamageRecord,
): string {
  switch (category) {
    case 'unchanged':
      return `Dano existente — ${curr?.partName ?? prev?.partName ?? 'peça'} (${curr?.typeName ?? prev?.typeName ?? 'tipo'})`
    case 'new':
      return `Novo dano — ${curr?.partName ?? 'peça'} (${curr?.typeName ?? 'tipo'})`
    case 'removedOrRepaired':
      return 'Dano não identificado na vistoria atual. Possível reparo ou ausência de registro.'
    case 'severityChanged':
      return `Dano alterado — severidade: ${prev?.severity ?? '?'} → ${curr?.severity ?? '?'}`
    case 'uncertain':
      return 'Correspondência incerta — revisão humana necessária.'
    default:
      return 'Resultado da comparação'
  }
}

/**
 * Motor de comparação estrutural (determinístico, sem IA).
 *
 * Regras:
 * - Mesma identity (view+partId+type) + mesma severidade → unchanged
 * - Mesma identity + severidade diferente → severityChanged
 * - Só no atual → new
 * - Só no anterior → removedOrRepaired (linguagem de incerteza)
 * - Mesma peça/vista, tipos diferentes e sem match de identity → uncertain
 *
 * Nunca muta as inspeções de entrada.
 */
export function compareInspections(
  previous: Inspection,
  current: Inspection,
  comparedAt = new Date().toISOString(),
): ComparisonResult {
  assertSameTenant(previous, current, 'inspection')
  if (previous.vehicleId !== current.vehicleId) {
    throw new Error('Inspections must belong to the same vehicle')
  }
  if (previous.id === current.id) {
    throw new Error('Cannot compare an inspection with itself')
  }

  const prevDamages = previous.damages.map((d) => ({ ...d }))
  const currDamages = current.damages.map((d) => ({ ...d }))

  const prevById = new Map(prevDamages.map((d) => [damageIdentityKey(d), d]))
  const currById = new Map(currDamages.map((d) => [damageIdentityKey(d), d]))

  const matchedPrev = new Set<string>()
  const matchedCurr = new Set<string>()
  const items: ComparisonItem[] = []

  for (const [key, curr] of currById) {
    const prev = prevById.get(key)
    if (!prev) continue
    matchedPrev.add(key)
    matchedCurr.add(key)
    if (prev.severity === curr.severity) {
      items.push({
        category: 'unchanged',
        identityKey: key,
        previous: prev,
        current: curr,
        message: messageFor('unchanged', prev, curr),
        previousSeverity: prev.severity,
        currentSeverity: curr.severity,
      })
    } else {
      items.push({
        category: 'severityChanged',
        identityKey: key,
        previous: prev,
        current: curr,
        message: messageFor('severityChanged', prev, curr),
        previousSeverity: prev.severity,
        currentSeverity: curr.severity,
      })
    }
  }

  const unmatchedPrev = prevDamages.filter((d) => !matchedPrev.has(damageIdentityKey(d)))
  const unmatchedCurr = currDamages.filter((d) => !matchedCurr.has(damageIdentityKey(d)))

  const uncertainPrevKeys = new Set<string>()
  const uncertainCurrKeys = new Set<string>()

  for (const prev of unmatchedPrev) {
    const loc = partLocationKey(prev)
    const candidates = unmatchedCurr.filter(
      (c) => partLocationKey(c) === loc && !uncertainCurrKeys.has(damageIdentityKey(c)),
    )
    if (candidates.length === 1) {
      const curr = candidates[0]
      const pKey = damageIdentityKey(prev)
      const cKey = damageIdentityKey(curr)
      uncertainPrevKeys.add(pKey)
      uncertainCurrKeys.add(cKey)
      items.push({
        category: 'uncertain',
        identityKey: `${loc}::uncertain`,
        previous: prev,
        current: curr,
        message: messageFor('uncertain', prev, curr),
        previousSeverity: prev.severity,
        currentSeverity: curr.severity,
      })
    }
  }

  for (const curr of unmatchedCurr) {
    const key = damageIdentityKey(curr)
    if (uncertainCurrKeys.has(key)) continue
    items.push({
      category: 'new',
      identityKey: key,
      current: curr,
      message: messageFor('new', undefined, curr),
      currentSeverity: curr.severity,
    })
  }

  for (const prev of unmatchedPrev) {
    const key = damageIdentityKey(prev)
    if (uncertainPrevKeys.has(key)) continue
    items.push({
      category: 'removedOrRepaired',
      identityKey: key,
      previous: prev,
      message: messageFor('removedOrRepaired', prev),
      previousSeverity: prev.severity,
    })
  }

  const summary = {
    unchanged: items.filter((i) => i.category === 'unchanged').length,
    newDamages: items.filter((i) => i.category === 'new').length,
    removedOrRepaired: items.filter((i) => i.category === 'removedOrRepaired').length,
    severityChanged: items.filter((i) => i.category === 'severityChanged').length,
    uncertain: items.filter((i) => i.category === 'uncertain').length,
  }

  return {
    previousInspectionId: previous.id,
    currentInspectionId: current.id,
    vehicleId: previous.vehicleId,
    comparedAt,
    items,
    summary,
  }
}

/** Garante que a comparação não altera as inspeções (imutabilidade). */
export function assertInspectionsUnchanged(
  beforePrev: Inspection,
  beforeCurr: Inspection,
  afterPrev: Inspection,
  afterCurr: Inspection,
): void {
  if (JSON.stringify(beforePrev) !== JSON.stringify(afterPrev)) {
    throw new Error('Previous inspection was mutated by comparison')
  }
  if (JSON.stringify(beforeCurr) !== JSON.stringify(afterCurr)) {
    throw new Error('Current inspection was mutated by comparison')
  }
}
