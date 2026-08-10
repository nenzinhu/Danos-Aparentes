import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { Tabs, TabsList, Tab, TabPanel, getNextTabIndex } from '../Tabs'

function render(value: string) {
  return renderToStaticMarkup(
    <Tabs value={value}>
      <TabsList aria-label="Navegação">
        <Tab value="a">A</Tab>
        <Tab value="b">B</Tab>
        <Tab value="c">C</Tab>
      </TabsList>
      <TabPanel value="a">Painel A</TabPanel>
      <TabPanel value="b">Painel B</TabPanel>
      <TabPanel value="c">Painel C</TabPanel>
    </Tabs>,
  )
}

describe('Tabs (render / a11y)', () => {
  it('renderiza tablist com 3 tabs e painel ativo (a11y)', () => {
    const html = render('b')
    expect(html).toContain('role="tablist"')
    expect(html).toContain('aria-label="Navegação"')
    // 3 tabs (todas renderizam); apenas o painel ativo é montado
    expect((html.match(/role="tab"/g) || []).length).toBe(3)
    expect((html.match(/role="tabpanel"/g) || []).length).toBe(1)
    expect(html).toContain('aria-selected="true"')
    expect((html.match(/aria-selected="false"/g) || []).length).toBe(2)
    expect(html).toContain('aria-controls="')
    expect(html).toContain('tabindex="0"')
    expect((html.match(/tabindex="-1"/g) || []).length).toBe(2)
    expect(html).toContain('Painel B')
    expect(html).not.toContain('Painel A')
  })

  it('tabpanel ativo referencia a tab via id', () => {
    const html = render('a')
    expect(html).toContain('aria-labelledby="')
    expect(html).toContain('id="')
  })
})

describe('getNextTabIndex (keyboard nav)', () => {
  it('horizontal: setas, Home, End, ciclo', () => {
    expect(getNextTabIndex('ArrowRight', 0, 3)).toBe(1)
    expect(getNextTabIndex('ArrowRight', 2, 3)).toBe(0)
    expect(getNextTabIndex('ArrowLeft', 0, 3)).toBe(2)
    expect(getNextTabIndex('Home', 2, 3)).toBe(0)
    expect(getNextTabIndex('End', 0, 3)).toBe(2)
    expect(getNextTabIndex('Enter', 0, 3)).toBe(-1)
  })

  it('vertical: usa ArrowUp/Down', () => {
    expect(getNextTabIndex('ArrowDown', 0, 3, 'vertical')).toBe(1)
    expect(getNextTabIndex('ArrowUp', 0, 3, 'vertical')).toBe(2)
  })

  it('lista vazia retorna -1', () => {
    expect(getNextTabIndex('ArrowRight', 0, 0)).toBe(-1)
  })
})
