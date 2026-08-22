'use client'

import React from 'react'
import PwaInstallButton from '@/src/components/PwaInstallButton'
import { IconCar, IconFolder, IconSparkles, IconTeam } from '@/src/components/ui/AnimatedIcons'
import { buttonVariants } from '@/src/components/ui/buttonVariants'
import NewInspectionDropdown from './NewInspectionDropdown'
import { Tabs, TabsList, Tab } from '@/src/components/ui/Tabs'
import type { InspectionPurpose } from '@/src/types'

export type AppTabValue = 'inspect' | 'dashboard' | 'vehicles' | 'team' | 'ia'

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

function TabBadge({ count, tone }: { count: number; tone: 'cyan' | 'green' }) {
  if (count <= 0) return null
  return (
    <span
      aria-label={`${count} ${count === 1 ? 'item' : 'itens'}`}
      className={`ml-1.5 inline-flex min-w-[1.15rem] h-[1.15rem] items-center justify-center rounded-full px-1 text-[0.62rem] font-black tabular-nums ${
        tone === 'cyan'
          ? 'bg-sky-500/20 text-sky-300 border border-sky-400/30'
          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
      }`}
    >
      {count > 99 ? '99+' : count}
    </span>
  )
}

/**
 * Navegação principal do app, organizada por verbo do trabalho:
 * lugares (Veículos · Dossiês · IA · Equipe) + ação primária (+ Nova vistoria).
 * Cada aba tem cor de acento própria — o usuário sabe onde está pela cor.
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
  const tabIconTone = (active: boolean, tone: string) =>
    active ? tone : 'text-slate-400'

  return (
    <div className="w-full min-w-0 flex flex-wrap items-center justify-center gap-1.5 mt-1 mb-1 px-2">
      <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as AppTabValue)}>
        <TabsList aria-label="Navegação principal do aplicativo">
          <Tab value="vehicles">
            <IconCar size={14} className={tabIconTone(activeTab === 'vehicles', 'text-sky-400')} />
            Veículos
            <TabBadge count={vehiclesCount} tone="cyan" />
          </Tab>
          <Tab value="dashboard">
            <IconFolder size={14} className={tabIconTone(activeTab === 'dashboard', 'text-emerald-400')} />
            Dossiês
            {unsyncedCount > 0 && <TabBadge count={unsyncedCount} tone="green" />}
          </Tab>
          <Tab value="ia">
            <IconSparkles size={14} className={tabIconTone(activeTab === 'ia', 'text-violet-400')} />
            IA
          </Tab>
          {showTeamTab && (
            <Tab value="team">
              <IconTeam size={14} className={tabIconTone(activeTab === 'team', 'text-[var(--primary)]')} />
              Equipe
            </Tab>
          )}
        </TabsList>
      </Tabs>

      <NewInspectionDropdown
        active={activeTab === 'inspect'}
        onSelect={(purpose) => onNewInspection(purpose)}
      />

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
  )
}
