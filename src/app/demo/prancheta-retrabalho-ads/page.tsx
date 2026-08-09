import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Ads - Prancheta e Retrabalho | Danos Aparentes',
  description:
    'Preview com 5 variações de anúncios focados na dor de prancheta, redigitação e retrabalho na vistoria veicular.',
  alternates: { canonical: '/demo/prancheta-retrabalho-ads' },
  robots: { index: false, follow: false },
}

const ADS = [
  {
    angle: 'Produtividade',
    headline: 'Sua equipe ainda perde até 40 minutos por veículo com papel e redigitação?',
    body:
      'O vistoriador preenche na prancheta, tira fotos no celular e depois alguém precisa passar tudo para o computador. Digitalize a vistoria do pátio ao relatório final e ganhe produtividade de verdade.',
    cta: 'Ver demonstração',
    visual:
      'Prancheta molhada, papéis espalhados e relógio correndo de um lado. Do outro, celular com vistoria pronta e PDF concluído.',
  },
  {
    angle: 'Redução de erro',
    headline: 'Cada redigitação é uma nova chance de errar o laudo',
    body:
      'Quando a vistoria nasce no papel e termina no escritório, dados somem, fotos se perdem e o retrabalho cresce. Registre tudo uma vez só, no momento da vistoria, e elimine falhas de transcrição.',
    cta: 'Testar agora',
    visual:
      'Pessoa digitando dados com expressão de cansaço, campos duplicados na tela e ícones de erro. Em contraste, app preenchido no pátio em um único fluxo.',
  },
  {
    angle: 'Fim do papel',
    headline: 'Papel, celular pessoal e planilha: o combo que trava sua operação',
    body:
      'Enquanto sua equipe anota à mão, salva foto na galeria e redigita depois, a vistoria fica lenta e desorganizada. Centralize tudo em um processo digital simples, rápido e padronizado.',
    cta: 'Quero simplificar',
    visual:
      'Mesa com prancheta antiga, caneta, folhas carbonadas e notebook lotado de planilhas. Ao lado, celular com diagrama do veículo e envio de PDF.',
  },
  {
    angle: 'Padronização da equipe',
    headline: 'Se cada vistoriador registra de um jeito, o retrabalho vira rotina',
    body:
      'Sem um padrão único, cada laudo sai diferente e a equipe perde tempo corrigindo informação, organizando foto e preenchendo campo que faltou. Padronize o processo e vistore mais com menos esforço.',
    cta: 'Padronizar equipe',
    visual:
      'Três colaboradores com papéis e anotações diferentes de um lado. Do outro, todos usando o mesmo fluxo digital no celular.',
  },
  {
    angle: 'Mais vistorias por dia',
    headline: 'Menos tempo redigitando. Mais veículos vistoriados no mesmo dia.',
    body:
      'Cada 30 ou 40 minutos desperdiçados por veículo limita a capacidade da sua operação. Substitua papel e retrabalho por um laudo digital instantâneo e libere a equipe para vistoriar mais sem aumentar o quadro.',
    cta: 'Solicitar demo',
    visual:
      'Painel com fila de veículos aguardando vistoria, enquanto uma equipe pequena avança rápido com celular em mãos e laudos finalizados.',
  },
] as const

export default function PranchetaRetrabalhoAdsPage() {
  return (
    <main className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="mb-2 text-[0.72rem] font-extrabold uppercase tracking-[0.18em] text-[var(--signal-bright)]">
              Dor 2
            </p>
            <h1 className="font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl">
              Prancheta e Retrabalho
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">
              Preview com 5 anúncios prontos para a dor de papel, fotos dispersas e redigitação manual na
              vistoria veicular.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex items-center rounded-xl border border-[var(--card-border)] px-4 py-2 text-sm font-bold text-[var(--text-main)] transition-colors hover:border-[var(--sheet-line)] hover:text-[var(--signal-bright)]"
            >
              Ver site
            </Link>
            <Link
              href="/demo"
              className="inline-flex items-center rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-primary-hover"
            >
              Abrir demonstração
            </Link>
          </div>
        </div>

        <section className="mb-8 rounded-2xl border border-[var(--card-border)] bg-[linear-gradient(135deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-[var(--card-border)] bg-black/10 p-4">
              <p className="text-[0.7rem] font-extrabold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                Problema
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-main)]">
                O vistoriador preenche em papel, tira fotos no celular pessoal e depois ainda redigita tudo
                no escritório.
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--card-border)] bg-black/10 p-4">
              <p className="text-[0.7rem] font-extrabold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                Impacto
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-main)]">
                A operação perde de 30 a 40 minutos por veículo, aumenta o retrabalho e abre espaço para
                erro de transcrição.
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--card-border)] bg-black/10 p-4">
              <p className="text-[0.7rem] font-extrabold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                Estilo visual
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-main)]">
                Antes vs. depois, prancheta antiga, papéis bagunçados, pessoa cansada no computador e fluxo
                digital rápido no celular.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          {ADS.map((ad, index) => (
            <article
              key={ad.headline}
              className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6 shadow-[0_10px_40px_rgba(0,0,0,0.16)]"
            >
              <div className="mb-5 flex items-center justify-between gap-3">
                <span className="inline-flex rounded-full border border-[var(--sheet-line)] px-3 py-1 text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-[var(--signal-bright)]">
                  Anúncio {index + 1}
                </span>
                <span className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                  {ad.angle}
                </span>
              </div>

              <div className="space-y-5">
                <div>
                  <p className="mb-2 text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                    Headline
                  </p>
                  <h2 className="font-display text-2xl font-bold leading-tight text-[var(--text-main)]">
                    {ad.headline}
                  </h2>
                </div>

                <div>
                  <p className="mb-2 text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                    Texto principal
                  </p>
                  <p className="text-sm leading-relaxed text-[var(--text-muted)]">{ad.body}</p>
                </div>

                <div className="rounded-2xl border border-dashed border-[var(--card-border)] bg-black/10 p-4">
                  <p className="mb-2 text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                    Direção visual
                  </p>
                  <p className="text-sm leading-relaxed text-[var(--text-main)]">{ad.visual}</p>
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-[var(--card-border)] pt-4">
                  <div>
                    <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                      CTA
                    </p>
                    <p className="text-sm font-bold text-[var(--text-main)]">{ad.cta}</p>
                  </div>
                  <a
                    href="/demo"
                    className="inline-flex items-center rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-primary-hover"
                  >
                    {ad.cta}
                  </a>
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  )
}
