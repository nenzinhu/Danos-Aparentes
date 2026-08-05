'use client'

import { useRef } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(useGSAP)

const MASCOT_SRC = '/chat/mascote-ajuda.webp'

type Props = {
  open: boolean
  onToggle: () => void
  /** Atenção extra quando há resposta / escalate (pulse mais forte). */
  attention?: boolean
}

/**
 * FAB do chatbot com mascote "AJUDA!" — GSAP: float, brilho, sparkles, entrada e hover.
 */
export default function ChatMascotFab({ open, onToggle, attention = false }: Props) {
  const rootRef = useRef<HTMLButtonElement>(null)
  const floatRef = useRef<HTMLSpanElement>(null)
  const figureRef = useRef<HTMLSpanElement>(null)
  const glowRef = useRef<HTMLSpanElement>(null)
  const ringRef = useRef<HTMLSpanElement>(null)
  const sparkleRefs = useRef<(HTMLSpanElement | null)[]>([])
  const badgeRef = useRef<HTMLSpanElement>(null)
  const closeRef = useRef<HTMLSpanElement>(null)

  useGSAP(
    () => {
      const root = rootRef.current
      const floatEl = floatRef.current
      const figure = figureRef.current
      const glow = glowRef.current
      const ring = ringRef.current
      const badge = badgeRef.current
      const closeEl = closeRef.current
      const sparkles = sparkleRefs.current.filter(Boolean) as HTMLSpanElement[]
      if (!root || !floatEl || !figure) return

      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set([floatEl, figure, glow, ring, badge, closeEl, ...sparkles].filter(Boolean), {
          clearProps: 'all',
        })
        gsap.set([floatEl, figure], { autoAlpha: 1, y: 0, scale: 1, rotation: 0 })
        if (glow) gsap.set(glow, { autoAlpha: 0.35, scale: 1 })
        if (ring) gsap.set(ring, { autoAlpha: 0.4, scale: 1 })
        if (badge) gsap.set(badge, { autoAlpha: open ? 0 : 1 })
        if (closeEl) gsap.set(closeEl, { autoAlpha: open ? 1 : 0 })
        sparkles.forEach((s) => gsap.set(s, { autoAlpha: 0.5 }))
      })

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const ctx = gsap.context(() => {
          gsap.fromTo(
            root,
            { autoAlpha: 0, scale: 0.5, y: 32 },
            {
              autoAlpha: 1,
              scale: 1,
              y: 0,
              duration: 0.8,
              ease: 'elastic.out(1, 0.55)',
              delay: 0.4,
            },
          )

          gsap.to(floatEl, {
            y: -8,
            duration: 1.7,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
          })

          gsap.to(floatEl, {
            rotation: 4,
            duration: 2.4,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
            delay: 0.15,
          })

          if (glow) {
            gsap.to(glow, {
              scale: 1.22,
              autoAlpha: 0.6,
              duration: 1.85,
              ease: 'sine.inOut',
              yoyo: true,
              repeat: -1,
            })
          }

          if (ring) {
            gsap.fromTo(
              ring,
              { scale: 0.9, autoAlpha: 0.6 },
              {
                scale: 1.42,
                autoAlpha: 0,
                duration: 2.2,
                ease: 'power1.out',
                repeat: -1,
              },
            )
          }

          sparkles.forEach((s, i) => {
            gsap.fromTo(
              s,
              { autoAlpha: 0.1, scale: 0.5, rotation: 0 },
              {
                autoAlpha: 1,
                scale: 1.2,
                rotation: 25,
                duration: 0.85 + i * 0.12,
                ease: 'sine.inOut',
                yoyo: true,
                repeat: -1,
                delay: i * 0.28,
              },
            )
          })

          if (badge) {
            gsap.to(badge, {
              y: -4,
              scale: 1.08,
              duration: 0.9,
              ease: 'sine.inOut',
              yoyo: true,
              repeat: -1,
            })
          }
        }, root)

        return () => ctx.revert()
      })

      return () => mm.revert()
    },
    { scope: rootRef },
  )

  useGSAP(
    () => {
      const figure = figureRef.current
      const badge = badgeRef.current
      const closeEl = closeRef.current
      const glow = glowRef.current
      if (!figure) return

      const reduce =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches

      gsap.to(figure, {
        scale: open ? 0.9 : 1,
        duration: reduce ? 0 : 0.32,
        ease: 'power2.out',
      })
      if (badge) {
        gsap.to(badge, {
          autoAlpha: open ? 0 : 1,
          scale: open ? 0.55 : 1,
          duration: reduce ? 0 : 0.26,
          ease: 'power2.out',
        })
      }
      if (closeEl) {
        gsap.to(closeEl, {
          autoAlpha: open ? 1 : 0,
          scale: open ? 1 : 0.45,
          rotation: open ? 0 : -50,
          duration: reduce ? 0 : 0.3,
          ease: open ? 'back.out(1.7)' : 'power2.in',
        })
      }
      if (glow && attention && !open) {
        const pulse = gsap.fromTo(
          glow,
          { autoAlpha: 0.35, scale: 1 },
          {
            autoAlpha: 0.95,
            scale: 1.5,
            duration: 0.4,
            yoyo: true,
            repeat: 5,
            ease: 'power1.inOut',
          },
        )
        return () => {
          pulse.kill()
        }
      }
    },
    { dependencies: [open, attention], scope: rootRef },
  )

  function onPointerEnter() {
    if (open) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const figure = figureRef.current
    if (!figure) return
    gsap.to(figure, { scale: 1.1, duration: 0.25, ease: 'power2.out' })
  }

  function onPointerLeave() {
    if (open) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const figure = figureRef.current
    if (!figure) return
    gsap.to(figure, { scale: 1, duration: 0.3, ease: 'power2.out' })
  }

  function onPointerDown() {
    const figure = figureRef.current
    if (!figure) return
    gsap.to(figure, { scale: 0.9, duration: 0.1, ease: 'power2.in' })
  }

  return (
    <button
      ref={rootRef}
      type="button"
      onClick={onToggle}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onPointerDown={onPointerDown}
      aria-label={open ? 'Fechar chat de suporte' : 'Abrir chat de ajuda'}
      className="relative h-[5rem] w-[5rem] outline-none focus-visible:ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-[var(--bg-main)] rounded-full"
    >
      <span
        ref={glowRef}
        aria-hidden
        className="pointer-events-none absolute inset-[-20%] rounded-full bg-sky-400/40 blur-2xl"
      />
      <span
        ref={ringRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full border-2 border-sky-300/60"
      />

      {[
        'left-0 top-0.5',
        'right-0.5 top-0',
        'left-0.5 bottom-1.5',
        'right-0 bottom-0.5',
      ].map((pos, i) => (
        <span
          key={pos}
          ref={(el) => {
            sparkleRefs.current[i] = el
          }}
          aria-hidden
          className={`pointer-events-none absolute ${pos} text-[11px] text-sky-100 drop-shadow-[0_0_4px_rgba(125,211,252,0.9)]`}
        >
          ✦
        </span>
      ))}

      <span ref={floatRef} className="absolute inset-0 z-[1] block">
        <span
          ref={figureRef}
          className="relative block h-full w-full overflow-hidden rounded-full bg-gradient-to-b from-sky-50 to-sky-200/90 shadow-[0_12px_28px_-6px_rgba(14,165,233,0.55)] ring-2 ring-white/80"
        >
          <Image
            src={MASCOT_SRC}
            alt=""
            width={160}
            height={160}
            className="h-full w-full object-cover object-[50%_38%] select-none pointer-events-none"
            priority={false}
          />
        </span>
      </span>

      <span
        ref={badgeRef}
        aria-hidden
        className="absolute -top-1 -left-1 z-[2] rounded-full bg-sky-950 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-white border border-sky-300/40 shadow-md"
      >
        Ajuda
      </span>

      <span
        ref={closeRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[3] flex items-center justify-center rounded-full bg-slate-950/50 backdrop-blur-[2px] text-3xl font-black text-white opacity-0"
      >
        ×
      </span>
    </button>
  )
}

/** Avatar compacto no header / bolhas do painel. */
export function ChatMascotAvatar({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)

  useGSAP(
    () => {
      const el = ref.current
      if (!el) return
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.to(el, {
          y: -2.5,
          duration: 1.35,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
        })
      })
      return () => mm.revert()
    },
    { scope: ref },
  )

  return (
    <span
      ref={ref}
      className={`relative inline-flex h-10 w-10 shrink-0 overflow-hidden rounded-full bg-sky-100 ring-2 ring-sky-300/40 shadow-md ${className}`}
    >
      <Image
        src={MASCOT_SRC}
        alt=""
        width={80}
        height={80}
        className="h-full w-full object-cover object-[50%_36%]"
      />
    </span>
  )
}
