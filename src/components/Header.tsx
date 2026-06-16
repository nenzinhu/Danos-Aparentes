import type { SubscriptionStatus } from '../hooks/useSubscription'

interface Props {
  darkMode: boolean
  onToggleDark: () => void
  onOpenSaved: () => void
  onSignOut?: () => void
  syncStatus?: 'synced' | 'pending' | 'offline'
  subscription?: { status: SubscriptionStatus; trialDaysLeft: number }
  onManageSubscription?: () => void
}

const SYNC_LABEL: Record<'synced' | 'pending' | 'offline', { icon: string; text: string; color: string }> = {
  synced: { icon: '☁️', text: 'Sincronizado', color: '#22c55e' },
  pending: { icon: '🔄', text: 'Pendente sincronização', color: '#eab308' },
  offline: { icon: '📡', text: 'Offline', color: '#ef4444' },
}

export default function Header({ darkMode, onToggleDark, onOpenSaved, onSignOut, syncStatus, subscription, onManageSubscription }: Props) {
  return (
    <header style={{ textAlign: 'center', width: '100%', maxWidth: 1250, padding: '40px 20px 28px', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 600, height: 300, background: 'radial-gradient(ellipse at center top, rgba(0,170,255,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(0,170,255,0.08)', border: '1px solid rgba(0,170,255,0.22)', borderRadius: 100, padding: '5px 16px', fontSize: '0.72rem', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--neon-cyan)', marginBottom: 20 }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--neon-cyan)', boxShadow: '0 0 8px var(--neon-cyan)', animation: 'pulse 2s ease-in-out infinite' }} />
        Sistema de Vistoria PRO
      </div>

      <h1 style={{ fontSize: 'clamp(2rem,5vw,3.5rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: -1.5, background: 'linear-gradient(135deg,#fff 0%,#a8d8ff 40%,#00aaff 70%,#00d4ff 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: 12 }}>
        Avarias Aparentes
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: 500, margin: '0 auto 20px' }}>
        Inspeção veicular interativa — registre danos com precisão
      </p>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
        {[
          { label: '🛡️ Offline', desc: 'PWA' },
          { label: '💾 IndexedDB', desc: 'Local' },
          { label: '📄 PDF', desc: 'Profissional' },
          { label: '🗣️ TTS', desc: 'Gratuito' },
        ].map(b => (
          <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '6px 14px', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            {b.label} <span style={{ opacity: 0.6 }}>{b.desc}</span>
          </div>
        ))}
        {syncStatus && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.04)', border: `1px solid ${SYNC_LABEL[syncStatus].color}33`, borderRadius: 8, padding: '6px 14px', fontSize: '0.78rem', fontWeight: 600, color: SYNC_LABEL[syncStatus].color }}>
            {SYNC_LABEL[syncStatus].icon} {SYNC_LABEL[syncStatus].text}
          </div>
        )}
        {subscription?.status === 'trialing' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.3)', borderRadius: 8, padding: '6px 14px', fontSize: '0.78rem', fontWeight: 600, color: '#eab308' }}>
            🎁 Teste grátis: {subscription.trialDaysLeft} dia{subscription.trialDaysLeft !== 1 ? 's' : ''} restante{subscription.trialDaysLeft !== 1 ? 's' : ''}
          </div>
        )}
        {subscription?.status === 'active' && (
          <button type="button" onClick={onManageSubscription} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 8, padding: '6px 14px', fontSize: '0.78rem', fontWeight: 700, color: '#22c55e', cursor: 'pointer', fontFamily: 'Outfit,sans-serif' }}>
            ✓ Assinatura ativa — Gerenciar
          </button>
        )}
      </div>

      <div style={{ position: 'absolute', top: 20, right: 20, display: 'flex', gap: 8 }}>
        <button onClick={onOpenSaved} style={{ background: 'var(--btn-secondary-bg)', border: '1px solid var(--btn-secondary-border)', borderRadius: 10, padding: '8px 14px', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'Outfit,sans-serif', fontSize: '0.82rem', fontWeight: 700 }}>📦 Salvas</button>
        <button onClick={onToggleDark} style={{ background: 'var(--btn-secondary-bg)', border: '1px solid var(--btn-secondary-border)', borderRadius: 10, padding: '8px 12px', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem' }}>{darkMode ? '☀️' : '🌙'}</button>
        {onSignOut && (
          <button onClick={onSignOut} style={{ background: 'var(--btn-secondary-bg)', border: '1px solid var(--btn-secondary-border)', borderRadius: 10, padding: '8px 12px', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'Outfit,sans-serif', fontSize: '0.82rem', fontWeight: 700 }} title="Sair">🚪</button>
        )}
      </div>
    </header>
  )
}
