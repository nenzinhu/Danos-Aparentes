'use client'

import Reveal from '../Reveal'

const AUDIENCES = [
  {
    title: 'Locadoras',
    desc: 'Compare entrada e devolução e saiba quando uma avaria apareceu.',
    impact: 'Reduza discussões e prejuízos na devolução.',
  },
  {
    title: 'Oficinas',
    desc: 'Documente como o veículo chegou e como foi entregue.',
    impact: 'Feche serviços sem briga sobre dano pré-existente.',
  },
  {
    title: 'Frotas',
    desc: 'Tenha histórico de inspeções por veículo.',
    impact: 'Corte custo oculto de avarias entre motoristas e turnos.',
  },
  {
    title: 'Revendas',
    desc: 'Registre o estado do veículo em cada etapa da operação.',
    impact: 'Evite contestação pós-venda e proteja o estoque.',
  },
  {
    title: 'Seguradoras',
    desc: 'Organize evidências do estado do veículo.',
    impact: 'Reduza contestação com dossiê verificável e fotos vinculadas.',
  },
  {
    title: 'Despachantes',
    desc: 'Faça vistorias pelo celular e gere documentação profissional.',
    impact: 'Entregue laudo premium sem planilha.',
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
            Quem precisa provar o estado do veículo.
          </h2>
          <p className="mt-4 text-sm text-[var(--text-muted)] max-w-2xl leading-relaxed">
            Histórico digital comparável para locadoras, frotas, oficinas e revendas.
          </p>
        </Reveal>

        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 list-none m-0 p-0">
          {AUDIENCES.filter(a => ['Locadoras','Frotas','Oficinas','Revendas'].includes(a.title)).map((a, i) => (
            <Reveal key={a.title} as="li" delay={i * 40} className="h-full">
              <div className="h-full rounded-2xl border border-[var(--card-border)] bg-[var(--panel-bg)]/45 px-5 py-5 flex flex-col">
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
