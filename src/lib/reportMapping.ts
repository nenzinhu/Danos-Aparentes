import { SavedReport, VehicleType, ViewType } from '../types'
import { normalizeRemotePhotoRef } from './photoStorage'

function normalizeDamagePhotos(photos: string[]): string[] {
  return photos.map(normalizeRemotePhotoRef)
}

const VIEW_KEYS: ViewType[] = ['lateral-left', 'lateral-right', 'frontal', 'traseira']

function normalizeViewPhotos(raw: unknown): Partial<Record<ViewType, string>> | undefined {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return undefined
  const out: Partial<Record<ViewType, string>> = {}
  for (const key of VIEW_KEYS) {
    const val = (raw as Record<string, unknown>)[key]
    if (typeof val === 'string' && val) {
      out[key] = normalizeRemotePhotoRef(val)
    }
  }
  return Object.keys(out).length > 0 ? out : undefined
}

export function mapRemoteInspection(insp: Record<string, unknown>, damages: Record<string, unknown>[]): SavedReport {
  const geoLat = insp.geo_lat as number | null | undefined
  const geoLng = insp.geo_lng as number | null | undefined
  const hasGeo = typeof geoLat === 'number' && typeof geoLng === 'number'

  const rawStatus = insp.status as string | undefined
  const status: SavedReport['status'] =
    rawStatus === 'draft' ||
    rawStatus === 'complete' ||
    rawStatus === 'issued' ||
    rawStatus === 'superseded' ||
    rawStatus === 'cancelled'
      ? rawStatus
      : 'complete'


  const reviewedAtRaw = insp.reviewed_at
  let reviewedAt: number | undefined
  if (typeof reviewedAtRaw === 'number') reviewedAt = reviewedAtRaw
  else if (typeof reviewedAtRaw === 'string' && reviewedAtRaw) {
    const parsedReview = Date.parse(reviewedAtRaw)
    if (!Number.isNaN(parsedReview)) reviewedAt = parsedReview
  }
  const correctedAtRaw = insp.corrected_at
  let correctedAt: number | undefined
  if (typeof correctedAtRaw === 'number') correctedAt = correctedAtRaw
  else if (typeof correctedAtRaw === 'string' && correctedAtRaw) {
    const parsed = Date.parse(correctedAtRaw)
    if (!Number.isNaN(parsed)) correctedAt = parsed
  }

  return {
    id: insp.id as SavedReport['id'],
    savedAt: insp.updated_at as number,
    syncedAt: insp.updated_at as number,
    vehicleType: (insp.vehicle_type as VehicleType | undefined) ?? undefined,
    status,
    publicCode: (insp.public_code as string) || undefined,
    laudoVersion: typeof insp.laudo_version === 'number' ? insp.laudo_version : undefined,
    parentInspectionId: (insp.parent_inspection_id as string) || undefined,
    correctionReason: (insp.correction_reason as string) || undefined,
    correctedBy: insp.corrected_by ? String(insp.corrected_by) : undefined,
    correctedAt,
    issuedHash: (insp.issued_hash as string) || undefined,
    reviewerId: insp.reviewer_id ? String(insp.reviewer_id) : undefined,
    reviewedAt,
    reviewNotes: (insp.review_notes as string) || undefined,
    reviewContentHash: (insp.review_content_hash as string) || undefined,
    vehicleId: (insp.vehicle_id as string) || undefined,
    inspectionPurpose:
      insp.inspection_purpose === 'entrada' || insp.inspection_purpose === 'retorno'
        ? insp.inspection_purpose
        : undefined,
    baselineInspectionId: (insp.baseline_inspection_id as string) || undefined,
    vehicleInfo: {
      owner: insp.owner as string,
      phone: insp.phone as string,
      brand: insp.brand as string,
      plate: insp.plate as SavedReport['vehicleInfo']['plate'],
      generalNotes: insp.general_notes as string,
      interiorNotes: (insp.interior_notes as string) || '',
      interiorPhotos: normalizeDamagePhotos((insp.interior_photos as string[] | null) ?? []),
      interiorPhotoNotes: (insp.interior_photo_notes as string[] | null) ?? [],
      viewPhotos: normalizeViewPhotos(insp.view_photos),
      profile: insp.profile as SavedReport['vehicleInfo']['profile'],
      ref: insp.ref as string,
      color: insp.color as string,
      vehicleTypeDesc: insp.vehicle_type_desc as string,
      city: insp.city as string,
      state: insp.state as string,
      cpf: (insp.cpf as string) || '',
      cnh: (insp.cnh as string) || '',
      cnhCategory: (insp.cnh_category as string) || '',
      inspectorSignature: (insp.inspector_signature as string) || '',
      clientSignature: (insp.client_signature as string) || '',
      inspectorSignatureMeta: (insp.inspector_signature_meta as SavedReport['vehicleInfo']['inspectorSignatureMeta']) || undefined,
      clientSignatureMeta: (insp.client_signature_meta as SavedReport['vehicleInfo']['clientSignatureMeta']) || undefined,
      ...(hasGeo
        ? {
            geo: {
              lat: geoLat,
              lng: geoLng,
              accuracy: typeof insp.geo_accuracy === 'number' ? insp.geo_accuracy : undefined,
              address: typeof insp.geo_address === 'string' ? insp.geo_address : undefined,
              capturedAt: typeof insp.geo_captured_at === 'number' ? insp.geo_captured_at : (insp.updated_at as number),
            },
          }
        : {}),
    },
    damages: damages
      .filter(d => d.inspection_id === insp.id)
      .map(d => ({
        id: d.id as SavedReport['damages'][number]['id'],
        vehicle: d.vehicle as SavedReport['damages'][number]['vehicle'],
        view: d.view as SavedReport['damages'][number]['view'],
        partId: d.part_id as string,
        partName: d.part_name as string,
        type: d.type as SavedReport['damages'][number]['type'],
        typeName: d.type_name as string,
        severity: d.severity as SavedReport['damages'][number]['severity'],
        notes: d.notes as string,
        photos: normalizeDamagePhotos((d.photos as string[] | null) ?? []),
        photoNotes: (d.photo_notes as string[] | null) ?? [],
      })),
  }
}
