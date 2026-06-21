'use client';
import { useEffect, useState } from 'react'

const GLOW_DURATION_MS = 1400
const HOLD_MS = 300
const FADE_MS = 350

type Phase = 'playing' | 'fading' | 'done'

export default function IntroAnimation() {
  const [phase, setPhase] = useState<Phase>(() =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'done' : 'playing'
  )

  useEffect(() => {
    if (phase !== 'playing') return
    const fadeTimer = setTimeout(() => setPhase('fading'), GLOW_DURATION_MS + HOLD_MS)
    const doneTimer = setTimeout(() => setPhase('done'), GLOW_DURATION_MS + HOLD_MS + FADE_MS)
    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(doneTimer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (phase === 'done') return null

  return (
    <div
      role="presentation"
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        background: '#02060d',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: phase === 'fading' ? 0 : 1,
        transition: `opacity ${FADE_MS}ms ease-out`,
        pointerEvents: 'none',
      }}
    >
      <img
        src="/logo.svg"
        alt=""
        width={220}
        height={220}
        style={{ animation: `intro-glow-reveal ${GLOW_DURATION_MS}ms ease-out both`, objectFit: 'contain' }}
        fetchPriority="high"
      />
    </div>
  )
}
