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
  /** Delay before the reveal starts, in ms — lets the title's own reveal lead. */
  delay?: number;
}

/**
 * Splits the subline into chars with GSAP's SplitText and plays it in right
 * after the headline settles — reads as the headline "handing off" to this
 * line rather than everything landing on the page at once.
 */
export default function GsapSplitSubline({ children, as = 'p', className = '', delay = 600 }: Props) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const split = new SplitText(node, { type: 'chars,words', charsClass: 'split-char' });
    gsap.set(node, { autoAlpha: 1 });

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(split.chars, { yPercent: 0, autoAlpha: 1 });
      return () => split.revert();
    }

    const tween = gsap.fromTo(
      split.chars,
      { yPercent: 130, autoAlpha: 0, rotateX: -60 },
      {
        yPercent: 0,
        autoAlpha: 1,
        rotateX: 0,
        duration: 0.6,
        ease: 'back.out(1.7)',
        stagger: 0.018,
        delay: delay / 1000,
      }
    );

    return () => {
      tween.kill();
      split.revert();
    };
  }, [children, delay]);

  const Component = as as React.ElementType;

  return (
    <Component
      ref={ref}
      className={className}
      style={{ visibility: 'hidden', perspective: 400 }}
    >
      {children}
    </Component>
  );
}
