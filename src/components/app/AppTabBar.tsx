'use client'

import React from 'react'
import PwaInstallButton from '@/src/components/PwaInstallButton'
import { IconCar, IconFolder, IconSparkles, IconTeam, IconDocument } from '@/src/components/ui/AnimatedIcons'
import { buttonVariants } from '@/src/components/ui/buttonVariants'
import NewInspectionDropdown from './NewInspectionDropdown'
import { Tabs, TabsList, Tab } from '@/src/components/ui/Tabs'
import type { InspectionPurpose } from '@/src/types'

export type AppTabValue = 'inspect' | 'dashboard' | 'vehicles' | 'team' | 'ia' | 'clients'

interface AppTabBarProps {
  activeTab: AppTabValue
  onTabChange: (tab: AppTabValue) => void
  onNewInspection: (purpose: InspectionPurpose) => void
  onOpenSettings: () => void
  onOpenTutorial: () => void
  showTeamTab?: boolean
  /** Nº de veículos com histórico — badge da aba Veículos. */
  vehiclesCount?: number
  /** Nº de dossiês ainda não sincronizados — badge da aba Dossiês. */
  unsyncedCount?: number
}

/** Badge de contagem: cyan = ação; âmbar = dado estrutural (ex.: pendências de sync). */
function TabBadge({ count, tone }: { count: number; tone: 'action' | 'signal' }) {
  if (count <= 0) return null
  return (
    <span
      aria-label={`${count} ${count === 1 ? 'item' : 'itens'}`}
      className={`ml-1.5 inline-flex min-w-[1.15rem] h-[1.15rem] items-center justify-center rounded-full px-1 text-[0.62rem] font-black tabular-nums ${
        tone === 'action'
          ? 'bg-[var(--primary)]/20 text-[var(--primary)] border border-[var(--primary)]/30'
          : 'bg-[var(--signal)]/20 text-[var(--signal-bright)] border border-[var(--signal)]/30'
      }`}
    >
      {count > 99 ? '99+' : count}
    </span>
  )
}

type MobileTab = {
  value: string
  label: string
  icon: React.ReactNode
  badge: React.ReactNode
  aria: string
}

function HelpIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="text-[var(--signal)]"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12" y2="17" />
    </svg>
  )
}

/**
 * Navegação principal do app por verbo do trabalho.
 * Acentos do DESIGN.md: primary (ação) ativo; signal só para dado/pendência.
 */
export default function AppTabBar({
  activeTab,
  onTabChange,
  onNewInspection,
  onOpenSettings,
  onOpenTutorial,
  showTeamTab,
  vehiclesCount = 0,
  unsyncedCount = 0,
}: AppTabBarProps) {
  const tabIconClass = (active: boolean) =>
    active ? 'text-[var(--primary)]' : 'text-[var(--text-muted)]'

  // Mobile tabs resolvidos uma vez (evita JSX inline dentro de array literal no render).
  const mobileTabs: MobileTab[] = [
    { value: 'vehicles', label: 'Veículos', icon: <IconCar size={20} className={tabIconClass(activeTab === 'vehicles')} />, badge: <TabBadge count={vehiclesCount} tone="action" />, aria: 'Ir para Veículos' },
    { value: 'dashboard', label: 'Dossiês', icon: <IconFolder size={20} className={tabIconClass(activeTab === 'dashboard')} />, badge: unsyncedCount > 0 ? <TabBadge count={unsyncedCount} tone="signal" /> : null, aria: 'Ir para Dossiês' },
    { value: 'ia', label: 'IA', icon: <IconSparkles size={20} className={tabIconClass(activeTab === 'ia')} />, badge: null, aria: 'Acessar Inteligência Artificial' },
    { value: '__new__', label: 'Nova', icon: <span className="flex h-11 w-11 -mt-4 items-center justify-center rounded-full text-[var(--bg-main)] font-black text-2xl shadow-xl shadow-[var(--primary)]/30" style={{ backgroundImage: 'var(--primary-btn-gradient)' }}>+</span>, badge: null, aria: 'Nova inspeção de vistoria' },
    { value: 'clients', label: 'Clientes', icon: <IconDocument size={20} className={tabIconClass(activeTab === 'clients')} />, badge: null, aria: 'Ir para Clientes' },
    showTeamTab
      ? { value: 'team', label: 'Equipe', icon: <IconTeam size={20} className={tabIconClass(activeTab === 'team')} />, badge: null, aria: 'Ir para Equipe' }
      : { value: '__tutorial__', label: 'Ajuda', icon: <HelpIcon />, badge: null, aria: 'Ajuda / Como funciona' },
  ]

  return (
    <>
    <div className="flex w-full min-w-0 flex-wrap items-center justify-center gap-1.5 mt-1 mb-1 px-2">
      {/* Desktop: abas + ação primária alinhadas no header. Scroll horizontal em
          telas estreitas (~md) para não transbordar. O "Nova inspeção" gruda
          na margem direita mantendo as abas navegáveis. */}
      <div className="hidden md:flex items-center gap-1.5 overflow-x-auto [&::-webkit-scrollbar]:hidden -mx-2 pl-2 pr-1">
        <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as AppTabValue)}>
          {/* TabsList já expõe role="tablist" + roving-tabindex por teclado. */}
          <TabsList aria-label="Navegação principal do aplicativo">
            <Tab value="vehicles">
              <IconCar size={14} className={tabIconClass(activeTab === 'vehicles')} />
              Veículos
              <TabBadge count={vehiclesCount} tone="action" />
            </Tab>
            <Tab value="dashboard">
              <IconFolder size={14} className={tabIconClass(activeTab === 'dashboard')} />
              Dossiês
              {unsyncedCount > 0 && <TabBadge count={unsyncedCount} tone="signal" />}
            </Tab>
            <Tab value="ia">
              <IconSparkles size={14} className={tabIconClass(activeTab === 'ia')} />
              IA
            </Tab>
            <Tab value="clients">
              <IconDocument size={14} className={tabIconClass(activeTab === 'clients')} />
              Clientes
            </Tab>
            {showTeamTab && (
              <Tab value="team">
                <IconTeam size={14} className={tabIconClass(activeTab === 'team')} />
                Equipe
              </Tab>
            )}
          </TabsList>
        </Tabs>

        <NewInspectionDropdown
          active={activeTab === 'inspect'}
          onSelect={(purpose) => onNewInspection(purpose)}
        />
      </div>

      <button
        type="button"
        onClick={onOpenTutorial}
        title="Ajuda / Como funciona"
        className={buttonVariants({
          variant: 'ghost',
          size: 'sm',
          className: '!rounded-lg inline-flex items-center gap-1.5',
        })}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="text-[var(--signal)]"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12" y2="17" />
        </svg>
      </button>

      <PwaInstallButton />
    </div>

    {/* Barra inferior no mobile: onde o polegar alcança. Grid de 6 colunas
        espelha todas as abas (incl. IA) + "Nova" (inspiração) ou "Ajuda".
        Cada botão recebe aria-label; altura mínima 44px. */}
    <nav
      aria-label="Navegação principal do aplicativo"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-[var(--card-border)] bg-[var(--bg-main)]/95 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]"
    >
      <div className="grid grid-cols-6 items-stretch h-16 max-w-lg mx-auto">
        {mobileTabs.map((item) => (
          <button
            key={item.value}
            type="button"
            aria-label={item.aria}
            aria-current={activeTab === item.value ? 'page' : undefined}
            onClick={() => {
              if (item.value === '__new__') {
                onNewInspection('entrada')
                return
              }
              if (item.value === '__tutorial__') {
                onOpenTutorial()
                return
              }
              onTabChange(item.value as AppTabValue)
            }}
            className={`flex flex-col items-center justify-center gap-0.5 text-[0.6rem] font-bold uppercase tracking-wide transition-colors cursor-pointer min-h-11 ${activeTab === item.value ? 'text-[var(--text-main)]' : 'text-[var(--text-muted)]'}`}
          >
            {item.icon}
            <span className="flex items-center">{item.label}{item.badge}</span>
          </button>
        ))}
      </div>
    </nav>
    </>
  )
}
