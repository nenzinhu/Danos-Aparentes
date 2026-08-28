// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import axe from 'axe-core'
import { PaginatedList } from './PaginatedList'

afterEach(cleanup)

const items = Array.from({ length: 25 }, (_, i) => ({ id: `i${i}`, name: `Item ${i + 1}` }))

async function assertNoViolations(container: HTMLElement) {
  const results = await axe.run(container, {
    rules: { 'color-contrast': { enabled: false } },
  })
  expect(results.violations).toHaveLength(0)
}

describe('PaginatedList', () => {
  it('renderiza 10 itens por página e pagina para a próxima', () => {
    render(<PaginatedList items={items} pageSize={10} ariaLabel="itens" getItemKey={(i) => i.id} renderItem={(i) => <span>{i.name}</span>} />)

    expect(screen.getByRole('list')).toBeTruthy()
    expect(screen.getAllByRole('listitem')).toHaveLength(10)
    expect(screen.getByText('Item 1')).toBeTruthy()
    expect(screen.queryByText('Item 11')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Próximo' }))
    expect(screen.getByText('Item 11')).toBeTruthy()
    expect(screen.queryByText('Item 21')).toBeNull()
  })

  it('desabilita Anterior na primeira página e Próximo na última (aria-disabled)', () => {
    render(<PaginatedList items={items} pageSize={10} ariaLabel="itens" getItemKey={(i) => i.id} renderItem={(i) => <span>{i.name}</span>} />)

    const prev = screen.getByRole('button', { name: 'Anterior' })
    const next = screen.getByRole('button', { name: 'Próximo' })
    expect(prev.getAttribute('aria-disabled')).toBe('true')
    expect(next.getAttribute('aria-disabled')).toBe('false')

    fireEvent.click(next)
    fireEvent.click(next) // página 3 (última, 5 itens)
    expect(prev.getAttribute('aria-disabled')).toBe('false')
    expect(next.getAttribute('aria-disabled')).toBe('true')
  })

  it('anuncia posição acessível por item (aria-label "Item N de 25")', () => {
    render(<PaginatedList items={items} pageSize={10} ariaLabel="itens" getItemKey={(i) => i.id} renderItem={(i) => <span>{i.name}</span>} />)
    const firstItem = screen.getAllByRole('listitem')[0]
    expect(firstItem.getAttribute('aria-label')).toBe('itens 1 de 25')
  })

  it('estado vazio quando não há itens', () => {
    render(
      <PaginatedList
        items={[] as Array<{ id: string; name: string }>}
        ariaLabel="itens"
        emptyText="Nada aqui."
        getItemKey={(i) => i.id}
        renderItem={(i) => <span>{i.name}</span>}
      />,
    )
    expect(screen.getByText('Nada aqui.')).toBeTruthy()
  })

  it('não tem violações de acessibilidade (axe-core)', async () => {
    const { container } = render(
      <PaginatedList items={items} pageSize={10} ariaLabel="itens" getItemKey={(i) => i.id} renderItem={(i) => <span>{i.name}</span>} />,
    )
    await assertNoViolations(container)
  })
})
