'use client'

import { useState } from 'react'
import Reveal from '../Reveal'

const SEM = [
  'Cobrança contestada',
  'Tempo perdido com discussão',
  'Retrabalho de laudo manual',
  'Prejuízo assumido pela empresa',
]

const COM = [
  'Evidência organizada',
  'Comparação automática',
  'Rastreabilidade por inspeção',
  'Decisão mais rápida',
]

/**
 * Seção de prova financeira (ilustrativa).
 * Valores são EXEMPLO HIPOTÉTICO — nunca presentedos como dado real da empresa.
 */
export default function RoiSection() {
  const [frota, setFrota] = useState(500)
  const [custo, setCusto] = useState(1500)

  const danosMes = 1 // exemplo: 1 dano não identificado por mês
  const prejuizoMes = danosMes * custo
  const prejuizoAno = prejuizoMes * 12

  const fmt = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })

  return (
    <section
      id="roi"
      className="w-full max-w-6xl mx-auto py-20 px-6 z-10 relative border-t border-[var(--card-border)]/40"
    >
      <Reveal className="text-center mb-12 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 font-mono-data text-[11px] tracking-[0.2em] text-[var(--signal-bright)] uppercase mb-4">
          <span aria-hidden="true" className="w-4 h-px bg-[var(--sheet-line)]" />
          Economia
          <span aria-hidden="true" className="w-4 h-px bg-[var(--sheet-line)]" />
        </div>
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-tight leading-[0.95] text-[var(--text-main)] [text-wrap:balance] max-w-3xl">
          Quanto custa não identificar um dano?
        </h2>
        <p className="mt-4 max-w-2xl text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
          Um dano não documentado pode se transformar em prejuízo. Um histórico bem estruturado transforma o dano em evidência.
        </p>
      </Reveal>

      <Reveal>
        <div className="relative rounded-2xl border border-[var(--card-border)] bg-[var(--panel-bg)]/50 overflow-hidden px-4 sm:px-8 py-8 sm:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6 lg:gap-8">
            {/* Simulador ilustrativo */}
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--bg-main)]/70 px-5 py-6">
              <h3 className="font-display text-lg font-bold uppercase tracking-tight text-[var(--text-main)] mb-1">
                Exemplo ilustrativo
              </h3>
              <p className="text-[11px] text-[var(--text-muted)] mb-5 leading-snug">
                Ajuste os valores para sua operação. Os números são uma <strong className="text-[var(--signal-bright)]">simulação</strong>, não um dado real da empresa.
              </p>

              <label className="block mb-4">
                <span className="text-xs font-semibold text-[var(--text-main)]">Veículos na frota</span>
                <input
                  type="range"
                  min={10}
                  max={2000}
                  step={10}
                  value={frota}
                  onChange={(e) => setFrota(Number(e.target.value))}
                  className="mt-2 w-full accent-[var(--primary)]"
                  aria-label="Quantidade de veículos na frota"
                />
                <span className="mt-1 block font-mono-data text-sm text-[var(--signal-bright)]">{frota} veículos</span>
              </label>

              <label className="block">
                <span className="text-xs font-semibold text-[var(--text-main)]">Custo médio de 1 avaria não comprovada</span>
                <input
                  type="range"
                  min={200}
                  max={10000}
                  step={100}
                  value={custo}
                  onChange={(e) => setCusto(Number(e.target.value))}
                  className="mt-2 w-full accent-[var(--primary)]"
                  aria-label="Custo médio de uma avaria não comprovada"
                />
                <span className="mt-1 block font-mono-data text-sm text-[var(--signal-bright)]">{fmt(custo)}</span>
              </label>

              <div className="mt-6 space-y-2 border-t border-[var(--card-border)] pt-4">
                <FlowRow label={`${frota} veículos`} />
                <FlowRow label="1 dano não identificado por mês" />
                <FlowRow label={`${fmt(prejuizoMes)} de prejuízo potencial / mês`} />
                <div className="flex items-center justify-between rounded-lg bg-[var(--signal)]/10 border border-[var(--signal-bright)]/30 px-3 py-2.5">
                  <span className="text-xs font-bold text-[var(--text-main)]">Prejuízo potencial / ano</span>
                  <span className="font-mono-data text-base font-black text-[var(--signal-bright)]">{fmt(prejuizoAno)}</span>
                </div>
              </div>
              <p className="mt-3 text-[10px] text-[var(--text-muted)] leading-snug">
                Cálculo: 1 dano/mês × custo médio × 12. Exemplo hipotético para fins de demonstração.
              </p>
            </div>

            {/* SEM x COM */}
            <div className="relative grid grid-cols-1 gap-5">
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
                      <span aria-hidden className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-black">
                        ✓
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  )
}

function FlowRow({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 text-[13px] text-[var(--text-muted)]">
      <span aria-hidden className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/15 text-[var(--primary)] text-[10px] font-black">
        ↓
      </span>
      <span className="leading-snug">{label}</span>
    </div>
  )
}
