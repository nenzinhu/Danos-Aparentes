'use client'

import Reveal from '../Reveal'
import { B2B_PRODUCT_LINE } from '@/src/lib/b2bPositioning'

const FEATURES = [
  {
    title: 'Fotos e vídeos',
    benefit: 'Registre visualmente o estado real do veículo — não dependa de memória ou palavra.',
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
          Transforme cada inspeção em uma evidência.
        </h2>
        <p className="mt-4 max-w-2xl text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
          {B2B_PRODUCT_LINE} Cada recurso existe para uma única razão: provar quando e onde um dano aconteceu.
        </p>
      </Reveal>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 list-none m-0 p-0">
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
    </section>
  )
}
