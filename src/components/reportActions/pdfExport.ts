import { Damage, VehicleType, ViewType } from '../../types'
import type { PdfSettings, SvgPdfData } from '../../lib/pdf/types'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { appendAuditEvent } from '../../lib/audit/auditLog'
import {
  DEFAULT_NEW_DISCLOSURE_SCOPE,
  normalizeDisclosureScope,
  type DisclosureScope,
} from '../../lib/verify/disclosureScope'
import { staticVehicleRegistry } from '../vehicles/staticRegistry'
import VehicleDefs from '../vehicles/VehicleDefs'

const ALL_VIEWS: ViewType[] = ['lateral-left', 'lateral-right', 'frontal', 'traseira']

export type QuotaCheck = { allowed: boolean; reason?: string; limit?: number | null; planTier?: string }

export type SectionVisibilityState = {
  showInfoTable: boolean
  showChecklistSection: boolean
  showGeoAuditSection: boolean
  showSvgDiagrams: boolean
  showSummaryStats: boolean
  showDamageTable: boolean
  showPhotoGallery: boolean
  showInteriorSection: boolean
  showSignatures: boolean
  showQrCode: boolean
}

export const DEFAULT_SECTIONS: SectionVisibilityState = {
  showInfoTable: true,
  showChecklistSection: true,
  showGeoAuditSection: true,
  showSvgDiagrams: true,
  showSummaryStats: true,
  showDamageTable: true,
  showPhotoGallery: true,
  showInteriorSection: true,
  showSignatures: true,
  showQrCode: true,
}

export type PdfTheme = 'modern' | 'editorial' | 'tecnico' | 'corporativo' | 'minimalista' | 'vibrante'

export async function blockExportWithoutReview(
  reviewedAt: number | undefined,
  inspectionId: string | null | undefined,
  onToast?: (msg: string) => void,
): Promise<boolean> {
  if (typeof reviewedAt === 'number' && reviewedAt > 0) return true
  void appendAuditEvent({
    event_type: 'issue_blocked_without_review',
    inspection_id: inspectionId || null,
    metadata: { surface: 'report_actions' },
  })
  onToast?.('Conclua a revisão humana antes de gerar o PDF oficial')
  return false
}

/** Fail-open offline: não trava vistoria no pátio se a API de cota falhar. */
export async function checkLaudoQuota(accessToken?: string): Promise<QuotaCheck> {
  if (!accessToken) return { allowed: true }
  try {
    const res = await fetch('/api/report-quota', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    const data = await res.json().catch(() => ({}))
    if (res.ok) return { allowed: true, limit: data.limit, planTier: data.plan_tier }
    if (res.status === 403) {
      return { allowed: false, reason: data.reason, limit: data.limit, planTier: data.plan_tier }
    }
    return { allowed: true }
  } catch {
    return { allowed: true }
  }
}

export function quotaBlockedMessage(check: QuotaCheck): string {
  const planLabel = check.planTier === 'starter' ? 'Starter' : check.planTier === 'pro' ? 'Pro' : 'atual'
  return `❌ Limite de ${check.limit ?? ''} laudos do plano ${planLabel} atingido neste mês. Faça upgrade em /planos para continuar.`
}

export function loadPdfTheme(): PdfTheme {
  if (typeof window === 'undefined') return 'modern'
  return (localStorage.getItem('vistoria_pdf_theme') as PdfTheme) || 'modern'
}

export function persistPdfTheme(theme: PdfTheme) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('vistoria_pdf_theme', theme)
  }
}

export function loadSectionsConfig(): SectionVisibilityState {
  if (typeof window === 'undefined') return DEFAULT_SECTIONS
  const saved = localStorage.getItem('pdf_sections_config')
  if (!saved) return DEFAULT_SECTIONS
  try {
    return { ...DEFAULT_SECTIONS, ...JSON.parse(saved) }
  } catch {
    return DEFAULT_SECTIONS
  }
}

export function persistSectionsConfig(config: SectionVisibilityState) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('pdf_sections_config', JSON.stringify(config))
  }
}

const DISCLOSURE_STORAGE_KEY = 'pdf_disclosure_scope'

export function loadDisclosureScope(): DisclosureScope {
  if (typeof window === 'undefined') return DEFAULT_NEW_DISCLOSURE_SCOPE
  return normalizeDisclosureScope(localStorage.getItem(DISCLOSURE_STORAGE_KEY), {
    forNewIssue: true,
  })
}

export function persistDisclosureScope(scope: DisclosureScope) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(DISCLOSURE_STORAGE_KEY, scope)
  }
}

export type ResolvedExportMeta = {
  inspectionId?: string
  publicCode?: string
  laudoVersion?: number
  correctionReason?: string
  supersedesHash?: string
  inspectionPurpose?: 'entrada' | 'retorno'
}

export function resolvePdfSettings(
  hasAccess: boolean | undefined,
  pdfTheme: PdfTheme,
  sectionsConfig: SectionVisibilityState,
  meta: ResolvedExportMeta,
): PdfSettings & Record<string, unknown> {
  const companyName = hasAccess ? (localStorage.getItem('company_name') || '') : ''
  const companyLogo = hasAccess ? (localStorage.getItem('company_logo') || '') : ''
  const companyColor = localStorage.getItem('company_color') || undefined
  const logoPosition = (localStorage.getItem('company_logo_position') as 'left' | 'center' | 'right') || 'left'
  const logoHeight = Number(localStorage.getItem('company_logo_height')) || 42
  const layoutMode = (localStorage.getItem('company_layout_mode') as 'auto' | 'single-page' | 'multi-page') || 'multi-page'
  const customFooterText = localStorage.getItem('company_custom_footer_text') || undefined
  const customColors = companyColor ? { accentColor: companyColor } : undefined

  const sectionVisibility = {
    showInfoTable: sectionsConfig.showInfoTable,
    showChecklistSection: sectionsConfig.showChecklistSection,
    showGeoAuditSection: sectionsConfig.showGeoAuditSection,
    showSvgDiagrams: sectionsConfig.showSvgDiagrams,
    showSummaryStats: sectionsConfig.showSummaryStats,
    showDamageTable: sectionsConfig.showDamageTable,
    showPhotoGallery: sectionsConfig.showPhotoGallery,
    showInteriorSection: sectionsConfig.showInteriorSection,
    showSignatures: sectionsConfig.showSignatures,
    qrCode: sectionsConfig.showQrCode,
    vehicleInfo: sectionsConfig.showInfoTable,
    svgMaps: sectionsConfig.showSvgDiagrams,
    summary: sectionsConfig.showSummaryStats,
    damageTable: sectionsConfig.showDamageTable,
    photos: sectionsConfig.showPhotoGallery,
    interior: sectionsConfig.showInteriorSection,
    signatures: sectionsConfig.showSignatures,
  }

  const headerFooterConfig = {
    companyLogoAlignment: logoPosition,
    companyLogoMaxHeight: logoHeight,
    logoPosition,
    logoMaxHeight: logoHeight,
    showQrCode: sectionsConfig.showQrCode,
    customFooterText,
  }

  return {
    companyName,
    companyLogo,
    pdfTheme,
    layoutMode,
    customColors,
    customAccentColor: companyColor,
    brandColor: companyColor,
    headerFooterConfig,
    headerFooter: headerFooterConfig,
    logoSettings: { position: logoPosition, height: logoHeight },
    sectionVisibility,
    sections: sectionVisibility,
    inspectionId: meta.inspectionId,
    publicCode: meta.publicCode,
    laudoVersion: meta.laudoVersion,
    correctionReason: meta.correctionReason,
    supersedesHash: meta.supersedesHash,
    inspectionPurpose: meta.inspectionPurpose,
    disclosureScope: loadDisclosureScope(),
  }
}

export async function captureSvgs(vehicleType: VehicleType, damages: Damage[]): Promise<SvgPdfData> {
  try {
    const defsHtml = renderToStaticMarkup(createElement(VehicleDefs))
    const startIdx = defsHtml.indexOf('<defs>')
    const endIdx = defsHtml.lastIndexOf('</defs>') + '</defs>'.length
    const defsInner = startIdx >= 0 ? defsHtml.slice(startIdx, endIdx) : ''

    const svgCaptures: Record<string, string> = {}
    const vehicleDamages = damages.filter(d => d.vehicle === vehicleType)

    for (const view of ALL_VIEWS) {
      const viewDamages = vehicleDamages.filter(d => d.view === view)
      const Comp = staticVehicleRegistry[vehicleType]?.[view]
      if (!Comp) continue

      const rawSvg = renderToStaticMarkup(
        createElement(Comp, {
          damages: viewDamages,
          selectedPartId: null,
          onPartClick: () => {},
          onPartHover: () => {},
        }),
      )
      svgCaptures[view] = rawSvg.replace(/(<svg[^>]*>)/, `$1${defsInner}`)
    }

    return { svgCaptures }
  } catch (e) {
    console.error('captureSvgs failed:', e)
    return { svgCaptures: {} }
  }
}
