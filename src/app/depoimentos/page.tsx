import type { Metadata } from 'next'
import Link from 'next/link'
import SocialProofSection from '@/src/components/SocialProofSection'
import LandingCtaLink from '@/src/components/LandingCtaLink'
import { SOCIAL_PROOF_QUOTES } from '@/src/lib/socialProof'
import { buttonVariants } from '@/src/components/ui/buttonVariants'

const TITLE = 'Depoimentos de clientes | Danos Aparentes'
const DESCRIPTION =
  'Relatos de locadoras e centros automotivos: menos discussão na devolução, prontuário digital do veículo e prova quando a briga vira processo.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/depoimentos' },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: '/depoimentos',
    type: 'website',
    images: ['/og-image.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: ['/og-image.jpg'],
  },
}

const reviewsJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'Danos Aparentes',
  description: DESCRIPTION,
  url: 'https://danosaparentes.com.br/depoimentos',
  brand: {
    '@type': 'Brand',
    name: 'Danos Aparentes',
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

export default function DepoimentosPage() {
  return (
    <main className="min-h-screen w-full flex flex-col items-center font-outfit text-[var(--text-main)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewsJsonLd) }}
      />

      <div className="w-full max-w-6xl px-4 pt-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors mb-6"
        >
          ← Voltar
        </Link>

        <header className="mb-2 text-center max-w-3xl mx-auto">
          <p className="font-mono-data text-[12px] tracking-[0.28em] text-[var(--signal-bright)] uppercase mb-3">
            Prova social
          </p>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-tight leading-[0.95] [text-wrap:balance]">
            Depoimentos de quem registra o estado do veículo.
          </h1>
          <p className="mt-4 text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
            Locadoras, oficinas e estacionamentos que usam vistoria de danos aparentes e histórico digital.
          </p>
        </header>
      </div>

      <SocialProofSection
        vertical="home"
        title="Três operações. Três resultados."
        subtitle="Check-out sem discussão, prontuário que fideliza e laudo que sustentou a defesa."
        className="!border-t-0"
      />

      <section className="w-full max-w-3xl mx-auto px-4 pb-16 text-center">
        <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight uppercase">
          Quer o mesmo controle na sua operação?
        </h2>
        <p className="mt-3 text-sm text-[var(--text-muted)] leading-relaxed">
          7 dias grátis, sem cartão. Ou assine com cartão (Stripe) ou PIX.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <LandingCtaLink
            id="depoimentos-cta"
            eventSource="depoimentos"
            className={buttonVariants({ variant: 'primary', size: 'lg' })}
          >
            Começar teste grátis
          </LandingCtaLink>
          <Link
            href="/planos"
            className={buttonVariants({ variant: 'secondary', size: 'lg' })}
          >
            Ver planos
          </Link>
        </div>
      </section>
    </main>
  )
}
