'use client'

import Reveal from '../Reveal'

const ITEMS = [
  { label: 'Hash SHA-256', desc: 'Impede alteração silenciosa do registro.' },
  { label: 'QR Code', desc: 'Qualquer pessoa verifica a autenticidade do laudo.' },
  { label: 'Data e hora', desc: 'Momento exato em que o estado foi registrado.' },
  { label: 'GPS', desc: 'Onde a inspeção aconteceu.' },
  { label: 'Fotografias', desc: 'Prova visual vinculada à peça e ao dano.' },
  { label: 'Assinatura', desc: 'Quem registrou e quem confirmou.' },
  { label: 'Histórico', desc: 'Todas as versões do documento, em ordem.' },
]

export default function IntegritySection() {
  return (
    <section
      id="integridade"
      className="w-full max-w-6xl mx-auto py-20 px-6 z-10 relative border-t border-[var(--card-border)]/40"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <Reveal>
          <div className="inline-flex items-center gap-2 font-mono-data text-[11px] tracking-[0.2em] text-[var(--signal-bright)] uppercase mb-4">
            <span aria-hidden="true" className="w-4 h-px bg-[var(--sheet-line)]" />
            Segurança e integridade
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-tight leading-[0.95] text-[var(--text-main)] [text-wrap:balance]">
            Seu laudo não é apenas um PDF.
          </h2>
          <p className="mt-4 text-lg font-semibold text-[var(--signal-bright)] leading-snug">
            É um registro verificável.
          </p>
          <p className="mt-3 text-sm sm:text-base text-[var(--text-muted)] leading-relaxed max-w-lg">
            Cada documento carrega mecanismos que provam sua origem e sua integridade — sem linguagem técnica,
            sem dependência de “confia em mim”.
          </p>
        </Reveal>

        <Reveal delay={100}>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 list-none m-0 p-0">
            {ITEMS.map((it) => (
              <li
                key={it.label}
                className="rounded-xl border border-[var(--card-border)] bg-[var(--panel-bg)]/60 px-5 py-3.5"
              >
                <p className="text-sm font-bold text-[var(--text-main)]">{it.label}</p>
                <p className="mt-1 text-xs text-[var(--text-muted)] leading-relaxed">{it.desc}</p>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  )
}
