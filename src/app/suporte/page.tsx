import type { Metadata } from 'next'
import Link from 'next/link'
import SupportForm from '@/src/components/SupportForm'

const TITLE = 'Suporte | Danos Aparentes'
const DESCRIPTION =
  'Fale com o suporte do Danos Aparentes. Tire dúvidas, relate problemas técnicos, envie sugestões ou trate de assuntos financeiros e de assinatura.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  // Canonical + og:url iguais — sem isso o layout raiz herdava og:url da home
  // e o GSC reportava "Google escolheu canônico diferente" para /suporte.
  alternates: { canonical: '/suporte' },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: '/suporte',
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
        <p className="text-sm text-[var(--text-muted)] mb-4">
          Precisa de ajuda? Escolha o assunto e fale com a nossa equipe.
        </p>
        <p className="text-sm text-[var(--text-muted)] mb-8">
          Dica: muitas respostas estão nas{' '}
          <Link href="/faq" className="font-bold text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors">
            perguntas frequentes
          </Link>
          .
        </p>

        <div className="glass-card p-6 space-y-6">
          <SupportForm />
        </div>
      </div>
    </main>
  )
}
