'use client'

import Reveal from '../Reveal'
import HeroVehiclePicker from '../HeroVehiclePicker'

const TYPES = ['Amassado', 'Arranhado', 'Trincado', 'Quebrado']

const FLOW_TOP = [
  { label: 'Veículo SVG', note: null as string | null },
  { label: 'Área selecionada', note: 'Porta dianteira direita' },
]

const FLOW_BOTTOM = [
  { label: 'Foto', note: 'Adicionar evidência' },
  { label: 'IA', note: 'Sugestão de descrição' },
  { label: 'Validação', note: 'Aprovar ou editar' },
  { label: 'Histórico', note: 'Registro salvo' },
]

export default function VisualDamageSection() {
  return (
    <section
      id="danos-visuais"
      className="w-full z-10 relative border-t border-[var(--card-border)]/40 scroll-mt-24"
    >
      <div className="max-w-6xl mx-auto py-20 px-6">
        <Reveal className="text-center mb-10 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 font-mono-data text-[11px] tracking-[0.2em] text-[var(--signal-bright)] uppercase mb-3">
            <span aria-hidden="true" className="w-4 h-px bg-[var(--sheet-line)]" />
            Evidência · Registro visual
            <span aria-hidden="true" className="w-4 h-px bg-[var(--sheet-line)]" />
          </div>
          <span className="mb-4 inline-flex items-center gap-2 rounded-lg border border-[var(--signal-bright)]/35 bg-[color-mix(in_srgb,var(--signal)_12%,transparent)] px-3 py-1.5 font-mono-data text-[10px] uppercase tracking-[0.18em] text-[var(--signal-bright)]">
            <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-[var(--signal-bright)] shadow-[0_0_8px_var(--signal-glow)]" />
            Demo interativa
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-tight leading-[0.95] text-[var(--text-main)] [text-wrap:balance] max-w-3xl">
            Marque a avaria e gere a evidência
          </h2>
          <p className="mt-4 text-sm text-[var(--text-muted)] max-w-2xl leading-relaxed">
            Toque nas peças para marcar o dano, registre a foto e gere um histórico comparável. Igual ao app.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-10 items-start">
          <Reveal>
            <div className="space-y-3 font-mono-data text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
              <p className="text-[var(--text-main)] font-semibold normal-case text-sm tracking-normal">
                Fluxo no diagrama
              </p>
              {FLOW_TOP.map((step, i) => (
                <div key={step.label}>
                  <div className="rounded-lg border border-[var(--card-border)] px-4 py-3 text-[var(--text-main)] normal-case text-xs font-semibold tracking-normal">
                    {step.label}
                    {step.note && (
                      <span className="block mt-0.5 font-normal text-[var(--text-muted)]">{step.note}</span>
                    )}
                  </div>
                  {i < FLOW_TOP.length - 1 && (
                    <p className="text-center py-1" aria-hidden>
                      ↓
                    </p>
                  )}
                </div>
              ))}
              <div>
                <p className="text-center py-1" aria-hidden>
                  ↓
                </p>
                <p className="mb-2">Tipo de dano</p>
                <ul className="flex flex-wrap gap-2 list-none m-0 p-0">
                  {TYPES.map((t) => (
                    <li
                      key={t}
                      className="text-xs normal-case tracking-normal px-3 py-1.5 rounded-lg border border-[var(--card-border)] text-[var(--text-main)] font-medium"
                    >
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
              {FLOW_BOTTOM.map((step) => (
                <div key={step.label}>
                  <p className="text-center py-1" aria-hidden>
                    ↓
                  </p>
                  <div className="rounded-lg border border-[var(--card-border)] px-4 py-3 space-y-1">
                    <p className="normal-case text-xs font-semibold tracking-normal text-[var(--text-main)]">
                      {step.label}
                    </p>
                    <p className="normal-case text-[11px] font-medium tracking-normal text-[var(--text-muted)]">
                      {step.note}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="rounded-2xl border border-[var(--signal-bright)]/25 bg-[linear-gradient(160deg,transparent_40%,color-mix(in_srgb,var(--signal)_8%,transparent)_100%)] px-4 sm:px-6 py-6">
              <p className="mb-3 font-mono-data text-[10px] uppercase tracking-[0.18em] text-[var(--signal-bright)]">
                Demo ao vivo
              </p>
              <HeroVehiclePicker />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
