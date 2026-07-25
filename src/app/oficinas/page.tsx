import type { Metadata } from 'next'
import Link from 'next/link'
import { LaudoSheet } from '@/src/components/LaudoSheet'
import { OficinasHeroCtas, OficinasPlanosLink, OficinasFinalCta } from '@/src/components/OficinasCtas'
import { BlogVideo } from '@/src/components/blog/BlogVideo'
import ChatSupportWidget from '@/src/components/ChatSupportWidget'

const TITLE = 'Laudo de Vistoria Digital para Oficina Mecânica | Danos Aparentes'
const DESCRIPTION =
  'Sistema de vistoria digital para oficina: laudo profissional em minutos, com a marca da sua oficina, hash e QR Code de validação, sem papel e sem retrabalho.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/oficinas' },
  openGraph: { title: TITLE, description: DESCRIPTION, url: '/oficinas', type: 'website', images: ['/og-image.jpg'] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: ['/og-image.jpg'] },
}

const PAIN_POINTS = [
  {
    title: 'Laudo em papel some ou fica ilegível',
    desc: 'Prancheta e ficha impressa se perdem ou rasgam — quando o cliente questiona uma avaria depois, não sobra prova nenhuma.',
  },
  {
    title: 'Cliente desconfia do que foi registrado',
    desc: 'Sem assinatura digital e sem validação, fica a palavra da oficina contra a palavra do cliente na hora da entrega do veículo.',
  },
  {
    title: 'Cada mecânico anota do seu jeito',
    desc: 'Sem um diagrama padrão do veículo, um funcionário anota no capô, outro na porta — o laudo final fica inconsistente.',
  },
]

const FEATURES = [
  { title: 'Diagrama do veículo por tipo', desc: 'Marque a avaria direto no diagrama certo — carro, moto, van, caminhão — em vez de descrever de improviso.' },
  { title: 'Laudo pronto em minutos', desc: 'Fotos, observações e assinatura direto no celular; o PDF sai formatado, sem precisar digitar depois.' },
  { title: 'Laudo com hash SHA-256 e QR Code', desc: 'O documento comprova a si mesmo — reduz a discussão de "isso não estava assim quando entrou".' },
  { title: 'Marca própria no laudo (white-label)', desc: 'O PDF sai com a logo e o nome da sua oficina, reforçando profissionalismo com o cliente.' },
  { title: 'Funciona 100% offline', desc: 'Sem sinal na oficina? A vistoria continua e sincroniza sozinha quando a conexão voltar.' },
  { title: 'Envio direto por WhatsApp', desc: 'O laudo em PDF vai pro cliente com 1 clique, no mesmo momento da entrega ou devolução.' },
]

const FAQ: { q: string; a: string }[] = [
  {
    q: 'Preciso de treinamento para minha equipe usar?',
    a: 'Não. O diagrama do veículo guia o processo — o mecânico só toca no ponto do dano, escolhe o tipo e a gravidade. A primeira vistoria já sai pronta em minutos.',
  },
  {
    q: 'Dá para colocar a logo da minha oficina no laudo?',
    a: 'Sim — o PDF é white-label: a logo e o nome que aparecem no cabeçalho são os da sua oficina, configuráveis nas opções do perfil.',
  },
  {
    q: 'Funciona para qualquer tipo de veículo que a oficina atende?',
    a: 'Sim — carro (2 ou 4 portas), moto, van, caminhão, ônibus, microônibus e um modelo genérico, cada um com diagrama próprio em 4 vistas.',
  },
  {
    q: 'O laudo serve para eu me proteger de reclamação depois do serviço?',
    a: 'O laudo registra o estado do veículo na entrada com hash SHA-256, QR Code de verificação, fotos com GPS/data e assinatura do cliente — um registro documental forte para comparar entrada e saída.',
  },
  {
    q: 'Quanto custa para uma oficina pequena?',
    a: 'O plano Starter (R$ 29,90/mês, até 20 laudos) já cobre oficinas com menos movimento. O Pro (R$ 49,90/mês, até 80 laudos) inclui laudo personalizado e busca de placa. Para múltiplas unidades e laudos ilimitados, o Corporativo é sob consulta.',
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

export default function OficinasPage() {
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
            Oficinas Mecânicas
          </span>
          <h1 className="font-display text-4xl lg:text-5xl font-bold uppercase tracking-tight leading-[0.95]">
            Laudo de vistoria digital para oficina mecânica
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-3 max-w-lg">
            Laudo profissional em minutos, com a marca da sua oficina — sem papel, sem retrabalho e
            sem discussão sobre o que já estava avariado na entrada.
          </p>
          <OficinasHeroCtas />
        </header>

        <section className="mt-12 text-center">
          <h2 className="font-display text-2xl font-bold tracking-tight mb-2">
            Vistoria digital para oficina em poucos segundos
          </h2>
          <p className="text-sm text-[var(--text-muted)] max-w-lg mx-auto mb-2">
            Registre o estado do veículo na entrada e na saída direto do celular, com laudo pronto
            para entregar ao cliente.
          </p>
          <BlogVideo
            src="/videos/vistoria-locadoras.mp4"
            poster="/videos/vistoria-locadoras-poster.jpg"
            title="Vistoria digital para oficinas — Danos Aparentes"
            description="Registre o estado do veículo na entrada e na saída, com laudo pronto para entregar ao cliente."
            duration="PT8S"
            uploadDate="2026-07-13"
            caption="8 segundos · play quando quiser"
          />
        </section>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-center mb-8">
            O que acontece sem um laudo digital
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
            O que muda com o laudo digital
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
            Com a marca da sua oficina, não a nossa
          </h2>
          <p className="text-sm text-[var(--text-muted)] max-w-lg mx-auto mb-2">
            Ainda não temos histórico público de clientes — o app é novo. Em vez de depoimento, veja o
            laudo real gerado pelo app: a logo do topo é configurável para a sua oficina.
          </p>
          <LaudoSheet />
        </section>

        <section className="mt-16 max-w-2xl mx-auto text-center glass-card p-8">
          <h2 className="text-lg font-bold mb-1.5">Starter ou Pro para oficina pequena, Corporativo para rede</h2>
          <p className="text-sm text-[var(--text-muted)] mb-5">
            Se for uma oficina só, o Starter (20 laudos/mês) ou o Pro (80 laudos/mês) já cobrem. Para
            múltiplas unidades, integrações e laudos ilimitados, o Corporativo é sob consulta.
          </p>
          <OficinasPlanosLink />
        </section>

        <div className="max-w-2xl mx-auto mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-center mb-8">
            Perguntas de quem gerencia oficina
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
            Quer ver o passo a passo completo do laudo?{' '}
            <Link href="/blog/como-digitalizar-a-vistoria-da-sua-oficina" className="font-bold text-[var(--primary)] hover:underline">
              Veja o guia completo no blog
            </Link>
          </p>
        </div>

        <OficinasFinalCta />
      </div>

      <ChatSupportWidget segment="oficinas" />
    </main>
  )
}
