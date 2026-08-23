'use client'

import Reveal from '../Reveal'
import LupaVehicleReveal from '../LupaVehicleReveal'

export default function AntesDepoisSection() {
  return (
    <section
      id="antes-depois"
      className="w-full max-w-6xl mx-auto py-20 px-6 z-10 relative border-t border-[var(--card-border)]/40"
    >
      <Reveal className="text-center mb-10 flex flex-col items-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <LupaVehicleReveal size={40} className="hidden sm:inline-flex" />
          <p className="font-display text-xl sm:text-2xl font-bold uppercase tracking-tight text-[var(--text-main)]">
            Danos Aparentes
          </p>
        </div>
        <div className="inline-flex items-center gap-2 font-mono-data text-[11px] tracking-[0.2em] text-[var(--signal-bright)] uppercase mb-4">
          <span aria-hidden="true" className="w-4 h-px bg-[var(--sheet-line)]" />
          Comparação · Antes e depois
          <span aria-hidden="true" className="w-4 h-px bg-[var(--sheet-line)]" />
        </div>
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-tight leading-[0.95] text-[var(--text-main)] [text-wrap:balance] max-w-3xl">
          Veja a diferença na prática
        </h2>
        <p className="mt-4 text-sm text-[var(--text-muted)] max-w-2xl leading-relaxed">
          A mesma placa, duas inspeções. Na entrada, sem avarias. No retorno, a porta dianteira esquerda amassada aparece no dossiê — com foto, data/hora e hash. É assim que você prova o que mudou.
        </p>
      </Reveal>

      <Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          <figure className="flex flex-col rounded-2xl border border-[var(--card-border)] bg-[var(--panel-bg)]/50 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--card-border)]">
              <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-[var(--card-border)] text-[11px] text-[var(--text-muted)]">
                ×
              </span>
              <figcaption className="font-display text-sm font-bold uppercase tracking-tight text-[var(--text-muted)]">
                Entrada · Sem avarias
              </figcaption>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/landing/vistoria-entrada.png"
              alt="Relatório de vistoria de entrada: veículo sem avarias registradas"
              className="w-full h-auto object-contain bg-[var(--bg-main)]/70"
              loading="lazy"
            />
          </figure>

          <figure className="flex flex-col rounded-2xl border border-[var(--signal-bright)]/35 bg-[color-mix(in_srgb,var(--signal)_8%,transparent)] overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--signal-bright)]/25">
              <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-black">
                ✓
              </span>
              <figcaption className="font-display text-sm font-bold uppercase tracking-tight text-[var(--signal-bright)]">
                Retorno · 1 avaria detectada
              </figcaption>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/landing/vistoria-retorno.png"
              alt="Relatório de vistoria de retorno: avaria na porta dianteira esquerda detectada"
              className="w-full h-auto object-contain bg-[var(--bg-main)]/70"
              loading="lazy"
            />
          </figure>
        </div>

        <p className="mt-8 text-center font-mono-data text-[10px] sm:text-[11px] tracking-[0.2em] uppercase text-[var(--text-muted)]">
          Histórico como produto. PDF como saída.
        </p>
      </Reveal>
    </section>
  )
}
