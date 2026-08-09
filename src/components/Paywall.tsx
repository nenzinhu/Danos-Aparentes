'use client'
import { useEffect, useRef } from 'react'
import Link from 'next/link'
import type { SubscriptionStatus } from '../hooks/useSubscription'
import { trackPixCtaClick } from '@/src/lib/analytics/events'
import { LEGAL_CONTACT_EMAIL } from './LegalContent'
import { whatsappLink } from '../lib/whatsapp'

interface Props {
  status: SubscriptionStatus
  onSignOut?: () => void
}

const STARTING_FROM = 'R$ 29,90'

export default function Paywall({ status, onSignOut }: Props) {
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    cardRef.current?.focus()
  }, [])

  const title = status === 'past_due'
    ? 'Seu pagamento falhou'
    : 'Seu teste grátis de 7 dias acabou'

  const description = status === 'past_due'
    ? `Não conseguimos confirmar o pagamento da sua assinatura. Regularize pelo PIX ou fale com o suporte (${LEGAL_CONTACT_EMAIL}).`
    : 'Para continuar registrando vistorias e gerando laudos em PDF, assine o plano Starter ou Pro. Escolha o plano, quantos meses quer pagar agora, ou compare todas as opções.'

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="paywall-title"
      aria-describedby="paywall-desc"
      className="min-h-screen flex items-center justify-center p-5 font-outfit"
    >
      <div
        ref={cardRef}
        tabIndex={-1}
        className="w-full max-w-md rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] p-8 text-center shadow-[var(--glass-shadow)] backdrop-blur-xl"
      >
        <div aria-hidden className="text-4xl mb-3">{status === 'past_due' ? '⚠️' : '⏳'}</div>
        <h1 id="paywall-title" className="text-xl font-extrabold text-[var(--text-main)] mb-3">
          {title}
        </h1>
        <p id="paywall-desc" className="text-sm text-[var(--text-muted)] leading-relaxed mb-6">
          {description}
        </p>

        <div className="rounded-2xl border border-[var(--primary)]/25 bg-[var(--bg-main)]/60 px-4 py-4 mb-5 text-left">
          <p className="text-[10px] font-black uppercase tracking-wider text-[var(--primary)]">A partir de</p>
          <p className="text-2xl font-black text-[var(--primary)] mt-1">{STARTING_FROM}<span className="text-sm font-bold text-[var(--text-muted)]">/mês</span></p>
          <p className="text-[11px] text-[var(--text-muted)] mt-1">Starter (20 laudos/mês) ou Pro (80 laudos/mês) · Cartão (Stripe) ou PIX</p>
        </div>

        <div className="flex flex-col gap-2.5">
          <Link
            href="/pagamento-cartao?plan=starter&autostart=1"
            className="block w-full rounded-xl bg-[var(--primary)] text-[var(--bg-main)] font-extrabold text-sm py-3.5 no-underline"
          >
            Assinar com cartão
          </Link>
          <Link
            href="/pagamento-pix?duration=1&plan=starter"
            className="block w-full rounded-xl border border-[var(--card-border)] text-[var(--text-main)] font-bold text-sm py-3 no-underline"
            onClick={() => trackPixCtaClick({ source: 'paywall', duration_months: 1, value: 29.9, currency: 'BRL' })}
          >
            Pagar com PIX
          </Link>
          <Link
            href="/planos"
            className="block w-full rounded-xl border border-[var(--card-border)] text-[var(--text-main)] font-bold text-sm py-3 no-underline"
          >
            Ver planos e opções
          </Link>
          <a
            href={whatsappLink('Olá! Gostaria de saber mais sobre o plano Corporativo (Empresas) do app Danos Aparentes.')}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] underline mt-1"
          >
            Precisa de mais de um vistoriador? Fale sobre o plano Corporativo
          </a>
          <a
            href={`mailto:${LEGAL_CONTACT_EMAIL}?subject=${encodeURIComponent('[Suporte] Assinatura / Plano PRO')}`}
            className="text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] underline"
          >
            Falar com o suporte
          </a>
        </div>

        {onSignOut && (
          <button
            type="button"
            onClick={onSignOut}
            className="bg-transparent border-none text-[var(--text-muted)] text-xs mt-5 cursor-pointer underline font-outfit"
          >
            Sair da conta
          </button>
        )}
      </div>
    </div>
  )
}
