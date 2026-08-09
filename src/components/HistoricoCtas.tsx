'use client'

import Link from 'next/link'
import LandingCtaLink from './LandingCtaLink'
import { buttonVariants } from './ui/Button'
import { B2B_TRIAL_CTA } from '@/src/lib/b2bPositioning'

export function HistoricoHeroCtas() {
  return (
    <div className="flex flex-wrap gap-3 sm:gap-4 justify-center mt-8">
      <LandingCtaLink
        id="historico-hero-cta"
        eventSource="historico"
        className={buttonVariants({ variant: 'primary', size: 'lg' })}
      >
        {B2B_TRIAL_CTA}
      </LandingCtaLink>
      <a href="#como-funciona" className={buttonVariants({ variant: 'secondary', size: 'lg' })}>
        Como funciona
      </a>
    </div>
  )
}

export function HistoricoFinalCta() {
  return (
    <div className="max-w-md mx-auto mt-16 text-center glass-card p-8">
      <h2 className="text-lg font-bold mb-1.5">Comece o histórico da sua frota ou oficina</h2>
      <p className="text-sm text-[var(--text-muted)] mb-5">
        7 dias grátis. Sem cartão. Primeira inspeção em minutos.
      </p>
      <LandingCtaLink
        id="historico-final-cta"
        eventSource="historico"
        className={buttonVariants({ variant: 'primary', size: 'md', className: 'w-full' })}
      >
        {B2B_TRIAL_CTA}
      </LandingCtaLink>
      <p className="mt-4 text-xs text-[var(--text-muted)]">
        Já tem conta?{' '}
        <Link href="/app" className="font-bold text-[var(--primary)] hover:underline">
          Abrir o app
        </Link>
      </p>
    </div>
  )
}
