'use client'

import Link from 'next/link'
import Reveal from '../Reveal'

const TIMELINE = [
  {
    tone: 'ok' as const,
    date: '12 JAN 2026',
    title: 'Entrega',
    desc: 'Primeira inspeção — baseline do patrimônio digital',
    meta: ['8 danos mapeados', '24 evidências'],
  },
  {
    tone: 'ok' as const,
    date: '15 JAN 2026',
    title: 'Primeira Inspeção',
    desc: 'Evento registrado na linha do tempo',
    meta: ['8 danos confirmados', '26 evidências', 'Assinatura registrada'],
  },
  {
    tone: 'warn' as const,
    date: '18 JAN 2026',
    title: 'Reparo',
    desc: 'Evento de oficina vinculado ao histórico',
    meta: ['Dossiê técnico atualizado'],
  },
  {
    tone: 'alert' as const,
    date: '20 JAN 2026',
    title: 'Nova Inspeção',
    desc: 'Porta dianteira direita · Amassado identificado',
    meta: ['Evidência fotográfica', 'IA analisou', 'Validado pelo responsável'],
  },
  {
    tone: 'ok' as const,
    date: '22 JAN 2026',
    title: 'Venda',
    desc: 'Transferência com histórico completo',
    meta: [],
  },
  {
    tone: 'ok' as const,
    date: '22 JAN 2026',
    title: 'Novo Proprietário',
    desc: 'Memória digital continua — nova camada de eventos',
    meta: ['Rastreabilidade preservada'],
  },
]

const DOT = {
  ok: 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.55)]',
  warn: 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.45)]',
  alert: 'bg-rose-400 shadow-[0_0_10px_rgba(251,113,133,0.55)]',
}

export default function VehicleHistoryTimelineSection() {
  return (
    <section
      id="historico-digital"
      className="w-full z-10 relative border-t border-[var(--card-border)]/40 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--signal)_10%,transparent)_0%,transparent_55%)]"
    >
      <div className="max-w-6xl mx-auto py-20 px-6">
        <Reveal className="text-center mb-12 flex flex-col items-center">
          <p className="font-mono-data text-[12px] tracking-[0.28em] text-[var(--signal-bright)] uppercase mb-3">
            Histórico · Linha do Tempo Veicular
          </p>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-tight leading-[0.92] text-[var(--text-main)] [text-wrap:balance] max-w-4xl">
            Cada inspeção vira um evento. Toda a vida útil do veículo, documentada.
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[var(--text-muted)] max-w-2xl leading-relaxed">
            O PDF é uma saída. O histórico é o produto.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-10 items-start">
          <Reveal>
            <div className="rounded-2xl border border-[var(--signal-bright)]/25 bg-[var(--panel-bg)]/60 p-6 sm:p-8 shadow-[0_0_0_1px_color-mix(in_srgb,var(--signal)_12%,transparent)]">
              <div className="mb-6 pb-5 border-b border-[var(--card-border)]">
                <p className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-[var(--signal-bright)]">
                  Linha do Tempo · Memória Digital
                </p>
                <h3 className="mt-1 font-display text-2xl sm:text-3xl font-bold uppercase tracking-tight text-[var(--text-main)]">
                  Chevrolet Onix
                </h3>
                <p className="mt-1 font-mono-data text-sm tracking-[0.2em] text-[var(--signal-bright)]">ABC1D23</p>
              </div>
              <ol className="space-y-5 list-none m-0 p-0">
                {TIMELINE.map((item, idx) => (
                  <li key={`${item.title}-${item.date}`} className="flex gap-4">
                    <div className="flex flex-col items-center pt-1">
                      <span className={`w-2.5 h-2.5 rounded-full ${DOT[item.tone]}`} aria-hidden />
                      {idx < TIMELINE.length - 1 && (
                        <span className="w-px flex-1 bg-[var(--card-border)] mt-2 min-h-[1.5rem]" aria-hidden />
                      )}
                    </div>
                    <div className="pb-1 min-w-0">
                      <p className="font-mono-data text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                        {item.date}
                      </p>
                      <p className="mt-1 text-base font-bold text-[var(--text-main)]">{item.title}</p>
                      <p className="mt-1 text-xs text-[var(--text-muted)] leading-relaxed">{item.desc}</p>
                      {item.meta.length > 0 && (
                        <ul className="mt-2 flex flex-wrap gap-2 list-none m-0 p-0">
                          {item.meta.map((m) => (
                            <li
                              key={m}
                              className="font-mono-data text-[10px] uppercase tracking-wider text-[var(--text-muted)] border border-[var(--card-border)] px-2 py-0.5 rounded"
                            >
                              {m}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
              <Link
                href="/demo"
                className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[var(--primary)] underline underline-offset-2 hover:opacity-90 focus-visible:ring-2 ring-[var(--primary)] rounded-lg outline-none"
              >
                Ver comparação
                <span aria-hidden>→</span>
              </Link>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="space-y-4">
              <div className="rounded-xl border border-[var(--card-border)] px-5 py-5">
                <p className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-emerald-400">Antes</p>
                <p className="mt-2 text-sm font-semibold text-[var(--text-main)]">Porta dianteira direita</p>
                <p className="mt-1 text-xs text-[var(--text-muted)]">Sem novo dano</p>
              </div>
              <div className="rounded-xl border border-rose-400/30 bg-rose-500/5 px-5 py-5">
                <p className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-rose-400">Depois</p>
                <p className="mt-2 text-sm font-semibold text-[var(--text-main)]">Porta dianteira direita</p>
                <p className="mt-1 text-xs text-rose-300/90">Novo amassado</p>
              </div>
              <div className="rounded-xl border border-[var(--signal-bright)]/35 bg-[color-mix(in_srgb,var(--signal)_10%,transparent)] px-5 py-5">
                <p className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-[var(--signal-bright)]">
                  No histórico
                </p>
                <p className="mt-2 text-base font-bold text-[var(--text-main)]">1 nova avaria identificada</p>
                <p className="mt-1 text-xs text-[var(--text-muted)] leading-relaxed">
                  Registrada, datada e pronta para o laudo PDF.
                </p>
              </div>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed pt-1 font-semibold">
                O histórico é o produto. O PDF é uma das saídas.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
