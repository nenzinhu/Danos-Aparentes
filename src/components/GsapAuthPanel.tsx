'use client';
import { useEffect, useRef, type ReactNode } from 'react';
import gsap from 'gsap';

interface Props {
  /** Changing this key re-triggers the reveal (e.g. the current auth mode). */
  panelKey: string;
  children: ReactNode;
  className?: string;
}

/**
 * Wraps the auth form body and replays a short fade+slide-in whenever
 * panelKey changes, so switching between login/signup/reset reads as a
 * deliberate transition instead of a jump-cut.
 */
export default function GsapAuthPanel({ panelKey, children, className = '' }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    gsap.fromTo(
      node,
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.35, ease: 'power3.out' }
    );
  }, [panelKey]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
