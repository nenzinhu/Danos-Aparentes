import type { Metadata } from 'next'
import Link from 'next/link'
import FaqAccordion from '@/src/components/FaqAccordion'
import { FAQ_PLAIN } from '@/src/components/faqData'

const FAQ_DESCRIPTION =
  'Central de ajuda do Danos Aparentes: vistoria, GPS, laudo em PDF, assinaturas, conta, dados e uso offline (PWA). Tire suas dúvidas.'

export const metadata: Metadata = {
  title: 'Perguntas Frequentes | Danos Aparentes',
  description: FAQ_DESCRIPTION,
  alternates: { canonical: '/faq' },
  openGraph: {
    title: 'Perguntas Frequentes | Danos Aparentes',
    description: FAQ_DESCRIPTION,
    url: '/faq',
    type: 'website',
    images: ['/og-image.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Perguntas Frequentes | Danos Aparentes',
    description: FAQ_DESCRIPTION,
    images: ['/og-image.jpg'],
  },
}

// Rich result do Google (FAQPage) — derivado do mesmo conteúdo do acordeão.
const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  speakable: {
    '@type': 'SpeakableSpecification',
    cssSelector: ['.faq-speakable-title', '.faq-speakable-intro'],
  },
  mainEntity: FAQ_PLAIN.map(f => ({
    '@type': 'Question',
    name: f.question,
    acceptedAnswer: { '@type': 'Answer', text: f.answer },
  })),
}

export default function FaqPage() {
  return (
    <main className="min-h-screen w-full flex flex-col items-center px-4 py-12 font-outfit text-[var(--text-main)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="w-full max-w-2xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors mb-6"
        >
          ← Voltar
        </Link>

        <header className="mb-8">
          <span className="inline-flex items-center gap-2 text-[0.7rem] font-extrabold tracking-[0.14em] uppercase text-[var(--signal)] mb-3">
            Central de Ajuda
          </span>
          <h1 className="faq-speakable-title text-2xl font-extrabold mb-1">Perguntas Frequentes</h1>
          <p className="faq-speakable-intro text-sm text-[var(--text-muted)]">
            Tudo sobre vistorias, laudos, assinatura e uso do app em campo.
          </p>
        </header>

        <FaqAccordion />

        <section className="mt-10 text-center glass-card p-8">
          <h2 className="text-lg font-bold mb-1.5">Ainda com dúvidas?</h2>
          <p className="text-sm text-[var(--text-muted)] mb-5">
            Nossa equipe ajuda você a tirar o máximo das suas vistorias.
          </p>
          <Link
            href="/suporte"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-extrabold text-sm bg-primary hover:bg-primary-hover text-white shadow-xl shadow-[var(--primary)]/15 transition-[transform,background-color] motion-safe:hover:-translate-y-0.5"
          >
            Falar com o suporte
          </Link>
        </section>
      </div>
    </main>
  )
}
