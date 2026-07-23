'use client';

import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import CompanyLogoButton from '@/src/components/CompanyLogoButton';
import PwaInstallButton from '@/src/components/PwaInstallButton';
import { IconDocument, IconSparkles, IconTeam, IconSearch } from '@/src/components/ui/AnimatedIcons';

interface AppTabBarProps {
  activeTab: 'inspect' | 'dashboard' | 'team';
  onTabChange: (tab: 'inspect' | 'dashboard' | 'team') => void;
  onOpenSettings: () => void;
  onOpenTutorial: () => void;
  showTeamTab?: boolean;
}

function tabClass(active: boolean) {
  return `px-3 sm:px-6 py-2.5 rounded-lg text-xs font-bold font-outfit transition-colors cursor-pointer border inline-flex items-center gap-1.5 ${
    active
      ? 'theme-tab-active bg-sky-500/10 border-sky-500/25 text-sky-400 shadow-md'
      : 'theme-tab-idle text-[var(--text-muted)] hover:text-[var(--text-main)] border-transparent'
  }`;
}

// Aplica animação GSAP de hover/tap em um botão já montado no DOM
function useGsapButton(ref: React.RefObject<HTMLButtonElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      el.addEventListener('mouseenter', () => gsap.to(el, { scale: 1.04, duration: 0.18, ease: 'power2.out' }));
      el.addEventListener('mouseleave', () => gsap.to(el, { scale: 1, duration: 0.18, ease: 'power2.out' }));
      el.addEventListener('mousedown', () => gsap.to(el, { scale: 0.96, duration: 0.1, ease: 'power2.out' }));
      el.addEventListener('mouseup', () => gsap.to(el, { scale: 1.04, duration: 0.1, ease: 'power2.out' }));
    }, el);
    return () => ctx.revert();
  }, [ref]);
}

function GsapTabButton({
  onClick,
  className,
  children,
  title,
}: {
  onClick: () => void;
  className: string;
  children: React.ReactNode;
  title?: string;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  useGsapButton(ref);
  return (
    <button ref={ref} onClick={onClick} className={className} title={title}>
      {children}
    </button>
  );
}

export default function AppTabBar({ activeTab, onTabChange, onOpenSettings, onOpenTutorial, showTeamTab }: AppTabBarProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Animação de entrada da TabBar na montagem
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(el,
        { opacity: 0, y: -12 },
        { opacity: 1, y: 0, duration: 0.45, ease: 'back.out(1.4)' }
      );
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <div className="flex justify-center mt-2 mb-2">
      <div
        ref={containerRef}
        className="theme-tabs bg-[var(--card-bg-solid)] border border-[var(--card-border)] rounded-xl p-1 flex flex-wrap gap-1 justify-center shadow-inner backdrop-blur-md max-w-full"
      >
        <GsapTabButton
          onClick={() => onTabChange('inspect')}
          className={tabClass(activeTab === 'inspect')}
        >
          <IconDocument size={15} className={activeTab === 'inspect' ? 'text-sky-400' : 'text-slate-400'} />
          <span className="hidden sm:inline">Nova Vistoria</span><span className="sm:hidden">Vistoria</span>
        </GsapTabButton>

        <GsapTabButton
          onClick={() => onTabChange('dashboard')}
          className={tabClass(activeTab === 'dashboard')}
        >
          <IconSparkles size={15} className={activeTab === 'dashboard' ? 'text-sky-400' : 'text-slate-400'} />
          <span className="hidden sm:inline">Estatísticas</span><span className="sm:hidden">Painel</span>
        </GsapTabButton>

        {showTeamTab && (
          <GsapTabButton
            onClick={() => onTabChange('team')}
            className={tabClass(activeTab === 'team')}
          >
            <IconTeam size={15} className={activeTab === 'team' ? 'text-sky-400' : 'text-slate-400'} />
            <span className="hidden sm:inline">Equipe</span><span className="sm:hidden">Equipe</span>
          </GsapTabButton>
        )}

        <CompanyLogoButton onClick={onOpenSettings} />
        <PwaInstallButton />

        <GsapTabButton
          onClick={onOpenTutorial}
          className="theme-tab-idle px-3 py-2.5 rounded-lg text-xs font-bold font-outfit text-[var(--text-muted)] hover:text-sky-400 hover:bg-sky-500/10 hover:border-sky-500/20 transition-colors cursor-pointer border border-transparent flex items-center gap-1.5 focus:outline-none"
          title="Como funciona o aplicativo"
        >
          <IconSearch size={15} className="text-amber-400" />
          <span className="hidden sm:inline">Tutorial</span>
        </GsapTabButton>
      </div>
    </div>
  );
}
