'use client';
import React from 'react';
import Link from 'next/link';
import LandingCtaLink from './LandingCtaLink';
import { buttonVariants } from './ui/Button';
import { trackPixCtaClick } from '@/src/lib/analytics/events';

export default function PlanosFinalCta() {
  return (
    <div className="max-w-md mx-auto mt-16 text-center glass-card p-8">
      <h2 className="text-lg font-bold mb-1.5">Pronto pra testar?</h2>
      <p className="text-sm text-[var(--text-muted)] mb-5">
        7 dias grátis, sem cartão. Cancele quando quiser.
      </p>
      <LandingCtaLink className={buttonVariants({ variant: 'primary', size: 'md', className: 'w-full' })}>
        Testar 7 dias grátis
      </LandingCtaLink>
      <p className="text-center text-[11px] text-[var(--text-muted)] mt-3">
        <Link
          href="/pagamento-pix?duration=1"
          className="font-bold text-[var(--primary)] hover:underline"
          onClick={() => trackPixCtaClick({ source: 'trial_link', duration_months: 1 })}
        >
          Prefere PIX? Pague agora sem cartão
        </Link>
      </p>
    </div>
  );
}
