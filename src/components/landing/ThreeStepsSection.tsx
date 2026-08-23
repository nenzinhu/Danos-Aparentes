'use client'

import Reveal from '../Reveal'

const STEPS = [
  {
    title: 'Cadastre o veículo',
    body: 'Comece grátis e registre a placa. Os dados do veículo se organizam na memória digital.',
  },
  {
    title: 'Inspecione com evidências',
    body: 'Fotografe, marque GPS, assine na tela e deixe a IA descrever a avaria — tudo vira prova.',
  },
  {
    title: 'Gere o histórico',
    body: 'Acompanhe a linha do tempo e exporte o dossiê em PDF com QR Code e Hash para validar.',
  },
]

export default function ThreeStepsSection() {
  return (
    <section
      aria-label="Como funciona"
      className="w-full z-10 relative bg-[var(--panel-bg)]/80 backdrop-blur-sm border-y border-[var(--card-border)]/60"
    >
      <div className="max-w-6xl mx-auto px-6 py-14 sm:py-16">
        <Reveal className="text-center mb-10 sm:mb-12">
          <span className="font-mono-data text-[11px] tracking-[0.2em] text-[var(--signal-bright)] uppercase">
            Como funciona
          </span>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold uppercase tracking-tight leading-[0.95] text-[var(--text-main)]">
            Registrar. Comparar. Comprovar.
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed">
            Em três passos você sai do registro de campo para um histórico verificável do veículo.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {STEPS.map((item, idx) => (
            <Reveal key={item.title} delay={idx * 120}>
              <div className="relative h-full rounded-2xl border border-[var(--card-border)] bg-[var(--bg-main)]/70 p-6 sm:p-8 transition-colors hover:border-[var(--primary)]/25">
                <span className="font-mono-data text-[11px] tracking-[0.18em] text-[var(--text-muted)]">
                  0{idx + 1}
                </span>
                <h3 className="mt-2 font-display text-xl sm:text-2xl font-bold uppercase tracking-tight text-[var(--text-main)]">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
                  {item.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}