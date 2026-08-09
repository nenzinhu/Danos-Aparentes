import type { Vehicle } from './types'

/** Normaliza placa para comparação (mantém compatibilidade com o app). */
export function normalizePlate(plate: string): string {
  return plate.toUpperCase().replace(/[^A-Z0-9]/g, '')
}

/**
 * Chave de resolução de veículo.
 * Preferência: id interno > VIN > placa normalizada (escopo tenant).
 * Mudança de placa NÃO quebra o histórico se o vínculo for por id.
 */
export function vehicleLookupKey(input: {
  tenantId: string
  vehicleId?: string | null
  vin?: string | null
  plate?: string | null
}): string {
  if (input.vehicleId) return `id:${input.tenantId}:${input.vehicleId}`
  const vin = input.vin?.trim()
  if (vin) return `vin:${input.tenantId}:${vin.toUpperCase()}`
  const plate = normalizePlate(input.plate ?? '')
  if (plate.length >= 6) return `plate:${input.tenantId}:${plate}`
  throw new Error('Insufficient vehicle identity (need vehicleId, vin, or plate)')
}

/** Atualiza placa sem alterar o id do veículo (histórico preservado). */
export function withUpdatedPlate(vehicle: Vehicle, newPlate: string, updatedAt = new Date().toISOString()): Vehicle {
  return {
    ...vehicle,
    plate: normalizePlate(newPlate),
    updatedAt,
  }
}

/** Isolamento multi-tenant: só retorna se o tenant bater. */
export function assertSameTenant(a: { tenantId: string }, b: { tenantId: string }, label = 'resource'): void {
  if (a.tenantId !== b.tenantId) {
    throw new Error(`Multi-tenant isolation: ${label} belongs to another tenant`)
  }
}
