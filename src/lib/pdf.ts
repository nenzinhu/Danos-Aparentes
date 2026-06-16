import { Damage, VehicleInfo } from '../types'
import { supabase, supabaseEnabled } from './supabase'

const SEV_LABEL: Record<string, string> = { low: 'Leve', medium: 'Média', high: 'Grave' }
const SEV_COLOR: Record<string, string> = { low: '#b45309', medium: '#c2410c', high: '#b91c1c' }
const SEV_BG: Record<string, string>    = { low: '#fef3c7', medium: '#ffedd5', high: '#fee2e2' }

const VIEW_LABEL: Record<string, string> = {
  'lateral-left':  'Lateral Esquerda',
  'lateral-right': 'Lateral Direita',
  frontal:         'Frontal',
  traseira:        'Traseira',
}
export interface SvgPdfData {
  svgCaptures: Record<string, string>
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
        colorDark: '#1e3a8a', colorLight: '#ffffff',
        correctLevel: (window as any).QRCode?.CorrectLevel?.M ?? 0,
      })
      setTimeout(() => {
        const canvas = wrap.querySelector('canvas')
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

// ─── Registra o hash no Supabase para a página /verify.html conferir depois ──
// Melhor esforço: se estiver offline, sem Supabase configurado ou sem login,
// o PDF é gerado normalmente — só o QR Code de verificação online não funciona.
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
function sectionTitle(text: string): string {
  return `<p style="font-size:10px;font-weight:800;color:#1e3a8a;text-transform:uppercase;letter-spacing:0.07em;margin-bottom:8px;padding-left:9px;border-left:3px solid #1e3a8a;">${text}</p>`
}

// ─── Badge de status (topo do relatório) ─────────────────────────────────────
function buildStatusBadge(damages: Damage[]): string {
  const hasHigh = damages.some(d => d.severity === 'high')
  const hasMed  = damages.some(d => d.severity === 'medium')
  let bg: string, border: string, color: string, icon: string, label: string
  if (damages.length === 0) {
    bg = '#f0fdf4'; border = '#4ade80'; color = '#15803d'; icon = '✓'; label = 'VEÍCULO SEM AVARIAS'
  } else if (hasHigh) {
    bg = '#fef2f2'; border = '#f87171'; color = '#991b1b'; icon = '⚠'; label = 'AVARIAS GRAVES DETECTADAS'
  } else if (hasMed) {
    bg = '#fff7ed'; border = '#fb923c'; color = '#9a3412'; icon = '⚠'; label = 'AVARIAS MÉDIAS DETECTADAS'
  } else {
    bg = '#fefce8'; border = '#fbbf24'; color = '#92400e'; icon = '!'; label = 'AVARIAS LEVES DETECTADAS'
  }
  const count = damages.length > 0
    ? `<span style="font-size:10px;color:${color};opacity:0.75;margin-left:6px;">(${damages.length} ocorrência${damages.length !== 1 ? 's' : ''})</span>`
    : ''
  return `<table cellpadding="0" cellspacing="0"><tr>
    <td style="background:${bg};border:2px solid ${border};border-radius:6px;padding:8px 18px;">
      <table cellpadding="0" cellspacing="0"><tr>
        <td style="font-size:18px;font-weight:900;color:${color};padding-right:10px;vertical-align:middle;">${icon}</td>
        <td style="font-size:12px;font-weight:900;color:${color};letter-spacing:0.07em;vertical-align:middle;">${label}${count}</td>
      </tr></table>
    </td>
  </tr></table>`
}

// ─── Tabela de identificação ──────────────────────────────────────────────────
function buildInfoTable(info: VehicleInfo): string {
  function cell(label: string, val: string): string {
    return `<td style="padding:6px 10px;border:1px solid #e2e8f0;font-size:9px;font-weight:700;color:#64748b;text-transform:uppercase;background:#f8fafc;white-space:nowrap;width:22%;">${label}</td>
            <td style="padding:6px 10px;border:1px solid #e2e8f0;font-size:11px;font-weight:600;color:#0f172a;width:28%;white-space:nowrap;overflow:visible;">${val || '—'}</td>`
  }
  const rows = [
    [['Proprietário / Cliente', info.owner], ['Marca / Modelo',  info.brand]],
    [['Telefone',               info.phone], ['Placa',           info.plate]],
    [['Cor',                   info.color], ['Tipo / Espécie',   info.vehicleTypeDesc]],
    [['Cidade',                info.city],  ['Estado (UF)',      info.state]],
    [['Perfil', info.profile ? info.profile.charAt(0).toUpperCase() + info.profile.slice(1) : ''],
     ['Nº OS / Ref.',          info.ref]],
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
    ? `<tr><td style="padding:6px 10px;border:1px solid #e2e8f0;font-size:9px;font-weight:700;color:#64748b;text-transform:uppercase;background:#f8fafc;">Observações</td><td style="padding:6px 10px;border:1px solid #e2e8f0;font-size:11px;color:#713f12;background:#fffbeb;" colspan="3">${info.generalNotes}</td></tr>`
    : ''
  return `<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;table-layout:fixed;margin-bottom:18px;">${tableRows}${customRows}${notesRow}</table>`
}

// ─── Resumo estatístico + gráfico de barras ───────────────────────────────────
function buildSummary(damages: Damage[]): string {
  const c = { low: 0, medium: 0, high: 0 }
  damages.forEach(d => { if (d.severity in c) c[d.severity as keyof typeof c]++ })
  const total = damages.length

  function box(bg: string, border: string, num: number, numColor: string, label: string, labelColor: string): string {
    return `<td><div style="background:${bg};border:2px solid ${border};border-radius:6px;padding:10px 22px;text-align:center;min-width:82px;">
      <p style="font-size:30px;font-weight:900;color:${numColor};line-height:1;">${num}</p>
      <p style="font-size:9px;font-weight:800;color:${labelColor};text-transform:uppercase;margin-top:3px;letter-spacing:0.05em;">${label}</p>
    </div></td>`
  }

  const boxes = `<table cellpadding="0" cellspacing="0" style="margin-bottom:14px;"><tr>
    ${box('#fef3c7','#fcd34d', c.low,    '#92400e','#78350f', 'Leve')}
    <td width="8"></td>
    ${box('#ffedd5','#fb923c', c.medium, '#9a3412','#7c2d12', 'Média')}
    <td width="8"></td>
    ${box('#fee2e2','#f87171', c.high,   '#991b1b','#7f1d1d', 'Grave')}
    <td width="8"></td>
    ${box('#eff6ff','#93c5fd', total,    '#1d4ed8','#075985', 'Total')}
  </tr></table>`

  // Gráfico de barras horizontal (só quando há avarias)
  let bars = ''
  if (total > 0) {
    function bar(label: string, count: number, bg: string, color: string): string {
      const pct = Math.round((count / total) * 100)
      const w   = Math.round((count / total) * 300)
      return `<tr>
        <td style="width:50px;font-size:9px;font-weight:700;color:${color};text-align:right;padding-right:8px;padding-bottom:5px;vertical-align:middle;">${label}</td>
        <td style="vertical-align:middle;padding-bottom:5px;">
          <div style="background:#f1f5f9;border-radius:3px;height:14px;width:300px;overflow:hidden;">
            ${count > 0 ? `<div style="background:${bg};height:14px;width:${w}px;border-radius:3px;"></div>` : ''}
          </div>
        </td>
        <td style="padding-left:8px;font-size:9px;font-weight:800;color:${color};white-space:nowrap;vertical-align:middle;padding-bottom:5px;">${count} <span style="font-weight:400;color:#94a3b8;">(${pct}%)</span></td>
      </tr>`
    }
    bars = `<table cellpadding="0" cellspacing="0" style="margin-top:4px;">
      ${bar('Leve',  c.low,    '#fbbf24', '#92400e')}
      ${bar('Média', c.medium, '#f97316', '#9a3412')}
      ${bar('Grave', c.high,   '#ef4444', '#991b1b')}
    </table>`
  }

  return boxes + bars
}

// ─── Silhueta 2×2 com todas as vistas ────────────────────────────────────────
function buildSvgMaps(damages: Damage[], svgData?: SvgPdfData): string {
  const hasCaptures = svgData && Object.keys(svgData.svgCaptures).length > 0
  if (!hasCaptures) return ''

  const viewPairs: [string, string][] = [
    ['lateral-left', 'frontal'],
    ['lateral-right', 'traseira'],
  ]

  function viewCell(view: string): string {
    const vd       = damages.filter(d => d.view === view)
    const hasDmg   = vd.length > 0
    const svgHtml  = svgData?.svgCaptures[view] ?? ''

    const hdrBg    = hasDmg ? 'background:linear-gradient(90deg,#1e3a8a,#2563eb);' : 'background:#e2e8f0;'
    const hdrColor = hasDmg ? '#ffffff' : '#64748b'
    const accent   = hasDmg ? '#f59e0b' : '#94a3b8'
    const countTxt = hasDmg ? `${vd.length} avaria${vd.length !== 1 ? 's' : ''}` : 'Sem avarias'
    const countClr = hasDmg ? '#bfdbfe' : '#94a3b8'
    const bgArea   = hasDmg ? '#f0f5fa' : '#f8fafc'

    const badges = hasDmg
      ? vd.map(d => `<span style="display:inline-block;margin:2px 3px;padding:2px 8px;background:${SEV_BG[d.severity]};border-left:3px solid ${SEV_COLOR[d.severity]};font-size:9px;font-weight:700;color:${SEV_COLOR[d.severity]};border-radius:3px;">${d.partName} <span style="font-weight:400;color:#64748b;">${SEV_LABEL[d.severity]}</span></span>`).join('')
      : `<span style="font-size:9px;color:#94a3b8;font-style:italic;">Sem avarias nesta vista — integridade confirmada</span>`

    return `<td style="width:50%;padding:0 4px 8px 4px;vertical-align:top;">
      <div style="border:1px solid #cbd5e1;border-radius:6px;overflow:hidden;">
        <table width="100%" cellpadding="0" cellspacing="0" style="${hdrBg}">
          <tr>
            <td style="width:4px;background:${accent};padding:0;"></td>
            <td style="padding:6px 10px;font-size:9px;font-weight:800;color:${hdrColor};text-transform:uppercase;letter-spacing:0.05em;">${VIEW_LABEL[view]}</td>
            <td style="padding:6px 10px;text-align:right;font-size:8px;font-weight:700;color:${countClr};white-space:nowrap;">${countTxt}</td>
          </tr>
        </table>
        <div style="background:${bgArea};padding:8px;">${svgHtml || `<p style="font-size:9px;color:#cbd5e1;text-align:center;padding:16px;">Visualização indisponível</p>`}</div>
        <div style="padding:6px 8px;background:#ffffff;min-height:28px;border-top:1px solid #f1f5f9;">${badges}</div>
      </div>
    </td>`
  }

  const rows = viewPairs.map(([v1, v2]) => `<tr>${viewCell(v1)}${viewCell(v2)}</tr>`).join('')

  return `<div style="margin-bottom:18px;">
    ${sectionTitle('VISUALIZAÇÃO PERICIAL — MAPA DE AVARIAS')}
    <table width="100%" cellpadding="0" cellspacing="0">${rows}</table>
  </div>`
}

// ─── Tabela de detalhamento ───────────────────────────────────────────────────
function buildDamageTable(damages: Damage[]): string {
  if (damages.length === 0) {
    return `<div style="margin-bottom:18px;text-align:center;padding:16px;border:1px dashed #cbd5e1;border-radius:6px;background:#f8fafc;">
      <p style="font-size:11px;color:#94a3b8;font-style:italic;">Nenhuma avaria registrada neste veículo.</p>
    </div>`
  }
  const rows = damages.map((d, i) => `<tr style="background:${i % 2 === 0 ? '#ffffff' : '#f8fafc'};page-break-inside:avoid;break-inside:avoid;">
    <td style="padding:7px 9px;border:1px solid #e2e8f0;font-size:10px;font-weight:800;color:#64748b;text-align:center;width:30px;">${i + 1}</td>
    <td style="padding:7px 9px;border:1px solid #e2e8f0;font-size:11px;font-weight:700;color:#0f172a;">${d.partName}</td>
    <td style="padding:7px 9px;border:1px solid #e2e8f0;font-size:11px;color:#334155;">${d.typeName}</td>
    <td style="padding:7px 9px;border:1px solid #e2e8f0;font-size:10px;color:#475569;white-space:nowrap;">${VIEW_LABEL[d.view] ?? d.view}</td>
    <td style="padding:7px 9px;border:1px solid #e2e8f0;text-align:center;">
      <span style="background:${SEV_BG[d.severity]};color:${SEV_COLOR[d.severity]};border-left:3px solid ${SEV_COLOR[d.severity]};padding:2px 8px;font-weight:800;font-size:10px;display:inline-block;border-radius:3px;">${SEV_LABEL[d.severity]}</span>
    </td>
    <td style="padding:7px 9px;border:1px solid #e2e8f0;font-size:10px;color:#475569;">${d.notes || '—'}</td>
  </tr>`).join('')

  return `<div style="margin-bottom:18px;">
    ${sectionTitle('DETALHAMENTO COMPLETO DAS AVARIAS')}
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
      <tr style="background:linear-gradient(90deg,#1e3a8a,#2563eb);">
        <th style="padding:8px 9px;text-align:center;font-size:9px;font-weight:700;color:#fff;text-transform:uppercase;border:1px solid #2d4da0;width:30px;">#</th>
        <th style="padding:8px 9px;text-align:left;font-size:9px;font-weight:700;color:#fff;text-transform:uppercase;border:1px solid #2d4da0;">Peça / Componente</th>
        <th style="padding:8px 9px;text-align:left;font-size:9px;font-weight:700;color:#fff;text-transform:uppercase;border:1px solid #2d4da0;">Tipo de Dano</th>
        <th style="padding:8px 9px;text-align:left;font-size:9px;font-weight:700;color:#fff;text-transform:uppercase;border:1px solid #2d4da0;">Vista</th>
        <th style="padding:8px 9px;text-align:center;font-size:9px;font-weight:700;color:#fff;text-transform:uppercase;border:1px solid #2d4da0;width:70px;">Grau</th>
        <th style="padding:8px 9px;text-align:left;font-size:9px;font-weight:700;color:#fff;text-transform:uppercase;border:1px solid #2d4da0;">Observações</th>
      </tr>
      ${rows}
    </table>
  </div>`
}

// ─── Galeria fotográfica (3 colunas) ──────────────────────────────────────────
function buildPhotoSection(damages: Damage[]): string {
  const photos: { src: string; caption: string; part: string; type: string; sev: string }[] = []
  damages.forEach(d => {
    d.photos.forEach((src, i) => {
      photos.push({ src, caption: (d.photoNotes ?? [])[i] ?? '', part: d.partName, type: d.typeName, sev: d.severity })
    })
  })
  if (photos.length === 0) return ''

  const rows: string[] = []
  for (let i = 0; i < photos.length; i += 3) {
    const slice = photos.slice(i, i + 3)
    const cells = slice.map(p => `<td style="padding:4px;vertical-align:top;width:33.3%;">
      <div style="border:1px solid #e2e8f0;border-radius:6px;overflow:hidden;">
        <img src="${p.src}" style="display:block;width:100%;height:135px;object-fit:cover;" />
        <div style="padding:5px 7px;background:#f8fafc;border-top:1px solid #e2e8f0;">
          <p style="font-size:9px;font-weight:700;color:#1e3a8a;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${p.part} — ${p.type}</p>
          <p style="font-size:8px;font-weight:700;color:${SEV_COLOR[p.sev]};margin-top:1px;">● ${SEV_LABEL[p.sev]}</p>
          ${p.caption ? `<p style="font-size:8px;color:#64748b;margin-top:2px;font-style:italic;">${p.caption}</p>` : ''}
        </div>
      </div>
    </td>`).join('')
    const pad = 3 - slice.length
    const empty = Array(pad).fill('<td style="padding:4px;width:33.3%;"></td>').join('')
    rows.push(`<tr style="page-break-inside:avoid;break-inside:avoid;">${cells}${empty}</tr>`)
  }

  return `<div style="page-break-before:always;break-before:page;margin-bottom:18px;">
    ${sectionTitle(`GALERIA FOTOGRÁFICA — ${photos.length} foto${photos.length !== 1 ? 's' : ''}`)}
    <table width="100%" cellpadding="0" cellspacing="0">${rows.join('')}</table>
  </div>`
}

// ─── Assinaturas ──────────────────────────────────────────────────────────────
function buildSignature(): string {
  return `<div style="page-break-inside:avoid;break-inside:avoid;margin-top:24px;padding-top:16px;border-top:2px solid #e2e8f0;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="width:42%;padding-right:16px;vertical-align:bottom;">
          <div style="border-bottom:1.5px solid #475569;height:46px;"></div>
          <p style="font-size:9px;color:#64748b;text-align:center;margin-top:5px;">Assinatura do Vistoriador</p>
        </td>
        <td style="width:16%;text-align:center;vertical-align:bottom;padding-bottom:14px;">
          <p style="font-size:9px;color:#94a3b8;">Data: ___/___/______</p>
        </td>
        <td style="width:42%;padding-left:16px;vertical-align:bottom;">
          <div style="border-bottom:1.5px solid #475569;height:46px;"></div>
          <p style="font-size:9px;color:#64748b;text-align:center;margin-top:5px;">Assinatura do Proprietário / Responsável</p>
        </td>
      </tr>
    </table>
  </div>`
}

// ─── HTML completo (async — gera QR e hash antes) ─────────────────────────────
async function buildFullHtml(info: VehicleInfo, damages: Damage[], svgData?: SvgPdfData): Promise<string> {
  const ts   = Date.now()
  const date = new Date(ts).toLocaleString('pt-BR', { dateStyle: 'long', timeStyle: 'short' })
  const plate  = info.plate || '—'
  const osRef  = info.ref   || `OS-${ts.toString().slice(-6)}`

  const hash = await computeHash(info, damages, ts)
  await registerHash(hash, info, damages, date)

  const verifyUrl = `${window.location.origin}/verify.html?hash=${encodeURIComponent(hash)}`
  const qrDataUrl = await generateQrDataUrl(verifyUrl)
  const qrImg     = qrDataUrl
    ? `<img src="${qrDataUrl}" width="80" height="80" style="display:block;border:1px solid #e2e8f0;border-radius:4px;" />`
    : ''

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:Arial,Helvetica,sans-serif; font-size:12px; color:#1e293b; background:#fff; }
  .nobreak { page-break-inside:avoid; break-inside:avoid; display:block; }
  .pagebreak { page-break-before:always; break-before:page; }
  .part { fill:#bcd4e8 !important; stroke:#4a6080; stroke-width:1; }
  .part.damage-low    { fill:#fbbf24 !important; }
  .part.damage-medium { fill:#f97316 !important; }
  .part.damage-high   { fill:#ef4444 !important; }
</style>
</head>
<body>
<div style="width:794px;background:#ffffff;">

  <!-- ══ CABEÇALHO ══════════════════════════════════════════════════════ -->
  <div style="background:linear-gradient(135deg,#0f172a 0%,#1e3a8a 52%,#1d4ed8 100%);padding:22px 28px 20px;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="vertical-align:top;">
          <p style="font-size:8px;font-weight:700;color:rgba(255,255,255,0.42);letter-spacing:0.16em;text-transform:uppercase;margin-bottom:5px;">AvariasAPARENTES PWA • Sistema de Vistoria Veicular</p>
          <p style="font-size:22px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;line-height:1.1;margin-bottom:5px;">RELATÓRIO DE VISTORIA VEICULAR</p>
          <p style="font-size:10px;color:rgba(255,255,255,0.62);margin-bottom:12px;">Documento Técnico de Mapeamento de Avarias Aparentes</p>
          ${buildStatusBadge(damages)}
        </td>
        <td style="vertical-align:top;text-align:right;padding-left:16px;white-space:nowrap;">
          ${plate !== '—' ? `<div style="display:inline-block;min-width:190px;border:2px solid rgba(255,255,255,0.32);border-radius:8px;padding:7px 14px;margin-bottom:8px;">
            <p style="font-size:8px;color:rgba(255,255,255,0.48);letter-spacing:0.12em;margin-bottom:3px;text-align:center;">PLACA</p>
            <p style="font-size:24px;font-weight:900;color:#ffffff;letter-spacing:0.12em;font-family:'Courier New',monospace;text-align:center;white-space:nowrap;">${plate}</p>
          </div><br/>` : ''}
          <div style="display:inline-block;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:6px;padding:5px 14px;margin-bottom:6px;text-align:center;">
            <p style="font-size:7px;color:rgba(255,255,255,0.45);letter-spacing:0.1em;margin-bottom:2px;">Nº OS / REFERÊNCIA</p>
            <p style="font-size:13px;font-weight:900;color:#93c5fd;letter-spacing:0.05em;font-family:'Courier New',monospace;">${osRef}</p>
          </div><br/>
          <p style="font-size:8px;color:rgba(255,255,255,0.38);margin-top:6px;">Emitido em: ${date}</p>
        </td>
      </tr>
    </table>
  </div>

  <!-- Faixa colorida -->
  <div style="height:4px;background:linear-gradient(90deg,#f59e0b 0%,#ef4444 33%,#8b5cf6 66%,#06b6d4 100%);"></div>

  <!-- ══ CORPO ══════════════════════════════════════════════════════════ -->
  <div style="padding:20px 26px 28px;">

    <!-- 1. IDENTIFICAÇÃO -->
    <div class="nobreak" style="margin-bottom:18px;">
      ${sectionTitle('IDENTIFICAÇÃO DO VEÍCULO E PROPRIETÁRIO')}
      ${buildInfoTable(info)}
    </div>

    <!-- 2. VISUALIZAÇÃO PERICIAL (silhueta 2×2) -->
    ${buildSvgMaps(damages, svgData)}

    <!-- 3. RESUMO ESTATÍSTICO -->
    <div class="nobreak" style="margin-bottom:20px;">
      ${sectionTitle('RESUMO ESTATÍSTICO DE AVARIAS')}
      ${buildSummary(damages)}
    </div>

    <!-- 4. DETALHAMENTO -->
    ${buildDamageTable(damages)}

    <!-- 5. GALERIA DE FOTOS -->
    ${buildPhotoSection(damages)}

    <!-- 6. ASSINATURAS -->
    ${buildSignature()}

  </div>

  <!-- ══ RODAPÉ ═════════════════════════════════════════════════════════ -->
  <div style="background:#f1f5f9;border-top:2px solid #e2e8f0;padding:10px 26px;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="vertical-align:middle;padding-right:14px;white-space:nowrap;">
          ${qrImg ? `<table cellpadding="0" cellspacing="0"><tr>
            <td style="vertical-align:middle;padding-right:10px;">${qrImg}</td>
            <td style="vertical-align:middle;">
              <p style="font-size:8px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:3px;">Verificação Digital</p>
              <p style="font-size:7px;color:#94a3b8;font-family:'Courier New',monospace;">HASH: ${hash}</p>
              <p style="font-size:7px;color:#94a3b8;margin-top:2px;">Escaneie o QR Code para abrir a página de verificação online</p>
            </td>
          </tr></table>` : `<div>
            <p style="font-size:8px;font-weight:700;color:#475569;text-transform:uppercase;margin-bottom:2px;">Integridade do Documento</p>
            <p style="font-size:7px;color:#94a3b8;font-family:'Courier New',monospace;">HASH: ${hash}</p>
          </div>`}
        </td>
        <td style="text-align:right;vertical-align:middle;">
          <p style="font-size:8px;color:#94a3b8;margin-bottom:2px;">AvariasAPARENTES PWA • Sistema de Vistoria Veicular</p>
          <p style="font-size:8px;color:#64748b;font-weight:700;">Placa: ${plate} • OS: ${osRef} • ${damages.length} avaria${damages.length !== 1 ? 's' : ''}</p>
          <p style="font-size:8px;color:#94a3b8;margin-top:2px;">${date}</p>
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
  image:      { type: 'jpeg', quality: 0.96 },
  html2canvas: { scale: 2, useCORS: true, logging: false, backgroundColor: '#ffffff', allowTaint: false },
  jsPDF:      { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
  pagebreak:  { mode: ['css', 'legacy'], before: ['.pagebreak'], avoid: ['.nobreak', 'tr', 'img'] },
}

export async function generatePdf(info: VehicleInfo, damages: Damage[], svgData?: SvgPdfData) {
  const [html2pdf, html] = await Promise.all([getHtml2Pdf(), buildFullHtml(info, damages, svgData)])
  await html2pdf()
    .set({ ...PDF_OPTS, margin: [0, 0, 0, 0], filename: `vistoria-${info.plate || 'sem-placa'}.pdf` })
    .from(html)
    .save()
}

export async function generatePdfBlob(info: VehicleInfo, damages: Damage[], svgData?: SvgPdfData): Promise<Blob> {
  const [html2pdf, html] = await Promise.all([getHtml2Pdf(), buildFullHtml(info, damages, svgData)])
  return await html2pdf()
    .set({ ...PDF_OPTS, margin: [0, 0, 0, 0], filename: `vistoria-${info.plate || 'sem-placa'}.pdf` })
    .from(html)
    .outputPdf('blob')
}
