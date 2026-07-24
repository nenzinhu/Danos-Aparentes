"use client";
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

type Tag = 'h1' | 'h2' | 'h3' | 'p' | 'span';

interface GsapTextRevealProps {
  children: string;
  as?: Tag;
  className?: string;
  /** Delay before the reveal starts, in ms. */
  delay?: number;
  split?: 'chars' | 'words';
  /** Use ScrollTrigger instead of firing on mount — for below-the-fold text. */
  onScroll?: boolean;
}

/**
 * Reveals text by masking each word/char behind overflow-hidden and
 * sliding it up into place with GSAP. Fires on mount by default (for
 * hero-level text already above the fold); pass `onScroll` for text
 * further down the page.
 */
export default function GsapTextReveal({
  children,
  as = 'span',
  className = '',
  delay = 0,
  split = 'words',
  onScroll = false,
}: GsapTextRevealProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const pieces = node.querySelectorAll<HTMLElement>('[data-split-piece]');

    const mm = gsap.matchMedia();
    mm.add(
      { reduceMotion: '(prefers-reduced-motion: reduce)' },
      (context) => {
        const conditions = context.conditions as { reduceMotion: boolean };
        if (conditions.reduceMotion) {
          gsap.set(pieces, { yPercent: 0, autoAlpha: 1 });
          return;
        }

        gsap.fromTo(
          pieces,
          { yPercent: 110, autoAlpha: 0 },
          {
            yPercent: 0,
            autoAlpha: 1,
            duration: 0.9,
            ease: 'power4.out',
            stagger: 0.045,
            delay: delay / 1000,
            scrollTrigger: onScroll
              ? { trigger: node, start: 'top 85%', toggleActions: 'play none none reverse' }
              : undefined,
          }
        );
      },
      node
    );

    return () => mm.revert();
  }, [delay, split, children, onScroll]);

  const parts = split === 'chars' ? Array.from(children) : children.split(' ');
  const Component = as as React.ElementType;

  return (
    <Component ref={ref} className={className} aria-label={children}>
      {parts.map((part, i) => (
        <span key={i} aria-hidden="true" style={{ display: 'inline-block' }}>
          <span style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'top' }}>
            <span data-split-piece style={{ display: 'inline-block' }}>
              {part}
            </span>
          </span>
          {split === 'words' && i < parts.length - 1 ? ' ' : ''}
        </span>
      ))}
    </Component>
  );
}
