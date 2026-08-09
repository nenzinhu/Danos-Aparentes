export type { SvgPdfData, PdfSettings } from './pdf/types'
export { buildBadgeSnippet, revokeObjectUrlLater, resolvePdfRuntimeProfile, yieldToMainThread } from './pdf/render'
/** Prefere servidor; cai no client se offline/503. */
export { generatePdf, generatePdfBlob } from './pdf/clientOrchestrator'
export type { PdfAccessOpts } from './pdf/clientOrchestrator'
/** Render 100% no browser — usado por testes e forceClient. */
export {
  generatePdf as generatePdfClient,
  generatePdfBlob as generatePdfBlobClient,
} from './pdf/render'
