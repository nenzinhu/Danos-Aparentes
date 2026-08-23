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
  visited?: ViewType[]
}

function ViewSelectorComponent({ current, onChange, visited }: Props) {
  const visitedCount = visited?.length ?? 0
  return (
    <div className='flex flex-col items-center gap-1.5 font-outfit'>
      <div className='flex flex-wrap gap-1.5 justify-center items-center'>
        {VIEWS.map(v => {
          const isActive = current === v.id
          const isVisited = visited?.includes(v.id) ?? false
          return (
            <button
              key={v.id}
              onClick={() => onChange(v.id)}
              className={`
                relative px-3.5 py-1.5 rounded-lg cursor-pointer text-[0.78rem] font-bold transition-all duration-200 active:scale-90 motion-reduce:active:scale-100 border
                ${isActive
                  ? 'bg-sky-500/15 border-sky-500 text-sky-400 shadow-[0_0_12px_rgba(14,165,233,0.2)]'
                  : 'bg-[var(--btn-secondary-bg)] border-[var(--btn-secondary-border)] text-[var(--text-muted)] hover:bg-[var(--btn-secondary-hover)] hover:border-[var(--btn-secondary-border)]'
                }
                backdrop-blur-sm
              `}
            >
              {v.label}
              {isVisited && (
                <span className='absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-emerald-500 text-white text-[0.55rem] flex items-center justify-center font-black shadow-md'>
                  ✓
                </span>
              )}
            </button>
          )
        })}
      </div>
      {visited && (
        <div className='flex items-center gap-1.5 text-[0.68rem] font-bold text-[var(--text-muted)]'>
          <div className='w-24 h-1.5 rounded-full bg-[var(--btn-secondary-bg)] overflow-hidden'>
            <div
              className='h-full bg-emerald-500 transition-all duration-300'
              style={{ width: `${(visitedCount / VIEWS.length) * 100}%` }}
            />
          </div>
          <span>{visitedCount} de {VIEWS.length} vistas concluídas</span>
        </div>
      )}
    </div>
  )
}

export default memo(ViewSelectorComponent)

