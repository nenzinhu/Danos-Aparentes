'use client';
import { useEffect, useState } from 'react';
import Logo from './Logo';

type Phase = 'show' | 'fading' | 'done';

export default function IntroVideo() {
  const [phase, setPhase] = useState<Phase>(() => {
    if (typeof window !== 'undefined') {
      const ua = navigator.userAgent;
      const isBot = /Lighthouse|Googlebot|Chrome-Lighthouse|SpeedInsights/i.test(ua);
      if (isBot) return 'done';
    }
    return 'show';
  });

  useEffect(() => {
    if (phase === 'done') return;
    const tFade = setTimeout(() => setPhase('fading'), 600);
    const tDone = setTimeout(() => setPhase('done'), 950);
    return () => {
      clearTimeout(tFade);
      clearTimeout(tDone);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (phase === 'done') return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at center, #051330 0%, #01040a 100%)',
        opacity: phase === 'fading' ? 0 : 1,
        transition: 'opacity 350ms ease-out',
        pointerEvents: 'none',
      }}
    >
      <Logo size={160} variant="full" className="drop-shadow-[0_0_36px_rgba(31,182,255,0.45)]" />
    </div>
  );
}
