import { Damage, VehicleInfo } from '../../types'
import { registerIntegrityPdfHash } from './hash'
import { buildFullHtml } from './html'
import type { PdfSettings, SvgPdfData } from './types'

async function getHtml2Pdf() {
  const mod = await import('html2pdf.js')
  return mod.default ?? mod
}

type PdfRuntimeProfile = {
  scale: number
  jpegQuality: number
}

/**
 * Escala adaptativa: desktop mantém qualidade alta (3×);
 * mobile / memória baixa reduz canvas para evitar OOM e travamentos no pátio.
 */
export function resolvePdfRuntimeProfile(
  env: {
    isMobileUa?: boolean
    deviceMemoryGb?: number
    hardwareConcurrency?: number
  } = {},
): PdfRuntimeProfile {
  const isMobile = Boolean(env.isMobileUa)
  const mem = env.deviceMemoryGb ?? 8
  const cores = env.hardwareConcurrency ?? 8

  if (isMobile || mem <= 2 || cores <= 2) {
    return { scale: 1.5, jpegQuality: 0.88 }
  }
  if (mem <= 4 || cores <= 4) {
    return { scale: 2, jpegQuality: 0.92 }
  }
  return { scale: 3, jpegQuality: 0.98 }
}

function detectRuntimeProfile(): PdfRuntimeProfile {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return resolvePdfRuntimeProfile()
  }
  const nav = navigator as Navigator & { deviceMemory?: number }
  const ua = nav.userAgent || ''
  const isMobileUa = /Android|iPhone|iPad|iPod|Mobile/i.test(ua)
  return resolvePdfRuntimeProfile({
    isMobileUa,
    deviceMemoryGb: nav.deviceMemory,
    hardwareConcurrency: nav.hardwareConcurrency,
  })
}

function buildPdfOpts(profile: PdfRuntimeProfile) {
  return {
    image: { type: 'jpeg' as const, quality: profile.jpegQuality },
    html2canvas: {
      scale: profile.scale,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      allowTaint: false,
      letterRendering: true,
    },
    jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
    pagebreak: { mode: ['css', 'legacy'], before: ['.pagebreak'], avoid: ['.nobreak', 'tr', 'img'] },
  }
}

export async function yieldToMainThread() {
  if (typeof window === 'undefined') return
  await new Promise<void>((resolve) => {
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(() => setTimeout(resolve, 0))
    } else {
      setTimeout(resolve, 0)
    }
  })
}

export function revokeObjectUrlLater(url: string, delayMs = 60_000): void {
  if (typeof window !== 'undefined' && url.startsWith('blob:')) {
    setTimeout(() => {
      try { URL.revokeObjectURL(url) } catch {}
    }, delayMs)
  }
}

function releaseCanvas(canvas: HTMLCanvasElement | null | undefined) {
  if (!canvas) return
  try {
    canvas.width = 0
    canvas.height = 0
  } catch { /* best-effort GC hint */ }
}

// Renderiza o HTML em um único canvas e o encaixa em UMA página A4.
// Se o conteúdo passar da altura útil, reduz proporcionalmente.
async function renderSinglePage(html: string, filename: string, profile: PdfRuntimeProfile) {
  const html2pdf = await getHtml2Pdf()
  await yieldToMainThread()
  const worker = html2pdf()
    .set({ ...buildPdfOpts(profile), margin: [0, 0, 0, 0], filename })
    .from(html)
    .toContainer()
  await yieldToMainThread()
  await worker.toCanvas()
  const canvas: HTMLCanvasElement = await worker.get('canvas')
  await yieldToMainThread()

  const { jsPDF } = await import('jspdf')
  const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
  const pageW = pdf.internal.pageSize.getWidth()
  const pageH = pdf.internal.pageSize.getHeight()

  let w = pageW
  let h = (canvas.height * w) / canvas.width
  if (h > pageH) {
    h = pageH
    w = (canvas.width * h) / canvas.height
  }
  const x = (pageW - w) / 2
  const dataUrl = canvas.toDataURL('image/jpeg', profile.jpegQuality)
  pdf.addImage(dataUrl, 'JPEG', x, 0, w, h)
  releaseCanvas(canvas)
  return pdf
}

async function renderMultiPage(html: string, filename: string, profile: PdfRuntimeProfile) {
  const html2pdf = await getHtml2Pdf()
  await yieldToMainThread()
  const worker = html2pdf().set({ ...buildPdfOpts(profile), filename }).from(html)
  await yieldToMainThread()
  return await worker.toPdf().get('pdf')
}

export async function generatePdf(info: VehicleInfo, damages: Damage[], svgData?: SvgPdfData, settings?: PdfSettings): Promise<string> {
  if (typeof window !== 'undefined' && window.document?.fonts?.ready) {
    await window.document.fonts.ready
  }
  await yieldToMainThread()
  const profile = detectRuntimeProfile()
  const filename = `vistoria-${info.plate || 'sem-placa'}.pdf`
  const { html, hash, ts, issuedAt, effectiveLayoutMode } = await buildFullHtml(info, damages, svgData, settings)
  await yieldToMainThread()
  const isMulti = effectiveLayoutMode === 'multi-page'
  const pdf = isMulti
    ? await renderMultiPage(html, filename, profile)
    : await renderSinglePage(html, filename, profile)
  try {
    const pdfBytes = pdf.output('arraybuffer') as ArrayBuffer
    await registerIntegrityPdfHash(hash, pdfBytes, { info, damages, ts, issuedAt })
  } catch { /* best-effort — PDF save must not fail */ }
  pdf.save(filename)
  return hash
}

export async function generatePdfBlob(info: VehicleInfo, damages: Damage[], svgData?: SvgPdfData, settings?: PdfSettings): Promise<Blob> {
  if (typeof window !== 'undefined' && window.document?.fonts?.ready) {
    await window.document.fonts.ready
  }
  await yieldToMainThread()
  const profile = detectRuntimeProfile()
  const filename = `vistoria-${info.plate || 'sem-placa'}.pdf`
  const { html, hash, ts, issuedAt, effectiveLayoutMode } = await buildFullHtml(info, damages, svgData, settings)
  await yieldToMainThread()
  const isMulti = effectiveLayoutMode === 'multi-page'
  const pdf = isMulti
    ? await renderMultiPage(html, filename, profile)
    : await renderSinglePage(html, filename, profile)
  try {
    const pdfBytes = pdf.output('arraybuffer') as ArrayBuffer
    await registerIntegrityPdfHash(hash, pdfBytes, { info, damages, ts, issuedAt })
  } catch { /* best-effort */ }
  return pdf.output('blob')
}

// ─── Snippet do selo embutível ("Laudo Verificado") ──────────────────────────
// Gera o HTML pronto pra locadora colar no próprio site/anúncio, linkando
// para a verificação pública daquele laudo específico.
export function buildBadgeSnippet(hash: string): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const verifyUrl = `${origin}/verify?hash=${encodeURIComponent(hash)}`
  const badgeUrl = `${origin}/selo-laudo-verificado.svg`
  return `<a href="${verifyUrl}" target="_blank" rel="noopener noreferrer"><img src="${badgeUrl}" alt="Laudo Verificado" width="120" height="120" /></a>`
}
