import type { Metadata } from 'next'
import Link from 'next/link'
import LegalContent from '@/src/components/LegalContent'

export const metadata: Metadata = {
  title: 'Política de Privacidade | Danos Aparentes',
  description:
    'Política de Privacidade do Danos Aparentes — como tratamos seus dados conforme a LGPD (Lei nº 13.709/2018).',
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

        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-2xl">
          <LegalContent doc="privacy" />
        </div>
      </div>
    </main>
  )
}
