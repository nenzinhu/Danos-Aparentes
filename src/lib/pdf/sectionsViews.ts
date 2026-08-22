// Seções de vistas fotográficas combinadas e assinatura.
import { Damage, Severity, VehicleInfo, ViewType } from '../../types'
import { buildSvgMaps } from './sectionsBody'
import {
  SEV_BG,
  SEV_COLOR,
  SEV_KPI_BG,
  SEV_KPI_TEXT,
  SEV_LABEL,
  VIEW_LABEL,
  cardShell,
  pillBadge,
  sectionTitle,
  type PdfTheme,
} from './theme'
import type { SvgPdfData } from './types'
import { PDF_SIGNATURE_CAPTION } from './disclaimer'
import { escapeHtml } from './escape'
import {
  evidenceStatusBadgeColors,
  filterDamagesForPdf,
  formatEvidenceStatusLabel,
} from '../evidenceStatus'

const PDF_SIDE_LABEL: Record<ViewType, string> = {
  frontal: 'Frontal',
  traseira: 'Traseira',
  'lateral-left': 'Lado Esquerdo',
  'lateral-right': 'Lado Direito',
}

/** Fotos obrigatórias dos 4 lados (~90°) — anexadas ao PDF (legado / fallback). */
export function buildViewPhotosSection(
  info: VehicleInfo | Partial<VehicleInfo>,
  theme: PdfTheme,
  compact = false,
  damages: Damage[] = [],
): string {
  const ORDER: ViewType[] = ['frontal', 'traseira', 'lateral-left', 'lateral-right']
  const visible = filterDamagesForPdf(damages)
  const damagedSet = new Set(visible.map((d) => d.view))
  const slots = ORDER.map((view) => ({
    view,
    src: info.viewPhotos?.[view] || '',
    label: PDF_SIDE_LABEL[view],
    hasDmg: damagedSet.has(view),
    count: visible.filter((d) => d.view === view).length,
  })).filter((s) => Boolean(s.src))

  if (slots.length === 0) return ''

  const cellPad = compact ? '3px' : '5px'
  const imgHeight = compact ? 80 : 108
  const titleSize = compact ? '7.5px' : '8.5px'

  const row1 = slots.slice(0, 2)
  const row2 = slots.slice(2, 4)

  function cells(slice: typeof slots): string {
    const filled = slice
      .map((p) => {
        const border = p.hasDmg
          ? `2px solid ${theme.accentColor}`
          : `1px solid ${theme.borderColor}`
        const badge = p.hasDmg
          ? `<span style="display:inline-block;background:${theme.accentColor};color:#fff;font-size:6px;font-weight:800;padding:2px 5px;border-radius:3px;letter-spacing:0.04em;font-family:${theme.fontTitle};">COM AVARIA · ${p.count}</span>`
          : `<span style="font-size:6.5px;color:${theme.textMuted};font-family:${theme.fontMain};">Sem avaria</span>`
        return `<td class="view-side-cell${p.hasDmg ? ' view-side-em' : ' view-side-mini'}" style="padding:${cellPad};vertical-align:top;width:50%;">
        <div style="border:${border};border-radius:7px;overflow:hidden;background:${theme.cardBg};">
          <img class="gallery-thumb view-side-photo${p.hasDmg ? ' view-side-photo-em' : ''}" src="${p.src}" style="display:block;width:100%;height:${imgHeight}px;object-fit:cover;" />
          <div style="padding:${compact ? '5px 6px' : '7px 8px'};background:${theme.cardBg};border-top:1px solid ${theme.borderLight};">
            <p style="font-size:${titleSize};font-weight:800;color:${theme.textMain};text-transform:uppercase;font-family:${theme.fontTitle};margin:0;letter-spacing:0.04em;">${escapeHtml(p.label)}</p>
            <div style="margin-top:4px;">${badge}</div>
          </div>
        </div>
      </td>`
      })
      .join('')
    const pad = 2 - slice.length
    const empty = Array(pad).fill(`<td style="padding:${cellPad};width:50%;"></td>`).join('')
    return filled + empty
  }

  return `<div class="section-view-photos" style="margin-top:6px;margin-bottom:6px;">
    ${sectionTitle(`FOTOS DOS 4 LADOS — ${slots.length}/4`, theme)}
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;table-layout:fixed;">
      <tr style="page-break-inside:avoid;break-inside:avoid;">${cells(row1)}</tr>
      ${row2.length > 0 ? `<tr style="page-break-inside:avoid;break-inside:avoid;">${cells(row2)}</tr>` : ''}
    </table>
  </div>`
}

/**
 * Layout limpo: grade 2×2 das fotos dos 4 lados + diagramas SVG só onde há avaria.
 */
export function buildViewsCombinedSection(
  info: VehicleInfo | Partial<VehicleInfo>,
  damages: Damage[],
  svgData: SvgPdfData | undefined,
  theme: PdfTheme,
  compact = false,
): string {
  const ALL_VIEWS: ViewType[] = ['frontal', 'traseira', 'lateral-left', 'lateral-right']
  const visible = filterDamagesForPdf(damages)
  const hasAnySvg = Boolean(svgData && Object.keys(svgData.svgCaptures).length > 0)
  const gridViews = ALL_VIEWS.filter((v) => Boolean(info.viewPhotos?.[v]))
  const damagedViews = ALL_VIEWS.filter((v) => visible.some((d) => d.view === v))

  if (gridViews.length === 0 && !hasAnySvg) return ''
  // Sem fotos e sem avarias: não há o que mostrar (não dumpa SVG vazio).
  if (gridViews.length === 0 && damagedViews.length === 0) return ''

  const damagedSet = new Set(visible.map((d) => d.view))
  const cellPad = compact ? '3px' : '5px'
  const imgH = compact ? 72 : 100
  const radius = compact ? '5px' : '7px'

  function photoCell(view: ViewType): string {
    const src = info.viewPhotos?.[view] || ''
    const hasDmg = damagedSet.has(view)
    const count = visible.filter((d) => d.view === view).length
    const border = hasDmg ? `2px solid ${theme.accentColor}` : `1px solid ${theme.borderColor}`
    const hdrBg = hasDmg
      ? theme.accentColor === '#d97757'
        ? '#141413'
        : '#0f172a'
      : theme.cardBg
    const status = hasDmg
      ? `<span style="font-size:6.5px;font-weight:800;color:${theme.accentColor === '#d97757' ? '#d97757' : '#93c5fd'};font-family:${theme.fontTitle};text-transform:uppercase;">Com avaria · ${count}</span>`
      : `<span style="font-size:6.5px;color:${theme.textMuted};font-family:${theme.fontMain};">Sem avaria</span>`

    const img = src
      ? `<img class="gallery-thumb view-side-photo${hasDmg ? ' view-side-photo-em' : ''}" src="${src}" style="display:block;width:100%;height:${imgH}px;object-fit:cover;" />`
      : `<div style="height:${imgH}px;background:#F3F4F6;display:flex;align-items:center;justify-content:center;"><span style="font-size:7px;color:#9CA3AF;font-family:${theme.fontMain};">Sem foto</span></div>`

    const dmgCaption = hasDmg
      ? `<p style="font-size:6.5px;color:#374151;margin:3px 0 0;line-height:1.35;font-family:${theme.fontMain};">${escapeHtml(
          visible
            .filter((d) => d.view === view)
            .map((d) => `${d.partName} (${SEV_LABEL[d.severity]})`)
            .join(' · '),
        )}</p>`
      : ''

    return `<td class="view-side-cell${hasDmg ? ' view-side-em' : ' view-side-mini'}" style="width:50%;padding:${cellPad};vertical-align:top;">
      <div class="svg-cell-wrapper" style="border:${border};border-radius:${radius};overflow:hidden;background:${theme.cardBg};">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:${hdrBg};">
          <tr>
            <td style="padding:4px 7px;font-size:${compact ? '7px' : '8px'};font-weight:800;color:${hasDmg ? '#fff' : theme.textMain};text-transform:uppercase;letter-spacing:0.04em;font-family:${theme.fontTitle};">${PDF_SIDE_LABEL[view]}</td>
            <td style="padding:4px 7px;text-align:right;">${status}</td>
          </tr>
        </table>
        ${img}
        <div style="padding:5px 7px;border-top:1px solid ${theme.borderLight};">
          <p style="font-size:6.5px;color:${theme.textMuted};margin:0;font-family:${theme.fontMain};">Vista do motorista</p>
          ${dmgCaption}
        </div>
      </div>
    </td>`
  }

  let photoRows = ''
  for (let i = 0; i < gridViews.length; i += 2) {
    const a = gridViews[i]
    const b = gridViews[i + 1]
    photoRows += `<tr style="page-break-inside:avoid;break-inside:avoid;">${photoCell(a)}${b ? photoCell(b) : '<td style="width:50%;"></td>'}</tr>`
  }

  const svgSection =
    damagedViews.length > 0 && hasAnySvg ? buildSvgMaps(visible, svgData, theme, compact) : ''

  const photoCount = gridViews.length
  const title =
    photoCount > 0
      ? damagedViews.length > 0
        ? `FOTOS DOS 4 LADOS — ${photoCount}/4 · AVARIAS DESTACADAS`
        : `FOTOS DOS 4 LADOS — ${photoCount}/4`
      : 'DIAGRAMAS COM AVARIA'

  const photosBlock =
    photoRows.length > 0
      ? `<div class="section-views-combined-photos" style="margin-bottom:6px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;table-layout:fixed;">${photoRows}</table>
        </div>`
      : ''

  // buildSvgMaps já traz o título "DIAGRAMAS COM AVARIA" — evita duplicar quando só há SVG.
  const showOuterTitle = photoCount > 0

  return `<div class="section-views-combined nobreak" style="margin-top:4px;margin-bottom:6px;">
    ${showOuterTitle ? sectionTitle(title, theme) : ''}
    ${photosBlock}
    ${svgSection}
  </div>`
}

export function buildSignature(info: VehicleInfo | Partial<VehicleInfo>, theme: PdfTheme, dateStr: string): string {
  const inspectorImg = info.inspectorSignature
    ? `<div style="height:32px;text-align:center;margin-bottom:2px;"><img src="${info.inspectorSignature}" style="max-height:32px;max-width:180px;display:inline-block;vertical-align:bottom;" /></div>`
    : '<div style="height:32px;"></div>'

  const clientImg = info.clientSignature
    ? `<div style="height:32px;text-align:center;margin-bottom:2px;"><img src="${info.clientSignature}" style="max-height:32px;max-width:180px;display:inline-block;vertical-align:bottom;" /></div>`
    : '<div style="height:32px;"></div>'

  return `<div style="page-break-inside:avoid;break-inside:avoid;margin-top:8px;">
    <div class="card-wrapper" style="background:#FFFFFF;border:1px solid #E5E7EB;border-radius:6px;padding:10px 14px;">
      <p style="font-size:7.5px;font-weight:800;color:#0F172A;text-transform:uppercase;letter-spacing:0.07em;margin:0 0 8px;font-family:${theme.fontTitle};">Assinaturas · Validação do laudo</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="width:40%;vertical-align:bottom;text-align:center;">
            ${inspectorImg}
            <div style="border-bottom:1px solid #E5E7EB;width:100%;"></div>
            <p style="font-size:8px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.04em;text-align:center;margin-top:6px;font-family:${theme.fontTitle};">Assinatura do Vistoriador</p>
          </td>
          <td style="width:20%;text-align:center;vertical-align:bottom;padding-bottom:2px;">
            <p style="font-size:8px;font-weight:600;color:#6B7280;font-family:${theme.fontMain};">Data: ${dateStr}</p>
          </td>
          <td style="width:40%;vertical-align:bottom;text-align:center;">
            ${clientImg}
            <div style="border-bottom:1px solid #E5E7EB;width:100%;"></div>
            <p style="font-size:8px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.04em;text-align:center;margin-top:6px;font-family:${theme.fontTitle};">Assinatura do Responsável</p>
          </td>
        </tr>
      </table>
      <p style="font-size:6.5px;color:${theme.textMuted};font-family:${theme.fontMain};text-align:center;margin-top:4px;line-height:1.35;">${PDF_SIGNATURE_CAPTION}</p>
    </div>
  </div>`
}

