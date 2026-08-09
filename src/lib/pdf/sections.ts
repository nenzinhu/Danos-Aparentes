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

export function buildStatusBadge(damages: Damage[], theme: PdfTheme): string {
  const hasHigh = damages.some(d => d.severity === 'high')
  const hasMed  = damages.some(d => d.severity === 'medium')
  let bg: string, color: string, label: string
  if (damages.length === 0) {
    bg = 'rgba(34,197,94,0.08)'; color = '#16a34a'; label = 'VEÍCULO SEM AVARIAS REGISTRADAS'
  } else if (hasHigh) {
    bg = 'rgba(239,68,68,0.08)'; color = '#dc2626'; label = 'AVARIAS DE GRAU GRAVE DETECTADAS'
  } else if (hasMed) {
    bg = 'rgba(249,115,22,0.08)'; color = '#ea580c'; label = 'AVARIAS DE GRAU MÉDIO DETECTADAS'
  } else {
    bg = 'rgba(234,179,8,0.08)'; color = '#ca8a04'; label = 'AVARIAS DE GRAU LEVE DETECTADAS'
  }
  const count = damages.length > 0
    ? `<span style="font-size:9.5px;font-weight:700;color:${color};opacity:0.8;margin-left:6px;">— ${damages.length} ocorrência${damages.length !== 1 ? 's' : ''}</span>`
    : ''
  
  return `<div style="margin-top:4px; display:inline-block; background:${bg}; border:1px solid ${color}20; border-radius:20px; padding:4px 12px;">
    <span style="font-size:9px;font-weight:800;color:${color};letter-spacing:0.06em;font-family:${theme.fontTitle};">${label}${count}</span>
  </div>`
}

/**
 * Card de resumo executivo — impacto imediato ao abrir o documento.
 * Placa, protocolo, gravidade e total de avarias em 4 colunas.
 */
export function buildExecutiveSummary(
  info: VehicleInfo,
  damages: Damage[],
  theme: PdfTheme,
  protocol: string,
  date: string,
): string {
  const plate = info.plate || '—'
  const hasHigh = damages.some(d => d.severity === 'high')
  const hasMed  = damages.some(d => d.severity === 'medium')
  const sevLabel = damages.length === 0 ? 'Sem avarias'
    : hasHigh ? 'Grave' : hasMed ? 'Média' : 'Leve'
  const sevColor = damages.length === 0 ? '#16a34a'
    : hasHigh ? '#dc2626' : hasMed ? '#ea580c' : '#ca8a04'

  function cell(value: string, caption: string, valColor = theme.textMain): string {
    return `<td style="vertical-align:middle;padding:0 12px;border-right:1px solid ${theme.borderLight};">
      <p style="font-size:7px;font-weight:700;color:${theme.textMuted};text-transform:uppercase;letter-spacing:0.06em;margin:0 0 2px;font-family:${theme.fontTitle};line-height:1.2;">${caption}</p>
      <p style="font-size:13px;font-weight:800;color:${valColor};margin:0;font-family:${theme.fontTitle};letter-spacing:0.02em;line-height:1.2;">${escapeHtml(value)}</p>
    </td>`
  }

  return `<div class="nobreak pdf-exec-summary" style="background:${theme.cardBg};border:1px solid ${theme.borderColor};border-radius:8px;padding:10px 14px;margin-bottom:10px;box-shadow:0 1px 3px rgba(0,0,0,0.03);">
    <table width="100%" cellpadding="0" cellspacing="0" style="table-layout:fixed;">
      <tr>
        ${cell(plate, 'Placa')}
        ${cell(protocol, 'Protocolo')}
        ${cell(sevLabel, 'Gravidade', sevColor)}
        ${cell(String(damages.length), 'Total de Avarias', theme.textMain)}
      </tr>
    </table>
  </div>`
}

export function buildInfoTable(info: VehicleInfo | Partial<VehicleInfo>, theme: PdfTheme): string {
  function field(label: string, val: string): string {
    return `<div style="margin-bottom:5px;">
      <p style="font-size:7px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.06em;margin:0 0 1px;font-family:${theme.fontTitle};line-height:1.2;">${escapeHtml(label)}</p>
      <p style="font-size:9.5px;font-weight:700;color:#111827;margin:0;font-family:${theme.fontMain};line-height:1.35;">${val ? escapeHtml(val) : '—'}</p>
    </div>`
  }

  const ownerCard = cardShell(
    `<p style="font-size:8px;font-weight:800;color:#0F172A;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 8px;font-family:${theme.fontTitle};">Dados do cliente</p>
     ${field('Nome', info.owner || '—')}
     ${field('CPF', info.cpf || '—')}
     ${field('Telefone', info.phone || '—')}
     ${field('Cidade / UF', [info.city, info.state].filter(Boolean).join(' / ') || '—')}`,
    theme,
    'margin-bottom:0;',
  )

  const vehicleCard = cardShell(
    `<p style="font-size:8px;font-weight:800;color:#0F172A;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 8px;font-family:${theme.fontTitle};">Dados do veículo</p>
     ${field('Marca / Modelo', info.brand || '—')}
     ${field('Placa', info.plate || '—')}
     ${field('Cor', info.color || '—')}
     ${field('Categoria CNH', info.cnhCategory || info.cnh || '—')}
     ${field('Tipo / Espécie', info.vehicleTypeDesc || '—')}`,
    theme,
    'margin-bottom:0;',
  )

  const customFields = info.customFields || []
  let customHtml = ''
  if (customFields.length > 0) {
    // paginate two per row for test compatibility
    const rows: string[] = []
    for (let i = 0; i < customFields.length; i += 2) {
      const a = customFields[i]
      const b = customFields[i + 1]
      rows.push(
        `<tr>
          <td style="width:50%;vertical-align:top;padding:0 4px;">${field(a.label, a.value)}</td>
          <td style="width:50%;vertical-align:top;padding:0 4px;">${b ? field(b.label, b.value) : ''}</td>
        </tr>`,
      )
    }
    customHtml = cardShell(
      `<p style="font-size:7.5px;font-weight:800;color:#1E293B;text-transform:uppercase;letter-spacing:0.07em;margin:0 0 6px;font-family:${theme.fontTitle};">Campos adicionais</p>
       <table width="100%" cellpadding="0" cellspacing="0"><tbody>${rows.join('')}</tbody></table>`,
      theme,
    )
  }

  const notesHtml = info.generalNotes
    ? cardShell(
        `<p style="font-size:7px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.06em;margin:0 0 3px;font-family:${theme.fontTitle};">Observações</p>
         <p style="font-size:9px;font-weight:500;color:#92400E;line-height:1.4;margin:0;font-family:${theme.fontMain};">${escapeHtml(info.generalNotes)}</p>`,
        theme,
      )
    : ''

  const profileRef = info.profile || info.ref
    ? `<p style="font-size:7.5px;color:#6B7280;margin:4px 0 0;font-family:${theme.fontMain};">
        ${info.profile ? `<span style="text-transform:uppercase;font-weight:700;">Perfil:</span> ${escapeHtml(info.profile.charAt(0).toUpperCase() + info.profile.slice(1))} · ` : ''}
        ${info.ref ? `<span style="text-transform:uppercase;font-weight:700;">OS / Ref:</span> ${escapeHtml(info.ref)}` : ''}
       </p>`
    : ''

  return `<div>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate;border-spacing:0 0;table-layout:fixed;margin-bottom:8px;">
      <tr>
        <td style="width:50%;vertical-align:top;padding-right:6px;">${ownerCard}</td>
        <td style="width:50%;vertical-align:top;padding-left:6px;">${vehicleCard}</td>
      </tr>
    </table>
    ${customHtml}
    ${notesHtml}
    ${profileRef}
  </div>`
}

export function buildChecklistSection(info: VehicleInfo, theme: PdfTheme): string {
  const chk = info.checklist
  if (!chk) return ''

  const items = [
    { label: '🛞 Pneus', val: chk.tires },
    { label: '⛽ Combustível', val: chk.fuelLevel },
    { label: '🪟 Para-brisa / Vidros', val: chk.windshield },
    { label: '🔧 Macaco & Chave Roda', val: chk.jackAndWrench },
    { label: '⚠️ Triângulo Segurança', val: chk.warningTriangle },
    { label: '📄 Documento (CRLV/CNH)', val: chk.crlvDocument },
    { label: '💡 Faróis & Lanternas', val: chk.headlights },
  ].filter(i => i.val && i.val.trim() !== '')

  if (items.length === 0) return ''

  function cell(label: string, val: string): string {
    return `<td style="padding:4px 8px;border-bottom:1px solid ${theme.borderLight};font-size:8px;font-weight:700;color:${theme.textMuted};text-transform:uppercase;letter-spacing:0.03em;width:22%;white-space:nowrap;font-family:${theme.fontTitle};">${escapeHtml(label)}</td>
            <td style="padding:4px 8px;border-bottom:1px solid ${theme.borderLight};font-size:9px;font-weight:700;color:${theme.textMain};width:28%;white-space:nowrap;font-family:${theme.fontMain};">${escapeHtml(val)}</td>`
  }

  let rows = ''
  for (let i = 0; i < items.length; i += 2) {
    const a = items[i]
    const b = items[i + 1]
    rows += `<tr>${cell(a.label, a.val!)}${b ? cell(b.label, b.val!) : '<td colspan="2" style="border:none;"></td>'}</tr>`
  }

  return `<div class="nobreak" style="margin-bottom:5px;">
    ${sectionTitle('CHECKLIST DE SEGURANÇA E ITENS OBRIGATÓRIOS', theme)}
    <div class="card-wrapper" style="background:${theme.cardBg};border:1px solid ${theme.borderColor};border-radius:8px;padding:2px 6px;margin-bottom:5px;box-shadow:0 1px 3px rgba(0,0,0,0.01);">
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;table-layout:fixed;">${rows}</table>
    </div>
  </div>`
}

export function buildGeoAuditSection(
  info: VehicleInfo,
  hash: string,
  theme: PdfTheme,
  opts?: { qrDataUrl?: string; verifyUrl?: string },
): string {
  const geo = info.geo
  if (!geo) return ''

  const captured = new Date(geo.capturedAt || Date.now())
  const horario = captured.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
  const ufCidade = [info.state, info.city].filter(Boolean).join(' · ') || '—'
  // Abbreviated coords — enough to verify, denser on one sheet
  const latShort = geo.lat.toFixed(4)
  const lngShort = geo.lng.toFixed(4)
  const accuracyText = typeof geo.accuracy === 'number' ? ` ±${Math.round(geo.accuracy)}m` : ''
  const mapsUrl = `https://maps.google.com/?q=${geo.lat},${geo.lng}`
  const qr = opts?.qrDataUrl
    ? `<img src="${opts.qrDataUrl}" width="40" height="40" style="display:block;border:1px solid ${theme.borderColor};border-radius:4px;background:#fff;" />`
    : ''
  const shortHash = hash ? `${hash.slice(0, 8)}…${hash.slice(-4)}` : ''

  return `<div class="nobreak section-geo-audit" style="margin-bottom:4px;">
    ${sectionTitle('LOCALIZAÇÃO', theme)}
    <div class="card-wrapper" style="background:${theme.cardBg};border:1px solid ${theme.borderColor};border-radius:6px;padding:6px 8px;margin-bottom:4px;box-shadow:none;">
      <table width="100%" cellpadding="0" cellspacing="0" style="table-layout:fixed;">
        <tr>
          <td style="vertical-align:middle;width:${qr ? '72%' : '100%'};">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="vertical-align:top;width:42%;padding-right:6px;">
                  <p style="font-size:6.5px;font-weight:700;color:${theme.textMuted};text-transform:uppercase;letter-spacing:0.06em;margin:0 0 1px;font-family:${theme.fontTitle};">Estado · Cidade</p>
                  <p style="font-size:9px;font-weight:700;color:${theme.textMain};margin:0;font-family:${theme.fontMain};line-height:1.3;">${escapeHtml(ufCidade)}</p>
                </td>
                <td style="vertical-align:top;width:32%;padding-right:6px;">
                  <p style="font-size:6.5px;font-weight:700;color:${theme.textMuted};text-transform:uppercase;letter-spacing:0.06em;margin:0 0 1px;font-family:${theme.fontTitle};">Horário</p>
                  <p style="font-size:9px;font-weight:700;color:${theme.textMain};margin:0;font-family:${theme.fontMain};line-height:1.3;">${escapeHtml(horario)}</p>
                </td>
                <td style="vertical-align:top;width:26%;">
                  <p style="font-size:6.5px;font-weight:700;color:${theme.textMuted};text-transform:uppercase;letter-spacing:0.06em;margin:0 0 1px;font-family:${theme.fontTitle};">GPS</p>
                  <p style="font-size:8px;font-weight:700;color:${theme.textMain};margin:0;font-family:'IBM Plex Mono',monospace;line-height:1.3;">
                    ${latShort}, ${lngShort}<span style="font-size:6.5px;color:${theme.textMuted};font-family:${theme.fontMain};font-weight:600;">${accuracyText}</span>
                  </p>
                </td>
              </tr>
            </table>
            <p style="font-size:6.5px;color:${theme.textMuted};margin:4px 0 0;font-family:${theme.fontMain};line-height:1.3;">
              <a href="${mapsUrl}" target="_blank" style="color:${theme.accentColor};text-decoration:none;font-weight:700;">Maps ↗</a>
              ${shortHash ? ` · Ref. integridade <span style="font-family:'IBM Plex Mono',monospace;font-weight:700;color:${theme.textMain};">${escapeHtml(shortHash)}</span>` : ''}
              ${opts?.verifyUrl ? ` · <a href="${escapeHtml(opts.verifyUrl)}" target="_blank" style="color:${theme.accentColor};text-decoration:none;font-weight:700;">Verificar</a>` : ''}
            </p>
          </td>
          ${qr ? `<td style="vertical-align:middle;text-align:right;width:28%;">
            <div style="display:inline-block;text-align:center;">
              ${qr}
              <p style="font-size:5.5px;font-weight:700;color:${theme.textMuted};text-transform:uppercase;letter-spacing:0.05em;margin:2px 0 0;font-family:${theme.fontTitle};">Validar</p>
            </div>
          </td>` : ''}
        </tr>
      </table>
    </div>
  </div>`
}

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
