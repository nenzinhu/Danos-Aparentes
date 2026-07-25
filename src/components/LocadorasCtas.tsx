'use client'

import Link from 'next/link'
import LandingCtaLink from './LandingCtaLink'
import { buttonVariants } from './ui/Button'
import { whatsappLink } from '../lib/whatsapp'

const WHATSAPP_CORP_MESSAGE =
  'Olá! Quero falar sobre o plano Corporativo do Danos Aparentes para a minha locadora.'

export function LocadorasHeroCtas() {
  return (
    <div className="flex flex-wrap gap-3 sm:gap-4 justify-center mt-8">
      <LandingCtaLink
        id="locadoras-hero-cta"
        className={buttonVariants({ variant: 'primary', size: 'lg' })}
      >
        Começar 7 dias grátis — sem cartão
      </LandingCtaLink>
      <a href="#demo" className={buttonVariants({ variant: 'secondary', size: 'lg' })}>
        Ver um laudo real com QR
      </a>
    </div>
  )
}

export function LocadorasNavCta() {
  return (
    <a href="#form" className={buttonVariants({ variant: 'primary', size: 'sm' })}>
      Trial 7 dias →
    </a>
  )
}

export function LocadorasPlanosLink() {
  return (
    <Link href="/planos" className={buttonVariants({ variant: 'secondary', size: 'md' })}>
      Ver detalhes dos planos →
    </Link>
  )
}

export function LocadorasOfferCta() {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
      <a href="#form" className={buttonVariants({ variant: 'primary', size: 'lg' })}>
        Quero testar na minha locadora
      </a>
      <a
        href={whatsappLink(WHATSAPP_CORP_MESSAGE)}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonVariants({ variant: 'secondary', size: 'md' })}
      >
        Corporativo no WhatsApp
      </a>
    </div>
  )
}

export function LocadorasFinalCta() {
  return (
    <div className="max-w-md mx-auto mt-4 text-center">
      <LandingCtaLink className={buttonVariants({ variant: 'primary', size: 'lg', className: 'w-full sm:w-auto' })}>
        Quero meu trial de 7 dias
      </LandingCtaLink>
      <p className="text-[11px] text-[var(--text-muted)] mt-3 leading-relaxed">
        Ou preencha o formulário acima — sem cartão no trial.
      </p>
    </div>
  )
}
