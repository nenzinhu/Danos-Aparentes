'use client'

import { memo, useRef, type ReactNode } from 'react'
import { usePagination } from './usePagination'
import { buttonVariants } from '@/src/components/ui/buttonVariants'

interface PaginatedListProps<T> {
  items: T[]
  pageSize?: number
  /** Renderiza cada item; recebe o item e sua posição (1-based) no total. */
  renderItem: (item: T, position: number) => ReactNode
  /** Rótulo acessível da região (ex.: "veículos"). */
  ariaLabel: string
  /** Texto do estado vazio. */
  emptyText?: string
  /** Chave estável por item para React (e a11y de lista). */
  getItemKey: (item: T) => string
}

/**
 * Lista paginada acessível e leve (Core Web Vitals).
 * - role="list" / role="listitem" para leitores de tela
 * - botões Anterior/Próximo com aria-disabled fora de alcance
 * - foco vai ao primeiro item ao trocar de página (teclado)
 * - paginação client-side em `pageSize` (default 10)
 */
function PaginatedListInner<T>({
  items,
  pageSize = 10,
  renderItem,
  ariaLabel,
  emptyText = 'Nenhum item.',
  getItemKey,
}: PaginatedListProps<T>) {
  const { page, totalPages, pageItems, hasPrev, hasNext, setPage, next, prev } = usePagination(
    items,
    pageSize,
  )
  const listRef = useRef<HTMLUListElement>(null)

  const goToPage = (p: number) => {
    setPage(p)
    // foco no primeiro item da nova página (acessibilidade por teclado)
    requestAnimationFrame(() => {
      const first = listRef.current?.querySelector<HTMLElement>('[data-paginated-item]')
      first?.focus()
    })
  }

  const onPrev = () => {
    if (hasPrev) goToPage(page - 1)
  }
  const onNext = () => {
    if (hasNext) goToPage(page + 1)
  }

  if (items.length === 0) {
    return (
      <p className="text-sm text-[var(--text-muted)] text-center py-6" role="status">
        {emptyText}
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <ul role="list" id="paginated-list" aria-label={ariaLabel} ref={listRef} className="flex flex-col gap-3">
        {pageItems.map((item, i) => (
          <li
            role="listitem"
            data-paginated-item
            key={getItemKey(item)}
            tabIndex={0}
            aria-label={`${ariaLabel} ${i + 1} de ${items.length}`}
            className="outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] rounded-xl"
          >
            {renderItem(item, (page - 1) * pageSize + i + 1)}
          </li>
        ))}
      </ul>

      <nav
        className="flex items-center justify-between gap-3 pt-1"
        aria-label={`Paginação de ${ariaLabel}`}
      >
        <span className="text-xs tabular-nums text-[var(--text-muted)]" aria-live="polite">
          Página {page} de {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onPrev}
            aria-disabled={!hasPrev}
            disabled={!hasPrev}
            aria-controls="paginated-list"
            className={buttonVariants({ variant: 'secondary', size: 'sm' })}
          >
            Anterior
          </button>
          <button
            type="button"
            onClick={onNext}
            aria-disabled={!hasNext}
            disabled={!hasNext}
            aria-controls="paginated-list"
            className={buttonVariants({ variant: 'secondary', size: 'sm' })}
          >
            Próximo
          </button>
        </div>
      </nav>
    </div>
  )
}

export const PaginatedList = memo(PaginatedListInner) as typeof PaginatedListInner
