import type { Metadata } from 'next'
import Link from 'next/link'

const SITE_URL = 'https://danosaparentes.com.br'
const WHATSAPP_LINK = 'https://wa.me/5548992032348'

export const metadata: Metadata = {
  title: 'Parcerias | Danos Aparentes — Melhor juntos na gestão de frota',
  description:
    'Parceria Danos Aparentes + gestão de frotas/locadoras: seu sistema cadastra o veículo, a gente prova o estado dele. Devolução em 1 clique, menos disputa, anti-fraude embutido.',
  alternates: { canonical: '/parcerias' },
  openGraph: {
    title: 'Parcerias | Danos Aparentes — Melhor juntos na gestão de frota',
    description:
      'Gestão de frota + prova de estado do veículo. Co-marketing para locadoras e frotistas.',
    url: '/parcerias',
    type: 'website',
    images: ['/og-image.jpg'],
  },
}

const VALUES = [
  {
    title: 'Cadastro → Prova',
    body: 'O veículo entra no seu sistema e sai do nosso com laudo fotográfico e histórico.',
  },
  {
    title: 'Devolução em 1 clique',
    body: 'O retorno importa o laudo anterior e destaca o que é novo — sem recontar a história.',
  },
  {
    title: 'Menos disputa',
    body: 'Evidência, não discussão. O estado do veículo fica registrado e comparável no tempo.',
  },
  {
    title: 'Anti-fraude embutido',
    body: 'Cada foto tem hash + auditoria. Você prova o que aconteceu, quando e onde.',
  },
]

export default function ParceriasPage() {
  return (
    <main className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)]">
      <section className="mx-auto max-w-3xl px-5 py-16">
        <p className="font-mono-data text-[11px] uppercase tracking-[0.2em] text-[var(--signal-bright)] mb-3">
          Co-marketing · Gestão de frota
        </p>
        <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight leading-[1.05]">
          Frota sob controle, do cadastro à devolução.
        </h1>
        <p className="mt-4 text-[var(--text-muted)] text-lg leading-relaxed">
          Seu sistema de gestão já sabe <span className="text-[var(--text-main)]">onde</span> está cada veículo.
          O Danos Aparentes sabe <span className="text-[var(--text-main)]">como ele está</span> — com evidência
          fotográfica, histórico e IA que aponta o que mudou.
        </p>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {VALUES.map((v) => (
            <div
              key={v.title}
              className="rounded-xl border border-[var(--card-border)] bg-[var(--panel-bg)]/80 p-4"
            >
              <p className="font-semibold text-[var(--text-main)]">{v.title}</p>
              <p className="mt-1 text-sm text-[var(--text-muted)] leading-snug">{v.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-[var(--card-border)] bg-[var(--panel-bg)]/90 p-6">
          <p className="font-display text-xl font-bold">Quer ser parceiro?</p>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Softwares de gestão de frotas, locadoras e frotistas: juntos geramos leads e reduzimos disputa
            de devolução. Cada um fica com seus leads na fase 1 — sem investimento de mídia.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href={WHATSAPP_LINK}
              className="rounded-lg bg-[var(--signal)] px-5 py-2.5 text-sm font-bold text-[#04121f] hover:opacity-90 transition-opacity"
            >
              Quero ser parceiro
            </a>
            <Link
              href="/demo"
              className="rounded-lg border border-[var(--card-border)] px-5 py-2.5 text-sm font-semibold text-[var(--text-main)] hover:bg-[var(--panel-bg)] transition-colors"
            >
              Ver como funciona
            </Link>
          </div>
        </div>

        <p className="mt-8 text-xs text-[var(--text-muted)]">
          Campanha "Better Together" · Danos Aparentes × gestão de frotas/locadoras.
        </p>
      </section>
    </main>
  )
}
