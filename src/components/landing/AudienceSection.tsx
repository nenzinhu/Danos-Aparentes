'use client'

import Reveal from '../Reveal'

const AUDIENCES = [
  {
    title: 'Locadoras',
    desc: 'Compare entrada e devolução e identifique novos danos sem discussão.',
    impact: 'Recupere a receita de avarias que hoje some em “já estava assim”.',
  },
  {
    title: 'Concessionárias',
    desc: 'Registre veículos em test-drives, movimentações e entregas.',
    impact: 'Evite prejuízo em seminovos com estado documentado em cada transferência.',
  },
  {
    title: 'Seguradoras',
    desc: 'Documente o estado do veículo com evidências fotográficas e dossiê verificável.',
    impact: 'Reduza contestação com dossiê hash + QR e fotos vinculadas ao dano.',
  },
  {
    title: 'Oficinas',
    desc: 'Registre a condição na entrada e na saída do serviço.',
    impact: 'Feche o serviço sem briga sobre dano pré-existente no pátio.',
  },
  {
    title: 'Transportadoras',
    desc: 'Acompanhe a condição do veículo em cada etapa do transporte.',
    impact: 'Prove em qual trecho o dano surgiu — e quem responde pelo custo.',
  },
  {
    title: 'Empresas com frotas',
    desc: 'Gestão histórica contínua do estado dos veículos na operação.',
    impact: 'Corte custo oculto de avarias não cobradas entre motoristas e turnos.',
  },
  {
    title: 'Profissionais de inspeção',
    desc: 'Inspeções inteligentes com documentação profissional e dossiê com QR.',
    impact: 'Entregue laudo premium e cobrado — sem planilha nem WhatsApp solto.',
  },
]

export default function AudienceSection() {
  return (
    <section
      id="para-quem"
      className="w-full z-10 relative border-t border-[var(--card-border)]/40 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--signal)_7%,transparent)_0%,transparent_42%)]"
    >
      <div className="max-w-6xl mx-auto py-20 px-6">
        <Reveal className="text-center mb-10 flex flex-col items-center">
          <p className="font-mono-data text-[12px] tracking-[0.28em] text-[var(--signal-bright)] uppercase mb-3">
            Feito para
          </p>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-tight leading-[0.95] text-[var(--text-main)] [text-wrap:balance] max-w-3xl">
            Para quem o prejuízo de um dano não comprovado é caro.
          </h2>
          <p className="mt-4 text-sm text-[var(--text-muted)] max-w-xl leading-relaxed">
            Do check-out da locadora à vistoria independente — o mesmo histórico digital, comparável no tempo, pronto para cobrar ou defender.
          </p>
        </Reveal>

        <Reveal>
          <ul
            className="flex flex-wrap justify-center gap-2.5 sm:gap-3 list-none m-0 p-0 mb-12"
            aria-label="Públicos atendidos"
          >
            {AUDIENCES.map((a) => (
              <li key={`chip-${a.title}`}>
                <a
                  href={`#audience-${slug(a.title)}`}
                  className="inline-flex items-center rounded-lg border border-[var(--card-border)] bg-[var(--panel-bg)]/70 px-4 py-2.5 font-display text-sm sm:text-base font-semibold uppercase tracking-tight text-[var(--text-main)] hover:border-[var(--signal-bright)]/50 hover:text-[var(--signal-bright)] focus-visible:ring-2 ring-[var(--primary)] outline-none transition-colors"
                >
                  {a.title}
                </a>
              </li>
            ))}
          </ul>
        </Reveal>

        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 list-none m-0 p-0">
          {AUDIENCES.map((a, i) => (
            <Reveal key={a.title} as="li" delay={i * 40} className="h-full">
              <div
                id={`audience-${slug(a.title)}`}
                className="h-full rounded-2xl border border-[var(--card-border)] bg-[var(--panel-bg)]/45 px-5 py-5 flex flex-col scroll-mt-28"
              >
                <h3 className="font-display text-xl sm:text-2xl font-bold uppercase tracking-tight text-[var(--text-main)]">
                  {a.title}
                </h3>
                <p className="mt-2 text-sm text-[var(--text-muted)] leading-relaxed">{a.desc}</p>
                <p className="mt-4 text-sm font-semibold text-[var(--signal-bright)] leading-snug border-t border-[var(--card-border)]/60 pt-3">
                  {a.impact}
                </p>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}

function slug(title: string) {
  return title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}
