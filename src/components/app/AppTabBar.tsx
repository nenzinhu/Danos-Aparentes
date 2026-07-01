'use client';
import CompanyLogoButton from '@/src/components/CompanyLogoButton'
import PwaInstallButton from '@/src/components/PwaInstallButton'

interface AppTabBarProps {
  activeTab: 'inspect' | 'dashboard' | 'ia'
  onTabChange: (tab: 'inspect' | 'dashboard' | 'ia') => void
  onOpenSettings: () => void
  onOpenTutorial: () => void
}

export default function AppTabBar({ activeTab, onTabChange, onOpenSettings, onOpenTutorial }: AppTabBarProps) {
  return (
    <div className="flex justify-center mt-2 mb-2">
      <div className="bg-slate-900/80 border border-white/5 rounded-xl p-1 flex flex-wrap gap-1 justify-center shadow-inner backdrop-blur-md">
        <button
          onClick={() => onTabChange('inspect')}
          className={`px-4 sm:px-6 py-2.5 rounded-lg text-xs font-bold font-outfit transition-all cursor-pointer ${
            activeTab === 'inspect'
              ? 'bg-sky-500/10 border border-sky-500/25 text-sky-400 shadow-md'
              : 'text-slate-400 hover:text-slate-200 border border-transparent'
          }`}
        >
          📝 Nova Vistoria
        </button>
        <button
          onClick={() => onTabChange('ia')}
          className={`px-4 sm:px-6 py-2.5 rounded-lg text-xs font-bold font-outfit transition-all cursor-pointer ${
            activeTab === 'ia'
              ? 'bg-sky-500/10 border border-sky-500/25 text-sky-400 shadow-md'
              : 'text-slate-400 hover:text-slate-200 border border-transparent'
          }`}
        >
          🤖 IA Interativo
        </button>
        <button
          onClick={() => onTabChange('dashboard')}
          className={`px-4 sm:px-6 py-2.5 rounded-lg text-xs font-bold font-outfit transition-all cursor-pointer ${
            activeTab === 'dashboard'
              ? 'bg-sky-500/10 border border-sky-500/25 text-sky-400 shadow-md'
              : 'text-slate-400 hover:text-slate-200 border border-transparent'
          }`}
        >
          📊 Estatísticas
        </button>
        <CompanyLogoButton onClick={onOpenSettings} />
        <PwaInstallButton />
        <button
          onClick={onOpenTutorial}
          className="px-3 py-2.5 rounded-lg text-xs font-bold font-outfit text-slate-400 hover:text-sky-400 hover:bg-sky-500/10 hover:border-sky-500/20 transition-all cursor-pointer border border-transparent flex items-center gap-1.5 focus:outline-none"
          title="Como funciona o aplicativo"
        >
          💡 Tutorial
        </button>
      </div>
    </div>
  )
}
