export const UF_LIST = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
] as const

export const VEHICLE_TYPES = [
  'Passeio (Carro)',
  'Passeio (Carro 2/3 Portas)',
  'SUV / Crossover',
  'Pickup / Caminhonete',
  'Motocicleta',
  'Motoneta',
  'Caminhão',
  'Van / Utilitário',
  'Ônibus',
  'Micro-ônibus',
  'Outro',
] as const

export const FIELD_LABELS: Record<string, string> = {
  profile: 'Perfil do Dossiê',
  ref: 'Nº da OS',
  owner: 'Proprietário / Cliente',
  phone: 'Telefone',
  cpf: 'CPF',
  cnh: 'Nº da Habilitação (CNH)',
  cnhCategory: 'Categoria CNH',
  km: 'Quilometragem (KM)',
  ano: 'Ano do Veículo',
  brand: 'Marca / Modelo',
  plate: 'Placa do Veículo',
  color: 'Cor do Veículo',
  vehicleTypeDesc: 'Tipo do Veículo',
  city: 'Cidade de Emplacamento',
  state: 'Estado (UF)',
  geo: 'Localização da Inspeção (GPS)',
  inspectorSignature: 'Assinatura do Responsável',
  clientSignature: 'Assinatura do Cliente',
}

export const inputClasses =
  'w-full min-w-0 max-w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg px-2.5 py-2 text-[var(--input-color)] font-outfit text-[0.85rem] outline-none focus:border-sky-500/50 transition-colors placeholder:text-[var(--text-muted)]'

export const labelClasses =
  'block text-[0.68rem] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1'

import type { FipePublicSummary, VehicleType } from '../../types'

export interface FoundData {
  brand: string
  color: string
  city: string
  state: string
  vehicleTypeDesc: string
  svgType: Exclude<VehicleType, 'custom'>
  ano: string
  especie: string
  /** Presente quando a API retornou FIPE — não exibir no formulário. */
  fipe?: FipePublicSummary
}

export interface CustomFieldDef {
  id: string
  label: string
}
