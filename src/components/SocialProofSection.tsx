'use client'

import Reveal from './Reveal'
import {
  quotesForVertical,
  type SocialProofVertical,
} from '@/src/lib/socialProof'

type Props = {
  /** Filtra depoimentos; home mostra todos. */
  vertical?: SocialProofVertical | 'home'
  /** Título da seção (override). */
  title?: string
  subtitle?: string
  className?: string
}

export default function SocialProofSection({
  vertical = 'home',
  title = 'Quem usa, prova o estado do veículo.',
  subtitle = 'Relatos de quem registrou vistoria, histórico e evidência no dia a dia da operação.',
  className = '',
}: Props) {
  const quotes = quotesForVertical(vertical)

  return (
    <section
      id="prova-social"
      aria-labelledby="prova-social-heading"
      className={`w-full z-10 relative border-t border-[var(--card-border)]/40 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--signal)_6%,transparent)_0%,transparent_40%)] ${className}`}
    >
      <div className="max-w-6xl mx-auto py-16 sm:py-20 px-6">
        <Reveal className="text-center mb-10 flex flex-col items-center">
          <p className="font-mono-data text-[12px] tracking-[0.28em] text-[var(--signal-bright)] uppercase mb-3">
            Prova social
          </p>
          <h2
            id="prova-social-heading"
            className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-tight leading-[0.95] text-[var(--text-main)] [text-wrap:balance] max-w-3xl"
          >
            {title}
          </h2>
          <p className="mt-4 text-sm text-[var(--text-muted)] max-w-xl leading-relaxed">
            {subtitle}
          </p>
        </Reveal>

        <ul className="grid grid-cols-1 lg:grid-cols-3 gap-5 list-none m-0 p-0">
          {quotes.map((q, i) => (
            <Reveal key={q.id} as="li" delay={i * 80} className="h-full">
              <blockquote className="h-full flex flex-col border border-[var(--card-border)]/80 bg-[var(--panel-bg)]/80 px-5 py-6 sm:px-6 sm:py-7 border-l-[3px] border-l-[var(--signal-bright)]">
                <p className="font-display text-lg sm:text-xl font-bold tracking-tight text-[var(--text-main)] leading-snug [text-wrap:balance]">
                  “{q.headline}”
                </p>
                <p className="mt-4 text-sm text-[var(--text-muted)] leading-relaxed flex-1">
                  {q.body}
                </p>
                <footer className="mt-6 pt-4 border-t border-[var(--card-border)]/60">
                  <cite className="not-italic block font-semibold text-[var(--text-main)] text-sm">
                    {q.name}
                  </cite>
                  <p className="mt-0.5 text-xs text-[var(--text-muted)] leading-snug">{q.role}</p>
                </footer>
              </blockquote>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
