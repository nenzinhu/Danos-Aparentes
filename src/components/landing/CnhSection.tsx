'use client'

import Reveal from '../Reveal'

const FLOW = ['CNH', 'Leitura', 'Nome + CPF + nº CNH', 'Preenchimento automático']

export default function CnhSection() {
  return (
    <section
      id="cnh"
      className="w-full max-w-6xl mx-auto py-20 px-6 z-10 relative border-t border-[var(--card-border)]/40"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <Reveal>
          <div className="inline-flex items-center gap-2 font-mono-data text-[11px] tracking-[0.2em] text-[var(--signal-bright)] uppercase mb-4">
            <span aria-hidden="true" className="w-4 h-px bg-[var(--sheet-line)]" />
            Scanner de CNH
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-tight leading-[0.95] text-[var(--text-main)] [text-wrap:balance]">
            Menos digitação. Menos erros. Mais velocidade.
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[var(--text-muted)] leading-relaxed max-w-lg">
            A leitura da CNH pré-preenche nome, CPF e número do documento — direto do dispositivo, inclusive
            offline quando a implementação permitir. Menos digitação manual significa menos erro e mais
            inspeções por hora no pátio.
          </p>
        </Reveal>

        <Reveal delay={100}>
          <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--panel-bg)]/50 px-5 py-6">
            <p className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-[var(--signal-bright)] mb-4">
              Fluxo
            </p>
            <ol className="flex flex-wrap items-center gap-2 list-none m-0 p-0">
              {FLOW.map((step, i) => (
                <li key={step} className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center h-9 px-3 rounded-lg border border-[var(--card-border)] bg-[var(--bg-main)]/70 text-sm font-bold text-[var(--text-main)]">
                    {step}
                  </span>
                  {i < FLOW.length - 1 && (
                    <span aria-hidden className="text-[var(--signal-bright)] text-sm">
                      →
                    </span>
                  )}
                </li>
              ))}
            </ol>
            <p className="mt-5 text-xs text-[var(--text-muted)] leading-relaxed">
              O recurso funciona no próprio dispositivo, respeitando a implementação atual de privacidade e
              armazenamento.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
