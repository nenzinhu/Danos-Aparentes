'use client';
import { useEffect, useRef, type ElementType } from 'react';
import { gsap, prefersReducedMotion } from '../lib/gsap';

const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

interface DecodeTextProps {
  text: string;
  className?: string;
  as?: ElementType;
  /** Seconds of scramble before the text settles. */
  duration?: number;
}

/**
 * Scroll-triggered "decode" effect: scrambles characters and resolves them
 * left-to-right into the final string. Reads well for technical/data-style
 * copy (hashes, codes). Falls back to static text under reduced motion.
 */
export default function DecodeText({ text, className = '', as = 'span', duration = 0.9 }: DecodeTextProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (prefersReducedMotion()) {
      node.textContent = text;
      return;
    }

    const proxy = { progress: 0 };
    const ctx = gsap.context(() => {
      gsap.to(proxy, {
        progress: 1,
        duration,
        ease: 'power1.out',
        scrollTrigger: { trigger: node, start: 'top 90%', once: true },
        onUpdate: () => {
          const revealCount = Math.floor(proxy.progress * text.length);
          node.textContent = text
            .split('')
            .map((char, i) => {
              if (i < revealCount || char === ' ') return char;
              if (!/[a-zA-Z0-9]/.test(char)) return char;
              return CHARSET[Math.floor(Math.random() * CHARSET.length)];
            })
            .join('');
        },
        onComplete: () => {
          node.textContent = text;
        },
      });
    });

    return () => ctx.revert();
  }, [text, duration]);

  const Tag = as;
  return (
    <Tag ref={ref} className={className} aria-label={text}>
      {text}
    </Tag>
  );
}
