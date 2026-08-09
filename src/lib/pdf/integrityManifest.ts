import type { CustomField, Damage, VehicleInfo } from '../../types'

/** Synced with package.json "version". */
export const SYSTEM_VERSION = '1.0.0'

export const INTEGRITY_SCHEME = 'integrity-v2' as const
export const INTEGRITY_ALGORITHM = 'SHA-256' as const

export type IntegrityManifest = {
  inspection_id: string
  vehicle_data_hash: string
  inspection_data_hash: string
  damages_hash: string
  photos_hash: string
  photo_hashes: string[]
  signatures_hash: string
  location_hash: string
  structured_content_hash: string
  pdf_hash: string | null
  final_hash: string
  algorithm: 'SHA-256'
  scheme: 'integrity-v2'
  system_version: string
  created_at: string
  issued_at: string
}

/** Full 64-char lowercase SHA-256 hex. */
export async function sha256Hex(data: string | ArrayBuffer | Uint8Array): Promise<string> {
  let bytes: Uint8Array
  if (typeof data === 'string') {
    bytes = new TextEncoder().encode(data)
  } else if (data instanceof Uint8Array) {
    bytes = data
  } else {
    bytes = new Uint8Array(data)
  }
  const buf = await crypto.subtle.digest('SHA-256', new Uint8Array(bytes))
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Hash a photo reference.
 * - If `preferredOriginalSha256` is set (FASE 4 evidence), use it (hash of ORIGINAL bytes).
 * - `data:image/...;base64,...` → decode and SHA-256 the raw bytes
 * - otherwise (`blob:`, `storage:`, URL) → SHA-256 of the UTF-8 ref string
 *   (limitation: content behind the ref is not hashed at emit time unless evidence exists)
 */
export async function hashDataUrlOrRef(
  photo: string,
  preferredOriginalSha256?: string | null,
): Promise<string> {
  if (preferredOriginalSha256 && /^[0-9a-f]{64}$/i.test(preferredOriginalSha256)) {
    return preferredOriginalSha256.toLowerCase()
  }
  const m = /^data:[^;]+;base64,(.+)$/s.exec(photo)
  if (m) {
    const binary = atob(m[1])
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    return sha256Hex(bytes)
  }
  return sha256Hex(photo)
}

function canonicalJson(value: unknown): string {
  return JSON.stringify(value)
}

async function hashObject(value: unknown): Promise<string> {
  return sha256Hex(canonicalJson(value))
}

function vehiclePayload(info: VehicleInfo) {
  return {
    owner: info.owner || '',
    phone: info.phone || '',
    brand: info.brand || '',
    plate: info.plate || '',
    color: info.color || '',
    vehicleTypeDesc: info.vehicleTypeDesc || '',
    city: info.city || '',
    state: info.state || '',
    cpf: info.cpf || '',
    cnh: info.cnh || '',
    cnhCategory: info.cnhCategory || '',
  }
}

function inspectionPayload(info: VehicleInfo, ts: number) {
  const customFields: CustomField[] = (info.customFields || []).map((f) => ({
    id: f.id,
    label: f.label,
    value: f.value,
  }))
  return {
    ts,
    ref: info.ref || '',
    profile: info.profile || '',
    generalNotes: info.generalNotes || '',
    interiorNotes: info.interiorNotes || '',
    interiorPhotoNotes: info.interiorPhotoNotes || [],
    customFields,
  }
}

/** Structural damage fields only — photo bytes live in photo_hashes. */
function damagesPayload(damages: Damage[]) {
  return damages.map((d) => ({
    vehicle: d.vehicle,
    view: d.view,
    partId: d.partId,
    partName: d.partName,
    type: d.type,
    typeName: d.typeName,
    severity: d.severity,
    notes: d.notes || '',
    photoNotes: d.photoNotes || [],
  }))
}

function signaturesPayload(info: VehicleInfo) {
  return {
    inspectorSignature: info.inspectorSignature || '',
    clientSignature: info.clientSignature || '',
  }
}

function locationPayload(info: VehicleInfo) {
  const geo = info.geo
  if (!geo) {
    return {
      lat: null as number | null,
      lng: null as number | null,
      accuracy: null as number | null,
      address: '',
      capturedAt: null as number | null,
    }
  }
  return {
    lat: geo.lat,
    lng: geo.lng,
    accuracy: typeof geo.accuracy === 'number' ? geo.accuracy : null,
    address: geo.address || '',
    capturedAt: geo.capturedAt,
  }
}

/** Damage photos (order preserved) then interior photos. */
function collectPhotoRefs(info: VehicleInfo, damages: Damage[]): string[] {
  const refs: string[] = []
  for (const d of damages) {
    for (const p of d.photos || []) refs.push(p)
  }
  for (const p of info.interiorPhotos || []) refs.push(p)
  for (const p of Object.values(info.viewPhotos || {})) {
    if (p) refs.push(p)
  }
  return refs
}

async function defaultInspectionId(info: VehicleInfo, ts: number): Promise<string> {
  const plate = info.plate || ''
  const ref = info.ref || ''
  const digest = await sha256Hex(`${plate}|${ref}|${ts}`)
  const year = new Date(ts).getUTCFullYear()
  return `DA-${year}-${digest.slice(0, 12).toUpperCase()}`
}

export async function buildIntegrityManifest(args: {
  info: VehicleInfo
  damages: Damage[]
  ts: number
  issuedAt: string
  pdfBytes?: ArrayBuffer | Uint8Array | null
  inspectionId?: string
  /** FASE 4: display ref → SHA-256 of ORIGINAL bytes when dual-stored. */
  originalPhotoHashes?: Record<string, string>
}): Promise<IntegrityManifest> {
  const { info, damages, ts, issuedAt } = args

  const vehicle_data_hash = await hashObject(vehiclePayload(info))
  const inspection_data_hash = await hashObject(inspectionPayload(info, ts))
  const damages_hash = await hashObject(damagesPayload(damages))
  const signatures_hash = await hashObject(signaturesPayload(info))
  const location_hash = await hashObject(locationPayload(info))

  const photoRefs = collectPhotoRefs(info, damages)
  const photo_hashes: string[] = []
  for (const ref of photoRefs) {
    const preferred = args.originalPhotoHashes?.[ref] ?? null
    photo_hashes.push(await hashDataUrlOrRef(ref, preferred))
  }
  const photos_hash = await sha256Hex(photo_hashes.join('\n'))

  const structured_content_hash = await hashObject({
    vehicle_data_hash,
    inspection_data_hash,
    damages_hash,
    photos_hash,
    signatures_hash,
    location_hash,
  })

  let pdf_hash: string | null = null
  if (args.pdfBytes != null) {
    pdf_hash = await sha256Hex(args.pdfBytes)
  }

  const inspection_id = args.inspectionId || (await defaultInspectionId(info, ts))
  const created_at = new Date(ts).toISOString()

  // final_hash over this exact key order (no photo_hashes / timestamps).
  const finalPayload = {
    scheme: INTEGRITY_SCHEME,
    algorithm: INTEGRITY_ALGORITHM,
    system_version: SYSTEM_VERSION,
    inspection_id,
    vehicle_data_hash,
    inspection_data_hash,
    damages_hash,
    photos_hash,
    signatures_hash,
    location_hash,
    structured_content_hash,
    pdf_hash,
  }
  const final_hash = await sha256Hex(JSON.stringify(finalPayload))

  return {
    inspection_id,
    vehicle_data_hash,
    inspection_data_hash,
    damages_hash,
    photos_hash,
    photo_hashes,
    signatures_hash,
    location_hash,
    structured_content_hash,
    pdf_hash,
    final_hash,
    algorithm: INTEGRITY_ALGORITHM,
    scheme: INTEGRITY_SCHEME,
    system_version: SYSTEM_VERSION,
    created_at,
    issued_at: issuedAt,
  }
}
