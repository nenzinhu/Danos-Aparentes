'use client';

import React, { useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import CompanyLogoButton from '@/src/components/CompanyLogoButton';
import PwaInstallButton from '@/src/components/PwaInstallButton';
import { IconDocument, IconSparkles, IconTeam, IconSearch, IconCar } from '@/src/components/ui/AnimatedIcons';
import { buttonVariants } from '@/src/components/ui/buttonVariants';

interface AppTabBarProps {
  activeTab: 'inspect' | 'dashboard' | 'team' | 'vehicles';
  onTabChange: (tab: 'inspect' | 'dashboard' | 'team' | 'vehicles') => void;
  onOpenSettings: () => void;
  onOpenTutorial: () => void;
  showTeamTab?: boolean;
}

function tabClass(active: boolean, isPrimary?: boolean) {
  if (isPrimary && active) {
    return buttonVariants({
      variant: 'primary',
      size: 'sm',
      className: '!rounded-lg !shadow-md inline-flex items-center gap-1.5',
    });
  }
  return `px-3 sm:px-4 py-2 rounded-lg text-xs font-bold font-outfit transition-colors cursor-pointer border inline-flex items-center gap-1.5 ${
    active
      ? 'theme-tab-active bg-[var(--btn-secondary-bg)] border-[var(--btn-secondary-border)] text-[var(--primary)]'
      : 'theme-tab-idle text-[var(--text-muted)] hover:text-[var(--text-main)] border-transparent hover:bg-white/[0.03]'
  }`;
}

function useGsapButton(ref: React.RefObject<HTMLButtonElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduce) return;
    const ctx = gsap.context(() => {
      el.addEventListener('mouseenter', () => gsap.to(el, { scale: 1.03, duration: 0.15, ease: 'power2.out' }));
      el.addEventListener('mouseleave', () => gsap.to(el, { scale: 1, duration: 0.15, ease: 'power2.out' }));
      el.addEventListener('mousedown', () => gsap.to(el, { scale: 0.97, duration: 0.08, ease: 'power2.out' }));
      el.addEventListener('mouseup', () => gsap.to(el, { scale: 1.03, duration: 0.08, ease: 'power2.out' }));
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
    <button ref={ref} type="button" onClick={onClick} className={className} title={title}>
      {children}
    </button>
  );
}

export default function AppTabBar({ activeTab, onTabChange, onOpenSettings, onOpenTutorial, showTeamTab }: AppTabBarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(el,
        { opacity: 0, y: -8 },
        { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }
      );
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <div className="flex justify-center mt-1 mb-1 px-2">
      <div
        ref={containerRef}
        className="theme-tabs bg-[var(--card-bg-solid)] border border-[var(--card-border)] rounded-xl p-1 flex flex-wrap gap-0.5 justify-center shadow-sm backdrop-blur-md max-w-full"
      >
        <GsapTabButton
          onClick={() => onTabChange('inspect')}
          className={tabClass(activeTab === 'inspect', true)}
        >
          <IconDocument size={14} className={activeTab === 'inspect' ? 'text-white' : 'text-slate-400'} />
          <span className="hidden sm:inline">Nova Inspeção</span><span className="sm:hidden">Inspeção</span>
        </GsapTabButton>

        <GsapTabButton
          onClick={() => {
            onTabChange('vehicles');
            router.push('/app/vehicles');
          }}
          className={tabClass(activeTab === 'vehicles')}
          title="Linha do Tempo e comparação por veículo"
        >
          <IconCar size={14} className={activeTab === 'vehicles' ? 'text-[var(--primary)]' : 'text-slate-400'} />
          Histórico
        </GsapTabButton>

        <GsapTabButton
          onClick={() => onTabChange('dashboard')}
          className={tabClass(activeTab === 'dashboard')}
        >
          <IconSparkles size={14} className={activeTab === 'dashboard' ? 'text-[var(--primary)]' : 'text-slate-400'} />
          <span className="hidden sm:inline">Gestão Histórica</span><span className="sm:hidden">Painel</span>
        </GsapTabButton>

        {showTeamTab && (
          <GsapTabButton
            onClick={() => onTabChange('team')}
            className={tabClass(activeTab === 'team')}
          >
            <IconTeam size={14} className={activeTab === 'team' ? 'text-[var(--primary)]' : 'text-slate-400'} />
            Equipe
          </GsapTabButton>
        )}

        <CompanyLogoButton onClick={onOpenSettings} />
        <PwaInstallButton />

        <GsapTabButton
          onClick={onOpenTutorial}
          className={buttonVariants({ variant: 'ghost', size: 'sm', className: '!rounded-lg inline-flex items-center gap-1.5' })}
          title="Como funciona a plataforma"
        >
          <IconSearch size={14} className="text-[var(--signal)]" />
          <span className="hidden sm:inline">Tutorial</span>
        </GsapTabButton>
      </div>
    </div>
  );
}
