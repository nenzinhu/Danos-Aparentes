import React from 'react'

const SITE_URL = 'https://danosaparentes.com.br'

interface BlogVideoProps {
  /** Caminho do MP4 relativo a public/, ex: /videos/vistoria-digital-promo.mp4 */
  src: string
  /** Caminho do poster relativo a public/ */
  poster: string
  /** Título do vídeo — vai para o schema VideoObject e o aria-label */
  title: string
  /** Descrição curta para o schema VideoObject */
  description: string
  /** Duração ISO 8601, ex: "PT58S" */
  duration: string
  /** Data de publicação ISO (YYYY-MM-DD) */
  uploadDate: string
  /** Legenda visível abaixo do player (opcional) */
  caption?: string
}

/**
 * Player de vídeo para posts do blog: <video> nativo com preload="metadata"
 * (não baixa o MP4 inteiro no load da página) + schema VideoObject para
 * rich results de vídeo no Google.
 */
export function BlogVideo({ src, poster, title, description, duration, uploadDate, caption }: BlogVideoProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: title,
    description,
    thumbnailUrl: `${SITE_URL}${poster}`,
    contentUrl: `${SITE_URL}${src}`,
    duration,
    uploadDate,
    inLanguage: 'pt-BR',
    publisher: {
      '@type': 'Organization',
      name: 'Danos Aparentes',
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    },
  }

  return (
    <figure className="not-prose my-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-xs overflow-hidden rounded-2xl border border-[var(--card-border)] bg-black shadow-xl">
        <video
          src={src}
          poster={poster}
          controls
          playsInline
          preload="metadata"
          aria-label={title}
          className="w-full h-auto aspect-[9/16]"
        />
      </div>
      {caption && (
        <figcaption className="mt-3 text-center text-xs text-[var(--text-muted)]">{caption}</figcaption>
      )}
    </figure>
  )
}
