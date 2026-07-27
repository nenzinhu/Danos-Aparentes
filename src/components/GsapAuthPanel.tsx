'use client';
import { useRef, type ReactNode } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

interface Props {
  /** Changing this key re-triggers the reveal (e.g. the current auth mode). */
  panelKey: string;
  /** Optional direction for slide: signup enters from right, login from left. */
  direction?: 1 | -1;
  children: ReactNode;
  className?: string;
}

/**
 * Wraps the auth form body and replays a directional fade+slide whenever
 * panelKey changes — Entrar ↔ Cadastre-se reads as a deliberate transition.
 */
export default function GsapAuthPanel({
  panelKey,
  direction = 1,
  children,
  className = '',
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const isFirstRender = useRef(true);
  const prevKey = useRef(panelKey);

  useGSAP(
    () => {
      const node = ref.current;
      if (!node) return;

      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (isFirstRender.current) {
        isFirstRender.current = false;
        prevKey.current = panelKey;
        if (reduced) return;
        // Soft mount for the email/password panel on first paint.
        gsap.fromTo(
          node,
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out', delay: 0.05 }
        );
        return;
      }

      if (prevKey.current === panelKey) return;
      prevKey.current = panelKey;

      if (reduced) return;

      const fromX = direction * 28;
      gsap.fromTo(
        node,
        { opacity: 0, x: fromX, y: 8 },
        { opacity: 1, x: 0, y: 0, duration: 0.4, ease: 'power3.out' }
      );
    },
    { dependencies: [panelKey, direction], scope: ref, revertOnUpdate: false }
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
