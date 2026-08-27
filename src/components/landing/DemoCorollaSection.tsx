'use client'

import Reveal from '../Reveal'

export default function DemoCorollaSection() {
  return (
    <section
      id="demonstracao"
      className="w-full max-w-6xl mx-auto py-20 px-6 z-10 relative border-t border-[var(--card-border)]/40"
    >
      <Reveal className="text-center mb-12 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 font-mono-data text-[11px] tracking-[0.2em] text-[var(--signal-bright)] uppercase mb-4">
          <span aria-hidden="true" className="w-4 h-px bg-[var(--sheet-line)]" />
          Demonstração
          <span aria-hidden="true" className="w-4 h-px bg-[var(--sheet-line)]" />
        </div>
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-tight leading-[0.95] text-[var(--text-main)] [text-wrap:balance] max-w-3xl">
          Dois registros. Uma resposta.
        </h2>
        <p className="mt-4 max-w-2xl text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
          Veja como o histórico responde, em segundos, a pergunta “quem causou o dano?”.
        </p>
      </Reveal>

      <Reveal>
        <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--panel-bg)]/50 overflow-hidden px-4 sm:px-8 py-8 sm:py-10">
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="font-display text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-main)]">
              Toyota Corolla
            </span>
            <span className="font-mono-data text-sm px-2.5 py-1 rounded-md border border-[var(--card-border)] text-[var(--signal-bright)]">
              ABC-1234
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
            {/* Inspeção de entrega */}
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--bg-main)]/70 px-5 py-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg font-bold uppercase tracking-tight text-[var(--text-main)]">
                  Inspeção de entrega
                </h3>
                <span className="font-mono-data text-[11px] text-[var(--text-muted)]">05/08/2026</span>
              </div>
              <div className="relative rounded-lg overflow-hidden border border-[var(--card-border)] aspect-[16/10] bg-[var(--panel-bg)]/40 flex items-center justify-center">
                {/* Placeholder de foto — substituir por imagem real do mockup */}
                <span aria-hidden className="text-[var(--text-muted)] text-sm">Foto da inspeção</span>
              </div>
              <p className="mt-4 text-sm font-semibold text-[var(--text-main)]">
                Para-choque traseiro:
                <span className="text-[var(--success)]"> Sem danos</span>
              </p>
              <p className="mt-2 text-xs text-[var(--text-muted)] leading-relaxed">
                Responsável: J. Silva · 14:32 · Local: Pátio A
              </p>
            </div>

            {/* Inspeção de devolução */}
            <div className="rounded-xl border border-[var(--signal-bright)]/35 bg-[color-mix(in_srgb,var(--signal)_8%,transparent)] px-5 py-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg font-bold uppercase tracking-tight text-[var(--signal-bright)]">
                  Inspeção de devolução
                </h3>
                <span className="font-mono-data text-[11px] text-[var(--text-muted)]">15/08/2026</span>
              </div>
              <div className="relative rounded-lg overflow-hidden border border-[var(--card-border)] aspect-[16/10] bg-[var(--panel-bg)]/40 flex items-center justify-center">
                <span aria-hidden className="text-[var(--text-muted)] text-sm">Foto da inspeção</span>
                {/* Marcador de dano */}
                <span
                  aria-hidden
                  className="absolute inline-flex items-center justify-center h-7 w-7 rounded-full bg-red-500/90 text-white text-xs font-black shadow-lg"
                  style={{ bottom: '22%', left: '38%' }}
                >
                  !
                </span>
              </div>
              <p className="mt-4 text-sm font-semibold text-[var(--text-main)]">
                Para-choque traseiro:
                <span className="text-red-400"> Novo risco identificado</span>
              </p>
              <p className="mt-2 text-xs text-[var(--text-muted)] leading-relaxed">
                Responsável: M. Souza · 09:18 · Local: Pátio A
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-xl border border-[var(--signal-bright)]/30 bg-[var(--panel-bg)]/60 px-5 py-4 text-center">
            <p className="font-display text-base sm:text-lg font-bold text-[var(--text-main)] [text-wrap:balance]">
              Novo dano identificado entre duas inspeções.
            </p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Comparação automática · evidência com foto, data, horário, localização e responsável.
            </p>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
