'use client'

import Link from 'next/link'
import Image from 'next/image'
import Reveal from '../Reveal'
import {
  IconSparkles,
  IconFolder,
  IconTrend,
  IconPin,
  IconBarChart,
  IconDocument,
  IconCar,
  IconSearch,
} from '../ui/AnimatedIcons'

const FEATURES = [
  {
    icon: IconCar,
    group: 'Registre',
    title: 'Identidade do Veículo',
    desc: 'Placa, dados e contexto da operação vinculados a cada registro.',
  },
  {
    icon: IconPin,
    group: 'Registre',
    title: 'Evidências Digitais',
    desc: 'Fotos, vídeos, documentos e observações organizados e rastreáveis.',
  },
  {
    icon: IconSparkles,
    group: 'Registre',
    title: 'Inteligência Artificial',
    desc: 'Analisa imagens e sugere a descrição dos danos para revisão humana.',
  },
  {
    icon: IconTrend,
    group: 'Compare',
    title: 'Linha do Tempo Veicular',
    desc: 'Visualize a evolução do veículo em uma linha do tempo contínua.',
  },
  {
    icon: IconBarChart,
    group: 'Compare',
    title: 'Comparação entre Inspeções',
    desc: 'Compare qualquer inspeção e audite o que mudou ao longo do tempo.',
  },
  {
    icon: IconDocument,
    group: 'Comprove',
    title: 'Dossiê Técnico',
    desc: 'Gere o relatório do histórico em PDF com QR Code e hash para verificação.',
  },
  {
    icon: IconSearch,
    group: 'Comprove',
    title: 'Auditoria',
    desc: 'Rastreabilidade completa das alterações e eventos do veículo.',
  },
  {
    icon: IconFolder,
    group: 'Preserve',
    title: 'Histórico Inteligente',
    desc: 'Toda inspeção permanece registrada — constrói a memória digital do veículo.',
  },
  {
    icon: IconCar,
    group: 'Preserve',
    title: 'Gestão de Frota',
    desc: 'Mantenha milhares de veículos sob a mesma memória digital.',
  },
] as const

const GROUPS = [
  { id: 'Registre', blurb: 'Capture o estado do veículo em cada momento.' },
  { id: 'Compare', blurb: 'Descubra o que mudou entre inspeções.' },
  { id: 'Comprove', blurb: 'Tenha evidências organizadas e verificáveis.' },
  { id: 'Preserve', blurb: 'Construa o histórico contínuo do veículo.' },
] as const

const SITE_URL = 'https://danosaparentes.com.br'
const POSTER = '/blog-covers/antes-e-depois-da-vistoria-digital.webp'
const VIDEO_TITLE = 'Plataforma: Inteligência Histórica Veicular'

/**
 * O que a plataforma faz — cards premium SaaS.
 */
export default function FeaturesGridSection() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: VIDEO_TITLE,
    description:
      'Inspeções inteligentes, evidências digitais e linha do tempo — a memória digital permanente de cada veículo.',
    thumbnailUrl: `${SITE_URL}${POSTER}`,
    contentUrl: `${SITE_URL}${POSTER}`,
    duration: 'PT38S',
    uploadDate: '2026-08-04',
    inLanguage: 'pt-BR',
    publisher: {
      '@type': 'Organization',
      name: 'Danos Aparentes',
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    },
  }

  return (
    <section
      id="recursos"
      className="w-full max-w-6xl mx-auto py-16 sm:py-20 px-6 z-10 relative border-t border-[var(--card-border)]/40"
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Reveal className="text-center mb-10 sm:mb-12 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 font-mono-data text-[11px] tracking-[0.2em] text-[var(--signal-bright)] uppercase mb-4">
          <span aria-hidden="true" className="w-4 h-px bg-[var(--sheet-line)]" />
          O que a plataforma faz
          <span aria-hidden="true" className="w-4 h-px bg-[var(--sheet-line)]" />
        </div>
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-tight leading-[0.95] text-[var(--text-main)] [text-wrap:balance] max-w-3xl">
          Registre, compare, comprove e preserve
        </h2>
        <p className="mt-4 max-w-2xl text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
          Cada registro vira uma camada do histórico: capture o estado, descubra o que mudou, tenha evidências organizadas e construa a memória digital do veículo.
        </p>
      </Reveal>

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-10 lg:gap-14 items-start">
        <Reveal>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 list-none m-0 p-0">
            {GROUPS.map((g) => {
              const items = FEATURES.filter((f) => f.group === g.id)
              return (
                <li key={g.id} className="rounded-2xl border border-[var(--card-border)] bg-[var(--panel-bg)]/40 p-4 sm:p-5">
                  <div className="mb-3 flex items-baseline justify-between gap-2">
                    <h3 className="font-display text-base sm:text-lg font-bold uppercase tracking-tight text-[var(--signal-bright)]">
                      {g.id}
                    </h3>
                  </div>
                  <p className="mb-3 text-[11px] sm:text-xs text-[var(--text-muted)] leading-snug">
                    {g.blurb}
                  </p>
                  <ul className="grid grid-cols-1 gap-3 list-none m-0 p-0">
                    {items.map((f) => {
                      const Icon = f.icon
                      return (
                        <li
                          key={f.title}
                          className="group flex items-start gap-3 rounded-xl border border-[var(--card-border)] bg-[var(--panel-bg)]/50 p-3.5 transition-all duration-200 hover:border-[var(--primary)]/35 hover:bg-[var(--panel-bg)]/80"
                        >
                          <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--card-border)] bg-[var(--btn-secondary-bg)] text-[var(--signal-bright)] transition-colors group-hover:border-[var(--primary)]/40">
                            <Icon size={18} />
                          </span>
                          <div>
                            <h4 className="text-sm font-bold text-[var(--text-main)] leading-snug">{f.title}</h4>
                            <p className="mt-1 text-xs sm:text-[13px] text-[var(--text-muted)] leading-relaxed">
                              {f.desc}
                            </p>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </li>
              )
            })}
          </ul>
          <Link
            id="home-features-cta"
            href="/app"
            className="mt-8 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-bold shadow-xl shadow-[var(--primary)]/15 focus-visible:ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-[var(--bg-main)] outline-none"
          >
            Criar meu primeiro histórico
          </Link>
        </Reveal>

        <Reveal delay={80} className="flex flex-col items-center lg:items-end sticky top-24">
          <div className="relative w-full max-w-[260px] sm:max-w-[280px] overflow-hidden rounded-2xl border border-[var(--card-border)] bg-black shadow-xl ring-1 ring-[var(--primary)]/15">
            <Image
              src={POSTER}
              alt={VIDEO_TITLE}
              width={280}
              height={498}
              sizes="(max-width: 640px) 260px, 280px"
              className="w-full h-auto aspect-[9/16] object-cover"
              priority={false}
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="flex items-center justify-center w-14 h-14 rounded-full bg-[var(--primary)]/90 text-white shadow-lg" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
              </span>
            </div>
          </div>
          <p className="mt-3 text-center lg:text-right text-xs text-[var(--text-muted)] max-w-[280px]">
            Preview da plataforma · 38s
          </p>
        </Reveal>
      </div>
    </section>
  )
}
