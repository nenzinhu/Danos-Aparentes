import { Damage, Severity, VehicleInfo, ViewType } from '../../types'
import { SEV_BG, SEV_COLOR, SEV_LABEL, VIEW_LABEL, pillBadge, sectionTitle, type PdfTheme } from './theme'
import type { SvgPdfData } from './types'

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

export function buildInfoTable(info: VehicleInfo | Partial<VehicleInfo>, theme: PdfTheme): string {
  function cell(label: string, val: string): string {
    if (!label && !val) {
      return `<td colspan="2" style="border:none;background:transparent;"></td>`
    }
    return `<td style="padding:4px 8px;border-bottom:1px solid ${theme.borderLight};font-size:8px;font-weight:700;color:${theme.textMuted};text-transform:uppercase;letter-spacing:0.03em;width:22%;white-space:nowrap;font-family:${theme.fontTitle};">${label}</td>
            <td style="padding:4px 8px;border-bottom:1px solid ${theme.borderLight};font-size:9.5px;font-weight:600;color:${theme.textMain};width:28%;white-space:nowrap;font-family:${theme.fontMain};">${val || '—'}</td>`
  }
  const rows = [
    [['Proprietário / Cliente', info.owner || '—'], ['Marca / Modelo',  info.brand || '—']],
    [['Telefone',               info.phone || '—'], ['Placa',           info.plate || '—']],
    [['CPF',                    info.cpf || '—'], ['Cor',         info.color || '—']],
    [['CNH',                    info.cnh || '—'], ['Categoria CNH', info.cnhCategory || '—']],
    [['Cidade',                info.city || '—'],  ['Estado (UF)',      info.state || '—']],
    [['Tipo / Espécie',   info.vehicleTypeDesc || '—'], ['Nº OS / Ref.',          info.ref || '—']],
    [['Perfil', info.profile ? info.profile.charAt(0).toUpperCase() + info.profile.slice(1) : '—'], ['', '']],
  ]
  const tableRows = rows.map(([a, b]) => `<tr>${cell(a[0], a[1])}${cell(b[0], b[1])}</tr>`).join('')

  const customFields = info.customFields || []
  let customRows = ''
  for (let i = 0; i < customFields.length; i += 2) {
    const a = customFields[i]
    const b = customFields[i + 1]
    customRows += `<tr>${cell(a.label, a.value)}${b ? cell(b.label, b.value) : '<td colspan="2" style="border:none;"></td>'}</tr>`
  }

  const notesRow = info.generalNotes
    ? `<tr>
        <td style="padding:6px 8px;border-bottom:1px solid ${theme.borderLight};font-size:8px;font-weight:700;color:${theme.textMuted};text-transform:uppercase;letter-spacing:0.03em;vertical-align:top;font-family:${theme.fontTitle};">Observações</td>
        <td style="padding:6px 8px;border-bottom:1px solid ${theme.borderLight};font-size:9.5px;color:#b45309;font-weight:500;line-height:1.4;font-family:${theme.fontMain};" colspan="3">${info.generalNotes}</td>
       </tr>`
    : ''
  return `<div class="card-wrapper" style="background:${theme.cardBg};border:1px solid ${theme.borderColor};border-radius:8px;padding:2px 6px;margin-bottom:5px;box-shadow:0 1px 3px rgba(0,0,0,0.01);">
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;table-layout:fixed;">${tableRows}${customRows}${notesRow}</table>
  </div>`
}

export function buildSummary(damages: Damage[], theme: PdfTheme): string {
  const c = { low: 0, medium: 0, high: 0 }
  damages.forEach(d => { if (d.severity in c) c[d.severity as keyof typeof c]++ })
  const total = damages.length

  function box(bg: string, border: string, num: number, numColor: string, label: string, severityClass: string): string {
    return `<td>
      <div class="stat-box ${severityClass}" style="background:${bg};border:1px solid ${border};border-radius:6px;padding:3px 10px;text-align:center;min-width:72px;box-shadow:0 1px 2px rgba(0,0,0,0.01);">
        <p style="font-size:15px;font-weight:800;color:${numColor};line-height:1;margin:0;font-family:${theme.fontTitle};">${num}</p>
        <p style="font-size:7.5px;font-weight:700;color:${numColor};text-transform:uppercase;margin:1px 0 0;letter-spacing:0.06em;font-family:${theme.fontTitle};opacity:0.85;">${label}</p>
      </div>
    </td>`
  }

  const totalColor = theme.accentColor === '#d97757' ? '#d97757' : '#2563eb'
  const totalBg = theme.accentColor === '#d97757' ? 'rgba(217,119,87,0.06)' : 'rgba(37,99,235,0.06)'
  const totalBorder = theme.accentColor === '#d97757' ? 'rgba(217,119,87,0.15)' : 'rgba(37,99,235,0.15)'

  return `<table cellpadding="0" cellspacing="0" style="margin-bottom:5px;"><tr>
    ${box('rgba(217,119,6,0.06)', 'rgba(217,119,6,0.15)', c.low, '#d97706', 'Leve', 'low')}
    <td width="8"></td>
    ${box('rgba(234,88,12,0.06)', 'rgba(234,88,12,0.15)', c.medium, '#ea580c', 'Média', 'medium')}
    <td width="8"></td>
    ${box('rgba(220,38,38,0.06)', 'rgba(220,38,38,0.15)', c.high, '#dc2626', 'Grave', 'high')}
    <td width="8"></td>
    ${box(totalBg, totalBorder, total, totalColor, 'Total', 'total')}
  </tr></table>`
}

export function buildSvgMaps(damages: Damage[], svgData: SvgPdfData | undefined, theme: PdfTheme): string {
  const hasFocus = svgData && Object.keys(svgData.svgCaptures).length > 0
  if (!hasFocus) return ''

  const ALL_VIEWS: ViewType[] = ['lateral-left', 'lateral-right', 'frontal', 'traseira']
  const activeViews = ALL_VIEWS.filter(view => damages.some(d => d.view === view))
  
  if (activeViews.length === 0) return ''

  function viewCell(view: ViewType, widthStyle: string = 'width:50%;'): string {
    const vd       = damages.filter(d => d.view === view)
    const hasDmg   = vd.length > 0
    const svgHtml  = svgData?.svgCaptures[view] ?? ''

    const hdrBgClass = hasDmg ? 'svg-cell-header-active' : 'svg-cell-header-inactive'
    const hdrBg    = hasDmg ? `background:${theme.accentColor === '#d97757' ? '#141413' : '#0f172a'}; border-bottom: 2px solid ${theme.accentColor};` : `background:${theme.cardBg}; border-bottom: 1px solid ${theme.borderColor};`
    const hdrColor = hasDmg ? '#ffffff' : theme.textMuted
    const countTxt = hasDmg ? `${vd.length} avaria${vd.length !== 1 ? 's' : ''}` : 'Sem avarias'
    const countClr = hasDmg ? (theme.accentColor === '#d97757' ? '#d97757' : '#93c5fd') : theme.textMuted
    
    const bgAreaClass = hasDmg ? 'svg-cell-bg-active' : 'svg-cell-bg-inactive'
    const bgArea = hasDmg 
      ? `background: radial-gradient(circle, rgba(219,234,254,0.15) 0%, rgba(255,255,255,1) 100%), linear-gradient(rgba(37,99,235,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.02) 1px, transparent 1px); background-size: 100% 100%, 12px 12px; background-color: ${theme.cardBg};`
      : `background: radial-gradient(circle, rgba(241,245,249,0.2) 0%, rgba(255,255,255,1) 100%), linear-gradient(rgba(148,163,184,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.02) 1px, transparent 1px); background-size: 100% 100%, 12px 12px; background-color: ${theme.cardBg};`

    const badges = hasDmg
      ? vd.map(d => pillBadge(d.partName, SEV_COLOR[d.severity], SEV_BG[d.severity], theme)).join(' ')
      : `<span style="font-size:8px;color:${theme.textMuted};font-style:italic;font-family:${theme.fontMain};padding-left:4px;">Sem avarias nesta vista</span>`

    return `<td style="${widthStyle}padding:4px;vertical-align:top;">
      <div class="svg-cell-wrapper" style="border:1px solid ${hasDmg ? theme.accentColor : theme.borderColor};border-radius:8px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.02);background:${theme.cardBg};">
        <table class="${hdrBgClass}" width="100%" cellpadding="0" cellspacing="0" style="${hdrBg}">
          <tr>
            <td style="padding:6px 10px;font-size:9px;font-weight:800;color:${hdrColor};text-transform:uppercase;letter-spacing:0.04em;font-family:${theme.fontTitle};">${VIEW_LABEL[view]}</td>
            <td style="padding:6px 10px;text-align:right;font-size:8px;font-weight:800;color:${countClr};white-space:nowrap;text-transform:uppercase;font-family:${theme.fontTitle};">${countTxt}</td>
          </tr>
        </table>
        <div class="${bgAreaClass}" style="${bgArea} padding:5px; text-align:center; min-height:76px; display:flex; align-items:center; justify-content:center;">
          <div style="width:100%; max-width:180px; margin:0 auto;">${svgHtml || `<p style="font-size:8px;color:#cbd5e1;text-align:center;padding:16px;font-family:${theme.fontMain};">Visualização indisponível</p>`}</div>
        </div>
        <div style="padding:6px;background:${theme.cardBg};min-height:30px;border-top:1px solid ${theme.borderLight};line-height:1.4;display:block;">${badges}</div>
      </div>
    </td>`
  }

  let rows = ''
  if (activeViews.length === 1) {
    rows = `<tr><td style="width:25%;"></td>${viewCell(activeViews[0], 'width:50%;')}<td style="width:25%;"></td></tr>`
  } else if (activeViews.length === 2) {
    rows = `<tr>${viewCell(activeViews[0], 'width:50%;')}${viewCell(activeViews[1], 'width:50%;')}</tr>`
  } else if (activeViews.length === 3) {
    rows = `<tr>${viewCell(activeViews[0], 'width:50%;')}${viewCell(activeViews[1], 'width:50%;')}</tr>
            <tr>${viewCell(activeViews[2], 'width:50%;')}<td style="width:50%;"></td></tr>`
  } else {
    rows = `<tr>${viewCell(activeViews[0], 'width:50%;')}${viewCell(activeViews[1], 'width:50%;')}</tr>
            <tr>${viewCell(activeViews[2], 'width:50%;')}${viewCell(activeViews[3], 'width:50%;')}</tr>`
  }

  return `<div style="margin-bottom:5px;">
    ${sectionTitle('DIAGNÓSTICO VISUAL — VISTAS COM AVARIAS', theme)}
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;table-layout:fixed;">${rows}</table>
  </div>`
}

export function buildDamageTable(damages: Damage[], svgData: SvgPdfData | undefined, theme: PdfTheme): string {
  if (damages.length === 0) {
    return `<div style="margin-bottom:5px;text-align:center;padding:16px;border:1px dashed ${theme.borderColor};border-radius:8px;background:${theme.cardBg};">
      <p style="font-size:10px;color:${theme.textMuted};font-style:italic;font-family:${theme.fontMain};">Nenhuma avaria registrada neste veículo.</p>
    </div>`
  }
  
  const rows = damages.map((d, i) => {
    const rowBgs = { low: '#fefdfa', medium: '#fffbf7', high: '#fff9f9' }
    const rowBg = rowBgs[d.severity as keyof typeof rowBgs] || '#ffffff'
    
    const ladoBadge = pillBadge(VIEW_LABEL[d.view] ?? d.view, theme.textMain, theme.cardBg, theme)
    const sevBadge  = pillBadge(SEV_LABEL[d.severity], SEV_COLOR[d.severity], SEV_BG[d.severity], theme)

    return `<tr style="background:${rowBg};page-break-inside:avoid;break-inside:avoid;">
      <td style="padding:5px 8px;border-bottom:1px solid ${theme.borderLight};font-size:9.5px;font-weight:700;color:${theme.textMuted};text-align:center;vertical-align:middle;font-family:${theme.fontMain};">${i + 1}</td>
      <td style="padding:5px 8px;border-bottom:1px solid ${theme.borderLight};font-size:10px;font-weight:700;color:${theme.textMain};text-transform:uppercase;letter-spacing:0.01em;vertical-align:middle;font-family:${theme.fontTitle};">${d.partName}</td>
      <td style="padding:5px 8px;border-bottom:1px solid ${theme.borderLight};text-align:center;vertical-align:middle;">${ladoBadge}</td>
      <td style="padding:5px 8px;border-bottom:1px solid ${theme.borderLight};font-size:10px;color:${theme.textMain};font-weight:500;vertical-align:middle;font-family:${theme.fontMain};">${d.typeName}</td>
      <td style="padding:5px 8px;border-bottom:1px solid ${theme.borderLight};text-align:center;vertical-align:middle;">${sevBadge}</td>
      <td style="padding:5px 8px;border-bottom:1px solid ${theme.borderLight};font-size:9.5px;color:${theme.textMuted};font-style:italic;vertical-align:middle;font-family:${theme.fontMain};line-height:1.3;">${d.notes || '—'}</td>
    </tr>`
  }).join('')

  return `<div style="margin-bottom:5px;">
    ${sectionTitle('DETALHAMENTO TÉCNICO DAS AVARIAS', theme)}
    <table class="damage-table" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;table-layout:fixed;border:1px solid ${theme.borderColor};border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.01);">
      <thead>
        <tr style="background:${theme.accentColor === '#d97757' ? '#141413' : '#0f172a'};">
          <th style="padding:6px;text-align:center;font-size:8.5px;font-weight:700;color:#ffffff;text-transform:uppercase;letter-spacing:0.06em;border:none;width:35px;font-family:${theme.fontTitle};">#</th>
          <th style="padding:6px;text-align:left;font-size:8.5px;font-weight:700;color:#ffffff;text-transform:uppercase;letter-spacing:0.06em;border:none;font-family:${theme.fontTitle};">Peça / Componente</th>
          <th style="padding:6px;text-align:center;font-size:8.5px;font-weight:700;color:#ffffff;text-transform:uppercase;letter-spacing:0.06em;border:none;width:120px;font-family:${theme.fontTitle};">Lado / Vista</th>
          <th style="padding:6px;text-align:left;font-size:8.5px;font-weight:700;color:#ffffff;text-transform:uppercase;letter-spacing:0.06em;border:none;font-family:${theme.fontTitle};">Tipo de Dano</th>
          <th style="padding:6px;text-align:center;font-size:8.5px;font-weight:700;color:#ffffff;text-transform:uppercase;letter-spacing:0.06em;border:none;width:90px;font-family:${theme.fontTitle};">Grau</th>
          <th style="padding:6px;text-align:left;font-size:8.5px;font-weight:700;color:#ffffff;text-transform:uppercase;letter-spacing:0.06em;border:none;font-family:${theme.fontTitle};">Observações</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  </div>`
}

export function buildPhotoSection(damages: Damage[], theme: PdfTheme): string {
  const photos: { src: string; caption: string; part: string; type: string; sev: Severity }[] = []
  damages.forEach(d => {
    d.photos.forEach((src, i) => {
      photos.push({ src, caption: (d.photoNotes ?? [])[i] ?? '', part: d.partName, type: d.typeName, sev: d.severity })
    })
  })
  if (photos.length === 0) return ''

  const rows: string[] = []
  for (let i = 0; i < photos.length; i += 3) {
    const slice = photos.slice(i, i + 3)
    const cells = slice.map(p => {
      const badge = pillBadge(SEV_LABEL[p.sev], SEV_COLOR[p.sev], SEV_BG[p.sev], theme)
      
      return `<td style="padding:4px;vertical-align:top;width:33.3%;">
        <div style="border:1px solid ${theme.borderColor};border-radius:6px;overflow:hidden;background:${theme.cardBg};box-shadow:0 1px 3px rgba(0,0,0,0.02);">
          <img src="${p.src}" style="display:block;width:100%;height:84px;object-fit:cover;" />
          <div style="padding:6px 8px;background:${theme.cardBg};border-top:1px solid ${theme.borderLight};">
            <p style="font-size:8.5px;font-weight:700;color:${theme.textMain};text-transform:uppercase;font-family:${theme.fontTitle};line-height:1.5;padding-top:2px;padding-bottom:2px;margin:0 0 3px 0;word-break:break-word;display:block;">${p.part} — ${p.type}</p>
            <p style="margin-top:3px;margin-bottom:3px;display:block;">${badge}</p>
            ${p.caption ? `<p style="font-size:7.5px;color:${theme.textMuted};margin-top:2px;font-style:italic;line-height:1.4;padding-top:1px;padding-bottom:1px;font-family:${theme.fontMain};display:block;">${p.caption}</p>` : ''}
          </div>
        </div>
      </td>`
    }).join('')
    const pad = 3 - slice.length
    const empty = Array(pad).fill('<td style="padding:4px;width:33.3%;"></td>').join('')
    rows.push(`<tr style="page-break-inside:avoid;break-inside:avoid;">${cells}${empty}</tr>`)
  }

  return `<div style="margin-top:5px;margin-bottom:5px;">
    ${sectionTitle(`GALERIA FOTOGRÁFICA — ${photos.length} foto${photos.length !== 1 ? 's' : ''}`, theme)}
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;table-layout:fixed;">${rows.join('')}</table>
  </div>`
}

export function buildInteriorSection(info: VehicleInfo | Partial<VehicleInfo>, theme: PdfTheme): string {
  const notes = info.interiorNotes || ''
  const photos = info.interiorPhotos || []
  if (!notes && photos.length === 0) return ''

  const notesHtml = notes
    ? `<p style="font-size:9.5px;color:${theme.textMain};line-height:1.5;font-family:${theme.fontMain};margin:0 0 6px 0;">${notes}</p>`
    : ''

  const rows: string[] = []
  for (let i = 0; i < photos.length; i += 3) {
    const slice = photos.slice(i, i + 3)
    const cells = slice.map((src, j) => {
      const caption = (info.interiorPhotoNotes ?? [])[i + j] ?? ''
      return `<td style="padding:4px;vertical-align:top;width:33.3%;">
        <div style="border:1px solid ${theme.borderColor};border-radius:6px;overflow:hidden;background:${theme.cardBg};box-shadow:0 1px 3px rgba(0,0,0,0.02);">
          <img src="${src}" style="display:block;width:100%;height:84px;object-fit:cover;" />
          ${caption ? `<div style="padding:6px 8px;background:${theme.cardBg};border-top:1px solid ${theme.borderLight};">
            <p style="font-size:7.5px;color:${theme.textMuted};margin:0;font-style:italic;line-height:1.4;font-family:${theme.fontMain};">${caption}</p>
          </div>` : ''}
        </div>
      </td>`
    }).join('')
    const pad = 3 - slice.length
    const empty = Array(pad).fill('<td style="padding:4px;width:33.3%;"></td>').join('')
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

export function buildSignature(info: VehicleInfo | Partial<VehicleInfo>, theme: PdfTheme, dateStr: string): string {
  const inspectorImg = info.inspectorSignature
    ? `<div style="height:32px;text-align:center;margin-bottom:2px;"><img src="${info.inspectorSignature}" style="max-height:32px;max-width:180px;display:inline-block;vertical-align:bottom;" /></div>`
    : '<div style="height:32px;"></div>'

  const clientImg = info.clientSignature
    ? `<div style="height:32px;text-align:center;margin-bottom:2px;"><img src="${info.clientSignature}" style="max-height:32px;max-width:180px;display:inline-block;vertical-align:bottom;" /></div>`
    : '<div style="height:32px;"></div>'

  return `<div style="page-break-inside:avoid;break-inside:avoid;margin-top:6px;">
    <div class="card-wrapper" style="background:${theme.cardBg};border:1px solid ${theme.borderColor};border-radius:8px;padding:7px 14px;box-shadow:0 1px 3px rgba(0,0,0,0.01);">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="width:40%;vertical-align:bottom;text-align:center;">
            ${inspectorImg}
            <div style="border-bottom:1px solid ${theme.borderColor};width:100%;"></div>
            <p style="font-size:8px;font-weight:700;color:${theme.textMuted};text-transform:uppercase;letter-spacing:0.04em;text-align:center;margin-top:6px;font-family:${theme.fontTitle};">Assinatura do Vistoriador</p>
          </td>
          <td style="width:20%;text-align:center;vertical-align:bottom;padding-bottom:2px;">
            <p style="font-size:8px;font-weight:600;color:${theme.textMuted};font-family:${theme.fontMain};">Data: ${dateStr}</p>
          </td>
          <td style="width:40%;vertical-align:bottom;text-align:center;">
            ${clientImg}
            <div style="border-bottom:1px solid ${theme.borderColor};width:100%;"></div>
            <p style="font-size:8px;font-weight:700;color:${theme.textMuted};text-transform:uppercase;letter-spacing:0.04em;text-align:center;margin-top:6px;font-family:${theme.fontTitle};">Assinatura do Responsável</p>
          </td>
        </tr>
      </table>
    </div>
  </div>`
}
