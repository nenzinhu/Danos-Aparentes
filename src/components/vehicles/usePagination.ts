import { useCallback, useMemo, useState } from 'react'

export interface UsePaginationResult<T> {
  page: number
  pageSize: number
  totalPages: number
  pageItems: T[]
  hasPrev: boolean
  hasNext: boolean
  setPage: (page: number) => void
  next: () => void
  prev: () => void
}

/**
 * Paginação client-side genérica (Container/Presentational).
 * Mantém `page` dentro de [1, totalPages] mesmo quando o conjunto filtrado
 * encolhe (busca) — evita página vazia após filtrar.
 */
export function usePagination<T>(items: T[], pageSize: number): UsePaginationResult<T> {
  const [page, setPageState] = useState(1)

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))

  const setPage = useCallback(
    (p: number) => {
      setPageState(Math.min(Math.max(1, p), Math.max(1, Math.ceil(items.length / pageSize))))
    },
    [items.length, pageSize],
  )

  const next = useCallback(() => setPageState((p) => Math.min(p + 1, totalPages)), [totalPages])
  const prev = useCallback(() => setPageState((p) => Math.max(p - 1, 1)), [])

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize
    return items.slice(start, start + pageSize)
  }, [items, page, pageSize])

  const hasPrev = page > 1
  const hasNext = page < totalPages

  return { page, pageSize, totalPages, pageItems, hasPrev, hasNext, setPage, next, prev }
}
