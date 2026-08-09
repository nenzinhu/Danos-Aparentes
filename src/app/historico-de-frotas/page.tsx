import type { Metadata } from 'next'
import Link from 'next/link'
import { LaudoSheet } from '@/src/components/LaudoSheet'
import {
  HistoricoDeFrotasHeroCtas,
  HistoricoDeFrotasPlanosLink,
  HistoricoDeFrotasFinalCta,
} from '@/src/components/HistoricoDeFrotasCtas'
import { BlogVideo } from '@/src/components/blog/BlogVideo'
import ChatSupportWidget from '@/src/components/ChatSupportWidget'
import B2bHistoricoSection from '@/src/components/B2bHistoricoSection'
import B2bMatchedHeroCopy from '@/src/components/B2bMatchedHeroCopy'
import MobileStickyCta from '@/src/components/MobileStickyCta'
import { B2B_BRAND, B2B_CATEGORY_SHORT, B2B_PRODUCT_LINE } from '@/src/lib/b2bPositioning'

const TITLE = `Gestão histórica de frotas e locadoras | ${B2B_BRAND}`
const DESCRIPTION =
  `${B2B_CATEGORY_SHORT} para locadoras: controle de avarias, inspeção de entrada e saída e linha do tempo veicular por placa. 7 dias grátis.`

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/historico-de-frotas' },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: '/historico-de-frotas',
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

const PAIN_POINTS = [
  {
    title: 'Sem controle de avarias para locadora',
    desc: 'Retirada e devolução viram discussão: risco “já estava assim”, foto no WhatsApp sem data e cobrança que não se sustenta.',
  },
  {
    title: 'Inspeção de entrada e saída incompleta',
    desc: 'Formulário de papel ou planilha não compara o mesmo diagrama entre saída e retorno — a diferença some no meio do caminho.',
  },
  {
    title: 'Eventos do veículo sem linha do tempo por placa',
    desc: 'Cada contrato fica solto. Sem linha do tempo veicular, a frota não prova o estado anterior na próxima locação ou uso interno.',
  },
]

const FEATURES = [
  {
    title: 'Eventos do veículo: saída e retorno',
    desc: 'Registre a saída e a volta no mesmo padrão visual — diagrama, fotos, assinatura e dossiê selado.',
  },
  {
    title: 'Inspeção de entrada e saída de veículos',
    desc: 'Dois dossiês comparáveis por placa: o que saiu e o que voltou. A diferença fica evidente, não opinativa.',
  },
  {
    title: 'Controle de avarias para locadora',
    desc: 'Marque danos no croqui, anexe evidências com GPS e envie o dossiê white-label ao cliente na hora.',
  },
  {
    title: 'Linha do tempo veicular por placa',
    desc: 'Cada carro acumula eventos ao longo do tempo — compare contratos, turnos e devoluções no mesmo lugar.',
  },
  {
    title: 'Como provar dano em carro alugado',
    desc: 'Hash SHA-256 + QR Code no PDF: a prova do estado na retirada e na devolução resiste à contestação.',
  },
  {
    title: 'Funciona offline no pátio',
    desc: 'Sem sinal no estacionamento? A inspeção fica no aparelho e sincroniza quando a internet voltar.',
  },
]

const KEYWORD_BLOCKS = [
  {
    id: 'controle-avarias',
    h2: 'Controle de avarias para locadora',
    p: 'A dor da locadora não é “fazer um dossiê bonito” — é fechar a cobrança sem briga. Com o Danos Aparentes, a retirada e a devolução usam o mesmo diagrama: o cliente assina o estado na saída e você compara o retorno peça a peça.',
  },
  {
    id: 'entrada-saida',
    h2: 'Inspeção de entrada e saída de veículos',
    p: 'Entrada e saída deixam de ser formulários diferentes. É o mesmo fluxo, as mesmas vistas (frente, traseira, laterais) e o mesmo dossiê verificável — ideal para locação, frota própria e oficina parceira.',
  },
  {
    id: 'provar-dano',
    h2: 'Como provar dano em carro alugado',
    p: 'Prova = dossiê de retirada + dossiê de devolução + fotos com data/local + hash que impede adulteração. Sem isso, vira palavra contra palavra. Com isso, a disputa vira comparação objetiva.',
  },
  {
    id: 'check-in-out',
    h2: 'Eventos do veículo: saída e retorno de frota',
    p: 'Trate cada uso do veículo como um ciclo: saída e retorno. A linha do tempo por placa mostra quem usou, quando e o que mudou — base para cobrança, manutenção e auditoria.',
  },
]

const FAQ: { q: string; a: string }[] = [
  {
    q: 'O que é controle de avarias para locadora na prática?',
    a: 'É registrar o estado do carro na retirada e na devolução no mesmo padrão (diagrama + fotos + assinatura), gerar dossiê com hash e QR, e comparar os dois documentos para cobrar só o dano novo — sem depender de print de WhatsApp.',
  },
  {
    q: 'Como funciona a inspeção de entrada e saída de veículos?',
    a: 'Você faz a inspeção de saída, o veículo sai. Na volta, a inspeção de retorno usa o mesmo croqui. A linha do tempo por placa junta os dois estados para destacar o que mudou.',
  },
  {
    q: 'Como provar dano em carro alugado com a plataforma?',
    a: 'Com o dossiê de retirada selado (hash SHA-256 + QR) e o dossiê de devolução no mesmo veículo. Fotos e marcações no diagrama mostram o dano novo; o QR confirma que o PDF não foi alterado depois.',
  },
  {
    q: 'Isso cobre o fluxo de saída e retorno de frota?',
    a: 'Para evidência de avarias e linha do tempo por placa, sim: o fluxo de saída/retorno com dossiês comparáveis cobre a operação. Integrações com ERP/CRM entram no plano Corporativo.',
  },
  {
    q: 'Quanto custa para começar?',
    a: 'Starter R$ 29,90/mês (até 20 dossiês) e Pro R$ 79,90/mês (até 80 dossiês, com marca própria). Corporativo a partir de R$ 299 para multi-usuário e dossiês ilimitados. 7 dias grátis sem cartão.',
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

export default function HistoricoDeFrotasPage() {
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
            vertical="locadoras"
            defaultKicker={`Locadoras e frotas · ${B2B_CATEGORY_SHORT}`}
            defaultHeadline="Linha do tempo veicular: saída, retorno e prova de avaria"
            defaultSub={`${B2B_CATEGORY_SHORT} para controle de avarias, inspeção de entrada e saída e gestão histórica por placa — do pátio ao dossiê verificável.`}
            subClassName="text-sm text-[var(--text-muted)] mt-3 max-w-lg"
          />
          <HistoricoDeFrotasHeroCtas />
        </header>

        <section className="mt-12 text-center">
          <h2 className="font-display text-2xl font-bold tracking-tight mb-2">
            Inspeção de entrada e saída em minutos
          </h2>
          <p className="text-sm text-[var(--text-muted)] max-w-lg mx-auto mb-2">
            Saída na entrega, retorno na devolução — dossiê técnico pronto no celular, mesmo offline.
          </p>
          <BlogVideo
            src="/videos/vistoria-digital-tour.mp4"
            poster="/videos/vistoria-digital-tour-poster.webp"
            title="Inspeção de entrada e saída — Danos Aparentes"
            description="Eventos do veículo com dossiê digital e linha do tempo veicular por placa."
            duration="PT58S"
            uploadDate="2026-07-13"
            caption="Veja o fluxo na prática"
          />
        </section>

        {/* Opção destacada: histórico de veículos */}
        <section
          id="historico-veiculos"
          className="mt-16 glass-card p-6 sm:p-8 border border-[var(--card-border)]/50 text-center"
        >
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--primary)] mb-2">
            Histórico de veículos
          </p>
          <h2 className="font-display text-2xl font-bold tracking-tight mb-2">
            Linha do tempo por placa — não só um dossiê isolado
          </h2>
          <p className="text-sm text-[var(--text-muted)] max-w-xl mx-auto mb-5">
            Cada veículo acumula inspeções de entrada e saída. Compare estados, prove dano novo e
            acompanhe a frota inteira no mesmo padrão visual.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/historico"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-bold shadow-xl shadow-[var(--primary)]/15"
            >
              Conhecer a plataforma
            </Link>
            <Link
              href="/app/vehicles"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl border border-[var(--card-border)] text-sm font-bold text-[var(--text-main)] hover:bg-[var(--btn-secondary-bg)]"
            >
              Ver veículos no app
            </Link>
          </div>
        </section>

        <B2bHistoricoSection vertical="locadoras" />

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-center mb-8">
            Onde a operação de frota e locadora sangra
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

        <section className="mt-16 space-y-10">
          {KEYWORD_BLOCKS.map(block => (
            <div key={block.id} id={block.id}>
              <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight mb-2">
                {block.h2}
              </h2>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed max-w-2xl">{block.p}</p>
            </div>
          ))}
        </section>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-center mb-8">
            O que muda com histórico e evidência
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
            Dossiê com a marca da sua locadora ou frota
          </h2>
          <p className="text-sm text-[var(--text-muted)] max-w-lg mx-auto mb-2">
            Dossiê white-label: logo e nome da empresa no cabeçalho, hash e QR para o cliente verificar.
          </p>
          <LaudoSheet />
        </section>

        <section className="mt-16 max-w-2xl mx-auto text-center glass-card p-8">
          <h2 className="text-lg font-bold mb-1.5">Comece pequeno ou escale a frota</h2>
          <p className="text-sm text-[var(--text-muted)] mb-5">
            Starter e Pro para volume inicial; Corporativo para multi-usuário, gestão histórica consolidada e
            dossiês ilimitados.
          </p>
          <HistoricoDeFrotasPlanosLink />
        </section>

        <div className="max-w-2xl mx-auto mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-center mb-8">
            Perguntas de locadoras e gestores de frota
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
                [
                  'controle-de-avarias-para-locadora',
                  'Controle de avarias para locadora: retirada × devolução',
                ],
                [
                  'sistema-check-in-check-out-frota',
                  'Sistema de check-in e check-out de frota',
                ],
                ['como-provar-amassado-pre-existente-locacao', 'Como provar amassado pré-existente'],
                ['controle-avarias-frota-entrada-saida', 'Controle de avarias: entrada, saída e histórico'],
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
        </div>

        <HistoricoDeFrotasFinalCta />
      </div>

      <ChatSupportWidget segment="locadoras" />
      <MobileStickyCta heroCtaId="historico-frotas-hero-cta" eventSource="historico-de-frotas" />
    </main>
  )
}
