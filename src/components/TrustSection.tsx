'use client';
import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import Reveal from './Reveal';
import {
  LEGAL_CNPJ,
  LEGAL_COMPANY_NAME,
  LEGAL_CONTACT_EMAIL,
} from './LegalContent';
import { IconShieldCheck, IconSignature, IconGps, IconDocument, IconShieldCheck as IconCert } from './ui/AnimatedIcons';

const TRUST_ITEMS = [
  {
    k: 'Integridade',
    icon: <IconShieldCheck className="text-sky-400" size={24} />,
    title: 'Hash SHA-256 em cada laudo',
    desc: 'Todo PDF gerado carrega um código único de verificação. Qualquer alteração no documento após a emissão invalida o hash — o laudo comprova a si mesmo.',
  },
  {
    k: 'Autenticação',
    icon: <IconSignature className="text-emerald-400" size={24} />,
    title: 'Assinatura digital na tela',
    desc: 'Vistoriador e cliente assinam com o dedo, no próprio celular, no momento da vistoria. Sem impressão, sem "assino depois".',
  },
  {
    k: 'Rastreabilidade',
    icon: <IconGps className="text-amber-400" size={24} />,
    title: 'Fotos com GPS e timestamp',
    desc: 'Cada foto anexada guarda local e horário de captura, reforçando que o registro foi feito no pátio, na hora da vistoria.',
  },
];

/**
 * Card de trust com hover GSAP (y:-6, scale:1.02)
 */
function TrustCard({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      el.addEventListener('mouseenter', () =>
        gsap.to(el, { y: -6, scale: 1.02, duration: 0.3, ease: 'power2.out' })
      );
      el.addEventListener('mouseleave', () =>
        gsap.to(el, { y: 0, scale: 1, duration: 0.3, ease: 'power2.out' })
      );
    }, el);
    return () => ctx.revert();
  }, []);
  return (
    <div
      ref={ref}
      className="glass-card p-8 border border-[var(--card-border)]/50 hover:border-[var(--sheet-line)] hover:shadow-[0_8px_30px_-12px_var(--signal-glow)] transition-colors duration-300 relative group h-full flex flex-col justify-between"
    >
      {children}
    </div>
  );
}

export default function TrustSection() {
  return (
    <section className="w-full max-w-6xl mx-auto py-16 px-6 z-10 relative border-t border-[var(--card-border)]/40 mt-4 text-left">
      <Reveal className="text-center mb-12 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 font-mono-data text-[11px] tracking-[0.2em] text-[var(--signal-bright)] uppercase mb-4">
          <span aria-hidden="true" className="w-4 h-px bg-[var(--sheet-line)]" />
          Segurança do Laudo
          <span aria-hidden="true" className="w-4 h-px bg-[var(--sheet-line)]" />
        </div>
        <h2 className="font-display text-4xl lg:text-5xl font-bold uppercase tracking-tight leading-[0.95] text-[var(--text-main)]">
          Um laudo que <span className="text-[var(--signal-bright)]">comprova a si mesmo</span>
        </h2>
        <p className="text-sm text-[var(--text-muted)] mt-3 max-w-xl">
          Ainda não temos histórico público de clientes — o app é novo. O que oferecemos hoje é verificável: confira como cada laudo é protegido tecnicamente, sem depender da nossa palavra.
        </p>
      </Reveal>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {TRUST_ITEMS.map((item, idx) => (
          <Reveal
            key={item.k}
            delay={idx * 70}
          >
            <TrustCard>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono-data text-[10px] uppercase tracking-widest text-[var(--signal-bright)]">
                    {item.k}
                  </span>
                  <div className="p-2 rounded-lg bg-white/5 border border-white/10 group-hover:scale-110 transition-transform duration-300">
                    {item.icon}
                  </div>
                </div>
                <h3 className="font-display text-xl font-semibold uppercase tracking-tight text-[var(--text-main)] mb-2">{item.title}</h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">{item.desc}</p>
              </div>
            </TrustCard>
          </Reveal>
        ))}
      </div>

      {/* Acesso rápido aos 2 modelos em PDF: Laudo + Certificado de Autenticidade */}
      <Reveal delay={180} className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
        <span className="text-xs font-bold font-mono-data text-[var(--text-muted)] uppercase tracking-wider">
          Exemplos em PDF para baixar:
        </span>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <a
            href="/exemplos/modelo-relatorio-vistoria-veicular.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-lg border border-sky-500/30 bg-sky-500/10 text-sky-300 hover:bg-sky-500/20 transition-all"
          >
            <IconDocument size={14} className="text-sky-400" /> PDF 1 · Laudo de Vistoria
          </a>
          <a
            href="/exemplos/modelo-verificacao-autenticidade.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 transition-all"
          >
            <IconShieldCheck size={14} className="text-emerald-400" /> PDF 2 · Certificado de Autenticidade
          </a>
          <a
            href="/verify"
            className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-lg border border-[var(--card-border)] bg-[var(--panel-bg)] text-[var(--text-main)] hover:border-[var(--sheet-line)] transition-all"
          >
            Verificar um laudo →
          </a>
        </div>
      </Reveal>

      <Reveal delay={220} className="glass-card mt-8 p-6 sm:p-8 border border-[var(--card-border)]/50 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
        <div className="shrink-0 grid place-items-center w-12 h-12 rounded-full border border-[var(--sheet-line)] font-mono-data text-lg text-[var(--signal-bright)]">
          DA
        </div>
        <div>
          <p className="font-mono-data text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-1">Quem responde por este produto</p>
          <p className="text-sm text-[var(--text-main)]">
            <strong className="font-semibold">{LEGAL_COMPANY_NAME}</strong> — CNPJ {LEGAL_CNPJ}.{' '}
            <a href={`mailto:${LEGAL_CONTACT_EMAIL}`} className="text-primary hover:underline">{LEGAL_CONTACT_EMAIL}</a>
          </p>
        </div>
      </Reveal>
    </section>
  );
}
