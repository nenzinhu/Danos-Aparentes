import type { Metadata } from 'next'
import Link from 'next/link'
import { LaudoSheet } from '@/src/components/LaudoSheet'
import { FrotasHeroCtas, FrotasPlanosLink, FrotasFinalCta } from '@/src/components/FrotasCtas'
import { BlogVideo } from '@/src/components/blog/BlogVideo'

const TITLE = 'App de Vistoria de Frota Offline | Danos Aparentes'
const DESCRIPTION =
  'Vistoria digital de frota que funciona sem internet: registre avarias em pátios sem sinal, sincronize depois e saia com laudo padronizado entre todos os veículos.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/frotas' },
  openGraph: { title: TITLE, description: DESCRIPTION, url: '/frotas', type: 'website', images: ['/og-image.jpg'] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: ['/og-image.jpg'] },
}

const PAIN_POINTS = [
  {
    title: 'Pátio ou galpão sem sinal de internet',
    desc: 'Apps que dependem de conexão travam ou perdem dados justamente onde a frota costuma ficar estacionada.',
  },
  {
    title: 'Frota grande, formatos de vistoria diferentes',
    desc: 'Cada motorista ou vistoriador registra do seu jeito, dificultando comparar avarias entre veículos da mesma frota.',
  },
  {
    title: 'Sem visão consolidada de todos os veículos',
    desc: 'Planilhas soltas por veículo tornam impossível enxergar, num único lugar, o estado geral da frota no mês.',
  },
]

const FEATURES = [
  { title: 'Funciona 100% offline', desc: 'Registre a vistoria sem sinal — os dados ficam salvos no aparelho e sincronizam sozinhos assim que a conexão voltar.' },
  { title: 'Checklist padronizado entre veículos', desc: 'Todo vistoriador segue o mesmo diagrama por tipo de veículo (carro, van, caminhão, ônibus), sem depender de experiência individual.' },
  { title: 'Laudo com hash SHA-256 e QR Code', desc: 'Cada laudo comprova a si mesmo — reduz disputa de avaria não declarada entre uma vistoria e outra da mesma frota.' },
  { title: 'Busca automática por placa', desc: 'Marca, modelo, cor e ano preenchidos automaticamente ao digitar a placa, agilizando frotas com muitos veículos.' },
  { title: 'Marca própria no laudo (white-label)', desc: 'O PDF sai com a logo e o nome da sua empresa de frota, não com uma marca genérica.' },
  { title: 'Envio direto por WhatsApp', desc: 'O laudo em PDF vai pro responsável pelo veículo com 1 clique, assim que a vistoria termina.' },
]

const FAQ: { q: string; a: string }[] = [
  {
    q: 'O app realmente funciona sem internet no pátio?',
    a: 'Sim — a vistoria (fotos, marcações no diagrama, assinaturas) é salva no próprio aparelho e sincroniza automaticamente com o servidor assim que houver conexão novamente.',
  },
  {
    q: 'Dá para vistoriar vários tipos de veículo da mesma frota?',
    a: 'Sim — carro (2 ou 4 portas), moto, van, caminhão, ônibus, microônibus e um modelo genérico, cada um com diagrama próprio em 4 vistas.',
  },
  {
    q: 'Como funciona a gestão de múltiplos vistoriadores numa frota grande?',
    a: 'O plano Corporativo traz um painel consolidado por filial e por vistoriador, permitindo acompanhar o volume e o estado da frota num único lugar.',
  },
  {
    q: 'Dá para integrar com o sistema de gestão de frota que já usamos?',
    a: 'O plano Corporativo inclui integração via API com ERP/CRM. Fale com o time comercial para avaliar o seu caso.',
  },
  {
    q: 'Quanto custa para uma frota pequena começar?',
    a: 'O plano Pro (R$ 49,90/mês) já cobre vistorias ilimitadas e laudo personalizado. Para múltiplos vistoriadores e integrações, o Corporativo é sob consulta.',
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

export default function FrotasPage() {
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
            Gestão de Frotas
          </span>
          <h1 className="font-display text-4xl lg:text-5xl font-bold uppercase tracking-tight leading-[0.95]">
            App de vistoria de frota que funciona offline
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-3 max-w-lg">
            Registre avarias em qualquer pátio, com ou sem sinal, e mantenha um checklist
            padronizado entre todos os veículos da frota.
          </p>
          <FrotasHeroCtas />
        </header>

        <section className="mt-12 text-center">
          <h2 className="font-display text-2xl font-bold tracking-tight mb-2">
            Vistoria digital de frota em poucos segundos
          </h2>
          <p className="text-sm text-[var(--text-muted)] max-w-lg mx-auto mb-2">
            Faça a vistoria rápida no celular, mesmo sem internet no local, e saia com laudo pronto
            para cada veículo da frota.
          </p>
          <BlogVideo
            src="/videos/vistoria-locadoras.mp4"
            poster="/videos/vistoria-locadoras-poster.jpg"
            title="Vistoria digital de frota — Danos Aparentes"
            description="Faça a vistoria rápida no celular, mesmo sem internet no local, com laudo pronto para cada veículo."
            duration="PT8S"
            uploadDate="2026-07-13"
            caption="8 segundos · play quando quiser"
          />
        </section>

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

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-center mb-8">
            O que muda com a vistoria digital offline
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
            Com a marca da sua empresa, não a nossa
          </h2>
          <p className="text-sm text-[var(--text-muted)] max-w-lg mx-auto mb-2">
            Ainda não temos histórico público de clientes — o app é novo. Em vez de depoimento, veja o
            laudo real gerado pelo app: a logo do topo é configurável para a sua empresa.
          </p>
          <LaudoSheet />
        </section>

        <section className="mt-16 max-w-2xl mx-auto text-center glass-card p-8">
          <h2 className="text-lg font-bold mb-1.5">Pro para frota pequena, Corporativo para frota grande</h2>
          <p className="text-sm text-[var(--text-muted)] mb-5">
            Se forem poucos veículos, o plano Pro (R$ 49,90/mês) já cobre. Para múltiplos
            vistoriadores, filiais e integrações, o Corporativo é sob consulta.
          </p>
          <FrotasPlanosLink />
        </section>

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
            Quer entender como funciona a vistoria sem internet?{' '}
            <Link href="/blog/vistoria-de-frota-sem-internet" className="font-bold text-[var(--primary)] hover:underline">
              Veja a explicação completa no blog
            </Link>
          </p>
        </div>

        <FrotasFinalCta />
      </div>
    </main>
  )
}
