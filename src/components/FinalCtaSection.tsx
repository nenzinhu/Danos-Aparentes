'use client'

import Link from 'next/link'
import LandingCtaLink from './LandingCtaLink'
import Reveal from './Reveal'
import { B2B_FINAL_HEADLINE, B2B_FINAL_SUB, B2B_TRIAL_CTA } from '@/src/lib/b2bPositioning'

export default function FinalCtaSection() {
  return (
    <section
      id="comecar"
      className="w-full py-20 px-6 z-10 relative border-t border-[var(--card-border)]/40 overflow-hidden"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(circle at 50% 30%, rgba(0,170,255,0.12) 0%, transparent 65%)' }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(var(--grid-color)_1px,transparent_1px),linear-gradient(90deg,var(--grid-color)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none opacity-60"
      />

      <Reveal className="max-w-3xl mx-auto text-center relative">
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-tight leading-[0.95] text-[var(--text-main)] [text-wrap:balance]">
          {B2B_FINAL_HEADLINE}
        </h2>
        <p className="text-sm sm:text-base text-[var(--text-muted)] mt-5 max-w-xl mx-auto leading-relaxed">
          {B2B_FINAL_SUB}
        </p>

        <div className="flex flex-col items-center justify-center gap-3 mt-9">
          <Link
            id="home-final-cta"
            href="/planos"
            className="group/cta px-10 py-5 text-white font-black text-base sm:text-lg rounded-xl shadow-2xl shadow-[var(--primary)]/25 inline-flex items-center gap-2.5 focus-visible:ring-2 ring-[var(--primary)] ring-offset-4 ring-offset-[var(--bg-main)] outline-none"
            style={{ backgroundImage: 'var(--primary-btn-gradient)' }}
          >
            <span>{B2B_TRIAL_CTA}</span>
            <svg
              aria-hidden="true"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white transition-transform duration-150 group-hover/cta:translate-x-1"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
          <Link
            href="/demo"
            className="px-8 py-4 min-h-11 rounded-xl border border-[var(--card-border)] text-sm font-bold text-[var(--text-main)] hover:bg-[var(--btn-secondary-bg)] transition-colors focus-visible:ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-[var(--bg-main)] outline-none inline-flex items-center"
          >
            Solicitar Demonstração
          </Link>
        </div>
      </Reveal>
    </section>
  )
}
