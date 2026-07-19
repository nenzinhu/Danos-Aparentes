'use client';
import { NotesIcon, ChartIcon, UsersIcon, LightbulbIcon } from '@/src/components/app/AppIcons'
import CompanyLogoButton from '@/src/components/CompanyLogoButton'
import PwaInstallButton from '@/src/components/PwaInstallButton'

interface AppTabBarProps {
  activeTab: 'inspect' | 'dashboard' | 'team'
  onTabChange: (tab: 'inspect' | 'dashboard' | 'team') => void
  onOpenSettings: () => void
  onOpenTutorial: () => void
  showTeamTab?: boolean
}

function tabClass(active: boolean) {
  return `px-3 sm:px-6 py-2.5 rounded-lg text-xs font-bold font-outfit transition-all cursor-pointer border ${
    active
      ? 'theme-tab-active bg-sky-500/10 border-sky-500/25 text-sky-400 shadow-md'
      : 'theme-tab-idle text-[var(--text-muted)] hover:text-[var(--text-main)] border-transparent'
  }`
}

export default function AppTabBar({ activeTab, onTabChange, onOpenSettings, onOpenTutorial, showTeamTab }: AppTabBarProps) {
  return (
    <div className="flex justify-center mt-2 mb-2">
      <div className="theme-tabs bg-[var(--card-bg-solid)] border border-[var(--card-border)] rounded-xl p-1 flex flex-wrap gap-1 justify-center shadow-inner backdrop-blur-md max-w-full">
        <button
          onClick={() => onTabChange('inspect')}
          className={`${tabClass(activeTab === 'inspect')} inline-flex items-center gap-1.5`}
        >
          <NotesIcon size={14} /> <span className="hidden sm:inline">Nova Vistoria</span><span className="sm:hidden">Vistoria</span>
        </button>
        <button
          onClick={() => onTabChange('dashboard')}
          className={`${tabClass(activeTab === 'dashboard')} inline-flex items-center gap-1.5`}
        >
          <ChartIcon size={14} /> <span className="hidden sm:inline">Estatísticas</span><span className="sm:hidden">Painel</span>
        </button>
        {showTeamTab && (
          <button
            onClick={() => onTabChange('team')}
            className={`${tabClass(activeTab === 'team')} inline-flex items-center gap-1.5`}
          >
            <UsersIcon size={14} /> <span className="hidden sm:inline">Equipe</span><span className="sm:hidden">Equipe</span>
          </button>
        )}
        <CompanyLogoButton onClick={onOpenSettings} />
        <PwaInstallButton />
        <button
          onClick={onOpenTutorial}
          className="theme-tab-idle px-3 py-2.5 rounded-lg text-xs font-bold font-outfit text-[var(--text-muted)] hover:text-sky-400 hover:bg-sky-500/10 hover:border-sky-500/20 transition-all cursor-pointer border border-transparent flex items-center gap-1.5 focus:outline-none"
          title="Como funciona o aplicativo"
        >
          <LightbulbIcon size={14} /> <span className="hidden sm:inline">Tutorial</span>
        </button>
      </div>
    </div>
  )
}
