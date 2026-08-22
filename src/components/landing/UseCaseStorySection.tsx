'use client'

import Reveal from '../Reveal'

const BEATS = [
  { n: '01', title: 'O veículo chega.', action: 'Vistoria de entrada' },
  { n: '02', title: 'O veículo é utilizado.', action: 'Histórico registrado' },
  { n: '03', title: 'O veículo retorna.', action: 'Vistoria de devolução' },
  { n: '04', title: 'O sistema compara.', action: 'Antes × Depois' },
  { n: '05', title: 'Um novo dano é identificado.', action: 'Evidência registrada' },
  { n: '06', title: 'O relatório é gerado.', action: 'Histórico documentado' },
]

export default function UseCaseStorySection() {
  return (
    <section
      id="caso-de-uso"
      className="w-full max-w-6xl mx-auto py-20 px-6 z-10 relative border-t border-[var(--card-border)]/40"
    >
      <Reveal className="text-center mb-12 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 font-mono-data text-[11px] tracking-[0.2em] text-[var(--signal-bright)] uppercase mb-4">
          <span aria-hidden="true" className="w-4 h-px bg-[var(--sheet-line)]" />
          Caso de uso
          <span aria-hidden="true" className="w-4 h-px bg-[var(--sheet-line)]" />
        </div>
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-tight leading-[0.95] text-[var(--text-main)] [text-wrap:balance] max-w-3xl">
          Um veículo. Vários momentos. Um único histórico.
        </h2>
      </Reveal>

      <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 list-none m-0 p-0">
        {BEATS.map((b, i) => (
          <Reveal key={b.n} as="li" delay={i * 55} className="relative">
            <p className="font-mono-data text-3xl font-bold text-[var(--signal)]/25">{b.n}</p>
            <h3 className="mt-2 text-base font-bold text-[var(--text-main)]">{b.title}</h3>
            <p className="mt-1 font-mono-data text-[11px] uppercase tracking-wider text-[var(--signal-bright)]">
              {b.action}
            </p>
          </Reveal>
        ))}
      </ol>

      <Reveal delay={100} className="mt-12 text-center">
        <p className="text-lg sm:text-xl font-semibold text-[var(--text-main)] max-w-2xl mx-auto leading-snug [text-wrap:balance]">
          Saiba o que mudou. Saiba quando mudou. Tenha as evidências organizadas.
        </p>
      </Reveal>
    </section>
  )
}
