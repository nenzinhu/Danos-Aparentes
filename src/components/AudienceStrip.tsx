'use client';
import Link from 'next/link';
import LandingCtaLink from './LandingCtaLink';
import Reveal from './Reveal';
import { whatsappLink } from '../lib/whatsapp';

const AUDIENCES = [
  { href: '/locadoras', label: 'Locadoras', hook: 'Cobrar avaria sem briga' },
  { href: '/frotas', label: 'Frotas', hook: 'Padronizar a equipe' },
  { href: '/oficinas', label: 'Oficinas', hook: 'Laudo com sua marca' },
  { href: '/seguradoras', label: 'Seguradoras', hook: 'Prova com hash e QR' },
] as const;

/** Faixa de segmentos — atalho de relevância logo após o hero. */
export default function AudienceStrip() {
  return (
    <section
      aria-label="Para quem é o Danos Aparentes"
      className="w-full max-w-6xl mx-auto px-4 sm:px-6 z-10 relative -mt-2 sm:mt-0"
    >
      <Reveal className="border border-[var(--card-border)] bg-[var(--card-bg)] overflow-hidden">
        <div className="px-4 sm:px-6 py-3 border-b border-[var(--card-border)] flex flex-wrap items-center gap-2">
          <span className="font-mono-data text-[10px] sm:text-[11px] tracking-[0.18em] uppercase text-[var(--signal-bright)]">
            Escolha seu perfil
          </span>
          <span className="text-[11px] text-[var(--text-muted)] hidden sm:inline">
            — veja a dor e o fluxo do seu negócio
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4">
          {AUDIENCES.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex flex-col gap-1 px-4 sm:px-5 py-4 sm:py-5 min-h-[72px] transition-colors hover:bg-[var(--btn-secondary-hover)] focus-visible:ring-2 ring-inset ring-[var(--primary)] outline-none ${
                i % 2 === 0 ? 'border-r border-[var(--card-border)]' : ''
              } ${i < 2 ? 'border-b border-[var(--card-border)] md:border-b-0' : ''} ${
                i < 3 ? 'md:border-r md:border-[var(--card-border)]' : 'md:border-r-0'
              }`}
            >
              <span className="font-display text-sm sm:text-base font-semibold uppercase tracking-tight text-[var(--text-main)] group-hover:text-[var(--primary)] transition-colors">
                {item.label}
              </span>
              <span className="text-[11px] sm:text-xs text-[var(--text-muted)] leading-snug">
                {item.hook}
              </span>
            </Link>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

/** Gancho de prejuízo — linguagem de conversão sem prova social inventada. */
export function LossHookSection() {
  return (
    <section className="w-full max-w-6xl mx-auto py-12 sm:py-16 px-4 sm:px-6 z-10 relative border-t border-[var(--card-border)]/40">
      <Reveal className="grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] gap-8 md:gap-10 items-center">
        <div>
          <div className="inline-flex items-center gap-2 font-mono-data text-[11px] tracking-[0.2em] text-[var(--signal-bright)] uppercase mb-4">
            <span aria-hidden="true" className="w-4 h-px bg-[var(--sheet-line)]" />
            O custo do WhatsApp
            <span aria-hidden="true" className="w-4 h-px bg-[var(--sheet-line)]" />
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-tight leading-[0.95] text-[var(--text-main)] [text-wrap:balance]">
            Uma avaria contestada custa mais que{' '}
            <span className="text-[var(--signal-bright)]">um ano de Pro</span>
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-muted)] mt-4 max-w-xl leading-relaxed">
            Fotos soltas no chat não fecham cobrança. Com diagrama marcado, GPS, assinatura e hash no PDF,
            você prova o que já estava no carro — e o que surgiu na devolução.
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 mt-7">
            <LandingCtaLink
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-black text-white shadow-xl shadow-[var(--primary)]/20 transition-all motion-safe:hover:-translate-y-0.5 focus-visible:ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-[var(--bg-main)] outline-none"
              style={{ backgroundImage: 'var(--primary-btn-gradient)' }}
            >
              Começar teste grátis
            </LandingCtaLink>
            <a
              href={whatsappLink('Olá! Quero entender como o Danos Aparentes evita prejuízo com avaria contestada.')}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold border border-[var(--card-border)] text-[var(--text-main)] hover:border-[var(--sheet-line)] transition-colors focus-visible:ring-2 ring-[var(--primary)] outline-none"
            >
              Falar no WhatsApp
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-1 gap-3">
          {[
            { k: 'R$ 49,90', v: 'Plano Pro / mês', sub: '≈ R$ 1,66 por dia' },
            { k: '7 dias', v: 'Teste sem cartão', sub: 'Cancele online' },
            { k: '1 laudo', v: 'Prova no WhatsApp', sub: 'Hash + QR + SVG' },
          ].map((item) => (
            <div
              key={item.k}
              className="border border-[var(--card-border)] bg-[var(--bg-main)] px-4 py-4 flex sm:flex-col md:flex-row md:items-baseline gap-2 md:gap-4"
            >
              <span className="font-display text-2xl font-bold text-[var(--signal-bright)] tabular-nums shrink-0">
                {item.k}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-[var(--text-main)]">{item.v}</span>
                <span className="block font-mono-data text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                  {item.sub}
                </span>
              </span>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
