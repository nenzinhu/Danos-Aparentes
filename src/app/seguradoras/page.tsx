import type { Metadata } from 'next'
import Link from 'next/link'
import { LaudoSheet } from '@/src/components/LaudoSheet'
import { SeguradorasHeroCtas, SeguradorasPlanosLink, SeguradorasFinalCta } from '@/src/components/SeguradorasCtas'
import { BlogVideo } from '@/src/components/blog/BlogVideo'
import ChatSupportWidget from '@/src/components/ChatSupportWidget'

const TITLE = 'Laudo de Vistoria com QR Code Anti-Fraude para Seguradora | Danos Aparentes'
const DESCRIPTION =
  'Vistoria digital com laudo à prova de adulteração: hash SHA-256, QR Code de verificação pública e assinaturas digitais — reduza disputas de sinistro por avaria pré-existente.'

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
    desc: 'Sem um laudo confiável no momento da contratação, fica difícil provar se um dano já existia antes do sinistro reportado.',
  },
  {
    title: 'Laudo fácil de alterar depois',
    desc: 'PDF comum ou papel escaneado pode ser editado sem deixar rastro — o que enfraquece o documento numa contestação.',
  },
  {
    title: 'Sem registro de local e hora da vistoria',
    desc: 'Fotos soltas do celular do vistoriador não têm GPS nem timestamp confiável, dificultando a checagem posterior.',
  },
]

const FEATURES = [
  { title: 'Hash SHA-256 em cada laudo', desc: 'Qualquer alteração no PDF depois de gerado quebra o hash — o documento comprova a si mesmo.' },
  { title: 'QR Code de verificação pública', desc: 'Qualquer pessoa pode escanear o QR e conferir o laudo original em uma página de verificação, a qualquer momento.' },
  { title: 'GPS e timestamp em cada foto', desc: 'Cada foto de avaria é registrada com local e data/hora exatos do momento da vistoria.' },
  { title: 'Assinaturas digitais na tela', desc: 'Vistoriador e segurado assinam no próprio aparelho, no momento da vistoria.' },
  { title: 'Funciona 100% offline', desc: 'A vistoria continua mesmo sem sinal e sincroniza sozinha assim que a conexão voltar.' },
  { title: 'Marca própria no laudo (white-label)', desc: 'O PDF sai com a logo e o nome da corretora ou seguradora, não com uma marca genérica.' },
]

const FAQ: { q: string; a: string }[] = [
  {
    q: 'Como o QR Code ajuda a evitar fraude?',
    a: 'O QR Code leva a uma página pública onde qualquer pessoa confere o hash do laudo original. Se o PDF em mãos foi alterado, o hash não confere — expõe a adulteração na hora.',
  },
  {
    q: 'O laudo tem validade jurídica?',
    a: 'O laudo reúne hash SHA-256, QR Code de verificação, GPS, timestamp e assinaturas digitais — um conjunto de evidências forte para uma contestação. O valor probatório específico depende do contrato entre as partes.',
  },
  {
    q: 'Dá para integrar com o sistema da seguradora/corretora?',
    a: 'O plano Corporativo inclui integração via API. Fale com o time comercial para avaliar o seu caso específico.',
  },
  {
    q: 'Funciona para vistoria prévia de qualquer tipo de veículo?',
    a: 'Sim — carro, moto, caminhão, van, ônibus e um modelo genérico, cada um com diagrama próprio em 4 vistas.',
  },
  {
    q: 'Quanto custa para uma corretora pequena começar?',
    a: 'O plano Starter (R$ 29,90/mês, até 20 laudos) já cobre um volume inicial. O Pro (R$ 49,90/mês, até 80 laudos) inclui laudo personalizado. Para volume maior, integrações e laudos ilimitados, o Corporativo é sob consulta.',
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
    <main className="min-h-screen w-full flex flex-col items-center px-4 py-12 font-outfit text-[var(--text-main)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <div className="w-full max-w-5xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors mb-6"
        >
          ← Voltar
        </Link>

        <header className="text-center mb-12 flex flex-col items-center">
          <span className="inline-flex items-center gap-2 text-[0.7rem] font-extrabold tracking-[0.18em] uppercase text-[var(--signal-bright)] mb-3">
            <span aria-hidden="true" className="w-5 h-px bg-[var(--sheet-line)]" />
            Seguradoras e Corretoras
          </span>
          <h1 className="font-display text-4xl lg:text-5xl font-bold uppercase tracking-tight leading-[0.95]">
            Laudo de vistoria com QR Code anti-fraude
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-3 max-w-lg">
            Reduza disputas de sinistro por avaria pré-existente com um laudo que comprova a si
            mesmo — hash SHA-256, QR Code público e assinaturas digitais.
          </p>
          <SeguradorasHeroCtas />
        </header>

        <section className="mt-12 text-center">
          <h2 className="font-display text-2xl font-bold tracking-tight mb-2">
            Vistoria digital com prova criptográfica em poucos segundos
          </h2>
          <p className="text-sm text-[var(--text-muted)] max-w-lg mx-auto mb-2">
            Registre o estado do veículo na contratação com laudo verificável publicamente a
            qualquer momento.
          </p>
          <BlogVideo
            src="/videos/vistoria-locadoras.mp4"
            poster="/videos/vistoria-locadoras-poster.jpg"
            title="Laudo com QR Code anti-fraude — Danos Aparentes"
            description="Registre o estado do veículo com laudo verificável publicamente, reduzindo disputas de sinistro."
            duration="PT8S"
            uploadDate="2026-07-13"
            caption="8 segundos · play quando quiser"
          />
        </section>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-center mb-8">
            O que acontece sem um laudo verificável
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
            O que muda com o laudo à prova de adulteração
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
            Veja o laudo real, com QR de verificação
          </h2>
          <p className="text-sm text-[var(--text-muted)] max-w-lg mx-auto mb-2">
            Ainda não temos histórico público de clientes — o app é novo. Em vez de depoimento, veja o
            laudo real gerado pelo app, com o QR Code de verificação no rodapé.
          </p>
          <LaudoSheet />
        </section>

        <section className="mt-16 max-w-2xl mx-auto text-center glass-card p-8">
          <h2 className="text-lg font-bold mb-1.5">Starter ou Pro para corretora autônoma, Corporativo para seguradora</h2>
          <p className="text-sm text-[var(--text-muted)] mb-5">
            Se for uma corretora pequena, o Starter (20 laudos/mês) ou o Pro (80 laudos/mês) já cobrem.
            Para volume alto, integração com sistemas próprios e laudos ilimitados, o Corporativo é sob consulta.
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
          <p className="text-center text-xs text-[var(--text-muted)] mt-8">
            Quer entender como funciona o QR Code de verificação?{' '}
            <Link href="/blog/laudo-de-avaria-com-qr-code" className="font-bold text-[var(--primary)] hover:underline">
              Veja a explicação completa no blog
            </Link>
          </p>
        </div>

        <SeguradorasFinalCta />
      </div>

      <ChatSupportWidget segment="seguradoras" />
    </main>
  )
}
