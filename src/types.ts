export type Brand<K, T> = K & { readonly __brand?: T };

export type Plate = Brand<string, 'Plate'>;
export type ReportId = Brand<string, 'ReportId'>;
export type DamageId = Brand<string, 'DamageId'>;

export type VehicleType = 'car' | 'car2d' | 'moto' | 'motoneta' | 'truck' | 'van' | 'bus' | 'microbus' | 'custom'
export type ViewType = 'lateral-left' | 'lateral-right' | 'frontal' | 'traseira'
export type DamageType = 'scratch' | 'dent' | 'broken'
export type Severity = 'low' | 'medium' | 'high'

export interface Damage {
  id: DamageId
  vehicle: VehicleType
  view: ViewType
  partId: string
  partName: string
  type: DamageType
  typeName: string
  severity: Severity
  notes: string
  photos: string[]  // blob:{id} | storage:{path} | data:... (legado)
  photoNotes: string[]  // parallel array: caption/tag for each photo
}

export interface VehicleInfo {
  owner: string
  phone: string
  brand: string
  plate: Plate
  generalNotes: string
  interiorNotes: string
  interiorPhotos: string[]  // mesmos formatos de ref que Damage.photos
  interiorPhotoNotes: string[]  // array paralelo, legenda por foto
  // NEW fields:
  profile: 'oficina' | 'perito' | 'seguradora' | ''
  ref: string        // Nº da OS
  color: string      // Cor do veículo
  vehicleTypeDesc: string  // Tipo do veículo (textual)
  city: string
  state: string
  cpf?: string
  cnh?: string
  cnhCategory?: string
  inspectorSignature?: string
  clientSignature?: string
  customFields?: CustomField[]
  /** Localização GPS capturada no momento/local da vistoria. */
  geo?: GeoLocation
}

export interface GeoLocation {
  lat: number
  lng: number
  /** Precisão horizontal em metros, conforme o dispositivo. */
  accuracy?: number
  /** Endereço aproximado (reverse geocoding best-effort, pode faltar offline). */
  address?: string
  /** Epoch ms de quando a posição foi obtida. */
  capturedAt: number
}

export interface CustomField {
  id: string
  label: string
  value: string
}

/** draft = prévia cadastral (cliente/veículo) feita no PC; complete = vistoria/laudo. */
export type InspectionStatus = 'draft' | 'complete'

export interface SavedReport {
  id: ReportId
  savedAt: number
  vehicleInfo: VehicleInfo
  damages: Damage[]
  vehicleType?: VehicleType
  /** Timestamp da última sync bem-sucedida com a nuvem (para detectar deletes remotos). */
  syncedAt?: number
  /** Prévia no computador vs vistoria concluída. Default: complete (legado). */
  status?: InspectionStatus
}

export interface TtsConfig {
  active: boolean
  hoverActive: boolean
  engine: 'native' | 'google-tts' | 'elevenlabs'
  gender: 'male' | 'female'
  rate: number
  pitch: number
  volume: number
  voiceId?: string
}

export interface VehicleProps {
  damages: Damage[]
  selectedPartId: string | null
  onPartClick: (id: string, name: string) => void
  onPartHover: (id: string, name: string) => void
  /** Landing / preview: só vãos de roda, sem pneu interativo */
  hideWheels?: boolean
}

/**
 * Helper utility for compile-time exhaustive type checking.
 * If a new option is added to a union type and not handled,
 * TypeScript will throw a compilation error.
 */
export function assertNever(value: never): never {
  throw new Error(`Unhandled union value: ${JSON.stringify(value)}`);
}
