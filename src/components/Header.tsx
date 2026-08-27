'use client'
import React, { memo, useState, useEffect, useRef } from 'react'
import { MenuPortal, useAnchoredMenu } from './app/useAnchoredMenu'
import type { SubscriptionStatus } from '../hooks/useSubscription'
import Logo from '@/src/components/Logo'
import { buttonVariants } from '@/src/components/ui/buttonVariants'

interface Props {
  darkMode: boolean | null
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

import { IconDocument, IconSignature, IconGps, IconShieldCheck, IconSearch, IconTeam, IconSparkles, IconSunMoon } from './ui/AnimatedIcons'

const PRO_BENEFITS = [
  { icon: <IconDocument className="text-[var(--primary)]" size={18} />, title: 'PDF Profissional', desc: 'Laudo com hash SHA-256 e QR Code de autenticidade' },
  { icon: <IconSignature className="text-[var(--success)]" size={18} />, title: 'Assinatura Digital', desc: 'Vistoriador e cliente assinam na tela do celular' },
  { icon: <IconGps className="text-[var(--signal)]" size={18} />, title: '100% Offline', desc: 'Funciona sem internet, sincroniza quando conectar' },
  { icon: <IconShieldCheck className="text-[var(--primary)]" size={18} />, title: 'Marca Própria', desc: 'Logo e nome da empresa em todos os relatórios' },
  { icon: <IconSearch className="text-cyan-400" size={18} />, title: 'Consulta de Placas', desc: 'Preenchimento automático dos dados do veículo' },
  { icon: <IconTeam className="text-[var(--primary)]" size={18} />, title: 'Envio por WhatsApp', desc: 'Compartilhe o laudo em 1 clique diretamente pelo app' },
  { icon: <IconSparkles className="text-pink-400" size={18} />, title: 'Painel de Estatísticas', desc: 'Dashboard com histórico e análise das vistorias' },
  { icon: <IconSparkles className="text-[var(--primary)]" size={18} />, title: 'Voz Antoni PT-BR', desc: 'Narração das peças via ElevenLabs em português' },
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
  const btnRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const pos = useAnchoredMenu(open, btnRef, 340, 'right')

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      const t = e.target as Node
      // O menu é renderizado em portal no body (fora do ref). Sem este check,
      // clicar no botão interno fechava o menu no mousedown e o onClick nunca
      // disparava (o nó sumia antes do click subir).
      if (ref.current?.contains(t)) return
      if (menuRef.current?.contains(t)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const isActive  = subscription?.status === 'active'
  const isTrial   = subscription?.status === 'trialing'

  return (
    <div ref={ref} className="relative inline-block">
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-[0.7rem] font-bold border transition-colors ${
          isActive
            ? 'bg-[var(--success)]/10 border-[var(--success)]/30 text-[var(--success)]'
            : 'bg-[var(--btn-secondary-bg)] border-[var(--btn-secondary-border)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
        }`}
      >
        <IconSparkles size={13} className={isActive ? 'text-[var(--success)]' : 'text-[var(--primary)]'} />
        {isActive ? 'Pro' : isTrial ? `Trial ${subscription?.trialDaysLeft ?? 0}d` : 'Planos'}
      </button>

      <MenuPortal>
        {open && pos && (
          <div
            role="dialog"
              aria-label="Benefícios do plano"
              ref={menuRef}
              style={{ position: 'fixed', top: pos.top, left: pos.left, width: pos.width, zIndex: 9999 }}
              className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg-solid)] shadow-[var(--elevation-hover)] p-4 text-left"
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
              A partir de <strong className="text-[var(--primary)]">R$ 79,90/mês</strong>
            </p>
          )}
        </div>
        )}
      </MenuPortal>
    </div>
  )
}

function HeaderComponent({ darkMode, onToggleDark, onOpenSaved, onSignOut, syncStatus, syncLastError, onRetrySync, subscription, onManageSubscription, navSlot }: Props) {
  return (
    <header className="relative w-full max-w-[1250px] mx-auto px-4 pt-3 sm:pt-4 pb-2 font-outfit">
      <div className="flex items-center justify-between gap-3 min-h-12 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <Logo size={40} variant="full" className="shrink-0 drop-shadow-[0_0_16px_rgba(31,182,255,0.25)]" />
        </div>

        {navSlot && (
          <div className="order-last w-full min-w-0 flex justify-center lg:order-none lg:flex-1 lg:w-auto lg:px-2">{navSlot}</div>
        )}

        <div className="flex items-center justify-end gap-1.5 sm:gap-2 flex-wrap">
          <ProBenefitsButton
            subscription={subscription}
            onManageSubscription={onManageSubscription}
          />

          {syncStatus && (() => {
            const synced = syncStatus === 'synced'
            const canRetry = !synced && !!onRetrySync
            const errorDetail = syncStatus === 'error' && syncLastError ? syncLastError : undefined
            const title = synced
              ? 'Sincronizado com a nuvem'
              : errorDetail
                ? `Não sincronizado: ${errorDetail}${canRetry ? ' — toque para tentar de novo' : ''}`
                : canRetry ? 'Não sincronizado — toque para tentar de novo' : 'Não sincronizado'
            const Tag = canRetry ? 'button' : 'span'
            return (
              <Tag
                {...(canRetry ? { type: 'button' as const, onClick: onRetrySync } : {})}
                title={title}
                className={`h-8 px-2 sm:px-2.5 rounded-lg border text-[0.65rem] font-bold flex items-center gap-1.5 transition-colors ${
                  synced
                    ? 'border-[var(--success)]/35 bg-[var(--success)]/12 text-[var(--success)]'
                    : 'border-red-500/35 bg-red-500/12 text-red-400'
                } ${canRetry ? 'cursor-pointer hover:opacity-90' : ''}`}
              >
                <span aria-hidden className={`inline-block w-2 h-2 rounded-full ${synced ? 'bg-[var(--success)] shadow-[0_0_6px_var(--success)]' : 'bg-red-400 shadow-[0_0_6px_#f87171]'}`} />
                <span className="hidden sm:inline">{synced ? 'Sincronizado' : 'Não sincronizado'}</span>
              </Tag>
            )
          })()}

          <button
            type="button"
            onClick={onOpenSaved}
            title="Ver inspeções salvas"
            className={buttonVariants({ variant: 'secondary', size: 'sm', className: 'h-8 !py-0 !px-3 text-[0.7rem]' })}
          >
            Salvas
          </button>

          <button
            type="button"
            onClick={onToggleDark}
            title={darkMode === false ? 'Modo claro' : 'Modo escuro'}
            className="h-8 w-8 rounded-lg border border-[var(--btn-secondary-border)] bg-[var(--btn-secondary-bg)] flex items-center justify-center transition-colors hover:bg-[var(--btn-secondary-hover)]"
          >
            <IconSunMoon isDark={darkMode ?? true} className={darkMode === false ? 'text-slate-400' : 'text-[var(--signal)]'} size={16} />
          </button>

          {onSignOut && (
            <button
              type="button"
              onClick={onSignOut}
              title="Sair"
              className="h-8 w-8 rounded-lg border border-[var(--card-border)] text-[var(--text-muted)] hover:text-[var(--severity-high)] hover:border-[var(--severity-high)]/40 flex items-center justify-center transition-colors"
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
