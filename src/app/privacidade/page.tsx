import type { Metadata } from 'next'
import Link from 'next/link'
import LegalContent from '@/src/components/LegalContent'

const TITLE = 'Política de Privacidade | Danos Aparentes'
const DESCRIPTION =
  'Política de Privacidade do Danos Aparentes: como coletamos, usamos, armazenamos e protegemos seus dados conforme a LGPD (Lei nº 13.709/2018).'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  // Canonical + og:url iguais — evita GSC "canônico diferente da home"
  // (og:url herdado do layout raiz apontava para /).
  alternates: { canonical: '/privacidade' },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: '/privacidade',
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

export default function PrivacidadePage() {
  return (
    <main className="min-h-screen w-full flex flex-col items-center px-4 py-12 font-outfit text-[var(--text-main)]">
      <div className="w-full max-w-2xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors mb-6"
        >
          ← Voltar
        </Link>

        <h1 className="text-2xl font-extrabold mb-6">Política de Privacidade</h1>

        <div className="bg-[var(--card-bg)]/60 border border-[var(--card-border)] rounded-2xl p-6 shadow-2xl">
          <LegalContent doc="privacy" />
        </div>
      </div>
    </main>
  )
}
