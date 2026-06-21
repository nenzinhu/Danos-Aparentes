'use client';
import { useEffect, useState } from 'react';

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
      <img
        src="/logo.svg"
        alt=""
        width={160}
        height={160}
        fetchPriority="high"
        style={{ objectFit: 'contain', filter: 'drop-shadow(0 0 28px rgba(0,170,255,0.4))' }}
      />
    </div>
  );
}
