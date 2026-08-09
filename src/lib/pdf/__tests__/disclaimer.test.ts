import { describe, expect, it } from 'vitest'
import {
  buildPdfDisclaimerHtml,
  PDF_INTEGRITY_FOOTER_LINES,
  PDF_SIGNATURE_CAPTION,
} from '../disclaimer'

describe('pdf disclaimer copy', () => {
  it('states no guaranteed legal validity in disclaimer copy', () => {
    const joined = PDF_INTEGRITY_FOOTER_LINES.join(' ').toLowerCase()
    expect(joined).toMatch(/não constitui validade jurídica garantida/)
    expect(joined).toMatch(/certificação digital/)
  })

  it('clarifies on-screen signatures', () => {
    expect(PDF_SIGNATURE_CAPTION.toLowerCase()).toMatch(/não certificado digital qualificado/)
  })

  it('renders footer html lines', () => {
    const html = buildPdfDisclaimerHtml('#999', 'Outfit')
    expect(html).toContain('danosaparentes.com.br/verify')
    expect(html).toContain('Outfit')
  })
})
