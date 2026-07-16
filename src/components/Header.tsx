'use client';
import React, { memo, useState, useEffect, useRef } from 'react'
import type { SubscriptionStatus } from '../hooks/useSubscription'
import Logo from '@/src/components/Logo'

interface Props {
  darkMode: boolean
  onToggleDark: () => void
  onOpenSaved: () => void
  onOpenSettings?: () => void
  onSignOut?: () => void
  syncStatus?: 'synced' | 'pending' | 'offline' | 'error'
  onRetrySync?: () => void
  subscription?: { status: SubscriptionStatus; trialDaysLeft: number }
  onManageSubscription?: () => void
}

const SYNC_LABEL: Record<'synced' | 'pending' | 'offline' | 'error', { icon: string; text: string; color: string; bgColor: string; borderColor: string }> = {
  synced:  { icon: '✔️', text: 'Sincronizado',            color: 'text-green-500',  bgColor: 'bg-green-500/10',  borderColor: 'border-green-500/30'  },
  pending: { icon: '🔄', text: 'Pendente sincronização',  color: 'text-yellow-500', bgColor: 'bg-yellow-500/10', borderColor: 'border-yellow-500/30' },
  offline: { icon: '📡', text: 'Offline',                 color: 'text-red-500',    bgColor: 'bg-red-500/10',    borderColor: 'border-red-500/30'    },
  error:   { icon: '⚠️', text: 'Erro de sincronização',  color: 'text-orange-500', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/30' },
}

// ─── Benefícios PRO ──────────────────────────────────────────────────────────
const PRO_BENEFITS = [
  { icon: '📄', title: 'PDF Profissional', desc: 'Laudo com hash SHA-256 e QR Code de autenticidade' },
  { icon: '✍️', title: 'Assinatura Digital', desc: 'Vistoriador e cliente assinam na tela do celular' },
  { icon: '📡', title: '100% Offline', desc: 'Funciona sem internet, sincroniza quando conectar' },
  { icon: '🏢', title: 'Marca Própria', desc: 'Logo e nome da empresa em todos os relatórios' },
  { icon: '🔍', title: 'Consulta de Placas', desc: 'Preenchimento automático dos dados do veículo' },
  { icon: '💬', title: 'Envio por WhatsApp', desc: 'Compartilhe o laudo em 1 clique diretamente pelo app' },
  { icon: '📊', title: 'Painel de Estatísticas', desc: 'Dashboard com histórico e análise das vistorias' },
  { icon: '🗣️', title: 'Voz Antoni PT-BR', desc: 'Narração das peças via ElevenLabs em português' },
]

function ProBenefitsButton({
  subscription,
  onManageSubscription,
}: {
  subscription?: { status: SubscriptionStatus; trialDaysLeft: number }
  onManageSubscription?: () => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Fecha ao clicar fora
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const isActive  = subscription?.status === 'active'
  const isTrial   = subscription?.status === 'trialing'

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      {/* ── Trigger button ── */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 20px',
          borderRadius: 999,
          background: isActive
            ? 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(16,185,129,0.08))'
            : 'linear-gradient(135deg, rgba(0,170,255,0.12), rgba(99,102,241,0.08))',
          border: isActive
            ? '1px solid rgba(34,197,94,0.4)'
            : '1px solid rgba(0,170,255,0.35)',
          cursor: 'pointer',
          fontFamily: 'Outfit, sans-serif',
          fontSize: '0.82rem',
          fontWeight: 800,
          color: isActive ? '#4ade80' : '#38bdf8',
          letterSpacing: '0.02em',
          boxShadow: isActive
            ? '0 0 18px rgba(34,197,94,0.15)'
            : '0 0 18px rgba(0,170,255,0.12)',
          transition: 'all 0.2s',
        }}
      >
        {isActive ? (
          <><span>✓</span> Plano PRO Ativo</>
        ) : isTrial ? (
          <><span>🎁</span> Teste PRO — {subscription!.trialDaysLeft} dia{subscription!.trialDaysLeft !== 1 ? 's' : ''} restante{subscription!.trialDaysLeft !== 1 ? 's' : ''}</>
        ) : (
          <><span style={{ fontSize: '0.9rem' }}>✦</span> Ver benefícios PRO</>
        )}
        {/* Chevron */}
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* ── Dropdown panel ── */}
      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 10px)',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 360,
          background: 'rgba(8,15,35,0.97)',
          border: '1px solid rgba(0,170,255,0.22)',
          borderRadius: 16,
          boxShadow: '0 24px 48px rgba(0,0,0,0.5), 0 0 60px rgba(0,170,255,0.08)',
          overflow: 'hidden',
          zIndex: 9999,
          backdropFilter: 'blur(20px)',
          animation: 'dropdownFadeIn 0.18s ease',
        }}>
          <style>{`
            @keyframes dropdownFadeIn {
              from { opacity:0; transform: translateX(-50%) translateY(-6px); }
              to   { opacity:1; transform: translateX(-50%) translateY(0); }
            }
          `}</style>

          {/* Header do dropdown */}
          <div style={{
            padding: '14px 18px 12px',
            borderBottom: '1px solid rgba(0,170,255,0.12)',
            background: 'linear-gradient(135deg, rgba(0,170,255,0.07), rgba(99,102,241,0.04))',
          }}>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#e8f4ff', letterSpacing: '-0.01em' }}>
              ✦ Plano PRO — Vistoria Profissional
            </div>
            <div style={{ fontSize: '0.73rem', color: '#64748b', marginTop: 2 }}>
              Tudo que você precisa para vistorias perfeitas
            </div>
          </div>

          {/* Grid de benefícios */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 1,
            background: 'rgba(255,255,255,0.04)',
          }}>
            {PRO_BENEFITS.map((b, i) => (
              <div key={i} style={{
                padding: '12px 14px',
                background: 'rgba(8,15,35,0.97)',
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: '1rem' }}>{b.icon}</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#cbd5e1', fontFamily: 'Outfit, sans-serif' }}>{b.title}</span>
                </div>
                <span style={{ fontSize: '0.67rem', color: '#475569', lineHeight: 1.4, fontFamily: 'Outfit, sans-serif' }}>{b.desc}</span>
              </div>
            ))}
          </div>

          {/* CTA footer */}
          <div style={{ padding: '12px 18px', borderTop: '1px solid rgba(0,170,255,0.1)' }}>
            {isActive ? (
              <button
                onClick={() => { onManageSubscription?.(); setOpen(false) }}
                style={{
                  width: '100%', padding: '9px', borderRadius: 10,
                  background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
                  color: '#4ade80', fontWeight: 700, fontSize: '0.8rem',
                  cursor: 'pointer', fontFamily: 'Outfit, sans-serif',
                }}
              >
                Gerenciar Assinatura →
              </button>
            ) : (
              <div style={{ textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'Outfit, sans-serif' }}>
                A partir de <strong style={{ color: '#38bdf8' }}>R$ 49,90/mês</strong> · Cancele quando quiser
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}



function HeaderComponent({ darkMode, onToggleDark, onOpenSaved, onOpenSettings, onSignOut, syncStatus, onRetrySync, subscription, onManageSubscription }: Props) {
  return (
    <header className='relative w-full max-w-[1250px] mx-auto text-center px-5 pt-8 sm:pt-12 pb-7 font-outfit'>

      {/* Decorative gradient background */}
      <div className='absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[600px] h-[300px] bg-[radial-gradient(ellipse_at_center_top,rgba(0,170,255,0.15)_0%,transparent_70%)] pointer-events-none' />

      {/* Brand */}
      <div className="relative z-10 flex flex-col items-center mb-3">
        <Logo size={88} variant="full" className="mb-2 drop-shadow-[0_0_28px_rgba(31,182,255,0.3)]" />
      </div>

      <p className='text-[var(--text-muted)] text-base max-w-[500px] mx-auto mb-6'>
        Inspeção veicular interativa — registre danos com precisão
      </p>

      {/* PRO Benefits Dropdown Button */}
      <ProBenefitsButton
        subscription={subscription}
        onManageSubscription={onManageSubscription}
      />

      {/* Floating Action Buttons */}
      <div className='flex items-center justify-center gap-2 mt-5 sm:mt-0 sm:absolute sm:top-10 sm:right-10 z-20'>

        {syncStatus && (
          (() => {
            const label = SYNC_LABEL[syncStatus]
            const canRetry = syncStatus !== 'synced' && !!onRetrySync
            const Tag = canRetry ? 'button' : 'span'
            return (
              <Tag
                {...(canRetry ? { type: 'button' as const, onClick: onRetrySync } : {})}
                title={canRetry ? `${label.text} — toque para tentar de novo` : label.text}
                className={`h-10 px-3 rounded-xl border text-[0.72rem] font-bold backdrop-blur-md shadow-lg flex items-center justify-center gap-1.5 ${label.bgColor} ${label.borderColor} ${label.color} ${canRetry ? 'cursor-pointer hover:opacity-90 active:scale-[0.98] transition-all' : ''}`}
              >
                <span aria-hidden>{label.icon}</span>
                <span className="hidden sm:inline">{label.text}</span>
              </Tag>
            )
          })()
        )}

        {/* Logo da empresa movido para a barra de abas (ver CompanyLogoButton em app/page.tsx) */}

        <button
          onClick={onOpenSaved}
          title="Ver vistorias salvas"
          className="group h-10 px-4 bg-[var(--btn-secondary-bg)] hover:bg-sky-500/10 border border-[var(--btn-secondary-border)] hover:border-sky-500/50 rounded-xl text-[var(--text-main)] hover:text-sky-400 transition-all duration-300 text-[0.82rem] font-bold backdrop-blur-md shadow-lg hover:shadow-sky-500/10 flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0"
        >
          <svg 
            className="w-[18px] h-[18px] text-[var(--text-muted)] group-hover:text-sky-400 transition-colors duration-300"
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            strokeWidth="2.2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
          </svg>
          <span>Salvas</span>
        </button>

        <button
          onClick={onToggleDark}
          title={darkMode ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
          className="group w-10 h-10 bg-[var(--btn-secondary-bg)] border border-[var(--btn-secondary-border)] rounded-xl transition-all duration-300 backdrop-blur-md shadow-lg flex items-center justify-center hover:-translate-y-0.5 active:translate-y-0"
          style={{
            borderColor: darkMode ? 'rgba(251,191,36,0.2)' : 'rgba(56,189,248,0.2)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = darkMode ? 'rgba(251,191,36,0.08)' : 'rgba(56,189,248,0.08)';
            e.currentTarget.style.borderColor = darkMode ? 'rgba(251,191,36,0.45)' : 'rgba(56,189,248,0.45)';
            e.currentTarget.style.boxShadow = darkMode ? '0 0 15px rgba(251,191,36,0.2)' : '0 0 15px rgba(56,189,248,0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '';
            e.currentTarget.style.borderColor = darkMode ? 'rgba(251,191,36,0.2)' : 'rgba(56,189,248,0.2)';
            e.currentTarget.style.boxShadow = '';
          }}
        >
          {darkMode ? (
            <svg 
              className="w-5 h-5 text-amber-400 group-hover:rotate-45 transition-transform duration-500" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth="2.2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m0 13.5V21M4.978 4.978l1.591 1.591m10.862 10.862l1.591 1.591M21 12h-2.25m-13.5 0H3m2.285-7.02l1.591 1.591M16.12 16.12l1.591 1.591M12 7.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9z" />
            </svg>
          ) : (
            <svg 
              className="w-5 h-5 text-slate-400 group-hover:text-sky-400 group-hover:-rotate-12 transition-all duration-500" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth="2.2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
            </svg>
          )}
        </button>

        {onSignOut && (
          <button
            onClick={onSignOut}
            title="Sair da conta"
            className="group w-10 h-10 bg-slate-800/40 hover:bg-rose-500/10 border border-slate-700/60 hover:border-rose-500/50 rounded-xl text-slate-400 hover:text-rose-400 transition-all duration-300 backdrop-blur-md shadow-lg hover:shadow-rose-500/10 flex items-center justify-center hover:-translate-y-0.5 hover:translate-x-0.5 active:translate-y-0 active:translate-x-0"
          >
            <svg 
              className="w-[18px] h-[18px] text-slate-400 group-hover:text-rose-400 transition-colors duration-300" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth="2.2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
          </button>
        )}
      </div>
    </header>
  )
}

export default memo(HeaderComponent)
