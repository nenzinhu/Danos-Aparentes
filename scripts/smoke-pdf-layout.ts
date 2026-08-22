/**
 * Smoke checks for the executive PDF layout refactor (no vitest/rolldown).
 * Usage: npx --yes tsx scripts/smoke-pdf-layout.ts
 */
import { buildDamageTable, buildInfoTable, buildPhotoSection, buildSummary } from '../src/lib/pdf/sections'
import { resolveTheme, SEV_BG, SEV_COLOR, SEV_KPI_BG } from '../src/lib/pdf/theme'
import { buildFullHtml } from '../src/lib/pdf/html'
import type { Damage, DamageId, VehicleInfo } from '../src/types'

const theme = resolveTheme('modern')

function assert(cond: unknown, msg: string) {
  if (!cond) throw new Error(`FAIL: ${msg}`)
  console.log(`OK  ${msg}`)
}

const damage = (overrides: Partial<Damage> = {}): Damage => ({
  id: 'd1' as DamageId,
  vehicle: 'car',
  view: 'frontal',
  partId: 'bumper-front',
  partName: 'Para-choque dianteiro',
  type: 'scratch',
  typeName: 'Arranhão',
  severity: 'low',
  notes: '',
  photos: [],
  photoNotes: [],
  ...overrides,
})

const info = (overrides: Partial<VehicleInfo> = {}): VehicleInfo => ({
  owner: 'Maria Silva',
  phone: '11999999999',
  brand: 'Fiat Uno',
  plate: 'ABC1D23' as VehicleInfo['plate'],
  generalNotes: '',
  interiorNotes: '',
  interiorPhotos: [],
  interiorPhotoNotes: [],
  profile: 'oficina',
  ref: 'OS-000123',
  color: 'Branco',
  vehicleTypeDesc: 'Hatch',
  city: 'São Paulo',
  state: 'SP',
  cpf: '123.456.789-00',
  ...overrides,
})

assert(theme.textMain === '#111827', 'modern textMain is executive graphite')
assert(theme.borderColor === '#E5E7EB', 'modern border is SaaS gray')
assert(SEV_BG.high === '#FEE2E2' && SEV_COLOR.high === '#991B1B', 'grave badge tokens')
assert(SEV_KPI_BG.low === '#DEF7EC', 'leve KPI fill')

const summary = buildSummary([
  damage({ severity: 'low' }),
  damage({ severity: 'low' }),
  damage({ severity: 'medium' }),
  damage({ severity: 'high' }),
], theme)
const numbers = [...summary.matchAll(/font-weight:800;color:[^;]+;line-height:1;margin:0;font-family:[^"]+">(\d+)</g)].map(m => m[1])
assert(JSON.stringify(numbers) === JSON.stringify(['2', '1', '1', '4']), 'KPI counts low/med/high/total')
assert(summary.includes('Total de Avarias'), 'KPI total label')
assert(summary.includes('#DEF7EC') && summary.includes('#FDE8E8'), 'KPI severity fills')

const cards = buildInfoTable(info(), theme)
assert(cards.includes('Proprietário') && cards.includes('Veículo'), 'dual cards')
assert(cards.includes('Maria Silva') && cards.includes('ABC1D23'), 'owner/plate values')
assert(cards.includes('border-radius:6px') && cards.includes('#E5E7EB'), 'card chrome')

const table = buildDamageTable([damage({ notes: '' }), damage({ partName: 'Capô', severity: 'high' })], undefined, theme)
assert(table.includes('DETALHAMENTO TÉCNICO DAS AVARIAS'), 'damage section title')
assert(table.includes('Observações / Diagnóstico'), 'diagnosis column')
assert(table.includes('GRAVE') || table.includes('Grave'), 'severity badge')
assert(table.includes('>—<'), 'empty notes em-dash')

const gallery = buildPhotoSection([damage({ photos: ['blob:1'], severity: 'high', partName: 'Porta', typeName: 'Amassado' })], theme)
assert(gallery.includes('GALERIA FOTOGRÁFICA'), 'gallery title')
assert(gallery.includes('[🔴 GRAVE]') || gallery.includes('GRAVE'), 'photo severity tag')

const { html } = await buildFullHtml(info(), [damage()], undefined, {
  companyName: 'Oficina Central',
  headerFooter: { showQrCode: false, customFooterText: 'Doc seguro' },
})
assert(html.includes('Oficina Central'), 'company name in header')
assert(html.includes('RELATÓRIO DE VISTORIA VEICULAR'), 'doc title')
assert(html.includes('Certificado de Autenticidade Digital'), 'security footer')
assert(html.includes('Integridade do Documento'), 'no-QR integrity label')
assert(html.includes('Doc seguro'), 'custom footer')
assert(html.includes('IDENTIFICAÇÃO DO VEÍCULO E PROPRIETÁRIO'), 'info section title')
assert(html.includes('layout-multi-page'), 'default layout is multi-page')
assert(html.includes('pdf-authenticity-page-1'), 'authenticity seal on page 1')
assert(html.includes('pdf-authenticity-page-2'), 'authenticity seal on page 2')
assert(html.includes('pdf-page-break'), 'explicit page break between sheets')

const { html: singlePageHtml } = await buildFullHtml(info(), [damage()], undefined, {
  layoutMode: 'single-page',
  headerFooter: { showQrCode: false },
})
assert(singlePageHtml.includes('layout-single-page'), 'explicit single-page layout')
assert(!singlePageHtml.includes('pdf-authenticity-page-1'), 'no page-1 seal in single-page mode')
assert(singlePageHtml.includes('pdf-authenticity-page-2'), 'single authenticity seal remains')

const { html: withLogo } = await buildFullHtml(info(), [], undefined, {
  companyLogo: 'data:image/png;base64,ZZZ',
  headerFooter: { logoPosition: 'center', logoMaxHeight: 60 },
})
assert(withLogo.includes('data:image/png;base64,ZZZ'), 'custom logo')
assert(withLogo.includes('max-height:60px'), 'logo max height')
assert(withLogo.includes('max-width:180px'), 'logo max width')
assert(withLogo.includes('margin:0 auto 12px;'), 'centered logo margin')

console.log('\nAll PDF layout smoke checks passed.')
