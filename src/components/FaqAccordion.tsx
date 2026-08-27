'use client';
import React, { useMemo, useState } from 'react'
import { CategoryId, CATEGORIES, CATEGORY_LABEL, FAQS, answerText } from './faqData'

const FAQ_INDEX = FAQS.map(f => ({ ...f, search: `${f.q} ${answerText(f.a)}`.toLowerCase() }))

function ChevronIcon() {
  return (
    <svg
      className="flex-none w-5 h-5 text-[var(--primary)] transition-transform duration-300 ease-out group-aria-expanded:rotate-180"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

export default function FaqAccordion() {
  const [query, setQuery] = useState('')
  const [activeCat, setActiveCat] = useState<CategoryId | 'all'>('all')
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase()
    return FAQ_INDEX.map((f, i) => ({ ...f, i })).filter(f => {
      const matchCat = activeCat === 'all' || f.category === activeCat
      const matchTerm = !term || f.search.includes(term)
      return matchCat && matchTerm
    })
  }, [query, activeCat])

  return (
    <div>
      {/* Busca */}
      <div className="relative mb-5">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[var(--text-muted)] pointer-events-none"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Buscar por palavra-chave (ex.: GPS, laudo, reembolso)…"
          aria-label="Buscar nas perguntas frequentes"
          autoComplete="off"
          className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-main)] text-[0.95rem] outline-none transition-[border-color,box-shadow] focus:border-[var(--primary)]/55 focus:shadow-[0_0_0_3px_var(--primary-glow)] placeholder:text-[var(--text-muted)]"
        />
      </div>

      {/* Categorias */}
      <div className="flex flex-wrap gap-2 mb-7" role="group" aria-label="Filtrar por categoria">
        <CategoryPill active={activeCat === 'all'} onClick={() => setActiveCat('all')}>
          Todas
        </CategoryPill>
        {CATEGORIES.map(c => (
          <CategoryPill key={c.id} active={activeCat === c.id} onClick={() => setActiveCat(c.id)}>
            {c.label}
          </CategoryPill>
        ))}
      </div>

      {/* Lista */}
      <div className="flex flex-col gap-2.5">
        {visible.map(f => {
          const isOpen = openIndex === f.i
          return (
            <div
              key={f.i}
              className={`glass-card overflow-hidden transition-colors ${
                isOpen ? 'border-[var(--primary)]/35' : ''
              }`}
            >
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpenIndex(isOpen ? null : f.i)}
                className="group w-full flex items-center justify-between gap-4 text-left px-5 py-[1.15rem] font-semibold text-[var(--text-main)] text-base leading-snug"
              >
                <span>
                  <span className="block text-[0.62rem] font-extrabold tracking-[0.1em] uppercase text-[var(--signal)] mb-1.5">
                    {CATEGORY_LABEL[f.category]}
                  </span>
                  {f.q}
                </span>
                <ChevronIcon />
              </button>
              <div
                className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${
                  isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                }`}
              >
                <div className="overflow-hidden">
                  <div className="px-5 pb-5 text-[var(--text-muted)] text-[0.93rem] [&_strong]:text-[var(--text-main)] [&_strong]:font-semibold [&_p]:mb-2.5 [&_p:last-child]:mb-0">
                    {f.a}
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        {visible.length === 0 && (
          <p className="text-center text-[var(--text-muted)] text-[0.95rem] py-10">
            Nenhuma pergunta encontrada. Tente outra palavra-chave ou categoria.
          </p>
        )}
      </div>
    </div>
  )
}

function CategoryPill({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-[0.8rem] font-bold border transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] ${
        active
          ? 'bg-[var(--primary)]/15 border-[var(--primary)]/60 text-[var(--primary-hover)] shadow-[0_0_14px_var(--primary-glow)]'
          : 'bg-[var(--primary)]/[0.06] border-[var(--input-border)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-[var(--primary)]/40'
      }`}
    >
      {children}
    </button>
  )
}
