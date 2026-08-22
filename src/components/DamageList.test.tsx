// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import DamageList from './DamageList'
import type { Damage, DamageId, ViewType } from '../types'

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

const previousReport = {
  updatedAt: '2026-08-01',
  damageKeys: new Set(['car-ll-door-front::scratch']),
}

afterEach(cleanup)

describe('DamageList (fluxo de inspeção)', () => {
  it('renderiza cada avaria com nome da peça, tipo e severidade', () => {
    render(
      <DamageList
        damages={[
          damage(),
          damage({ id: 'd2' as DamageId, partId: 'car-fr-bumper', partName: 'Para-choque', type: 'dent', typeName: 'Amassado', severity: 'low' }),
        ]}
        onRemove={() => {}}
        onUpdate={() => {}}
      />,
    )
    expect(screen.getByText('Porta Dianteira Esquerda')).toBeTruthy()
    expect(screen.getByText('Para-choque')).toBeTruthy()
    expect(screen.getByText('Grave')).toBeTruthy()
    expect(screen.getByText('Leve')).toBeTruthy()
  })

  it('chama onRemove com o id correto ao clicar em ✕', () => {
    const onRemove = vi.fn()
    render(<DamageList damages={[damage()]} onRemove={onRemove} onUpdate={() => {}} />)
    fireEvent.click(screen.getByText('✕'))
    expect(onRemove).toHaveBeenCalledWith('d1')
  })

  it('não marca como nova uma avaria presente no laudo anterior', () => {
    render(
      <DamageList damages={[damage()]} onRemove={() => {}} onUpdate={() => {}} previousReport={previousReport} />,
    )
    expect(screen.queryByText('Nova')).toBeNull()
  })

  it('marca como nova uma avaria ausente no laudo anterior', () => {
    render(
      <DamageList
        damages={[damage({ partId: 'car-fr-bumper', type: 'dent' })]}
        onRemove={() => {}}
        onUpdate={() => {}}
        previousReport={previousReport}
      />,
    )
    expect(screen.getByText('Nova')).toBeTruthy()
  })

  it('mostra estado vazio quando não há avarias', () => {
    render(<DamageList damages={[]} onRemove={() => {}} onUpdate={() => {}} />)
    expect(screen.getByText(/clique em uma peça no svg/i)).toBeTruthy()
  })
})
