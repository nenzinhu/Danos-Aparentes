import { useState, useEffect, useCallback, memo } from 'react'
import { Button } from '@/src/components/ui/Button'
import { buttonVariants } from '@/src/components/ui/buttonVariants'
import { usePerformanceTelemetry } from '@/src/hooks/usePerformanceTelemetry'

// Tipos para a resposta paginada
export interface Item {
  id: string
  title: string
  description: string
  // Adicione outros campos necessários
}

export interface PaginatedResponse {
  data: Item[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

interface Props {
  fetchPage: (page: number, pageSize: number) => Promise<PaginatedResponse>
  pageSize?: number
  className?: string
}

export const PaginatedList = memo(({ 
  fetchPage, 
  pageSize = 10,
  className = ''
}: Props) => {
  const [data, setData] = useState<Item[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Medição de performance
  const { recordLCP, recordCLS } = usePerformanceTelemetry()

  // Carregar dados da página
  const loadPage = useCallback(async (pageNum: number) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetchPage(pageNum, pageSize)
      
      setData(response.data)
      setTotal(response.total)
      setPage(response.page)
      
      // Registrar métricas de performance
      if (pageNum === 1) {
        recordLCP('PaginatedList initial load')
      }
    } catch (err) {
      setError('Erro ao carregar dados')
      console.error('Erro ao carregar página:', err)
    } finally {
      setLoading(false)
    }
  }, [fetchPage, pageSize, recordLCP])

  // Efeito para carregar dados da página inicial
  useEffect(() => {
    loadPage(1)
  }, [loadPage])

  // Função para ir para a página anterior
  const goToPrevious = useCallback(() => {
    if (page > 1) {
      loadPage(page - 1)
    }
  }, [page, loadPage])

  // Função para ir para a próxima página
  const goToNext = useCallback(() => {
    const totalPages = Math.ceil(total / pageSize)
    if (page < totalPages) {
      loadPage(page + 1)
    }
  }, [page, total, pageSize, loadPage])

  // Calcular total de páginas
  const totalPages = Math.ceil(total / pageSize)

  // Renderizar itens
  const renderItems = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
        </div>
      )
    }

    if (error) {
      return (
        <div className="text-center py-8 text-red-500">
          {error}
        </div>
      )
    }

    if (data.length === 0) {
      return (
        <div className="text-center py-8 text-[var(--text-muted)]">
          Nenhum item encontrado
        </div>
      )
    }

    return (
      <ul role="list" className="space-y-2">
        {data.map((item, index) => (
          <li 
            key={item.id}
            role="listitem"
            aria-label={`Item ${index + 1} de ${total}`}
            tabIndex={0}
            className="bg-white/5 border border-white/10 rounded-lg p-4"
          >
            <div className="font-bold text-[var(--text-main)]">{item.title}</div>
            <div className="text-sm text-[var(--text-muted)] mt-1">{item.description}</div>
          </li>
        ))}
      </ul>
    )
  }

  // Renderizar paginador
  const renderPagination = () => {
    if (totalPages <= 1) return null

    return (
      <div className="flex justify-center items-center gap-2 mt-6">
        <Button
          onClick={goToPrevious}
          disabled={page <= 1}
          aria-disabled={page <= 1}
          aria-controls="paginated-list"
          className={buttonVariants({
            variant: 'outline',
            size: 'sm'
          })}
        >
          Anterior
        </Button>
        
        <span className="text-sm text-[var(--text-muted)]">
          {page} de {totalPages}
        </span>
        
        <Button
          onClick={goToNext}
          disabled={page >= totalPages}
          aria-disabled={page >= totalPages}
          aria-controls="paginated-list"
          className={buttonVariants({
            variant: 'outline',
            size: 'sm'
          })}
        >
          Próximo
        </Button>
      </div>
    )
  }

  return (
    <div className={className}>
      {renderItems()}
      {renderPagination()}
    </div>
  )
})