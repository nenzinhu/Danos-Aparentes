import type { Metadata } from 'next'
import Link from 'next/link'
import { LaudoSheet } from '@/src/components/LaudoSheet'
import { LocadorasHeroCtas, LocadorasPlanosLink, LocadorasFinalCta } from '@/src/components/LocadorasCtas'
import { BlogVideo } from '@/src/components/blog/BlogVideo'
import ChatSupportWidget from '@/src/components/ChatSupportWidget'

const TITLE = 'Sistema de Vistoria Veicular para Locadora | Danos Aparentes'
const DESCRIPTION =
  'Sistema de vistoria digital para locadoras e frotistas: checklist padronizado entre vistoriadores, laudo com hash e QR Code, funciona offline e sai com a marca da sua empresa.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/locadoras' },
  openGraph: { title: TITLE, description: DESCRIPTION, url: '/locadoras', type: 'website', images: ['/og-image.jpg'] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: ['/og-image.jpg'] },
}

const PAIN_POINTS = [
  {
    title: 'Cada vistoriador registra do seu jeito',
    desc: 'Sem um checklist padronizado, a devolução de um veículo vira uma prancheta diferente por pessoa — e a locadora perde argumento na hora de cobrar avaria.',
  },
  {
    title: 'Fotos soltas, sem hora nem local',
    desc: 'Sem GPS e timestamp automáticos, uma foto solta no celular não prova quando o dano apareceu — só gera discussão no balcão.',
  },
  {
    title: 'Sem visão consolidada da frota',
    desc: 'Cada vistoriador com sua planilha ou papel torna impossível enxergar, em um único lugar, quantas avarias a frota acumulou no mês.',
  },
]

const FEATURES = [
  { title: 'Checklist padronizado entre vistoriadores', desc: 'Todo mundo segue o mesmo diagrama por vista do veículo (frontal, traseira, laterais) — sem depender da experiência individual de cada vistoriador.' },
  { title: 'Funciona 100% offline', desc: 'Sem sinal no pátio? A vistoria continua normalmente e sincroniza sozinha assim que a conexão voltar.' },
  { title: 'Laudo com hash SHA-256 e QR Code', desc: 'Cada laudo comprova a si mesmo — reduz a disputa de "avaria que já existia" na devolução.' },
  { title: 'Marca própria no laudo (white-label)', desc: 'O PDF sai com a logo e o nome da sua locadora ou concessionária, não com uma marca genérica.' },
  { title: 'Gestão centralizada de equipe', desc: 'Múltiplos vistoriadores, painel consolidado por filial e por vistoriador, no plano Corporativo.' },
  { title: 'Envio direto por WhatsApp', desc: 'O laudo em PDF vai pro cliente com 1 clique, no mesmo momento da devolução.' },
]

const FAQ: { q: string; a: string }[] = [
  {
    q: 'Quanto custa um sistema de vistoria para locadora?',
    a: 'Varia por volume de vistorias, número de vistoriadores e integrações (ERP/CRM) — por isso o plano Corporativo é sob consulta, com resposta em minutos pelo WhatsApp.',
  },
  {
    q: 'Quanto tempo leva para colocar a equipe pra usar?',
    a: 'Cada vistoriador cria a conta e já consegue registrar a primeira vistoria em minutos — não exige treinamento longo, o diagrama do veículo guia o processo.',
  },
  {
    q: 'Dá para integrar com o sistema que já usamos?',
    a: 'O plano Corporativo inclui integração via API com ERP/CRM. Fale com o time comercial para avaliar o seu caso específico.',
  },
  {
    q: 'Funciona para qualquer tipo de veículo da frota?',
    a: 'Sim — carro, moto, caminhão, van, ônibus e um modelo genérico, cada um com diagramas próprios em 4 vistas.',
  },
  {
    q: 'O laudo tem força para cobrar avaria não declarada na devolução?',
    a: 'O laudo sai com hash SHA-256, QR Code de verificação, GPS e assinaturas digitais do vistoriador e do cliente — um registro documental forte para comparar a retirada com a devolução. O valor probatório específico depende do contrato e do aceite das partes.',
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

export default function LocadorasPage() {
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
            Locadoras e Frotistas
          </span>
          <h1 className="font-display text-4xl lg:text-5xl font-bold uppercase tracking-tight leading-[0.95]">
            Sistema de vistoria veicular para locadora
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-3 max-w-lg">
            Padronize a vistoria entre todos os vistoriadores da sua frota, com laudo que comprova a si
            mesmo — sem discutir avaria não declarada na devolução.
          </p>
          <LocadorasHeroCtas />
        </header>

        <section className="mt-12 text-center">
          <h2 className="font-display text-2xl font-bold tracking-tight mb-2">
            Vistoria digital para locadora em poucos segundos
          </h2>
          <p className="text-sm text-[var(--text-muted)] max-w-lg mx-auto mb-2">
            Evite discussões por riscos na devolução. Faça a vistoria digital rápida no celular e
            saia com laudo pronto para cobrar o que é da frota.
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
        </section>

        {/* Dor */}
        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-center mb-8">
            O que acontece sem um processo padronizado
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

        {/* Solução / recursos */}
        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-center mb-8">
            O que muda com a vistoria digital padronizada
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

        {/* Prova: laudo real gerado pelo app, com marca própria */}
        <section className="mt-16 text-center">
          <h2 className="font-display text-2xl font-bold tracking-tight mb-2">
            Com a marca da sua locadora, não a nossa
          </h2>
          <p className="text-sm text-[var(--text-muted)] max-w-lg mx-auto mb-2">
            Ainda não temos histórico público de clientes — o app é novo. Em vez de depoimento, veja o
            laudo real gerado pelo app: a logo do topo é configurável para a sua empresa.
          </p>
          <LaudoSheet />
        </section>

        {/* Ponte para preços e blog relacionado */}
        <section className="mt-16 max-w-2xl mx-auto text-center glass-card p-8">
          <h2 className="text-lg font-bold mb-1.5">Starter ou Pro para vistoriador autônomo, Corporativo para frota</h2>
          <p className="text-sm text-[var(--text-muted)] mb-5">
            Se for só você ou uma oficina pequena, o Starter (20 laudos/mês) ou o Pro (80 laudos/mês) já
            cobrem. Para múltiplos vistoriadores, filiais, integrações e laudos ilimitados, o Corporativo é sob consulta.
          </p>
          <LocadorasPlanosLink />
        </section>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-center mb-8">
            Perguntas de quem gerencia frota
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
            Quer ver como padronizar a devolução de veículos passo a passo?{' '}
            <Link href="/blog/checklist-vistoria-devolucao-locadora" className="font-bold text-[var(--primary)] hover:underline">
              Veja o checklist completo no blog
            </Link>
          </p>
        </div>

        {/* CTA final */}
        <LocadorasFinalCta />
      </div>

      <ChatSupportWidget segment="locadoras" />
    </main>
  )
}
