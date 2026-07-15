import { FIELD_LABELS, type CustomFieldDef } from './constants'

export function loadFieldFilter(): Record<string, boolean> {
  try {
    const saved = localStorage.getItem('vistoria_field_filter')
    if (saved) return JSON.parse(saved)
  } catch {
    /* ignore */
  }
  return Object.fromEntries(Object.keys(FIELD_LABELS).map((k) => [k, true]))
}

export function saveFieldFilter(state: Record<string, boolean>) {
  localStorage.setItem('vistoria_field_filter', JSON.stringify(state))
}

export function loadFieldOrder(): string[] {
  const keys = Object.keys(FIELD_LABELS)
  try {
    const saved = localStorage.getItem('vistoria_field_order')
    if (saved) {
      const parsed: string[] = JSON.parse(saved)
      const valid = parsed.filter((k) => keys.includes(k))
      const missing = keys.filter((k) => !valid.includes(k))
      return [...valid, ...missing]
    }
  } catch {
    /* ignore */
  }
  return keys
}

export function saveFieldOrder(order: string[]) {
  localStorage.setItem('vistoria_field_order', JSON.stringify(order))
}

export function loadCustomFieldDefs(): CustomFieldDef[] {
  try {
    const saved = localStorage.getItem('vistoria_custom_field_defs')
    if (saved) return JSON.parse(saved)
  } catch {
    /* ignore */
  }
  return []
}

export function saveCustomFieldDefs(defs: CustomFieldDef[]) {
  localStorage.setItem('vistoria_custom_field_defs', JSON.stringify(defs))
}
