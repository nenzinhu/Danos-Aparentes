'use client';
import { useEffect, useState } from 'react'
import LandingCtaLink from './LandingCtaLink'

interface Props {
  heroCtaId?: string
}

export default function MobileStickyCta({ heroCtaId = 'hero-primary-cta' }: Props) {
  const [showSticky, setShowSticky] = useState(false)

  useEffect(() => {
    const el = document.getElementById(heroCtaId)
    if (!el) {
      setShowSticky(true)
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => setShowSticky(!entry.isIntersecting),
      { threshold: 0.08, rootMargin: '-48px 0px 0px 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [heroCtaId])

  if (!showSticky) return null

  return (
    <div className="lg:hidden fixed bottom-0 inset-x-0 z-[99980] px-3 pt-2.5 bg-[var(--bg-main)]/95 border-t border-[var(--card-border)]/60 shadow-[0_-8px_30px_rgba(0,0,0,0.35)] pb-[max(0.65rem,env(safe-area-inset-bottom))]">
      <div className="max-w-lg mx-auto flex items-stretch gap-2">
        <LandingCtaLink
          className="flex-1 py-3.5 text-center text-[var(--bg-main)] font-black rounded-xl shadow-lg shadow-[var(--primary)]/25 text-sm touch-manipulation"
          style={{ backgroundImage: 'var(--primary-btn-gradient)' }}
        >
          Testar 7 dias · sem cartão
        </LandingCtaLink>
      </div>
      <p className="text-center font-mono-data text-[9px] uppercase tracking-wider text-[var(--text-muted)] mt-1.5">
        Depois R$ 49,90/mês · cancele online
      </p>
    </div>
  )
}
