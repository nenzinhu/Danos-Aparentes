'use client'

import Reveal from '../Reveal'

const CONTEXT = [
  { label: 'Foto', detail: 'Evidência visual' },
  { label: 'Localização', detail: 'GPS da vistoria' },
  { label: 'Data e hora', detail: 'Registro temporal' },
  { label: 'Responsável', detail: 'Identificação e assinatura' },
  { label: 'Integridade', detail: 'Hash SHA-256' },
  { label: 'Consulta', detail: 'QR Code de verificação' },
]

export default function EvidenceContextSection() {
  return (
    <section
      id="evidencias"
      className="w-full max-w-6xl mx-auto py-20 px-6 z-10 relative border-t border-[var(--card-border)]/40"
    >
      <Reveal className="text-center mb-12 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 font-mono-data text-[11px] tracking-[0.2em] text-[var(--signal-bright)] uppercase mb-4">
          <span aria-hidden="true" className="w-4 h-px bg-[var(--sheet-line)]" />
          Evidências
          <span aria-hidden="true" className="w-4 h-px bg-[var(--sheet-line)]" />
        </div>
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-tight leading-[0.95] text-[var(--text-main)] [text-wrap:balance] max-w-3xl">
          Um histórico com evidências verificáveis.
        </h2>
        <p className="mt-4 text-sm text-[var(--text-muted)] max-w-2xl leading-relaxed">
          Reúna informações que ajudam a contextualizar o estado do veículo no momento da vistoria.
        </p>
      </Reveal>

      <Reveal>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 list-none m-0 p-0 max-w-4xl mx-auto">
          {CONTEXT.map((item) => (
            <li
              key={item.label}
              className="rounded-xl border border-[var(--card-border)] px-4 py-3.5 text-left"
            >
              <div className="flex items-center gap-2">
                <span
                  aria-hidden
                  className="w-1.5 h-1.5 rounded-full bg-[var(--signal-bright)] shadow-[0_0_8px_var(--signal-glow)]"
                />
                <p className="text-sm font-bold text-[var(--text-main)]">{item.label}</p>
              </div>
              <p className="mt-1.5 text-xs text-[var(--text-muted)] pl-3.5">{item.detail}</p>
            </li>
          ))}
        </ul>
      </Reveal>

      <Reveal delay={60} className="mt-8 text-center">
        <p className="text-[11px] text-[var(--text-muted)] max-w-lg mx-auto leading-relaxed">
          PDF com integridade verificável por hash SHA-256.
        </p>
      </Reveal>
    </section>
  )
}
