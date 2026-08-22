import type { Metadata } from 'next'
import Link from 'next/link'
import LegalContent from '@/src/components/LegalContent'

const TITLE = 'Termos de Uso | Danos Aparentes'
const DESCRIPTION =
  'Termos de Uso do aplicativo Danos Aparentes — vistoria digital de avarias veiculares.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  // Mesmo padrão de /suporte e /privacidade: og:url alinhado ao canonical.
  alternates: { canonical: '/termos' },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: '/termos',
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

export default function TermosPage() {
  return (
    <main className="min-h-screen w-full flex flex-col items-center px-4 py-12 font-outfit text-[var(--text-main)]">
      <div className="w-full max-w-2xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors mb-6"
        >
          ← Voltar
        </Link>

        <h1 className="text-2xl font-extrabold mb-6">Termos de Uso</h1>

        <div className="bg-[var(--card-bg)]/60 border border-[var(--card-border)] rounded-2xl p-6 shadow-2xl">
          <LegalContent doc="terms" />
        </div>
      </div>
    </main>
  )
}
