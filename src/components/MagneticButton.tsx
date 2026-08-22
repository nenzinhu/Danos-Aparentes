'use client';
import { useEffect, useRef, type ReactNode } from 'react';
import { gsap, prefersReducedMotion } from '../lib/gsap';

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  /** Fraction of cursor offset the element travels (0–1). */
  strength?: number;
}

/**
 * Wraps a CTA so it drifts slightly toward the cursor on hover, snapping
 * back on leave. Skipped on touch/coarse pointers and reduced motion —
 * it's a hover embellishment, not a functional affordance.
 */
export default function MagneticButton({ children, className = 'inline-block', strength = 0.3 }: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (prefersReducedMotion() || window.matchMedia('(pointer: coarse)').matches) return;

    const xTo = gsap.quickTo(node, 'x', { duration: 0.4, ease: 'power3.out' });
    const yTo = gsap.quickTo(node, 'y', { duration: 0.4, ease: 'power3.out' });

    const handleMove = (e: PointerEvent) => {
      const rect = node.getBoundingClientRect();
      const relX = e.clientX - (rect.left + rect.width / 2);
      const relY = e.clientY - (rect.top + rect.height / 2);
      xTo(relX * strength);
      yTo(relY * strength);
    };
    const handleLeave = () => {
      xTo(0);
      yTo(0);
    };

    node.addEventListener('pointermove', handleMove);
    node.addEventListener('pointerleave', handleLeave);
    return () => {
      node.removeEventListener('pointermove', handleMove);
      node.removeEventListener('pointerleave', handleLeave);
    };
  }, [strength]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
