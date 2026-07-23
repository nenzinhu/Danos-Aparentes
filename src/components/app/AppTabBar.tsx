'use client';

import { motion } from 'framer-motion'
import CompanyLogoButton from '@/src/components/CompanyLogoButton'
import PwaInstallButton from '@/src/components/PwaInstallButton'
import { IconDocument, IconSparkles, IconTeam, IconSearch } from '@/src/components/ui/AnimatedIcons'

interface AppTabBarProps {
  activeTab: 'inspect' | 'dashboard' | 'team'
  onTabChange: (tab: 'inspect' | 'dashboard' | 'team') => void
  onOpenSettings: () => void
  onOpenTutorial: () => void
  showTeamTab?: boolean
}

function tabClass(active: boolean) {
  return `px-3 sm:px-6 py-2.5 rounded-lg text-xs font-bold font-outfit transition-all cursor-pointer border inline-flex items-center gap-1.5 ${
    active
      ? 'theme-tab-active bg-sky-500/10 border-sky-500/25 text-sky-400 shadow-md'
      : 'theme-tab-idle text-[var(--text-muted)] hover:text-[var(--text-main)] border-transparent'
  }`
}

export default function AppTabBar({ activeTab, onTabChange, onOpenSettings, onOpenTutorial, showTeamTab }: AppTabBarProps) {
  return (
    <div className="flex justify-center mt-2 mb-2">
      <div className="theme-tabs bg-[var(--card-bg-solid)] border border-[var(--card-border)] rounded-xl p-1 flex flex-wrap gap-1 justify-center shadow-inner backdrop-blur-md max-w-full">
        <motion.button
          onClick={() => onTabChange('inspect')}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          className={tabClass(activeTab === 'inspect')}
        >
          <IconDocument size={15} className={activeTab === 'inspect' ? 'text-sky-400' : 'text-slate-400'} />
          <span className="hidden sm:inline">Nova Vistoria</span><span className="sm:hidden">Vistoria</span>
        </motion.button>

        <motion.button
          onClick={() => onTabChange('dashboard')}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          className={tabClass(activeTab === 'dashboard')}
        >
          <IconSparkles size={15} className={activeTab === 'dashboard' ? 'text-sky-400' : 'text-slate-400'} />
          <span className="hidden sm:inline">Estatísticas</span><span className="sm:hidden">Painel</span>
        </motion.button>

        {showTeamTab && (
          <motion.button
            onClick={() => onTabChange('team')}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className={tabClass(activeTab === 'team')}
          >
            <IconTeam size={15} className={activeTab === 'team' ? 'text-sky-400' : 'text-slate-400'} />
            <span className="hidden sm:inline">Equipe</span><span className="sm:hidden">Equipe</span>
          </motion.button>
        )}

        <CompanyLogoButton onClick={onOpenSettings} />
        <PwaInstallButton />

        <motion.button
          onClick={onOpenTutorial}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          className="theme-tab-idle px-3 py-2.5 rounded-lg text-xs font-bold font-outfit text-[var(--text-muted)] hover:text-sky-400 hover:bg-sky-500/10 hover:border-sky-500/20 transition-all cursor-pointer border border-transparent flex items-center gap-1.5 focus:outline-none"
          title="Como funciona o aplicativo"
        >
          <IconSearch size={15} className="text-amber-400" />
          <span className="hidden sm:inline">Tutorial</span>
        </motion.button>
      </div>
    </div>
  )
}
