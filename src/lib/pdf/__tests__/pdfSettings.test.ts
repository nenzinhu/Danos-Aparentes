import { describe, expect, it } from 'vitest'
import { buildFullHtml, resolveEffectiveLayoutMode } from '../html'
import type { Damage, VehicleInfo } from '../../../types'

function makeVehicleInfo(overrides: Partial<VehicleInfo> = {}): VehicleInfo {
  return {
    owner: 'João Silva',
    phone: '(11) 99999-8888',
    brand: 'Toyota Corolla',
    plate: 'ABC-1234' as any,
    generalNotes: 'Vistoria presencial',
    interiorNotes: 'Bancos em couro',
    interiorPhotos: [],
    interiorPhotoNotes: [],
    profile: 'oficina',
    ref: 'OS-1001',
    color: 'Prata',
    vehicleTypeDesc: 'Automóvel Passeio',
    city: 'São Paulo',
    state: 'SP',
    ...overrides,
  }
}

function makeDamage(): Damage {
  return {
    id: 'dmg-1' as any,
    vehicle: 'car',
    view: 'frontal',
    partId: 'hood',
    partName: 'Capô',
    type: 'scratch',
    typeName: 'Risco Superficial',
    severity: 'low',
    notes: 'Risco no lado esquerdo',
    photos: ['data:image/png;base64,AAA'],
    photoNotes: ['Foto capô'],
  }
}

describe('PdfSettings — Customization & Layout Modes (M1 & M2)', () => {
  it('applies customThemeColors override to the generated document', async () => {
    const { html } = await buildFullHtml(makeVehicleInfo(), [makeDamage()], undefined, {
      pdfTheme: 'modern',
      customColors: {
        accentColor: '#ff0055',
        headerBg: '#112233',
        colorStripe: '#00ffcc',
      },
    })
    expect(html).toContain('#ff0055')
    expect(html).toContain('#112233')
    expect(html).toContain('#00ffcc')
  })

  it('respects section visibility toggles when disabled', async () => {
    const { html } = await buildFullHtml(makeVehicleInfo(), [makeDamage()], undefined, {
      sections: {
        showInfoTable: false,
        showSummaryStats: false,
        showSignatures: false,
      },
    })
    expect(html).not.toContain('IDENTIFICAÇÃO DO VEÍCULO E PROPRIETÁRIO')
    expect(html).not.toContain('RESUMO ESTATÍSTICO DE AVARIAS')
    expect(html).not.toContain('Assinatura do Vistoriador')
  })

  it('customizes header subtitle, logo max height, and custom footer text', async () => {
    const { html } = await buildFullHtml(makeVehicleInfo(), [makeDamage()], undefined, {
      companyLogo: 'data:image/png;base64,LOGO',
      headerFooter: {
        headerSubtitle: 'LAUDO CAUTELAR ESPECIAL',
        logoMaxHeight: 60,
        logoPosition: 'center',
        customFooterText: 'Documento registrado para fins de seguro.',
      },
    })
    expect(html).toContain('LAUDO CAUTELAR ESPECIAL')
    expect(html).toContain('max-height:60px')
    expect(html).toContain('margin:0 auto 12px;')
    expect(html).toContain('Documento registrado para fins de seguro.')
  })

  it('never renders a QR code image (verification is via Assinafy link)', async () => {
    const { html } = await buildFullHtml(makeVehicleInfo(), [makeDamage()], undefined, {
      headerFooter: { showGpsLocation: true },
    })
    expect(html).toContain('Integridade do Documento')
    expect(html).not.toContain('Escaneie o QR Code para atestar')
    expect(html).not.toContain('<img src="data:image/png;base64,iVBOR')
  })

  it('aligns logo to the right when logoPosition is right', async () => {
    const { html } = await buildFullHtml(makeVehicleInfo(), [makeDamage()], undefined, {
      companyLogo: 'data:image/png;base64,LOGO',
      headerFooter: {
        logoPosition: 'right',
      },
    })
    expect(html).toContain('margin:0 0 12px auto;')
  })

  it('respects showDamageTable, showPhotoGallery, and showInteriorSection toggles', async () => {
    const { html } = await buildFullHtml(makeVehicleInfo({ interiorNotes: 'Bancos em couro' }), [makeDamage()], undefined, {
      sections: {
        showDamageTable: false,
        showPhotoGallery: false,
        showInteriorSection: false,
      },
    })
    expect(html).not.toContain('DETALHAMENTO TÉCNICO DAS AVARIAS')
    expect(html).not.toContain('GALERIA FOTOGRÁFICA')
    expect(html).not.toContain('FOTOS DAS AVARIAS')
    expect(html).not.toContain('VISTORIA INTERIOR & ACESSÓRIOS')
  })

  it('escapes HTML special characters in custom footer text', async () => {
    const { html } = await buildFullHtml(makeVehicleInfo(), [makeDamage()], undefined, {
      headerFooter: {
        customFooterText: 'Empresa <Segura> & Cia "Ltda"',
      },
    })
    expect(html).toContain('Empresa &lt;Segura&gt; &amp; Cia &quot;Ltda&quot;')
  })

  it('applies single-page compact layout rules when layoutMode is single-page', async () => {
    const { html } = await buildFullHtml(makeVehicleInfo(), [makeDamage()], undefined, {
      layoutMode: 'single-page',
    })
    expect(html).toContain('layout-single-page')
    expect(html).toContain('.page-container { font-size:9px !important; }')
    expect(html).toContain('.svg-diagram-wrap { max-width: 120px !important; }')
    expect(html).toContain('.pdf-body { padding: 4px 14px 6px !important; }')
  })

  it('applies multi-page pagebreak rules when layoutMode is multi-page', async () => {
    const { html } = await buildFullHtml(makeVehicleInfo(), [makeDamage()], undefined, {
      layoutMode: 'multi-page',
    })
    expect(html).toContain('layout-multi-page')
    expect(html).toContain('.pdf-page-break { page-break-before: always;')
    expect(html).toContain('pdf-page-break')
    expect(html).toContain('pdf-authenticity-page-1')
    expect(html).toContain('pdf-authenticity-page-2')
  })

  it('resolves auto and undefined to multi-page; only explicit single-page stays single', async () => {
    expect(resolveEffectiveLayoutMode('auto', 2, 1)).toBe('multi-page')
    expect(resolveEffectiveLayoutMode('auto', 8, 1)).toBe('multi-page')
    expect(resolveEffectiveLayoutMode('auto', 2, 4)).toBe('multi-page')
    expect(resolveEffectiveLayoutMode(undefined, 20, 20)).toBe('multi-page')
    expect(resolveEffectiveLayoutMode('single-page', 10, 10)).toBe('single-page')
    expect(resolveEffectiveLayoutMode('multi-page', 1, 1)).toBe('multi-page')

    const manyPhotosDamages = Array.from({ length: 4 }, (_, i) => ({
      ...makeDamage(),
      id: `dmg-${i}` as any,
    }))

    const { effectiveLayoutMode } = await buildFullHtml(makeVehicleInfo(), manyPhotosDamages, undefined, {
      layoutMode: 'auto',
    })
    expect(effectiveLayoutMode).toBe('multi-page')
  })

  it('defaults to multi-page with QR+hash authenticity seal on both pages', async () => {
    const { html, hash, effectiveLayoutMode } = await buildFullHtml(makeVehicleInfo(), [makeDamage()])
    expect(effectiveLayoutMode).toBe('multi-page')
    expect(html).toContain('pdf-authenticity-page-1')
    expect(html).toContain('pdf-authenticity-page-2')
    const sealCount = (html.match(/pdf-authenticity-seal/g) || []).length
    expect(sealCount).toBe(2)
    const hashOccurrences = (html.match(new RegExp(hash, 'g')) || []).length
    // Seals (×2) + footer extremity (+ geo short-hash is abbreviated, not full)
    expect(hashOccurrences).toBeGreaterThanOrEqual(2)
    // O hash aparece em texto no selo de autenticidade (sem QR Code).
    expect(html).toContain(hash)
  })

  it('keeps a single authenticity seal when layoutMode is single-page', async () => {
    const { html } = await buildFullHtml(makeVehicleInfo(), [makeDamage()], undefined, {
      layoutMode: 'single-page',
    })
    expect(html).not.toContain('pdf-authenticity-page-1')
    expect(html).toContain('pdf-authenticity-page-2')
    expect(html).not.toContain('pdf-page-break')
    expect((html.match(/pdf-authenticity-seal/g) || []).length).toBe(1)
  })

  it('renders checklist de patio & seguranca when present and showChecklistSection is true', async () => {
    const infoWithChecklist = makeVehicleInfo({
      checklist: {
        tires: 'Bons (OK)',
        fuelLevel: '3/4',
        windshield: 'Sem trincas (OK)',
        jackAndWrench: 'Presente',
      },
    })
    const { html } = await buildFullHtml(infoWithChecklist, [makeDamage()], undefined, {
      sections: { showChecklistSection: true },
    })
    expect(html).toContain('CHECKLIST DE SEGURANÇA E ITENS OBRIGATÓRIOS')
    expect(html).toContain('Pneus')
    expect(html).toContain('Bons (OK)')
    expect(html).toContain('3/4')

    const { html: disabledHtml } = await buildFullHtml(infoWithChecklist, [makeDamage()], undefined, {
      sections: { showChecklistSection: false },
    })
    expect(disabledHtml).not.toContain('CHECKLIST DE SEGURANÇA E ITENS OBRIGATÓRIOS')
  })

  it('renders compact LOCALIZAÇÃO card when geo present (UF/cidade, horário, GPS abreviado — sem endereço completo)', async () => {
    const infoWithGeo = makeVehicleInfo({
      city: 'São Paulo',
      state: 'SP',
      geo: {
        lat: -23.55052,
        lng: -46.633308,
        accuracy: 4,
        address: 'Av. Paulista, São Paulo - SP',
        capturedAt: 1700000000000,
      },
    })
    const { html } = await buildFullHtml(infoWithGeo, [makeDamage()], undefined, {
      sections: { showGeoAuditSection: true },
    })
    expect(html).toContain('LOCALIZAÇÃO')
    expect(html).toContain('-23.5505')
    expect(html).toContain('-46.6333')
    expect(html).toContain('SP · São Paulo')
    expect(html).not.toContain('Av. Paulista, São Paulo - SP')
    expect(html).not.toContain('Endereço Registrado')
    // 6-decimal full street-style stamp removed
    expect(html).not.toContain('-23.550520')

    const { html: disabledHtml } = await buildFullHtml(infoWithGeo, [makeDamage()], undefined, {
      sections: { showGeoAuditSection: false },
    })
    expect(disabledHtml).not.toContain('>LOCALIZAÇÃO<')
  })
})
