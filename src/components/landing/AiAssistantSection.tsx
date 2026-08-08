'use client'

import Image from 'next/image'
import Reveal from '../Reveal'

const AI_BADGES = [
  'IA analisando imagens...',
  'Detectando danos...',
  'Gerando descrição...',
  'Calculando nível de confiança...',
]

const STEPS = [
  {
    n: '01',
    title: 'Marque o dano',
    body: 'O responsável seleciona a área diretamente no diagrama do veículo.',
  },
  {
    n: '02',
    title: 'Anexe evidências',
    body: 'Fotos e documentos ficam vinculados ao dano e à Identidade do Veículo.',
  },
  {
    n: '03',
    title: 'A IA analisa',
    body: 'IA analisando imagens… Detectando danos… Gerando descrição…',
    quote: '“Possível amassado localizado na região central da porta dianteira direita.”',
  },
  {
    n: '04',
    title: 'Revisão humana',
    body: 'Aprova, edita ou rejeita. A inteligência acelera — a auditoria permanece humana.',
    actions: true as const,
  },
  {
    n: '05',
    title: 'Evidência validada',
    body: 'Porta dianteira direita · Amassado — entra no dossiê após confirmação.',
    validated: true as const,
  },
  {
    n: '06',
    title: 'Atualizando histórico...',
    body: 'O registro vira uma nova camada na Memória Digital do Veículo.',
  },
]

export default function AiAssistantSection() {
  return (
    <section
      id="ia-assistente"
      className="w-full z-10 relative border-t border-[var(--card-border)]/40 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--signal)_8%,transparent)_0%,transparent_50%)]"
    >
      <div className="max-w-6xl mx-auto py-20 px-6">
        <Reveal className="text-center mb-10 flex flex-col items-center">
          <p className="font-mono-data text-[12px] tracking-[0.28em] text-[var(--signal-bright)] uppercase mb-3">
            Inteligência Artificial
          </p>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-tight leading-[0.95] text-[var(--text-main)] [text-wrap:balance] max-w-3xl">
            A IA é protagonista: de evidência a histórico em segundos
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[var(--text-muted)] max-w-2xl leading-relaxed">
            Analisa imagens, detecta danos, gera descrições e atualiza o histórico — com revisão humana e rastreabilidade completa.
          </p>

          <ul className="mt-6 flex flex-wrap justify-center gap-2 list-none m-0 p-0" aria-label="Recursos de IA">
            {AI_BADGES.map((label) => (
              <li
                key={label}
                className="rounded-lg border border-[var(--signal-bright)]/40 bg-[color-mix(in_srgb,var(--signal)_12%,transparent)] px-3.5 py-2 font-mono-data text-[10px] sm:text-[11px] uppercase tracking-[0.14em] text-[var(--signal-bright)] font-bold"
              >
                {label}
              </li>
            ))}
          </ul>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-10 items-start">
          <Reveal>
            <figure className="rounded-2xl border border-[var(--card-border)] overflow-hidden bg-[var(--panel-bg)]/50">
              <div className="relative w-full aspect-[1498/896] bg-[var(--bg-main)]">
                <Image
                  src="/landing/ia-sugestiva-confirma.webp"
                  alt="Tela do app: IA sugere classificação de avaria; vistoriador aceita, edita ou ignora antes de confirmar"
                  fill
                  quality={92}
                  className="object-contain object-top"
                  sizes="(max-width: 1024px) 100vw, 640px"
                  priority={false}
                />
              </div>
              <figcaption className="px-4 py-3 border-t border-[var(--card-border)] font-mono-data text-[10px] uppercase tracking-[0.16em] text-[var(--text-muted)]">
                IA sugere · vistoriador confirma no SVG
              </figcaption>
            </figure>
          </Reveal>

          <Reveal delay={80}>
            <div className="space-y-1">
              {STEPS.map((step, i) => (
                <div key={step.n}>
                  {i > 0 && (
                    <p className="text-center text-[var(--text-muted)] py-1.5" aria-hidden>
                      ↓
                    </p>
                  )}
                  <div
                    className={`rounded-xl border px-5 py-4 ${
                      'validated' in step && step.validated
                        ? 'border-emerald-500/30 bg-emerald-500/5'
                        : 'border-[var(--card-border)] bg-[var(--panel-bg)]/50'
                    }`}
                  >
                    <p className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-[var(--signal-bright)]">
                      {step.n} · {step.title}
                    </p>
                    {'body' in step && step.body && (
                      <p className="mt-2 text-sm text-[var(--text-muted)] leading-relaxed">{step.body}</p>
                    )}
                    {'quote' in step && step.quote && (
                      <p className="mt-2 text-sm text-[var(--text-main)] leading-relaxed italic">{step.quote}</p>
                    )}
                    {'actions' in step && step.actions && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {[
                          { label: 'Aprovar', cls: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10' },
                          { label: 'Editar', cls: 'border-amber-500/40 text-amber-400' },
                          { label: 'Rejeitar', cls: 'border-rose-500/40 text-rose-400' },
                        ].map((a) => (
                          <span
                            key={a.label}
                            className={`px-4 py-2 rounded-xl border text-xs font-bold uppercase tracking-wide ${a.cls}`}
                          >
                            {a.label}
                          </span>
                        ))}
                      </div>
                    )}
                    {'validated' in step && step.validated && (
                      <p className="mt-3 text-xs font-bold text-emerald-400">Validado pelo vistoriador</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        <Reveal delay={80} className="mt-8 text-center">
          <p className="text-[11px] text-[var(--text-muted)] max-w-xl mx-auto leading-relaxed">
            A análise da IA é uma sugestão de apoio à documentação. A confirmação final é sempre feita pelo
            vistoriador.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
