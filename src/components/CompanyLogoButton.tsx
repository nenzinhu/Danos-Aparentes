'use client';
import { useState, useEffect } from 'react'
import Image from 'next/image'

/**
 * Botão compacto do logo da empresa (movido do Header para a barra de abas).
 * Lê company_logo/company_name do localStorage e mantém sincronizado.
 */
export default function CompanyLogoButton({ onClick, className = '' }: { onClick: () => void; className?: string }) {
  const [companyLogo, setCompanyLogo] = useState('')
  const [companyName, setCompanyName] = useState('')

  useEffect(() => {
    const sync = () => {
      setCompanyLogo(localStorage.getItem('company_logo') || '')
      setCompanyName(localStorage.getItem('company_name') || '')
    }
    sync()
    window.addEventListener('storage', sync)
    const interval = setInterval(sync, 800)
    return () => {
      window.removeEventListener('storage', sync)
      clearInterval(interval)
    }
  }, [])

  return (
    <button
      onClick={onClick}
      title="Clique para adicionar o logo da sua empresa nos relatórios"
      className={`flex items-center justify-center cursor-pointer rounded-lg px-3 ${className}`}
      style={{ background: 'none', border: 'none' }}
    >
      {companyLogo ? (
        <div style={{
          height: 28,
          padding: '0 6px',
          background: 'rgba(0,0,0,0.35)',
          border: '1px solid rgba(0,220,255,0.4)',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 10px rgba(0,220,255,0.2)',
        }}>
          <Image
            src={companyLogo}
            alt={companyName || 'Logo da empresa'}
            width={90}
            height={18}
            style={{ maxHeight: 18, maxWidth: 90, objectFit: 'contain' }}
          />
        </div>
      ) : (
        /* SVG neon placeholder — versão menor (76x26) */
        <svg
          width="76" height="26"
          viewBox="0 0 104 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ display: 'block', overflow: 'visible' }}
        >
          <defs>
            <filter id="tl-neon-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="2" result="blur1" />
              <feGaussianBlur stdDeviation="4" result="blur2" />
              <feMerge>
                <feMergeNode in="blur2" />
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="tl-neon-text" x="-10%" y="-40%" width="120%" height="180%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="tl-shimmer-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00dcff" stopOpacity="0" />
              <stop offset="50%" stopColor="#00dcff" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#00dcff" stopOpacity="0" />
              <animateTransform attributeName="gradientTransform" type="translate" from="-1 0" to="1 0" dur="1.8s" repeatCount="indefinite" />
            </linearGradient>
          </defs>

          {/* Background */}
          <rect x="1" y="1" width="102" height="34" rx="8" fill="rgba(0,18,36,0.55)" />

          {/* Shimmer sweep */}
          <rect x="1" y="1" width="102" height="34" rx="8" fill="url(#tl-shimmer-grad)" />

          {/* Neon dashed border — animated */}
          <rect x="1" y="1" width="102" height="34" rx="8" fill="none" stroke="#00dcff" strokeWidth="1.5" strokeDasharray="5 3" filter="url(#tl-neon-glow)" opacity="0.9">
            <animate attributeName="stroke-dashoffset" from="0" to="16" dur="1.2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite" />
          </rect>

          {/* Clicking Finger Icon */}
          <g transform="translate(10, 7)" stroke="#00dcff" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" filter="url(#tl-neon-glow)">
            <path d="M8 12.5v-6.5a1.5 1.5 0 0 1 3 0v4.5M11 10.5a1.5 1.5 0 0 1 3 0v1.5M14 12a1.5 1.5 0 0 1 3 0v1M17 13a1.5 1.5 0 0 1 3 0v2.5a4.5 4.5 0 0 1-4.5 4.5h-3a4.5 4.5 0 0 1-4.5-4.5v-3.5a1.5 1.5 0 0 1 3 0v1.5" />
            <circle cx="9.5" cy="1.5" r="1" fill="#00dcff" stroke="none" />
            <path d="M6 3.5a5 5 0 0 1 7 0" opacity="0.7" />
          </g>

          {/* Main text: LOGO */}
          <text x="38" y="21" fontFamily="Outfit, sans-serif" fontWeight="900" fontSize="11.5" fill="#00dcff" letterSpacing="2" filter="url(#tl-neon-text)">
            LOGO
          </text>
        </svg>
      )}
    </button>
  )
}
