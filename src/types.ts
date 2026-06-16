export type VehicleType = 'car' | 'moto' | 'truck' | 'van' | 'bus'
export type ViewType = 'lateral-left' | 'lateral-right' | 'frontal' | 'traseira'
export type DamageType = 'scratch' | 'dent' | 'broken'
export type Severity = 'low' | 'medium' | 'high'

export interface Damage {
  id: string
  vehicle: VehicleType
  view: ViewType
  partId: string
  partName: string
  type: DamageType
  typeName: string
  severity: Severity
  notes: string
  photos: string[]
  photoNotes: string[]  // parallel array: caption/tag for each photo
}

export interface VehicleInfo {
  owner: string
  phone: string
  brand: string
  plate: string
  generalNotes: string
  // NEW fields:
  profile: 'oficina' | 'perito' | 'seguradora' | ''
  ref: string        // Nº da OS
  color: string      // Cor do veículo
  vehicleTypeDesc: string  // Tipo do veículo (textual)
  city: string
  state: string
  customFields?: CustomField[]
}

export interface CustomField {
  id: string
  label: string
  value: string
}

export interface SavedReport {
  id: string
  savedAt: number
  vehicleInfo: VehicleInfo
  damages: Damage[]
}

export interface TtsConfig {
  active: boolean
  hoverActive: boolean
  engine: 'native' | 'google-tts'
  gender: 'male' | 'female'
  rate: number
  pitch: number
  volume: number
}

export interface VehicleProps {
  damages: Damage[]
  selectedPartId: string | null
  onPartClick: (id: string, name: string) => void
  onPartHover: (id: string, name: string) => void
}
