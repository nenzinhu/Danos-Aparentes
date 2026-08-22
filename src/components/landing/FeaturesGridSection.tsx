'use client'

import Link from 'next/link'
import Reveal from '../Reveal'
import TabbedCarousel, { type CarouselTab } from './TabbedCarousel'
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

const TABS: CarouselTab[] = [
  {
    id: 'Registre',
    label: 'Registre',
    blurb: 'Capture o estado do veículo em cada momento.',
    items: [
      {
        icon: <IconCar size={18} />,
        title: 'Identidade do Veículo',
        desc: 'Placa, dados e contexto da operação vinculados a cada registro.',
      },
      {
        icon: <IconPin size={18} />,
        title: 'Evidências Digitais',
        desc: 'Fotos, vídeos, documentos e observações organizados e rastreáveis.',
      },
      {
        icon: <IconSparkles size={18} />,
        title: 'Inteligência Artificial',
        desc: 'Analisa imagens e sugere a descrição dos danos para revisão humana.',
      },
    ],
  },
  {
    id: 'Compare',
    label: 'Compare',
    blurb: 'Descubra o que mudou entre inspeções.',
    items: [
      {
        icon: <IconTrend size={18} />,
        title: 'Linha do Tempo Veicular',
        desc: 'Visualize a evolução do veículo em uma linha do tempo contínua.',
      },
      {
        icon: <IconBarChart size={18} />,
        title: 'Comparação entre Inspeções',
        desc: 'Compare qualquer inspeção e audite o que mudou ao longo do tempo.',
      },
    ],
  },
  {
    id: 'Comprove',
    label: 'Comprove',
    blurb: 'Tenha evidências organizadas e verificáveis.',
    items: [
      {
        icon: <IconDocument size={18} />,
        title: 'Dossiê Técnico',
        desc: 'Gere o relatório do histórico em PDF com QR Code e hash para verificação.',
      },
      {
        icon: <IconSearch size={18} />,
        title: 'Auditoria',
        desc: 'Rastreabilidade completa das alterações e eventos do veículo.',
      },
    ],
  },
  {
    id: 'Preserve',
    label: 'Preserve',
    blurb: 'Construa o histórico contínuo do veículo.',
    items: [
      {
        icon: <IconFolder size={18} />,
        title: 'Histórico Inteligente',
        desc: 'Toda inspeção permanece registrada — constrói a memória digital do veículo.',
      },
      {
        icon: <IconCar size={18} />,
        title: 'Gestão de Frota',
        desc: 'Mantenha milhares de veículos sob a mesma memória digital.',
      },
    ],
  },
]

const SITE_URL = 'https://danosaparentes.com.br'
const POSTER = '/blog-covers/antes-e-depois-da-vistoria-digital.webp'
const VIDEO_TITLE = 'Plataforma: Inteligência Histórica Veicular'

/**
 * O que a plataforma faz — Tabbed Desktop Carousel (mobile: swipeable cards).
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
          Cada inspeção vira uma camada do histórico. Veja como funciona na prática.
        </p>
      </Reveal>

      <Reveal>
        <TabbedCarousel
          id="recursos-carousel"
          tabs={TABS}
          cta={
            <Link
              id="home-features-cta"
              href="/app"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-bold shadow-xl shadow-[var(--primary)]/15 focus-visible:ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-[var(--bg-main)] outline-none"
            >
              Crie o histórico do seu primeiro veículo gratuitamente
            </Link>
          }
        />
      </Reveal>
    </section>
  )
}
