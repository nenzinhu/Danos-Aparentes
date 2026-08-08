'use client';

import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import PwaInstallButton from '@/src/components/PwaInstallButton';
import { IconTeam, IconSearch } from '@/src/components/ui/AnimatedIcons';
import { buttonVariants } from '@/src/components/ui/buttonVariants';
import PanelSmartDropdown from './PanelSmartDropdown';
import NewInspectionDropdown from './NewInspectionDropdown';
import type { InspectionPurpose } from '@/src/types';

interface AppTabBarProps {
  activeTab: 'inspect' | 'dashboard' | 'team' | 'vehicles';
  onTabChange: (tab: 'inspect' | 'dashboard' | 'team' | 'vehicles') => void;
  onNewInspection: (purpose: InspectionPurpose) => void;
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

export default function AppTabBar({ activeTab, onTabChange, onNewInspection, onOpenSettings, onOpenTutorial, showTeamTab }: AppTabBarProps) {
  const containerRef = useRef<HTMLDivElement>(null);

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
        className="theme-tabs bg-[var(--card-bg-solid)] border border-[var(--card-border)] rounded-xl p-1 flex flex-wrap items-center gap-0.5 justify-center shadow-sm backdrop-blur-md max-w-full"
      >
        <NewInspectionDropdown
          active={activeTab === 'inspect'}
          onSelect={(purpose) => onNewInspection(purpose)}
        />

        <PanelSmartDropdown onSelect={(v) => onTabChange(v)} />

        {showTeamTab && (
          <GsapTabButton
            onClick={() => onTabChange('team')}
            className={tabClass(activeTab === 'team')}
          >
            <IconTeam size={14} className={activeTab === 'team' ? 'text-[var(--primary)]' : 'text-slate-400'} />
            Equipe
          </GsapTabButton>
        )}

        <GsapTabButton
          onClick={onOpenTutorial}
          className={buttonVariants({ variant: 'ghost', size: 'sm', className: '!rounded-lg inline-flex items-center gap-1.5' })}
          title="Ajuda / Como funciona"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-[var(--signal)]">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12" y2="17" />
          </svg>
        </GsapTabButton>

        <PwaInstallButton />
      </div>
    </div>
  );
}
