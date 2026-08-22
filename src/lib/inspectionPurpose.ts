import type { SavedReport, VehicleInfo } from '@/src/types'
import { EMPTY_INFO } from '@/src/components/app/constants'
import { normalizePlate } from '@/src/lib/reportComparison'
import { stripRevisionSuffix } from '@/src/lib/pdf/reportIssuance'

/**
 * Copia todos os dados cadastrais/operacionais da vistoria base para o retorno.
 * Zera assinaturas e geo (nova captura no retorno).
 * Não copia diagrama/avarias — o usuário marca só o que mudou.
 */
export function vehicleInfoForReturn(from: VehicleInfo): VehicleInfo {
  return {
    ...EMPTY_INFO,
    ...from,
    plate: from.plate || ('' as VehicleInfo['plate']),
    interiorPhotos: [...(from.interiorPhotos || [])],
    interiorPhotoNotes: [...(from.interiorPhotoNotes || [])],
    customFields: (from.customFields || []).map((f) => ({ ...f })),
    checklist: from.checklist ? { ...from.checklist } : undefined,
    viewPhotos: undefined,
    inspectorSignature: '',
    clientSignature: '',
    inspectorSignatureMeta: undefined,
    clientSignatureMeta: undefined,
    geo: undefined,
  }
}

export type RetornoLookupKind = 'plate' | 'cpf' | 'publicCode'

export function normalizeCpfDigits(cpf: string): string {
  return String(cpf || '').replace(/\D/g, '')
}

export function normalizePublicCodeQuery(code: string): string {
  return String(code || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '')
}

/** Última vistoria da mesma placa (exceto `excludeId`). */
export function findReportForReturnByPlate(
  reports: SavedReport[],
  plate: string,
  excludeId?: string | null,
): SavedReport | null {
  const norm = normalizePlate(plate)
  if (norm.length < 6) return null
  const matches = reports
    .filter((r) => {
      if (excludeId && r.id === excludeId) return false
      return normalizePlate(String(r.vehicleInfo.plate || '')) === norm
    })
    .sort((a, b) => b.savedAt - a.savedAt)
  return matches[0] ?? null
}

/** Última vistoria do mesmo CPF do cliente. */
export function findReportForReturnByCpf(
  reports: SavedReport[],
  cpf: string,
  excludeId?: string | null,
): SavedReport | null {
  const digits = normalizeCpfDigits(cpf)
  if (digits.length < 11) return null
  const matches = reports
    .filter((r) => {
      if (excludeId && r.id === excludeId) return false
      return normalizeCpfDigits(r.vehicleInfo.cpf || '') === digits
    })
    .sort((a, b) => b.savedAt - a.savedAt)
  return matches[0] ?? null
}

/**
 * Busca pelo código público do PDF (ex.: DA-2026-A1B2C3 ou DA-2026-A1B2C3-R1).
 * Aceita match exato ou mesma base sem sufixo de revisão.
 */
export function findReportForReturnByPublicCode(
  reports: SavedReport[],
  code: string,
  excludeId?: string | null,
): SavedReport | null {
  const q = normalizePublicCodeQuery(code)
  if (q.length < 6) return null
  const qBase = stripRevisionSuffix(q)
  const matches = reports
    .filter((r) => {
      if (excludeId && r.id === excludeId) return false
      const pc = normalizePublicCodeQuery(r.publicCode || '')
      if (!pc) return false
      return pc === q || stripRevisionSuffix(pc) === qBase
    })
    .sort((a, b) => b.savedAt - a.savedAt)
  return matches[0] ?? null
}

export function findReportForReturn(
  reports: SavedReport[],
  kind: RetornoLookupKind,
  value: string,
  excludeId?: string | null,
): SavedReport | null {
  if (kind === 'plate') return findReportForReturnByPlate(reports, value, excludeId)
  if (kind === 'cpf') return findReportForReturnByCpf(reports, value, excludeId)
  return findReportForReturnByPublicCode(reports, value, excludeId)
}
