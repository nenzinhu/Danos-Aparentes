import { useState } from 'react'
import type { SubscriptionStatus } from '../hooks/useSubscription'

interface Props {
  status: SubscriptionStatus
  onSubscribe: () => Promise<void>
  onSignOut?: () => void
}

const PRICE_LABEL = 'R$ 49,90/mês'

export default function Paywall({ status, onSubscribe, onSignOut }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const title = status === 'past_due'
    ? 'Seu pagamento falhou'
    : 'Seu teste grátis de 7 dias acabou'

  const description = status === 'past_due'
    ? 'Não conseguimos confirmar o pagamento da sua assinatura. Atualize seu cartão para continuar usando o Vistoria+.'
    : 'Assine o Vistoria+ para continuar registrando vistorias, gerando laudos em PDF e usando a sincronização em nuvem.'

  async function handleClick() {
    setLoading(true)
    setError(null)
    try {
      await onSubscribe()
    } catch {
      setError('Não foi possível iniciar o pagamento. Tente novamente em alguns instantes.')
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{
        background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 24,
        padding: '40px 32px', maxWidth: 440, width: '100%', textAlign: 'center',
        backdropFilter: 'blur(18px)', boxShadow: 'var(--glass-shadow)',
      }}>
        <div style={{ fontSize: '2.4rem', marginBottom: 12 }}>{status === 'past_due' ? '⚠️' : '⏳'}</div>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 12 }}>{title}</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: 26 }}>{description}</p>

        <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#00aaff', marginBottom: 4 }}>{PRICE_LABEL}</div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: 26 }}>Cancele quando quiser</div>

        {error && (
          <div style={{ color: '#ef4444', fontSize: '0.82rem', marginBottom: 14 }}>{error}</div>
        )}

        <button onClick={handleClick} disabled={loading} style={{
          background: '#00aaff', color: '#02101e', fontWeight: 800, fontSize: '0.95rem',
          padding: '14px 28px', borderRadius: 10, border: 'none', cursor: loading ? 'default' : 'pointer',
          fontFamily: 'Outfit,sans-serif', width: '100%', opacity: loading ? 0.7 : 1,
        }}>
          {loading ? 'Abrindo pagamento...' : 'Assinar agora'}
        </button>

        {onSignOut && (
          <button onClick={onSignOut} style={{
            background: 'transparent', border: 'none', color: 'var(--text-muted)',
            fontSize: '0.8rem', marginTop: 18, cursor: 'pointer', textDecoration: 'underline',
            fontFamily: 'Outfit,sans-serif',
          }}>Sair da conta</button>
        )}
      </div>
    </div>
  )
}
