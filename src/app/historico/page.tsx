import type { Metadata } from 'next'
import Link from 'next/link'
import { LaudoSheet } from '@/src/components/LaudoSheet'
import ChatSupportWidget from '@/src/components/ChatSupportWidget'
import B2bHistoricoSection from '@/src/components/B2bHistoricoSection'
import MobileStickyCta from '@/src/components/MobileStickyCta'
import { HistoricoHeroCtas, HistoricoFinalCta } from '@/src/components/HistoricoCtas'
import { B2B_BRAND, B2B_CATEGORY_SHORT, B2B_PRODUCT_LINE } from '@/src/lib/b2bPositioning'

const TITLE = `${B2B_CATEGORY_SHORT} | ${B2B_BRAND}`
const DESCRIPTION =
  'Histórico inteligente por placa: compare inspeções na linha do tempo, dossiê técnico com hash SHA-256 + QR, offline. 7 dias grátis sem cartão.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/historico' },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: '/historico',
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

const PILLARS = [
  {
    title: 'Memória digital por placa',
    desc: 'Cada veículo acumula eventos comparáveis — não pastas soltas nem grupos de WhatsApp.',
  },
  {
    title: 'Evidências digitais verificáveis',
    desc: 'Dossiê com hash SHA-256 e QR público. Se alguém editar o arquivo, o hash quebra.',
  },
  {
    title: 'Mesmo padrão no tempo',
    desc: 'Mesmo diagrama, mesmas vistas, entre inspetores e entre datas — dá para comparar de verdade.',
  },
] as const

const STEPS = [
  {
    n: '01',
    title: 'Registre o estado',
    desc: 'Marque avarias no diagrama, foto com GPS e assinatura no ato.',
  },
  {
    n: '02',
    title: 'Gere o dossiê selado',
    desc: 'PDF white-label com hash + QR — prova documental forte.',
  },
  {
    n: '03',
    title: 'Compare na linha do tempo',
    desc: 'Abra o veículo e veja a linha do tempo veicular de inspeções no mesmo padrão.',
  },
] as const

const ICP_LINKS = [
  {
    href: '/locadoras',
    label: 'Locadoras',
    blurb: 'Retirada × devolução — cobrando só o dano novo.',
  },
  {
    href: '/oficinas',
    label: 'Oficinas',
    blurb: 'Entrada × saída — menos discussão na entrega.',
  },
  {
    href: '/frotas',
    label: 'Frotas',
    blurb: 'Estado da frota ao longo do tempo, inclusive offline.',
  },
  {
    href: '/seguradoras',
    label: 'Seguradoras',
    blurb: 'Cadeia de evidência do prévio ao sinistro.',
  },
] as const

const FAQ: { q: string; a: string }[] = [
  {
    q: 'O que é a Inteligência Histórica Veicular?',
    a: 'É o posicionamento do Danos Aparentes: não só um dossiê isolado, e sim uma linha do tempo veicular de estados do veículo (por placa), com dossiês verificáveis (hash + QR) no mesmo padrão visual.',
  },
  {
    q: 'Isso substitui o dossiê em PDF?',
    a: 'Não — o PDF continua sendo a entrega. A linha do tempo é o que permite comparar duas (ou mais) inspeções e sustentar a discussão com evidências, não com memória.',
  },
  {
    q: 'O histórico é público?',
    a: 'O histórico operacional fica na conta da empresa. Links compartilháveis por token (quando habilitados) mascaram a placa e não indexam em buscadores. Esta página (/historico) é a explicação do produto.',
  },
  {
    q: 'Funciona offline?',
    a: 'Sim. A inspeção roda no PWA sem sinal e sincroniza depois — o histórico se completa quando a conexão volta.',
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

const softwareJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: `${B2B_BRAND} — ${B2B_PRODUCT_LINE}`,
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web, Android, iOS (PWA)',
  url: 'https://danosaparentes.com.br/historico',
  description: DESCRIPTION,
  offers: { '@type': 'Offer', category: 'subscription' },
}

export default function HistoricoProdutoPage() {
  return (
    <main className="min-h-screen w-full flex flex-col items-center px-4 py-12 pb-24 md:pb-12 font-outfit text-[var(--text-main)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
      />

      <div className="w-full max-w-5xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors mb-6"
        >
          ← Voltar
        </Link>

        <header className="text-center mb-12 flex flex-col items-center">
          <p className="font-display text-xl sm:text-2xl font-bold uppercase tracking-tight mb-2">
            {B2B_BRAND}
          </p>
          <span className="inline-flex items-center gap-2 text-[0.7rem] font-extrabold tracking-[0.18em] uppercase text-[var(--signal-bright)] mb-3">
            <span aria-hidden="true" className="w-5 h-px bg-[var(--sheet-line)]" />
            Produto · plataforma
          </span>
          <h1 className="font-display text-4xl lg:text-5xl font-bold uppercase tracking-tight leading-[0.95] max-w-3xl [text-wrap:balance]">
            {B2B_PRODUCT_LINE}
          </h1>
          <p className="text-sm sm:text-base text-[var(--text-muted)] mt-4 max-w-2xl leading-relaxed">
            Pare de tratar cada inspeção como um PDF isolado. Acumule eventos por placa, compare na
            linha do tempo veicular e entregue dossiê que se verifica — hash SHA-256 + QR.
          </p>
          <HistoricoHeroCtas />
          <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] font-mono-data uppercase tracking-wider text-[var(--text-muted)]">
            {['7 dias grátis', 'Sem cartão', 'Offline', 'Hash + QR'].map(t => (
              <li key={t} className="inline-flex items-center gap-2">
                <span aria-hidden="true" className="text-[var(--signal-bright)]">
                  ✓
                </span>
                {t}
              </li>
            ))}
          </ul>
        </header>

        <section className="mb-16" aria-labelledby="pilares-heading">
          <h2 id="pilares-heading" className="sr-only">
            Pilares da plataforma
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {PILLARS.map(p => (
              <div key={p.title} className="glass-card p-6 border border-[var(--card-border)]/50">
                <h3 className="text-sm font-bold text-[var(--text-main)] mb-2">{p.title}</h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <B2bHistoricoSection vertical="locadoras" showProductLink={false} />

        <section id="como-funciona" className="mt-16 scroll-mt-24" aria-labelledby="steps-heading">
          <h2
            id="steps-heading"
            className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-center mb-8"
          >
            Do registro ao histórico em 3 passos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {STEPS.map(s => (
              <div key={s.n} className="glass-card p-6 border border-[var(--card-border)]/50">
                <p className="font-mono-data text-[10px] tracking-[0.16em] text-[var(--signal-bright)] mb-2">
                  {s.n}
                </p>
                <h3 className="text-sm font-bold mb-2">{s.title}</h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 text-center" aria-labelledby="prova-heading">
          <h2 id="prova-heading" className="font-display text-2xl font-bold tracking-tight mb-2">
            Prova do mecanismo — sem cases inventados
          </h2>
          <p className="text-sm text-[var(--text-muted)] max-w-lg mx-auto mb-6">
            Plataforma nova. Em vez de depoimento, veja um dossiê técnico real com QR de verificação.
          </p>
          <LaudoSheet />
        </section>

        <section className="mt-16" aria-labelledby="icp-heading">
          <h2
            id="icp-heading"
            className="font-display text-2xl font-bold tracking-tight text-center mb-3"
          >
            A mesma plataforma, a dor do seu segmento
          </h2>
          <p className="text-sm text-[var(--text-muted)] text-center max-w-xl mx-auto mb-8">
            Escolha a landing do seu ICP — a linha do tempo e as evidências digitais são o núcleo em todas.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {ICP_LINKS.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="glass-card p-5 border border-[var(--card-border)]/50 hover:border-[var(--primary)]/40 transition-colors text-left"
              >
                <p className="text-sm font-bold text-[var(--text-main)]">{item.label}</p>
                <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">{item.blurb}</p>
                <span className="inline-block mt-3 text-xs font-bold text-[var(--primary)]">
                  Ver landing →
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-16 max-w-2xl mx-auto">
          <h2 className="font-display text-2xl font-bold tracking-tight text-center mb-8">
            Perguntas sobre o histórico
          </h2>
          <div className="flex flex-col gap-6">
            {FAQ.map(({ q, a }) => (
              <div key={q} className="border-b border-[var(--card-border)]/40 pb-6">
                <p className="text-sm font-bold text-[var(--text-main)]">{q}</p>
                <p className="text-[0.8rem] text-[var(--text-muted)] mt-2 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </section>

        <HistoricoFinalCta />
      </div>

      <ChatSupportWidget segment="locadoras" />
      <MobileStickyCta heroCtaId="historico-hero-cta" eventSource="historico" />
    </main>
  )
}
