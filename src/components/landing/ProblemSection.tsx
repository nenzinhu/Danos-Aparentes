'use client'

import Reveal from '../Reveal'
import { B2B_PROBLEM_TITLE } from '@/src/lib/b2bPositioning'

const WANTS = [
  'Veículo entrou sem dano e saiu danificado',
  'Cliente contesta uma cobrança',
  'Oficina recebe veículo já danificado',
  'Empresa não descobre quando a avaria ocorreu',
  'Quantos danos teve',
  'Quem dirigia',
  'Qual oficina mexeu',
  'Fotos de todas as entregas',
]

export default function ProblemSection() {
  return (
    <section
      id="problema"
      className="w-full max-w-6xl mx-auto py-20 px-6 z-10 relative border-t border-[var(--card-border)]/40 text-left"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
        <Reveal>
          <div className="inline-flex items-center gap-2 font-mono-data text-[11px] tracking-[0.2em] text-[var(--signal-bright)] uppercase mb-4">
            <span aria-hidden="true" className="w-4 h-px bg-[var(--sheet-line)]" />
            O problema
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-tight leading-[0.95] text-[var(--text-main)] [text-wrap:balance]">
            {B2B_PROBLEM_TITLE}
          </h2>
          <p className="mt-5 text-sm sm:text-base text-[var(--text-muted)] leading-relaxed max-w-lg">
            O problema não é apenas registrar o dano. É ter evidências para comprovar quando e onde ele aconteceu.
          </p>
          <p className="mt-3 text-sm sm:text-base text-[var(--text-main)] leading-relaxed max-w-lg font-semibold">
            Sem histórico, toda devolução vira discussão — ou processo.
          </p>
          <p className="mt-6 text-sm text-[var(--text-muted)] leading-relaxed max-w-lg">
            O Danos Aparentes organiza cada inspeção em uma linha do tempo auditável — para locadoras, frotas, oficinas e quem precisa
            provar o que mudou.
          </p>
        </Reveal>

        <Reveal delay={100}>
          <p className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-[var(--signal-bright)] mb-4">
            O que a frota precisa responder
          </p>
          <ul className="space-y-2 list-none m-0 p-0">
            {WANTS.map((item) => (
              <li
                key={item}
                className="rounded-xl border border-[var(--card-border)] bg-[var(--panel-bg)]/60 px-5 py-3.5 text-sm font-semibold text-[var(--text-main)]"
              >
                {item}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  )
}
