'use client';
import React, { memo } from 'react'
import { ViewType } from '../types'

const VIEWS: { id: ViewType; label: string }[] = [
  { id: 'lateral-left',  label: 'Lat. Esquerda' },
  { id: 'lateral-right', label: 'Lat. Direita' },
  { id: 'frontal',       label: 'Frontal' },
  { id: 'traseira',      label: 'Traseira' },
]

interface Props {
  current: ViewType
  onChange: (v: ViewType) => void
}

function ViewSelectorComponent({ current, onChange }: Props) {
  return (
    <div className='flex flex-wrap gap-1.5 justify-center items-center font-outfit'>
      {VIEWS.map(v => {
        const isActive = current === v.id
        return (
          <button 
            key={v.id}
            onClick={() => onChange(v.id)}
            className={`
              px-3.5 py-1.5 rounded-lg cursor-pointer text-[0.78rem] font-bold transition-all duration-200 border
              ${isActive
                ? 'bg-sky-500/15 border-sky-500 text-sky-400 shadow-[0_0_12px_rgba(14,165,233,0.2)]'
                : 'bg-[var(--btn-secondary-bg)] border-[var(--btn-secondary-border)] text-[var(--text-muted)] hover:bg-[var(--btn-secondary-hover)] hover:border-[var(--btn-secondary-border)]'
              }
              backdrop-blur-sm
            `}
          >
            {v.label}
          </button>
        )
      })}
    </div>
  )
}

export default memo(ViewSelectorComponent)

