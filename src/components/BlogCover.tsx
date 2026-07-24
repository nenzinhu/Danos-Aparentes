import React from 'react'
import type { BlogPost } from '@/src/content/blog'

// Capa do blog: gradiente + grelha "blueprint" + ilustração do veículo
// (ou emoji como fallback). Amarra o visual do blog ao produto.
export function BlogCover({
  cover,
  className = '',
  emojiClass = 'text-6xl',
  children,
}: {
  cover: BlogPost['cover']
  className?: string
  emojiClass?: string
  children?: React.ReactNode
}) {
  return (
    <div
      className={`relative overflow-hidden flex items-center justify-center ${className}`}
      style={{ background: cover.gradient }}
    >
      {/* Grelha técnica subtil */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.16]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.6) 1px,transparent 1px)',
          backgroundSize: '22px 22px',
        }}
      />
      {/* Brilho inferior */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{ background: 'radial-gradient(circle at 50% 125%, rgba(255,255,255,.28), transparent 60%)' }}
      />

      {cover.image ? (
        <img
          src={cover.image}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          className="relative max-h-[78%] w-auto object-contain drop-shadow-[0_12px_30px_rgba(0,0,0,0.45)]"
        />
      ) : (
        <span className={`relative select-none drop-shadow-lg ${emojiClass}`} aria-hidden="true">
          {cover.emoji}
        </span>
      )}

      {children}
    </div>
  )
}
