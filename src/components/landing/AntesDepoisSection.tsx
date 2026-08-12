'use client'

import Reveal from '../Reveal'
import LupaVehicleReveal from '../LupaVehicleReveal'

const ANTES = [
  'Fotos no WhatsApp',
  'Planilhas',
  'Papel',
  'Discussões',
  'Sem histórico',
]

const DEPOIS = [
  'Histórico',
  'PDF',
  'QR Code',
  'Hash',
  'Assinaturas',
  'Comparação',
]

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
          Do caos ao histórico verificável
        </h2>
        <p className="mt-4 text-sm text-[var(--text-muted)] max-w-2xl leading-relaxed">
          Troque WhatsApp, planilha e papel por um registro organizado — com PDF, QR Code, hash e comparação.
        </p>
      </Reveal>

      <Reveal>
        <div className="relative rounded-2xl border border-[var(--card-border)] bg-[var(--panel-bg)]/50 overflow-hidden px-4 sm:px-8 py-8 sm:py-10">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[linear-gradient(var(--grid-color)_1px,transparent_1px),linear-gradient(90deg,var(--grid-color)_1px,transparent_1px)] bg-[size:40px_40px] opacity-50 pointer-events-none"
          />

          <div className="relative grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--bg-main)]/70 px-5 py-6">
              <h3 className="text-center font-display text-lg sm:text-xl font-bold uppercase tracking-tight text-[var(--text-muted)] mb-5">
                Antes
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 list-none m-0 p-0">
                {ANTES.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2.5 text-sm font-semibold text-[var(--text-main)]"
                  >
                    <span
                      aria-hidden
                      className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-[var(--card-border)] text-[11px] text-[var(--text-muted)]"
                    >
                      ×
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-[var(--signal-bright)]/35 bg-[color-mix(in_srgb,var(--signal)_8%,transparent)] px-5 py-6">
              <h3 className="text-center font-display text-lg sm:text-xl font-bold uppercase tracking-tight text-[var(--signal-bright)] mb-5">
                Depois
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 list-none m-0 p-0">
                {DEPOIS.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2.5 text-sm font-semibold text-[var(--text-main)]"
                  >
                    <span
                      aria-hidden
                      className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-black"
                    >
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="relative mt-8 text-center font-mono-data text-[10px] sm:text-[11px] tracking-[0.2em] uppercase text-[var(--text-muted)]">
            Plataforma completa de histórico veicular
          </p>
        </div>
      </Reveal>
    </section>
  )
}
