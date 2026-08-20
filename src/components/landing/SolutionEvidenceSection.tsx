'use client'

import Reveal from '../Reveal'
import { B2B_PRODUCT_LINE } from '@/src/lib/b2bPositioning'

const FEATURES = [
  {
    title: 'Fotos e vídeos',
    benefit: 'Registre visualmente o estado real do veículo.',
    body: 'Cada avaria vira uma imagem vinculada à peça, com data, hora e GPS.',
  },
  {
    title: 'Comparação',
    benefit: 'Identifique novos danos sem discussão.',
    body: 'Coloque inspeções anteriores e posteriores lado a lado e veja o que mudou.',
  },
  {
    title: 'GPS',
    benefit: 'Saiba exatamente onde a inspeção aconteceu.',
    body: 'O local da operação fica registrado como parte da evidência.',
  },
  {
    title: 'Data e hora',
    benefit: 'Construa uma linha do tempo que ninguém contesta.',
    body: 'Cada registro carimba o momento exato do estado do veículo.',
  },
  {
    title: 'Inteligência artificial',
    benefit: 'Agilize a identificação e descrição das avarias.',
    body: 'A IA sugere tipo, grau e texto — você confirma. Nada entra sozinho.',
  },
  {
    title: 'Histórico',
    benefit: 'Tenha todas as inspeções organizadas por veículo.',
    body: 'Da entrada à devolução, tudo numa só linha do tempo auditável.',
  },
  {
    title: 'Relatório',
    benefit: 'Gere laudos profissionais em PDF em um clique.',
    body: 'Envie pelo WhatsApp ou e-mail antes mesmo do cliente sair do pátio.',
  },
  {
    title: 'Integridade',
    benefit: 'Comprove que o registro não foi alterado.',
    body: 'Hash SHA-256 e QR Code permitem verificar a autenticidade do documento.',
  },
]

const STEPS = [
  { n: '01', title: 'Inspecione', desc: 'Veículo, responsável, data/hora e geolocalização.' },
  { n: '02', title: 'Documente', desc: 'Fotos com metadados, peças marcadas no diagrama.' },
  { n: '03', title: 'Compare', desc: 'Antes × Depois, avarias novas versus reparadas.' },
  { n: '04', title: 'Comprove', desc: 'QR Code, Hash SHA-256 e PDF rastreável.' },
]

const BENEFITS = [
  'Reduza disputas na devolução de veículos',
  'Evite cobranças indevidas por danos pré-existentes',
  'Tenha provas organizadas para processos judiciais',
  'Agilize o tempo de inspeção em até 50%',
  'Padronize processos entre filiais e equipes',
]

export default function SolutionEvidenceSection() {
  return (
    <section
      id="solucao"
      className="w-full max-w-6xl mx-auto py-20 px-6 z-10 relative border-t border-[var(--card-border)]/40"
    >
      <Reveal className="text-center mb-12 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 font-mono-data text-[11px] tracking-[0.2em] text-[var(--signal-bright)] uppercase mb-4">
          <span aria-hidden="true" className="w-4 h-px bg-[var(--sheet-line)]" />
          Solução
          <span aria-hidden="true" className="w-4 h-px bg-[var(--sheet-line)]" />
        </div>
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-tight leading-[0.95] text-[var(--text-main)] [text-wrap:balance] max-w-3xl">
          Tudo o que você precisa para construir um histórico confiável.
        </h2>
        <p className="mt-4 max-w-2xl text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
          {B2B_PRODUCT_LINE} Cada recurso existe para uma única razão: provar quando e onde um dano aconteceu.
        </p>
      </Reveal>

      {/* Features Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 list-none m-0 p-0 mb-12">
        {FEATURES.map((f, i) => (
          <Reveal key={f.title} as="div" delay={i * 40} className="h-full">
            <div className="h-full rounded-2xl border border-[var(--card-border)] bg-[var(--panel-bg)]/45 px-5 py-5 flex flex-col scroll-mt-28">
              <h3 className="font-display text-lg font-bold uppercase tracking-tight text-[var(--text-main)]">
                {f.title}
              </h3>
              <p className="mt-2 text-sm font-semibold text-[var(--signal-bright)] leading-snug">
                {f.benefit}
              </p>
              <p className="mt-3 text-xs text-[var(--text-muted)] leading-relaxed">
                {f.body}
              </p>
            </div>
          </Reveal>
        ))}
      </div>

      {/* How it works steps */}
      <Reveal>
        <h3 className="font-display text-xl sm:text-2xl font-bold uppercase tracking-tight text-[var(--text-main)] mb-6 text-center">
          Como funciona em 4 passos
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STEPS.map((step) => (
            <div key={step.n} className="rounded-xl border border-[var(--card-border)] bg-[var(--bg-main)]/50 p-4">
              <span className="font-mono-data text-[11px] tracking-[0.18em] text-[var(--signal-bright)]">{step.n}</span>
              <h4 className="mt-1 font-display text-lg font-bold text-[var(--text-main)]">{step.title}</h4>
              <p className="mt-1 text-xs text-[var(--text-muted)] leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </Reveal>

      {/* Benefits list */}
      <Reveal delay={200}>
        <div className="mt-12 rounded-2xl border border-[var(--card-border)] bg-[var(--panel-bg)]/40 p-6 sm:p-8">
          <h3 className="font-display text-xl sm:text-2xl font-bold uppercase tracking-tight text-[var(--text-main)] mb-4">
            Benefícios para sua operação
          </h3>
          <ul className="space-y-3">
            {BENEFITS.map((b) => (
              <li key={b} className="flex items-start gap-3">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[var(--signal-bright)] shrink-0" />
                <span className="text-sm text-[var(--text-main)] leading-relaxed">{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </Reveal>
    </section>
  )
}
