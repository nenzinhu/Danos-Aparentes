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
 * Line cascade reveal. A11y: sr-only + aria-hidden no visual animado.
 * SplitText é diferido para requestIdleCallback para não causar forced
 * reflow durante o LCP e não bloquear a main thread nas primeiras tasks.
 */
export default function GsapLineCascade({ children, as = 'p', className = '', delay = 0, stagger = 0.12 }: Props) {
  const visualRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const node = visualRef.current;
    if (!node) return;

    let split: InstanceType<typeof SplitText> | null = null;
    let tween: gsap.core.Tween | null = null;
    let idleId: number | null = null;

    const run = () => {
      if (!node.isConnected) return;
      split = new SplitText(node, { type: 'lines', mask: 'lines', linesClass: 'cascade-line' });
      gsap.set(node, { autoAlpha: 1 });

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.set(split.lines, { yPercent: 0, autoAlpha: 1 });
        return;
      }

      tween = gsap.fromTo(
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
    };

    // Defer SplitText layout read to idle time to avoid forced reflow during LCP
    if ('requestIdleCallback' in window) {
      idleId = window.requestIdleCallback(run, { timeout: 2000 });
    } else {
      idleId = setTimeout(run, 200) as unknown as number;
    }

    return () => {
      if (idleId !== null) {
        if ('cancelIdleCallback' in window) window.cancelIdleCallback(idleId);
        else clearTimeout(idleId);
      }
      tween?.kill();
      split?.revert();
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
