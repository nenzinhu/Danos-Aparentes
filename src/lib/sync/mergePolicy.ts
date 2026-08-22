import type { Damage, DamageId, InspectionStatus, SavedReport, VehicleInfo } from '../../types'
import { isIssuedLocked } from '../pdf/reportIssuance'

export type MergeDecision =
  | 'keep-local'
  | 'take-remote'
  | 'keep-local-and-push'
  /** Ambos unlocked: união de danos/fotos + scalars por savedAt. */
  | 'merge-and-push'

type MergeCandidate = Pick<SavedReport, 'savedAt' | 'status'>

/**
 * Resolve conflitos local↔remoto sem destruir laudos emitidos.
 *
 * - unlocked × unlocked → merge semântico (FASE 22 multi-vistoriador)
 * - laudo local locked nunca é sobrescrito por remoto unlocked
 * - laudo remoto locked vence draft local
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
  if (localLocked && remoteLocked) {
    if (remote.savedAt > local.savedAt) return 'take-remote'
    if (local.savedAt > remote.savedAt) return 'keep-local-and-push'
    return 'keep-local'
  }

  // Ambos draft/complete — não descartar o trabalho de nenhum lado.
  return 'merge-and-push'
}

export type ContentMergeStats = {
  damagesFromLocalOnly: number
  damagesFromRemoteOnly: number
  damagesMerged: number
  photosUnionExtra: number
  fieldDivergences: string[]
  /** True se o resultado difere do remoto (precisa upsert). */
  needsPush: boolean
  /** True se ambos os lados contribuíram com danos distintos. */
  multiContributor: boolean
}

function damageIdentityKey(d: Pick<Damage, 'view' | 'partId' | 'type'>): string {
  return `${d.view}::${d.partId}::${d.type}`
}

function severityRank(s: Damage['severity']): number {
  if (s === 'high') return 3
  if (s === 'medium') return 2
  if (s === 'low') return 1
  return 0
}

function uniqueStrings(values: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const v of values) {
    if (!v || seen.has(v)) continue
    seen.add(v)
    out.push(v)
  }
  return out
}

function mergeNotes(a: string, b: string): string {
  const aa = (a || '').trim()
  const bb = (b || '').trim()
  if (!aa) return bb
  if (!bb) return aa
  if (aa === bb) return aa
  if (aa.includes(bb)) return aa
  if (bb.includes(aa)) return bb
  return `${aa}\n---\n${bb}`
}

function mergePhotoArrays(
  aPhotos: string[] | undefined,
  aNotes: string[] | undefined,
  bPhotos: string[] | undefined,
  bNotes: string[] | undefined,
): { photos: string[]; photoNotes: string[]; extra: number } {
  const photosA = aPhotos || []
  const notesA = aNotes || []
  const photosB = bPhotos || []
  const notesB = bNotes || []
  const photos: string[] = []
  const photoNotes: string[] = []
  const seen = new Set<string>()
  const add = (p: string, note: string) => {
    if (!p || seen.has(p)) return
    seen.add(p)
    photos.push(p)
    photoNotes.push(note || '')
  }
  photosA.forEach((p, i) => add(p, notesA[i] || ''))
  const before = photos.length
  photosB.forEach((p, i) => add(p, notesB[i] || ''))
  return { photos, photoNotes, extra: Math.max(0, photos.length - before) }
}

function mergeDamages(local: Damage[], remote: Damage[]): {
  damages: Damage[]
  fromLocalOnly: number
  fromRemoteOnly: number
  merged: number
  photoExtra: number
} {
  const byId = new Map<string, { damage: Damage; side: 'local' | 'remote' | 'both' }>()
  const byIdentity = new Map<string, string>() // identity → id in byId

  const upsert = (d: Damage, side: 'local' | 'remote') => {
    const id = String(d.id)
    const existing = byId.get(id)
    if (existing) {
      const richer = pickRicherDamage(existing.damage, d)
      const photoMerge = mergePhotoArrays(
        existing.damage.photos,
        existing.damage.photoNotes,
        d.photos,
        d.photoNotes,
      )
      byId.set(id, {
        damage: {
          ...richer,
          photos: photoMerge.photos,
          photoNotes: photoMerge.photoNotes,
          notes: mergeNotes(existing.damage.notes, d.notes),
        },
        side: 'both',
      })
      return photoMerge.extra
    }

    const ident = damageIdentityKey(d)
    const aliasId = byIdentity.get(ident)
    if (aliasId && aliasId !== id) {
      const prev = byId.get(aliasId)!
      const photoMerge = mergePhotoArrays(prev.damage.photos, prev.damage.photoNotes, d.photos, d.photoNotes)
      byId.set(aliasId, {
        damage: {
          ...pickRicherDamage(prev.damage, d),
          photos: photoMerge.photos,
          photoNotes: photoMerge.photoNotes,
          notes: mergeNotes(prev.damage.notes, d.notes),
        },
        side: 'both',
      })
      return photoMerge.extra
    }

    byId.set(id, { damage: { ...d, photos: [...(d.photos || [])], photoNotes: [...(d.photoNotes || [])] }, side })
    byIdentity.set(ident, id)
    return 0
  }

  let photoExtra = 0
  for (const d of local) photoExtra += upsert(d, 'local')
  for (const d of remote) photoExtra += upsert(d, 'remote')

  let fromLocalOnly = 0
  let fromRemoteOnly = 0
  let merged = 0
  const damages: Damage[] = []
  for (const { damage, side } of byId.values()) {
    damages.push(damage)
    if (side === 'local') fromLocalOnly++
    else if (side === 'remote') fromRemoteOnly++
    else merged++
  }

  return { damages, fromLocalOnly, fromRemoteOnly, merged, photoExtra }
}

function pickRicherDamage(a: Damage, b: Damage): Damage {
  const score = (d: Damage) =>
    (d.photos?.length ?? 0) * 10 + severityRank(d.severity) + (d.notes?.trim() ? 1 : 0)
  return score(a) >= score(b) ? a : b
}

const SCALAR_FIELDS: (keyof VehicleInfo)[] = [
  'owner',
  'phone',
  'brand',
  'plate',
  'profile',
  'ref',
  'color',
  'vehicleTypeDesc',
  'city',
  'state',
  'cpf',
  'cnh',
  'cnhCategory',
]

function mergeVehicleInfo(
  local: VehicleInfo,
  remote: VehicleInfo,
  newerIsLocal: boolean,
): { info: VehicleInfo; divergences: string[]; photoExtra: number } {
  const newer = newerIsLocal ? local : remote
  const older = newerIsLocal ? remote : local
  const divergences: string[] = []
  const info: VehicleInfo = { ...newer }

  for (const key of SCALAR_FIELDS) {
    const a = String(local[key] ?? '').trim()
    const b = String(remote[key] ?? '').trim()
    if (a && b && a !== b) {
      divergences.push(key)
      info[key] = newer[key] as never
    } else if (!String(newer[key] ?? '').trim() && String(older[key] ?? '').trim()) {
      info[key] = older[key] as never
    }
  }

  info.generalNotes = mergeNotes(local.generalNotes || '', remote.generalNotes || '')
  info.interiorNotes = mergeNotes(local.interiorNotes || '', remote.interiorNotes || '')

  const interior = mergePhotoArrays(
    local.interiorPhotos,
    local.interiorPhotoNotes,
    remote.interiorPhotos,
    remote.interiorPhotoNotes,
  )
  info.interiorPhotos = interior.photos
  info.interiorPhotoNotes = interior.photoNotes

  const viewPhotos: NonNullable<VehicleInfo['viewPhotos']> = {
    ...(remote.viewPhotos || {}),
    ...(local.viewPhotos || {}),
  }
  // Prefer non-empty from newer on conflict
  for (const view of ['lateral-left', 'lateral-right', 'frontal', 'traseira'] as const) {
    const lv = local.viewPhotos?.[view]
    const rv = remote.viewPhotos?.[view]
    if (lv && rv && lv !== rv) {
      divergences.push(`viewPhotos.${view}`)
      viewPhotos[view] = newer.viewPhotos?.[view] || lv || rv
    } else {
      viewPhotos[view] = lv || rv
    }
  }
  info.viewPhotos = viewPhotos

  info.pendingViewPhotoRefs = uniqueStrings([
    ...(local.pendingViewPhotoRefs || []),
    ...(remote.pendingViewPhotoRefs || []),
  ])

  info.inspectorSignature = newer.inspectorSignature || older.inspectorSignature
  info.clientSignature = newer.clientSignature || older.clientSignature
  info.inspectorSignatureMeta = newer.inspectorSignatureMeta || older.inspectorSignatureMeta
  info.clientSignatureMeta = newer.clientSignatureMeta || older.clientSignatureMeta
  info.geo = newer.geo || older.geo
  info.checklist = newer.checklist || older.checklist
  info.customFields = (newer.customFields?.length ? newer.customFields : older.customFields) || []

  if (local.viewSidesConfirmedAt || remote.viewSidesConfirmedAt) {
    const localTs = local.viewSidesConfirmedAt || ''
    const remoteTs = remote.viewSidesConfirmedAt || ''
    if (localTs >= remoteTs) {
      info.viewSidesConfirmedAt = local.viewSidesConfirmedAt
      info.viewSidesConfirmedBy = local.viewSidesConfirmedBy
      info.viewSideSuggestions = local.viewSideSuggestions
    } else {
      info.viewSidesConfirmedAt = remote.viewSidesConfirmedAt
      info.viewSidesConfirmedBy = remote.viewSidesConfirmedBy
      info.viewSideSuggestions = remote.viewSideSuggestions
    }
  }

  return { info, divergences, photoExtra: interior.extra }
}

function pickStatus(
  local?: InspectionStatus | null,
  remote?: InspectionStatus | null,
): InspectionStatus | undefined {
  if (local === 'complete' || remote === 'complete') return 'complete'
  return (local || remote || undefined) as InspectionStatus | undefined
}

function reportsContentEqual(a: SavedReport, b: SavedReport): boolean {
  if (a.damages.length !== b.damages.length) return false
  const idsA = new Set(a.damages.map((d) => String(d.id)))
  for (const d of b.damages) {
    if (!idsA.has(String(d.id))) return false
  }
  if ((a.vehicleInfo.generalNotes || '') !== (b.vehicleInfo.generalNotes || '')) return false
  if ((a.vehicleInfo.interiorPhotos?.length || 0) !== (b.vehicleInfo.interiorPhotos?.length || 0)) {
    return false
  }
  return true
}

/**
 * Une dois drafts/completos do mesmo id (dois dispositivos / vistoriadores).
 * Não deve ser chamado para laudos issued/locked.
 */
export function mergeInspectionReports(
  local: SavedReport,
  remote: SavedReport,
): { report: SavedReport; stats: ContentMergeStats } {
  const newerIsLocal = local.savedAt >= remote.savedAt
  const damageMerge = mergeDamages(local.damages || [], remote.damages || [])
  const vehicleMerge = mergeVehicleInfo(local.vehicleInfo, remote.vehicleInfo, newerIsLocal)

  const report: SavedReport = {
    ...local,
    ...remote,
    id: local.id,
    savedAt: Math.max(local.savedAt, remote.savedAt),
    damages: damageMerge.damages,
    vehicleInfo: vehicleMerge.info,
    vehicleType: newerIsLocal ? local.vehicleType : remote.vehicleType,
    status: pickStatus(local.status, remote.status),
    vehicleId: local.vehicleId || remote.vehicleId,
    syncedAt: undefined,
  }

  // Preferir metadados de emissão do lado que já os tiver (não deveria em unlocked).
  report.publicCode = local.publicCode || remote.publicCode
  report.laudoVersion = local.laudoVersion ?? remote.laudoVersion
  report.reviewerId = local.reviewerId || remote.reviewerId
  report.reviewedAt = Math.max(local.reviewedAt || 0, remote.reviewedAt || 0) || undefined
  report.reviewNotes = mergeNotes(local.reviewNotes || '', remote.reviewNotes || '')
  report.reviewContentHash = local.reviewContentHash || remote.reviewContentHash

  const multiContributor =
    damageMerge.fromLocalOnly > 0 && damageMerge.fromRemoteOnly > 0

  const needsPush = !reportsContentEqual(report, remote) || local.savedAt > remote.savedAt

  return {
    report,
    stats: {
      damagesFromLocalOnly: damageMerge.fromLocalOnly,
      damagesFromRemoteOnly: damageMerge.fromRemoteOnly,
      damagesMerged: damageMerge.merged,
      photosUnionExtra: damageMerge.photoExtra + vehicleMerge.photoExtra,
      fieldDivergences: vehicleMerge.divergences,
      needsPush,
      multiContributor,
    },
  }
}

/** Helper de teste / tipagem — id brand-safe. */
export function asDamageId(id: string): DamageId {
  return id as DamageId
}
