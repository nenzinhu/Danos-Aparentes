import type { Metadata } from 'next'
import Link from 'next/link'
import VerifiedSeal from '@/src/components/VerifiedSeal'

const TITLE = 'Selo Dossiê Verificável | Danos Aparentes'
const DESCRIPTION =
  'Incorpore o selo de Dossiê Verificável no site da sua empresa e mostre que seus laudos de vistoria são auditáveis por hash SHA-256 e QR Code.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/selo' },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: '/selo',
    type: 'website',
    images: ['/og-image.jpg'],
  },
}

const EMBED_SNIPPET = `<a href="https://danosaparentes.com.br/verify" target="_blank" rel="noopener noreferrer">
  <img src="https://danosaparentes.com.br/selo-dossie-verificavel.svg"
       alt="Dossiê Verificável — verificação pública Danos Aparentes"
       width="220" height="64" loading="lazy">
</a>`

const BENEFITS = [
  {
    title: 'Prova que se espalha',
    text: 'Cada visitante do seu site que clica no selo conhece o padrão de verificação — e associa sua marca à auditoria técnica.',
  },
  {
    title: 'Sem manutenção',
    text: 'O selo é uma imagem com link. Nada de script, cookie ou dependência: cola no HTML, CMS ou construtor de páginas.',
  },
  {
    title: 'Aponta para a verificação pública',
    text: 'O link abre a página /verify, onde qualquer pessoa confere um dossiê pelo código ou QR Code, sem cadastro.',
  },
]

export default function SeloPage() {
  return (
    <main id="main-content" tabIndex={-1} className="outline-none">
      <section className="max-w-4xl mx-auto px-4 sm:px-8 py-14 sm:py-20 flex flex-col items-center text-center gap-6">
        <p className="font-mono-data text-[11px] tracking-[0.2em] uppercase text-[var(--signal-bright)]">
          Programa de verificação pública
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-main)] [text-wrap:balance]">
          Selo Dossiê Verificável
        </h1>
        <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed max-w-2xl">
          Clientes que emitem laudos com o Danos Aparentes podem exibir o selo no próprio site,
          linkando para a verificação pública. Prova técnica que trabalha a favor da sua marca.
        </p>
        <div className="py-2">
          <VerifiedSeal />
        </div>
        <p className="text-xs text-[var(--text-muted)]">Assim ele aparece no seu site ↑ (passe o mouse)</p>
      </section>

      <section aria-label="Benefícios" className="border-y border-[var(--card-border)]/50 bg-[var(--panel-bg)]/70">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-12 grid gap-6 sm:grid-cols-3">
          {BENEFITS.map((b) => (
            <div
              key={b.title}
              className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg-solid)] p-5 flex flex-col gap-2 text-left"
            >
              <h2 className="font-display text-base font-bold text-[var(--text-main)]">{b.title}</h2>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">{b.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section aria-label="Como incorporar" className="max-w-3xl mx-auto px-4 sm:px-8 py-12 flex flex-col gap-5">
        <h2 className="font-display text-2xl font-bold tracking-tight text-[var(--text-main)]">
          Como incorporar
        </h2>
        <p className="text-sm text-[var(--text-muted)] leading-relaxed">
          Copie o trecho abaixo e cole no HTML do seu site — vale para WordPress, Webflow, Wix ou
          qualquer página que aceite HTML. Disponível para clientes dos planos Pro e Corporativo.
        </p>
        <pre className="rounded-2xl border border-[var(--card-border)] bg-slate-950 p-4 overflow-x-auto text-[11px] sm:text-xs leading-relaxed text-[var(--primary-hover)]"><code>{EMBED_SNIPPET}</code></pre>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            href="/planos"
            className="px-6 py-3 min-h-12 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-black shadow-xl shadow-[var(--primary)]/25 inline-flex items-center gap-2 transition-colors"
          >
            Ver planos que incluem o selo
          </Link>
          <Link
            href="/verify"
            className="px-6 py-3 min-h-12 rounded-xl border border-[var(--card-border)] text-sm font-bold text-[var(--text-main)] hover:bg-[var(--btn-secondary-hover)] transition-colors inline-flex items-center"
          >
            Ver a página de verificação
          </Link>
        </div>
      </section>
    </main>
  )
}
