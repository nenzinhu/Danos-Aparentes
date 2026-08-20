'use client'

import Reveal from '../Reveal'
import TabsCarousel, { type CarouselTabItem } from './TabsCarousel'

const STEPS: CarouselTabItem[] = [
  {
    id: 'inspecione',
    label: '01 · Inspecione',
    content: (
      <>
        <p className="font-mono-data text-4xl font-black text-[var(--signal)]/35">01</p>
        <h3 className="mt-2 font-display text-xl sm:text-2xl font-bold uppercase tracking-tight text-[var(--text-main)] [text-wrap:balance]">
          Inspecione
        </h3>
        <p className="mt-4 text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
          Veículo, responsável, data/hora e geolocalização. Cada inspeção inicia a linha do tempo do veículo.
        </p>
      </>
    ),
  },
  {
    id: 'documente',
    label: '02 · Documente',
    content: (
      <>
        <p className="font-mono-data text-4xl font-black text-[var(--signal)]/35">02</p>
        <h3 className="mt-2 font-display text-xl sm:text-2xl font-bold uppercase tracking-tight text-[var(--text-main)] [text-wrap:balance]">
          Documente
        </h3>
        <p className="mt-4 text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
          Transforme o dano em evidência: fotos com metadados, peças marcadas no diagrama e validação
          visual. Cada avaria vira um registro rastreável.
        </p>
      </>
    ),
  },
  {
    id: 'compare',
    label: '03 · Compare',
    content: (
      <>
        <p className="font-mono-data text-4xl font-black text-[var(--signal)]/35">03</p>
        <h3 className="mt-2 font-display text-xl sm:text-2xl font-bold uppercase tracking-tight text-[var(--text-main)] [text-wrap:balance]">
          Compare
        </h3>
        <p className="mt-4 text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
          Descubra o que mudou: Antes × Depois, avarias novas versus reparadas. O sistema revela a evolução
          de cada dano ao longo do histórico.
        </p>
      </>
    ),
  },
  {
    id: 'comprove',
    label: '04 · Comprove',
    content: (
      <>
        <p className="font-mono-data text-4xl font-black text-[var(--signal)]/35">04</p>
        <h3 className="mt-2 font-display text-xl sm:text-2xl font-bold uppercase tracking-tight text-[var(--text-main)] [text-wrap:balance]">
          Comprove
        </h3>
        <p className="mt-4 text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
          De "eu acho" para "eu consigo provar": QR Code, Hash SHA-256 e PDF rastreável.
          Tenha provas organizadas para cobrar, defender ou fechar sem discussão.
        </p>
      </>
    ),
  },
]

export default function HowItWorksHistorySection() {
  return (
    <section
      id="como-funciona"
      className="w-full max-w-6xl mx-auto py-16 sm:py-20 px-6 z-10 relative border-t border-[var(--card-border)]/40"
    >
      <Reveal className="text-center mb-10 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 font-mono-data text-[11px] tracking-[0.2em] text-[var(--signal-bright)] uppercase mb-4">
          <span aria-hidden="true" className="w-4 h-px bg-[var(--sheet-line)]" />
          Registre · Como funciona
          <span aria-hidden="true" className="w-4 h-px bg-[var(--sheet-line)]" />
        </div>
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-tight leading-[0.95] text-[var(--text-main)] [text-wrap:balance] max-w-3xl">
          Da inspeção à evidência em quatro passos.
        </h2>
        <p className="mt-4 max-w-2xl text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
          Cada etapa transforma uma inspeção em evidência. Não é um checklist — é a construção contínua do
          histórico que prova quando e onde cada dano aconteceu.
        </p>
      </Reveal>

      <Reveal>
        <TabsCarousel id="como-funciona-carousel" tabs={STEPS} ariaLabel="Etapas da plataforma" />
      </Reveal>
    </section>
  )
}
