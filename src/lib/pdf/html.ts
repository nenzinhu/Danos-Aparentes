import { Damage, VehicleInfo } from '../../types'
import { computeHash, generateQrDataUrl, registerHash } from './hash'
import { buildIntegrityManifest } from './integrityManifest'
import {
  buildDamageTable,
  buildInfoTable,
  buildInteriorSection,
  buildPhotoSection,
  buildSignature,
  buildStatusBadge,
  buildSummary,
  buildSvgMaps,
} from './sections'
import { resolveTheme, sectionTitle } from './theme'
import type { PdfSettings, SvgPdfData } from './types'

export async function buildFullHtml(
  info: VehicleInfo,
  damages: Damage[],
  svgData?: SvgPdfData,
  settings?: PdfSettings,
): Promise<{ html: string; hash: string; ts: number; issuedAt: string }> {
  const ts   = Date.now()
  const date = new Date(ts).toLocaleString('pt-BR', { dateStyle: 'long', timeStyle: 'short' })
  const signatureDate = new Date(ts).toLocaleDateString('pt-BR')
  const plate  = info.plate || '—'
  const osRef  = info.ref   || `OS-${ts.toString().slice(-6)}`
  const pdfTheme = settings?.pdfTheme || 'modern'

  const isEditorial = pdfTheme === 'editorial'
  const theme = resolveTheme(pdfTheme)

  // v1 QR /verify PK — unchanged
  const hash = await computeHash(info, damages, ts)
  // v2 layered integrity (no PDF bytes yet — filled later via registerIntegrityPdfHash)
  const manifest = await buildIntegrityManifest({
    info, damages, ts, issuedAt: date, pdfBytes: null,
  })
  await registerHash(hash, info, damages, date, settings?.companyName, settings?.companyLogo, manifest)

  const geo = info.geo
  const geoQuery = geo ? `&lat=${geo.lat}&lng=${geo.lng}` : ''
  const verifyUrl = `${window.location.origin}/verify?hash=${encodeURIComponent(hash)}${geoQuery}`
  const qrDataUrl = await generateQrDataUrl(verifyUrl)
  const qrImg     = qrDataUrl
    ? `<img src="${qrDataUrl}" width="50" height="50" style="display:block;border:1px solid ${theme.borderColor};border-radius:4px;" />`
    : ''

  const geoHtml = geo
    ? `<div style="margin-top:5px;padding-top:5px;border-top:1px solid ${theme.borderLight};">
        <p style="font-size:7.5px;color:${theme.textMuted};font-family:${theme.fontMain};line-height:1.4;">
          <span style="font-weight:700;color:${theme.textMain};text-transform:uppercase;letter-spacing:0.04em;">Local da vistoria:</span>
          <span style="font-family:monospace;font-weight:700;color:${theme.textMain};">${geo.lat.toFixed(6)}, ${geo.lng.toFixed(6)}</span>${typeof geo.accuracy === 'number' ? ` <span style="color:${theme.textMuted};">(± ${geo.accuracy} m)</span>` : ''}
        </p>
        ${geo.address ? `<p style="font-size:7px;color:${theme.textMuted};font-family:${theme.fontMain};line-height:1.35;margin-top:1px;">${geo.address}</p>` : ''}
      </div>`
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
      ? `<p class="poppins" style="font-size:10px;font-weight:700;color:#94a3b8;letter-spacing:0.04em;font-family:${theme.fontTitle};text-transform:uppercase;margin-bottom:5px;line-height:1.2;">${companyName}</p>`
      : ''

  const html = `<!DOCTYPE html>
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
  .part.damage-low    { fill:#94a3b8 !important; }
  .part.damage-medium { fill:#f97316 !important; }
  .part.damage-high   { fill:#ef4444 !important; }
</style>
</head>
<body class="theme-${pdfTheme}" style="background:${theme.bgMain};">
<div class="page-container theme-${pdfTheme}" style="width:794px;background:${theme.bgMain};color:${theme.textMain};font-family:${theme.fontMain};position:relative;">
  ${settings?.watermark ? `<div style="position:absolute;top:0;left:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;overflow:hidden;pointer-events:none;z-index:999;">
    <span style="font-size:110px;font-weight:900;letter-spacing:0.05em;color:${theme.accentColor};opacity:0.14;transform:rotate(-32deg);white-space:nowrap;font-family:${theme.fontTitle};text-transform:uppercase;">${settings.watermark}</span>
  </div>` : ''}

  <!-- ══ CABEÇALHO ══════════════════════════════════════════════════════ -->
  <div class="pdf-header" style="background:${theme.headerBg};padding:13px 24px 10px;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="vertical-align:top;">
          ${logoHtml}
          ${companyNameHtml}
          <p class="pdf-header-title" style="font-size:19px;font-weight:900;color:${isEditorial ? '#faf9f5' : '#ffffff'};letter-spacing:-0.02em;line-height:1;margin-bottom:6px;font-family:${theme.fontTitle};">RELATÓRIO DE VISTORIA VEICULAR</p>
          <div class="pdf-header-accent" style="height:3px;width:56px;background:${theme.colorStripe};border-radius:2px;margin-bottom:9px;"></div>
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
  <div style="padding:9px 24px 10px;">

    <!-- 1. IDENTIFICAÇÃO -->
    <div class="nobreak" style="margin-bottom:5px;">
      ${sectionTitle('IDENTIFICAÇÃO DO VEÍCULO E PROPRIETÁRIO', theme)}
      ${buildInfoTable(info, theme)}
    </div>

    <!-- 2. VISUALIZAÇÃO PERICIAL -->
    ${buildSvgMaps(damages, svgData, theme)}

    <!-- 3. RESUMO ESTATÍSTICO -->
    <div class="nobreak" style="margin-bottom:5px;">
      ${sectionTitle('RESUMO ESTATÍSTICO DE AVARIAS', theme)}
      ${buildSummary(damages, theme)}
    </div>

    <!-- 4. DETALHAMENTO -->
    ${buildDamageTable(damages, svgData, theme)}

    <!-- 5. GALERIA DE FOTOS -->
    ${buildPhotoSection(damages, theme)}

    <!-- 5.1 OBSERVAÇÕES DO INTERIOR -->
    ${buildInteriorSection(info, theme)}

    <!-- 6. ASSINATURAS -->
    ${buildSignature(info, theme, signatureDate)}

  </div>

  <!-- ══ RODAPÉ ═════════════════════════════════════════════════════════ -->
  <div style="background:${isEditorial ? '#e8e6dc' : '#f8fafc'};border-top:1px solid ${theme.borderColor};padding:6px 24px;">
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
              ${geoHtml}
            </td>
          </tr></table>` : `<div>
            <p style="font-size:8.5px;font-weight:700;color:${theme.textMain};text-transform:uppercase;margin-bottom:2px;font-family:${theme.fontTitle};">Integridade do Documento</p>
            <p style="font-size:7.5px;color:${theme.textMuted};font-family:${theme.fontMain};">HASH: <span style="font-family:monospace;font-weight:700;color:${theme.textMain};">${hash}</span></p>
            ${geoHtml}
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
  return { html, hash, ts, issuedAt: date }
}
