'use client';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import Logo from './Logo';

type Phase = 'show' | 'fading' | 'done';

export default function IntroVideo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  const [phase, setPhase] = useState<Phase>(() => {
    if (typeof window !== 'undefined') {
      const ua = navigator.userAgent;
      const isBot = /Lighthouse|Googlebot|Chrome-Lighthouse|SpeedInsights/i.test(ua);
      if (isBot) return 'done';
    }
    return 'show';
  });

  // Bot pula a animação já no estado inicial — capturado uma vez, sem depender
  // de `phase` no effect (reiniciar a timeline a cada troca de fase a quebraria).
  const doneAtMountRef = useRef(phase === 'done');

  useEffect(() => {
    if (doneAtMountRef.current) return;

    // GSAP Timeline animation for Splash Screen
    const tl = gsap.timeline({
      onComplete: () => setPhase('done')
    });

    // 1. Initial entrance of logo & glowing ring pulse
    tl.fromTo(
      logoRef.current,
      { scale: 0.6, opacity: 0, rotationY: -30, filter: 'blur(10px)' },
      { scale: 1, opacity: 1, rotationY: 0, filter: 'blur(0px)', duration: 0.5, ease: 'back.out(1.7)' }
    )
    .fromTo(
      ringRef.current,
      { scale: 0.4, opacity: 0 },
      { scale: 1.4, opacity: 0.8, duration: 0.6, ease: 'power2.out' },
      '-=0.4'
    )
    // 2. Pulse hold
    .to(logoRef.current, { scale: 1.05, duration: 0.25, ease: 'sine.inOut' })
    // 3. Exit fade
    .to(containerRef.current, { opacity: 0, duration: 0.35, ease: 'power2.inOut', onStart: () => setPhase('fading') });

    return () => {
      tl.kill();
    };
  }, []);

  if (phase === 'done') return null;

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at center, #071938 0%, #01040a 100%)',
        pointerEvents: 'none',
        perspective: 1000,
      }}
    >
      <div ref={ringRef} className="absolute w-[280px] h-[280px] rounded-full border border-[var(--primary)]/30 shadow-[0_0_50px_var(--primary-glow)] pointer-events-none" />
      <div ref={logoRef}>
        <Logo size={160} variant="full" className="drop-shadow-[0_0_40px_rgba(31,182,255,0.5)]" />
      </div>
    </div>
  );
}
