'use client';
import { useCallback } from 'react'
import type { MouseEvent } from 'react'
import type { Damage } from '../../types'

type PartClickHandler = (id: string, name: string) => void

export function usePartProps(
  damages: Damage[],
  selectedPartId: string | null,
  onPartClick: PartClickHandler,
  onPartHover: PartClickHandler,
) {
  return useCallback((id: string) => {
    const dmg = damages.find(d => d.partId === id)
    const isWheel = id.includes('wheel')
    const cls = [
      'part',
      isWheel ? 'wheel-part' : '',
      dmg ? `damage-${dmg.severity}` : '',
      selectedPartId === id ? 'selected' : '',
    ].filter(Boolean).join(' ')

    return {
      className: cls,
      onClick: (e: MouseEvent<SVGElement>) => {
        e.stopPropagation()
        const name = (e.currentTarget as SVGElement).getAttribute('data-name') || id
        onPartClick(id, name)
      },
      onMouseEnter: (e: MouseEvent<SVGElement>) => {
        const name = (e.currentTarget as SVGElement).getAttribute('data-name') || id
        onPartHover(id, name)
      },
    }
  }, [damages, selectedPartId, onPartClick, onPartHover])
}
