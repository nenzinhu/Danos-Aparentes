import React from 'react'
import type { BlogPost } from '@/src/content/blog'

// Capa do blog: foto realista full-bleed quando houver image;
// senão gradiente + grelha "blueprint" + emoji.
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
  const hasPhoto = Boolean(cover.image)

  return (
    <div
      className={`relative overflow-hidden flex items-center justify-center ${className}`}
      style={{ background: cover.gradient }}
    >
      {hasPhoto ? (
        <>
          <img
            src={cover.image}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
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
