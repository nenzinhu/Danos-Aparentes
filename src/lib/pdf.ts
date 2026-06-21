import { Damage, VehicleInfo, Severity, ViewType } from '../types'
import { supabase, supabaseEnabled } from './supabase'

const SEV_LABEL = { low: 'Leve', medium: 'Média', high: 'Grave' } satisfies Record<Severity, string>
const SEV_COLOR = { 
  low: '#0369a1',    // sky-700
  medium: '#b45309', // amber-700
  high: '#be123c'    // rose-700
} satisfies Record<Severity, string>
const SEV_BG = { 
  low: '#f0f9ff',    // sky-50
  medium: '#fffbeb', // amber-50
  high: '#fff1f2'    // rose-50
} satisfies Record<Severity, string>

const VIEW_LABEL = {
  'lateral-left':  'Lateral Esquerda',
  'lateral-right': 'Lateral Direita',
  frontal:         'Frontal',
  traseira:        'Traseira',
} satisfies Record<ViewType, string>

export interface SvgPdfData {
  svgCaptures: Record<string, string>
}

// ─── Badge Genérica ───────────────────────────────────────────────────────────
function pillBadge(label: string, color: string, bg: string, theme: any): string {
  return `<span style="display:inline-block;padding:2px 10px;background:${bg};border:1px solid ${color}20;color:${color};font-size:8px;font-weight:700;border-radius:20px;text-transform:uppercase;letter-spacing:0.04em;font-family:${theme.fontTitle};white-space:nowrap;">${label}</span>`
}

// ─── QR Code (via vendor script já presente no projeto) ───────────────────────
async function generateQrDataUrl(text: string): Promise<string> {
  try {
    await new Promise<void>((resolve) => {
      if ((window as any).QRCode) { resolve(); return }
      const s = document.createElement('script')
      s.src = '/vendor/qrcode.min.js'
      s.onload = () => resolve()
      s.onerror = () => resolve()
      document.head.appendChild(s)
    })
    if (!(window as any).QRCode) return ''
    return await new Promise<string>((resolve) => {
      const wrap = document.createElement('div')
      wrap.style.cssText = 'position:absolute;left:-9999px;visibility:hidden;'
      document.body.appendChild(wrap)
      new (window as any).QRCode(wrap, {
        text,
        width: 96, height: 96,
        colorDark: '#141413', colorLight: '#ffffff',
        correctLevel: (window as any).QRCode?.CorrectLevel?.M ?? 0,
      })
      setTimeout(() => {
        const canvas = wrap.querySelector('canvas') as HTMLCanvasElement | null
        const url = canvas?.toDataURL('image/png') ?? ''
        document.body.removeChild(wrap)
        resolve(url)
      }, 300)
    })
  } catch { return '' }
}

// ─── Hash de integridade (SHA-256, primeiros 32 hex) ─────────────────────────
async function computeHash(info: VehicleInfo, damages: Damage[], ts: number): Promise<string> {
  try {
    const payload = JSON.stringify({ plate: info.plate, ref: info.ref, count: damages.length, ts })
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(payload))
    const hex = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
    return hex.slice(0, 32).toUpperCase()
  } catch { return 'N/D' }
}

// ─── Registra o hash no Supabase para a página /verify conferir depois ──
async function registerHash(hash: string, info: VehicleInfo, damages: Damage[], date: string) {
  if (!supabaseEnabled || !supabase || hash === 'N/D') return
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return
    await supabase.from('report_hashes').insert({
      hash, user_id: session.user.id, plate: info.plate || '',
      ref: info.ref || '', issued_at: date, damages_count: damages.length,
    })
  } catch { /* best-effort — não bloqueia a geração do PDF */ }
}

// ─── Section title ────────────────────────────────────────────────────────────
function sectionTitle(text: string, theme: any): string {
  return `<div style="margin-top:10px; margin-bottom:8px; display:flex; align-items:center;">
    <div class="sec-title-bar" style="width:3px; height:12px; background:${theme.accentColor}; border-radius:1px; margin-right:8px;"></div>
    <span class="sec-title-text" style="font-size:9.5px; font-weight:800; color:${theme.textMain}; text-transform:uppercase; letter-spacing:0.08em; font-family:${theme.fontTitle};">${text}</span>
  </div>`
}

// ─── Badge de status (topo do relatório) ─────────────────────────────────────
function buildStatusBadge(damages: Damage[], theme: any): string {
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


// ─── Tabela de identificação ──────────────────────────────────────────────────
function buildInfoTable(info: VehicleInfo, theme: any): string {
  function cell(label: string, val: string): string {
    if (!label && !val) {
      return `<td colspan="2" style="border:none;background:transparent;"></td>`
    }
    return `<td style="padding:4px 8px;border-bottom:1px solid ${theme.borderLight};font-size:8px;font-weight:700;color:${theme.textMuted};text-transform:uppercase;letter-spacing:0.03em;width:22%;white-space:nowrap;font-family:${theme.fontTitle};">${label}</td>
            <td style="padding:4px 8px;border-bottom:1px solid ${theme.borderLight};font-size:9.5px;font-weight:600;color:${theme.textMain};width:28%;white-space:nowrap;font-family:${theme.fontMain};">${val || '—'}</td>`
  }
  const rows = [
    [['Proprietário / Cliente', info.owner], ['Marca / Modelo',  info.brand]],
    [['Telefone',               info.phone], ['Placa',           info.plate]],
    [['CPF',                    info.cpf || ''], ['Cor',         info.color]],
    [['CNH',                    info.cnh || ''], ['Categoria CNH', info.cnhCategory || '']],
    [['Cidade',                info.city],  ['Estado (UF)',      info.state]],
    [['Tipo / Espécie',   info.vehicleTypeDesc], ['Nº OS / Ref.',          info.ref]],
    [['Perfil', info.profile ? info.profile.charAt(0).toUpperCase() + info.profile.slice(1) : ''], ['', '']],
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
  return `<div class="card-wrapper" style="background:${theme.cardBg};border:1px solid ${theme.borderColor};border-radius:8px;padding:2px 6px;margin-bottom:8px;box-shadow:0 1px 3px rgba(0,0,0,0.01);">
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;table-layout:fixed;">${tableRows}${customRows}${notesRow}</table>
  </div>`
}

// ─── Resumo estatístico ───────────────────────────────────────────────────────
function buildSummary(damages: Damage[], theme: any): string {
  const c = { low: 0, medium: 0, high: 0 }
  damages.forEach(d => { if (d.severity in c) c[d.severity as keyof typeof c]++ })
  const total = damages.length

  function box(bg: string, border: string, num: number, numColor: string, label: string, severityClass: string): string {
    return `<td>
      <div class="stat-box ${severityClass}" style="background:${bg};border:1px solid ${border};border-radius:6px;padding:5px 12px;text-align:center;min-width:75px;box-shadow:0 1px 2px rgba(0,0,0,0.01);">
        <p style="font-size:18px;font-weight:800;color:${numColor};line-height:1;margin:0;font-family:${theme.fontTitle};">${num}</p>
        <p style="font-size:8px;font-weight:700;color:${numColor};text-transform:uppercase;margin:2px 0 0;letter-spacing:0.06em;font-family:${theme.fontTitle};opacity:0.85;">${label}</p>
      </div>
    </td>`
  }

  const totalColor = theme.accentColor === '#d97757' ? '#d97757' : '#2563eb'
  const totalBg = theme.accentColor === '#d97757' ? 'rgba(217,119,87,0.06)' : 'rgba(37,99,235,0.06)'
  const totalBorder = theme.accentColor === '#d97757' ? 'rgba(217,119,87,0.15)' : 'rgba(37,99,235,0.15)'

  return `<table cellpadding="0" cellspacing="0" style="margin-bottom:8px;"><tr>
    ${box('rgba(217,119,6,0.06)', 'rgba(217,119,6,0.15)', c.low, '#d97706', 'Leve', 'low')}
    <td width="8"></td>
    ${box('rgba(234,88,12,0.06)', 'rgba(234,88,12,0.15)', c.medium, '#ea580c', 'Média', 'medium')}
    <td width="8"></td>
    ${box('rgba(220,38,38,0.06)', 'rgba(220,38,38,0.15)', c.high, '#dc2626', 'Grave', 'high')}
    <td width="8"></td>
    ${box(totalBg, totalBorder, total, totalColor, 'Total', 'total')}
  </tr></table>`
}

// ─── Silhueta com as vistas que possuem avarias ────────────────────────────────
function buildSvgMaps(damages: Damage[], svgData: SvgPdfData | undefined, theme: any): string {
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
        <div class="${bgAreaClass}" style="${bgArea} padding:6px; text-align:center; min-height:95px; display:flex; align-items:center; justify-content:center;">
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

  return `<div style="margin-bottom:8px;">
    ${sectionTitle('DIAGNÓSTICO VISUAL — VISTAS COM AVARIAS', theme)}
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;table-layout:fixed;">${rows}</table>
  </div>`
}

// ─── Tabela de detalhamento ───────────────────────────────────────────────────
function buildDamageTable(damages: Damage[], svgData: SvgPdfData | undefined, theme: any): string {
  if (damages.length === 0) {
    return `<div style="margin-bottom:8px;text-align:center;padding:16px;border:1px dashed ${theme.borderColor};border-radius:8px;background:${theme.cardBg};">
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

  return `<div style="margin-bottom:8px;">
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

// ─── Galeria fotográfica (3 colunas) ──────────────────────────────────────────
function buildPhotoSection(damages: Damage[], theme: any): string {
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
          <img src="${p.src}" style="display:block;width:100%;height:100px;object-fit:cover;" />
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

  return `<div style="margin-top:8px;margin-bottom:8px;">
    ${sectionTitle(`GALERIA FOTOGRÁFICA — ${photos.length} foto${photos.length !== 1 ? 's' : ''}`, theme)}
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;table-layout:fixed;">${rows.join('')}</table>
  </div>`
}

// ─── Assinaturas ──────────────────────────────────────────────────────────────
function buildSignature(info: VehicleInfo, theme: any): string {
  const inspectorImg = info.inspectorSignature
    ? `<div style="height:40px;text-align:center;margin-bottom:2px;"><img src="${info.inspectorSignature}" style="max-height:40px;max-width:180px;display:inline-block;vertical-align:bottom;" /></div>`
    : '<div style="height:40px;"></div>'

  const clientImg = info.clientSignature
    ? `<div style="height:40px;text-align:center;margin-bottom:2px;"><img src="${info.clientSignature}" style="max-height:40px;max-width:180px;display:inline-block;vertical-align:bottom;" /></div>`
    : '<div style="height:40px;"></div>'

  return `<div style="page-break-inside:avoid;break-inside:avoid;margin-top:8px;">
    <div class="card-wrapper" style="background:${theme.cardBg};border:1px solid ${theme.borderColor};border-radius:8px;padding:10px 14px;box-shadow:0 1px 3px rgba(0,0,0,0.01);">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="width:40%;vertical-align:bottom;text-align:center;">
            ${inspectorImg}
            <div style="border-bottom:1px solid ${theme.borderColor};width:100%;"></div>
            <p style="font-size:8px;font-weight:700;color:${theme.textMuted};text-transform:uppercase;letter-spacing:0.04em;text-align:center;margin-top:6px;font-family:${theme.fontTitle};">Assinatura do Vistoriador</p>
          </td>
          <td style="width:20%;text-align:center;vertical-align:bottom;padding-bottom:2px;">
            <p style="font-size:8px;font-weight:600;color:${theme.textMuted};font-family:${theme.fontMain};">Data: ____/____/________</p>
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

// ─── HTML completo (async — gera QR e hash antes) ─────────────────────────────
export interface PdfSettings {
  companyName?: string
  companyLogo?: string
  pdfTheme?: 'modern' | 'editorial' | 'tecnico'
}

async function buildFullHtml(info: VehicleInfo, damages: Damage[], svgData?: SvgPdfData, settings?: PdfSettings): Promise<string> {
  const ts   = Date.now()
  const date = new Date(ts).toLocaleString('pt-BR', { dateStyle: 'long', timeStyle: 'short' })
  const plate  = info.plate || '—'
  const osRef  = info.ref   || `OS-${ts.toString().slice(-6)}`
  const pdfTheme = settings?.pdfTheme || 'modern'
  console.log("PDF Generator - Tema ativo:", pdfTheme)

  const isEditorial = pdfTheme === 'editorial'
  const THEMES = {
    modern: {
      fontMain: "'Outfit', -apple-system, sans-serif",
      fontTitle: "'Outfit', -apple-system, sans-serif",
      bgMain: '#ffffff', textMain: '#1e293b', textMuted: '#64748b',
      accentColor: '#2563eb', borderColor: '#e2e8f0', borderLight: '#f8fafc', cardBg: '#ffffff',
      headerBg: 'linear-gradient(135deg, #090d16 0%, #1e293b 100%)',
      colorStripe: 'linear-gradient(90deg, #2563eb 0%, #3b82f6 50%, #60a5fa 100%)',
    },
    editorial: {
      fontMain: "'Lora', Georgia, serif",
      fontTitle: "'Poppins', sans-serif",
      bgMain: '#faf9f5', textMain: '#141413', textMuted: '#7a7974',
      accentColor: '#d97757', borderColor: '#b0aea5', borderLight: 'rgba(176,174,165,0.25)', cardBg: '#faf9f5',
      headerBg: 'linear-gradient(135deg, #141413 0%, #2a2a29 100%)',
      colorStripe: 'linear-gradient(90deg, #d97757 0%, #6a9bcc 50%, #788c5d 100%)',
    },
    tecnico: {
      fontMain: "'Outfit', -apple-system, sans-serif",
      fontTitle: "'IBM Plex Mono', monospace",
      bgMain: '#ffffff', textMain: '#0b1220', textMuted: '#64748b',
      accentColor: '#0f766e', borderColor: '#cbd5e1', borderLight: '#eef2f7', cardBg: '#f8fafc',
      headerBg: 'linear-gradient(135deg, #0b1220 0%, #1e293b 100%)',
      colorStripe: 'linear-gradient(90deg, #0f766e 0%, #2dd4bf 50%, #0ea5e9 100%)',
    },
  } as const
  const theme = THEMES[pdfTheme] ?? THEMES.modern

  const hash = await computeHash(info, damages, ts)
  await registerHash(hash, info, damages, date)

  const verifyUrl = `${window.location.origin}/verify?hash=${encodeURIComponent(hash)}`
  const qrDataUrl = await generateQrDataUrl(verifyUrl)
  const qrImg     = qrDataUrl
    ? `<img src="${qrDataUrl}" width="50" height="50" style="display:block;border:1px solid ${theme.borderColor};border-radius:4px;" />`
    : ''

  const companyName = settings?.companyName || ''
  const companyLogo = settings?.companyLogo || ''
  const logoHtml = companyLogo
    ? `<img src="${companyLogo}" style="max-height:42px;max-width:160px;object-fit:contain;display:block;margin-bottom:12px;border-radius:4px;" />`
    : ''
  const companyNameHtml = companyName && !companyLogo
    ? `<div style="margin-bottom:12px;">
        <p class="poppins" style="font-size:14px;font-weight:800;color:#ffffff;letter-spacing:0.04em;font-family:${theme.fontTitle};text-transform:uppercase;line-height:1.1;margin:0;">${companyName}</p>
        <div class="pdf-header-brand-line" style="height:2px;width:24px;background:${isEditorial ? '#d97757' : '#38bdf8'};margin-top:5px;border-radius:1px;"></div>
       </div>`
    : companyName
      ? `<p class="poppins" style="font-size:10px;font-weight:700;color:#94a3b8;letter-spacing:0.04em;font-family:${theme.fontTitle};text-transform:uppercase;margin-bottom:8px;line-height:1.2;">${companyName}</p>`
      : ''

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=Lora:ital,wght@0,400..700;1,400..700&family=Outfit:wght@300;400;500;600;700;800;900&family=Poppins:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Outfit',-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif; font-size:11px; color:#1e293b; background:#fff; -webkit-font-smoothing: antialiased; }
  .nobreak { page-break-inside:avoid; break-inside:avoid; display:block; }
  .pagebreak { page-break-before:always; break-before:page; }
  .part { fill:#bcd4e8 !important; stroke:#4a6080; stroke-width:1; }
  .part.damage-low    { fill:#fbbf24 !important; }
  .part.damage-medium { fill:#f97316 !important; }
  .part.damage-high   { fill:#ef4444 !important; }
</style>
</head>
<body class="theme-${pdfTheme}" style="background:${theme.bgMain};">
<div class="page-container theme-${pdfTheme}" style="width:794px;background:${theme.bgMain};color:${theme.textMain};font-family:${theme.fontMain};">

  <!-- ══ CABEÇALHO ══════════════════════════════════════════════════════ -->
  <div class="pdf-header" style="background:${theme.headerBg};padding:18px 24px 14px;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="vertical-align:top;">
          ${logoHtml}
          ${companyNameHtml}
          <p class="pdf-header-title" style="font-size:22px;font-weight:900;color:${isEditorial ? '#faf9f5' : '#ffffff'};letter-spacing:-0.02em;line-height:1;margin-bottom:8px;font-family:${theme.fontTitle};">RELATÓRIO DE VISTORIA VEICULAR</p>
          <div class="pdf-header-accent" style="height:3px;width:56px;background:${theme.colorStripe};border-radius:2px;margin-bottom:12px;"></div>
          ${buildStatusBadge(damages, theme)}
        </td>
        <td style="vertical-align:top;text-align:right;padding-left:16px;white-space:nowrap;">
          ${plate !== '—' ? `<div class="pdf-header-plate" style="display:inline-block;min-width:130px;background:${isEditorial ? 'rgba(250,249,245,0.05)' : 'rgba(255,255,255,0.03)'};border:1px solid ${isEditorial ? 'rgba(250,249,245,0.2)' : 'rgba(255,255,255,0.15)'};border-radius:6px;padding:6px 12px;margin-bottom:6px;text-align:center;">
            <p class="pdf-header-subtitle" style="font-size:7px;font-weight:700;color:${isEditorial ? '#b0aea5' : '#94a3b8'};letter-spacing:0.1em;margin-bottom:2px;text-transform:uppercase;font-family:${theme.fontTitle};">Placa</p>
            <p class="pdf-header-title" style="font-size:18px;font-weight:800;color:${isEditorial ? '#faf9f5' : '#ffffff'};letter-spacing:0.05em;font-family:${theme.fontTitle};line-height:1;text-transform:uppercase;">${plate}</p>
          </div><br/>` : ''}
          <div class="pdf-header-os" style="display:inline-block;background:${isEditorial ? 'rgba(250,249,245,0.04)' : 'rgba(255,255,255,0.03)'};border:1px solid ${isEditorial ? 'rgba(250,249,245,0.12)' : 'rgba(255,255,255,0.1)'};border-radius:4px;padding:4px 10px;margin-bottom:6px;text-align:center;">
            <p class="pdf-header-subtitle" style="font-size:6.5px;font-weight:700;color:${isEditorial ? '#b0aea5' : '#64748b'};letter-spacing:0.08em;margin-bottom:1px;text-transform:uppercase;font-family:${theme.fontTitle};">Nº OS / Ref</p>
            <p style="font-size:10px;font-weight:700;color:${isEditorial ? '#d97757' : '#38bdf8'};letter-spacing:0.04em;font-family:${theme.fontTitle};line-height:1;">${osRef}</p>
          </div><br/>
          <p class="pdf-header-date" style="font-size:7.5px;color:${isEditorial ? '#b0aea5' : '#64748b'};margin-top:2px;font-family:${theme.fontTitle};">Emitido em: ${date}</p>
        </td>
      </tr>
    </table>
  </div>

  <!-- Faixa colorida -->
  <div class="color-stripe" style="height:3px;background:${theme.colorStripe};"></div>

  <!-- ══ CORPO ══════════════════════════════════════════════════════════ -->
  <div style="padding:12px 24px 16px;">

    <!-- 1. IDENTIFICAÇÃO -->
    <div class="nobreak" style="margin-bottom:8px;">
      ${sectionTitle('IDENTIFICAÇÃO DO VEÍCULO E PROPRIETÁRIO', theme)}
      ${buildInfoTable(info, theme)}
    </div>

    <!-- 2. VISUALIZAÇÃO PERICIAL -->
    ${buildSvgMaps(damages, svgData, theme)}

    <!-- 3. RESUMO ESTATÍSTICO -->
    <div class="nobreak" style="margin-bottom:8px;">
      ${sectionTitle('RESUMO ESTATÍSTICO DE AVARIAS', theme)}
      ${buildSummary(damages, theme)}
    </div>

    <!-- 4. DETALHAMENTO -->
    ${buildDamageTable(damages, svgData, theme)}

    <!-- 5. GALERIA DE FOTOS -->
    ${buildPhotoSection(damages, theme)}

    <!-- 6. ASSINATURAS -->
    ${buildSignature(info, theme)}

  </div>

  <!-- ══ RODAPÉ ═════════════════════════════════════════════════════════ -->
  <div style="background:${isEditorial ? '#e8e6dc' : '#f8fafc'};border-top:1px solid ${theme.borderColor};padding:8px 24px;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="vertical-align:middle;padding-right:14px;white-space:nowrap;">
          ${qrImg ? `<table cellpadding="0" cellspacing="0"><tr>
            <td style="vertical-align:middle;padding-right:12px;">
              <img src="${qrDataUrl}" width="50" height="50" style="display:block;border:1px solid ${theme.borderColor};border-radius:4px;" />
            </td>
            <td style="vertical-align:middle;">
              <p style="font-size:8px;font-weight:700;color:${theme.textMain};text-transform:uppercase;letter-spacing:0.06em;margin-bottom:2px;font-family:${theme.fontTitle};">Verificação Digital</p>
              <p style="font-size:7.5px;color:${theme.textMuted};font-family:${theme.fontMain};margin-bottom:1px;">HASH: <span style="font-family:monospace;font-weight:700;color:${theme.textMain};">${hash}</span></p>
              <p style="font-size:7px;color:${theme.textMuted};font-family:${theme.fontMain};">Escaneie o QR Code para atestar a autenticidade online deste laudo.</p>
            </td>
          </tr></table>` : `<div>
            <p style="font-size:8.5px;font-weight:700;color:${theme.textMain};text-transform:uppercase;margin-bottom:2px;font-family:${theme.fontTitle};">Integridade do Documento</p>
            <p style="font-size:7.5px;color:${theme.textMuted};font-family:${theme.fontMain};">HASH: <span style="font-family:monospace;font-weight:700;color:${theme.textMain};">${hash}</span></p>
          </div>`}
        </td>
        <td style="text-align:right;vertical-align:middle;">
          <p style="font-size:8px;color:${theme.textMuted};font-weight:700;font-family:${theme.fontTitle};margin-bottom:2px;">Danos Aparentes • Vistoria Veicular</p>
          <p style="font-size:7.5px;color:${theme.textMuted};font-family:${theme.fontMain};">Placa: <strong style="color:${theme.textMain};">${plate}</strong> • OS: <strong style="color:${theme.textMain};">${osRef}</strong> • ${damages.length} avaria${damages.length !== 1 ? 's' : ''}</p>
          <p style="font-size:7.5px;color:${theme.textMuted};font-family:${theme.fontMain};margin-top:2px;">${date}</p>
        </td>
      </tr>
    </table>
  </div>

</div>
</body>
</html>`
}

// ─── html2pdf loader ──────────────────────────────────────────────────────────
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

export async function generatePdf(info: VehicleInfo, damages: Damage[], svgData?: SvgPdfData, settings?: PdfSettings) {
  if (typeof window !== 'undefined' && (window as any).document?.fonts?.ready) {
    await (window as any).document.fonts.ready;
  }
  const [html2pdf, html] = await Promise.all([getHtml2Pdf(), buildFullHtml(info, damages, svgData, settings)])
  await html2pdf()
    .set({ ...PDF_OPTS, margin: [0, 0, 0, 0], filename: `vistoria-${info.plate || 'sem-placa'}.pdf` })
    .from(html)
    .save()
}

export async function generatePdfBlob(info: VehicleInfo, damages: Damage[], svgData?: SvgPdfData, settings?: PdfSettings): Promise<Blob> {
  if (typeof window !== 'undefined' && (window as any).document?.fonts?.ready) {
    await (window as any).document.fonts.ready;
  }
  const [html2pdf, html] = await Promise.all([getHtml2Pdf(), buildFullHtml(info, damages, svgData, settings)])
  return await html2pdf()
    .set({ ...PDF_OPTS, margin: [0, 0, 0, 0], filename: `vistoria-${info.plate || 'sem-placa'}.pdf` })
    .from(html)
    .outputPdf('blob')
}
