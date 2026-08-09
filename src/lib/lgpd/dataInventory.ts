/**
 * FASE 11 — Technical inventory of personal data processed by the product.
 * Not a legal opinion; documents what the code actually stores/touches.
 */

export type PersonalDataCategory =
  | 'identity'
  | 'contact'
  | 'document'
  | 'location'
  | 'biometric_like'
  | 'media'
  | 'account'

export type PersonalDataField = {
  key: string
  label: string
  category: PersonalDataCategory
  /** Where it typically lives in the product. */
  storage: string
  sensitive: boolean
}

/** Fields the app may collect during an inspection / account lifecycle. */
export const PERSONAL_DATA_INVENTORY: PersonalDataField[] = [
  { key: 'owner', label: 'Nome do cliente', category: 'identity', storage: 'vehicle_inspections / IndexedDB', sensitive: false },
  { key: 'cpf', label: 'CPF', category: 'document', storage: 'vehicle_inspections / IndexedDB', sensitive: true },
  { key: 'cnh', label: 'CNH', category: 'document', storage: 'vehicle_inspections / IndexedDB', sensitive: true },
  { key: 'phone', label: 'Telefone', category: 'contact', storage: 'vehicle_inspections / IndexedDB', sensitive: false },
  { key: 'plate', label: 'Placa', category: 'identity', storage: 'vehicle_inspections / report_hashes', sensitive: false },
  { key: 'geo', label: 'GPS da vistoria', category: 'location', storage: 'vehicle_inspections / report_hashes', sensitive: true },
  { key: 'inspectorSignature', label: 'Assinatura do vistoriador', category: 'biometric_like', storage: 'vehicle_inspections', sensitive: true },
  { key: 'clientSignature', label: 'Assinatura do cliente', category: 'biometric_like', storage: 'vehicle_inspections', sensitive: true },
  { key: 'damagePhotos', label: 'Fotos de avarias', category: 'media', storage: 'Storage + IndexedDB', sensitive: false },
  { key: 'documentPhotos', label: 'Fotos de documentos', category: 'media', storage: 'Storage + IndexedDB', sensitive: true },
  { key: 'accountEmail', label: 'E-mail da conta', category: 'account', storage: 'Supabase Auth', sensitive: false },
]

export function inventoryByCategory(category: PersonalDataCategory): PersonalDataField[] {
  return PERSONAL_DATA_INVENTORY.filter((f) => f.category === category)
}

export function sensitiveFields(): PersonalDataField[] {
  return PERSONAL_DATA_INVENTORY.filter((f) => f.sensitive)
}
