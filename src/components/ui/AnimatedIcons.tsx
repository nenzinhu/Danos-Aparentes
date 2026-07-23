'use client';
import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

interface IconProps {
  className?: string;
  size?: number;
}

// ─── helpers ────────────────────────────────────────────────────────────────

function useHoverScale(ref: React.RefObject<SVGSVGElement | null>, scaleUp = 1.12, scaleDown = 1) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      el.addEventListener('mouseenter', () => gsap.to(el, { scale: scaleUp, duration: 0.22, ease: 'power2.out' }));
      el.addEventListener('mouseleave', () => gsap.to(el, { scale: scaleDown, duration: 0.22, ease: 'power2.out' }));
    }, el);
    return () => ctx.revert();
  }, [ref, scaleUp, scaleDown]);
}

// ─── 1. Sun / Moon Toggle ───────────────────────────────────────────────────

export function IconSunMoon({ isDark, className = '', size = 20 }: IconProps & { isDark: boolean }) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(el,
        { rotation: isDark ? 0 : 180, scale: 0.85 },
        { rotation: isDark ? 180 : 0, scale: 1, duration: 0.45, ease: 'expo.out' }
      );
      gsap.fromTo('[data-icon-path]', { opacity: 0 }, { opacity: 1, duration: 0.3 });
    }, el);
    return () => ctx.revert();
  }, [isDark]);

  return (
    <svg
      ref={ref}
      width={size} height={size}
      viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"
      className={className}
      style={{ display: 'inline-block', transformOrigin: '50% 50%' }}
    >
      {isDark ? (
        <path data-icon-path="" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="currentColor" />
      ) : (
        <>
          <circle cx="12" cy="12" r="5" fill="currentColor" />
          <path data-icon-path=""
            d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
            style={{ transformOrigin: '12px 12px' }}
          />
        </>
      )}
    </svg>
  );
}

// ─── 2. Camera ──────────────────────────────────────────────────────────────

export function IconCamera({ className = '', size = 18 }: IconProps) {
  const ref = useRef<SVGSVGElement>(null);
  const lensRef = useRef<SVGCircleElement>(null);
  useHoverScale(ref, 1.12);

  useEffect(() => {
    const lens = lensRef.current;
    if (!lens) return;
    const tl = gsap.timeline({ repeat: -1, yoyo: true, repeatDelay: 0.5 });
    tl.to(lens, { scale: 1.1, duration: 1.2, ease: 'sine.inOut', transformOrigin: '12px 13px' });
    return () => { tl.kill(); };
  }, []);

  return (
    <svg ref={ref} width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={`inline-block ${className}`}>
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle ref={lensRef} cx="12" cy="13" r="4" />
    </svg>
  );
}

// ─── 3. Gallery ─────────────────────────────────────────────────────────────

export function IconGallery({ className = '', size = 18 }: IconProps) {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      el.addEventListener('mouseenter', () => gsap.to(el, { scale: 1.1, y: -1, duration: 0.22, ease: 'power2.out' }));
      el.addEventListener('mouseleave', () => gsap.to(el, { scale: 1, y: 0, duration: 0.22, ease: 'power2.out' }));
    }, el);
    return () => ctx.revert();
  }, []);
  return (
    <svg ref={ref} width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={`inline-block ${className}`}>
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}

// ─── 4. Check ───────────────────────────────────────────────────────────────

export function IconCheck({ className = '', size = 18 }: IconProps) {
  const ref = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPolylineElement>(null);
  useEffect(() => {
    const el = ref.current;
    const path = pathRef.current;
    if (!el || !path) return;
    const len = (path as unknown as SVGGeometryElement).getTotalLength?.() ?? 30;
    gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
    const ctx = gsap.context(() => {
      gsap.fromTo(el, { scale: 0.8 }, { scale: 1, duration: 0.35, ease: 'back.out(1.7)' });
      gsap.to(path, { strokeDashoffset: 0, duration: 0.4, ease: 'power2.out', delay: 0.05 });
    }, el);
    return () => ctx.revert();
  }, []);
  return (
    <svg ref={ref} width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
      className={`inline-block ${className}`}>
      <polyline ref={pathRef} points="20 6 9 17 4 12" />
    </svg>
  );
}

// ─── 5. Eraser ──────────────────────────────────────────────────────────────

export function IconEraser({ className = '', size = 18 }: IconProps) {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      el.addEventListener('mouseenter', () =>
        gsap.to(el, { rotation: -12, scale: 1.1, duration: 0.15, ease: 'power2.out',
          onComplete: () => gsap.to(el, { rotation: 12, duration: 0.12, yoyo: true, repeat: 1,
            onComplete: () => gsap.to(el, { rotation: 0, scale: 1, duration: 0.12 }) }) }));
    }, el);
    return () => ctx.revert();
  }, []);
  return (
    <svg ref={ref} width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={`inline-block ${className}`}
      style={{ transformOrigin: '50% 50%' }}>
      <path d="M20 20H7L3 16C2.5 15.5 2.5 14.5 3 14L13 4C13.5 3.5 14.5 3.5 15 4L21 10C21.5 10.5 21.5 11.5 21 12L13 20" />
      <path d="M18 13L11 6" />
    </svg>
  );
}

// ─── 6. Team / Users ────────────────────────────────────────────────────────

export function IconTeam({ className = '', size = 18 }: IconProps) {
  const ref = useRef<SVGSVGElement>(null);
  useHoverScale(ref, 1.1);
  return (
    <svg ref={ref} width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={`inline-block ${className}`}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

// ─── 7. Document / PDF ──────────────────────────────────────────────────────

export function IconDocument({ className = '', size = 18 }: IconProps) {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      el.addEventListener('mouseenter', () => gsap.to(el, { y: -2, scale: 1.05, duration: 0.22, ease: 'power2.out' }));
      el.addEventListener('mouseleave', () => gsap.to(el, { y: 0, scale: 1, duration: 0.22, ease: 'power2.out' }));
    }, el);
    return () => ctx.revert();
  }, []);
  return (
    <svg ref={ref} width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={`inline-block ${className}`}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  );
}

// ─── 8. Shield Check ────────────────────────────────────────────────────────

export function IconShieldCheck({ className = '', size = 20 }: IconProps) {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      el.addEventListener('mouseenter', () =>
        gsap.timeline()
          .to(el, { scale: 1.1, duration: 0.12, ease: 'power2.out' })
          .to(el, { rotation: -5, duration: 0.08 })
          .to(el, { rotation: 5, duration: 0.08 })
          .to(el, { rotation: 0, scale: 1, duration: 0.12 })
      );
    }, el);
    return () => ctx.revert();
  }, []);
  return (
    <svg ref={ref} width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={`inline-block ${className}`}
      style={{ transformOrigin: '50% 50%' }}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

// ─── 9. Signature / Pen ─────────────────────────────────────────────────────

export function IconSignature({ className = '', size = 20 }: IconProps) {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      el.addEventListener('mouseenter', () =>
        gsap.timeline()
          .to(el, { rotation: -5, x: 0, duration: 0.1 })
          .to(el, { rotation: 5, x: 2, duration: 0.1 })
          .to(el, { rotation: 0, x: 0, duration: 0.1 })
      );
    }, el);
    return () => ctx.revert();
  }, []);
  return (
    <svg ref={ref} width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={`inline-block ${className}`}
      style={{ transformOrigin: '50% 50%' }}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  );
}

// ─── 10. GPS / Location ─────────────────────────────────────────────────────

export function IconGps({ className = '', size = 20 }: IconProps) {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      el.addEventListener('mouseenter', () =>
        gsap.timeline()
          .to(el, { scale: 1.15, y: -3, duration: 0.25, ease: 'back.out(2)' })
          .to(el, { y: -1, duration: 0.15, ease: 'bounce.out' })
      );
      el.addEventListener('mouseleave', () => gsap.to(el, { scale: 1, y: 0, duration: 0.2, ease: 'power2.out' }));
    }, el);
    return () => ctx.revert();
  }, []);
  return (
    <svg ref={ref} width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={`inline-block ${className}`}>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

// ─── 11. Car / Vehicle ──────────────────────────────────────────────────────

export function IconCar({ className = '', size = 20 }: IconProps) {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      el.addEventListener('mouseenter', () =>
        gsap.timeline()
          .to(el, { x: 4, duration: 0.12, ease: 'power2.out' })
          .to(el, { x: 0, duration: 0.2, ease: 'power2.in' })
      );
    }, el);
    return () => ctx.revert();
  }, []);
  return (
    <svg ref={ref} width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={`inline-block ${className}`}>
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 1 12.5V16c0 .6.4 1 1 1h2" />
      <circle cx="7" cy="17" r="2" />
      <path d="M9 17h6" />
      <circle cx="17" cy="17" r="2" />
    </svg>
  );
}

// ─── 12. Sparkles ───────────────────────────────────────────────────────────

export function IconSparkles({ className = '', size = 18 }: IconProps) {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const tl = gsap.timeline({ repeat: -1, yoyo: true });
    tl.to(el, { scale: 1.15, rotation: 10, duration: 1.25, ease: 'sine.inOut',
      transformOrigin: '50% 50%' });
    return () => { tl.kill(); };
  }, []);
  return (
    <svg ref={ref} width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={`inline-block ${className}`}
      style={{ transformOrigin: '50% 50%' }}>
      <path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z" />
    </svg>
  );
}

// ─── 13. Arrow Left ─────────────────────────────────────────────────────────

export function IconArrowLeft({ className = '', size = 18 }: IconProps) {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      el.addEventListener('mouseenter', () => gsap.to(el, { x: -3, duration: 0.2, ease: 'power2.out' }));
      el.addEventListener('mouseleave', () => gsap.to(el, { x: 0, duration: 0.2, ease: 'power2.out' }));
    }, el);
    return () => ctx.revert();
  }, []);
  return (
    <svg ref={ref} width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      className={`inline-block ${className}`}>
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

// ─── 14. Arrow Right ────────────────────────────────────────────────────────

export function IconArrowRight({ className = '', size = 18 }: IconProps) {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      el.addEventListener('mouseenter', () => gsap.to(el, { x: 3, duration: 0.2, ease: 'power2.out' }));
      el.addEventListener('mouseleave', () => gsap.to(el, { x: 0, duration: 0.2, ease: 'power2.out' }));
    }, el);
    return () => ctx.revert();
  }, []);
  return (
    <svg ref={ref} width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      className={`inline-block ${className}`}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

// ─── 15. Tag / Label ────────────────────────────────────────────────────────

export function IconTag({ className = '', size = 16 }: IconProps) {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      el.addEventListener('mouseenter', () => gsap.to(el, { rotation: 15, scale: 1.1, duration: 0.2, ease: 'back.out(2)', transformOrigin: '50% 50%' }));
      el.addEventListener('mouseleave', () => gsap.to(el, { rotation: 0, scale: 1, duration: 0.2, ease: 'power2.out' }));
    }, el);
    return () => ctx.revert();
  }, []);
  return (
    <svg ref={ref} width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={`inline-block ${className}`}
      style={{ transformOrigin: '50% 50%' }}>
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  );
}

// ─── 16. Search / Magnifier ─────────────────────────────────────────────────

export function IconSearch({ className = '', size = 18 }: IconProps) {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      el.addEventListener('mouseenter', () => gsap.to(el, { scale: 1.15, rotation: 10, duration: 0.22, ease: 'back.out(2)', transformOrigin: '50% 50%' }));
      el.addEventListener('mouseleave', () => gsap.to(el, { scale: 1, rotation: 0, duration: 0.22, ease: 'power2.out' }));
    }, el);
    return () => ctx.revert();
  }, []);
  return (
    <svg ref={ref} width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={`inline-block ${className}`}
      style={{ transformOrigin: '50% 50%' }}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

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
      className={`inline-block ${className}`}>
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
      className={`inline-block ${className}`}>
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
      className={`inline-block ${className}`}
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
      className={`inline-block ${className}`}>
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
      className={`inline-block ${className}`}>
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
      className={`inline-block ${className}`}>
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
      className={`inline-block ${className}`}>
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
      className={`inline-block ${className}`}>
      <line x1="9" y1="18" x2="15" y2="18" />
      <line x1="10" y1="22" x2="14" y2="22" />
      <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
    </svg>
  );
}
// ─── ÍCONES DE VEÍCULOS (VEHICLE TYPES) ──────────────────────────────────────

// 25. Carro 4P (Car)
export function IconVehicleCar({ className = '', size = 20 }: IconProps) {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      el.addEventListener('mouseenter', () =>
        gsap.timeline()
          .to(el, { x: 3, duration: 0.12, ease: 'power1.out' })
          .to(el, { x: 0, duration: 0.18, ease: 'power1.in' })
      );
    }, el);
    return () => ctx.revert();
  }, []);
  return (
    <svg ref={ref} width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={`inline-block ${className}`}>
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 1 12.5V16c0 .6.4 1 1 1h2" />
      <circle cx="7" cy="17" r="2" />
      <path d="M9 17h6" />
      <circle cx="17" cy="17" r="2" />
    </svg>
  );
}

// 26. Carro 2P / Coupe (Car2d)
export function IconVehicleCar2d({ className = '', size = 20 }: IconProps) {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      el.addEventListener('mouseenter', () =>
        gsap.timeline()
          .to(el, { x: 3, duration: 0.12, ease: 'power1.out' })
          .to(el, { x: 0, duration: 0.18, ease: 'power1.in' })
      );
    }, el);
    return () => ctx.revert();
  }, []);
  return (
    <svg ref={ref} width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={`inline-block ${className}`}>
      <path d="M5 17h14M3 13l1.5-4.5A2 2 0 0 1 6.4 7h11.2a2 2 0 0 1 1.9 1.5L21 13v3a1 1 0 0 1-1 1h-1M4 17h-1a1 1 0 0 1-1-1v-3" />
      <circle cx="7.5" cy="16.5" r="2" />
      <circle cx="16.5" cy="16.5" r="2" />
      <path d="M12 7v6M7 13h10" />
    </svg>
  );
}

// 27. Moto (Moto)
export function IconVehicleMoto({ className = '', size = 20 }: IconProps) {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      el.addEventListener('mouseenter', () =>
        gsap.timeline()
          .to(el, { rotation: -6, duration: 0.1, ease: 'power1.out', transformOrigin: '50% 100%' })
          .to(el, { rotation: 4, duration: 0.1, ease: 'power1.inOut' })
          .to(el, { rotation: 0, duration: 0.12, ease: 'power1.in' })
      );
    }, el);
    return () => ctx.revert();
  }, []);
  return (
    <svg ref={ref} width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={`inline-block ${className}`}
      style={{ transformOrigin: '50% 100%' }}>
      <circle cx="5" cy="16" r="3" />
      <circle cx="19" cy="16" r="3" />
      <path d="M12 16h4l2-6h-3l-2 3h-3l-1-4h-4" />
      <path d="M9 9l3-4h3" />
    </svg>
  );
}

// 28. Caminhão (Truck)
export function IconVehicleTruck({ className = '', size = 20 }: IconProps) {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      el.addEventListener('mouseenter', () =>
        gsap.timeline()
          .to(el, { x: 3, duration: 0.12, ease: 'power1.out' })
          .to(el, { x: 0, duration: 0.18, ease: 'power1.in' })
      );
    }, el);
    return () => ctx.revert();
  }, []);
  return (
    <svg ref={ref} width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={`inline-block ${className}`}>
      <rect x="1" y="3" width="14" height="13" rx="1" />
      <path d="M15 8h4l3 3v5h-7V8z" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}

// 29. Utilitário / Van (Van)
export function IconVehicleVan({ className = '', size = 20 }: IconProps) {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      el.addEventListener('mouseenter', () =>
        gsap.timeline()
          .to(el, { x: 3, duration: 0.12, ease: 'power1.out' })
          .to(el, { x: 0, duration: 0.18, ease: 'power1.in' })
      );
    }, el);
    return () => ctx.revert();
  }, []);
  return (
    <svg ref={ref} width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={`inline-block ${className}`}>
      <path d="M3 6h11a2 2 0 0 1 2 2v8H3V6z" />
      <path d="M16 8h3l3 3v5h-6V8z" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="18" cy="18" r="2" />
      <line x1="10" y1="9" x2="13" y2="9" />
    </svg>
  );
}

// 30. Ônibus (Bus)
export function IconVehicleBus({ className = '', size = 20 }: IconProps) {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      el.addEventListener('mouseenter', () =>
        gsap.timeline()
          .to(el, { y: -2, duration: 0.12, ease: 'power1.out' })
          .to(el, { y: 0, duration: 0.18, ease: 'power1.in' })
      );
    }, el);
    return () => ctx.revert();
  }, []);
  return (
    <svg ref={ref} width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={`inline-block ${className}`}>
      <rect x="4" y="3" width="16" height="15" rx="2" />
      <line x1="4" y1="11" x2="20" y2="11" />
      <line x1="12" y1="3" x2="12" y2="11" />
      <circle cx="7.5" cy="18.5" r="1.5" />
      <circle cx="16.5" cy="18.5" r="1.5" />
      <path d="M6 21v1M18 21v1" />
    </svg>
  );
}

// 31. Micro-ônibus (Microbus)
export function IconVehicleMicrobus({ className = '', size = 20 }: IconProps) {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      el.addEventListener('mouseenter', () =>
        gsap.timeline()
          .to(el, { x: 3, duration: 0.12, ease: 'power1.out' })
          .to(el, { x: 0, duration: 0.18, ease: 'power1.in' })
      );
    }, el);
    return () => ctx.revert();
  }, []);
  return (
    <svg ref={ref} width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={`inline-block ${className}`}>
      <path d="M2 6a2 2 0 0 1 2-2h12a3 3 0 0 1 3 3v9H2V6z" />
      <circle cx="6" cy="18" r="2" />
      <circle cx="15" cy="18" r="2" />
      <line x1="5" y1="8" x2="9" y2="8" />
      <line x1="11" y1="8" x2="15" y2="8" />
    </svg>
  );
}

// ─── ÍCONES DE DANOS (DAMAGE TYPES) ──────────────────────────────────────────

// 32. Damage Scratch (Lápis / Risco)
export function IconDamageScratch({ className = '', size = 14 }: IconProps) {
  const ref = useRef<SVGSVGElement>(null);
  useHoverScale(ref, 1.15);
  return (
    <svg ref={ref} width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={`inline-block ${className}`}>
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </svg>
  );
}

// 33. Damage Dent (Martelo / Amassado)
export function IconDamageDent({ className = '', size = 14 }: IconProps) {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      el.addEventListener('mouseenter', () =>
        gsap.timeline()
          .to(el, { rotation: -20, duration: 0.1, transformOrigin: '100% 100%' })
          .to(el, { rotation: 10, duration: 0.08 })
          .to(el, { rotation: 0, duration: 0.1 })
      );
    }, el);
    return () => ctx.revert();
  }, []);
  return (
    <svg ref={ref} width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={`inline-block ${className}`}
      style={{ transformOrigin: '100% 100%' }}>
      <path d="M15 12l-8.5 8.5a2.121 2.121 0 0 1-3-3L12 9" />
      <path d="M17.64 3.64a2 2 0 0 1 2.83 0l.89.89a2 2 0 0 1 0 2.83L17.5 11.23l-4.73-4.73 4.87-2.86z" />
    </svg>
  );
}

// 34. Damage Broken (Fratura / Quebrado)
export function IconDamageBroken({ className = '', size = 14 }: IconProps) {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      el.addEventListener('mouseenter', () =>
        gsap.timeline()
          .to(el, { scale: 1.2, duration: 0.08, ease: 'power1.out', transformOrigin: '50% 50%' })
          .to(el, { scale: 1, duration: 0.15, ease: 'bounce.out' })
      );
    }, el);
    return () => ctx.revert();
  }, []);
  return (
    <svg ref={ref} width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={`inline-block ${className}`}
      style={{ transformOrigin: '50% 50%' }}>
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  );
}
