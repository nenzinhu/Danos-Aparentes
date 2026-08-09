import React from 'react'
import Image from 'next/image'
import type { BlogPost } from '@/src/content/blog'

// Capa do blog: foto realista full-bleed quando houver image;
// senão gradiente + grelha "blueprint" + emoji.
// Usa next/image (fill) para responsividade + formatos modernos (avif/webp)
// e dimensions explícitas (evita CLS).
export function BlogCover({
  cover,
  className = '',
  emojiClass = 'text-6xl',
  children,
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px',
}: {
  cover: BlogPost['cover']
  className?: string
  emojiClass?: string
  children?: React.ReactNode
  priority?: boolean
  sizes?: string
}) {
  const hasPhoto = Boolean(cover.image)
  const coverImage = cover.image

  return (
    <div
      className={`relative overflow-hidden flex items-center justify-center ${className}`}
      style={{ background: cover.gradient }}
    >
      {hasPhoto && coverImage ? (
        <>
          <Image
            src={coverImage}
            alt=""
            aria-hidden="true"
            fill
            priority={priority}
            loading={priority ? undefined : 'lazy'}
            decoding="async"
            sizes={sizes}
            className="object-cover"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(15,23,42,.18) 0%, rgba(15,23,42,.45) 100%)',
            }}
          />
        </>
      ) : (
        <>
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-[0.16]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.6) 1px,transparent 1px)',
              backgroundSize: '22px 22px',
            }}
          />
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(circle at 50% 125%, rgba(255,255,255,.28), transparent 60%)',
            }}
          />
          <span className={`relative select-none drop-shadow-lg ${emojiClass}`} aria-hidden="true">
            {cover.emoji}
          </span>
        </>
      )}

      {children}
    </div>
  )
}
