'use client';
import { useEffect, useRef } from 'react';
import { animate, stagger, onScroll } from 'animejs';
import Reveal from './Reveal';
import { LEGAL_CONTACT_EMAIL } from './LegalContent';

const TRUST_ITEMS = [
  {
    k: 'Integridade',
    title: 'Hash SHA-256 em cada laudo',
    desc: 'Todo PDF gerado carrega um código único de verificação. Qualquer alteração no documento após a emissão invalida o hash — o laudo comprova a si mesmo.',
  },
  {
    k: 'Autenticação',
    title: 'Assinatura digital na tela',
    desc: 'Vistoriador e cliente assinam com o dedo, no próprio celular, no momento da vistoria. Sem impressão, sem "assino depois".',
  },
  {
    k: 'Rastreabilidade',
    title: 'Fotos com GPS e timestamp',
    desc: 'Cada foto anexada guarda local e horário de captura, reforçando que o registro foi feito no pátio, na hora da vistoria.',
  },
];

export default function TrustSection() {
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = cardsRef.current;
    if (!container) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const cards = container.querySelectorAll<HTMLElement>('.trust-card');
    if (reduceMotion) {
      cards.forEach((card) => { card.style.opacity = '1'; card.style.transform = 'none'; });
      return;
    }

    const animation = animate(cards, {
      opacity: [0, 1],
      translateY: [28, 0],
      scale: [0.97, 1],
      duration: 700,
      ease: 'outExpo',
      delay: stagger(110),
      autoplay: onScroll({
        target: container,
        enter: 'bottom-=10% top',
      }),
    });

    return () => { animation.revert(); };
  }, []);

  return (
    <section className="w-full max-w-6xl mx-auto py-12 sm:py-16 px-4 sm:px-6 z-10 relative border-t border-[var(--card-border)]/40 mt-4 text-left">
      <Reveal className="text-center mb-8 sm:mb-12 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 font-mono-data text-[11px] tracking-[0.2em] text-[var(--signal-bright)] uppercase mb-4">
          <span aria-hidden="true" className="w-4 h-px bg-[var(--sheet-line)]" />
          Segurança do Laudo
          <span aria-hidden="true" className="w-4 h-px bg-[var(--sheet-line)]" />
        </div>
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-tight leading-[0.95] text-[var(--text-main)] [text-wrap:balance]">
          Um laudo que <span className="text-[var(--signal-bright)]">comprova a si mesmo</span>
        </h2>
        <p className="text-sm text-[var(--text-muted)] mt-3 max-w-xl">
          Ainda não temos histórico público de clientes — o app é novo. O que oferecemos hoje é verificável: confira como cada laudo é protegido tecnicamente, sem depender da nossa palavra.
        </p>
      </Reveal>

      <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {TRUST_ITEMS.map((item) => (
          <div key={item.k} className="trust-card glass-card p-6 sm:p-8 border border-[var(--card-border)]/50 hover:border-[var(--sheet-line)] hover:shadow-[0_8px_30px_-12px_var(--signal-glow)] transition-colors duration-300 relative group" style={{ opacity: 0 }}>
            <div className="font-mono-data text-[10px] uppercase tracking-widest text-[var(--signal-bright)] mb-3">
              {item.k}
            </div>
            <h3 className="font-display text-lg sm:text-xl font-semibold uppercase tracking-tight text-[var(--text-main)] mb-2">{item.title}</h3>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

      <Reveal delay={270} className="glass-card mt-8 p-6 sm:p-8 border border-[var(--card-border)]/50 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
        <div className="shrink-0 grid place-items-center w-12 h-12 rounded-full border border-[var(--sheet-line)] font-mono-data text-lg text-[var(--signal-bright)]">
          JS
        </div>
        <div>
          <p className="font-mono-data text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-1">Quem responde por este produto</p>
          <p className="text-sm text-[var(--text-main)]">
            <strong className="font-semibold">Jeferson da Silva</strong> — Florianópolis/SC. Responsável legal e desenvolvedor do Danos Aparentes.{' '}
            <a href={`mailto:${LEGAL_CONTACT_EMAIL}`} className="text-primary hover:underline">{LEGAL_CONTACT_EMAIL}</a>
          </p>
        </div>
      </Reveal>
    </section>
  );
}
