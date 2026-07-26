import type { Metadata } from 'next'
import Link from 'next/link'
import { LaudoSheet } from '@/src/components/LaudoSheet'
import {
  LocadorasHeroCtas,
  LocadorasNavCta,
  LocadorasPlanosLink,
  LocadorasOfferCta,
  LocadorasFinalCta,
} from '@/src/components/LocadorasCtas'
import LocadorasTrialForm from '@/src/components/LocadorasTrialForm'
import { BlogVideo } from '@/src/components/blog/BlogVideo'
import ChatSupportWidget from '@/src/components/ChatSupportWidget'
import { whatsappLink } from '@/src/lib/whatsapp'

const TITLE = 'Vistoria digital para locadoras | Prova na devolução | Danos Aparentes'
const DESCRIPTION =
  'Chega de discutir amassado que já existia. Vistoria na retirada e na devolução: diagrama, foto com GPS, assinatura e PDF com hash SHA-256 + QR. 7 dias grátis sem cartão.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/locadoras' },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: '/locadoras',
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

const PAIN_CARDS = [
  {
    title: '“Já estava assim.”',
    desc: 'Cliente nega dano novo. Sem laudo de retirada no mesmo padrão, você discute — não compara.',
  },
  {
    title: 'Foto no WhatsApp / vistoria só na devolução',
    desc: 'Sem par entrega×devolução, o ônus da prova fica frágil.',
  },
  {
    title: 'Cada vistoriador, um jeito',
    desc: 'Prancheta diferente por pessoa = laudos incomparáveis entre filiais.',
  },
] as const

const STEPS = [
  {
    n: '01',
    title: 'Marque no diagrama',
    desc: 'Mesma peça, mesma vista, entre vistoriadores.',
  },
  {
    n: '02',
    title: 'Foto com GPS + timestamp',
    desc: 'Bloqueia o argumento “essa foto foi depois”.',
  },
  {
    n: '03',
    title: 'Assinatura na tela, no ato',
    desc: 'Vistoriador + cliente — não “12 dias depois”.',
  },
  {
    n: '04',
    title: 'PDF selado',
    desc: 'Hash SHA-256 + QR público. Se editar o PDF, o hash quebra.',
  },
] as const

const PLANS = [
  {
    name: 'Starter',
    price: 'R$ 29,90/mês',
    detail: '20 laudos · ≈ R$ 1,50/laudo · Ideal para testar o fluxo na devolução.',
  },
  {
    name: 'Pro',
    price: 'R$ 49,90/mês',
    detail: '80 laudos · white-label (logo no PDF) · ≈ R$ 0,62/laudo.',
  },
  {
    name: 'Corporativo',
    price: 'a partir de R$ 299/mês',
    detail: 'Multi-usuário · piloto sob conversa · sem case inventado para fechar. WhatsApp.',
  },
] as const

const FAQ: { q: string; a: string }[] = [
  {
    q: 'O laudo tem validade jurídica?',
    a: 'Registro documental forte (hash, QR, GPS, assinaturas). Valor probatório depende do contrato e do seu jurídico — não prometemos sentença ganha.',
  },
  {
    q: 'Foto no WhatsApp na devolução não basta?',
    a: 'Sem vistoria de entrada comparável, a cobrança fica frágil (ver ConJur). Nossa oferta é o par retirada×devolução no mesmo padrão.',
  },
  {
    q: 'Vocês têm cases / depoimentos?',
    a: 'Ainda não públicos. App novo. Oferecemos laudo demo + trial — sem inventar.',
  },
  {
    q: 'Funciona no pátio sem internet?',
    a: 'Sim — PWA offline + sync quando voltar o sinal.',
  },
  {
    q: 'Precisa treinar a equipe?',
    a: 'O diagrama guia o fluxo; a primeira vistoria costuma ser em minutos.',
  },
  {
    q: 'Já tenho laudo cautelar.',
    a: 'Cautelar ≠ laudo de avarias aparentes na entrega/devolução. São finalidades diferentes.',
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

const TRUST_BAR = [
  'Hash SHA-256 + QR público',
  'Offline no pátio',
  '7 dias grátis sem cartão',
  'App novo — sem depoimentos inventados',
] as const

const CONJUR_URL =
  'https://www.conjur.com.br/2024-mar-07/sem-vistoria-previa-locadora-nao-pode-cobrar-multa-por-dano-em-veiculo/'
const TJDFT_URL =
  'https://www.tjdft.jus.br/institucional/imprensa/noticias/2022/janeiro/locadora-e-condenada-a-devolver-valores-pagos-indevidamente'

export default function LocadorasPage() {
  return (
    <main className="min-h-screen w-full flex flex-col items-center font-outfit text-[var(--text-main)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      {/* NAV */}
      <nav className="w-full sticky top-0 z-40 border-b border-[var(--card-border)]/40 bg-[var(--bg-main)]/90 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5 min-w-0 group">
            <img src="/brand/logo-icon.svg" alt="" width={36} height={36} className="shrink-0" />
            <span className="font-display text-lg sm:text-xl font-bold uppercase tracking-tight truncate group-hover:opacity-90">
              Danos Aparentes
            </span>
          </Link>
          <LocadorasNavCta />
        </div>
      </nav>

      <div className="w-full max-w-5xl px-4 py-10 sm:py-14">
        {/* HERO — P */}
        <header className="relative text-center mb-16 sm:mb-20 flex flex-col items-center overflow-hidden rounded-2xl border border-[var(--card-border)]/40 px-4 py-12 sm:py-16 bg-[var(--panel-bg)]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -right-16 w-72 h-72 rounded-full opacity-20 blur-3xl"
            style={{ background: 'var(--primary)' }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-20 -left-20 w-64 h-64 rounded-full opacity-15 blur-3xl bg-[var(--signal-bright)]"
          />

          <div className="relative flex flex-col items-center gap-3 mb-5">
            <img src="/brand/logo-icon.svg" alt="" width={56} height={56} />
            <p className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-tight">
              Danos Aparentes
            </p>
          </div>

          <span className="relative inline-flex items-center gap-2 text-[0.7rem] font-extrabold tracking-[0.18em] uppercase text-[var(--signal-bright)] mb-4">
            <span aria-hidden="true" className="w-5 h-px bg-[var(--sheet-line)]" />
            Para locadoras · prova na devolução
          </span>

          <h1 className="relative font-display text-4xl sm:text-5xl lg:text-[3.25rem] font-bold uppercase tracking-tight leading-[0.95] max-w-3xl [text-wrap:balance]">
            Chega de discutir amassado que já existia no carro.
          </h1>

          <p className="relative text-sm sm:text-base text-[var(--text-muted)] mt-5 max-w-2xl leading-relaxed">
            Vistoria digital na retirada e na devolução: diagrama, foto com GPS, assinatura na tela e
            PDF com hash SHA-256 + QR — prova no ato, não discussão no balcão.
          </p>

          <div className="relative">
            <LocadorasHeroCtas />
          </div>

          <ul className="relative mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] font-mono-data uppercase tracking-wider text-[var(--text-muted)] max-w-2xl">
            {TRUST_BAR.map((t, i) => (
              <li key={t} className="inline-flex items-center gap-2">
                {i > 0 && (
                  <span aria-hidden="true" className="hidden sm:inline text-[var(--card-border)]">
                    ·
                  </span>
                )}
                <span aria-hidden="true" className="text-[var(--signal-bright)]">
                  ✓
                </span>
                {t}
              </li>
            ))}
          </ul>
        </header>

        {/* AMPLIFY — A */}
        <section className="mb-16 sm:mb-20" aria-labelledby="amplify-heading">
          <h2
            id="amplify-heading"
            className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-center mb-4 max-w-3xl mx-auto leading-snug"
          >
            Sem vistoria de entrada comparável, a cobrança de avaria vira discussão — e às vezes,
            processo.
          </h2>
          <p className="text-sm sm:text-[0.95rem] text-[var(--text-muted)] text-center max-w-2xl mx-auto mb-8 leading-relaxed">
            Sem vistoria de entrada no mesmo padrão da devolução, a locadora não compara o estado do
            carro antes e depois. A cobrança de avaria vira discussão — e fontes como ConJur e TJDFT
            mostram que a ausência de checagem prévia impede essa comparação. A cobrança cai por falta
            de prova documental do par retirada×devolução, não por falta de “case” inventado.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            {PAIN_CARDS.map(item => (
              <div
                key={item.title}
                className="glass-card p-6 border border-[var(--card-border)]/50"
              >
                <h3 className="text-sm font-bold text-[var(--text-main)] mb-2">{item.title}</h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <blockquote className="glass-card p-6 sm:p-8 border border-[var(--card-border)]/50 max-w-3xl mx-auto">
            <p className="text-sm sm:text-[0.95rem] text-[var(--text-main)] leading-relaxed italic">
              “A ausência de uma checagem feita pela locadora antes da entrega do veículo ao cliente
              impossibilita que se faça a necessária comparação entre o estado do carro antes e
              depois da locação.”
            </p>
            <footer className="mt-4 space-y-1">
              <p className="font-mono-data text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                Prova do problema no mercado — não é cliente Danos Aparentes. Fonte:{' '}
                <a
                  href={CONJUR_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--primary)] hover:underline"
                >
                  ConJur, 07/03/2024
                </a>
              </p>
            </footer>
          </blockquote>
        </section>

        {/* SOLUTION — S */}
        <section className="mb-16 sm:mb-20" aria-labelledby="solution-heading">
          <div className="text-center mb-10">
            <h2
              id="solution-heading"
              className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight"
            >
              Laudo de avarias aparentes que prova a si mesmo.
            </h2>
            <p className="text-sm sm:text-[0.95rem] text-[var(--text-muted)] mt-4 max-w-2xl mx-auto leading-relaxed">
              Um laudo de avarias aparentes verificável compara retirada e devolução no mesmo padrão:
              diagrama de peças, foto com GPS e timestamp, assinaturas na tela e PDF com hash SHA-256 +
              QR público. Assim você prova o que já era pré-existente versus o que surgiu na locação. Se
              o PDF for editado, o hash quebra — prova de mecanismo, não depoimento inventado.
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-3 max-w-xl mx-auto">
              Em minutos, no celular — inclusive sem sinal. Trial de 7 dias sem cartão.
            </p>
          </div>

          <ol className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
            {STEPS.map(step => (
              <li
                key={step.n}
                className="flex gap-4 p-5 rounded-xl border border-[var(--card-border)]/40 bg-[var(--panel-bg)]"
              >
                <span className="font-mono-data text-xs text-[var(--signal-bright)] font-bold shrink-0 pt-0.5">
                  {step.n}
                </span>
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-main)]">{step.title}</h3>
                  <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">{step.desc}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto mb-12 text-center">
            <div className="rounded-xl border border-[var(--card-border)]/40 p-5 opacity-80">
              <p className="font-mono-data text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-2">
                Antes
              </p>
              <p className="text-sm font-semibold text-[var(--text-main)]">
                Prancheta / WhatsApp / PDF editável
              </p>
            </div>
            <div className="rounded-xl border border-[var(--primary)]/35 bg-[var(--primary)]/5 p-5">
              <p className="font-mono-data text-[10px] uppercase tracking-wider text-[var(--primary)] mb-2">
                Depois
              </p>
              <p className="text-sm font-semibold text-[var(--text-main)]">
                Laudo verificável (mecanismo) — sem claim de ROI de cliente
              </p>
            </div>
          </div>

          <div className="text-center">
            <h3 className="font-display text-xl font-bold tracking-tight mb-2">
              Vistoria digital para locadora em poucos segundos
            </h3>
            <p className="text-sm text-[var(--text-muted)] max-w-lg mx-auto mb-2">
              Veja o fluxo no celular: diagrama, foto e laudo pronto para a devolução.
            </p>
            <BlogVideo
              src="/videos/vistoria-digital-tour.mp4"
              poster="/videos/vistoria-digital-tour-poster.jpg"
              title="Vistoria digital para locadoras — Danos Aparentes"
              description="Evite discussões por riscos. Faça a vistoria digital rápida no celular e registre avarias com prova na devolução."
              duration="PT58S"
              uploadDate="2026-07-13"
              caption="Veja como funciona na prática"
            />
          </div>
        </section>

        {/* TRANSFORM / PROVA — T* */}
        <section id="demo" className="mb-16 sm:mb-20 scroll-mt-24" aria-labelledby="prova-heading">
          <div className="text-center mb-10">
            <h2
              id="prova-heading"
              className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight"
            >
              Prova do que existe hoje — sem cases inventados.
            </h2>
            <p className="text-sm sm:text-[0.95rem] text-[var(--text-muted)] mt-4 max-w-2xl mx-auto leading-relaxed">
              Checklist de devolução útil é o par com a vistoria de retirada: mesmas peças no diagrama,
              mesmas fotos com GPS, mesmas assinaturas no ato. O PDF sai com hash SHA-256 e QR público —
              qualquer edição quebra o hash. Escaneie o laudo demo abaixo para ver o mecanismo. App novo:
              sem depoimentos, NPS ou “X clientes” inventados.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="glass-card p-6 sm:p-8 border border-[var(--card-border)]/50 text-center">
              <h3 className="text-base font-bold mb-2">Escaneie o QR deste laudo demo</h3>
              <p className="text-xs text-[var(--text-muted)] mb-4 leading-relaxed">
                Confira o hash. É a prova do mecanismo — não um depoimento.
              </p>
              <LaudoSheet />
              <a
                href="/verify"
                className={
                  'inline-flex mt-2 ' +
                  'text-sm font-bold text-[var(--primary)] hover:underline'
                }
              >
                Abrir verificação pública →
              </a>
            </div>

            <div className="glass-card p-6 sm:p-8 border border-[var(--card-border)]/50">
              <h3 className="text-base font-bold mb-2">Como a Justiça trata falta de vistoria prévia</h3>
              <ul className="space-y-4 mt-4 text-xs text-[var(--text-muted)] leading-relaxed">
                <li>
                  <a
                    href={CONJUR_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-[var(--text-main)] hover:text-[var(--primary)]"
                  >
                    ConJur, 07/03/2024
                  </a>
                  {' — '}
                  ausência de checagem prévia impossibilita comparação antes×depois.
                </li>
                <li>
                  <a
                    href={TJDFT_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-[var(--text-main)] hover:text-[var(--primary)]"
                  >
                    TJDFT, 26/01/2022
                  </a>
                  {' — '}
                  cobrança após vistoria que “não constatou avaria” / imputação unilateral.
                </li>
              </ul>
              <p className="font-mono-data text-[10px] uppercase tracking-wider text-[var(--text-muted)] mt-5">
                Prova do problema no mercado — não são clientes Danos Aparentes.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--card-border)]/50 bg-[var(--panel-bg)] p-6 sm:p-8 text-center max-w-2xl mx-auto">
            <p className="text-sm text-[var(--text-main)] leading-relaxed">
              <strong>App novo.</strong> Ainda não temos histórico público de clientes. Preferimos
              trial + laudo verificável a depoimento falso.
            </p>
          </div>
        </section>

        {/* OFFER — O */}
        <section id="planos" className="mb-16 sm:mb-20 scroll-mt-24" aria-labelledby="offer-heading">
          <div className="text-center mb-10">
            <h2
              id="offer-heading"
              className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight"
            >
              Comece pelo plano que cabe no volume da sua base.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {PLANS.map(plan => (
              <div
                key={plan.name}
                className="glass-card p-6 border border-[var(--card-border)]/50 flex flex-col"
              >
                <h3 className="font-display text-xl font-bold uppercase tracking-tight">{plan.name}</h3>
                <p className="text-lg font-extrabold text-[var(--primary)] mt-2">{plan.price}</p>
                <p className="text-xs text-[var(--text-muted)] mt-3 leading-relaxed flex-1">
                  {plan.detail}
                </p>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-[var(--text-muted)] mt-6">
            7 dias grátis <strong className="text-[var(--text-main)]">sem cartão</strong>. Cancele no
            portal. PIX disponível no SME.
          </p>

          <div className="flex flex-col items-center gap-4 mt-2">
            <LocadorasOfferCta />
            <LocadorasPlanosLink />
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-16 sm:mb-20 max-w-2xl mx-auto" aria-labelledby="faq-heading">
          <h2
            id="faq-heading"
            className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-center mb-8"
          >
            Perguntas que locadoras fazem antes de testar
          </h2>
          <div className="flex flex-col gap-6">
            {FAQ.map(({ q, a }) => (
              <div key={q} className="border-b border-[var(--card-border)]/40 pb-6">
                <p className="text-sm font-bold text-[var(--text-main)]">{q}</p>
                <p className="text-[0.8rem] text-[var(--text-muted)] mt-2 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>

          <div className="mt-10">
            <p className="text-center text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3">
              Leia também
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs">
              {[
                [
                  'checklist-vistoria-devolucao-locadora',
                  'Checklist de vistoria de devolução de veículo para locadoras',
                ],
                [
                  'avarias-preexistentes-como-provar',
                  'Avarias preexistentes: como provar que o dano já estava no veículo',
                ],
                ['laudo-white-label-para-locadoras', 'Laudo white-label para locadoras'],
                [
                  'cobranca-avaria-devolucao-locadora',
                  'Como cobrar avaria na devolução sem perder a discussão',
                ],
                [
                  'como-provar-amassado-pre-existente-locacao',
                  'Como provar que um amassado já existia antes da locação',
                ],
              ].map(([slug, title]) => (
                <li key={slug}>
                  <Link
                    href={`/blog/${slug}`}
                    className="text-[var(--text-muted)] hover:text-[var(--primary)] hover:underline"
                  >
                    {title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* FORM — R */}
        <section
          id="form"
          className="mb-16 sm:mb-20 scroll-mt-24 max-w-lg mx-auto"
          aria-labelledby="form-heading"
        >
          <div className="glass-card p-6 sm:p-8 border border-[var(--card-border)]/50">
            <div className="text-center mb-6">
              <h2 id="form-heading" className="font-display text-2xl font-bold tracking-tight">
                Ative 7 dias grátis e faça a primeira vistoria na sua base
              </h2>
              <p className="text-sm text-[var(--text-muted)] mt-2">
                Sem cartão. Sem depoimento inventado. Só o fluxo na sua devolução.
              </p>
            </div>
            <LocadorasTrialForm />
            <div className="mt-6 pt-6 border-t border-[var(--card-border)]/40">
              <LocadorasFinalCta />
            </div>
          </div>
        </section>

        {/* FOOTER (page-local) */}
        <footer className="border-t border-[var(--card-border)]/30 pt-8 pb-4 text-center text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase">
          <p className="font-display text-base tracking-tight text-[var(--text-main)] mb-3 normal-case">
            Danos Aparentes
          </p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-4 normal-case tracking-normal font-semibold text-xs">
            <Link href="/planos" className="hover:text-[var(--text-main)]">
              Planos
            </Link>
            <Link href="/privacidade" className="hover:text-[var(--text-main)]">
              Privacidade
            </Link>
            <Link href="/verify" className="hover:text-[var(--text-main)]">
              Verificar laudo
            </Link>
            <a
              href={whatsappLink('Olá! Vim da página para locadoras.')}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[var(--text-main)]"
            >
              WhatsApp
            </a>
            <Link href="/" className="hover:text-[var(--text-main)]">
              danosaparentes.com.br
            </Link>
          </div>
          <p>© 2026 Danos Aparentes</p>
        </footer>
      </div>

      <ChatSupportWidget segment="locadoras" />
    </main>
  )
}
