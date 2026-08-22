'use client'

import { useRef, useState, useEffect, type ReactNode } from 'react'

export interface CarouselItem {
  icon?: ReactNode
  title: string
  desc: string
}

export interface CarouselTab {
  id: string
  label: string
  blurb?: string
  items: CarouselItem[]
}

interface Props {
  tabs: CarouselTab[]
  /** Texto do CTA opcional exibido após os cards (desktop+mobile). */
  cta?: ReactNode
  /** id para ancorar (ex.: para rolar até o card). */
  id?: string
}

/**
 * Tabbed Desktop Carousel + Swipeable Cards (mobile).
 *
 * Desktop (md+): tabs no topo (role=tablist) + carousel horizontal com setas.
 * Mobile (<md): cards horizontais com scroll-snap e swipe por toque, sem tabs.
 *
 * Sem libs externas. Reutiliza tokens do design system.
 */
export default function TabbedCarousel({ tabs, cta, id }: Props) {
  const [active, setActive] = useState(0)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(true)
  const scrollerRef = useRef<HTMLDivElement>(null)

  const current = tabs[active]
  const items = current?.items ?? []

  const updateArrows = () => {
    const el = scrollerRef.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth - 2
    setCanPrev(el.scrollLeft > 2)
    setCanNext(el.scrollLeft < max)
  }

  // Sincroniza o scroll do scroller ao trocar de tab (desktop e mobile).
  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    el.scrollTo({ left: 0, behavior: 'auto' })
    updateArrows()
  }, [active])

  const scrollByCard = (dir: 1 | -1) => {
    const el = scrollerRef.current
    if (!el) return
    const card = el.querySelector<HTMLElement>('[data-card]')
    const step = card ? card.offsetWidth + 16 : el.clientWidth * 0.8
    el.scrollBy({ left: dir * step, behavior: 'smooth' })
  }

  const onKeyNav = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      scrollByCard(1)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      scrollByCard(-1)
    }
  }

  return (
    <div id={id} className="w-full">
      {/* TABS (apenas desktop) */}
      <div
        role="tablist"
        aria-label="Categorias da plataforma"
        className="hidden md:flex flex-wrap items-center justify-center gap-2 mb-8"
      >
        {tabs.map((t, i) => {
          const selected = i === active
          return (
            <button
              key={t.id}
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

      {/* Mobile: label da aba ativa (já que escondemos as tabs) */}
      <div className="md:hidden mb-4 text-center">
        <p className="font-display text-lg font-bold uppercase tracking-tight text-[var(--signal-bright)]">
          {current?.label}
        </p>
        {current?.blurb && (
          <p className="mt-1 text-xs text-[var(--text-muted)] leading-snug px-2">{current.blurb}</p>
        )}
      </div>

      {/* CAROUSEL / SWIPEABLE */}
      <div className="relative">
        {/* Setas (desktop) */}
        <button
          type="button"
          aria-label="Anterior"
          onClick={() => scrollByCard(-1)}
          disabled={!canPrev}
          className={`hidden md:inline-flex absolute -left-3 top-1/2 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-full border border-[var(--card-border)] bg-[var(--panel-bg)] text-[var(--text-main)] shadow-lg transition-all outline-none focus-visible:ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-[var(--bg-main)] disabled:opacity-30 disabled:cursor-not-allowed hover:enabled:border-[var(--primary)]/40 hover:enabled:bg-[var(--panel-bg)]/80`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
        </button>

        <div
          ref={scrollerRef}
          role="tabpanel"
          id={`panel-${current?.id}`}
          aria-labelledby={`tab-${current?.id}`}
          onScroll={updateArrows}
          onKeyDown={onKeyNav}
          tabIndex={0}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory md:snap-none pb-4 pt-1 px-1 [scrollbar-width:none] [-ms-overflow-style:none] outline-none focus-visible:ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-[var(--bg-main)] [&::-webkit-scrollbar]:hidden"
        >
          {items.map((it, idx) => (
            <article
              key={`${current?.id}-${idx}`}
              data-card
              className="snap-center md:snap-align-none shrink-0 w-[85%] xs:w-[80%] sm:w-[360px] md:w-[320px] rounded-2xl border border-[var(--card-border)] bg-[var(--panel-bg)]/50 p-5 transition-all duration-200 hover:border-[var(--primary)]/35 hover:bg-[var(--panel-bg)]/80"
            >
              {it.icon && (
                <span className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--card-border)] bg-[var(--btn-secondary-bg)] text-[var(--signal-bright)]">
                  {it.icon}
                </span>
              )}
              <h3 className="text-sm font-bold text-[var(--text-main)] leading-snug">{it.title}</h3>
              <p className="mt-1.5 text-xs sm:text-[13px] text-[var(--text-muted)] leading-relaxed">{it.desc}</p>
            </article>
          ))}
        </div>

        <button
          type="button"
          aria-label="Próximo"
          onClick={() => scrollByCard(1)}
          disabled={!canNext}
          className={`hidden md:inline-flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-full border border-[var(--card-border)] bg-[var(--panel-bg)] text-[var(--text-main)] shadow-lg transition-all outline-none focus-visible:ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-[var(--bg-main)] disabled:opacity-30 disabled:cursor-not-allowed hover:enabled:border-[var(--primary)]/40 hover:enabled:bg-[var(--panel-bg)]/80`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
        </button>
      </div>

      {/* Indicadores (mobile) */}
      <div className="md:hidden mt-4 flex items-center justify-center gap-1.5" aria-hidden="true">
        {items.map((_, i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-[var(--card-border)]"
            style={{ opacity: 0.4 + (i === 0 ? 0.6 : 0) }}
          />
        ))}
      </div>

      {/* Blurb da tab ativa (desktop) */}
      {current?.blurb && (
        <p className="hidden md:block mt-5 text-center text-xs text-[var(--text-muted)] max-w-xl mx-auto">
          {current.blurb}
        </p>
      )}

      {cta && <div className="mt-8 flex justify-center">{cta}</div>}
    </div>
  )
}
