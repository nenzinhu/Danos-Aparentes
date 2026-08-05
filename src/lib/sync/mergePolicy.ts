import type { InspectionStatus, SavedReport } from '../../types'
import { isIssuedLocked } from '../pdf/reportIssuance'

export type MergeDecision = 'keep-local' | 'take-remote' | 'keep-local-and-push'

type MergeCandidate = Pick<SavedReport, 'savedAt' | 'status'>

/**
 * Resolve conflitos local↔remoto sem destruir laudos emitidos.
 *
 * Last-write-wins continua valendo para drafts/completos, mas:
 * - laudo local locked nunca é sobrescrito por remoto unlocked (race multi-device)
 * - laudo remoto locked vence draft local (emissão na nuvem prevalece)
 * - entre dois locked, usa savedAt (ex.: issued → superseded)
 */
export function decideMergeWinner(local: MergeCandidate, remote: MergeCandidate): MergeDecision {
  const localLocked = isIssuedLocked(local.status as InspectionStatus | undefined)
  const remoteLocked = isIssuedLocked(remote.status as InspectionStatus | undefined)

  if (localLocked && !remoteLocked) {
    return 'keep-local-and-push'
  }
  if (remoteLocked && !localLocked) {
    return 'take-remote'
  }

  if (remote.savedAt > local.savedAt) return 'take-remote'
  if (local.savedAt > remote.savedAt) return 'keep-local-and-push'
  return 'keep-local'
}
