import LandingCtaLink from './LandingCtaLink'
import Reveal from './Reveal'

const SITE_URL = 'https://danosaparentes.com.br'
const SRC = '/videos/vistoria-digital-promo.mp4'
const POSTER = '/videos/vistoria-digital-promo-poster.webp'
const TITLE = 'PDF Antes × Depois: histórico digital do veículo'
const DESCRIPTION =
  'Sem vistoria de entrada comparável, a cobrança vira discussão. Marque no SVG, confirme a IA, gere o PDF de entrada e o de retorno — o histórico mostra o que mudou.'

/**
 * Seção abaixo do hero: vídeo promo 9:16 com poster + play (sem autoplay),
 * schema VideoObject e CTA. preload="metadata" evita baixar o MP4 no first paint.
 */
export default function LandingPromoVideo() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: TITLE,
    description: DESCRIPTION,
    thumbnailUrl: `${SITE_URL}${POSTER}`,
    contentUrl: `${SITE_URL}${SRC}`,
    duration: 'PT38S',
    uploadDate: '2026-08-04',
    inLanguage: 'pt-BR',
    publisher: {
      '@type': 'Organization',
      name: 'Danos Aparentes',
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    },
  }

  return (
    <section className="w-full max-w-6xl mx-auto py-16 px-6 z-10 relative border-t border-[var(--card-border)]/40 mt-4">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-14 items-center">
        <Reveal className="text-left flex flex-col items-start">
          <div className="inline-flex items-center gap-2 font-mono-data text-[11px] tracking-[0.2em] text-[var(--signal-bright)] uppercase mb-4">
            <span aria-hidden="true" className="w-4 h-px bg-[var(--sheet-line)]" />
            Como funciona em 60s
            <span aria-hidden="true" className="w-4 h-px bg-[var(--sheet-line)]" />
          </div>
          <h2 className="font-display text-4xl lg:text-5xl font-bold uppercase tracking-tight leading-[0.95] text-[var(--text-main)]">
            O PDF mostra o que{' '}
            <span className="text-[var(--signal-bright)]">mudou</span>
          </h2>
          <p className="text-sm text-[var(--text-muted)] mt-4 max-w-md leading-relaxed">
            Entrada sem avarias. Retorno com evidência. Histórico digital, IA sugestiva e laudo verificável —
            do diagrama SVG ao PDF Antes × Depois.
          </p>
          <LandingCtaLink
            id="home-promo-video-cta"
            eventSource="home"
            className="mt-7 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-bold shadow-xl shadow-[var(--primary)]/15 focus-visible:ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-[var(--bg-main)] outline-none"
          >
            Criar histórico
          </LandingCtaLink>
        </Reveal>

        <Reveal delay={80} className="flex flex-col items-center lg:items-end">
          <div className="w-full max-w-[280px] overflow-hidden rounded-2xl border border-[var(--card-border)] bg-black shadow-xl">
            <video
              src={SRC}
              poster={POSTER}
              controls
              playsInline
              preload="metadata"
              aria-label={TITLE}
              className="w-full h-auto aspect-[9/16]"
            />
          </div>
          <p className="mt-3 text-center lg:text-right text-xs text-[var(--text-muted)] max-w-[280px]">
            38 segundos · PDF Antes × Depois · play quando quiser
          </p>
        </Reveal>
      </div>
    </section>
  )
}
