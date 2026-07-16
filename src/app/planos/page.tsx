import type { Metadata } from 'next'
import Link from 'next/link'
import PricingCards from '@/src/components/PricingCards'
import PlanosFinalCta from '@/src/components/PlanosFinalCta'

const TITLE = 'Planos e Preços | Danos Aparentes — Laudo de Vistoria Digital'
const DESCRIPTION =
  'Plano Pro por R$ 49,90/mês com 7 dias grátis, ou Corporativo sob medida para frotas e locadoras. Veja o que está incluído em cada plano.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/planos' },
  openGraph: { title: TITLE, description: DESCRIPTION, url: '/planos', type: 'website', images: ['/og-image.jpg'] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: ['/og-image.jpg'] },
}

const FAQ: { q: string; a: string }[] = [
  {
    q: 'R$ 49,90/mês vale a pena pra quem faz poucas vistorias?',
    a: 'Um único laudo terceirizado já custa perto disso. Com o Pro você tem vistorias ilimitadas no mês — a partir da segunda vistoria, já compensa.',
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
    a: 'Varia por volume de vistorias, número de usuários e integrações (ERP/CRM), por isso é sob consulta — mas a resposta é rápida, em minutos, pelo WhatsApp.',
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

      <div className="w-full max-w-5xl">
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
            7 dias grátis, sem cartão. Depois, menos de R$ 1,70 por dia no plano Pro — ou fale com a
            gente pra montar um plano Corporativo sob medida.
          </p>
        </header>

        <PricingCards />

        {/* Faixa de confiança */}
        <div className="max-w-3xl mx-auto mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          {[
            { label: 'Sem cartão pra testar', desc: '7 dias grátis começam sem cobrança nem dados de pagamento.' },
            { label: 'Cancele quando quiser', desc: 'Direto pelo portal de assinatura, sem multa nem burocracia.' },
            { label: 'Dados protegidos', desc: 'Cartão via Stripe; PIX via Mercado Pago — seus dados de pagamento nunca ficam com a gente.' },
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
