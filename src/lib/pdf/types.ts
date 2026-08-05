export interface SvgPdfData {
  svgCaptures: Record<string, string>
}

export interface CustomThemeColors {
  accentColor?: string
  headerBg?: string
  colorStripe?: string
}

export interface PdfSectionVisibility {
  showInfoTable?: boolean
  showChecklistSection?: boolean
  showGeoAuditSection?: boolean
  showSvgDiagrams?: boolean
  showSummaryStats?: boolean
  showDamageTable?: boolean
  showPhotoGallery?: boolean
  showInteriorSection?: boolean
  showSignatures?: boolean
}

export interface PdfHeaderFooterConfig {
  logoPosition?: 'left' | 'center' | 'right'
  logoMaxHeight?: number
  headerSubtitle?: string
  showQrCode?: boolean
  showGpsLocation?: boolean
  customFooterText?: string
}

export interface PdfSettings {
  companyName?: string
  companyLogo?: string
  pdfTheme?: 'modern' | 'editorial' | 'tecnico' | 'corporativo' | 'minimalista' | 'vibrante'
  customColors?: CustomThemeColors
  sections?: PdfSectionVisibility
  headerFooter?: PdfHeaderFooterConfig
  layoutMode?: 'single-page' | 'multi-page' | 'auto'
  /** Marca d'água diagonal sobre o PDF (ex: "AMOSTRA"), usada no laudo de demonstração pública. */
  watermark?: string
  /**
   * Reprint of an already-issued laudo: build PDF/QR but do not insert a new
   * report_hashes row (avoids bumping report_key version on mere re-download).
   */
  skipHashRegister?: boolean
  /** vehicle_inspections / SavedReport id — marks issued after registerHash. */
  inspectionId?: string
  correctionReason?: string
  supersedesHash?: string
  publicCode?: string
  laudoVersion?: number
  /** Entrada ou retorno — altera subtítulo padrão do PDF. */
  inspectionPurpose?: 'entrada' | 'retorno'
}
