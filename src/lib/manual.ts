import { MANUAL_STEPS, ManualStep } from './manualContent'
import { manualIconSvg } from './manualIcons'

async function getHtml2Pdf() {
  const mod = await import('html2pdf.js')
  return ((mod as any).default ?? mod) as any
}

const BRAND = '#0ea5e9'
const BRAND_DARK = '#0369a1'
const INK = '#0f172a'
const MUTED = '#64748b'
const LINE = '#e2e8f0'
const SOFT = '#f8fafc'

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function highlightHtml(h: { icon: string; label: string; text: string }): string {
  return `
    <div class="nobreak highlight-card" style="display:flex;gap:10px;align-items:flex-start;padding:10px 12px;margin-bottom:8px;background:#fff;border:1px solid ${LINE};border-radius:10px;border-left:3px solid ${BRAND};">
      <div style="width:28px;height:28px;border-radius:8px;background:${SOFT};display:flex;align-items:center;justify-content:center;flex-shrink:0;">${manualIconSvg(h.icon, 15, BRAND_DARK)}</div>
      <div style="flex:1;min-width:0;">
        <div style="font-size:10.5px;font-weight:800;color:${INK};margin-bottom:3px;letter-spacing:0.01em;">${esc(h.label)}</div>
        <div style="font-size:10px;color:${MUTED};line-height:1.5;">${esc(h.text)}</div>
      </div>
    </div>`
}

function stepImageHtml(step: ManualStep, baseUrl: string): string {
  if (step.images?.length) {
    const imgs = step.images
      .map(
        (i) =>
          `<img src="${baseUrl}${i.src}" alt="${esc(i.alt)}" style="height:52px;width:auto;margin:0 6px;object-fit:contain;" />`,
      )
      .join('')
    return `<div class="nobreak" style="text-align:center;margin-bottom:10px;padding:10px;background:${SOFT};border-radius:10px;border:1px solid ${LINE};">${imgs}</div>`
  }
  if (step.image) {
    return `<div class="nobreak" style="text-align:center;margin-bottom:10px;padding:8px;background:${SOFT};border-radius:10px;border:1px solid ${LINE};">
      <img src="${baseUrl}${step.image}" alt="${esc(step.imageAlt ?? step.title)}" style="max-width:100%;max-height:130px;object-fit:contain;border-radius:8px;" />
    </div>`
  }
  return ''
}

function stepHtml(step: ManualStep, isLast: boolean, baseUrl: string): string {
  const items = step.highlights.map(highlightHtml).join('')
  const visual = stepImageHtml(step, baseUrl)
  return `
    <div class="step nobreak" style="margin:0 0 ${isLast ? '12' : '20'}px;padding:0;page-break-inside:avoid;">
      <div style="display:flex;align-items:stretch;gap:0;border:1px solid ${LINE};border-radius:14px;overflow:hidden;background:#fff;box-shadow:0 1px 3px rgba(15,23,42,0.06);">
        <div style="width:5px;background:linear-gradient(180deg,${BRAND},${BRAND_DARK});flex-shrink:0;"></div>
        <div style="flex:1;padding:14px 16px 12px;">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
            <span style="display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:10px;background:linear-gradient(135deg,${BRAND},${BRAND_DARK});color:#fff;font-weight:900;font-size:13px;box-shadow:0 2px 8px rgba(14,165,233,0.35);">${step.num}</span>
            <div style="flex:1;min-width:0;">
              <div style="font-size:14px;font-weight:900;color:${INK};letter-spacing:-0.02em;line-height:1.2;">${esc(step.title)}</div>
              <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:${BRAND_DARK};margin-top:3px;">${esc(step.subtitle)}</div>
            </div>
          </div>
          <div style="font-size:10.5px;color:${MUTED};line-height:1.55;margin-bottom:10px;padding:8px 10px;background:${SOFT};border-radius:8px;border:1px solid ${LINE};">${esc(step.desc)}</div>
          ${visual}
          <div>${items}</div>
        </div>
      </div>
    </div>`
}

function buildManualHtml(baseUrl: string): string {
  const steps = MANUAL_STEPS.map((s, i) => stepHtml(s, i === MANUAL_STEPS.length - 1, baseUrl)).join('')
  const toc = MANUAL_STEPS.map(s => `
    <tr>
      <td style="width:28px;font-weight:900;color:${BRAND};font-size:11px;padding:5px 0;">${String(s.num).padStart(2, '0')}</td>
      <td style="font-size:10.5px;color:${INK};font-weight:700;padding:5px 0;">${esc(s.title)}</td>
      <td style="font-size:9.5px;color:${MUTED};padding:5px 0 5px 8px;">${esc(s.subtitle)}</td>
    </tr>`).join('')

  return `
  <div style="font-family:'Outfit',Arial,Helvetica,sans-serif;color:${INK};width:190mm;padding:2mm 3mm;">
    <div style="border-radius:16px;overflow:hidden;margin-bottom:18px;border:1px solid ${LINE};">
      <div style="background:linear-gradient(135deg,${BRAND_DARK} 0%,${BRAND} 55%,#38bdf8 100%);padding:22px 20px 18px;text-align:center;color:#fff;">
        <div style="font-size:9px;font-weight:800;letter-spacing:0.2em;text-transform:uppercase;opacity:0.9;margin-bottom:6px;">Vistoria Digital de Avarias</div>
        <div style="font-size:26px;font-weight:900;letter-spacing:-0.03em;line-height:1.1;">Danos Aparentes</div>
        <div style="font-size:12px;font-weight:700;margin-top:6px;opacity:0.95;">Manual do Usuário — Passo a Passo</div>
      </div>
      <div style="padding:12px 16px;background:${SOFT};border-top:1px solid ${LINE};font-size:10px;color:${MUTED};line-height:1.5;text-align:center;">
        Guia visual para fazer uma vistoria completa: dados do veículo, marcação de danos, fotos, assinaturas e laudo em PDF.
      </div>
    </div>

    <div style="margin-bottom:18px;padding:12px 14px;border:1px solid ${LINE};border-radius:12px;background:#fff;">
      <div style="font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:0.1em;color:${BRAND_DARK};margin-bottom:8px;">Índice rápido</div>
      <table style="width:100%;border-collapse:collapse;">${toc}</table>
    </div>

    <div style="font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:0.1em;color:${BRAND_DARK};margin:0 0 10px 2px;">Conteúdo</div>
    ${steps}

    <div style="margin-top:16px;padding:14px 16px;border-radius:12px;background:linear-gradient(135deg,#ecfdf5,#f0f9ff);border:1px solid #bae6fd;">
      <div style="font-size:11px;font-weight:900;color:${INK};margin-bottom:6px;">💡 Dica</div>
      <div style="font-size:10px;color:${MUTED};line-height:1.55;">
        Dentro do app, toque em <strong style="color:${INK};">💡 Tutorial</strong> para rever estes passos com ilustrações interativas. O manual em PDF é sempre o mesmo conteúdo, pronto para imprimir ou compartilhar com a equipe.
      </div>
    </div>

    <div style="margin-top:14px;padding-top:10px;border-top:1px solid ${LINE};text-align:center;font-size:9px;color:${MUTED};line-height:1.5;">
      © Danos Aparentes — danosaparentes.com.br<br/>
      Suporte: suporte@danosaparentes.com.br
    </div>
  </div>`
}

const MANUAL_OPTS = {
  margin: [8, 6, 10, 6] as [number, number, number, number],
  filename: 'Manual-Danos-Aparentes.pdf',
  image: { type: 'jpeg', quality: 0.98 },
  html2canvas: { scale: 2, backgroundColor: '#ffffff', useCORS: true, logging: false },
  jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
  pagebreak: { mode: ['css', 'legacy'], avoid: ['.step', '.nobreak', '.highlight-card'] },
}

export async function generateManualPdf(): Promise<void> {
  if (typeof window !== 'undefined' && (window as any).document?.fonts?.ready) {
    await (window as any).document.fonts.ready
  }
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const html2pdf = await getHtml2Pdf()
  await html2pdf().set(MANUAL_OPTS).from(buildManualHtml(baseUrl)).save()
}
