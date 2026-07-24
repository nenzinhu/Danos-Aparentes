'use client';
import { useEffect, useRef, type ReactNode } from 'react';
import { gsap, prefersReducedMotion } from '../lib/gsap';

/**
 * Scroll-scrubbed parallax on the hero car: drifts up and rotates a touch
 * as the hero leaves the viewport, adding depth without touching the
 * Framer Motion entrance stagger that lives on the children.
 */
export default function HeroCarParallax({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.to(node, {
        y: -28,
        rotation: -1.1,
        ease: 'none',
        scrollTrigger: {
          trigger: node,
          start: 'top center',
          end: 'bottom top',
          scrub: 0.6,
        },
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
