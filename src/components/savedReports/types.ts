import { SavedReport } from '../../types'

export type SortKey = 'recent' | 'old' | 'owner' | 'plate'
export type CloudState = 'cloud' | 'pending' | 'local'

export const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'recent', label: 'Mais recentes' },
  { key: 'old', label: 'Mais antigas' },
  { key: 'owner', label: 'Cliente A–Z' },
  { key: 'plate', label: 'Placa A–Z' },
]

export interface SavedReportsModalProps {
  isOpen: boolean
  saved: SavedReport[]
  onClose: () => void
  onSave: () => void
  onLoad: (r: SavedReport) => void
  onCreateCorrection?: (r: SavedReport, reason: string) => void | Promise<void>
  onDelete: (id: string) => void
  hasAccess?: boolean
  accessToken?: string
  userId?: string
}
