import { SavedReport, VehicleType } from '../types'
import { normalizeRemotePhotoRef } from './photoStorage'

function normalizeDamagePhotos(photos: string[]): string[] {
  return photos.map(normalizeRemotePhotoRef)
}

export function mapRemoteInspection(insp: Record<string, unknown>, damages: Record<string, unknown>[]): SavedReport {
  const geoLat = insp.geo_lat as number | null | undefined
  const geoLng = insp.geo_lng as number | null | undefined
  const hasGeo = typeof geoLat === 'number' && typeof geoLng === 'number'

  return {
    id: insp.id as SavedReport['id'],
    savedAt: insp.updated_at as number,
    syncedAt: insp.updated_at as number,
    vehicleType: (insp.vehicle_type as VehicleType | undefined) ?? undefined,
    status: (insp.status as SavedReport['status']) === 'draft' ? 'draft' : 'complete',
    vehicleInfo: {
      owner: insp.owner as string,
      phone: insp.phone as string,
      brand: insp.brand as string,
      plate: insp.plate as SavedReport['vehicleInfo']['plate'],
      generalNotes: insp.general_notes as string,
      interiorNotes: (insp.interior_notes as string) || '',
      interiorPhotos: normalizeDamagePhotos((insp.interior_photos as string[] | null) ?? []),
      interiorPhotoNotes: (insp.interior_photo_notes as string[] | null) ?? [],
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
