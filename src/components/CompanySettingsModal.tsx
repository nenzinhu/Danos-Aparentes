'use client';
import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { compressImage } from '../lib/imageUtils'
import { db } from '../lib/db'
import ConfirmModal from './ConfirmModal'

import { IconShieldCheck, IconGallery } from './ui/AnimatedIcons'

interface Props {
  isOpen: boolean
  onClose: () => void
  hasAccess: boolean
}

export default function CompanySettingsModal({ isOpen, onClose, hasAccess }: Props) {
  const [companyName, setCompanyName] = useState('')
  const [companyLogo, setCompanyLogo] = useState('')
  const [companyColor, setCompanyColor] = useState('#2563eb')
  const [logoPosition, setLogoPosition] = useState<'left' | 'center' | 'right'>('left')
  const [logoHeight, setLogoHeight] = useState<number>(42)
  const [layoutMode, setLayoutMode] = useState<'auto' | 'single-page' | 'multi-page'>('multi-page')
  const [showInfoTable, setShowInfoTable] = useState<boolean>(true)
  const [showSummaryStats, setShowSummaryStats] = useState<boolean>(true)
  const [showDamageTable, setShowDamageTable] = useState<boolean>(true)
  const [showPhotoGallery, setShowPhotoGallery] = useState<boolean>(true)
  const [showSignatures, setShowSignatures] = useState<boolean>(true)
  const [customFooterText, setCustomFooterText] = useState<string>('')
  const [logoError, setLogoError] = useState<string | null>(null)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isOpen) return
    // Adia um tick para não chamar setState sincronamente dentro do effect.
    const t = setTimeout(() => {
      setCompanyName(localStorage.getItem('company_name') || '')
      setCompanyLogo(localStorage.getItem('company_logo') || '')
      setCompanyColor(localStorage.getItem('company_color') || '#2563eb')
      setLogoPosition((localStorage.getItem('company_logo_position') as 'left' | 'center' | 'right') || 'left')
      setLogoHeight(Number(localStorage.getItem('company_logo_height')) || 42)
      setLayoutMode((localStorage.getItem('company_layout_mode') as 'auto' | 'single-page' | 'multi-page') || 'multi-page')
      setShowInfoTable(localStorage.getItem('company_show_info_table') !== 'false')
      setShowSummaryStats(localStorage.getItem('company_show_summary_stats') !== 'false')
      setShowDamageTable(localStorage.getItem('company_show_damage_table') !== 'false')
      setShowPhotoGallery(localStorage.getItem('company_show_photo_gallery') !== 'false')
      setShowSignatures(localStorage.getItem('company_show_signatures') !== 'false')
      setCustomFooterText(localStorage.getItem('company_custom_footer_text') || '')
      setLogoError(null)
    }, 0)
    return () => clearTimeout(t)
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

  const handleClearData = async () => {
    try {
      await db.clearAllLocalData()
      setShowClearConfirm(false)
      onClose()
      // Recarrega para garantir que todo o estado (sync status, listas em
      // memória, cache de fotos) reflita o armazenamento local vazio.
      // "Limpar Dados Locais" é irreversível por design.
      window.location.reload()
    } catch (err) {
      console.error('Erro ao limpar dados locais:', err)
      setShowClearConfirm(false)
      onClose()
    }
  }

  const handleSave = () => {
    localStorage.setItem('company_name', companyName.trim())
    localStorage.setItem('company_logo', companyLogo)
    localStorage.setItem('company_color', companyColor.trim())
    localStorage.setItem('company_logo_position', logoPosition)
    localStorage.setItem('company_logo_height', String(logoHeight))
    localStorage.setItem('company_layout_mode', layoutMode)
    localStorage.setItem('company_show_info_table', String(showInfoTable))
    localStorage.setItem('company_show_summary_stats', String(showSummaryStats))
    localStorage.setItem('company_show_damage_table', String(showDamageTable))
    localStorage.setItem('company_show_photo_gallery', String(showPhotoGallery))
    localStorage.setItem('company_show_signatures', String(showSignatures))
    localStorage.setItem('company_custom_footer_text', customFooterText.trim())
    onClose()
  }

  return (
    <>
      <div 
        style={{ position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.72)', zIndex: 9999, padding: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Outfit, sans-serif' }}
        onClick={e => { if (e.target === e.currentTarget) onClose() }}
      >
      <div style={{ width: '100%', maxWidth: 500, background: 'rgba(15,23,42,0.97)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, overflow: 'hidden', color: '#f8fafc', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: 8 }}>
              <IconShieldCheck className="text-[var(--primary)]" size={20} /> Identidade da Empresa
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
                <span style={{ fontSize: '1.1rem', marginTop: -1 }}><IconShieldCheck className="text-[var(--signal)]" size={18} /></span>
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
                    <Image 
                      src={companyLogo} 
                      alt="Logo Preview" 
                      width={120}
                      height={36}
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

            {/* Cor Primária da Marca / PDF */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                Cor Primária da Marca / PDF
              </label>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
                <input
                  type="color"
                  value={companyColor}
                  onChange={e => setCompanyColor(e.target.value)}
                  style={{ width: 42, height: 42, padding: 2, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, cursor: 'pointer' }}
                />
                <input
                  type="text"
                  value={companyColor}
                  onChange={e => setCompanyColor(e.target.value)}
                  placeholder="#2563eb"
                  style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 14px', color: '#ffffff', fontFamily: 'monospace', fontSize: '0.85rem', outline: 'none' }}
                />
                <button
                  type="button"
                  onClick={() => setCompanyColor('#2563eb')}
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px', color: '#94a3b8', fontSize: '0.72rem', cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}
                >
                  Restaurar
                </button>
              </div>

              {/* Quick Presets */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {[
                  { name: 'Azul Royal', color: '#2563eb' },
                  { name: 'Esmeralda', color: '#0f766e' },
                  { name: 'Terracota', color: '#d97757' },
                  { name: 'Roxo', color: '#7c3aed' },
                  { name: 'Âmbar', color: '#b45309' },
                  { name: 'Grafite', color: '#18181b' },
                ].map(p => (
                  <button
                    key={p.color}
                    type="button"
                    onClick={() => setCompanyColor(p.color)}
                    style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.05)', border: companyColor.toLowerCase() === p.color.toLowerCase() ? '1.5px solid #38bdf8' : '1px solid rgba(255,255,255,0.08)', borderRadius: 6, padding: '4px 8px', fontSize: '0.7rem', color: '#e2e8f0', cursor: 'pointer' }}
                  >
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: p.color, display: 'inline-block' }} />
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Posicionamento do Logotipo */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                Alinhamento do Logotipo
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {[
                  { pos: 'left' as const, label: '⬅️ Esquerda' },
                  { pos: 'center' as const, label: '↔️ Centro' },
                  { pos: 'right' as const, label: '➡️ Direita' },
                ].map(item => (
                  <button
                    key={item.pos}
                    type="button"
                    onClick={() => setLogoPosition(item.pos)}
                    style={{ background: logoPosition === item.pos ? 'rgba(56,189,248,0.15)' : 'rgba(255,255,255,0.04)', border: logoPosition === item.pos ? '1.5px solid #38bdf8' : '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '8px 10px', color: logoPosition === item.pos ? '#38bdf8' : '#94a3b8', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit, sans-serif', transition: 'all 0.2s' }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Modo de Layout do PDF */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                Modo de Densidade do PDF
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {[
                  { mode: 'auto' as const, label: '⚡ Automático' },
                  { mode: 'single-page' as const, label: '📄 1 Página' },
                  { mode: 'multi-page' as const, label: '📑 2 Páginas' },
                ].map(item => (
                  <button
                    key={item.mode}
                    type="button"
                    onClick={() => setLayoutMode(item.mode)}
                    style={{ background: layoutMode === item.mode ? 'rgba(56,189,248,0.15)' : 'rgba(255,255,255,0.04)', border: layoutMode === item.mode ? '1.5px solid #38bdf8' : '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '8px 10px', color: layoutMode === item.mode ? '#38bdf8' : '#94a3b8', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit, sans-serif', transition: 'all 0.2s' }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Texto de Rodapé Personalizado */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                Texto Jurídico / Contato no Rodapé
              </label>
              <input
                type="text"
                value={customFooterText}
                onChange={e => setCustomFooterText(e.target.value)}
                placeholder="Ex: Documento para fins de vistoria cautelar e seguro."
                style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 14px', color: '#ffffff', fontFamily: 'Outfit, sans-serif', fontSize: '0.85rem', outline: 'none' }}
              />
            </div>

            {/* Live Preview Banner */}
            <div style={{ background: '#090d16', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: 12, overflow: 'hidden' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                Pré-visualização do Cabeçalho
              </div>
              <div style={{ textAlign: logoPosition, marginBottom: 6 }}>
                {companyLogo ? (
                  <Image src={companyLogo} alt="Preview Logo" width={140} height={logoHeight} style={{ maxHeight: logoHeight, maxWidth: 140, objectFit: 'contain', display: 'inline-block' }} />
                ) : (
                  <p style={{ fontSize: '0.82rem', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', margin: 0 }}>
                    {companyName || 'NOME DA SUA EMPRESA'}
                  </p>
                )}
              </div>
              <div style={{ height: 3, width: 40, background: companyColor, borderRadius: 2, margin: logoPosition === 'center' ? '0 auto 6px auto' : logoPosition === 'right' ? '0 0 6px auto' : '0 0 6px 0' }} />
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ffffff' }}>RELATÓRIO DE VISTORIA VEICULAR</div>
            </div>
          </div>

          {/* Dados Locais (offline-first) */}
          <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#fca5a5', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
              Zona de Perigo — Dados Locais
            </div>
            <p style={{ fontSize: '0.75rem', color: '#e2e8f0', lineHeight: 1.45, margin: '0 0 12px' }}>
              Apaga todos os laudos, avarias e fotos armazenados <strong>neste dispositivo</strong>. Não afeta os dados na nuvem (Supabase). Esta ação é irreversível.
            </p>
            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              style={{
                width: '100%',
                background: 'rgba(239,68,68,0.12)',
                border: '1px solid rgba(239,68,68,0.4)',
                color: '#fca5a5',
                fontWeight: 700,
                fontSize: '0.8rem',
                padding: '10px 14px',
                borderRadius: 10,
                cursor: 'pointer',
                fontFamily: 'Outfit, sans-serif',
                transition: 'all 0.2s',
              }}
            >
              🗑️ Limpar Dados Locais
            </button>
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
      <ConfirmClearData
        isOpen={showClearConfirm}
        onConfirm={handleClearData}
        onCancel={() => setShowClearConfirm(false)}
      />
    </>
  )
}

function ConfirmClearData({
  isOpen,
  onConfirm,
  onCancel,
}: {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <ConfirmModal
      isOpen={isOpen}
      title="Limpar todos os dados locais?"
      message="Isso apaga permanentemente os laudos, avarias e fotos deste dispositivo. Os dados na nuvem (Supabase) não serão afetados. Esta ação não pode ser desfeita."
      confirmLabel="Sim, limpar tudo"
      cancelLabel="Não"
      tone="danger"
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  )
}
