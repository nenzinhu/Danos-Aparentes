import { getStoragePublicUrl, isStorageRef, storagePathFromRef } from '@/src/lib/photoStorage'
import { normalizePlate } from '@/src/lib/reportComparison'

export type OutboundDamage = {
  id: string
  view: string
  part_id: string
  part_name: string
  type: string
  type_name: string
  severity: string
  notes: string
  photos: string[]
  photo_notes: string[]
}

export type OutboundInspection = {
  id: string
  updated_at: string
  vehicle_type: string | null
  plate: string
  brand: string
  color: string
  vehicle_type_desc: string
  owner: string
  phone: string
  cpf: string
  city: string
  state: string
  ref: string
  profile: string
  general_notes: string
  interior_notes: string
  interior_photos: string[]
  damage_count: number
  signed_by_inspector: boolean
  signed_by_client: boolean
  damages?: OutboundDamage[]
}

export function photoRefToPublicUrl(ref: string): string {
  if (!ref) return ''
  if (ref.startsWith('http://') || ref.startsWith('https://') || ref.startsWith('data:')) return ref
  const path = isStorageRef(ref) ? storagePathFromRef(ref) : ref
  return getStoragePublicUrl(path) || path
}

export function mapOutboundInspection(
  insp: Record<string, unknown>,
  damages: Record<string, unknown>[],
  opts: { includeDamages: boolean } = { includeDamages: true },
): OutboundInspection {
  const matching = damages.filter(d => d.inspection_id === insp.id)
  const updatedMs = Number(insp.updated_at) || 0

  const base: OutboundInspection = {
    id: String(insp.id ?? ''),
    updated_at: updatedMs ? new Date(updatedMs).toISOString() : '',
    vehicle_type: (insp.vehicle_type as string | null) ?? null,
    plate: String(insp.plate ?? ''),
    brand: String(insp.brand ?? ''),
    color: String(insp.color ?? ''),
    vehicle_type_desc: String(insp.vehicle_type_desc ?? ''),
    owner: String(insp.owner ?? ''),
    phone: String(insp.phone ?? ''),
    cpf: String(insp.cpf ?? ''),
    city: String(insp.city ?? ''),
    state: String(insp.state ?? ''),
    ref: String(insp.ref ?? ''),
    profile: String(insp.profile ?? ''),
    general_notes: String(insp.general_notes ?? ''),
    interior_notes: String(insp.interior_notes ?? ''),
    interior_photos: ((insp.interior_photos as string[] | null) ?? []).map(photoRefToPublicUrl),
    damage_count: matching.length,
    signed_by_inspector: Boolean(insp.inspector_signature),
    signed_by_client: Boolean(insp.client_signature),
  }

  if (!opts.includeDamages) return base

  return {
    ...base,
    damages: matching.map(d => ({
      id: String(d.id ?? ''),
      view: String(d.view ?? ''),
      part_id: String(d.part_id ?? ''),
      part_name: String(d.part_name ?? ''),
      type: String(d.type ?? ''),
      type_name: String(d.type_name ?? ''),
      severity: String(d.severity ?? ''),
      notes: String(d.notes ?? ''),
      photos: ((d.photos as string[] | null) ?? []).map(photoRefToPublicUrl),
      photo_notes: (d.photo_notes as string[] | null) ?? [],
    })),
  }
}

export function filterByPlate(
  inspections: Record<string, unknown>[],
  plate: string,
): Record<string, unknown>[] {
  const normalized = normalizePlate(plate)
  if (!normalized) return inspections
  return inspections.filter(i => normalizePlate(String(i.plate || '')) === normalized)
}

export function sortByUpdatedDesc(inspections: Record<string, unknown>[]): Record<string, unknown>[] {
  return [...inspections].sort(
    (a, b) => Number(b.updated_at || 0) - Number(a.updated_at || 0),
  )
}
