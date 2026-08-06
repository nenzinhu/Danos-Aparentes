import type { Metadata } from 'next'
import Link from 'next/link'
import PricingCards from '@/src/components/PricingCards'
import PlanosFinalCta from '@/src/components/PlanosFinalCta'
import PlanosCompareTable from '@/src/components/PlanosCompareTable'
import LandingCtaLink from '@/src/components/LandingCtaLink'
import SocialProofSection from '@/src/components/SocialProofSection'
import { buttonVariants } from '@/src/components/ui/buttonVariants'
import { whatsappLink } from '@/src/lib/whatsapp'

const TITLE = 'Planos e Preços | Danos Aparentes — Inteligência Histórica Veicular'
const DESCRIPTION =
  'Escolha o plano ideal para registrar inspeções, documentar avarias e construir a memória digital dos seus veículos. Teste grátis por 7 dias, sem cartão.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/planos' },
  openGraph: { title: TITLE, description: DESCRIPTION, url: '/planos', type: 'website', images: ['/og-image.jpg'] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: ['/og-image.jpg'] },
}

const VALUE_FLOW = ['Inspeção', 'Avaria', 'Foto', 'Histórico', 'Comparação', 'Dossiê'] as const

const GROWTH_STEPS = [
  { name: 'Starter', line: 'Comece a registrar.' },
  { name: 'Pro', line: 'Organize mais inspeções.' },
  { name: 'Corporativo', line: 'Centralize sua equipe.' },
  { name: 'Enterprise', line: 'Integre sua operação.' },
] as const

const FAQ: { q: string; a: string }[] = [
  {
    q: 'O que é uma inspeção?',
    a: 'É um registro do estado do veículo em um determinado momento, com informações sobre avarias, fotos e evidências.',
  },
  {
    q: 'O que é a memória digital do veículo?',
    a: 'É o conjunto organizado das inspeções realizadas ao longo do tempo, permitindo acompanhar o estado do veículo e consultar seus registros anteriores.',
  },
  {
    q: 'O dossiê PDF está incluído?',
    a: 'Sim. O dossiê é gerado a partir dos dados registrados durante a inspeção, conforme os recursos disponíveis em cada plano. O PDF é uma saída da plataforma — o produto principal é a linha do tempo veicular.',
  },
  {
    q: 'Posso comparar diferentes inspeções?',
    a: 'Sim. A plataforma permite consultar o histórico do veículo e comparar diferentes momentos para identificar alterações e novas avarias.',
  },
  {
    q: 'A IA substitui o inspetor?',
    a: 'Não. A inteligência artificial atua como apoio à análise e descrição das avarias nos planos com assinatura ativa. O inspetor mantém o controle sobre a confirmação e validação do registro.',
  },
  {
    q: 'Qual a diferença entre o Starter e o Pro?',
    a: 'O Starter inclui até 20 inspeções por mês, ideal para quem está começando ou faz inspeções ocasionalmente. O Pro inclui até 80 inspeções por mês, personalização com marca da empresa no PDF, painel de estatísticas e modelos de dossiê — melhor custo-benefício para quem já tem volume constante.',
  },
  {
    q: 'E se eu ultrapassar o limite de inspeções do meu plano?',
    a: 'Avisamos antes de você chegar ao limite mensal. Você pode fazer upgrade para o plano seguinte a qualquer momento, direto pelo portal de assinatura.',
  },
  {
    q: 'O dossiê digital substitui 100% o processo em papel?',
    a: 'Sim. Marcação de avarias, fotos, assinatura do inspetor e do cliente, e geração do PDF final acontecem tudo na plataforma, inclusive offline em campo. Cada inspeção alimenta a memória digital do veículo.',
  },
  {
    q: 'O dossiê tem validade jurídica?',
    a: 'O dossiê sai com hash SHA-256, QR Code de verificação, GPS e assinaturas digitais — um registro documental forte. O valor probatório específico depende do contexto e do aceite das partes; para casos formais, confirme com seu jurídico ou seguradora.',
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
    a: 'Há três faixas publicadas: Corporativo Start R$ 299/mês (até 5 usuários, inspeções ilimitadas), Growth R$ 699/mês (até 15 usuários) e Enterprise a partir de R$ 1.490/mês (15+, API e SLA). Volume customizado ou integrações além dessas faixas fecha em minutos pelo WhatsApp.',
  },
]

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
}

const pricingJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Danos Aparentes',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web, Android, iOS (PWA)',
  url: 'https://danosaparentes.com.br/planos',
  offers: [
    {
      '@type': 'Offer',
      name: 'Starter',
      price: '29.90',
      priceCurrency: 'BRL',
      description: 'Até 20 inspeções/mês — memória digital do veículo',
      url: 'https://danosaparentes.com.br/planos',
    },
    {
      '@type': 'Offer',
      name: 'Pro',
      price: '79.90',
      priceCurrency: 'BRL',
      description: 'Até 80 inspeções/mês com marca própria',
      url: 'https://danosaparentes.com.br/planos',
    },
    {
      '@type': 'Offer',
      name: 'Corporativo Start',
      price: '299.00',
      priceCurrency: 'BRL',
      description: 'Até 5 usuários · inspeções ilimitadas',
      url: 'https://danosaparentes.com.br/planos',
    },
  ],
}

export default function PlanosPage() {
  return (
    <>
      <a href="#planos-content" className="skip-link">
        Ir para o conteúdo
      </a>
      <main
        id="planos-content"
        tabIndex={-1}
        className="min-h-screen w-full flex flex-col items-center px-4 py-12 font-outfit text-[var(--text-main)] outline-none"
      >
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingJsonLd) }} />

        <div className="w-full max-w-6xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors mb-6"
          >
            ← Voltar
          </Link>

          {/* Hero */}
          <header className="text-center mb-10 flex flex-col items-center">
            <span className="inline-flex items-center gap-2 text-[0.7rem] font-extrabold tracking-[0.18em] uppercase text-[var(--signal-bright)] mb-3">
              <span aria-hidden="true" className="w-5 h-px bg-[var(--sheet-line)]" />
              Planos
            </span>
            <h1 className="font-display text-4xl lg:text-5xl font-bold uppercase tracking-tight leading-[0.95] max-w-3xl">
              Comece a construir o histórico dos seus veículos.
            </h1>
            <p className="text-sm sm:text-base text-[var(--text-muted)] mt-4 max-w-2xl leading-relaxed">
              Teste o Danos Aparentes por 7 dias grátis, sem cartão. Registre inspeções, documente avarias e
              mantenha a memória digital de cada veículo.
            </p>
            <p className="text-sm text-[var(--text-muted)] mt-2 max-w-xl">
              Escolha o plano ideal para o volume da sua operação.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-sm font-extrabold">
              <span className="rounded-full border border-[var(--signal-bright)]/40 bg-[var(--signal-bright)]/10 px-3 py-1 text-[var(--signal-bright)]">
                7 dias grátis
              </span>
              <span className="rounded-full border border-[var(--card-border)]/60 px-3 py-1 text-[var(--text-main)]">
                Sem cartão de crédito
              </span>
            </div>
            <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full max-w-md">
              <LandingCtaLink
                id="planos-hero-trial-cta"
                eventSource="planos"
                className={buttonVariants({ variant: 'primary', size: 'md', className: 'w-full sm:flex-1' })}
              >
                Começar teste grátis
              </LandingCtaLink>
              <a
                href="#recursos-planos"
                className={buttonVariants({ variant: 'secondary', size: 'md', className: 'w-full sm:flex-1' })}
              >
                Ver recursos
              </a>
            </div>
          </header>

          {/* Valor: não é só laudo */}
          <section
            aria-labelledby="valor-historico-heading"
            className="max-w-3xl mx-auto mb-12 text-center border border-[var(--card-border)]/50 rounded-2xl px-5 py-8 bg-[var(--panel-bg)]/40"
          >
            <h2 id="valor-historico-heading" className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
              Não é apenas um dossiê.
            </h2>
            <p className="mt-1 text-lg font-extrabold text-[var(--signal-bright)]">É a linha do tempo veicular.</p>
            <p className="text-sm text-[var(--text-muted)] mt-4 leading-relaxed max-w-xl mx-auto">
              Cada inspeção registra um novo evento do veículo. As avarias são localizadas no diagrama, as fotos
              ficam vinculadas ao registro e as evidências digitais são organizadas para facilitar futuras consultas e
              comparações.
            </p>
            <ol className="mt-7 flex flex-wrap items-center justify-center gap-x-2 gap-y-3 text-[11px] sm:text-xs font-extrabold uppercase tracking-wide">
              {VALUE_FLOW.map((step, i) => (
                <li key={step} className="flex items-center gap-2">
                  <span className="rounded-md border border-[var(--card-border)]/70 bg-[var(--bg-main)]/50 px-2.5 py-1.5 text-[var(--text-main)]">
                    {step}
                  </span>
                  {i < VALUE_FLOW.length - 1 && (
                    <span className="text-[var(--text-muted)]" aria-hidden>
                      ↓
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </section>

          {/* Growth path */}
          <section className="max-w-3xl mx-auto mb-10 text-center" aria-label="Crescimento por plano">
            <p className="text-sm font-bold text-[var(--text-main)]">
              Cada plano foi pensado para acompanhar o crescimento da sua operação.
            </p>
            <ol className="mt-5 flex flex-col sm:flex-row sm:flex-wrap items-center justify-center gap-2 sm:gap-3 text-sm">
              {GROWTH_STEPS.map((step, i) => (
                <li key={step.name} className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3">
                  <div className="rounded-lg border border-[var(--card-border)]/50 px-3 py-2 min-w-[9.5rem]">
                    <span className="font-extrabold text-[var(--primary)]">{step.name}</span>
                    <span className="block text-[11px] text-[var(--text-muted)] mt-0.5">{step.line}</span>
                  </div>
                  {i < GROWTH_STEPS.length - 1 && (
                    <span className="text-[var(--text-muted)] rotate-0 sm:rotate-[-90deg] sm:inline" aria-hidden>
                      ↓
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </section>

          <SocialProofSection
            vertical="home"
            title="Vale a pena demais — quem usa conta o resultado."
            subtitle="Menos discussão na devolução, prontuário que fideliza e prova quando a briga vira processo."
            className="mb-12 !border-t-0"
          />

          <div id="recursos-planos">
            <PricingCards />
          </div>

          {/* Enterprise highlight */}
          <section
            aria-labelledby="enterprise-heading"
            className="max-w-4xl mx-auto mt-12 rounded-2xl border border-[var(--card-border)]/50 bg-[var(--panel-bg)]/30 p-6 sm:p-8"
          >
            <h2 id="enterprise-heading" className="font-display text-2xl font-bold tracking-tight">
              Enterprise
            </h2>
            <p className="text-sm text-[var(--text-muted)] mt-2 max-w-2xl leading-relaxed">
              Para grandes operações que precisam integrar a gestão histórica dos veículos aos seus próprios processos e
              sistemas. Faixa a partir de R$ 1.490/mês (15+ usuários).
            </p>
            <ul className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-sm text-[var(--text-main)]">
              {[
                'API (disponível na faixa Enterprise)',
                'SLA sob consulta',
                'Integrações sob consulta',
                'Múltiplas filiais e bases',
                'Gestão de grandes frotas',
                'Gestão histórica centralizada',
                'Usuários e permissões de equipe',
                'Suporte prioritário com gerente de conta',
                'Soluções personalizadas sob consulta',
              ].map((feat) => (
                <li key={feat} className="flex items-start gap-2">
                  <span className="text-[var(--signal-bright)] mt-0.5" aria-hidden>
                    ✓
                  </span>
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <a
                href={whatsappLink(
                  'Olá! Quero falar com um especialista sobre o plano Enterprise do Danos Aparentes (API, SLA, integrações e grandes frotas).',
                )}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({ variant: 'primary', size: 'md', className: 'w-full sm:w-auto' })}
              >
                Falar com especialista
              </a>
            </div>
          </section>

          <PlanosCompareTable />

          {/* Faixa de confiança */}
          <div className="max-w-3xl mx-auto mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            {[
              { label: 'Sem cartão pra testar', desc: '7 dias grátis começam sem cobrança nem dados de pagamento.' },
              { label: 'Cancele quando quiser', desc: 'Direto pelo portal de assinatura, sem multa nem burocracia.' },
              {
                label: 'Dados protegidos',
                desc: 'Cartão via Stripe; PIX via Asaas — seus dados de pagamento nunca ficam com a gente.',
              },
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
              Mais dúvidas sobre a plataforma?{' '}
              <Link href="/faq" className="font-bold text-[var(--primary)] hover:underline">
                Veja o FAQ completo
              </Link>
            </p>
          </div>

          <PlanosFinalCta />
        </div>
      </main>
    </>
  )
}
