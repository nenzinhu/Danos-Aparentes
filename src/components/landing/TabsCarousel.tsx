'use client'

import { useRef, useState, useEffect, type ReactNode } from 'react'

export interface CarouselTabItem {
  id: string
  label: string
  content: ReactNode
}

interface Props {
  tabs: CarouselTabItem[]
  id?: string
  ariaLabel?: string
}

/**
 * Tabs (desktop) + Swipeable cards com dots (mobile).
 * Desktop: tablist no topo + setas laterais (desabilitadas nas pontas).
 * Mobile: cards horizontais com scroll-snap + swipe + dots indicadores.
 * Sem libs externas. Reutiliza tokens do design system.
 */
export default function TabsCarousel({ tabs, id, ariaLabel = 'Seções' }: Props) {
  const [active, setActive] = useState(0)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(true)
  const scrollerRef = useRef<HTMLDivElement>(null)

  const current = tabs[active]

  const updateArrows = () => {
    const el = scrollerRef.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth - 2
    setCanPrev(el.scrollLeft > 2)
    setCanNext(el.scrollLeft < max)
    // Mobile: sincroniza aba ativa com o card mais próximo da esquerda
    if (window.innerWidth < 768) {
      const cards = Array.from(el.querySelectorAll<HTMLElement>('[data-card]'))
      const idx = cards.findIndex((c) => c.offsetLeft - el.scrollLeft >= -8)
      if (idx >= 0 && idx !== active) setActive(idx)
    }
  }

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    el.scrollTo({ left: 0, behavior: 'auto' })
    updateArrows()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active])

  const scrollByCard = (dir: 1 | -1) => {
    const el = scrollerRef.current
    if (!el) return
    const card = el.querySelector<HTMLElement>('[data-card]')
    const step = card ? card.offsetWidth + 16 : el.clientWidth * 0.8
    el.scrollBy({ left: dir * step, behavior: 'smooth' })
  }

  return (
    <div id={id} className="w-full">
      {/* TABS (desktop) */}
      <div
        role="tablist"
        aria-label={ariaLabel}
        className="hidden md:flex flex-wrap items-center justify-center gap-2 mb-8"
      >
        {tabs.map((t, i) => {
          const selected = i === active
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={selected}
              aria-controls={`panel-${t.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(i)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowRight') {
                  e.preventDefault()
                  setActive((i + 1) % tabs.length)
                } else if (e.key === 'ArrowLeft') {
                  e.preventDefault()
                  setActive((i - 1 + tabs.length) % tabs.length)
                }
              }}
              className={`px-4 sm:px-5 py-2.5 rounded-xl border text-sm font-bold tracking-tight transition-all duration-200 outline-none focus-visible:ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-[var(--bg-main)] ${
                selected
                  ? 'border-[var(--primary)] bg-[var(--primary)]/15 text-[var(--text-main)] shadow-lg shadow-[var(--primary)]/10'
                  : 'border-[var(--card-border)] bg-[var(--panel-bg)]/40 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-[var(--primary)]/35'
              }`}
            >
              {t.label}
            </button>
          )
        })}
      </div>

      {/* Mobile: label da aba ativa */}
      <div className="md:hidden mb-4 text-center">
        <p className="font-display text-lg font-bold uppercase tracking-tight text-[var(--signal-bright)]">
          {current?.label}
        </p>
      </div>

      {/* Carousel / Swipeable */}
      <div className="relative">
        <button
          type="button"
          aria-label="Anterior"
          onClick={() => scrollByCard(-1)}
          disabled={!canPrev}
          className="hidden md:inline-flex absolute -left-3 top-1/2 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-full border border-[var(--card-border)] bg-[var(--panel-bg)] text-[var(--text-main)] shadow-lg transition-all outline-none focus-visible:ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-[var(--bg-main)] disabled:opacity-30 disabled:cursor-not-allowed hover:enabled:border-[var(--primary)]/40 hover:enabled:bg-[var(--panel-bg)]/80"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
        </button>

        <div
          ref={scrollerRef}
          role="tabpanel"
          id={`panel-${current?.id}`}
          aria-labelledby={`tab-${current?.id}`}
          onScroll={updateArrows}
          tabIndex={0}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory md:snap-none pb-4 pt-1 px-1 [scrollbar-width:none] [-ms-overflow-style:none] outline-none focus-visible:ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-[var(--bg-main)] [&::-webkit-scrollbar]:hidden"
        >
          {tabs.map((t, idx) => (
            <div
              key={t.id}
              data-card
              className={`snap-center md:snap-align-none shrink-0 w-[88%] xs:w-[82%] sm:w-[440px] md:w-full rounded-2xl border border-[var(--card-border)] bg-[var(--panel-bg)]/60 px-6 py-8 sm:px-10 sm:py-10 ${
                idx === active ? 'ring-1 ring-[var(--primary)]/30' : ''
              }`}
            >
              {t.content}
            </div>
          ))}
        </div>

        <button
          type="button"
          aria-label="Próximo"
          onClick={() => scrollByCard(1)}
          disabled={!canNext}
          className="hidden md:inline-flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-full border border-[var(--card-border)] bg-[var(--panel-bg)] text-[var(--text-main)] shadow-lg transition-all outline-none focus-visible:ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-[var(--bg-main)] disabled:opacity-30 disabled:cursor-not-allowed hover:enabled:border-[var(--primary)]/40 hover:enabled:bg-[var(--panel-bg)]/80"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 18l6-6-6-6" /></svg>
        </button>
      </div>

      {/* Indicadores (mobile) */}
      <div className="md:hidden mt-4 flex items-center justify-center gap-1.5" aria-hidden="true">
        {tabs.map((_, i) => (
          <span
            key={i}
            className={`h-2 w-2 rounded-full transition-colors ${
              i === active ? 'bg-[var(--signal-bright)]' : 'bg-[var(--card-border)]'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
