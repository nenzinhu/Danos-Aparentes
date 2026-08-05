import { VehicleInfo, VehicleType, ViewType } from '@/src/types'

export const EMPTY_INFO: VehicleInfo = {
  owner: '', phone: '', brand: '', plate: '', generalNotes: '',
  interiorNotes: '', interiorPhotos: [], interiorPhotoNotes: [],
  profile: '', ref: '', color: '', vehicleTypeDesc: '', city: '', state: '',
  cpf: '', cnh: '', cnhCategory: '',
  inspectorSignature: '', clientSignature: '',
  customFields: [],
}

export const VEHICLE_NAME: Record<VehicleType, string> = {
  car: 'Automóvel',
  car2d: 'Carro (2/3 Portas)',
  moto: 'Motocicleta',
  motoneta: 'Motoneta',
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

/** Abas curtas para trocar o lado com um toque. */
export const VIEW_TAB_SHORT: Record<ViewType, string> = {
  'lateral-left': 'Esquerda',
  'lateral-right': 'Direita',
  frontal: 'Frontal',
  traseira: 'Traseira',
}

/** Regra de orientação veicular (sentido de marcha + tampa de combustível = esquerda). */
export const VIEW_ORIENTATION_HINT =
  'Orientação (sentido de marcha): Esquerda = motorista + tampa de combustível. Direita = lado oposto (passageiro), sem a tampa. Frontal = nariz / frente. Traseira = oposto à frente. Não use a esquerda/direita da tela — use marcas do veículo.'

