'use client'

import Reveal from '../Reveal'

const SEM = [
  'Discussão',
  'Dúvida',
  'Retrabalho',
  'Prejuízo',
]

const COM = [
  'Histórico',
  'Comparação',
  'Evidência',
  'Rastreabilidade',
  'Relatório',
]

export default function EuConsigoProvarSection() {
  return (
    <section
      id="eu-consigo-provar"
      className="w-full max-w-6xl mx-auto py-20 px-6 z-10 relative border-t border-[var(--card-border)]/40"
    >
      <Reveal className="text-center mb-12 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 font-mono-data text-[11px] tracking-[0.2em] text-[var(--signal-bright)] uppercase mb-4">
          <span aria-hidden="true" className="w-4 h-px bg-[var(--sheet-line)]" />
          Transformação
          <span aria-hidden="true" className="w-4 h-px bg-[var(--sheet-line)]" />
        </div>
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-tight leading-[0.95] text-[var(--text-main)] [text-wrap:balance] max-w-3xl">
          De “eu acho” para “eu consigo provar”.
        </h2>
      </Reveal>

      <Reveal>
        <div className="relative rounded-2xl border border-[var(--card-border)] bg-[var(--panel-bg)]/50 overflow-hidden px-4 sm:px-8 py-8 sm:py-10">
          <div className="relative grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--bg-main)]/70 px-5 py-6">
              <h3 className="text-center font-display text-lg sm:text-xl font-bold uppercase tracking-tight text-[var(--text-muted)] mb-5">
                Sem histórico
              </h3>
              <ul className="grid grid-cols-1 gap-3 list-none m-0 p-0">
                {SEM.map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm font-semibold text-[var(--text-main)]">
                    <span aria-hidden className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-[var(--card-border)] text-[11px] text-[var(--text-muted)]">
                      ×
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-[var(--signal-bright)]/35 bg-[color-mix(in_srgb,var(--signal)_8%,transparent)] px-5 py-6">
              <h3 className="text-center font-display text-lg sm:text-xl font-bold uppercase tracking-tight text-[var(--signal-bright)] mb-5">
                Com Danos Aparentes
              </h3>
              <ul className="grid grid-cols-1 gap-3 list-none m-0 p-0">
                {COM.map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm font-semibold text-[var(--text-main)]">
                    <span aria-hidden className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--success)]/20 text-[var(--success)] text-xs font-black">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="relative mt-8 text-center font-mono-data text-[10px] sm:text-[11px] tracking-[0.2em] uppercase text-[var(--text-muted)]">
            Dúvida → Evidência
          </p>
        </div>
      </Reveal>
    </section>
  )
}
