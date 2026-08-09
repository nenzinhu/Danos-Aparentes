'use client'
import React, { useEffect, memo, Suspense } from 'react'
import { createPortal } from 'react-dom'
import VehicleDefs from '../vehicles/VehicleDefs'
import ErrorBoundary from '../ErrorBoundary'
import { Flip } from '../../lib/gsap'
import { useVehicleViewer } from './context'
import { Controls } from './Controls'
import { Viewport } from './Viewport'

export const FullscreenOverlay = memo(function FullscreenOverlay() {
  const { fullscreen, setFullscreen, damages, containerRef, flipStateRef } = useVehicleViewer()

  useEffect(() => {
    if (!fullscreen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setFullscreen(false) }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [fullscreen, setFullscreen])

  // Replays the small viewport's snapshot into the freshly mounted fullscreen
  // one, so the vehicle visually "grows" into place instead of just fading in.
  useEffect(() => {
    if (!fullscreen || !flipStateRef.current || !containerRef.current) return
    const state = flipStateRef.current
    flipStateRef.current = null
    Flip.from(state, {
      targets: containerRef.current,
      duration: 0.55,
      ease: 'power2.inOut',
      scale: true,
    })
  }, [fullscreen, containerRef, flipStateRef])

  if (!fullscreen) return null

  return createPortal(
    <div className='fixed inset-0 z-[9999] bg-[#020617] flex flex-col p-4 select-none animate-in fade-in duration-300'>
      <VehicleDefs />
      <div className='flex items-center justify-between mb-2 shrink-0'>
        <div className='font-extrabold text-base text-[#e8f4ff] flex items-center gap-2'>
          <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='#00aaff' strokeWidth='2.5'><path d='M8 3H5a2 2 0 00-2 2v3'/><path d='M21 8V5a2 2 0 00-2-2h-3'/><path d='M3 16v3a2 2 0 002 2h3'/><path d='M16 21h3a2 2 0 002-2v-3'/></svg>
          Inspeção Visual — Tela Cheia
        </div>
        <div className='flex items-center gap-2'>
          <Controls variant='header' />
          <button
            type='button'
            onClick={() => setFullscreen(false)}
            className='flex items-center gap-1.5 rounded-lg border border-white/20 bg-black/40 px-3 py-1.5 text-[0.72rem] font-bold text-white hover:bg-black/60 active:scale-95 transition-all'
            aria-label='Sair da tela cheia'
          >
            <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'><path d='M18 6 6 18M6 6l12 12'/></svg>
            Sair
          </button>
        </div>
      </div>

      <div className='flex justify-end mb-2 shrink-0'>
        {damages.length === 0 ? (
          <div className='text-[0.72rem] text-sky-400/35 font-outfit italic'>
            Nenhuma avaria registrada nesta vista
          </div>
        ) : (
          <div className='flex gap-1.5 flex-wrap justify-end max-h-[72px] overflow-y-auto'>
            {damages.map((d, i) => (
              <div key={d.id ?? i} className='flex items-center gap-1.5 bg-red-500/15 border border-red-500/40 rounded-lg px-2.5 py-1 text-[0.72rem] font-bold text-red-400 font-outfit whitespace-nowrap'>
                <svg width='9' height='9' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5'>
                  <path d='M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z'/>
                </svg>
                {d.partName} · {d.typeName}
              </div>
            ))}
          </div>
        )}
      </div>

      <ErrorBoundary>
        <Suspense fallback={<div className="flex-1 flex items-center justify-center text-sky-500/50 italic text-xs animate-pulse min-h-[220px]">Carregando visualizador…</div>}>
          <Viewport isFullscreen />
        </Suspense>
      </ErrorBoundary>

      <div className='mt-1.5 text-[0.72rem] text-sky-200/50 text-center shrink-0'>
        Clique em uma peça para registrar avaria • Arraste para girar • ESC para sair • Scroll para zoom
      </div>
    </div>,
    document.body
  )
})
