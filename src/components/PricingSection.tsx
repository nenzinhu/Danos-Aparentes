'use client';
import React, { useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import PricingCards from './PricingCards';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * Cabeçalho da seção de planos — direto, sem tabela comparativa poluída.
 */
export default function PricingSection() {
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const mm = gsap.matchMedia();
      const sub = root.querySelector<HTMLElement>('.pricing-sub');

      mm.add('(prefers-reduced-motion: reduce)', () => {
        if (sub) gsap.set(sub, { autoAlpha: 1, y: 0 });
      });

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        if (sub) gsap.set(sub, { autoAlpha: 0, y: 12 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root,
            start: 'top 80%',
            once: true,
          },
          defaults: { ease: 'power3.out' },
        });

        if (sub) {
          tl.to(sub, { autoAlpha: 1, y: 0, duration: 0.45 }, 0);
        }
      });

      return () => mm.revert();
    },
    { scope: rootRef },
  );

  return (
    <section
      ref={rootRef}
      id="pricing"
      className="w-full max-w-6xl mx-auto py-16 px-6 z-10 relative border-t border-[var(--card-border)]/40 mt-8"
    >
      <div className="text-center mb-10 flex flex-col items-center">
        <h2 className="pricing-title font-display text-3xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-tight text-[var(--text-main)] [text-wrap:balance]">
          Planos simples para o tamanho da sua operação
        </h2>
        <p className="pricing-sub text-sm sm:text-base text-[var(--text-muted)] mt-4 max-w-xl leading-relaxed">
          7 dias grátis, sem cartão. Escolha o plano e comece a proteger sua frota hoje.
        </p>
      </div>

      <PricingCards salesViaChat />

      <p className="text-center text-xs text-[var(--text-muted)] mt-10">
        <Link href="/planos" className="font-bold text-[var(--primary)] hover:underline">
          Ver detalhes completos dos planos →
        </Link>
      </p>
    </section>
  );
}
