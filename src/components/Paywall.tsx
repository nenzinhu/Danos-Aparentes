'use client';
import { useEffect, useRef } from 'react'
import Link from 'next/link'
import type { SubscriptionStatus } from '../hooks/useSubscription'
import { LEGAL_CONTACT_EMAIL } from './LegalContent'

interface Props {
  status: SubscriptionStatus
  onSignOut?: () => void
}

const PRICE_LABEL = 'R$ 49,90/mês'

export default function Paywall({ status, onSignOut }: Props) {
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    cardRef.current?.focus()
  }, [])

  const title = status === 'past_due'
    ? 'Seu pagamento falhou'
    : 'Seu teste grátis de 7 dias acabou'

  const description = status === 'past_due'
    ? `Não conseguimos confirmar o pagamento da sua assinatura. Entre em contato pelo suporte (${LEGAL_CONTACT_EMAIL}) para regularizar o acesso ao Danos Aparentes.`
    : `Para continuar registrando vistorias, gerando laudos em PDF e usando a sincronização em nuvem, é necessário o plano PRO. Fale conosco em ${LEGAL_CONTACT_EMAIL}.`

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="paywall-title"
      aria-describedby="paywall-desc"
      style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
    >
      <div ref={cardRef} tabIndex={-1} style={{
        background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 24,
        padding: '40px 32px', maxWidth: 440, width: '100%', textAlign: 'center',
        backdropFilter: 'blur(18px)', boxShadow: 'var(--glass-shadow)',
      }}>
        <div aria-hidden="true" style={{ fontSize: '2.4rem', marginBottom: 12 }}>{status === 'past_due' ? '⚠️' : '⏳'}</div>
        <h1 id="paywall-title" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 12 }}>{title}</h1>
        <p id="paywall-desc" style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: 26 }}>{description}</p>

        <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#00aaff', marginBottom: 4 }}>{PRICE_LABEL}</div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: 26 }}>Cancele quando quiser</div>

        <Link
          href={`mailto:${LEGAL_CONTACT_EMAIL}?subject=${encodeURIComponent('[Suporte] Assinatura / Plano PRO')}`}
          style={{
            display: 'block',
            background: '#00aaff', color: '#02101e', fontWeight: 800, fontSize: '0.95rem',
            padding: '14px 28px', borderRadius: 10, textDecoration: 'none',
            fontFamily: 'Outfit,sans-serif', width: '100%', boxSizing: 'border-box',
          }}
        >
          Falar com o suporte
        </Link>

        {onSignOut && (
          <button type="button" onClick={onSignOut} style={{
            background: 'transparent', border: 'none', color: 'var(--text-muted)',
            fontSize: '0.8rem', marginTop: 18, cursor: 'pointer', textDecoration: 'underline',
            fontFamily: 'Outfit,sans-serif',
          }}>Sair da conta</button>
        )}
      </div>
    </div>
  )
}
