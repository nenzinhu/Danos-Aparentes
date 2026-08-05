'use client'

import Link from 'next/link'
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
    icon: IconSparkles,
    title: 'Inteligência Artificial',
    desc: 'Analisa imagens e sugere automaticamente a descrição dos danos.',
  },
  {
    icon: IconFolder,
    title: 'Histórico Inteligente',
    desc: 'Toda inspeção permanece registrada para consultas futuras.',
  },
  {
    icon: IconTrend,
    title: 'Linha do Tempo',
    desc: 'Visualize toda a evolução do veículo em uma linha do tempo veicular.',
  },
  {
    icon: IconPin,
    title: 'Evidências Digitais',
    desc: 'Fotos, vídeos, documentos e observações organizados e rastreáveis.',
  },
  {
    icon: IconBarChart,
    title: 'Comparação entre Inspeções',
    desc: 'Compare qualquer inspeção realizada ao longo do tempo.',
  },
  {
    icon: IconDocument,
    title: 'Dossiê Técnico',
    desc: 'Gere laudos profissionais em PDF com autenticidade verificável.',
  },
  {
    icon: IconCar,
    title: 'Gestão de Frota',
    desc: 'Controle milhares de veículos sob a mesma memória digital.',
  },
  {
    icon: IconSearch,
    title: 'Auditoria',
    desc: 'Rastreabilidade completa das alterações e eventos do veículo.',
  },
] as const

const SITE_URL = 'https://danosaparentes.com.br'
const SRC = '/videos/vistoria-digital-promo.mp4'
const POSTER = '/videos/vistoria-digital-promo-poster.webp'
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
    contentUrl: `${SITE_URL}${SRC}`,
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
          Inteligência histórica em cada camada do veículo
        </h2>
        <p className="mt-4 max-w-2xl text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
          Transformamos inspeções em inteligência, fotos em evidências e danos em histórico permanente.
        </p>
      </Reveal>

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-10 lg:gap-14 items-start">
        <Reveal>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 list-none m-0 p-0">
            {FEATURES.map((f) => {
              const Icon = f.icon
              return (
                <li
                  key={f.title}
                  className="group rounded-2xl border border-[var(--card-border)] bg-[var(--panel-bg)]/50 p-5 transition-all duration-200 hover:border-[var(--primary)]/35 hover:bg-[var(--panel-bg)]/80 hover:-translate-y-0.5"
                >
                  <div className="flex items-start gap-3.5">
                    <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--card-border)] bg-[var(--btn-secondary-bg)] text-[var(--signal-bright)] transition-colors group-hover:border-[var(--primary)]/40">
                      <Icon size={18} />
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-[var(--text-main)] leading-snug">{f.title}</h3>
                      <p className="mt-1.5 text-xs sm:text-[13px] text-[var(--text-muted)] leading-relaxed">
                        {f.desc}
                      </p>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
          <Link
            id="home-features-cta"
            href="/demo"
            className="mt-8 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-bold shadow-xl shadow-[var(--primary)]/15 focus-visible:ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-[var(--bg-main)] outline-none"
          >
            Solicitar Demonstração
          </Link>
        </Reveal>

        <Reveal delay={80} className="flex flex-col items-center lg:items-end sticky top-24">
          <div className="w-full max-w-[260px] sm:max-w-[280px] overflow-hidden rounded-2xl border border-[var(--card-border)] bg-black shadow-xl ring-1 ring-[var(--primary)]/15">
            <video
              src={SRC}
              poster={POSTER}
              controls
              playsInline
              preload="metadata"
              aria-label={VIDEO_TITLE}
              className="w-full h-auto aspect-[9/16]"
            />
          </div>
          <p className="mt-3 text-center lg:text-right text-xs text-[var(--text-muted)] max-w-[280px]">
            Preview da plataforma · 38s
          </p>
        </Reveal>
      </div>
    </section>
  )
}
