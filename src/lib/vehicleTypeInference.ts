import type { Damage, VehicleType } from '../types'

/** Infere o tipo de diagrama a partir da descrição textual (ex.: vehicleTypeDesc). */
export function inferVehicleTypeFromDesc(desc: string): VehicleType {
  const text = (desc || '').toLowerCase()
  if (text.includes('motoneta')) return 'motoneta'
  if (text.includes('motociclet') || text.includes('moto')) return 'moto'
  if (text.includes('micro')) return 'microbus'
  if (text.includes('ônibus') || text.includes('onibus')) return 'bus'
  if (text.includes('caminh')) return 'truck'
  if (text.includes('van') || text.includes('utilit')) return 'van'
  if (text.includes('2 portas') || text.includes('3 portas') || text.includes('2p') || text.includes('3p')) return 'car2d'
  return 'car'
}

/** Prioriza damages salvos; senão infere pela descrição do veículo. */
export function resolveVehicleType(desc: string, damages: Damage[]): VehicleType {
  if (damages?.length > 0 && damages[0].vehicle) return damages[0].vehicle
  return inferVehicleTypeFromDesc(desc)
}
