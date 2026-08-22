// Seções de corpo do laudo: KPIs, diagramas SVG, tabela de avarias, fotos e interior.
import { Damage, Severity, VehicleInfo, ViewType } from '../../types'
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

export function buildSummary(damages: Damage[], theme: PdfTheme, compact = false): string {
  const c = { low: 0, medium: 0, high: 0 }
  damages.forEach(d => { if (d.severity in c) c[d.severity as keyof typeof c]++ })
  const total = damages.length
  const gap = compact ? 4 : 8
  const pad = compact ? '4px 6px' : '8px 10px'
  const numSize = compact ? '14px' : '18px'
  const labelSize = compact ? '6.5px' : '7.5px'
  const minW = compact ? '52px' : '78px'

  function box(bg: string, num: number, numColor: string, label: string, severityClass: string, emphasize = false): string {
    const border = emphasize ? `2px solid ${numColor}33` : `1px solid #E5E7EB`
    return `<td>
      <div class="stat-box ${severityClass}" style="background:${bg};border:${border};border-radius:6px;padding:${pad};text-align:center;min-width:${minW};">
        <p style="font-size:${numSize};font-weight:800;color:${numColor};line-height:1;margin:0;font-family:${theme.fontTitle};">${num}</p>
        <p style="font-size:${labelSize};font-weight:700;color:${numColor};text-transform:uppercase;margin:3px 0 0;letter-spacing:0.06em;font-family:${theme.fontTitle};opacity:0.9;">${label}</p>
      </div>
    </td>`
  }

  return `<table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:${compact ? 2 : 6}px;"><tr>
    ${box(SEV_KPI_BG.low, c.low, SEV_KPI_TEXT.low, 'Leve', 'low')}
    <td width="${gap}"></td>
    ${box(SEV_KPI_BG.medium, c.medium, SEV_KPI_TEXT.medium, 'Média', 'medium')}
    <td width="${gap}"></td>
    ${box(SEV_KPI_BG.high, c.high, SEV_KPI_TEXT.high, 'Grave', 'high')}
    <td width="${gap}"></td>
    ${box('#F1F5F9', total, '#0F172A', 'Total de Avarias', 'total', true)}
  </tr></table>`
}

export function buildSvgMaps(damages: Damage[], svgData: SvgPdfData | undefined, theme: PdfTheme, compact = false): string {
  const hasFocus = svgData && Object.keys(svgData.svgCaptures).length > 0
  if (!hasFocus) return ''

  const ALL_VIEWS: ViewType[] = ['lateral-left', 'lateral-right', 'frontal', 'traseira']
  const visibleDamages = filterDamagesForPdf(damages)
  // Só diagramas das vistas que têm avaria — evita páginas cheias de SVG vazio.
  const activeViews = ALL_VIEWS.filter((view) => visibleDamages.some((d) => d.view === view))
  if (activeViews.length === 0) return ''

  const cellPad = compact ? '2px' : '4px'
  const hdrPad = compact ? '3px 6px' : '6px 10px'
  const hdrSize = compact ? '7.5px' : '9px'
  const countSize = compact ? '7px' : '8px'
  const svgMax = compact ? '140px' : '200px'
  const svgMinH = compact ? '52px' : '90px'
  const svgPad = compact ? '4px' : '8px'
  const badgePad = compact ? '4px 6px' : '8px'
  const badgeMinH = compact ? '0' : '28px'
  const radius = compact ? '5px' : '8px'

  function viewCell(view: ViewType, widthStyle: string = 'width:50%;'): string {
    const vd = visibleDamages.filter((d) => d.view === view)
    const svgHtml = svgData?.svgCaptures[view] ?? ''
    const hdrBg = `background:${theme.accentColor === '#d97757' ? '#141413' : '#0f172a'}; border-bottom: 1px solid ${theme.accentColor};`
    const countTxt = `${vd.length} avaria${vd.length !== 1 ? 's' : ''}`
    const countClr = theme.accentColor === '#d97757' ? '#d97757' : '#93c5fd'
    const badges = vd
      .map((d) => pillBadge(d.partName, SEV_COLOR[d.severity], SEV_BG[d.severity], theme, compact))
      .join(' ')

    return `<td style="${widthStyle}padding:${cellPad};vertical-align:top;">
      <div class="svg-cell-wrapper" style="border:1.5px solid ${theme.accentColor};border-radius:${radius};overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.04);background:${theme.cardBg};">
        <table class="svg-cell-header-active" width="100%" cellpadding="0" cellspacing="0" style="${hdrBg}">
          <tr>
            <td style="padding:${hdrPad};font-size:${hdrSize};font-weight:800;color:#ffffff;text-transform:uppercase;letter-spacing:0.03em;font-family:${theme.fontTitle};">${VIEW_LABEL[view]}</td>
            <td style="padding:${hdrPad};text-align:right;font-size:${countSize};font-weight:800;color:${countClr};white-space:nowrap;text-transform:uppercase;font-family:${theme.fontTitle};">${countTxt}</td>
          </tr>
        </table>
        <div class="svg-cell-bg-active" style="background:${theme.cardBg}; padding:${svgPad}; text-align:center; min-height:${svgMinH}; display:flex; align-items:center; justify-content:center;">
          <div class="svg-diagram-wrap" style="width:100%; max-width:${svgMax}; margin:0 auto; line-height:0;">${svgHtml || `<p style="font-size:7px;color:#cbd5e1;text-align:center;padding:8px;font-family:${theme.fontMain};line-height:1.2;">Visualização indisponível</p>`}</div>
        </div>
        <div style="padding:${badgePad};background:${theme.cardBg};min-height:${badgeMinH};border-top:1px solid ${theme.borderLight};line-height:1.25;display:block;">${badges}</div>
      </div>
    </td>`
  }

  const rows: string[] = []
  for (let i = 0; i < activeViews.length; i += 2) {
    const a = activeViews[i]
    const b = activeViews[i + 1]
    rows.push(
      `<tr>${viewCell(a, b ? 'width:50%;' : 'width:100%;')}${b ? viewCell(b, 'width:50%;') : ''}</tr>`,
    )
  }

  return `<div class="section-svg-maps" style="margin-bottom:${compact ? 4 : 8}px;">
    ${sectionTitle('DIAGRAMAS COM AVARIA', theme)}
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;table-layout:fixed;">${rows.join('')}</table>
  </div>`
}

export function buildDamageTable(damages: Damage[], svgData: SvgPdfData | undefined, theme: PdfTheme): string {
  const visible = filterDamagesForPdf(damages)
  if (visible.length === 0) {
    return `<div style="margin-bottom:5px;text-align:center;padding:16px;border:1px dashed #E5E7EB;border-radius:6px;background:#F9FAFB;">
      <p style="font-size:10px;color:#6B7280;font-style:italic;font-family:${theme.fontMain};">Nenhuma avaria registrada neste veículo.</p>
    </div>`
  }

  const rows = visible.map((d, i) => {
    const zebra = i % 2 === 1 ? '#F9FAFB' : '#FFFFFF'
    const sevBadge = pillBadge(SEV_LABEL[d.severity].toUpperCase(), SEV_COLOR[d.severity], SEV_BG[d.severity], theme)
    let statusHtml = '—'
    if (d.evidenceStatus) {
      const { bg, fg } = evidenceStatusBadgeColors(d.evidenceStatus)
      const label = formatEvidenceStatusLabel(d.evidenceStatus, {
        decidedBy: d.evidenceDecidedBy,
        decidedAt: d.evidenceDecidedAt,
      })
      statusHtml = `<span style="display:inline-block;background:${bg};color:${fg};font-size:8px;font-weight:700;padding:2px 5px;border-radius:3px;font-family:${theme.fontMain};">${escapeHtml(label)}</span>`
    }

    return `<tr style="background:${zebra};page-break-inside:avoid;break-inside:avoid;">
      <td style="padding:6px 8px;border-bottom:1px solid #E5E7EB;font-size:9px;font-weight:700;color:#6B7280;text-align:center;vertical-align:middle;font-family:${theme.fontMain};">${i + 1}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #E5E7EB;font-size:9.5px;font-weight:700;color:#111827;text-transform:uppercase;letter-spacing:0.02em;vertical-align:middle;font-family:${theme.fontTitle};line-height:1.4;">${escapeHtml(d.partName)}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #E5E7EB;font-size:9px;color:#111827;font-weight:600;text-align:center;vertical-align:middle;font-family:${theme.fontMain};">${escapeHtml(VIEW_LABEL[d.view] ?? d.view)}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #E5E7EB;font-size:9.5px;color:#111827;font-weight:500;vertical-align:middle;font-family:${theme.fontMain};line-height:1.4;">${escapeHtml(d.typeName)}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #E5E7EB;text-align:center;vertical-align:middle;">${sevBadge}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #E5E7EB;font-size:9px;color:#6B7280;vertical-align:middle;font-family:${theme.fontMain};line-height:1.4;">${d.notes ? escapeHtml(d.notes) : '—'}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #E5E7EB;text-align:center;vertical-align:middle;">${statusHtml}</td>
    </tr>`
  }).join('')

  return `<div class="nobreak" style="margin-bottom:6px;">
    ${sectionTitle('DETALHAMENTO TÉCNICO DAS AVARIAS', theme)}
    <table class="damage-table" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;table-layout:fixed;border:1px solid #E5E7EB;border-radius:6px;overflow:hidden;">
      <thead>
        <tr style="background:#F8FAFC;">
          <th style="padding:7px 8px;text-align:center;font-size:7.5px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.06em;border-bottom:1px solid #E5E7EB;width:32px;font-family:${theme.fontTitle};">#</th>
          <th style="padding:7px 8px;text-align:left;font-size:7.5px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.06em;border-bottom:1px solid #E5E7EB;font-family:${theme.fontTitle};">Peça / Componente</th>
          <th style="padding:7px 8px;text-align:center;font-size:7.5px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.06em;border-bottom:1px solid #E5E7EB;width:110px;font-family:${theme.fontTitle};">Lado / Vista</th>
          <th style="padding:7px 8px;text-align:left;font-size:7.5px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.06em;border-bottom:1px solid #E5E7EB;font-family:${theme.fontTitle};">Tipo de Dano</th>
          <th style="padding:7px 8px;text-align:center;font-size:7.5px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.06em;border-bottom:1px solid #E5E7EB;width:80px;font-family:${theme.fontTitle};">Grau</th>
          <th style="padding:7px 8px;text-align:left;font-size:7.5px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.06em;border-bottom:1px solid #E5E7EB;font-family:${theme.fontTitle};">Observações / Diagnóstico</th>
          <th style="padding:7px 8px;text-align:center;font-size:7.5px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.06em;border-bottom:1px solid #E5E7EB;width:105px;font-family:${theme.fontTitle};">Status</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  </div>`
}

export function buildPhotoSection(damages: Damage[], theme: PdfTheme, compact = false): string {
  const visible = filterDamagesForPdf(damages)
  const photos: {
    src: string
    caption: string
    part: string
    type: string
    sev: Severity
    view: ViewType
  }[] = []
  visible.forEach((d) => {
    d.photos.forEach((src, i) => {
      photos.push({
        src,
        caption: (d.photoNotes ?? [])[i] ?? '',
        part: d.partName,
        type: d.typeName,
        sev: d.severity,
        view: d.view,
      })
    })
  })
  if (photos.length === 0) return ''

  const cols = compact ? 3 : 2
  const cellWidth = compact ? '33.3%' : '50%'
  const cellPad = compact ? '3px' : '5px'
  const imgHeight = compact ? 72 : 110
  const metaPad = compact ? '5px 6px' : '7px 9px'
  const titleSize = compact ? '7.5px' : '8.5px'
  const captionClamp = compact
    ? 'white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%;'
    : ''

  const rows: string[] = []
  for (let i = 0; i < photos.length; i += cols) {
    const slice = photos.slice(i, i + cols)
    const cells = slice
      .map((p) => {
        const viewLabel = VIEW_LABEL[p.view] ?? p.view
        const desc = p.caption || `${p.part} — ${p.type}`
        return `<td style="padding:${cellPad};vertical-align:top;width:${cellWidth};">
        <div class="nobreak damage-evidence-photo" style="border:2px solid ${theme.accentColor};border-radius:7px;overflow:hidden;background:#FFFFFF;box-shadow:0 1px 4px rgba(0,0,0,0.06);">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:${theme.accentColor === '#d97757' ? '#141413' : '#0f172a'};">
            <tr>
              <td style="padding:4px 8px;font-size:7px;font-weight:800;color:#fff;text-transform:uppercase;letter-spacing:0.06em;font-family:${theme.fontTitle};">Evidência de avaria</td>
              <td style="padding:4px 8px;text-align:right;font-size:7px;font-weight:700;color:${theme.accentColor === '#d97757' ? '#d97757' : '#93c5fd'};font-family:${theme.fontTitle};text-transform:uppercase;">${escapeHtml(SEV_LABEL[p.sev])}</td>
            </tr>
          </table>
          <div style="aspect-ratio:4/3;max-height:${imgHeight}px;overflow:hidden;background:#F9FAFB;">
            <img class="gallery-thumb" src="${p.src}" style="display:block;width:100%;height:${imgHeight}px;object-fit:cover;" />
          </div>
          <div style="padding:${metaPad};background:#FFFFFF;border-top:1px solid ${theme.borderLight};">
            <p style="font-size:6.5px;font-weight:700;color:${theme.textMuted};text-transform:uppercase;letter-spacing:0.05em;margin:0 0 3px;font-family:${theme.fontTitle};">${escapeHtml(viewLabel)}</p>
            <p style="font-size:${titleSize};font-weight:700;color:#111827;font-family:${theme.fontTitle};line-height:1.35;margin:0;word-break:break-word;display:block;${captionClamp}">${escapeHtml(p.part)} — ${escapeHtml(p.type)}</p>
            <p style="font-size:${compact ? '7px' : '8px'};color:#374151;margin-top:3px;line-height:1.4;font-family:${theme.fontMain};display:block;${captionClamp}">${escapeHtml(desc)}</p>
          </div>
        </div>
      </td>`
      })
      .join('')
    const pad = cols - slice.length
    const empty = Array(pad).fill(`<td style="padding:${cellPad};width:${cellWidth};"></td>`).join('')
    rows.push(`<tr style="page-break-inside:avoid;break-inside:avoid;">${cells}${empty}</tr>`)
  }

  return `<div style="margin-top:8px;margin-bottom:6px;">
    ${sectionTitle(`FOTOS DAS AVARIAS — ${photos.length} evidência${photos.length !== 1 ? 's' : ''}`, theme)}
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;table-layout:fixed;">${rows.join('')}</table>
  </div>`
}

export function buildInteriorSection(info: VehicleInfo | Partial<VehicleInfo>, theme: PdfTheme, compact = false): string {
  const notes = info.interiorNotes || ''
  const photos = info.interiorPhotos || []
  if (!notes && photos.length === 0) return ''

  const notesHtml = notes
    ? `<p style="font-size:9.5px;color:${theme.textMain};line-height:1.5;font-family:${theme.fontMain};margin:0 0 6px 0;">${escapeHtml(notes)}</p>`
    : ''

  const cols = compact ? 4 : 3
  const cellWidth = compact ? '25%' : '33.3%'
  const cellPad = compact ? '2px' : '4px'
  const imgHeight = compact ? 60 : 84
  const captionClamp = compact
    ? 'white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%;'
    : ''

  const rows: string[] = []
  for (let i = 0; i < photos.length; i += cols) {
    const slice = photos.slice(i, i + cols)
    const cells = slice.map((src, j) => {
      const caption = (info.interiorPhotoNotes ?? [])[i + j] ?? ''
      return `<td style="padding:${cellPad};vertical-align:top;width:${cellWidth};">
        <div style="border:1px solid ${theme.borderColor};border-radius:6px;overflow:hidden;background:${theme.cardBg};box-shadow:0 1px 3px rgba(0,0,0,0.02);">
          <img class="gallery-thumb" src="${src}" style="display:block;width:100%;height:${imgHeight}px;object-fit:cover;" />
          ${caption ? `<div style="padding:${compact ? '4px 5px' : '6px 8px'};background:${theme.cardBg};border-top:1px solid ${theme.borderLight};">
            <p style="font-size:${compact ? '6.5px' : '7.5px'};color:${theme.textMuted};margin:0;font-style:italic;line-height:1.3;font-family:${theme.fontMain};${captionClamp}">${escapeHtml(caption)}</p>
          </div>` : ''}
        </div>
      </td>`
    }).join('')
    const pad = cols - slice.length
    const empty = Array(pad).fill(`<td style="padding:${cellPad};width:${cellWidth};"></td>`).join('')
    rows.push(`<tr style="page-break-inside:avoid;break-inside:avoid;">${cells}${empty}</tr>`)
  }
  const galleryHtml = photos.length > 0
    ? `<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;table-layout:fixed;margin-top:4px;">${rows.join('')}</table>`
    : ''

  return `<div style="margin-top:5px;margin-bottom:5px;">
    ${sectionTitle('OBSERVAÇÕES DO INTERIOR', theme)}
    <div class="card-wrapper" style="background:${theme.cardBg};border:1px solid ${theme.borderColor};border-radius:8px;padding:8px 10px;box-shadow:0 1px 3px rgba(0,0,0,0.01);">
      ${notesHtml}
      ${galleryHtml}
    </div>
  </div>`
}

/** Rótulos curtos dos 4 lados no PDF (vista do motorista). */
