'use client'
import React, { memo, useState, useEffect, useRef } from 'react'
import type { SubscriptionStatus } from '../hooks/useSubscription'
import Logo from '@/src/components/Logo'
import { buttonVariants } from '@/src/components/ui/buttonVariants'

interface Props {
  darkMode: boolean
  onToggleDark: () => void
  onOpenSaved: () => void
  onOpenSettings?: () => void
  onSignOut?: () => void
  syncStatus?: 'synced' | 'pending' | 'offline' | 'error'
  syncLastError?: string
  onRetrySync?: () => void
  subscription?: { status: SubscriptionStatus; trialDaysLeft: number }
  onManageSubscription?: () => void
  navSlot?: React.ReactNode
}

import { IconDocument, IconSignature, IconGps, IconShieldCheck, IconSearch, IconTeam, IconSparkles, IconSunMoon, IconCheck, IconSync, IconOffline, IconWarning } from './ui/AnimatedIcons'

const SYNC_LABEL: Record<'synced' | 'pending' | 'offline' | 'error', { icon: React.ReactNode; text: string; color: string; bgColor: string; borderColor: string }> = {
  synced:  { icon: <IconCheck size={12} className="text-green-500" />, text: 'Sync',            color: 'text-green-500',  bgColor: 'bg-green-500/10',  borderColor: 'border-green-500/25'  },
  pending: { icon: <IconSync size={12} className="text-yellow-500" />, text: 'Pendente',  color: 'text-yellow-500', bgColor: 'bg-yellow-500/10', borderColor: 'border-yellow-500/25' },
  offline: { icon: <IconOffline size={12} className="text-red-500" />, text: 'Offline',                 color: 'text-red-500',    bgColor: 'bg-red-500/10',    borderColor: 'border-red-500/25'    },
  error:   { icon: <IconWarning size={12} className="text-orange-500" />, text: 'Erro sync',  color: 'text-orange-500', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/25' },
}

const PRO_BENEFITS = [
  { icon: <IconDocument className="text-sky-400" size={18} />, title: 'PDF Profissional', desc: 'Laudo com hash SHA-256 e QR Code de autenticidade' },
  { icon: <IconSignature className="text-emerald-400" size={18} />, title: 'Assinatura Digital', desc: 'Vistoriador e cliente assinam na tela do celular' },
  { icon: <IconGps className="text-amber-400" size={18} />, title: '100% Offline', desc: 'Funciona sem internet, sincroniza quando conectar' },
  { icon: <IconShieldCheck className="text-indigo-400" size={18} />, title: 'Marca Própria', desc: 'Logo e nome da empresa em todos os relatórios' },
  { icon: <IconSearch className="text-cyan-400" size={18} />, title: 'Consulta de Placas', desc: 'Preenchimento automático dos dados do veículo' },
  { icon: <IconTeam className="text-purple-400" size={18} />, title: 'Envio por WhatsApp', desc: 'Compartilhe o laudo em 1 clique diretamente pelo app' },
  { icon: <IconSparkles className="text-pink-400" size={18} />, title: 'Painel de Estatísticas', desc: 'Dashboard com histórico e análise das vistorias' },
  { icon: <IconSparkles className="text-sky-400" size={18} />, title: 'Voz Antoni PT-BR', desc: 'Narração das peças via ElevenLabs em português' },
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
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-[0.7rem] font-bold border transition-colors ${
          isActive
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            : 'bg-[var(--btn-secondary-bg)] border-[var(--btn-secondary-border)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
        }`}
      >
        <IconSparkles size={13} className={isActive ? 'text-emerald-400' : 'text-sky-400'} />
        {isActive ? 'Pro' : isTrial ? `Trial ${subscription?.trialDaysLeft ?? 0}d` : 'Planos'}
      </button>

      {open && (
        <div
          className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50 w-[min(92vw,340px)] rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg-solid)] shadow-[var(--elevation-hover)] p-4 text-left"
          role="dialog"
          aria-label="Benefícios do plano"
        >
          <p className="ds-label mb-3">Recursos Pro</p>
          <ul className="space-y-2.5 max-h-64 overflow-y-auto">
            {PRO_BENEFITS.map((b) => (
              <li key={b.title} className="flex gap-2.5 items-start">
                <span className="mt-0.5 shrink-0">{b.icon}</span>
                <div>
                  <p className="text-[0.78rem] font-bold text-[var(--text-main)]">{b.title}</p>
                  <p className="ds-caption mt-0.5">{b.desc}</p>
                </div>
              </li>
            ))}
          </ul>
          {onManageSubscription && (
            <button
              type="button"
              onClick={() => { setOpen(false); onManageSubscription() }}
              className={buttonVariants({ variant: 'primary', size: 'sm', className: 'w-full mt-4' })}
            >
              {isActive || isTrial ? 'Gerenciar assinatura' : 'Assinar agora'}
            </button>
          )}
          {!isActive && !isTrial && (
            <p className="ds-caption text-center mt-2">
              A partir de <strong className="text-sky-400">R$ 79,90/mês</strong>
            </p>
          )}
        </div>
      )}
    </div>
  )
}

function HeaderComponent({ darkMode, onToggleDark, onOpenSaved, onSignOut, syncStatus, syncLastError, onRetrySync, subscription, onManageSubscription, navSlot }: Props) {
  return (
    <header className="relative w-full max-w-[1250px] mx-auto px-4 pt-3 sm:pt-4 pb-2 font-outfit">
      <div className="relative z-10 flex items-center justify-between gap-3 min-h-12">
        <div className="flex items-center gap-3 min-w-0">
          <Logo size={40} variant="full" className="shrink-0 drop-shadow-[0_0_16px_rgba(31,182,255,0.25)]" />
        </div>

        {navSlot && (
          <div className="flex-1 min-w-0 flex justify-center px-2">{navSlot}</div>
        )}

        <div className="flex items-center justify-end gap-1.5 sm:gap-2 flex-wrap">
          <ProBenefitsButton
            subscription={subscription}
            onManageSubscription={onManageSubscription}
          />

          {syncStatus && (() => {
            const label = SYNC_LABEL[syncStatus]
            const canRetry = syncStatus !== 'synced' && !!onRetrySync
            const errorDetail = syncStatus === 'error' && syncLastError ? syncLastError : undefined
            const title = errorDetail
              ? `${label.text}: ${errorDetail}${canRetry ? ' — toque para tentar de novo' : ''}`
              : canRetry ? `${label.text} — toque para tentar de novo` : label.text
            const Tag = canRetry ? 'button' : 'span'
            return (
              <Tag
                {...(canRetry ? { type: 'button' as const, onClick: onRetrySync } : {})}
                title={title}
                className={`h-8 px-2 sm:px-2.5 rounded-lg border text-[0.65rem] font-bold flex items-center gap-1 ${label.bgColor} ${label.borderColor} ${label.color} ${canRetry ? 'cursor-pointer hover:opacity-90' : ''}`}
              >
                <span aria-hidden>{label.icon}</span>
                <span className="hidden sm:inline">{label.text}</span>
              </Tag>
            )
          })()}

          <button
            type="button"
            onClick={onOpenSaved}
            title="Ver vistorias salvas"
            className={buttonVariants({ variant: 'secondary', size: 'sm', className: 'h-8 !py-0 !px-3 text-[0.7rem]' })}
          >
            Salvas
          </button>

          <button
            type="button"
            onClick={onToggleDark}
            title={darkMode ? 'Modo claro' : 'Modo escuro'}
            className="h-8 w-8 rounded-lg border border-[var(--btn-secondary-border)] bg-[var(--btn-secondary-bg)] flex items-center justify-center transition-colors hover:bg-[var(--btn-secondary-hover)]"
          >
            <IconSunMoon isDark={darkMode} className={darkMode ? 'text-amber-400' : 'text-slate-400'} size={16} />
          </button>

          {onSignOut && (
            <button
              type="button"
              onClick={onSignOut}
              title="Sair"
              className="h-8 w-8 rounded-lg border border-[var(--card-border)] text-[var(--text-muted)] hover:text-rose-400 hover:border-rose-500/40 flex items-center justify-center transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </header>
  )
}

export default memo(HeaderComponent)
