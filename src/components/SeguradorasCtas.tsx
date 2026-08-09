'use client'

import Link from 'next/link'
import LandingCtaLink from './LandingCtaLink'
import { buttonVariants } from './ui/Button'
import { whatsappLink } from '../lib/whatsapp'
import { B2B_TRIAL_CTA } from '../lib/b2bPositioning'

const WHATSAPP_MESSAGE =
  'Olá! Gostaria de saber mais sobre a Plataforma de Inteligência Histórica Veicular do Danos Aparentes para seguradora/corretora.'

function WhatsappButton({ className, label = 'Falar no WhatsApp' }: { className: string; label?: string }) {
  return (
    <a
      href={whatsappLink(WHATSAPP_MESSAGE)}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {label}
    </a>
  )
}

export function SeguradorasHeroCtas() {
  return (
    <div className="flex flex-wrap gap-4 justify-center mt-7">
      <LandingCtaLink id="seguradoras-hero-cta" eventSource="seguradoras" className={buttonVariants({ variant: 'primary', size: 'md' })}>
        {B2B_TRIAL_CTA}
      </LandingCtaLink>
      <WhatsappButton className={buttonVariants({ variant: 'secondary', size: 'md' })} />
    </div>
  )
}

export function SeguradorasPlanosLink() {
  return (
    <Link href="/planos" className={buttonVariants({ variant: 'secondary', size: 'md' })}>
      Ver planos e preços →
    </Link>
  )
}

export function SeguradorasFinalCta() {
  return (
    <div className="max-w-md mx-auto mt-16 text-center glass-card p-8">
      <h2 className="text-lg font-bold mb-1.5">Pronto para evidência verificável no sinistro?</h2>
      <p className="text-sm text-[var(--text-muted)] mb-5">
        Teste 7 dias grátis no app — ou fale no WhatsApp para Corporativo.
      </p>
      <div className="flex flex-col gap-3">
        <LandingCtaLink
          id="seguradoras-final-cta"
          eventSource="seguradoras"
          className={buttonVariants({ variant: 'primary', size: 'md', className: 'w-full' })}
        >
          {B2B_TRIAL_CTA}
        </LandingCtaLink>
        <WhatsappButton
          className={buttonVariants({ variant: 'secondary', size: 'md', className: 'w-full' })}
          label="Falar com o time comercial"
        />
      </div>
    </div>
  )
}
