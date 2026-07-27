'use client';
import { useRef } from 'react';
import gsap from 'gsap';
import { Flip } from 'gsap/Flip';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(Flip, useGSAP);

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
 * Segmented auth switcher (Entrar / Cadastre-se) with:
 * - Flip pill that morphs between tabs
 * - Tap scale on both options
 * - Soft entrance when the login screen mounts
 */
export default function GsapAuthTabs({ tabs, active, onChange }: Props) {
  const listRef = useRef<HTMLDivElement | null>(null);
  const pillRef = useRef<HTMLSpanElement | null>(null);
  const isFirstPosition = useRef(true);

  useGSAP(
    () => {
      const list = listRef.current;
      const pill = pillRef.current;
      if (!list || !pill) return;

      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Entrance: both options + pill fade/slide in together on first paint.
      if (isFirstPosition.current) {
        const activeBtn = list.querySelector<HTMLButtonElement>(`[data-tab-value="${active}"]`);
        if (activeBtn) {
          gsap.set(pill, { x: activeBtn.offsetLeft, width: activeBtn.offsetWidth });
        }
        if (!reduced) {
          gsap.fromTo(
            list.querySelectorAll('[data-tab-value], [data-auth-pill]'),
            { opacity: 0, y: 8 },
            { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: 'power3.out' }
          );
        }
        isFirstPosition.current = false;
        return;
      }

      const activeBtn = list.querySelector<HTMLButtonElement>(`[data-tab-value="${active}"]`);
      if (!activeBtn) return;

      if (reduced) {
        gsap.set(pill, { x: activeBtn.offsetLeft, width: activeBtn.offsetWidth });
        return;
      }

      // Flip: capture pill geometry, move it under the new tab, animate the morph.
      const state = Flip.getState(pill);
      gsap.set(pill, { x: activeBtn.offsetLeft, width: activeBtn.offsetWidth });
      Flip.from(state, {
        duration: 0.45,
        ease: 'power3.out',
        absolute: false,
        simple: true,
      });

      // Brief press pulse on the newly selected label.
      gsap.fromTo(
        activeBtn,
        { scale: 0.94 },
        { scale: 1, duration: 0.35, ease: 'back.out(2)' }
      );
    },
    { dependencies: [active], scope: listRef, revertOnUpdate: false }
  );

  function handleTap(value: string, btn: HTMLButtonElement | null) {
    if (!btn) {
      onChange(value);
      return;
    }
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduced) {
      gsap.fromTo(
        btn,
        { scale: 0.92 },
        { scale: 1, duration: 0.28, ease: 'power2.out' }
      );
    }
    onChange(value);
  }

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label="Alternar entre entrar e cadastrar"
      className="relative flex bg-slate-950/50 border border-slate-800 rounded-xl p-1 mb-6"
    >
      <span
        ref={pillRef}
        data-auth-pill
        aria-hidden="true"
        className="absolute top-1 bottom-1 left-1 rounded-lg bg-blue-600 shadow-lg shadow-blue-600/20 will-change-transform"
        style={{ width: 0 }}
      />
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          role="tab"
          data-tab-value={tab.value}
          aria-selected={active === tab.value}
          onClick={(e) => handleTap(tab.value, e.currentTarget)}
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
