import { readFileSync } from 'node:fs'
import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import HomePage from './page'

function collectText(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(collectText).join(' ')
  if (node && typeof node === 'object' && 'props' in node) {
    return collectText((node.props as { children?: ReactNode }).children)
  }
  return ''
}

describe('maintenance home', () => {
  it('announces the temporary update and future innovations', () => {
    const content = collectText(HomePage())

    expect(content).toContain('Aguarde atualização')
    expect(content).toContain('Implementações inovadoras')
  })

  it('forces the dark brand palette and keeps vertical scrolling available', () => {
    const css = readFileSync(new URL('./maintenance.module.css', import.meta.url), 'utf8')
    const globalCss = readFileSync(new URL('./globals.css', import.meta.url), 'utf8')

    expect(css).toMatch(/\.maintenanceRoot[\s\S]*--bg-main:\s*#0B0F17/i)
    expect(css).not.toContain(':global(body')
    expect(globalCss).toMatch(/body:has\(\[data-maintenance-root\]\)[\s\S]*overflow-x:\s*hidden/i)
    expect(globalCss).toMatch(/body:has\(\[data-maintenance-root\]\)[\s\S]*overflow-y:\s*auto/i)
    expect(css).toMatch(/@media \(max-width: 640px\)[\s\S]*\.title\s*\{[^}]*13vw/i)
  })
})
