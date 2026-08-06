import type { Metadata } from 'next'
import Link from 'next/link'
import { LaudoSheet } from '@/src/components/LaudoSheet'
import { FrotasHeroCtas, FrotasPlanosLink, FrotasFinalCta } from '@/src/components/FrotasCtas'
import { BlogVideo } from '@/src/components/blog/BlogVideo'
import ChatSupportWidget from '@/src/components/ChatSupportWidget'
import B2bHistoricoSection from '@/src/components/B2bHistoricoSection'
import B2bMatchedHeroCopy from '@/src/components/B2bMatchedHeroCopy'
import MobileStickyCta from '@/src/components/MobileStickyCta'
import { B2B_BRAND, B2B_CATEGORY_SHORT, B2B_PRODUCT_LINE } from '@/src/lib/b2bPositioning'

const TITLE = `Gestão histórica de frota offline | ${B2B_BRAND}`
const DESCRIPTION =
  `${B2B_CATEGORY_SHORT} para frotas: inspeção offline, linha do tempo veicular por placa e dossiê técnico com hash + QR. 7 dias grátis sem cartão.`

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
    desc: 'Plataformas que dependem de conexão travam ou perdem dados justamente onde a frota costuma ficar estacionada.',
  },
  {
    title: 'Frota grande, formatos de inspeção diferentes',
    desc: 'Cada motorista ou inspetor registra do seu jeito, dificultando comparar avarias entre veículos da mesma frota.',
  },
  {
    title: 'Sem visão consolidada de todos os veículos',
    desc: 'Planilhas soltas por veículo tornam impossível enxergar, num único lugar, o estado geral da frota no mês.',
  },
]

const FEATURES = [
  { title: 'Linha do tempo veicular por placa', desc: 'Cada veículo acumula eventos ao longo do tempo — compare inspeções em vez de planilhas soltas.' },
  { title: 'Funciona 100% offline', desc: 'Registre a inspeção sem sinal — os dados ficam salvos no aparelho e sincronizam sozinhos assim que a conexão voltar.' },
  { title: 'Diagrama padronizado entre veículos', desc: 'Todo inspetor segue o mesmo padrão visual por tipo de veículo (carro, van, caminhão, ônibus), sem depender de experiência individual.' },
  { title: 'Dossiê técnico com hash SHA-256 e QR Code', desc: 'Cada dossiê comprova a si mesmo — reduz disputa de avaria não declarada entre uma inspeção e outra da mesma frota.' },
  { title: 'Busca automática por placa', desc: 'Marca, modelo, cor e ano preenchidos automaticamente ao digitar a placa, agilizando frotas com muitos veículos.' },
  { title: 'Marca própria no dossiê (white-label)', desc: 'O PDF sai com a logo e o nome da sua empresa de frota, não com uma marca genérica.' },
]

const FAQ: { q: string; a: string }[] = [
  {
    q: 'A plataforma realmente funciona sem internet no pátio?',
    a: 'Sim — a inspeção (fotos, marcações no diagrama, assinaturas) é salva no próprio aparelho e sincroniza automaticamente com o servidor assim que houver conexão novamente.',
  },
  {
    q: 'Dá para inspecionar vários tipos de veículo da mesma frota?',
    a: 'Sim — carro (2 ou 4 portas), moto, van, caminhão, ônibus, microônibus e um modelo genérico, cada um com diagrama próprio em 4 vistas.',
  },
  {
    q: 'Como funciona a gestão de múltiplos inspetores numa frota grande?',
    a: 'O plano Corporativo traz um painel consolidado por filial e por inspetor, permitindo acompanhar o volume e o estado da frota num único lugar.',
  },
  {
    q: 'Dá para integrar com o ERP de gestão de frota que já usamos?',
    a: 'O plano Corporativo inclui integração via API com ERP/CRM. Fale com o time comercial para avaliar o seu caso.',
  },
  {
    q: 'Quanto custa para uma frota pequena começar?',
    a: 'O plano Starter (R$ 29,90/mês, até 20 dossiês) ou o Pro (R$ 79,90/mês, até 80 dossiês, com dossiê personalizado) já cobrem frotas pequenas. Para múltiplos inspetores, integrações e dossiês ilimitados, o Corporativo é sob consulta.',
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
            vertical="frotas"
            defaultKicker={`Frotas · ${B2B_CATEGORY_SHORT}`}
            defaultHeadline="Memória digital da frota — mesmo offline"
            defaultSub={`${B2B_CATEGORY_SHORT}: registre avarias em qualquer pátio, sincronize depois e compare o estado de cada veículo na linha do tempo veicular.`}
            subClassName="text-sm text-[var(--text-muted)] mt-3 max-w-lg"
          />
          <FrotasHeroCtas />
        </header>

        <section className="mt-12 text-center">
          <h2 className="font-display text-2xl font-bold tracking-tight mb-2">
            Inspeção inteligente de frota em poucos segundos
          </h2>
          <p className="text-sm text-[var(--text-muted)] max-w-lg mx-auto mb-2">
            Faça a inspeção rápida no celular, mesmo sem internet no local, e saia com dossiê técnico pronto
            para cada veículo da frota.
          </p>
          <BlogVideo
            src="/videos/vistoria-digital-tour.mp4"
            poster="/videos/vistoria-digital-tour-poster.webp"
            title="Inspeção inteligente de frota — Danos Aparentes"
            description="Faça a inspeção rápida no celular, mesmo sem internet no local, com dossiê técnico pronto para cada veículo."
            duration="PT58S"
            uploadDate="2026-07-13"
            caption="Veja como funciona na prática"
          />
        </section>

        <B2bHistoricoSection vertical="frotas" />

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
            O que muda com histórico e evidência offline
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
            Ainda não temos histórico público de clientes — a plataforma é nova. Em vez de depoimento, veja o
            dossiê técnico real gerado pela plataforma: a logo do topo é configurável para a sua empresa.
          </p>
          <LaudoSheet />
        </section>

        <section className="mt-16 max-w-2xl mx-auto text-center glass-card p-8">
          <h2 className="text-lg font-bold mb-1.5">Starter ou Pro para frota pequena, Corporativo para frota grande</h2>
          <p className="text-sm text-[var(--text-muted)] mb-5">
            Se forem poucos veículos, o Starter (20 dossiês/mês) ou o Pro (80 dossiês/mês) já cobrem.
            Para múltiplos inspetores, filiais, integrações e dossiês ilimitados, o Corporativo é sob consulta.
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
          <div className="mt-10 max-w-2xl mx-auto">
            <p className="text-center text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3">
              Leia também
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs">
              {[
                ['vistoria-de-frota-padronizar-equipe', 'Vistoria de frota: como padronizar a equipe'],
                ['como-padronizar-equipe-de-vistoria-e-acabar-com-o-retrabalho', 'Como padronizar a equipe e acabar com o retrabalho'],
                ['como-reduzir-prejuizo-com-avarias-na-frota', 'Como reduzir prejuízo com avarias na frota'],
                ['plano-corporativo-gestao-de-equipe-vistoriadores', 'Plano Corporativo: gerenciar a equipe em um só lugar'],
                ['controle-avarias-frota-entrada-saida', 'Controle de avarias na frota: entrada, saída e histórico'],
                ['vistoria-de-frota-sem-internet', 'Vistoria de frota sem internet: como funciona'],
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

        <FrotasFinalCta />
      </div>

      <ChatSupportWidget segment="frotas" />
      <MobileStickyCta heroCtaId="frotas-hero-cta" eventSource="frotas" />
    </main>
  )
}
