'use client'

import Reveal from '../Reveal'

const DEFINITIONS = [
  {
    term: 'Inteligência Histórica Veicular',
    definition: 'É o registro contínuo e comparável do estado de um veículo ao longo do tempo, transformando inspeções isoladas em evidências organizadas.',
  },
  {
    term: 'Inspeção veicular',
    definition: 'É o processo de documentar o estado de um veículo em um momento específico, com fotos, localização, data/hora e assinatura.',
  },
  {
    term: 'Dossiê técnico',
    definition: 'É o documento em PDF gerado a partir de uma inspeção, contendo fotos, diagrama de avarias, GPS, assinatura e hash de integridade.',
  },
  {
    term: 'Hash SHA-256',
    definition: 'É um código digital único que garante que um documento não foi alterado após sua geração, assegurando a autenticidade do registro.',
  },
  {
    term: 'QR Code de verificação',
    definition: 'É um código que qualquer pessoa pode escanear para verificar publicamente a autenticidade de um dossiê técnico emitido.',
  },
  {
    term: 'Comparação Antes × Depois',
    definition: 'É a análise lado a lado de duas inspeções do mesmo veículo, identificando automaticamente o que mudou entre elas.',
  },
]

export default function DefinitionsSection() {
  return (
    <section
      aria-label="Conceitos"
      className="w-full z-10 relative border-t border-[var(--card-border)]/40 bg-[var(--panel-bg)]/50"
    >
      <div className="max-w-6xl mx-auto py-16 sm:py-20 px-6">
        <Reveal className="text-center mb-10">
          <span className="font-mono-data text-[11px] tracking-[0.2em] text-[var(--signal-bright)] uppercase">
            Conceitos
          </span>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold uppercase tracking-tight leading-[0.95] text-[var(--text-main)]">
            O que é cada coisa
          </h2>
          <p className="mt-3 text-sm text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed">
            Definições diretas para você entender cada termo usado na plataforma.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {DEFINITIONS.map((item, i) => (
            <Reveal key={item.term} delay={i * 80}>
              <div className="h-full rounded-2xl border border-[var(--card-border)] bg-[var(--bg-main)]/70 p-5">
                <h3 className="font-display text-lg font-bold text-[var(--text-main)] leading-snug">
                  {item.term}
                </h3>
                <p className="mt-2 text-sm text-[var(--text-muted)] leading-relaxed">
                  {item.definition}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
