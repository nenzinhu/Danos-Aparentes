'use client';
import React, { useState, useEffect, useRef } from 'react'
import { compressImage } from '../lib/imageUtils'

import { IconShieldCheck, IconGallery } from './ui/AnimatedIcons'

interface Props {
  isOpen: boolean
  onClose: () => void
  hasAccess: boolean
}

export default function CompanySettingsModal({ isOpen, onClose, hasAccess }: Props) {
  const [companyName, setCompanyName] = useState('')
  const [companyLogo, setCompanyLogo] = useState('')
  const [logoError, setLogoError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setCompanyName(localStorage.getItem('company_name') || '')
      setCompanyLogo(localStorage.getItem('company_logo') || '')
      setLogoError(null)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setLogoError('Por favor, envie um arquivo de imagem (PNG, JPG, SVG).')
      return
    }

    setLogoError(null)

    try {
      if (file.type === 'image/svg+xml') {
        // SVGs are tiny vector texts; skip canvas compression but enforce 1MB budget limit
        if (file.size > 1024 * 1024) {
          setLogoError('O logotipo deve ter menos de 1MB.')
          return
        }
        const reader = new FileReader()
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            setCompanyLogo(reader.result)
          }
        }
        reader.onerror = () => {
          setLogoError('Erro ao carregar imagem.')
        }
        reader.readAsDataURL(file)
      } else {
        // Compress PNG/JPG to maximum 500px width (optimal for PDFs and fits localStorage easily)
        const compressedBlob = await compressImage(file, 500, 0.8)
        const reader = new FileReader()
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            setCompanyLogo(reader.result)
          }
        }
        reader.onerror = () => {
          setLogoError('Erro ao carregar imagem.')
        }
        reader.readAsDataURL(compressedBlob)
      }
    } catch (err) {
      console.error('Erro ao otimizar imagem:', err)
      setLogoError('Erro ao otimizar ou carregar a imagem.')
    }
  }

  const handleRemoveLogo = () => {
    setCompanyLogo('')
    setLogoError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSave = () => {
    localStorage.setItem('company_name', companyName.trim())
    localStorage.setItem('company_logo', companyLogo)
    onClose()
  }

  return (
    <div 
      style={{ position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.72)', zIndex: 9999, padding: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Outfit, sans-serif' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ width: '100%', maxWidth: 500, background: 'rgba(15,23,42,0.97)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, overflow: 'hidden', color: '#f8fafc', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: 8 }}>
              <IconShieldCheck className="text-sky-400" size={20} /> Identidade da Empresa
            </div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 2 }}>Personalize os PDFs de Vistoria com a sua marca</div>
          </div>
          <button 
            onClick={onClose} 
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '1.2rem', cursor: 'pointer', outline: 'none' }}
          >
            ✖
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px 20px 24px' }}>
          {/* Locked features badge for non-subscribers */}
          {!hasAccess && (
            <div style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.2)', borderRadius: 12, padding: '14px 16px', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <span style={{ fontSize: '1.1rem', marginTop: -1 }}><IconShieldCheck className="text-amber-400" size={18} /></span>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#facc15', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Recurso Premium (Vistoria PRO)</div>
                  <p style={{ fontSize: '0.78rem', color: '#e2e8f0', marginTop: 4, lineHeight: 1.4 }}>
                    Você pode configurar sua marca localmente para testar, mas a aplicação do nome e do logotipo nos relatórios PDF gerados requer uma assinatura ativa. Entre em contato pelo suporte se precisar de ajuda.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                Nome da Empresa
              </label>
              <input 
                type="text" 
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                placeholder="Ex: AutoVistorias S.A."
                style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 14px', color: '#ffffff', fontFamily: 'Outfit, sans-serif', fontSize: '0.85rem', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                Logotipo da Empresa
              </label>
              
              {/* Upload area */}
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{ background: 'rgba(56,189,248,0.08)', border: '1px dashed rgba(56,189,248,0.3)', borderRadius: 10, padding: '16px 20px', color: '#38bdf8', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', flex: 1, textAlign: 'center', transition: 'all 0.2s', fontFamily: 'Outfit, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                >
                  <IconGallery size={18} /> Carregar Logo (JPG, PNG, SVG)
                </button>
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />

                {/* Preview Thumbnail */}
                {companyLogo ? (
                  <div style={{ position: 'relative', height: 44, padding: '0 10px', background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(0,220,255,0.4)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 10px rgba(0,220,255,0.2)', backdropFilter: 'blur(8px)', overflow: 'visible' }}>
                    <img 
                      src={companyLogo} 
                      alt="Logo Preview" 
                      style={{ maxHeight: 36, maxWidth: 120, objectFit: 'contain' }}
                    />
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      style={{ position: 'absolute', top: -6, right: -6, background: 'rgba(239,68,68,0.9)', border: 'none', color: '#ffffff', width: 18, height: 18, borderRadius: '50%', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0, boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
                      title="Remover logotipo"
                    >
                      ✖
                    </button>
                  </div>
                ) : (
                  /* SVG neon placeholder */
                  <div 
                    onClick={() => fileInputRef.current?.click()} 
                    title="Clique para carregar o logotipo"
                    style={{ cursor: 'pointer', transition: 'transform 0.2s', display: 'flex', alignItems: 'center' }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.02)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
                  >
                    <svg
                      width="158" height="44"
                      viewBox="0 0 158 44"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      style={{ display: 'block', overflow: 'visible' }}
                    >
                      <defs>
                        {/* Neon glow filter */}
                        <filter id="modal-neon-glow" x="-30%" y="-30%" width="160%" height="160%">
                          <feGaussianBlur stdDeviation="2.5" result="blur1" />
                          <feGaussianBlur stdDeviation="5"   result="blur2" />
                          <feMerge>
                            <feMergeNode in="blur2" />
                            <feMergeNode in="blur1" />
                            <feMergeNode in="SourceGraphic" />
                          </feMerge>
                        </filter>
                        <filter id="modal-neon-text" x="-10%" y="-40%" width="120%" height="180%">
                          <feGaussianBlur stdDeviation="2" result="blur" />
                          <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                          </feMerge>
                        </filter>
                        {/* Shimmer gradient */}
                        <linearGradient id="modal-shimmer-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%"   stopColor="#00dcff" stopOpacity="0" />
                          <stop offset="50%"  stopColor="#00dcff" stopOpacity="0.18" />
                          <stop offset="100%" stopColor="#00dcff" stopOpacity="0" />
                          <animateTransform
                            attributeName="gradientTransform"
                            type="translate"
                            from="-1 0" to="1 0"
                            dur="1.8s"
                            repeatCount="indefinite"
                          />
                        </linearGradient>
                      </defs>

                      {/* Background */}
                      <rect x="1" y="1" width="156" height="42" rx="9" fill="rgba(0,18,36,0.55)" />

                      {/* Shimmer sweep */}
                      <rect x="1" y="1" width="156" height="42" rx="9" fill="url(#modal-shimmer-grad)" />

                      {/* Neon dashed border — animated */}
                      <rect x="1" y="1" width="156" height="42" rx="9"
                        fill="none"
                        stroke="#00dcff"
                        strokeWidth="1.5"
                        strokeDasharray="6 4"
                        filter="url(#modal-neon-glow)"
                        opacity="0.9"
                      >
                        <animate
                          attributeName="stroke-dashoffset"
                          from="0" to="20"
                          dur="1.2s"
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="opacity"
                          values="0.7;1;0.7"
                          dur="2s"
                          repeatCount="indefinite"
                        />
                      </rect>

                      {/* Camera / building icon */}
                      <g transform="translate(14, 13)" filter="url(#modal-neon-glow)">
                        <rect x="0" y="5" width="14" height="13" rx="1" fill="none" stroke="#00dcff" strokeWidth="1.4" />
                        <rect x="2" y="0" width="10" height="6" rx="1" fill="none" stroke="#00dcff" strokeWidth="1.4" />
                        <rect x="3.5" y="8" width="3" height="3" rx="0.5" fill="#00dcff" opacity="0.7" />
                        <rect x="7.5" y="8" width="3" height="3" rx="0.5" fill="#00dcff" opacity="0.7" />
                      </g>

                      {/* Main text: LOGO */}
                      <text
                        x="37" y="17"
                        fontFamily="Outfit, sans-serif"
                        fontWeight="800"
                        fontSize="9.5"
                        fill="#00dcff"
                        letterSpacing="1.2"
                        filter="url(#modal-neon-text)"
                      >
                        LOGO
                      </text>

                      {/* Sub text */}
                      <text
                        x="37" y="30"
                        fontFamily="Outfit, sans-serif"
                        fontWeight="600"
                        fontSize="8.5"
                        fill="#38bdf8"
                        letterSpacing="0.3"
                        opacity="0.78"
                      >
                        clique para adicionar
                      </text>

                      {/* Plus icon on the right */}
                      <g transform="translate(136, 15)" filter="url(#modal-neon-glow)">
                        <circle cx="7" cy="7" r="6.5" fill="none" stroke="#00dcff" strokeWidth="1.2" opacity="0.8" />
                        <line x1="7" y1="3.5" x2="7" y2="10.5" stroke="#00dcff" strokeWidth="1.5" strokeLinecap="round" />
                        <line x1="3.5" y1="7" x2="10.5" y2="7" stroke="#00dcff" strokeWidth="1.5" strokeLinecap="round" />
                      </g>
                    </svg>
                  </div>
                )}
              </div>

              {logoError && (
                <p style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: 6, fontWeight: 500 }}>
                  ⚠️ {logoError}
                </p>
              )}
              <p style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 6 }}>
                Recomendado: imagem horizontal com fundo transparente ou branco. Tamanho máx: 1MB.
              </p>
            </div>
          </div>

          {/* Action Footer */}
          <div style={{ display: 'flex', gap: 10, marginTop: 28, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 16 }}>
            <button
              onClick={handleSave}
              style={{ background: '#2563eb', border: 'none', color: '#ffffff', fontWeight: 700, fontSize: '0.85rem', padding: '10px 20px', borderRadius: 10, cursor: 'pointer', flex: 1, fontFamily: 'Outfit, sans-serif', transition: 'all 0.2s' }}
            >
              Salvar Alterações
            </button>
            <button
              onClick={onClose}
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', fontWeight: 700, fontSize: '0.85rem', padding: '10px 16px', borderRadius: 10, cursor: 'pointer', fontFamily: 'Outfit, sans-serif', transition: 'all 0.2s' }}
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
