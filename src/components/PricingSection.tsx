'use client';
import React from 'react';
import Link from 'next/link';
import Reveal from './Reveal';
import PricingCards from './PricingCards';

export default function PricingSection() {
  return (
    <section id="pricing" className="w-full max-w-5xl mx-auto py-16 px-6 z-10 relative border-t border-[var(--card-border)]/40 mt-12">
      <Reveal className="text-center mb-12 flex flex-col items-center">
        <h2 className="font-display text-4xl lg:text-5xl font-bold uppercase tracking-tight text-[var(--text-main)]">
          Escolha o Plano Ideal
        </h2>
        <p className="text-sm text-[var(--text-muted)] mt-3">
          7 dias grátis, sem cartão. Depois, menos de R$ 1,70 por dia no plano Pro.
        </p>
      </Reveal>

      <PricingCards />

      <p className="text-center text-xs text-[var(--text-muted)] mt-10">
        <Link href="/planos" className="font-bold text-[var(--primary)] hover:underline">
          Ver todos os detalhes e perguntas frequentes sobre os planos →
        </Link>
      </p>
    </section>
  );
}
