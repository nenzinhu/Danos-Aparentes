'use client';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface Tab {
  value: string;
  label: string;
}

interface Props {
  tabs: Tab[];
  active: string;
  onChange: (value: string) => void;
}

/**
 * Segmented tab switcher for the auth screen (Entrar / Cadastre-se) with a
 * GSAP pill that slides to the active tab instead of just swapping classes —
 * matches the motion language used across the landing page (power3 eases,
 * ~0.3-0.4s durations).
 */
export default function GsapAuthTabs({ tabs, active, onChange }: Props) {
  const listRef = useRef<HTMLDivElement | null>(null);
  const pillRef = useRef<HTMLSpanElement | null>(null);
  const isFirstPosition = useRef(true);

  useEffect(() => {
    const list = listRef.current;
    const pill = pillRef.current;
    if (!list || !pill) return;

    const activeBtn = list.querySelector<HTMLButtonElement>(`[data-tab-value="${active}"]`);
    if (!activeBtn) return;

    const target = { x: activeBtn.offsetLeft, width: activeBtn.offsetWidth };
    // Snap on first layout so mobile doesn't flash a zero-width pill before the
    // slide runs; animate only on later tab changes.
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || isFirstPosition.current) {
      gsap.set(pill, target);
      isFirstPosition.current = false;
      return;
    }

    gsap.to(pill, {
      ...target,
      duration: 0.4,
      ease: 'power3.out',
    });
  }, [active]);

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label="Alternar entre entrar e cadastrar"
      className="relative flex bg-slate-950/50 border border-slate-800 rounded-xl p-1 mb-6"
    >
      <span
        ref={pillRef}
        aria-hidden="true"
        className="absolute top-1 bottom-1 left-1 rounded-lg bg-blue-600 shadow-lg shadow-blue-600/20"
        style={{ width: 0 }}
      />
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          role="tab"
          data-tab-value={tab.value}
          aria-selected={active === tab.value}
          onClick={() => onChange(tab.value)}
          className={`relative z-10 flex-1 text-sm font-bold py-2.5 rounded-lg transition-colors duration-150 cursor-pointer ${
            active === tab.value ? 'text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
