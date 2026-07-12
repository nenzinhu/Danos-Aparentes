'use client';
import Link from 'next/link';
import LandingCtaLink from './LandingCtaLink';
import { buttonVariants } from './ui/Button';
import { whatsappLink } from '../lib/whatsapp';

const WHATSAPP_MESSAGE = 'Olá! Gostaria de saber mais sobre o sistema de vistoria para locadora/frota do Danos Aparentes.'

function WhatsappButton({ className }: { className: string }) {
  return (
    <a
      href={whatsappLink(WHATSAPP_MESSAGE)}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      Falar com o time comercial
    </a>
  );
}

export function LocadorasHeroCtas() {
  return (
    <div className="flex flex-wrap gap-4 justify-center mt-7">
      <WhatsappButton className={buttonVariants({ variant: 'primary', size: 'md' })} />
      <LandingCtaLink className={buttonVariants({ variant: 'secondary', size: 'md' })}>
        Testar o plano Pro grátis
      </LandingCtaLink>
    </div>
  );
}

export function LocadorasPlanosLink() {
  return (
    <Link href="/planos" className={buttonVariants({ variant: 'secondary', size: 'md' })}>
      Ver planos e preços →
    </Link>
  );
}

export function LocadorasFinalCta() {
  return (
    <div className="max-w-md mx-auto mt-16 text-center glass-card p-8">
      <h2 className="text-lg font-bold mb-1.5">Pronto para padronizar a vistoria da sua frota?</h2>
      <p className="text-sm text-[var(--text-muted)] mb-5">
        Resposta em minutos pelo WhatsApp, sem compromisso.
      </p>
      <WhatsappButton className={buttonVariants({ variant: 'primary', size: 'md', className: 'w-full' })} />
    </div>
  );
}
