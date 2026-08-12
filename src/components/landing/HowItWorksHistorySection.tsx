'use client'

import { useState } from 'react'
import Reveal from '../Reveal'

const STEPS = [
  {
    id: 'veiculo',
    n: '1',
    title: 'Selecione o veículo',
    body: 'Abra o histórico de um veículo pela placa ou crie um novo — ele vira a memória digital daquele ativo.',
  },
  {
    id: 'inspecao',
    n: '2',
    title: 'Registre a inspeção',
    body: 'Abra uma nova inspeção vinculada à Identidade do Veículo — com data, hora, local e contexto da operação.',
  },
  {
    id: 'danos',
    n: '3',
    title: 'Marque os danos sobre o veículo',
    body: 'Toque no diagrama interativo e registre cada dano com localização precisa (lado, peça), severidade e responsável.',
  },
  {
    id: 'evidencias',
    n: '4',
    title: 'Fotografe e anexe evidências',
    body: 'Fotos, vídeos e documentos viram evidências digitais organizadas — com data, hora e rastreabilidade.',
  },
  {
    id: 'ia',
    n: '5',
    title: 'A IA analisa as imagens',
    body: 'A IA sugere a descrição e o nível de confiança do dano. A decisão final de registrar é sempre sua.',
  },
  {
    id: 'confirmar',
    n: '6',
    title: 'Você confirma e salva',
    body: 'Revise a sugestão da IA, confirme ou corrija, e a informação entra no histórico do veículo.',
  },
  {
    id: 'historico',
    n: '7',
    title: 'Uma nova camada é acrescentada',
    body: 'Cada inspeção NÃO substitui a anterior — ela soma uma camada permanente à memória digital do veículo.',
  },
  {
    id: 'comparar',
    n: '8',
    title: 'Faça uma nova inspeção',
    body: 'Na entrega, devolução ou qualquer novo momento, registre de novo. O histórico continua crescendo.',
  },
  {
    id: 'comparacao',
    n: '9',
    title: 'Compare os momentos',
    body: 'Na Linha do Tempo Veicular, coloque inspeções lado a lado e veja o que existia antes e o que há agora.',
  },
  {
    id: 'alteracoes',
    n: '10',
    title: 'Identifique as alterações',
    body: 'A comparação revela o que mudou — um novo dano, um reparo ou a evolução de uma avaria já conhecida.',
  },
] as const

export default function HowItWorksHistorySection() {
  const [active, setActive] = useState(0)
  const step = STEPS[active]

  return (
    <section
      id="como-funciona"
      className="w-full max-w-6xl mx-auto py-16 sm:py-20 px-6 z-10 relative border-t border-[var(--card-border)]/40"
    >
      <Reveal className="text-center mb-10 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 font-mono-data text-[11px] tracking-[0.2em] text-[var(--signal-bright)] uppercase mb-4">
          <span aria-hidden="true" className="w-4 h-px bg-[var(--sheet-line)]" />
          Registre · Como funciona
          <span aria-hidden="true" className="w-4 h-px bg-[var(--sheet-line)]" />
        </div>
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-tight leading-[0.95] text-[var(--text-main)] [text-wrap:balance] max-w-3xl">
          Da inspeção à memória digital do veículo
        </h2>
        <p className="mt-4 max-w-2xl text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
          Cada etapa adiciona inteligência ao histórico. Não é um checklist — é a construção contínua do
          patrimônio digital do veículo.
        </p>
      </Reveal>

      <Reveal>
        <div
          role="tablist"
          aria-label="Etapas da plataforma"
          className="flex flex-wrap justify-center gap-2 mb-8"
        >
          {STEPS.map((s, i) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={active === i}
              aria-controls={`step-panel-${s.id}`}
              id={`step-tab-${s.id}`}
              onClick={() => setActive(i)}
              className={`min-h-11 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-colors focus-visible:ring-2 ring-[var(--primary)] outline-none ${
                active === i
                  ? 'bg-primary text-white border-primary shadow-lg shadow-[var(--primary)]/20'
                  : 'border-[var(--card-border)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--btn-secondary-bg)]'
              }`}
            >
              <span>{s.n}</span>
              <span className="hidden lg:inline"> · Etapa {s.n}</span>
            </button>
          ))}
        </div>

        <div
          role="tabpanel"
          id={`step-panel-${step.id}`}
          aria-labelledby={`step-tab-${step.id}`}
          className="rounded-2xl border border-[var(--card-border)] bg-[var(--panel-bg)]/60 px-6 py-8 sm:px-10 sm:py-10 max-w-2xl mx-auto text-center"
        >
          <p className="font-mono-data text-4xl font-black text-[var(--signal)]/35">{step.n}</p>
          <h3 className="mt-2 font-display text-xl sm:text-2xl font-bold uppercase tracking-tight text-[var(--text-main)] [text-wrap:balance]">
            {step.title}
          </h3>
          <p className="mt-4 text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">{step.body}</p>
        </div>

        <ol className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 list-none m-0 p-0">
          {STEPS.map((s, i) => (
            <li key={`card-${s.id}`}>
              <button
                type="button"
                onClick={() => setActive(i)}
                className={`w-full h-full text-left rounded-xl border px-5 py-5 transition-all duration-200 focus-visible:ring-2 ring-[var(--primary)] outline-none ${
                  active === i
                    ? 'border-[var(--primary)]/50 bg-[var(--primary)]/8 shadow-[0_0_0_1px_color-mix(in_srgb,var(--primary)_20%,transparent)]'
                    : 'border-[var(--card-border)] bg-[var(--panel-bg)]/40 hover:border-[var(--primary)]/30 hover:-translate-y-0.5'
                }`}
              >
                <p className="font-mono-data text-xs uppercase tracking-wider text-[var(--signal-bright)]">
                  Etapa {s.n}
                </p>
                <p className="mt-1 font-bold text-[var(--text-main)] leading-snug">{s.title}</p>
                <p className="mt-2 text-xs text-[var(--text-muted)] leading-relaxed">{s.body}</p>
              </button>
            </li>
          ))}
        </ol>
      </Reveal>
    </section>
  )
}
