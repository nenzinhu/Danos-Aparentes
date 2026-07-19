'use client';
import Reveal from './Reveal';
import {
  LEGAL_CNPJ,
  LEGAL_COMPANY_NAME,
  LEGAL_CONTACT_EMAIL,
} from './LegalContent';

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

/**
 * Motion 2 — scroll reveal único (mesmo sistema da home: Reveal + CSS).
 * animejs removido para uma só linguagem de motion com o resto da landing.
 */
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
            className="glass-card p-8 border border-[var(--card-border)]/50 hover:border-[var(--sheet-line)] hover:shadow-[0_8px_30px_-12px_var(--signal-glow)] transition-colors duration-300 relative group"
          >
            <div className="font-mono-data text-[10px] uppercase tracking-widest text-[var(--signal-bright)] mb-3">
              {item.k}
            </div>
            <h3 className="font-display text-xl font-semibold uppercase tracking-tight text-[var(--text-main)] mb-2">{item.title}</h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">{item.desc}</p>
          </Reveal>
        ))}
      </div>

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
