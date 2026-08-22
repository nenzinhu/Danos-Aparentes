import { SavedReport } from '../../types'
import { CloudState, SortKey } from './types'

// Cabeçalho do grupo: "Hoje", "Ontem" ou "Mês de Ano"
export function dateBucket(ts: number): string {
  const d = new Date(ts)
  const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime()
  const ONE_DAY = 86400000
  const today = startOf(new Date())
  const day = startOf(d)
  if (day === today) return 'Hoje'
  if (day === today - ONE_DAY) return 'Ontem'
  const s = d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function cloudStateOf(
  id: string,
  pendingIds: Set<string>,
  supabaseEnabled: boolean,
): CloudState {
  if (!supabaseEnabled) return 'local'
  return pendingIds.has(id) ? 'pending' : 'cloud'
}

export function filterReports(
  saved: SavedReport[],
  {
    workflowFilter,
    searchQuery,
    cloudStateOf: getCloudState,
  }: {
    workflowFilter: 'all' | 'local' | 'cloud' | 'draft'
    searchQuery: string
    cloudStateOf: (id: string) => CloudState
  },
): SavedReport[] {
  return saved.filter(r => {
    if (workflowFilter === 'draft') {
      if (r.status !== 'draft') return false
    } else if (workflowFilter !== 'all') {
      const state = getCloudState(r.id)
      if (workflowFilter === 'local' && state === 'cloud') return false
      if (workflowFilter === 'cloud' && state !== 'cloud') return false
    }

    const q = searchQuery.toLowerCase().trim()
    if (!q) return true
    return (
      (r.vehicleInfo.owner || '').toLowerCase().includes(q) ||
      (r.vehicleInfo.plate || '').toLowerCase().includes(q) ||
      (r.vehicleInfo.brand || '').toLowerCase().includes(q) ||
      (r.vehicleInfo.ref || '').toLowerCase().includes(q)
    )
  })
}

export function sortReports(filtered: SavedReport[], sortKey: SortKey): SavedReport[] {
  return [...filtered].sort((a, b) => {
    switch (sortKey) {
      case 'old': return a.savedAt - b.savedAt
      case 'owner': return (a.vehicleInfo.owner || '').localeCompare(b.vehicleInfo.owner || '', 'pt-BR')
      case 'plate': return (a.vehicleInfo.plate || '').localeCompare(b.vehicleInfo.plate || '', 'pt-BR')
      case 'recent':
      default: return b.savedAt - a.savedAt
    }
  })
}

export function groupReportsByDate(
  sorted: SavedReport[],
  sortKey: SortKey,
): { label: string | null; items: SavedReport[] }[] {
  const isDateSort = sortKey === 'recent' || sortKey === 'old'
  const groups: { label: string | null; items: SavedReport[] }[] = []
  if (isDateSort) {
    let cur: { label: string | null; items: SavedReport[] } | null = null
    for (const r of sorted) {
      const label = dateBucket(r.savedAt)
      if (!cur || cur.label !== label) { cur = { label, items: [] }; groups.push(cur) }
      cur.items.push(r)
    }
  } else {
    groups.push({ label: null, items: sorted })
  }
  return groups
}
