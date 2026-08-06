/**
 * FASE 19/20 — Selo de confiabilidade do laudo.
 *
 * Traduz a completude da trilha de auditoria em uma nota legível por leigos.
 * Funções puras — sem rede, sem banco. Rótulos apenas descritivos; nenhuma
 * alegação de validade jurídica.
 */

export type ReliabilityCriterionId =
  | 'chain_integrity'
  | 'anchored'
  | 'photos'
  | 'photo_authenticity'
  | 'gps'
  | 'human_review'
  | 'signature'
  | 'issuance'

export type ReliabilityCriterion = {
  id: ReliabilityCriterionId
  label: string
  weight: number
  met: boolean
}

export type ReliabilityLevel = 'alto' | 'medio' | 'basico'

export type ReliabilitySummary = {
  score: number
  level: ReliabilityLevel
  levelLabel: string
  criteria: ReliabilityCriterion[]
  eventsCount: number
  anchoredCount: number
  photoAlertCount: number
}

export type ReliabilityInput = {
  /** Tipos de evento presentes na trilha da vistoria. */
  eventTypes: string[]
  eventsCount: number
  /** Resultado de verifyEventChain — cadeia recomputada confere. */
  chainOk: boolean
  /** Âncoras válidas (tips ainda presentes na cadeia). */
  anchoredCount: number
  /** Nenhuma âncora órfã (histórico não foi reescrito após ancorar). */
  anchorsOk: boolean
  /** Coordenadas registradas no laudo (fallback quando não há evento gps). */
  hasGeo?: boolean
  /**
   * FASE 20: true se há alerta de reuso/contexto.
   * Se omitido, deriva dos eventTypes photo_*_alert.
   */
  hasPhotoAlerts?: boolean
}

const CRITERIA: { id: ReliabilityCriterionId; label: string; weight: number }[] = [
  { id: 'chain_integrity', label: 'Trilha de auditoria íntegra', weight: 25 },
  { id: 'anchored', label: 'Histórico ancorado com carimbo de tempo', weight: 15 },
  { id: 'photos', label: 'Evidências fotográficas registradas', weight: 10 },
  { id: 'photo_authenticity', label: 'Evidências sem alerta de reuso/inconsistência', weight: 15 },
  { id: 'human_review', label: 'Revisão humana concluída', weight: 15 },
  { id: 'gps', label: 'Localização GPS capturada', weight: 10 },
  { id: 'signature', label: 'Assinatura registrada', weight: 5 },
  { id: 'issuance', label: 'Laudo emitido com hash público', weight: 5 },
]

const LEVEL_LABELS: Record<ReliabilityLevel, string> = {
  alto: 'CONFIABILIDADE ALTA',
  medio: 'CONFIABILIDADE MÉDIA',
  basico: 'REGISTRO BÁSICO',
}

const PHOTO_ALERT_TYPES = new Set(['photo_reuse_alert', 'photo_context_alert'])

export function countPhotoAlerts(eventTypes: string[]): number {
  return eventTypes.filter((t) => PHOTO_ALERT_TYPES.has(t)).length
}

function criterionMet(
  id: ReliabilityCriterionId,
  input: ReliabilityInput,
  types: Set<string>,
  hasAlerts: boolean,
): boolean {
  switch (id) {
    case 'chain_integrity':
      return input.chainOk && input.eventsCount > 0
    case 'anchored':
      return input.anchorsOk && input.anchoredCount > 0
    case 'photos':
      return types.has('photo_capture')
    case 'photo_authenticity':
      return types.has('photo_capture') && !hasAlerts
    case 'human_review':
      return (
        types.has('review_completed')
        || types.has('human_decision')
        || types.has('review')
      )
    case 'gps':
      return types.has('gps') || input.hasGeo === true
    case 'signature':
      return types.has('signature')
    case 'issuance':
      return types.has('issuance') || types.has('hash_generation')
  }
}

export function levelForScore(score: number): ReliabilityLevel {
  if (score >= 80) return 'alto'
  if (score >= 50) return 'medio'
  return 'basico'
}

export function computeReliability(input: ReliabilityInput): ReliabilitySummary {
  const types = new Set(input.eventTypes)
  const photoAlertCount = countPhotoAlerts(input.eventTypes)
  const hasAlerts = input.hasPhotoAlerts ?? photoAlertCount > 0
  const criteria: ReliabilityCriterion[] = CRITERIA.map((c) => ({
    ...c,
    met: criterionMet(c.id, input, types, hasAlerts),
  }))

  const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0)
  const metWeight = criteria.reduce((sum, c) => sum + (c.met ? c.weight : 0), 0)
  const score = Math.round((metWeight / totalWeight) * 100)

  const level = levelForScore(score)
  return {
    score,
    level,
    levelLabel: LEVEL_LABELS[level],
    criteria,
    eventsCount: input.eventsCount,
    anchoredCount: input.anchoredCount,
    photoAlertCount,
  }
}
