'use client';
import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { IconProps, useHoverScale } from './shared';

// ─── NOVOS ícones para o Dashboard ──────────────────────────────────────────

// 17. Chart / Bar Chart (para Dashboard vazio)
export function IconChart({ className = '', size = 48 }: IconProps) {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // ponytail: anima as barras de baixo para cima na montagem
    const bars = el.querySelectorAll('[data-bar]');
    gsap.fromTo(bars,
      { scaleY: 0, transformOrigin: 'bottom' },
      { scaleY: 1, duration: 0.7, stagger: 0.12, ease: 'back.out(1.4)', delay: 0.2 }
    );
    return () => { gsap.killTweensOf(bars); };
  }, []);
  return (
    <svg ref={ref} width={size} height={size} viewBox="0 0 48 48" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      className={`animated-icon-base ${className}`}>
      <rect data-bar="" x="6" y="28" width="8" height="14" rx="2" opacity="0.5" />
      <rect data-bar="" x="20" y="18" width="8" height="24" rx="2" opacity="0.7" />
      <rect data-bar="" x="34" y="10" width="8" height="32" rx="2" />
      <line x1="4" y1="42" x2="44" y2="42" strokeOpacity="0.3" />
    </svg>
  );
}

// 18. Folder (para "Armazenadas localmente")
export function IconFolder({ className = '', size = 14 }: IconProps) {
  const ref = useRef<SVGSVGElement>(null);
  useHoverScale(ref, 1.1);
  return (
    <svg ref={ref} width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={`animated-icon-base ${className}`}>
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );
}

// 19. Warning / Triangle (para danos)
export function IconWarning({ className = '', size = 14 }: IconProps) {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 2 });
    tl.to(el, { scale: 1.12, duration: 0.3, ease: 'power2.out', transformOrigin: '50% 50%' })
      .to(el, { scale: 1, duration: 0.3, ease: 'power2.in' });
    return () => { tl.kill(); };
  }, []);
  return (
    <svg ref={ref} width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={`animated-icon-base ${className}`}
      style={{ transformOrigin: '50% 50%' }}>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

// 20. Pin / Map Pin (para Top Peças)
export function IconPin({ className = '', size = 14 }: IconProps) {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.5, yoyo: true });
    tl.to(el, { y: -2, duration: 0.4, ease: 'sine.inOut' });
    return () => { tl.kill(); };
  }, []);
  return (
    <svg ref={ref} width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={`animated-icon-base ${className}`}>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

// 21. Bolt / Lightning (para Telemetria)
export function IconBolt({ className = '', size = 14 }: IconProps) {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 2 });
    tl.to(el, { opacity: 0.5, duration: 0.08 })
      .to(el, { opacity: 1, duration: 0.08 })
      .to(el, { opacity: 0.6, duration: 0.06 })
      .to(el, { opacity: 1, duration: 0.1 });
    return () => { tl.kill(); };
  }, []);
  return (
    <svg ref={ref} width={size} height={size} viewBox="0 0 24 24" fill="currentColor"
      className={`animated-icon-base ${className}`}>
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}

// 22. Bar Chart Trend (para SLO)
export function IconBarChart({ className = '', size = 14 }: IconProps) {
  const ref = useRef<SVGSVGElement>(null);
  useHoverScale(ref, 1.1);
  return (
    <svg ref={ref} width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={`animated-icon-base ${className}`}>
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

// 23. Trend Up (para Otimizações)
export function IconTrend({ className = '', size = 14 }: IconProps) {
  const ref = useRef<SVGSVGElement>(null);
  useHoverScale(ref, 1.1);
  return (
    <svg ref={ref} width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={`animated-icon-base ${className}`}>
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

// 24. Lightbulb (para dicas de performance)
export function IconBulb({ className = '', size = 14 }: IconProps) {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 3, yoyo: true });
    tl.to(el, { filter: 'drop-shadow(0 0 4px currentColor)', duration: 0.8, ease: 'sine.inOut' });
    return () => { tl.kill(); };
  }, []);
  return (
    <svg ref={ref} width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={`animated-icon-base ${className}`}>
      <line x1="9" y1="18" x2="15" y2="18" />
      <line x1="10" y1="22" x2="14" y2="22" />
      <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
    </svg>
  );
}

// 35. Sync / Refresh (Sincronização)
export function IconSync({ className = '', size = 14 }: IconProps) {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const tl = gsap.to(el, { rotation: 360, duration: 2, repeat: -1, ease: 'none', transformOrigin: '50% 50%' });
    return () => { tl.kill(); };
  }, []);
  return (
    <svg ref={ref} width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={`animated-icon-base ${className}`}
      style={{ transformOrigin: '50% 50%' }}>
      <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
    </svg>
  );
}

// 36. Offline / Signal (Rede Off)
export function IconOffline({ className = '', size = 14 }: IconProps) {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.5, yoyo: true });
    tl.to(el, { opacity: 0.4, duration: 0.5, ease: 'sine.inOut' });
    return () => { tl.kill(); };
  }, []);
  return (
    <svg ref={ref} width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={`animated-icon-base ${className}`}>
      <line x1="1" y1="1" x2="23" y2="23" />
      <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
      <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
      <path d="M10.71 5.05A16 16 0 0 1 22.58 9" />
      <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
      <line x1="12" y1="20" x2="12.01" y2="20" />
    </svg>
  );
}

// 37. Gift / Presente (Teste PRO)
export function IconGift({ className = '', size = 14 }: IconProps) {
  const ref = useRef<SVGSVGElement>(null);
  useHoverScale(ref, 1.15);
  return (
    <svg ref={ref} width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={`animated-icon-base ${className}`}>
      <polyline points="20 12 20 22 4 22 4 12" />
      <rect x="2" y="7" width="20" height="5" />
      <line x1="12" y1="22" x2="12" y2="7" />
      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
    </svg>
  );
}

// 38. Settings / Gear (Configurações de Campos)
export function IconSettings({ className = '', size = 14 }: IconProps) {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      el.addEventListener('mouseenter', () =>
        gsap.to(el, { rotation: 90, duration: 0.35, ease: 'back.out(1.7)', transformOrigin: '50% 50%' })
      );
      el.addEventListener('mouseleave', () =>
        gsap.to(el, { rotation: 0, duration: 0.35, ease: 'power2.out', transformOrigin: '50% 50%' })
      );
    }, el);
    return () => ctx.revert();
  }, []);
  return (
    <svg ref={ref} width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={`animated-icon-base ${className}`}
      style={{ transformOrigin: '50% 50%' }}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

// 39. Globe (Estrangeiro)
export function IconGlobe({ className = '', size = 12 }: IconProps) {
  const ref = useRef<SVGSVGElement>(null);
  useHoverScale(ref, 1.2);
  return (
    <svg ref={ref} width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={`animated-icon-base ${className}`}>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}
