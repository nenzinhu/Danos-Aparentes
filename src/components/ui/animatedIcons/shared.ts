import type React from 'react';
import { useEffect } from 'react';
import { gsap } from 'gsap';

export interface IconProps {
  className?: string;
  size?: number;
}

export function useHoverScale(ref: React.RefObject<SVGSVGElement | null>, scaleUp = 1.12, scaleDown = 1) {
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
