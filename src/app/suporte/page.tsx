import type { Metadata } from 'next'
import Link from 'next/link'
import SupportForm from '@/src/components/SupportForm'

export const metadata: Metadata = {
  title: 'Suporte | Danos Aparentes',
  description:
    'Fale com o suporte do Danos Aparentes. Tire dúvidas, relate problemas técnicos, envie sugestões ou trate de assuntos financeiros e de assinatura.',
}

export default function SuportePage() {
  return (
    <main className="min-h-screen w-full flex flex-col items-center px-4 py-12 font-outfit text-[var(--text-main)]">
      <div className="w-full max-w-2xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors mb-6"
        >
          ← Voltar
        </Link>

        <h1 className="text-2xl font-extrabold mb-1">Suporte</h1>
        <p className="text-sm text-[var(--text-muted)] mb-8">
          Precisa de ajuda? Escolha o assunto e fale com a nossa equipe.
        </p>

        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-2xl">
          <SupportForm />
        </div>
      </div>
    </main>
  )
}
