export interface SvgPdfData {
  svgCaptures: Record<string, string>
}

export interface PdfSettings {
  companyName?: string
  companyLogo?: string
  pdfTheme?: 'modern' | 'editorial' | 'tecnico' | 'corporativo' | 'minimalista' | 'vibrante'
}
