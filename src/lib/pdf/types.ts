export interface SvgPdfData {
  svgCaptures: Record<string, string>
}

export interface PdfSettings {
  companyName?: string
  companyLogo?: string
  pdfTheme?: 'modern' | 'editorial' | 'tecnico' | 'corporativo' | 'minimalista' | 'vibrante'
  /** Marca d'água diagonal sobre o PDF (ex: "AMOSTRA"), usada no laudo de demonstração pública. */
  watermark?: string
}
