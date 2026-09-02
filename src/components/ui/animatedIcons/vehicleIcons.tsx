'use client';
import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { IconProps, useHoverScale } from './shared';

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
      className={`animated-icon-base ${className}`}>
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
      className={`animated-icon-base ${className}`}>
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
      className={`animated-icon-base ${className}`}
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
      className={`animated-icon-base ${className}`}>
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
      className={`animated-icon-base ${className}`}>
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
      className={`animated-icon-base ${className}`}>
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
      className={`animated-icon-base ${className}`}>
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
      className={`animated-icon-base ${className}`}>
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
      className={`animated-icon-base ${className}`}
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
      className={`animated-icon-base ${className}`}
      style={{ transformOrigin: '50% 50%' }}>
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  );
}
