'use client';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(SplitText);
}

type Tag = 'p' | 'span' | 'div' | 'h2' | 'h3';

interface Props {
  children: string;
  as?: Tag;
  className?: string;
  /** Delay before the cascade starts, in ms. */
  delay?: number;
  /** Gap between each line's start, in seconds. */
  stagger?: number;
}

/**
 * Splits text into lines with GSAP's SplitText (masked per line) and drops
 * them in top-to-bottom, one after another — a waterfall/cascade reveal
 * instead of a single fade. Line breaks come from the actual rendered
 * layout, so it stays correct across breakpoints.
 */
export default function GsapLineCascade({ children, as = 'p', className = '', delay = 0, stagger = 0.12 }: Props) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const split = new SplitText(node, { type: 'lines', mask: 'lines', linesClass: 'cascade-line' });
    gsap.set(node, { autoAlpha: 1 });

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(split.lines, { yPercent: 0, autoAlpha: 1 });
      return () => split.revert();
    }

    const tween = gsap.fromTo(
      split.lines,
      { yPercent: 100, autoAlpha: 0 },
      {
        yPercent: 0,
        autoAlpha: 1,
        duration: 0.7,
        ease: 'power3.out',
        stagger,
        delay: delay / 1000,
      }
    );

    return () => {
      tween.kill();
      split.revert();
    };
  }, [children, delay, stagger]);

  const Component = as as React.ElementType;

  return (
    <Component ref={ref} className={className} style={{ visibility: 'hidden' }}>
      {children}
    </Component>
  );
}
