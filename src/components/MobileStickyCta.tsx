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
      { threshold: 0.1 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [heroCtaId])

  if (!showSticky) return null

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-[99980] p-3 bg-slate-950/95 border-t border-sky-500/20 backdrop-blur-md pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <LandingCtaLink
        className="block w-full py-3.5 text-center text-white font-black rounded-xl shadow-lg shadow-sky-500/20 text-sm"
        style={{ backgroundImage: 'var(--primary-btn-gradient)' }}
      >
        Criar conta grátis
      </LandingCtaLink>
    </div>
  )
}
