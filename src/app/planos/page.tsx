import type { Metadata } from 'next'
import Link from 'next/link'
import PricingCards from '@/src/components/PricingCards'
import PlanosFinalCta from '@/src/components/PlanosFinalCta'

const TITLE = 'Planos e Preços | Danos Aparentes — Laudo de Vistoria Digital'
const DESCRIPTION =
  'Starter R$ 29,90/mês (20 laudos), Pro R$ 49,90/mês (80 laudos) — 7 dias grátis — e Corporativo Start R$ 299, Growth R$ 699 ou Enterprise a partir de R$ 1.490. Veja o que está incluído em cada plano.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/planos' },
  openGraph: { title: TITLE, description: DESCRIPTION, url: '/planos', type: 'website', images: ['/og-image.jpg'] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: ['/og-image.jpg'] },
}

const FAQ: { q: string; a: string }[] = [
  {
    q: 'Qual a diferença entre o Starter e o Pro?',
    a: 'O Starter inclui até 20 laudos em PDF por mês, ideal para quem está começando ou faz vistorias esporádicas. O Pro inclui até 80 laudos por mês, além de marca própria (nome e logotipo) e painel de estatísticas — feito para quem já tem volume constante.',
  },
  {
    q: 'E se eu ultrapassar o limite de laudos do meu plano?',
    a: 'Avisamos antes de você chegar ao limite mensal. Você pode fazer upgrade para o plano seguinte a qualquer momento, direto pelo portal de assinatura.',
  },
  {
    q: 'O laudo digital substitui 100% o processo em papel?',
    a: 'Sim. Marcação de avarias, fotos, assinatura do vistoriador e do cliente, e geração do PDF final acontecem tudo no app, inclusive offline em campo.',
  },
  {
    q: 'O laudo tem validade jurídica?',
    a: 'O laudo sai com hash SHA-256, QR Code de verificação, GPS e assinaturas digitais — um registro documental forte. O valor probatório específico depende do contexto e do aceite das partes; para casos formais, confirme com seu jurídico ou seguradora.',
  },
  {
    q: 'Preciso de cartão para testar?',
    a: 'Não. Os 7 dias grátis começam sem cobrança nem dados de cartão.',
  },
  {
    q: 'Posso cancelar quando quiser?',
    a: 'Sim, direto pelo portal de assinatura, sem multa e sem precisar falar com ninguém.',
  },
  {
    q: 'Quanto custa o plano Corporativo?',
    a: 'Há três faixas publicadas: Corporativo Start R$ 299/mês (até 5 usuários, laudos ilimitados), Growth R$ 699/mês (até 15 usuários) e Enterprise a partir de R$ 1.490/mês (15+, API e SLA). Volume customizado ou integrações além dessas faixas fecha em minutos pelo WhatsApp.',
  },
]

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ.map(f => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
}

export default function PlanosPage() {
  return (
    <main className="min-h-screen w-full flex flex-col items-center px-4 py-12 font-outfit text-[var(--text-main)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <div className="w-full max-w-6xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors mb-6"
        >
          ← Voltar
        </Link>

        {/* Hero */}
        <header className="text-center mb-12 flex flex-col items-center">
          <span className="inline-flex items-center gap-2 text-[0.7rem] font-extrabold tracking-[0.18em] uppercase text-[var(--signal-bright)] mb-3">
            <span aria-hidden="true" className="w-5 h-px bg-[var(--sheet-line)]" />
            Planos
          </span>
          <h1 className="font-display text-4xl lg:text-5xl font-bold uppercase tracking-tight leading-[0.95]">
            Escolha o Plano Ideal
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-3 max-w-lg">
            7 dias grátis, sem cartão. Starter R$ 29,90 (20 laudos/mês), Pro R$ 49,90 (80 laudos/mês) —
            Corporativo Start R$ 299, Growth R$ 699 ou Enterprise a partir de R$ 1.490.
          </p>
        </header>

        <PricingCards />

        {/* Faixa de confiança */}
        <div className="max-w-3xl mx-auto mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          {[
            { label: 'Sem cartão pra testar', desc: '7 dias grátis começam sem cobrança nem dados de pagamento.' },
            { label: 'Cancele quando quiser', desc: 'Direto pelo portal de assinatura, sem multa nem burocracia.' },
            { label: 'Dados protegidos', desc: 'Cartão via Stripe; PIX via Asaas — seus dados de pagamento nunca ficam com a gente.' },
          ].map(({ label, desc }) => (
            <div key={label}>
              <p className="text-xs font-bold text-[var(--text-main)]">{label}</p>
              <p className="text-[11px] text-[var(--text-muted)] mt-1.5">{desc}</p>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-center mb-8">
            Perguntas frequentes
          </h2>
          <div className="flex flex-col gap-6">
            {FAQ.map(({ q, a }) => (
              <div key={q} className="border-b border-[var(--card-border)]/40 pb-6">
                <p className="text-sm font-bold text-[var(--text-main)]">{q}</p>
                <p className="text-[0.8rem] text-[var(--text-muted)] mt-2 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-[var(--text-muted)] mt-8">
            Mais dúvidas sobre o app?{' '}
            <Link href="/faq" className="font-bold text-[var(--primary)] hover:underline">
              Veja o FAQ completo
            </Link>
          </p>
        </div>

        <PlanosFinalCta />
      </div>
    </main>
  )
}
