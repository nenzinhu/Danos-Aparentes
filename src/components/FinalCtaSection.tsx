'use client';
import LandingCtaLink from './LandingCtaLink';
import Reveal from './Reveal';

export default function FinalCtaSection() {
  return (
    <section className="w-full py-20 px-6 z-10 relative border-t border-[var(--card-border)]/40 overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 50% 30%, rgba(0,170,255,0.10) 0%, transparent 65%)' }} />
      <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(var(--grid-color)_1px,transparent_1px),linear-gradient(90deg,var(--grid-color)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none opacity-60" />

      <Reveal className="max-w-3xl mx-auto text-center relative">
        <div className="inline-flex items-center gap-2 font-mono-data text-[11px] tracking-[0.2em] text-[var(--signal-bright)] uppercase mb-5">
          <span aria-hidden="true" className="w-4 h-px bg-[var(--sheet-line)]" />
          Próxima Vistoria
          <span aria-hidden="true" className="w-4 h-px bg-[var(--sheet-line)]" />
        </div>

        <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold uppercase tracking-tight leading-[0.95] text-[var(--text-main)] [text-wrap:balance]">
          Sua próxima avaria pode virar <span className="text-[var(--signal-bright)] italic">laudo em 1 minuto.</span>
        </h2>
        <p className="text-sm sm:text-base text-[var(--text-muted)] mt-5 max-w-xl mx-auto leading-relaxed">
          Sem cartão, sem instalação complicada. Abra a primeira vistoria agora e veja o laudo pronto antes de terminar o café.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-9">
          <LandingCtaLink
            transitionTypes={['nav-forward']}
            className="group/cta px-10 py-5 text-white font-black text-base sm:text-lg rounded-xl shadow-2xl shadow-[var(--primary)]/25 inline-flex items-center gap-3 transition-transform duration-150 motion-safe:hover:scale-[1.02] active:scale-[0.99] focus-visible:ring-2 ring-[var(--primary)] ring-offset-4 ring-offset-[var(--bg-main)] outline-none"
            style={{ backgroundImage: 'var(--primary-btn-gradient)' }}
          >
            Testar 7 dias grátis
            <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover/cta:translate-x-1"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </LandingCtaLink>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 mt-5 font-mono-data text-[11px] text-[var(--text-muted)] uppercase tracking-wider">
          <span aria-hidden="true" className="text-[var(--signal-bright)]">✓</span>
          <span>Sem cartão</span>
          <span aria-hidden="true" className="text-[var(--card-border)]">·</span>
          <span>7 dias liberados</span>
          <span aria-hidden="true" className="text-[var(--card-border)]">·</span>
          <span>Cancele online</span>
        </div>
      </Reveal>
    </section>
  );
}
