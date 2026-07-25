'use client';
import React, { useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import PricingCards from './PricingCards';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * Cabeçalho da seção de planos com GSAP nos textos:
 * título palavra a palavra + destaques no subtítulo (7 dias grátis, R$ 1,70, Pro).
 */
export default function PricingSection() {
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const mm = gsap.matchMedia();
      const words = root.querySelectorAll<HTMLElement>('.pricing-title-word');
      const marks = root.querySelectorAll<HTMLElement>('.pricing-mark');
      const sub = root.querySelector<HTMLElement>('.pricing-sub');

      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set(words, { yPercent: 0, autoAlpha: 1 });
        gsap.set(marks, { autoAlpha: 1, y: 0, scale: 1 });
        if (sub) gsap.set(sub, { autoAlpha: 1, y: 0 });
      });

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.set(words, { yPercent: 110, autoAlpha: 0 });
        gsap.set(marks, { autoAlpha: 0, y: 10, scale: 0.94 });
        if (sub) gsap.set(sub, { autoAlpha: 0, y: 12 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root,
            start: 'top 80%',
            once: true,
          },
          defaults: { ease: 'power3.out' },
        });

        tl.to(words, {
          yPercent: 0,
          autoAlpha: 1,
          duration: 0.7,
          stagger: 0.05,
          ease: 'power4.out',
        });

        if (sub) {
          tl.to(sub, { autoAlpha: 1, y: 0, duration: 0.45 }, 0.35);
        }

        tl.to(
          marks,
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.5,
            stagger: 0.12,
            ease: 'back.out(1.6)',
          },
          0.45,
        );

        // Pulso suave nos destaques de valor
        marks.forEach((el, i) => {
          gsap.to(el, {
            textShadow: '0 0 18px color-mix(in srgb, var(--primary) 45%, transparent)',
            duration: 1.4,
            delay: 1.2 + i * 0.15,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
          });
        });
      });

      return () => mm.revert();
    },
    { scope: rootRef },
  );

  const titleWords = ['Planos', 'de', 'vistoria', 'veicular', 'digital'];

  return (
    <section
      ref={rootRef}
      id="pricing"
      className="w-full max-w-5xl mx-auto py-16 px-6 z-10 relative border-t border-[var(--card-border)]/40 mt-12"
    >
      <div className="text-center mb-12 flex flex-col items-center">
        <h2 className="font-display text-4xl lg:text-5xl font-bold uppercase tracking-tight text-[var(--text-main)]">
          <span className="inline-flex flex-wrap justify-center gap-x-[0.28em] overflow-hidden">
            {titleWords.map((word) => (
              <span key={word} className="pricing-title-word inline-block">
                {word === 'digital' ? (
                  <span className="text-[var(--signal-bright)]">{word}</span>
                ) : (
                  word
                )}
              </span>
            ))}
          </span>
        </h2>
        <p className="pricing-sub text-sm sm:text-base text-[var(--text-muted)] mt-4 max-w-xl leading-relaxed">
          <span className="pricing-mark inline-block font-extrabold text-[var(--signal-bright)]">
            7 dias grátis
          </span>
          , sem cartão. Depois,{' '}
          <span className="pricing-mark inline-block font-extrabold text-[var(--primary)]">
            menos de R$&nbsp;1,70 por dia
          </span>{' '}
          no plano{' '}
          <span className="pricing-mark inline-block font-black text-[var(--text-main)] underline decoration-[var(--primary)] decoration-2 underline-offset-4">
            Pro
          </span>
          .
        </p>
      </div>

      <PricingCards />

      <p className="text-center text-xs text-[var(--text-muted)] mt-10">
        <Link href="/planos" className="font-bold text-[var(--primary)] hover:underline">
          Ver todos os detalhes e perguntas frequentes sobre os planos →
        </Link>
      </p>
    </section>
  );
}
