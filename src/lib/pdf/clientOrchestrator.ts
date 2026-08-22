import type { Damage, VehicleInfo } from '../../types'
import type { PdfSettings, SvgPdfData } from './types'
import { generatePdf as generatePdfClient, generatePdfBlob as generatePdfBlobClient, revokeObjectUrlLater } from './render'

export type PdfAccessOpts = {
  /** Bearer token — sem ele, ou offline, usa render no client. */
  accessToken?: string
  /** Força o caminho local (testes / offline explícito). */
  forceClient?: boolean
}

function canTryServer(opts?: PdfAccessOpts): boolean {
  if (opts?.forceClient) return false
  if (!opts?.accessToken) return false
  if (typeof navigator !== 'undefined' && !navigator.onLine) return false
  return true
}

async function requestServerPdf(
  info: VehicleInfo,
  damages: Damage[],
  svgData: SvgPdfData | undefined,
  settings: PdfSettings | undefined,
  accessToken: string,
): Promise<{ blob: Blob; hash: string }> {
  const res = await fetch('/api/generate-pdf', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ info, damages, svgData, settings }),
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || `PDF server falhou (${res.status})`)
  }

  const hash = res.headers.get('X-Pdf-Hash') || 'N/D'
  const blob = await res.blob()
  return { blob, hash }
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  revokeObjectUrlLater(url, 60_000)
}

/**
 * Prefere PDF no servidor (leve no celular). Se offline / 503 / erro, cai no client.
 */
export async function generatePdf(
  info: VehicleInfo,
  damages: Damage[],
  svgData?: SvgPdfData,
  settings?: PdfSettings,
  access?: PdfAccessOpts,
): Promise<string> {
  if (canTryServer(access) && access?.accessToken) {
    try {
      const { blob, hash } = await requestServerPdf(info, damages, svgData, settings, access.accessToken)
      triggerDownload(blob, `vistoria-${info.plate || 'sem-placa'}.pdf`)
      return hash
    } catch (err) {
      console.warn('[pdf] server fallback → client:', err)
    }
  }
  return generatePdfClient(info, damages, svgData, settings)
}

export async function generatePdfBlob(
  info: VehicleInfo,
  damages: Damage[],
  svgData?: SvgPdfData,
  settings?: PdfSettings,
  access?: PdfAccessOpts,
): Promise<Blob> {
  if (canTryServer(access) && access?.accessToken) {
    try {
      const { blob } = await requestServerPdf(info, damages, svgData, settings, access.accessToken)
      return blob
    } catch (err) {
      console.warn('[pdf] server blob fallback → client:', err)
    }
  }
  return generatePdfBlobClient(info, damages, svgData, settings)
}
