import { seedDemoData, getStore } from './demoData'
import type { VehicleEvidenceStore } from '../store/memoryStore'

let store: VehicleEvidenceStore | null = null

export function useLabStore(): VehicleEvidenceStore {
  if (!store) {
    store = getStore()
    seedDemoData(store)
  }
  return store
}

export function resetLabStore(): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('vehicle-evidence-lab-v1')
  }
  store = null
}
