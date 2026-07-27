/**
 * FASE 15 — PDF footer / integrity copy (no legal-validity claims).
 */

export const PDF_INTEGRITY_FOOTER_LINES = [
  'Hash SHA-256 e QR Code permitem conferir se o conteúdo registrado foi alterado após a emissão (verificação técnica em danosaparentes.com.br/verify).',
  'Não constitui validade jurídica garantida, certificação digital ICP-Brasil nem perícia oficial.',
  'Assinaturas exibidas são capturadas em tela no dispositivo — não equivalem a certificado qualificado.',
] as const

export const PDF_SIGNATURE_CAPTION =
  'Assinatura capturada em tela (não certificado digital qualificado).'

export function buildPdfDisclaimerHtml(textMuted: string, fontMain: string): string {
  return PDF_INTEGRITY_FOOTER_LINES.map(
    (line) =>
      `<p style="font-size:6.5px;color:${textMuted};font-family:${fontMain};line-height:1.35;margin-top:2px;">${line}</p>`,
  ).join('')
}
