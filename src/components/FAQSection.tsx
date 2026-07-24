'use client';
import React, { useRef, useEffect, useState, useId } from 'react';
import { gsap } from 'gsap';
import Reveal from './Reveal';

export interface FAQItem {
  q: string;
  a: string;
}

interface Props {
  items: FAQItem[];
}

function FAQRow({ item }: { item: FAQItem }) {
  const [open, setOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(el, { height: open ? 'auto' : 0 });
      return;
    }

    if (open) {
      gsap.set(el, { height: 'auto' });
      const targetHeight = el.offsetHeight;
      gsap.fromTo(
        el,
        { height: 0 },
        { height: targetHeight, duration: 0.35, ease: 'power2.out', onComplete: () => gsap.set(el, { height: 'auto' }) }
      );
    } else {
      gsap.to(el, { height: 0, duration: 0.3, ease: 'power2.in' });
    }
  }, [open]);

  return (
    <div className="border border-[var(--card-border)]/40 bg-[var(--panel-bg)] rounded-2xl overflow-hidden hover:border-[var(--sheet-line)] transition-colors duration-300">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className="w-full font-semibold text-[var(--text-main)] cursor-pointer select-none flex justify-between items-center outline-none p-5 text-left"
      >
        <span className="pr-4">{item.q}</span>
        <span
          aria-hidden="true"
          className="text-[var(--signal-bright)] flex-shrink-0 text-[10px] transition-transform duration-300"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          ▼
        </span>
      </button>
      <div id={panelId} ref={contentRef} style={{ height: 0, overflow: 'hidden' }}>
        <p className="text-[var(--text-muted)] text-sm leading-relaxed border-t border-[var(--card-border)]/20 px-5 pt-3 pb-5">
          {item.a}
        </p>
      </div>
    </div>
  );
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
            <FAQRow key={i} item={item} />
          ))}
        </div>
        {/* Right Column FAQ */}
        <div className="space-y-4">
          {items.slice(3).map((item, i) => (
            <FAQRow key={i + 3} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
