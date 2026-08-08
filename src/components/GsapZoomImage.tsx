'use client'
import Image from 'next/image'

interface Props {
  src: string
  alt: string
  className?: string
}

/**
 * Imagem estática (sem zoom/GSAP) para a seção de IA.
 * Mantém a imagem original em alta resolução (webp lossless) — o Next
 * otimiza com quality=92 (máximo permitido em next.config).
 */
export default function GsapZoomImage({ src, alt, className }: Props) {
  return (
    <div className={`relative overflow-hidden ${className ?? ''}`}>
      <div className="absolute inset-0">
        <Image
          src={src}
          alt={alt}
          fill
          quality={92}
          className="object-contain object-top"
          sizes="(max-width: 1024px) 100vw, 640px"
          priority={false}
        />
      </div>
    </div>
  )
}
