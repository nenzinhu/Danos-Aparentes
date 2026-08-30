import { useState, useEffect, useCallback } from 'react'

// Tipos para a resposta paginada
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface PaginatedItem {
  id: string
  title: string
  description: string
}

export function usePaginatedSupabase<T extends PaginatedItem>(
  endpoint: string,
  initialPage: number = 1,
  pageSize: number = 10,
  filter?: Record<string, any>
) {
  const [data, setData] = useState<T[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(initialPage)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Carregar dados da página
  const fetchPage = useCallback(async (pageNum: number, ps: number) => {
    try {
      setLoading(true)
      setError(null)
      
      // Montar a URL com filtros
      const searchParams = new URLSearchParams({
        page: pageNum.toString(),
        pageSize: ps.toString(),
        ...(filter || {})
      })

      const response = await fetch(`${endpoint}?${searchParams.toString()}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json() as PaginatedResponse<T>
      
      setData(result.data)
      setTotal(result.total)
      setPage(result.page)
      
      return result
    } catch (err) {
      setError('Erro ao carregar dados')
      console.error('Erro ao carregar página:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [endpoint, filter])

  // Efeito para carregar dados da página inicial
  useEffect(() => {
    fetchPage(initialPage, pageSize)
  }, [fetchPage, initialPage, pageSize])

  const goToPage = useCallback((pageNum: number) => {
    if (pageNum >= 1) {
      fetchPage(pageNum, pageSize)
    }
  }, [fetchPage, pageSize])

  const goToNext = useCallback(() => {
    if (page < Math.ceil(total / pageSize)) {
      goToPage(page + 1)
    }
  }, [page, total, pageSize, goToPage])

  const goToPrevious = useCallback(() => {
    if (page > 1) {
      goToPage(page - 1)
    }
  }, [page, goToPage])

  return {
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
    loading,
    error,
    goToPage,
    goToNext,
    goToPrevious,
    refetch: () => fetchPage(page, pageSize)
  }
}