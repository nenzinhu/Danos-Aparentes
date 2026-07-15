import type { DamageType, Severity, VehicleType, ViewType } from '../types'
import { findPartById, getPartsForVehicle } from './vehiclePartsCatalog'

export const DAMAGE_TYPE_LABEL: Record<DamageType, string> = {
  scratch: 'Riscos / Abrasão',
  dent: 'Deformação',
  broken: 'Dano / Fratura',
}

export interface PhotoDamageSuggestion {
  partId: string
  partName: string
  view: ViewType
  type: DamageType
  typeName: string
  severity: Severity
  description: string
  confidence: 'high' | 'medium' | 'low'
}

interface RawSuggestion {
  partId?: unknown
  type?: unknown
  severity?: unknown
  description?: unknown
  confidence?: unknown
}

export function normalizeDamageType(value: unknown): DamageType | null {
  if (value === 'scratch' || value === 'dent' || value === 'broken') return value
  return null
}

export function normalizeSeverity(value: unknown): Severity {
  if (value === 'low' || value === 'medium' || value === 'high') return value
  return 'low'
}

export function normalizeConfidence(value: unknown): 'high' | 'medium' | 'low' {
  if (value === 'high' || value === 'medium' || value === 'low') return value
  return 'low'
}

/**
 * Valida e normaliza a resposta bruta da IA contra o catálogo de peças do veículo.
 * Descarta partIds inválidos; nunca inventa peça fora do catálogo.
 */
export function parsePhotoDamageSuggestions(
  vehicleType: VehicleType,
  raw: unknown,
): PhotoDamageSuggestion[] {
  const list: unknown[] = Array.isArray(raw)
    ? raw
    : raw && typeof raw === 'object' && Array.isArray((raw as { suggestions?: unknown }).suggestions)
      ? ((raw as { suggestions: unknown[] }).suggestions)
      : []

  const out: PhotoDamageSuggestion[] = []
  const seen = new Set<string>()

  for (const item of list.slice(0, 5)) {
    if (!item || typeof item !== 'object') continue
    const rawItem = item as RawSuggestion
    const partId = String(rawItem.partId || '').trim()
    if (!partId || seen.has(partId)) continue

    const part = findPartById(vehicleType, partId)
    if (!part) continue

    const type = normalizeDamageType(rawItem.type)
    if (!type) continue

    seen.add(partId)
    out.push({
      partId: part.partId,
      partName: part.partName,
      view: part.view,
      type,
      typeName: DAMAGE_TYPE_LABEL[type],
      severity: normalizeSeverity(rawItem.severity),
      description: String(rawItem.description || '').trim().slice(0, 500),
      confidence: normalizeConfidence(rawItem.confidence),
    })
  }

  return out
}

export function isKnownVehicleType(value: unknown): value is VehicleType {
  return typeof value === 'string' && getPartsForVehicle(value as VehicleType).length > 0
}
