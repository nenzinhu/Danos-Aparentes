'use client';
import { useState, createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { Damage, VehicleInfo, VehicleType, ViewType } from '../types'
import { generatePdf, generatePdfBlob, SvgPdfData } from '../lib/pdf'
import { copyReport, downloadTxt, sendWhatsApp } from '../lib/report'
import { resolveDamagePhotos } from '../lib/photoStore'
import { staticVehicleRegistry } from './vehicles/staticRegistry'
import VehicleDefs from './vehicles/VehicleDefs'

interface Props {
  vehicleType: VehicleType
  vehicleInfo: VehicleInfo
  damages: Damage[]
  onToast?: (msg: string) => void
  hasAccess?: boolean
}

const ALL_VIEWS: ViewType[] = ['lateral-left', 'lateral-right', 'frontal', 'traseira']

export async function captureSvgs(vehicleType: VehicleType, damages: Damage[]): Promise<SvgPdfData> {
  try {
    const defsHtml = renderToStaticMarkup(createElement(VehicleDefs))
    const startIdx = defsHtml.indexOf('<defs>')
    const endIdx = defsHtml.lastIndexOf('</defs>') + '</defs>'.length
    const defsInner = startIdx >= 0 ? defsHtml.slice(startIdx, endIdx) : ''

    const svgCaptures: Record<string, string> = {}
    const vehicleDamages = damages.filter(d => d.vehicle === vehicleType)

    for (const view of ALL_VIEWS) {
      const viewDamages = vehicleDamages.filter(d => d.view === view)
      const Comp = staticVehicleRegistry[vehicleType]?.[view]
      if (!Comp) continue

      const rawSvg = renderToStaticMarkup(
        createElement(Comp, {
          damages: viewDamages,
          selectedPartId: null,
          onPartClick: () => {},
          onPartHover: () => {},
        }),
      )
      svgCaptures[view] = rawSvg.replace(/(<svg[^>]*>)/, `$1${defsInner}`)
    }

    return { svgCaptures }
  } catch (e) {
    console.error('captureSvgs failed:', e)
    return { svgCaptures: {} }
  }
}

// ── SVG Icons ────────────────────────────────────────────────────────────────

function IconWhatsApp() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path fill="currentColor" d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.739-1.456L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.963C16.588 2.019 14.12 1.01 11.994 1.01c-5.442 0-9.866 4.372-9.87 9.802 0 1.714.47 3.387 1.357 4.847l-.994 3.63 3.77-.986zm11.587-7.85c-.328-.162-1.936-.945-2.235-1.054-.3-.109-.517-.162-.734.162-.218.324-.843 1.054-1.033 1.27-.19.218-.38.243-.708.082-.328-.162-1.383-.504-2.635-1.61-1.002-.885-1.678-1.977-1.875-2.3-.197-.324-.021-.5-.185-.662-.148-.145-.328-.379-.492-.567-.164-.188-.219-.324-.328-.541-.109-.217-.055-.405-.027-.567.027-.162.218-.541.328-.811.109-.27.218-.459.328-.675.109-.217.055-.405.027-.567-.027-.162-.218-.541-.328-.811-.109-.27-.218-.459-.328-.675a.47.47 0 0 0-.492-.27c-.218 0-.437 0-.656.162-.218.162-.843.811-.843 1.946s.843 2.271.975 2.434c.136.162 1.683 2.541 4.072 3.565.568.243 1.012.387 1.357.5.571.18 1.091.155 1.502.094.458-.068 1.936-.789 2.208-1.554.273-.765.273-1.419.191-1.554-.081-.135-.3-.216-.628-.378z"/>
    </svg>
  )
}

function IconWhatsAppFull() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 241.19" width="20" height="20" style={{ flexShrink: 0 }}>
      <path fill="#25d366" fillRule="evenodd" d="M205,35.05A118.61,118.61,0,0,0,120.46,0C54.6,0,1,53.61,1,119.51a119.5,119.5,0,0,0,16,59.74L0,241.19l63.36-16.63a119.43,119.43,0,0,0,57.08,14.57h0A119.54,119.54,0,0,0,205,35.07v0ZM120.5,219A99.18,99.18,0,0,1,69.91,205.1l-3.64-2.17-37.6,9.85,10-36.65-2.35-3.76A99.37,99.37,0,0,1,190.79,49.27,99.43,99.43,0,0,1,120.49,219ZM175,144.54c-3-1.51-17.67-8.71-20.39-9.71s-4.72-1.51-6.75,1.51-7.72,9.71-9.46,11.72-3.49,2.27-6.45.76-12.63-4.66-24-14.84A91.1,91.1,0,0,1,91.25,113.3c-1.75-3-.19-4.61,1.33-6.07s3-3.48,4.47-5.23a19.65,19.65,0,0,0,3-5,5.51,5.51,0,0,0-.24-5.23C99,90.27,93,75.57,90.6,69.58s-4.89-5-6.73-5.14-3.73-.09-5.7-.09a11,11,0,0,0-8,3.73C67.48,71.05,59.75,78.3,59.75,93s10.69,28.88,12.19,30.9S93,156.07,123,169c7.12,3.06,12.68,4.9,17,6.32a41.18,41.18,0,0,0,18.8,1.17c5.74-.84,17.66-7.21,20.17-14.18s2.5-13,1.75-14.19-2.69-2.06-5.7-3.59Z"/>
    </svg>
  )
}

function IconPdf() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 511.81 499.02" width="20" height="20" style={{ flexShrink: 0 }}>
      <path fill="#b30b00" d="M90.93,0h330a90.87,90.87,0,0,1,90.93,90.93V408.09A90.87,90.87,0,0,1,420.88,499H90.93C41.37,498.82,0,459.05,0,408.09V90.73C0,39.77,39.77,0,90.93,0Z"/>
      <path fill="#fff" d="M408.09,288.38C384.11,262.8,318.76,274,303,275.59c-22.38-22.38-38.17-47.76-44.57-57.36,8-24,14.39-51,14.39-76.54,0-24-9.59-47.76-35-47.76a25.51,25.51,0,0,0-22.38,12.79c-11.19,19.18-6.4,57.36,11.19,97.13C217,232.62,201.05,275.59,182.06,309c-25.58,9.59-81.34,35-86.13,63.75-1.6,8,1.6,17.58,8,22.38,6.4,6.4,14.39,8,22.38,8,33.38,0,67-46.16,90.94-87.73,19.18-6.39,49.36-16,79.74-20.78,35,32,66.94,36.57,82.93,36.57,22.39,0,30.38-9.59,33.38-17.59C417.48,306,414.49,294.78,408.09,288.38Z"/>
    </svg>
  )
}

function IconCopy() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100.56 122.88" width="18" height="18" style={{ flexShrink: 0, fill: 'currentColor' }}>
      <path d="M72.15,112.2L90.4,93H72.15V112.2L72.15,112.2z M81.75,9.2c0,1.69-1.37,3.05-3.05,3.05c-1.69,0-3.05-1.37-3.05-3.05V6.11 H6.11v92.24h3.01c1.69,0,3.05,1.37,3.05,3.05c0,1.69-1.37,3.05-3.05,3.05H5.48c-1.51,0-2.88-0.61-3.87-1.61l0.01-0.01 c-1-1-1.61-2.37-1.61-3.87V5.48C0,3.97,0.61,2.6,1.61,1.61C2.6,0.61,3.97,0,5.48,0h70.79c1.5,0,2.87,0.62,3.86,1.61l0,0l0.01,0.01 c0.99,0.99,1.61,2.36,1.61,3.86V9.2L81.75,9.2z M100.56,90.55c0,1.4-0.94,2.58-2.22,2.94l-26.88,28.27 c-0.56,0.68-1.41,1.11-2.36,1.11c-0.06,0-0.12,0-0.19-0.01c-0.06,0-0.12,0.01-0.18,0.01H24.29c-1.51,0-2.88-0.61-3.87-1.61 l0.01-0.01l-0.01-0.01c-0.99-0.99-1.61-2.36-1.61-3.86v-93.5c0-1.51,0.62-2.88,1.61-3.87l0.01,0.01c1-0.99,2.37-1.61,3.86-1.61 h70.79c1.5,0,2.87,0.62,3.86,1.61l0,0l0.01,0.01c0.99,0.99,1.61,2.36,1.61,3.86V90.55L100.56,90.55z M94.45,86.9V24.54H24.92v92.24 h41.13V89.95c0-1.69,1.37-3.05,3.05-3.05H94.45L94.45,86.9z"/>
    </svg>
  )
}

function IconTxt() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 498.93" width="18" height="18" style={{ flexShrink: 0, fill: 'currentColor' }}>
      <path d="M389.76 0c33.74 0 64.31 13.69 86.42 35.8C498.31 57.92 512 88.5 512 122.24c0 33.75-13.69 64.33-35.8 86.44-22.13 22.12-52.7 35.82-86.44 35.82-33.71 0-64.27-13.68-86.4-35.82-22.19-22.2-35.86-52.76-35.86-86.44 0-33.74 13.69-64.32 35.82-86.44C325.43 13.69 356.01 0 389.76 0zM127.13 93.07 45.4 179.44h81.73V93.07zM0 195.82c0-1.15.15-2.27.41-3.35.13-3.14 1.36-6.27 3.69-8.73L128.47 52.32c2.31-4.18 6.78-7.01 11.9-7.01h113.41c-4.87 8.6-8.97 17.7-12.16 27.2h-87.3v120.52c0 7.5-6.09 13.59-13.59 13.59H27.2v265.11h392.02V275.68c9.4-1.8 18.49-4.44 27.21-7.83V471.9c0 7.39-3.05 14.15-7.93 19.05-4.96 4.94-11.72 7.98-19.11 7.98H27.04c-7.43 0-14.21-3.06-19.09-7.94C3.07 486.1 0 479.32 0 471.9V195.82zm324.89 79.39c7.53 0 13.66 6.05 13.66 13.52s-6.13 13.52-13.66 13.52H121.54c-7.54 0-13.66-6.05-13.66-13.52s6.12-13.52 13.66-13.52h203.35zm0 91.23c7.53 0 13.66 6.05 13.66 13.52s-6.13 13.52-13.66 13.52H121.54c-7.54 0-13.66-6.05-13.66-13.52s6.12-13.52 13.66-13.52h203.35zM437.6 110.4c3.83.15 6.55 1.43 8.12 3.82 4.28 6.39-1.55 12.7-5.59 17.15l-43.06 43.78c-4.65 4.58-10.02 4.64-14.67 0l-44.11-44.98c-3.78-4.26-8.45-10.07-4.51-15.95 1.6-2.39 4.3-3.67 8.13-3.82h21.23V77.39c0-6.28 5.18-11.49 11.51-11.49h30.19c6.34 0 11.52 5.17 11.52 11.49v33.01h21.24z"/>
    </svg>
  )
}

function IconDamageList() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 95.9 122.88" width="18" height="18" style={{ flexShrink: 0, fill: 'currentColor' }}>
      <path fillRule="evenodd" clipRule="evenodd" d="M26.6,66.95c0.67-0.68,1.76-0.69,2.44-0.01c0.68,0.68,0.68,1.78,0.01,2.47l-2.95,2.99l2.95,2.99 c0.67,0.68,0.66,1.77-0.02,2.45c-0.68,0.68-1.77,0.67-2.43,0l-2.93-2.97l-2.94,2.98c-0.67,0.68-1.77,0.69-2.44,0.01 c-0.68-0.68-0.68-1.78-0.01-2.47l2.95-2.99l-2.95-2.99c-0.67-0.68-0.66-1.77,0.02-2.45c0.68-0.68,1.77-0.67,2.43,0l2.93,2.97 L26.6,66.95L26.6,66.95z M37.06,5.04v5c0,1.29-1.03,2.41-2.28,2.5c-0.27,0.09-0.58,0.13-0.89,0.13H24.6v10.35 c15.56,0,31.13,0,46.69,0V12.68h-9.28c-0.31,0-0.63-0.04-0.89-0.13c-1.25-0.09-2.28-1.21-2.28-2.5v-5 C51.58,5.04,44.32,5.04,37.06,5.04L37.06,5.04z M5.62,122.88c-1.52,0-2.95-0.62-3.97-1.65C0.62,120.2,0,118.82,0,117.26V19.86c0-1.56,0.62-2.95,1.65-3.97 c1.03-1.03,2.41-1.65,3.97-1.65h13.98v-2.77c0-1.03,0.4-1.96,1.12-2.68c0.67-0.67,1.61-1.12,2.68-1.12h8.66V4.2 c0-1.16,0.49-2.19,1.25-2.95C34.07,0.49,35.09,0,36.25,0c7.8,0,15.59,0,23.39,0c1.16,0,2.19,0.49,2.95,1.25 c0.76,0.76,1.25,1.79,1.25,2.95v3.48h8.66c1.07,0,2.01,0.45,2.68,1.12c0.71,0.71,1.12,1.65,1.12,2.68v2.77h13.98 c1.56,0,2.95,0.62,3.97,1.65c1.03,1.03,1.65,2.41,1.65,3.97v97.39c0,1.56-0.62,2.95-1.65,3.97c-1.03,1.03-2.46,1.65-3.97,1.65 C61.62,122.88,34.28,122.88,5.62,122.88L5.62,122.88z"/>
    </svg>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function ReportActions({ vehicleType, vehicleInfo, damages, onToast, hasAccess }: Props) {
  const [loading, setLoading] = useState<string | null>(null)
  const [pdfTheme, setPdfTheme] = useState<'modern' | 'editorial' | 'tecnico' | 'corporativo' | 'minimalista' | 'vibrante'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('vistoria_pdf_theme') as 'modern' | 'editorial' | 'tecnico' | 'corporativo' | 'minimalista' | 'vibrante') || 'modern'
    }
    return 'modern'
  })

  const handleThemeChange = (theme: 'modern' | 'editorial' | 'tecnico' | 'corporativo' | 'minimalista' | 'vibrante') => {
    setPdfTheme(theme)
    if (typeof window !== 'undefined') {
      localStorage.setItem('vistoria_pdf_theme', theme)
    }
  }

  async function handle(key: string, fn: () => Promise<void>, successMsg?: string) {
    setLoading(key)
    try {
      await fn()
      if (successMsg && onToast) onToast(successMsg)
    } catch (e) {
      console.error(e)
      if (onToast) onToast('❌ Erro ao gerar arquivo')
    } finally {
      setLoading(null)
    }
  }

  async function handlePdf() {
    const svgData = await captureSvgs(vehicleType, damages)
    const resolvedDamages = await resolveDamagePhotos(damages)
    const companyName = hasAccess ? (localStorage.getItem('company_name') || '') : ''
    const companyLogo = hasAccess ? (localStorage.getItem('company_logo') || '') : ''
    await generatePdf(vehicleInfo, resolvedDamages, svgData, { companyName, companyLogo, pdfTheme })
  }

  async function whatsappPdf() {
    const svgData = await captureSvgs(vehicleType, damages)
    const resolvedDamages = await resolveDamagePhotos(damages)
    const companyName = hasAccess ? (localStorage.getItem('company_name') || '') : ''
    const companyLogo = hasAccess ? (localStorage.getItem('company_logo') || '') : ''
    const blob = await generatePdfBlob(vehicleInfo, resolvedDamages, svgData, { companyName, companyLogo, pdfTheme })
    const file = new File([blob], `vistoria-${vehicleInfo.plate || 'sem-placa'}.pdf`, { type: 'application/pdf' })
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: 'Relatório de Vistoria' })
    } else {
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank')
    }
  }

  const btnBase = "w-full flex items-center justify-start gap-2 px-3.5 py-2.5 rounded-xl font-outfit text-[0.85rem] font-bold transition-all duration-200"

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-sky-400/10 font-bold text-[0.95rem] text-[var(--text-main)]">
        <IconDamageList />
        <span>Exportar Relatório</span>
      </div>

      <div className="flex flex-col gap-1.5 mb-1 bg-sky-950/15 border border-sky-500/10 rounded-xl p-2.5">
        <label htmlFor="pdf-theme-select" className="text-[0.7rem] font-bold text-[var(--text-muted)] uppercase tracking-wider">Modelo de Layout PDF</label>
        <select
          id="pdf-theme-select"
          value={pdfTheme}
          onChange={(e) => handleThemeChange(e.target.value as 'modern' | 'editorial' | 'tecnico' | 'corporativo' | 'minimalista' | 'vibrante')}
          className="w-full bg-[var(--btn-secondary-bg)] border border-[var(--btn-secondary-border)] text-[var(--text-main)] px-3 py-2 rounded-lg font-outfit text-[0.82rem] font-medium outline-none focus:border-sky-500/40 transition-all cursor-pointer"
        >
          <option value="modern" className="bg-[#0f172a] text-white">🎨 Modelo Moderno (Padrão)</option>
          <option value="editorial" className="bg-[#0f172a] text-white">📖 Modelo Editorial (Poppins & Lora)</option>
          <option value="tecnico" className="bg-[#0f172a] text-white">🔬 Modelo Técnico / Forense (Mono)</option>
          <option value="corporativo" className="bg-[#0f172a] text-white">🏛️ Modelo Corporativo (Azul & Dourado)</option>
          <option value="minimalista" className="bg-[#0f172a] text-white">⚪ Modelo Minimalista (Preto & Branco)</option>
          <option value="vibrante" className="bg-[#0f172a] text-white">🌈 Modelo Vibrante (Roxo & Rosa)</option>
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <button
          onClick={() => handle('wp', async () => sendWhatsApp(vehicleInfo, damages))}
          disabled={loading !== null}
          className={`${btnBase} bg-green-500/10 border border-green-500/30 text-green-500 hover:bg-green-500/20 disabled:opacity-60`}
        >
          {loading === 'wp' ? <span className="animate-pulse">⏳</span> : <IconWhatsApp />}
          Enviar via WhatsApp
        </button>

        <button
          onClick={() => handle('wp-pdf', whatsappPdf)}
          disabled={loading !== null}
          className={`${btnBase} bg-green-500/5 border border-green-500/20 text-green-500 hover:bg-green-500/15 disabled:opacity-60`}
        >
          {loading === 'wp-pdf' ? <span className="animate-pulse">⏳</span> : <IconWhatsAppFull />}
          WhatsApp (PDF)
        </button>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handle('pdf', handlePdf, '📄 PDF gerado!')}
            disabled={loading !== null}
            title="Gerar PDF Profissional com Mapa de Avarias"
            className={`${btnBase} flex-col justify-center gap-1 bg-gradient-to-br from-emerald-500/15 to-emerald-600/10 border border-emerald-500/35 text-emerald-500 p-2.5 hover:from-emerald-500/20 hover:to-emerald-600/15 disabled:opacity-60`}
          >
            {loading === 'pdf' ? <span className="text-xl animate-pulse">⏳</span> : <IconPdf />}
            <span className="text-[0.72rem]">PDF</span>
          </button>

          <button
            onClick={() => handle('copy', async () => { await copyReport(vehicleInfo, damages) }, '📋 Copiado!')}
            disabled={loading !== null}
            title="Copiar Relatório"
            className={`${btnBase} flex-col justify-center gap-1 bg-[var(--btn-secondary-bg)] border border-[var(--btn-secondary-border)] text-[var(--text-main)] p-2.5 hover:bg-[var(--btn-secondary-hover)] disabled:opacity-60`}
          >
            {loading === 'copy' ? <span className="text-xl animate-pulse">⏳</span> : <IconCopy />}
            <span className="text-[0.72rem]">Copiar</span>
          </button>

          <button
            onClick={() => handle('txt', async () => downloadTxt(vehicleInfo, damages), '📝 TXT baixado!')}
            disabled={loading !== null}
            title="Bloco de Notas (TXT)"
            className={`${btnBase} flex-col justify-center gap-1 bg-[var(--btn-secondary-bg)] border border-[var(--btn-secondary-border)] text-[var(--text-main)] p-2.5 hover:bg-[var(--btn-secondary-hover)] disabled:opacity-60`}
          >
            {loading === 'txt' ? <span className="text-xl animate-pulse">⏳</span> : <IconTxt />}
            <span className="text-[0.72rem]">TXT</span>
          </button>
        </div>
      </div>
    </div>
  )
}
