'use client'

import { useEffect, useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const EVENTS = [
  { tone: 'ok' as const, label: 'Entrega', sub: 'Sem danos', date: '05 AGO 2026' },
  { tone: 'alert' as const, label: 'Devolução', sub: 'Novo risco identificado', date: '15 AGO 2026' },
]

const DOT: Record<(typeof EVENTS)[number]['tone'], string> = {
  ok: 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.45)]',
  alert: 'bg-rose-400 shadow-[0_0_10px_rgba(251,113,133,0.45)]',
}

/**
 * Composição visual própria do produto — mockup SaaS de histórico por placa.
 * Não é stock photo; é UI ilustrativa do posicionamento.
 */
export default function HeroHistoryMockup() {
  const reduceMotion = useReducedMotion()
  const listRef = useRef<HTMLUListElement | null>(null)

  useEffect(() => {
    const list = listRef.current
    if (!list) return
    gsap.registerPlugin(ScrollTrigger)

    const ctx = gsap.context(() => {
      const events = gsap.utils.toArray<HTMLElement>('.gsap-event')
      if (reduceMotion) {
        gsap.set(events, { opacity: 1, x: 0 })
        gsap.set('.gsap-event-dot', { scale: 1, autoAlpha: 1 })
        gsap.set('.gsap-event-line', { scaleY: 1, autoAlpha: 1 })
        return
      }

      const tl = gsap.timeline({ delay: 0.5, defaults: { ease: 'power3.out' } })
      events.forEach((ev, i) => {
        const dot = ev.querySelector<HTMLElement>('.gsap-event-dot')
        const line = ev.querySelector<HTMLElement>('.gsap-event-line')
        const at = i * 0.18
        if (dot) {
          tl.fromTo(
            dot,
            { scale: 0, autoAlpha: 0 },
            { scale: 1, autoAlpha: 1, duration: 0.3, ease: 'back.out(2)' },
            at,
          )
        }
        if (line) {
          tl.fromTo(
            line,
            { scaleY: 0, autoAlpha: 0, transformOrigin: 'top' },
            { scaleY: 1, autoAlpha: 1, duration: 0.25 },
            at + 0.12,
          )
        }
        tl.fromTo(
          ev,
          { opacity: 0, x: 14 },
          { opacity: 1, x: 0, duration: 0.4 },
          at,
        )
      })
    }, list)

    return () => ctx.revert()
  }, [reduceMotion])

  return (
    <motion.div
      className="relative w-full max-w-md mx-auto"
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
      aria-hidden="true"
    >
      <div
        className="absolute -inset-6 rounded-[2rem] opacity-70 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 60% 20%, color-mix(in srgb, var(--signal) 18%, transparent), transparent 55%), radial-gradient(ellipse at 20% 90%, color-mix(in srgb, var(--primary) 16%, transparent), transparent 50%)',
        }}
      />

      <div className="relative rounded-2xl border border-[var(--card-border)] bg-[var(--panel-bg)]/90 backdrop-blur-md shadow-[0_24px_60px_-28px_rgba(0,0,0,0.55)] overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-[var(--card-border)]">
          <div className="min-w-0">
            <p className="font-display text-lg font-bold uppercase tracking-tight text-[var(--text-main)] leading-none">
              Toyota Corolla
            </p>
            <p className="mt-1.5 font-mono-data text-[11px] tracking-[0.22em] text-[var(--signal-bright)]">
              ABC-1234
            </p>
          </div>
          <div className="shrink-0 rounded-lg border border-[var(--card-border)] px-2.5 py-1.5 text-center">
            <p className="font-mono-data text-[9px] uppercase tracking-wider text-[var(--text-muted)]">Placa</p>
            <p className="font-mono-data text-xs font-semibold tracking-widest text-[var(--text-main)]">ABC-1234</p>
          </div>
        </div>

        <div className="px-5 pt-4 pb-2">
          {/* Foto real da inspeção — Toyota Corolla ABC-1234 */}
          <div className="relative rounded-xl overflow-hidden border border-[var(--card-border)] bg-black/40 mb-4">
            <img
              src="/samples/corolla-abc-1234-1.jpg"
              alt="Toyota Corolla ABC-1234 — vista traseira na inspeção"
              className="w-full h-40 object-cover"
              loading="lazy"
            />
            <div className="absolute inset-x-0 bottom-0 px-3 py-1.5 bg-gradient-to-t from-black/70 to-transparent">
              <p className="font-mono-data text-[9px] uppercase tracking-wider text-rose-200/90">
                Traseira · Evidência anexada
              </p>
            </div>
          </div>

          <p className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)] mb-3">
            Memória Digital
          </p>
          <ul ref={listRef} className="space-y-0 m-0 p-0 list-none">
            {EVENTS.map((ev, i) => (
              <li
                key={`${ev.label}-${ev.date}`}
                className="gsap-event flex gap-3"
              >
                <div className="flex flex-col items-center pt-1.5">
                  <span className={`gsap-event-dot w-2.5 h-2.5 rounded-full ${DOT[ev.tone]}`} />
                  {i < EVENTS.length - 1 && (
                    <span className="gsap-event-line w-px flex-1 min-h-[1.75rem] bg-[var(--card-border)] mt-1" />
                  )}
                </div>
                <div className={`pb-4 min-w-0 flex-1 ${i === EVENTS.length - 1 ? 'pb-1' : ''}`}>
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-sm font-semibold text-[var(--text-main)] leading-tight">{ev.label}</p>
                    <p className="font-mono-data text-[10px] text-[var(--text-muted)] whitespace-nowrap">{ev.date}</p>
                  </div>
                  <p className="mt-0.5 text-[11px] text-[var(--text-muted)] leading-snug">{ev.sub}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="mx-5 mb-5 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 space-y-2">
          <p className="text-xs font-bold text-rose-300">1 nova avaria identificada</p>
          <p className="text-[11px] text-[var(--text-muted)]">
            Porta dianteira direita · Amassado · 20 JAN 2026
          </p>
          <ul className="flex flex-wrap gap-1.5 list-none m-0 p-0">
            {['Foto anexada', 'IA analisou', 'Validado pelo vistoriador'].map((tag) => (
              <li
                key={tag}
                className="font-mono-data text-[9px] uppercase tracking-wider px-2 py-0.5 rounded border border-rose-400/25 text-rose-200/90"
              >
                {tag}
              </li>
            ))}
          </ul>
          <div className="mt-2 rounded-lg overflow-hidden border border-[var(--card-border)]">
            <img
              src="/samples/corolla-abc-1234-2.jpg"
              alt="Toyota Corolla ABC-1234 — detalhe da avaria"
              className="w-full h-24 object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
