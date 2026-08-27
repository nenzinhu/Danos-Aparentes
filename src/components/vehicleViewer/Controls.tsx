'use client'
import React, { useCallback, memo } from 'react'
import { Flip, prefersReducedMotion } from '../../lib/gsap'
import { useVehicleViewer } from './context'

const btnBase = 'bg-slate-900/85 border border-white/10 rounded-lg text-[#e8f4ff] font-outfit font-bold cursor-pointer transition-all hover:bg-slate-800'

function LockIcon({ locked }: { locked: boolean }) {
  return locked ? (
    <svg width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5'>
      <rect x='4' y='11' width='16' height='10' rx='2' />
      <path d='M8 11V7a4 4 0 018 0v4' />
    </svg>
  ) : (
    <svg width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5'>
      <rect x='4' y='11' width='16' height='10' rx='2' />
      <path d='M8 11V7a4 4 0 017.75-1.4' />
    </svg>
  )
}

export const Controls = memo(function Controls({ variant = 'floating' }: { variant?: 'floating' | 'header' }) {
  const { zoomIn, zoomOut, reset, scale, setFullscreen, containerRef, flipStateRef, outlineMode, setOutlineMode, panLocked, setPanLocked, compareMode, setCompareMode } = useVehicleViewer()

  const openFullscreen = useCallback(() => {
    // Snapshot the small viewport's bounds/position now, while it's still the
    // only mounted instance — FullscreenOverlay replays the expand from here.
    if (!prefersReducedMotion() && containerRef.current) {
      flipStateRef.current = Flip.getState(containerRef.current)
    }
    setFullscreen(true)
  }, [containerRef, flipStateRef, setFullscreen])

  const togglePanLock = useCallback(() => {
    if (panLocked) {
      setPanLocked(false)
    } else {
      reset()
      setPanLocked(true)
    }
  }, [panLocked, setPanLocked, reset])

  const zoomControls = (
    <>
      <button type="button" onClick={zoomOut} className={`${btnBase} px-2.5 py-1 text-[0.85rem]`} aria-label="Diminuir zoom" disabled={panLocked}>−</button>
      <button
        type="button"
        onClick={reset}
        title="Voltar a 100% e recentrar"
        className={`${btnBase} px-2.5 py-1 text-[0.75rem]`}
        aria-label={`Zoom ${Math.round(scale * 100)} por cento — clicar para 100%`}
      >
        {Math.round(scale * 100)}%
      </button>
      <button type="button" onClick={zoomIn} className={`${btnBase} px-2.5 py-1 text-[0.85rem]`} aria-label="Aumentar zoom" disabled={panLocked}>+</button>
      <button type="button" onClick={reset} className={`${btnBase} px-2 py-1 text-[0.75rem]`} aria-label="Resetar zoom">↺</button>
      <button
        type="button"
        onClick={togglePanLock}
        title={
          panLocked
            ? 'Destravar zoom e arrastar'
            : 'Travar em 100% — zoom e arrastar bloqueados'
        }
        aria-pressed={panLocked}
        aria-label={panLocked ? 'Destravar diagrama' : 'Travar diagrama'}
        className={`${btnBase} px-2 py-1 flex items-center gap-1 ${panLocked ? 'bg-[var(--signal)]/25 border-[var(--signal)]/50 text-[var(--signal-bright)]' : ''}`}
      >
        <LockIcon locked={panLocked} />
      </button>
    </>
  )

  if (variant === 'header') {
    return (
      <div className='flex items-center gap-1.5 min-w-0'>
        {/* Botão Sair em primeiro lugar e nunca cortado: é a única saída no
            mobile (sem tecla ESC), então precisa de shrink-0 e vir antes do
            grupo de zoom, que pode rolar horizontalmente se faltar largura. */}
        <button
          type="button"
          onClick={() => setFullscreen(false)}
          className={`${btnBase} shrink-0 px-3 py-1.5 text-[0.85rem] bg-red-500/20 border-red-500/40 text-red-500 flex items-center gap-1.5 hover:bg-red-500/30`}
        >
          <svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5'><path d='M8 3v3a2 2 0 01-2 2H3'/><path d='M21 8h-3a2 2 0 01-2-2V3'/><path d='M3 16h3a2 2 0 012 2v3'/><path d='M16 21v-3a2 2 0 012-2h3'/></svg>
          Sair
        </button>
        <div className='flex items-center gap-1.5 overflow-x-auto min-w-0'>
          <button type="button" onClick={zoomOut} className={`${btnBase} px-3 py-1.5 text-[0.85rem] shrink-0`} aria-label="Diminuir zoom" disabled={panLocked}>−</button>
          <button
            type="button"
            onClick={reset}
            title="Voltar a 100% e recentrar"
            className={`${btnBase} px-3 py-1.5 text-[0.75rem] shrink-0`}
            aria-label={`Zoom ${Math.round(scale * 100)} por cento — clicar para 100%`}
          >
            {Math.round(scale * 100)}%
          </button>
          <button type="button" onClick={zoomIn} className={`${btnBase} px-3 py-1.5 text-[0.85rem] shrink-0`} aria-label="Aumentar zoom" disabled={panLocked}>+</button>
          <button type="button" onClick={reset} className={`${btnBase} px-2.5 py-1.5 shrink-0`} aria-label="Resetar zoom">↺</button>
          <button
            type="button"
            onClick={togglePanLock}
            title={
              panLocked
                ? 'Destravar zoom e arrastar'
                : 'Travar em 100% — zoom e arrastar bloqueados'
            }
            aria-pressed={panLocked}
            aria-label={panLocked ? 'Destravar diagrama' : 'Travar diagrama'}
            className={`${btnBase} px-2.5 py-1.5 flex items-center gap-1 shrink-0 ${panLocked ? 'bg-[var(--signal)]/25 border-[var(--signal)]/50 text-[var(--signal-bright)]' : ''}`}
          >
            <LockIcon locked={panLocked} />
          </button>
          <button
            type="button"
            onClick={() => setOutlineMode(!outlineMode)}
            title='Ver só o contorno, sem cores'
            aria-pressed={outlineMode}
            className={`${btnBase} px-3 py-1.5 text-[0.75rem] shrink-0 ${outlineMode ? 'bg-[var(--primary)]/25 border-[var(--primary)]/50 text-[var(--primary)]' : ''}`}
          >
            ◇ Contorno
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className='absolute top-2.5 right-2.5 left-2.5 z-10 flex flex-wrap justify-end gap-1 items-center'>
      {zoomControls}
      <button
        type="button"
        onClick={() => setOutlineMode(!outlineMode)}
        title='Ver só o contorno, sem cores'
        aria-pressed={outlineMode}
        className={`${btnBase} px-2 py-1 text-[0.75rem] ${outlineMode ? 'bg-[var(--primary)]/25 border-[var(--primary)]/50 text-[var(--primary)]' : ''}`}
      >
        ◇ Contorno
      </button>
      <button
        type="button"
        onClick={() => setCompareMode(!compareMode)}
        title='Comparar entrada (recebido) vs saída (devolvido)'
        aria-pressed={compareMode}
        className={`${btnBase} px-2 py-1 text-[0.7rem] flex items-center gap-1 ${compareMode ? 'bg-[var(--success)]/25 border-emerald-400/50 text-[var(--success)]' : ''}`}
      >
        <svg width='15' height='15' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.2' strokeLinecap='round' strokeLinejoin='round'>
          <path d='M7 4 L3 8 L7 12' />
          <path d='M3 8 H14 a4 4 0 0 1 4 4 V20' />
          <path d='M17 20 L21 16 L17 12' />
          <path d='M21 16 H10 a4 4 0 0 1 -4 -4 V4' />
        </svg>
        {compareMode ? 'Comparando' : 'Comparar'}
      </button>
      <button
        type="button"
        onClick={openFullscreen}
        title='Tela cheia'
        className={`${btnBase} px-2 py-1 flex items-center gap-1 bg-[var(--primary)]/10 border-[var(--primary)]/30 text-[var(--primary)] text-[0.72rem] hover:bg-[var(--primary)]/20`}
      >
        <svg width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5'><path d='M8 3H5a2 2 0 00-2 2v3'/><path d='M21 8V5a2 2 0 00-2-2h-3'/><path d='M3 16v3a2 2 0 002 2h3'/><path d='M16 21h3a2 2 0 002-2v-3'/></svg>
        Tela cheia
      </button>
    </div>
  )
})
