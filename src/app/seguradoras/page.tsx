import type { Metadata } from 'next'
import Link from 'next/link'
import { LaudoSheet } from '@/src/components/LaudoSheet'
import { SeguradorasHeroCtas, SeguradorasPlanosLink, SeguradorasFinalCta } from '@/src/components/SeguradorasCtas'
import { BlogVideo } from '@/src/components/blog/BlogVideo'
import ChatSupportWidget from '@/src/components/ChatSupportWidget'
import B2bHistoricoSection from '@/src/components/B2bHistoricoSection'
import B2bMatchedHeroCopy from '@/src/components/B2bMatchedHeroCopy'
import MobileStickyCta from '@/src/components/MobileStickyCta'
import { B2B_BRAND, B2B_CATEGORY_SHORT, B2B_PRODUCT_LINE } from '@/src/lib/b2bPositioning'

const TITLE = `Evidências digitais anti-fraude para seguradora | ${B2B_BRAND}`
const DESCRIPTION =
  `${B2B_CATEGORY_SHORT}: dossiê técnico com hash SHA-256, QR de verificação e linha do tempo veicular — reduza disputas por avaria pré-existente. 7 dias grátis.`

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/seguradoras' },
  openGraph: { title: TITLE, description: DESCRIPTION, url: '/seguradoras', type: 'website', images: ['/og-image.jpg'] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: ['/og-image.jpg'] },
}

const PAIN_POINTS = [
  {
    title: 'Disputa sobre avaria pré-existente',
    desc: 'Sem um dossiê técnico confiável no momento da contratação, fica difícil provar se um dano já existia antes do sinistro reportado.',
  },
  {
    title: 'Dossiê fácil de alterar depois',
    desc: 'PDF comum ou papel escaneado pode ser editado sem deixar rastro — o que enfraquece o documento numa contestação.',
  },
  {
    title: 'Sem registro de local e hora da inspeção',
    desc: 'Fotos soltas do celular do inspetor não têm GPS nem timestamp confiável, dificultando a checagem posterior.',
  },
]

const FEATURES = [
  { title: 'Cadeia de evidências no tempo', desc: 'Linha do tempo veicular — não só um PDF isolado — para contextualizar sinistro e pré-existência.' },
  { title: 'Hash SHA-256 em cada dossiê', desc: 'Qualquer alteração no PDF depois de gerado quebra o hash — o documento comprova a si mesmo.' },
  { title: 'QR Code de verificação pública', desc: 'Qualquer pessoa pode escanear o QR e conferir o dossiê original em uma página de verificação, a qualquer momento.' },
  { title: 'GPS e timestamp em cada foto', desc: 'Cada foto de avaria é registrada com local e data/hora exatos do momento da inspeção.' },
  { title: 'Assinaturas digitais na tela', desc: 'Inspetor e segurado assinam no próprio aparelho, no momento da inspeção.' },
  { title: 'Marca própria no dossiê (white-label)', desc: 'O PDF sai com a logo e o nome da corretora ou seguradora, não com uma marca genérica.' },
]

const FAQ: { q: string; a: string }[] = [
  {
    q: 'Como o QR Code ajuda a evitar fraude?',
    a: 'O QR Code leva a uma página pública onde qualquer pessoa confere o hash do dossiê original. Se o PDF em mãos foi alterado, o hash não confere — expõe a adulteração na hora.',
  },
  {
    q: 'O dossiê tem validade jurídica?',
    a: 'O dossiê reúne hash SHA-256, QR Code de verificação, GPS, timestamp e assinaturas digitais — um conjunto de evidências forte para uma contestação. O valor probatório específico depende do contrato entre as partes.',
  },
  {
    q: 'Dá para integrar com os sistemas da seguradora/corretora?',
    a: 'O plano Corporativo inclui integração via API. Fale com o time comercial para avaliar o seu caso específico.',
  },
  {
    q: 'Funciona para inspeção prévia de qualquer tipo de veículo?',
    a: 'Sim — carro, moto, caminhão, van, ônibus e um modelo genérico, cada um com diagrama próprio em 4 vistas.',
  },
  {
    q: 'Quanto custa para uma corretora pequena começar?',
    a: 'O plano Starter (R$ 29,90/mês, até 20 dossiês) já cobre um volume inicial. O Pro (R$ 79,90/mês, até 80 dossiês) inclui dossiê personalizado. Para volume maior, integrações e dossiês ilimitados, o Corporativo é sob consulta.',
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

export default function SeguradorasPage() {
  return (
    <main className="min-h-screen w-full flex flex-col items-center px-4 py-12 pb-24 md:pb-12 font-outfit text-[var(--text-main)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

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
          <B2bMatchedHeroCopy
            vertical="seguradoras"
            defaultKicker={`Seguradoras · ${B2B_CATEGORY_SHORT}`}
            defaultHeadline="Plataforma de evidências digitais com QR anti-fraude"
            defaultSub={`${B2B_CATEGORY_SHORT}: reduza disputas por avaria pré-existente com dossiê verificável — hash SHA-256, QR público e assinaturas no ato.`}
            subClassName="text-sm text-[var(--text-muted)] mt-3 max-w-lg"
          />
          <SeguradorasHeroCtas />
        </header>

        <section className="mt-12 text-center">
          <h2 className="font-display text-2xl font-bold tracking-tight mb-2">
            Inspeção inteligente com prova criptográfica em poucos segundos
          </h2>
          <p className="text-sm text-[var(--text-muted)] max-w-lg mx-auto mb-2">
            Registre o estado do veículo na contratação com dossiê técnico verificável publicamente a
            qualquer momento.
          </p>
          <BlogVideo
            src="/videos/vistoria-digital-tour.mp4"
            poster="/videos/vistoria-digital-tour-poster.webp"
            title="Dossiê técnico com QR Code anti-fraude — Danos Aparentes"
            description="Registre o estado do veículo com dossiê verificável publicamente, reduzindo disputas de sinistro."
            duration="PT58S"
            uploadDate="2026-07-13"
            caption="Veja como funciona na prática"
          />
        </section>

        <B2bHistoricoSection vertical="seguradoras" />

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-center mb-8">
            O que acontece sem um dossiê verificável
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PAIN_POINTS.map(item => (
              <div key={item.title} className="glass-card p-6 border border-[var(--card-border)]/50">
                <h3 className="text-sm font-bold text-[var(--text-main)] mb-2">{item.title}</h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-center mb-8">
            O que muda com evidência verificável
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {FEATURES.map(item => (
              <div key={item.title} className="flex items-start gap-3">
                <span className="text-[var(--signal-bright)] text-base mt-0.5">✓</span>
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-main)]">{item.title}</h3>
                  <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 text-center">
          <h2 className="font-display text-2xl font-bold tracking-tight mb-2">
            Veja o dossiê técnico real, com QR de verificação
          </h2>
          <p className="text-sm text-[var(--text-muted)] max-w-lg mx-auto mb-2">
            Ainda não temos histórico público de clientes — a plataforma é nova. Em vez de depoimento, veja o
            dossiê real gerado pela plataforma, com o QR Code de verificação no rodapé.
          </p>
          <LaudoSheet />
        </section>

        <section className="mt-16 max-w-2xl mx-auto text-center glass-card p-8">
          <h2 className="text-lg font-bold mb-1.5">Starter ou Pro para corretora autônoma, Corporativo para seguradora</h2>
          <p className="text-sm text-[var(--text-muted)] mb-5">
            Se for uma corretora pequena, o Starter (20 dossiês/mês) ou o Pro (80 dossiês/mês) já cobrem.
            Para volume alto, integração com sistemas próprios e dossiês ilimitados, o Corporativo é sob consulta.
          </p>
          <SeguradorasPlanosLink />
        </section>

        <div className="max-w-2xl mx-auto mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-center mb-8">
            Perguntas de quem avalia risco de sinistro
          </h2>
          <div className="flex flex-col gap-6">
            {FAQ.map(({ q, a }) => (
              <div key={q} className="border-b border-[var(--card-border)]/40 pb-6">
                <p className="text-sm font-bold text-[var(--text-main)]">{q}</p>
                <p className="text-[0.8rem] text-[var(--text-muted)] mt-2 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 max-w-2xl mx-auto">
            <p className="text-center text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3">
              Leia também
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs">
              {[
                ['laudo-de-avarias-para-sinistro', 'Laudo de avarias para sinistro: como documentar para o seguro'],
                ['laudo-de-avaria-com-qr-code', 'Laudo de avaria com QR Code: o que é e para que serve'],
                ['laudo-de-vistoria-para-despachantes', 'Laudo de vistoria para despachantes'],
                ['qr-code-e-hash-no-laudo-de-avarias', 'QR Code e hash no laudo: a prova que seguradora não contesta'],
              ].map(([slug, title]) => (
                <li key={slug}>
                  <Link href={`/blog/${slug}`} className="text-[var(--text-muted)] hover:text-[var(--primary)] hover:underline">
                    {title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <SeguradorasFinalCta />
      </div>

      <ChatSupportWidget segment="seguradoras" />
      <MobileStickyCta heroCtaId="seguradoras-hero-cta" eventSource="seguradoras" />
    </main>
  )
}
