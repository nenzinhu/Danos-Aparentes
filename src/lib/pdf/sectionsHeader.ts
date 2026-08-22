// Seções de cabeçalho do laudo: badge de status, resumo executivo, dados e checklist.
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

