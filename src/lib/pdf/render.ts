import { Damage, VehicleInfo } from '../../types'
import { registerIntegrityPdfHash } from './hash'
import { buildFullHtml } from './html'
import type { PdfSettings, SvgPdfData } from './types'

async function getHtml2Pdf() {
  const mod = await import('html2pdf.js')
  return ((mod as any).default ?? mod) as any
}

const PDF_OPTS = {
  image:      { type: 'jpeg', quality: 0.98 },
  html2canvas: { 
    scale: 3, 
    useCORS: true, 
    logging: false, 
    backgroundColor: '#ffffff', 
    allowTaint: false,
    letterRendering: true
  },
  jsPDF:      { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
  pagebreak:  { mode: ['css', 'legacy'], before: ['.pagebreak'], avoid: ['.nobreak', 'tr', 'img'] },
}

// Renderiza o HTML em um único canvas e o encaixa em UMA página A4.
// Se o conteúdo passar da altura útil, reduz proporcionalmente (em vez de
// criar uma segunda página quase vazia).
async function renderSinglePage(html: string, filename: string) {
  const html2pdf = await getHtml2Pdf()
  const worker = html2pdf()
    .set({ ...PDF_OPTS, margin: [0, 0, 0, 0], filename })
    .from(html)
    .toContainer()
    .toCanvas()
  const canvas: HTMLCanvasElement = await worker.get('canvas')

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
  pdf.addImage(canvas.toDataURL('image/jpeg', 0.98), 'JPEG', x, 0, w, h)
  return pdf
}

export async function generatePdf(info: VehicleInfo, damages: Damage[], svgData?: SvgPdfData, settings?: PdfSettings): Promise<string> {
  if (typeof window !== 'undefined' && (window as any).document?.fonts?.ready) {
    await (window as any).document.fonts.ready;
  }
  const filename = `vistoria-${info.plate || 'sem-placa'}.pdf`
  const { html, hash, ts, issuedAt } = await buildFullHtml(info, damages, svgData, settings)
  const pdf = await renderSinglePage(html, filename)
  try {
    const pdfBytes = pdf.output('arraybuffer') as ArrayBuffer
    await registerIntegrityPdfHash(hash, pdfBytes, { info, damages, ts, issuedAt })
  } catch { /* best-effort — PDF save must not fail */ }
  pdf.save(filename)
  return hash
}

export async function generatePdfBlob(info: VehicleInfo, damages: Damage[], svgData?: SvgPdfData, settings?: PdfSettings): Promise<Blob> {
  if (typeof window !== 'undefined' && (window as any).document?.fonts?.ready) {
    await (window as any).document.fonts.ready;
  }
  const filename = `vistoria-${info.plate || 'sem-placa'}.pdf`
  const { html, hash, ts, issuedAt } = await buildFullHtml(info, damages, svgData, settings)
  const pdf = await renderSinglePage(html, filename)
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
