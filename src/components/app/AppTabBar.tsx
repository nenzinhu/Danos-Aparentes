'use client'

import React from 'react'
import PwaInstallButton from '@/src/components/PwaInstallButton'
import { IconTeam } from '@/src/components/ui/AnimatedIcons'
import { buttonVariants } from '@/src/components/ui/buttonVariants'
import NewInspectionDropdown from './NewInspectionDropdown'
import { Tabs, TabsList, Tab } from '@/src/components/ui/Tabs'
import type { InspectionPurpose } from '@/src/types'

interface AppTabBarProps {
  activeTab: 'inspect' | 'dashboard' | 'vehicles' | 'team'
  onTabChange: (tab: 'inspect' | 'dashboard' | 'vehicles' | 'team') => void
  onNewInspection: (purpose: InspectionPurpose) => void
  onOpenSettings: () => void
  onOpenTutorial: () => void
  showTeamTab?: boolean
}

export default function AppTabBar({
  activeTab,
  onTabChange,
  onNewInspection,
  onOpenSettings,
  onOpenTutorial,
  showTeamTab,
}: AppTabBarProps) {
  return (
    <div className="w-full min-w-0 flex flex-wrap items-center justify-center gap-1.5 mt-1 mb-1 px-2">
      <NewInspectionDropdown
        active={activeTab === 'inspect'}
        onSelect={(purpose) => onNewInspection(purpose)}
      />

      <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as AppTabBarProps['activeTab'])}>
        <TabsList aria-label="Navegação principal do aplicativo">
          <Tab value="inspect">Inspecionar</Tab>
          <Tab value="dashboard">Painel</Tab>
          <Tab value="vehicles">Veículos</Tab>
          {showTeamTab && (
            <Tab value="team">
              <IconTeam size={14} className={activeTab === 'team' ? 'text-[var(--primary)]' : 'text-slate-400'} />
              Equipe
            </Tab>
          )}
        </TabsList>
      </Tabs>

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
