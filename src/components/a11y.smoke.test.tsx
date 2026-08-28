// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import axe from 'axe-core'
import Button from './ui/Button'
import DamageList from './DamageList'
import type { Damage, DamageId, ViewType } from '../types'

// Smoke de acessibilidade (skill danosaparentes, item "axe-core").
// Garante zero violações em componentes representativos do design system.
// axe-core importa direto (sem jest-axe); rodamos sobre o container renderizado.

function damage(overrides: Partial<Damage> = {}): Damage {
  return {
    id: 'd1' as DamageId,
    vehicle: 'car',
    view: 'lateral-left' as ViewType,
    partId: 'car-ll-door-front',
    partName: 'Porta Dianteira Esquerda',
    type: 'scratch',
    typeName: 'Risco',
    severity: 'high',
    notes: '',
    photos: [],
    photoNotes: [],
    ...overrides,
  }
}

afterEach(cleanup)

async function assertNoViolations(container: HTMLElement) {
  const results = await axe.run(container, {
    // jsdom não implementa color-contrast (getComputedStyle limitado); não é regressão real.
    rules: { 'color-contrast': { enabled: false } },
  })
  if (results.violations.length > 0) {
    const summary = results.violations
      .map((v) => `  • ${v.id}: ${v.help} (${v.nodes.length} node(s))`)
      .join('\n')
    throw new Error(`axe violations:\n${summary}`)
  }
  expect(results.violations).toHaveLength(0)
}

describe('a11y smoke (axe-core)', () => {
  it('Button do design system não tem violações de acessibilidade', async () => {
    const { container } = render(<Button onClick={() => {}}>Continuar vistoria</Button>)
    await assertNoViolations(container)
  })

  it('DamageList (role=list) não tem violações de acessibilidade', async () => {
    const { container } = render(
      <DamageList
        damages={[
          damage(),
          damage({ id: 'd2' as DamageId, partId: 'car-fr-bumper', partName: 'Para-choque', type: 'dent', typeName: 'Amassado', severity: 'low' }),
        ]}
        onRemove={() => {}}
        onUpdate={() => {}}
      />
    )
    // garante que a lista acessível foi montada (skill: role=list / listitem)
    expect(screen.getByRole('list')).toBeTruthy()
    expect(screen.getAllByRole('listitem').length).toBe(2)
    await assertNoViolations(container)
  })
})
