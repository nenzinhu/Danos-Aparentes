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
 * Line cascade reveal. A11y: sr-only + aria-hidden no visual animado
 * (sem aria-label em <p>).
 */
export default function GsapLineCascade({ children, as = 'p', className = '', delay = 0, stagger = 0.12 }: Props) {
  const visualRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const node = visualRef.current;
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
    <Component className={className}>
      <span className="sr-only">{children}</span>
      <span ref={visualRef} aria-hidden="true" style={{ visibility: 'hidden', display: 'block' }}>
        {children}
      </span>
    </Component>
  );
}
