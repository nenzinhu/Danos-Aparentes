import { VehicleInfo, VehicleType, ViewType } from '@/src/types'

export const EMPTY_INFO: VehicleInfo = {
  owner: '', phone: '', brand: '', plate: '', generalNotes: '',
  profile: '', ref: '', color: '', vehicleTypeDesc: '', city: '', state: '',
  cpf: '', cnh: '', cnhCategory: '',
  inspectorSignature: '', clientSignature: '',
  customFields: [],
}

export const VEHICLE_NAME: Record<VehicleType, string> = {
  car: 'Automóvel',
  car2d: 'Carro (2 Portas)',
  moto: 'Moto',
  truck: 'Caminhão',
  van: 'Utilitário',
  bus: 'Ônibus',
  microbus: 'Micro-ônibus',
  custom: 'Genérico',
}

export const VIEW_NAME: Record<ViewType, string> = {
  'lateral-left': 'Lateral Esquerda',
  'lateral-right': 'Lateral Direita',
  frontal: 'Frontal',
  traseira: 'Traseira',
}
