import type { Metadata } from 'next'
import Link from 'next/link'
import {
  LEGAL_CNPJ,
  LEGAL_COMPANY_NAME,
  LEGAL_CONTACT_EMAIL,
} from '@/src/components/LegalContent'
import {
  COMPANY_LINKEDIN,
  FOUNDER_LINKEDIN,
  FOUNDER_NAME,
  NAP,
  SITE_URL,
} from '@/src/lib/seo/entity'

const DESCRIPTION =
  'Quem está por trás do Danos Aparentes: Jeferson da Silva, em Florianópolis/SC. App de vistoria digital de avarias veiculares com laudo verificável (hash, QR Code, GPS).'

export const metadata: Metadata = {
  title: 'Sobre | Danos Aparentes',
  description: DESCRIPTION,
  alternates: { canonical: '/sobre' },
  openGraph: {
    title: 'Sobre | Danos Aparentes',
    description: DESCRIPTION,
    url: '/sobre',
    type: 'website',
    images: ['/og-image.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sobre | Danos Aparentes',
    description: DESCRIPTION,
    images: ['/og-image.jpg'],
  },
}

const aboutPageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  '@id': `${SITE_URL}/sobre`,
  name: 'Sobre o Danos Aparentes',
  description: DESCRIPTION,
  url: `${SITE_URL}/sobre`,
  inLanguage: 'pt-BR',
  isPartOf: { '@id': `${SITE_URL}/#website` },
  about: { '@id': `${SITE_URL}/#organization` },
  mainEntity: { '@id': `${SITE_URL}/#/schema/person/jeferson` },
}

export default function SobrePage() {
  return (
    <main className="min-h-screen w-full flex flex-col items-center px-4 py-12 font-outfit text-[var(--text-main)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutPageJsonLd) }}
      />

      <div className="w-full max-w-2xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors mb-6"
        >
          ← Voltar
        </Link>

        <header className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">
            Sobre o Danos Aparentes
          </h1>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">
            O Danos Aparentes é um app de vistoria digital de avarias veiculares para locadoras,
            frotas, oficinas e operações de pátio no Brasil. A proposta é simples: gerar um laudo
            que comprova a si mesmo — com fotos, GPS, assinatura, hash SHA-256 e QR Code — inclusive
            offline.
          </p>
        </header>

        <section className="mb-8 space-y-3">
          <h2 className="text-lg font-bold">Quem está por trás</h2>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">
            O produto é desenvolvido e operado por{' '}
            <a
              href={FOUNDER_LINKEDIN}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-semibold text-[var(--text-main)]"
            >
              {FOUNDER_NAME}
            </a>
            , fundador, em {NAP.locality}/{NAP.region}. Ainda não há histórico público de clientes —
            a credibilidade hoje vem da verificabilidade técnica de cada laudo.
          </p>
        </section>

        <section className="mb-8 space-y-3">
          <h2 className="text-lg font-bold">O que não somos</h2>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">
            Não emitimos laudo cautelar DETRAN nem temos convênio com órgãos públicos. O foco é o{' '}
            <strong className="text-[var(--text-main)] font-semibold">laudo de avarias aparentes</strong>{' '}
            — prova operacional para entrega, devolução, sinistro e padronização de equipe.
          </p>
        </section>

        <section className="glass-card p-6 sm:p-8 mb-10 space-y-3">
          <h2 className="text-lg font-bold">Contato e empresa</h2>
          <p className="text-sm text-[var(--text-main)]">
            <strong>{LEGAL_COMPANY_NAME}</strong> — CNPJ {LEGAL_CNPJ}
          </p>
          <ul className="text-sm text-[var(--text-muted)] space-y-2">
            <li>
              LinkedIn da empresa:{' '}
              <a
                href={COMPANY_LINKEDIN}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Danos Aparentes no LinkedIn
              </a>
            </li>
            <li>
              E-mail:{' '}
              <a href={`mailto:${LEGAL_CONTACT_EMAIL}`} className="text-primary hover:underline">
                {LEGAL_CONTACT_EMAIL}
              </a>
            </li>
            <li>
              WhatsApp:{' '}
              <a
                href={`https://wa.me/${NAP.telephone.replace('+', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {NAP.telephoneDisplay}
              </a>
            </li>
            <li>
              {NAP.locality}, Santa Catarina, Brasil
            </li>
          </ul>
        </section>

        <nav className="flex flex-wrap gap-4 text-sm font-bold" aria-label="Próximos passos">
          <Link href="/planos" className="text-primary hover:underline">
            Ver planos →
          </Link>
          <Link href="/blog" className="text-primary hover:underline">
            Blog →
          </Link>
          <Link href="/faq" className="text-primary hover:underline">
            FAQ →
          </Link>
        </nav>
      </div>
    </main>
  )
}
