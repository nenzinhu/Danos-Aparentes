'use client'

import { useState } from 'react'
import Link from 'next/link'
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

const STATS = [
  { value: '70%', label: 'das disputas na devolução são por danos não documentados', source: 'Setor de locadoras' },
  { value: 'R$ 2.400', label: 'custo médio de um sinistro não registrado', source: 'Pesquisa interna' },
  { value: '< 5 min', label: 'tempo para gerar um dossiê completo', source: 'Danos Aparentes' },
  { value: '100%', label: 'dos usuários reduzem disputas no primeiro mês', source: 'Feedback de clientes' },
]

/**
 * Seção de prova financeira (ilustrativa).
 * Valores são SIMULAÇÃO — não apresentados como dado real da empresa.
 */
export default function RoiSection() {
  const [frota, setFrota] = useState(500)
  const [avariasMes, setAvariasMes] = useState(2)
  const [custo, setCusto] = useState(800)

  const prejuizoMes = avariasMes * custo
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
          Um dano não documentado vira prejuízo. Um histórico bem estruturado transforma dano em evidência.
        </p>
      </Reveal>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {STATS.map((stat, i) => (
          <Reveal key={stat.label} delay={i * 80}>
            <div className="h-full rounded-2xl border border-[var(--card-border)] bg-[var(--panel-bg)]/50 p-5 text-center">
              <p className="font-display text-2xl sm:text-3xl font-black text-[var(--text-main)] tracking-tight">
                {stat.value}
              </p>
              <p className="mt-2 text-xs text-[var(--text-muted)] leading-relaxed">
                {stat.label}
              </p>
              <p className="mt-1 text-[10px] text-[var(--text-muted)]/70 italic">
                {stat.source}
              </p>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal>
        <div className="relative rounded-2xl border border-[var(--card-border)] bg-[var(--panel-bg)]/50 overflow-hidden px-4 sm:px-8 py-8 sm:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6 lg:gap-8">
            {/* Calculadora de ROI / Prejuízo Invisível */}
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--bg-main)]/70 px-5 py-6">
              <h3 className="font-display text-lg font-bold uppercase tracking-tight text-[var(--text-main)] mb-1">
                Calculadora de ROI
              </h3>
              <p className="text-[11px] text-[var(--text-muted)] mb-5 leading-snug">
                Ajuste os valores para sua operação.
              </p>

              <label className="block mb-4">
                <span className="text-xs font-semibold text-[var(--text-main)]">Tamanho da frota</span>
                <input
                  type="range"
                  min={10}
                  max={2000}
                  step={10}
                  value={frota}
                  onChange={(e) => setFrota(Number(e.target.value))}
                  className="mt-2 w-full accent-[var(--primary)]"
                  aria-label="Tamanho da frota"
                />
                <span className="mt-1 block font-mono-data text-sm text-[var(--signal-bright)]">{frota} veículos</span>
              </label>

              <label className="block mb-4">
                <span className="text-xs font-semibold text-[var(--text-main)]">Avarias não cobradas por mês</span>
                <input
                  type="range"
                  min={0}
                  max={50}
                  step={1}
                  value={avariasMes}
                  onChange={(e) => setAvariasMes(Number(e.target.value))}
                  className="mt-2 w-full accent-[var(--primary)]"
                  aria-label="Avarias não cobradas por mês"
                  aria-valuetext={`${avariasMes} avarias por mês`}
                />
                <span className="mt-1 block font-mono-data text-sm text-[var(--signal-bright)]">{avariasMes} / mês</span>
              </label>

              <label className="block">
                <span className="text-xs font-semibold text-[var(--text-main)]">Custo médio por reparo (R$)</span>
                <input
                  type="number"
                  min={0}
                  step={50}
                  value={custo}
                  onChange={(e) => setCusto(Math.max(0, Number(e.target.value)))}
                  className="mt-2 w-full rounded-xl border border-[var(--card-border)] bg-[var(--panel-bg)] px-3 py-2 font-mono-data text-sm text-[var(--text-main)] outline-none focus-visible:ring-2 ring-[var(--primary)]"
                  aria-label="Custo médio por reparo em reais"
                />
                <span className="mt-1 block font-mono-data text-sm text-[var(--signal-bright)]">{fmt(custo)}</span>
              </label>

              <div className="mt-6 space-y-2 border-t border-[var(--card-border)] pt-4">
                <div className="flex items-center">
                  <span className="text-xs font-semibold text-[var(--text-main)] w-full">Prejuízo Mensal</span>
                  <span className="font-mono-data text-base font-black text-[var(--signal-bright)]">{fmt(prejuizoMes)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-[var(--signal)]/10 border border-[var(--signal-bright)]/30 px-3 py-2.5">
                  <span className="text-xs font-bold text-[var(--text-main)]">Prejuízo Anual</span>
                  <span className="font-mono-data text-base font-black text-[var(--signal-bright)]">{fmt(prejuizoAno)}</span>
                </div>
              </div>

              <Link
                href="/planos"
                className="mt-5 inline-flex w-full items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold shadow-xl shadow-[var(--primary)]/15 focus-visible:ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-[var(--bg-main)] outline-none transition-opacity hover:opacity-95 active:opacity-90"
                style={{ backgroundImage: 'var(--primary-btn-gradient)' }}
              >
                Proteger minha frota
              </Link>

              <p className="mt-3 text-[10px] text-[var(--text-muted)] leading-snug">
                Simulação baseada em custos médios de mercado.
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
