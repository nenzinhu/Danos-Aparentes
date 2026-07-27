export interface SvgPdfData {
  svgCaptures: Record<string, string>
}

export interface PdfSettings {
  companyName?: string
  companyLogo?: string
  pdfTheme?: 'modern' | 'editorial' | 'tecnico' | 'corporativo' | 'minimalista' | 'vibrante'
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
}
