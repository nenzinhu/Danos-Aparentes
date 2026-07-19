import React from 'react'
import type { BlogPost } from '@/src/content/blog'

// Capa do blog: gradiente + grelha "blueprint" + ilustração do veículo
// (ou foto editorial full-bleed em /blog/, ou emoji como fallback).
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
  const isPhotoCover = Boolean(cover.image?.startsWith('/blog/'))

  return (
    <div
      className={`relative overflow-hidden flex items-center justify-center ${className}`}
      style={{ background: cover.gradient }}
    >
      {!isPhotoCover && (
        <>
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
        </>
      )}

      {cover.image ? (
        <img
          src={cover.image}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          className={
            isPhotoCover
              ? 'absolute inset-0 h-full w-full object-cover'
              : 'relative max-h-[78%] w-auto object-contain drop-shadow-[0_12px_30px_rgba(0,0,0,0.45)]'
          }
        />
      ) : (
        <span className={`relative select-none drop-shadow-lg ${emojiClass}`} aria-hidden="true">
          {cover.emoji}
        </span>
      )}

      {/* Vinheta leve para badges legíveis sobre foto */}
      {isPhotoCover && (
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(180deg, rgba(0,0,0,.35) 0%, transparent 42%)' }}
        />
      )}

      {children}
    </div>
  )
}
