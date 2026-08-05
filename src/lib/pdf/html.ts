import { Damage, VehicleInfo } from '../../types'
import { computeHash, generateQrDataUrl, registerHash } from './hash'
import { buildIntegrityManifest } from './integrityManifest'
import { collectOriginalPhotoHashes } from '../photoEvidence'
import {
  buildChecklistSection,
  buildDamageTable,
  buildGeoAuditSection,
  buildInfoTable,
  buildInteriorSection,
  buildPhotoSection,
  buildSignature,
  buildStatusBadge,
  buildSummary,
  buildViewsCombinedSection,
} from './sections'
import { resolveTheme, sectionTitle } from './theme'
import type { PdfSettings, SvgPdfData } from './types'
import { buildPdfDisclaimerHtml } from './disclaimer'
import { escapeHtml } from './escape'

export function resolveEffectiveLayoutMode(
  layoutMode: 'single-page' | 'multi-page' | 'auto' | undefined,
  _damagesCount?: number,
  _photosCount?: number,
): 'single-page' | 'multi-page' {
  // Prefer 2 folhas (QR+hash em cada página). Compactação em 1 folha só quando explícita.
  if (layoutMode === 'single-page') return 'single-page'
  return 'multi-page'
}

export async function buildFullHtml(
  info: VehicleInfo,
  damages: Damage[],
  svgData?: SvgPdfData,
  settings?: PdfSettings,
): Promise<{ html: string; hash: string; ts: number; issuedAt: string; effectiveLayoutMode: 'single-page' | 'multi-page' }> {
  const ts   = Date.now()
  const date = new Date(ts).toLocaleString('pt-BR', { dateStyle: 'long', timeStyle: 'short' })
  const signatureDate = new Date(ts).toLocaleDateString('pt-BR')
  const plate  = info.plate || '—'
  const osRef  = info.ref   || `OS-${ts.toString().slice(-6)}`
  const pdfTheme = settings?.pdfTheme || 'modern'

  const isEditorial = pdfTheme === 'editorial'
  const theme = resolveTheme(pdfTheme, settings?.customColors)

  const photoRefs = [
    ...damages.flatMap((d) => d.photos || []),
    ...(info.interiorPhotos || []),
    ...Object.values(info.viewPhotos || {}).filter(Boolean),
  ] as string[]

  const layoutMode = settings?.layoutMode || 'multi-page'
  const effectiveLayoutMode = resolveEffectiveLayoutMode(layoutMode, damages.length, photoRefs.length)
  const isMultiPage = effectiveLayoutMode === 'multi-page'
  const galleryCompact = effectiveLayoutMode === 'single-page'

  const sec = {
    showInfoTable: settings?.sections?.showInfoTable ?? true,
    showChecklistSection: settings?.sections?.showChecklistSection ?? true,
    showGeoAuditSection: settings?.sections?.showGeoAuditSection ?? true,
    showSvgDiagrams: settings?.sections?.showSvgDiagrams ?? true,
    showSummaryStats: settings?.sections?.showSummaryStats ?? true,
    showDamageTable: settings?.sections?.showDamageTable ?? true,
    showPhotoGallery: settings?.sections?.showPhotoGallery ?? true,
    showInteriorSection: settings?.sections?.showInteriorSection ?? true,
    showSignatures: settings?.sections?.showSignatures ?? true,
  }

  const hf = {
    logoPosition: settings?.headerFooter?.logoPosition ?? 'left',
    logoMaxHeight: settings?.headerFooter?.logoMaxHeight ?? 48,
    headerSubtitle: settings?.headerFooter?.headerSubtitle
      || (settings?.inspectionPurpose === 'retorno'
        ? 'RELATÓRIO DE VISTORIA — RETORNO / CHECK-IN'
        : settings?.inspectionPurpose === 'entrada'
          ? 'RELATÓRIO DE VISTORIA — ENTRADA / CHECK-OUT'
          : 'RELATÓRIO DE VISTORIA VEICULAR'),
    showQrCode: settings?.headerFooter?.showQrCode ?? true,
    showGpsLocation: settings?.headerFooter?.showGpsLocation ?? true,
    customFooterText: settings?.headerFooter?.customFooterText || '',
  }

  // v1 QR /verify PK — unchanged
  const hash = await computeHash(info, damages, ts)
  // Prefer ORIGINAL byte hashes when FASE 4 evidence exists
  let originalPhotoHashes: Record<string, string> = {}
  try {
    originalPhotoHashes = await collectOriginalPhotoHashes(photoRefs)
  } catch {
    /* IndexedDB unavailable in some render contexts — fall back to ref hashing */
  }
  // v2 layered integrity (no PDF bytes yet — filled later via registerIntegrityPdfHash)
  const manifest = await buildIntegrityManifest({
    info, damages, ts, issuedAt: date, pdfBytes: null,
    inspectionId: settings?.inspectionId || settings?.publicCode,
    originalPhotoHashes,
  })
  if (!settings?.skipHashRegister) {
    await registerHash(hash, info, damages, date, settings?.companyName, settings?.companyLogo, manifest, {
      inspectionId: settings?.inspectionId,
      correctionReason: settings?.correctionReason,
      supersedesHash: settings?.supersedesHash,
      publicCode: settings?.publicCode,
      laudoVersion: settings?.laudoVersion,
    })
  }

  const geo = hf.showGpsLocation ? info.geo : undefined
  const geoQuery = geo ? `&lat=${geo.lat}&lng=${geo.lng}` : ''
  const origin =
    (typeof window !== 'undefined' && window.location?.origin) ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    'https://danosaparentes.com.br'
  const verifyUrl = `${origin.replace(/\/$/, '')}/verify?hash=${encodeURIComponent(hash)}${geoQuery}`
  const qrDataUrl = hf.showQrCode ? await generateQrDataUrl(verifyUrl) : ''
  const qrImg = qrDataUrl
    ? `<img src="${qrDataUrl}" width="56" height="56" style="display:block;border:1px solid #E5E7EB;border-radius:6px;background:#fff;" />`
    : ''

  const geoHtml = geo
    ? `<div style="margin-top:6px;padding-top:6px;border-top:1px solid #E5E7EB;">
        <p style="font-size:7.5px;color:#6B7280;font-family:${theme.fontMain};line-height:1.4;margin:0;">
          <span style="font-weight:700;color:#111827;text-transform:uppercase;letter-spacing:0.04em;">GPS</span>
          <span style="font-family:'IBM Plex Mono',monospace;font-weight:700;color:#111827;margin-left:4px;">${geo.lat.toFixed(4)}, ${geo.lng.toFixed(4)}</span>${typeof geo.accuracy === 'number' ? ` <span style="color:#6B7280;">(± ${geo.accuracy} m)</span>` : ''}
        </p>
        ${[info.state, info.city].filter(Boolean).length
          ? `<p style="font-size:7px;color:#6B7280;font-family:${theme.fontMain};line-height:1.35;margin:2px 0 0;">${escapeHtml([info.state, info.city].filter(Boolean).join(' · '))}</p>`
          : ''}
      </div>`
    : ''

  // Client branding only — no Danos Aparentes logo/name fallback in the header.
  // Product attribution stays in the certificate footer below.
  const displayCompanyName = (settings?.companyName || '').trim()
  const companyLogo = (settings?.companyLogo || '').trim()
  const logoAlign =
    hf.logoPosition === 'center'
      ? 'margin:0 auto 12px;'
      : hf.logoPosition === 'right'
        ? 'margin:0 0 12px auto;'
        : 'margin-bottom:12px;'
  const logoHtml = companyLogo
    ? `<img src="${companyLogo}" alt="${escapeHtml(displayCompanyName || 'Logo')}" style="max-height:${hf.logoMaxHeight}px;max-width:180px;object-fit:contain;display:block;${logoAlign}border-radius:4px;" />`
    : ''
  const companyNameHtml = displayCompanyName
    ? `<p class="poppins" style="font-size:10px;font-weight:700;color:${companyLogo ? '#94a3b8' : '#ffffff'};letter-spacing:0.05em;font-family:${theme.fontTitle};text-transform:uppercase;margin:0 0 6px;line-height:1.2;">${escapeHtml(displayCompanyName)}</p>`
    : ''

  const year = new Date(ts).getFullYear()
  const protocol =
    settings?.publicCode
      ? `#${settings.publicCode}`
      : `#${osRef.replace(/^OS-?/i, '').toUpperCase()}-${year}/${String(settings?.laudoVersion ?? 1).padStart(2, '0')}-1`

  /** QR + full SHA-256 seal — duplicated on each PDF page for anti-tamper verification. */
  const buildAuthenticitySeal = (pageMark: 'page-1' | 'page-2', opts?: { showDisclaimer?: boolean }) => {
    const showDisclaimer = opts?.showDisclaimer ?? pageMark === 'page-2'
    return `<div class="nobreak pdf-authenticity-seal pdf-authenticity-${pageMark}" style="background:#F8FAFC;border-top:1px solid #E5E7EB;padding:8px 24px 6px;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="vertical-align:middle;padding-right:14px;">
          <div style="border:1px solid #E5E7EB;border-radius:6px;background:#FFFFFF;padding:8px 10px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                ${qrDataUrl ? `<td style="vertical-align:middle;padding-right:12px;width:64px;">
                  <img src="${qrDataUrl}" width="52" height="52" style="display:block;border:1px solid #E5E7EB;border-radius:6px;" />
                </td>` : ''}
                <td style="vertical-align:middle;">
                  <p style="font-size:8px;font-weight:800;color:#0F172A;text-transform:uppercase;letter-spacing:0.07em;margin:0 0 4px;font-family:${theme.fontTitle};">
                    🔒 Certificado de Autenticidade Digital
                  </p>
                  ${qrDataUrl
                    ? `<p style="font-size:7.5px;color:#6B7280;font-family:${theme.fontMain};margin:0 0 3px;">Escaneie o QR Code para atestar a autenticidade online deste laudo.</p>`
                    : `<p style="font-size:8.5px;font-weight:700;color:#111827;text-transform:uppercase;margin:0 0 3px;font-family:${theme.fontTitle};">Integridade do Documento</p>`}
                  <p style="font-size:7.5px;color:#6B7280;font-family:${theme.fontMain};margin:0;">
                    HASH SHA-256:
                    <span style="font-family:'IBM Plex Mono',monospace;font-weight:700;color:#111827;letter-spacing:0.02em;">${hash}</span>
                  </p>
                  ${geoHtml}
                </td>
              </tr>
            </table>
          </div>
        </td>
        <td style="text-align:right;vertical-align:middle;width:38%;">
          <p style="font-size:7.5px;color:#6B7280;font-family:${theme.fontMain};margin:0;">Placa: <strong style="color:#111827;">${escapeHtml(plate)}</strong> · ${escapeHtml(protocol)}</p>
          <p style="font-size:7.5px;color:#6B7280;font-family:${theme.fontMain};margin:2px 0 0;">${damages.length} avaria${damages.length !== 1 ? 's' : ''} · ${date}</p>
          ${hf.customFooterText ? `<p style="font-size:7px;color:#6B7280;margin-top:4px;font-family:${theme.fontMain};">${escapeHtml(hf.customFooterText)}</p>` : ''}
          ${showDisclaimer ? buildPdfDisclaimerHtml('#6B7280', theme.fontMain) : ''}
        </td>
      </tr>
    </table>
  </div>`
  }

  const page1Sections = `
    <!-- 1. IDENTIFICAÇÃO -->
    ${sec.showInfoTable ? `<div class="nobreak" style="margin-bottom:8px;">
      ${sectionTitle('DADOS DO CLIENTE E DO VEÍCULO', theme)}
      ${buildInfoTable(info, theme)}
    </div>` : ''}

    <!-- 1.1 CHECKLIST DE PÁTIO E SEGURANÇA -->
    ${sec.showChecklistSection ? buildChecklistSection(info, theme) : ''}

    <!-- 1.2 LOCALIZAÇÃO (geo + QR compacto) -->
    ${sec.showGeoAuditSection ? buildGeoAuditSection(info, hash, theme, {
      qrDataUrl: hf.showQrCode ? qrDataUrl : '',
      verifyUrl,
    }) : ''}

    <!-- 2. FOTOS DOS 4 LADOS + SVG SÓ COM AVARIA -->
    ${sec.showSvgDiagrams ? buildViewsCombinedSection(info, damages, svgData, theme, galleryCompact) : ''}

    <!-- 3. RESUMO ESTATÍSTICO -->
    ${sec.showSummaryStats ? `<div class="nobreak" style="margin-bottom:5px;">
      ${sectionTitle('RESUMO ESTATÍSTICO DE AVARIAS', theme)}
      ${buildSummary(damages, theme, galleryCompact)}
    </div>` : ''}
  `

  const page2Sections = `
    <!-- 4. DETALHAMENTO -->
    ${sec.showDamageTable ? buildDamageTable(damages, svgData, theme) : ''}

    <!-- 5. GALERIA DE FOTOS -->
    ${sec.showPhotoGallery ? `<div class="section-photo-gallery">${buildPhotoSection(damages, theme, galleryCompact)}</div>` : ''}

    <!-- 5.1 OBSERVAÇÕES DO INTERIOR -->
    ${sec.showInteriorSection ? buildInteriorSection(info, theme, galleryCompact) : ''}

    <!-- 6. ASSINATURAS -->
    ${sec.showSignatures ? buildSignature(info, theme, signatureDate) : ''}
  `

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800;900&family=Lora:ital,wght@0,400..700;1,400..700&family=Outfit:wght@300;400;500;600;700;800;900&family=Poppins:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Inter','Helvetica Neue',Helvetica,Arial,sans-serif; font-size:11px; color:#111827; background:#FFFFFF; -webkit-font-smoothing: antialiased; }
  .nobreak { page-break-inside:avoid; break-inside:avoid; display:block; }
  .pagebreak { page-break-before:always; break-before:page; }
  .part { fill:#bcd4e8 !important; stroke:#4a6080; stroke-width:1; }
  .part.damage-low    { fill:#86EFAC !important; }
  .part.damage-medium { fill:#FCD34D !important; }
  .part.damage-high   { fill:#FCA5A5 !important; }
  @media print {
    .nobreak, .card-wrapper, .damage-table, .stat-box, .svg-cell-wrapper { page-break-inside: avoid; break-inside: avoid; }
  }
  ${effectiveLayoutMode === 'single-page' ? `
    .page-container { font-size:9px !important; }
    .pdf-header { padding: 6px 14px 5px !important; }
    .pdf-header-title { font-size: 14px !important; }
    .pdf-body { padding: 4px 14px 6px !important; }
    .card-wrapper { padding: 6px 8px !important; margin-bottom: 4px !important; }
    .damage-table td { padding: 3px 5px !important; font-size: 7.5px !important; }
    .stat-box { padding: 3px 5px !important; min-width: 44px !important; }
    .stat-box p:first-child { font-size: 12px !important; }
    .sec-title { margin-top: 2px !important; margin-bottom: 2px !important; }
    .sec-title-text { font-size: 7.5px !important; letter-spacing: 0.04em !important; }
    .sec-title-bar { height: 8px !important; }
    .svg-diagram-wrap { max-width: 120px !important; }
    .svg-diagram-wrap.svg-diagram-mini { max-width: 40px !important; }
    .svg-diagram-wrap.svg-diagram-em { max-width: 88px !important; }
    .svg-diagram-wrap svg,
    .svg-diagram-wrap img { max-height: 52px !important; width: auto !important; height: auto !important; max-width: 100% !important; }
    .svg-diagram-wrap.svg-diagram-mini svg,
    .svg-diagram-wrap.svg-diagram-mini img { max-height: 28px !important; }
    .svg-diagram-wrap.svg-diagram-em svg,
    .svg-diagram-wrap.svg-diagram-em img { max-height: 48px !important; }
    .svg-cell-wrapper { border-radius: 5px !important; }
    .section-views-combined img.view-side-photo { max-height: 36px !important; height: 36px !important; }
    .section-views-combined img.view-side-photo-em { max-height: 78px !important; height: 78px !important; }
    .section-photo-gallery { page-break-before: auto !important; break-before: auto !important; }
    img.gallery-thumb { max-height: 52px !important; height: 52px !important; }
    .section-views-combined img.gallery-thumb.view-side-photo { max-height: 36px !important; height: 36px !important; }
    .section-views-combined img.gallery-thumb.view-side-photo-em { max-height: 78px !important; height: 78px !important; }
  ` : ''}
  ${isMultiPage ? `
    .pdf-page-break { page-break-before: always; break-before: page; }
    .section-photo-gallery { page-break-before: auto; break-before: auto; }
    .pdf-body-page-2 { padding-top: 10px; }
  ` : ''}
</style>
</head>
<body class="theme-${pdfTheme} layout-${effectiveLayoutMode}" style="background:${theme.bgMain};">
<div class="page-container theme-${pdfTheme} layout-${effectiveLayoutMode}" style="width:794px;background:${theme.bgMain};color:${theme.textMain};font-family:${theme.fontMain};position:relative;">
  ${settings?.watermark ? `<div style="position:absolute;top:0;left:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;overflow:hidden;pointer-events:none;z-index:999;">
    <span style="font-size:110px;font-weight:900;letter-spacing:0.05em;color:${theme.accentColor};opacity:0.14;transform:rotate(-32deg);white-space:nowrap;font-family:${theme.fontTitle};text-transform:uppercase;">${escapeHtml(settings.watermark)}</span>
  </div>` : ''}

  <!-- ══ CABEÇALHO EXECUTIVO ════════════════════════════════════════════ -->
  <div class="pdf-header nobreak" style="background:${theme.headerBg};padding:14px 24px 12px;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="vertical-align:top;width:58%;">
          ${logoHtml}
          ${companyNameHtml}
          <p class="pdf-header-title" style="font-size:16px;font-weight:800;color:${isEditorial ? '#faf9f5' : '#ffffff'};letter-spacing:0.04em;line-height:1.15;margin:0 0 8px;font-family:${theme.fontTitle};text-transform:uppercase;">${escapeHtml(hf.headerSubtitle)}</p>
          <div class="pdf-header-accent" style="height:2px;width:48px;background:${theme.colorStripe};border-radius:2px;margin-bottom:8px;"></div>
          ${buildStatusBadge(damages, theme)}
        </td>
        <td style="vertical-align:top;text-align:right;padding-left:16px;width:42%;">
          <table cellpadding="0" cellspacing="0" style="margin-left:auto;">
            <tr>
              <td style="vertical-align:top;text-align:right;padding-right:${qrImg ? '12px' : '0'};">
                <div style="display:inline-block;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.14);border-radius:6px;padding:8px 12px;text-align:right;min-width:140px;">
                  <p style="font-size:6.5px;font-weight:700;color:#94a3b8;letter-spacing:0.1em;margin:0 0 3px;text-transform:uppercase;font-family:${theme.fontTitle};">Protocolo</p>
                  <p style="font-size:12px;font-weight:800;color:#ffffff;letter-spacing:0.02em;font-family:'IBM Plex Mono',monospace;line-height:1.2;margin:0;">${escapeHtml(protocol)}</p>
                  ${plate !== '—' ? `<p style="font-size:9px;font-weight:700;color:#CBD5E1;margin:6px 0 0;letter-spacing:0.06em;font-family:${theme.fontTitle};text-transform:uppercase;">${escapeHtml(plate)}</p>` : ''}
                  <p class="pdf-header-date" style="font-size:7.5px;color:#94a3b8;margin:6px 0 0;font-family:${theme.fontMain};">${date}</p>
                </div>
              </td>
              ${qrImg ? `<td style="vertical-align:top;">
                <div style="background:#fff;border-radius:6px;padding:4px;display:inline-block;">
                  ${qrImg}
                </div>
                <p style="font-size:6px;color:#94a3b8;text-align:center;margin:3px 0 0;text-transform:uppercase;letter-spacing:0.06em;font-family:${theme.fontTitle};">Validar</p>
              </td>` : ''}
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>

  <!-- Faixa colorida -->
  <div class="color-stripe" style="height:2px;background:${theme.colorStripe};"></div>

  <!-- ══ CORPO — PÁGINA 1 ═══════════════════════════════════════════════ -->
  <div class="pdf-body pdf-body-page-1" style="padding:9px 24px 10px;">
    ${page1Sections}
  </div>

  ${isMultiPage ? `
  <!-- Selo de autenticidade na folha 1 (QR + hash completos) -->
  ${buildAuthenticitySeal('page-1', { showDisclaimer: false })}
  <div class="pagebreak pdf-page-break"></div>
  ` : ''}

  <!-- ══ CORPO — PÁGINA 2 (ou continuação em 1 folha) ═══════════════════ -->
  <div class="pdf-body ${isMultiPage ? 'pdf-body-page-2' : ''}" style="padding:9px 24px 10px;">
    ${page2Sections}
  </div>

  <!-- ══ RODAPÉ — CERTIFICADO (folha 2 / única) ═════════════════════════ -->
  ${buildAuthenticitySeal('page-2', { showDisclaimer: true })}

  <!-- ══ EXTREMIDADE — hash + branding do cliente (somente se configurado) ══ -->
  <div class="nobreak pdf-footer-extremity" style="border-top:1px solid #E5E7EB;padding:6px 24px 10px;background:#FFFFFF;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="vertical-align:middle;width:52%;">
          <p style="font-size:6px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.06em;margin:0 0 2px;font-family:${theme.fontTitle};">Hash SHA-256</p>
          <p style="font-size:6.5px;font-family:'IBM Plex Mono',monospace;font-weight:700;color:#0F172A;margin:0;word-break:break-all;line-height:1.35;">${hash}</p>
        </td>
        <td style="vertical-align:middle;text-align:right;width:48%;">
          ${(companyLogo || displayCompanyName) ? `
            <table cellpadding="0" cellspacing="0" style="margin-left:auto;">
              <tr>
                ${companyLogo ? `<td style="vertical-align:middle;padding-right:${displayCompanyName ? '8px' : '0'};">
                  <img src="${companyLogo}" alt="${escapeHtml(displayCompanyName || 'Logo')}" style="max-height:${Math.min(hf.logoMaxHeight, 28)}px;max-width:120px;object-fit:contain;display:block;border-radius:3px;" />
                </td>` : ''}
                ${displayCompanyName ? `<td style="vertical-align:middle;text-align:right;">
                  <p style="font-size:8px;font-weight:700;color:#0F172A;margin:0;font-family:${theme.fontTitle};text-transform:uppercase;letter-spacing:0.04em;">${escapeHtml(displayCompanyName)}</p>
                </td>` : ''}
              </tr>
            </table>
          ` : ''}
          <p style="font-size:6px;color:#94a3b8;margin:${(companyLogo || displayCompanyName) ? '4px' : '0'} 0 0;font-family:${theme.fontMain};">Danos Aparentes · vistoria</p>
        </td>
      </tr>
    </table>
  </div>

</div>
</body>
</html>`
  return { html, hash, ts, issuedAt: date, effectiveLayoutMode }
}
