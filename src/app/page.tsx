import type { Metadata } from 'next'
import LandingPageClient from '@/src/components/landing/LandingPageClient'
import { HOME_FAQ_ITEMS } from '@/src/lib/landingHomeFaq'
import { SOCIAL_PROOF_QUOTES } from '@/src/lib/socialProof'
import { B2B_BRAND } from '@/src/lib/b2bPositioning'

const HOME_PUBLISHED_DATE = '2026-01-15'
const HOME_UPDATED_DATE = '2026-08-06'
const SITE_URL = 'https://danosaparentes.com.br'

const HOME_TITLE = `Vistoria veicular com laudo e histórico | ${B2B_BRAND}`
const HOME_DESCRIPTION =
  'Registre o estado do veículo, compare inspeções e tenha um histórico digital com evidências, fotos, GPS, data/hora e dossiê técnico em PDF. Comece grátis.'

export const metadata: Metadata = {
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  alternates: { canonical: '/' },
  openGraph: {
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    url: '/',
    siteName: B2B_BRAND,
    locale: 'pt_BR',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: `${B2B_BRAND} — Histórico Digital do Veículo`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    images: ['/og-image.jpg'],
  },
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: HOME_FAQ_ITEMS.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: item.a },
  })),
}

const landingJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: B2B_BRAND,
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web, Android, iOS (PWA)',
  url: SITE_URL,
  description:
    'A primeira Plataforma Brasileira de Inteligência Histórica Veicular. Memória digital permanente: inspeções, evidências, linha do tempo e dossiês técnicos.',
  inLanguage: 'pt-BR',
  datePublished: HOME_PUBLISHED_DATE,
  dateModified: HOME_UPDATED_DATE,
  offers: {
    '@type': 'AggregateOffer',
    priceCurrency: 'BRL',
    lowPrice: '29.90',
    highPrice: '299.00',
    offerCount: 3,
    offers: [
      {
        '@type': 'Offer',
        name: 'Starter',
        price: '29.90',
        priceCurrency: 'BRL',
        description: 'Até 20 inspeções por mês',
        url: `${SITE_URL}/planos`,
      },
      {
        '@type': 'Offer',
        name: 'Pro',
        price: '79.90',
        priceCurrency: 'BRL',
        description: 'Até 80 inspeções por mês com marca própria',
        url: `${SITE_URL}/planos`,
      },
      {
        '@type': 'Offer',
        name: 'Corporativo Start',
        price: '299.00',
        priceCurrency: 'BRL',
        description: 'Até 5 usuários · inspeções ilimitadas',
        url: `${SITE_URL}/planos`,
      },
    ],
  },
  publisher: {
    '@type': 'Organization',
    name: B2B_BRAND,
    url: SITE_URL,
    logo: `${SITE_URL}/logo-full.png`,
  },
  review: SOCIAL_PROOF_QUOTES.map((q) => ({
    '@type': 'Review',
    name: q.headline,
    reviewBody: q.body,
    author: {
      '@type': 'Person',
      name: q.name,
      jobTitle: q.role,
    },
  })),
}

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: B2B_BRAND,
  url: SITE_URL,
  inLanguage: 'pt-BR',
  description: `${B2B_BRAND} — a primeira Plataforma Brasileira de Inteligência Histórica Veicular.`,
  publisher: {
    '@type': 'Organization',
    name: B2B_BRAND,
    url: SITE_URL,
  },
}

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: `${SITE_URL}/`,
    },
  ],
}

const speakableJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: `${B2B_BRAND} | Histórico Digital do Veículo`,
  speakable: {
    '@type': 'SpeakableSpecification',
    cssSelector: ['.speakable', 'h1', 'h2'],
  },
  url: `${SITE_URL}/`,
}

function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

/** Home em Server Component: metadata + JSON-LD no servidor; UI interativa no client. */
export default function HomePage() {
  return (
    <>
      <JsonLd data={landingJsonLd} />
      <JsonLd data={faqJsonLd} />
      <JsonLd data={websiteJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={speakableJsonLd} />
      <LandingPageClient />
    </>
  )
}
