'use client';
import { useEffect, useRef, useState } from 'react'
import { DamageType } from '../types'

interface Props {
  partName: string
  position: { x: number; y: number }
  currentType?: DamageType
  onChoose: (type: DamageType, typeName: string) => void
  onClear: () => void
  onClose: () => void
}

export default function DamageFloat({ partName, position, currentType, onChoose, onClear, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)')
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onClickOutside)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onClickOutside)
    }
  }, [onClose])

  const types: { type: DamageType; label: string; icon: React.ReactNode; color: string; bg: string; border: string }[] = [
    { 
      type: 'scratch', 
      label: 'Riscos / Abrasão', 
      icon: (
        <img src="/scratch.png" alt="Riscos / Abrasão" className="h-10 sm:h-8 w-auto object-contain" />
      ), 
      color: 'text-amber-500', 
      bg: 'bg-amber-500/10', 
      border: 'border-amber-500/30' 
    },
    { 
      type: 'dent',    
      label: 'Deformação',  
      icon: (
        <img src="/dent.png" alt="Deformação" className="h-10 sm:h-8 w-auto object-contain" />
      ), 
      color: 'text-orange-500', 
      bg: 'bg-orange-500/10', 
      border: 'border-orange-500/30' 
    },
    { 
      type: 'broken',  
      label: 'Dano / Fratura',  
      icon: (
        <img src="/broken.png" alt="Dano / Fratura" className="h-10 sm:h-8 w-auto object-contain" />
      ), 
      color: 'text-red-500', 
      bg: 'bg-red-500/10', 
      border: 'border-red-500/30' 
    },
  ]

  const left = Math.max(8, Math.min(position.x, window.innerWidth - 208))
  const top = Math.max(8, Math.min(position.y, window.innerHeight - 210))

  // No mobile o popup vira um painel fixo no fundo (bottom sheet), em vez de
  // tentar caber ao lado do veículo num ecrã estreito.
  const containerClass = isMobile
    ? 'fixed z-[10000] left-0 right-0 bottom-0 w-full p-4 pb-[max(1rem,env(safe-area-inset-bottom))] rounded-t-2xl border-t backdrop-blur-xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300'
    : 'fixed z-[10000] w-[200px] p-3 rounded-2xl border backdrop-blur-xl transition-all duration-300 shadow-2xl animate-in fade-in zoom-in-95'

  const containerStyle = isMobile
    ? { background: 'var(--card-bg)', borderColor: 'var(--card-border)', boxShadow: 'var(--glass-shadow)' }
    : { left, top, background: 'var(--card-bg)', borderColor: 'var(--card-border)', boxShadow: 'var(--glass-shadow)' }

  return (
    <div ref={ref} className={containerClass} style={containerStyle}>
      {/* Pega do bottom sheet (mobile) */}
      {isMobile && (
        <div aria-hidden="true" className="mx-auto mb-2.5 h-1 w-10 rounded-full bg-[var(--text-muted)]/40" />
      )}

      {/* Título */}
      <div className="flex justify-between items-center mb-2.5">
        <span className="font-outfit font-extrabold text-sm text-[var(--text-main)] flex items-center gap-1.5">
          <svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 83.62 122.88" className="h-[18px] w-auto fill-red-500 animate-pulse shrink-0" aria-hidden="true">
            <title>click</title>
            <path d="M40.59,14.63a3.36,3.36,0,0,1-1,2.39l0,0a3.39,3.39,0,0,1-4.77,0,3.42,3.42,0,0,1-1-2.4V3.39A3.4,3.4,0,0,1,37.2,0a3.34,3.34,0,0,1,2.39,1,3.39,3.39,0,0,1,1,2.4V14.63Zm25,76.65a1.89,1.89,0,0,1,3.77,0V99.9a1.89,1.89,0,1,1-3.77,0V91.28ZM54.46,87.47a1.89,1.89,0,0,1,3.77,0V99.9a1.89,1.89,0,1,1-3.77,0V87.47Zm-28-7.63a1.92,1.92,0,0,1-.35-.23q-5.24-4.24-10.44-8.53a8.36,8.36,0,0,0-3.57-1.79,3.54,3.54,0,0,0-2,.09A2,2,0,0,0,9,70.49a6.9,6.9,0,0,0-.4,3.24,12.47,12.47,0,0,0,1.11,4,26.49,26.49,0,0,0,2.92,4.94l17.68,26.74a2.37,2.37,0,0,1,.36,1,15.28,15.28,0,0,0,1.87,6.4,2.89,2.89,0,0,0,2.57,1.46c9,0,18.62-.34,27.53,0a8.33,8.33,0,0,0,4.69-1.51,15,15,0,0,0,4.29-5l.34-.57c3.4-5.87,6.71-11.57,7-18.33L78.85,85l0-.33,0-1.84c.06-5.74.16-14.54-4.62-15.4H71.14c.09,2.46,0,5-.18,7.3-.08,1.36-.15,2.63-.15,3.79a2.31,2.31,0,1,1-4.62,0c0-1.1.08-2.52.17-4,.32-5.73.75-13.38-3.24-14.14h-3a2.2,2.2,0,0,1-.58-.07,69.07,69.07,0,0,1-.13,8.29c-.07,1.36-.15,2.63-.15,3.79a2.31,2.31,0,1,1-4.61,0c0-1.1.08-2.52.16-4,.33-5.73.76-13.38-3.24-14.14h-3a2,2,0,0,1-.6-.08V66a2.31,2.31,0,1,1-4.61,0V42c0-4-1.64-6.55-3.73-7.61a5.32,5.32,0,0,0-4.71-.06l-.1.06c-2.07,1-3.69,3.59-3.69,7.7v42a2.31,2.31,0,1,1-4.62,0V79.84Zm44.14-17a2.49,2.49,0,0,1,.61-.08h3.19a2.33,2.33,0,0,1,.53.06c8.73,1.4,8.61,12.65,8.52,20,0,3.4.14,6.78.18,10.17-.39,7.91-4,14.1-7.67,20.47l-.32.55A19.49,19.49,0,0,1,70,120.55a12.88,12.88,0,0,1-7.29,2.32H35.17a7.23,7.23,0,0,1-6.44-3.5,19,19,0,0,1-2.56-7.88L8.94,85.42A31,31,0,0,1,5.5,79.58,16.88,16.88,0,0,1,4,74a11.42,11.42,0,0,1,.8-5.42,6.54,6.54,0,0,1,3.55-3.49A8.05,8.05,0,0,1,13,64.76a13.19,13.19,0,0,1,5.61,2.77L26.45,74V42.09c0-6.1,2.73-10,6.22-11.82l.15-.06a9.81,9.81,0,0,1,4.33-1,10,10,0,0,1,4.49,1.07C45.16,32.06,47.91,36,47.91,42v7.6a2.41,2.41,0,0,1,.6-.08H51.7a2.33,2.33,0,0,1,.53.06c3.82.61,5.73,3.16,6.63,6.47a2.25,2.25,0,0,1,1.23-.36h3.18a2.26,2.26,0,0,1,.53.06c4.07.65,6,3.49,6.79,7.11ZM14.63,37A3.33,3.33,0,0,1,17,38a3.39,3.39,0,0,1-2.39,5.79H3.39a3.36,3.36,0,0,1-2.39-1A3.4,3.4,0,0,1,3.39,37ZM23,20.55a3.39,3.39,0,0,1-2.4,5.79,3.4,3.4,0,0,1-2.4-1l-7.91-7.94a3.42,3.42,0,0,1-1-2.4,3.39,3.39,0,0,1,5.79-2.4L23,20.55ZM59.2,43.81a3.41,3.41,0,0,1-3.4-3.4A3.41,3.41,0,0,1,59.2,37H70.43a3.35,3.35,0,0,1,2.4,1,3.4,3.4,0,0,1-2.4,5.79ZM55.62,24.74a3.39,3.39,0,0,1-4.8-4.8l7.91-8a3.39,3.39,0,0,1,4.8,4.8l-7.91,8Z" />
          </svg> {partName}
        </span>
        <button 
          onClick={onClose} 
          className="bg-[var(--btn-secondary-bg)] border border-[var(--btn-secondary-border)] hover:bg-[var(--btn-secondary-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)] rounded-lg w-7 h-7 flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
        >
          ✕
        </button>
      </div>

      {/* Label acima */}
      <div className="text-[0.68rem] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">
        Tipo de avaria
      </div>

      {/* Opções */}
      <div className="grid grid-cols-3 gap-1.5">
        {types.map(t => {
          const isActive = currentType === t.type
          return (
            <button
              key={t.type}
              onClick={() => onChoose(t.type, t.label)}
              className={`flex flex-col items-center gap-1 p-1.5 rounded-xl border font-outfit text-xs font-bold transition-all duration-200 cursor-pointer ${
                isActive
                  ? `${t.bg} ${t.border} ${t.color} scale-[1.05] ring-2 ring-[var(--primary)]`
                  : 'bg-[var(--btn-secondary-bg)] border-[var(--btn-secondary-border)] text-[var(--text-main)] hover:bg-[var(--btn-secondary-hover)] hover:scale-[1.02]'
              }`}
            >
              <div className={`h-10 sm:h-8 flex items-center justify-center transition-transform duration-200 ${isActive ? 'scale-110' : 'hover:scale-110'}`}>
                {t.icon}
              </div>
              <span className="text-[0.7rem] sm:text-[0.6rem] tracking-tight leading-tight text-center">{t.label}</span>
              {isActive && (
                <span className="text-[0.55rem] uppercase font-black tracking-widest text-[var(--primary)] mt-0.5 animate-bounce">
                  Ativo
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Sem avaria */}
      <button 
        onClick={onClear}
        className="mt-2.5 w-full flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl border font-outfit text-[0.7rem] font-black transition-all duration-200 cursor-pointer bg-red-500/10 hover:bg-red-500/15 border-red-500/35 hover:border-red-500/50 text-red-500"
      >
        <span>🧽</span> Sem avaria / Limpar
      </button>
    </div>
  )
}
