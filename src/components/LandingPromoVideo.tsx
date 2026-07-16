import LandingCtaLink from './LandingCtaLink'
import Reveal from './Reveal'

const SITE_URL = 'https://danosaparentes.com.br'
const SRC = '/videos/vistoria-digital-promo.mp4'
const POSTER = '/videos/vistoria-digital-promo-poster.jpg'
const TITLE = 'Antes e depois da vistoria digital em 60 segundos'
const DESCRIPTION =
  'De 20 minutos de burocracia com papel e prancheta para 3 toques na tela: laudo 100% digital, assinado na tela, com GPS, hora exata, hash SHA-256 e QR Code — funcionando até offline.'

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
    duration: 'PT58S',
    uploadDate: '2026-07-12',
    inLanguage: 'pt-BR',
    publisher: {
      '@type': 'Organization',
      name: 'Danos Aparentes',
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    },
  }

  return (
    <section className="w-full max-w-6xl mx-auto py-12 sm:py-16 px-4 sm:px-6 z-10 relative border-t border-[var(--card-border)]/40 mt-4">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.1fr_0.9fr] gap-8 md:gap-10 lg:gap-14 items-center">
        <Reveal className="text-left flex flex-col items-start order-2 md:order-1">
          <div className="inline-flex items-center gap-2 font-mono-data text-[11px] tracking-[0.2em] text-[var(--signal-bright)] uppercase mb-4">
            <span aria-hidden="true" className="w-4 h-px bg-[var(--sheet-line)]" />
            Como funciona em 60s
            <span aria-hidden="true" className="w-4 h-px bg-[var(--sheet-line)]" />
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-tight leading-[0.95] text-[var(--text-main)] [text-wrap:balance]">
            Do papel ao laudo{' '}
            <span className="text-[var(--signal-bright)]">em poucos toques</span>
          </h2>
          <p className="text-sm text-[var(--text-muted)] mt-4 max-w-md leading-relaxed">
            Veja a diferença: prancheta e redigitação de um lado; marcação no diagrama, assinatura na
            tela e PDF com hash e QR Code do outro — inclusive offline.
          </p>
          <LandingCtaLink className="mt-7 w-full sm:w-auto justify-center inline-flex items-center gap-2 px-5 py-3 sm:py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-bold shadow-xl shadow-[var(--primary)]/15 transition-[transform,background-color] motion-safe:hover:-translate-y-0.5 focus-visible:ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-[var(--bg-main)] outline-none touch-manipulation">
            Testar 7 dias grátis
          </LandingCtaLink>
        </Reveal>

        <Reveal delay={80} className="flex flex-col items-center md:items-end order-1 md:order-2">
          <div className="w-full max-w-[240px] sm:max-w-[280px] md:max-w-[300px] overflow-hidden rounded-2xl border border-[var(--card-border)] bg-black shadow-xl">
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
          <p className="mt-3 text-center md:text-right text-xs text-[var(--text-muted)] max-w-[280px]">
            58 segundos · play quando quiser
          </p>
        </Reveal>
      </div>
    </section>
  )
}
