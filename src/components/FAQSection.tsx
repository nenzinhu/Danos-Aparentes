'use client';
import React from 'react';
import Reveal from './Reveal';

export interface FAQItem {
  q: string;
  a: string;
}

interface Props {
  items: FAQItem[];
}

export default function FAQSection({ items }: Props) {
  return (
    <section id="faq" className="w-full max-w-5xl mx-auto py-16 px-6 z-10 relative border-t border-[var(--card-border)]/40 mt-12">
      <Reveal className="text-center mb-10 flex flex-col items-center">
        <h2 className="font-display text-4xl lg:text-5xl font-bold uppercase tracking-tight text-[var(--text-main)]">
          Central de Ajuda
        </h2>
        <p className="text-sm text-[var(--text-muted)] mt-3">
          Saiba mais sobre como funciona o sistema Danos Aparentes
        </p>
      </Reveal>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column FAQ */}
        <div className="space-y-4">
          {items.slice(0, 3).map((item, i) => (
            <details key={i} className="group border border-[var(--card-border)]/40 bg-[var(--panel-bg)] rounded-2xl p-5 hover:border-[var(--sheet-line)] transition-all duration-300">
              <summary className="font-semibold text-[var(--text-main)] cursor-pointer select-none list-none flex justify-between items-center outline-none">
                <span className="pr-4">{item.q}</span>
                <span className="text-[var(--signal-bright)] group-open:rotate-180 transition-transform duration-300 flex-shrink-0 text-[10px]">▼</span>
              </summary>
              <p className="mt-3 text-[var(--text-muted)] text-sm leading-relaxed border-t border-[var(--card-border)]/20 pt-3">{item.a}</p>
            </details>
          ))}
        </div>
        {/* Right Column FAQ */}
        <div className="space-y-4">
          {items.slice(3).map((item, i) => (
            <details key={i + 3} className="group border border-[var(--card-border)]/40 bg-[var(--panel-bg)] rounded-2xl p-5 hover:border-[var(--sheet-line)] transition-all duration-300">
              <summary className="font-semibold text-[var(--text-main)] cursor-pointer select-none list-none flex justify-between items-center outline-none">
                <span className="pr-4">{item.q}</span>
                <span className="text-[var(--signal-bright)] group-open:rotate-180 transition-transform duration-300 flex-shrink-0 text-[10px]">▼</span>
              </summary>
              <p className="mt-3 text-[var(--text-muted)] text-sm leading-relaxed border-t border-[var(--card-border)]/20 pt-3">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
