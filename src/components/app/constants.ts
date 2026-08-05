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

/** Regra de orientação veicular (sentido de marcha, de dentro para fora). */
export const VIEW_ORIENTATION_HINT =
  'Para a classificação da lateral do veículo, adote sempre o padrão de referência do sentido de marcha (de dentro para fora): Lado Esquerdo — lado do posto de condução (motorista / retrovisor esquerdo). Lado Direito — lado oposto ao condutor (passageiro / retrovisor direito / bocal de combustível, dependendo do modelo). Atenção: não utilize a perspectiva de quem está olhando de fora para o carro. Se a foto mostrar a porta do motorista, classifique obrigatoriamente como Esquerda. Frontal = frente do veículo (sentido de marcha / nariz). Traseira = oposto à frente.'

