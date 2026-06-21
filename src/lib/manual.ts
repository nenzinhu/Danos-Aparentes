import { MANUAL_STEPS, ManualStep } from './manualContent'

// Mesmo carregador usado em pdf.ts
async function getHtml2Pdf() {
  const mod = await import('html2pdf.js')
  return ((mod as any).default ?? mod) as any
}

const BRAND = '#0088cc'
const INK = '#0f172a'
const MUTED = '#475569'

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function stepHtml(step: ManualStep): string {
  const items = step.highlights.map(h => `
    <tr class="nobreak">
      <td style="width:26px;vertical-align:top;font-size:14px;line-height:1.4;padding:4px 8px 4px 0;">${h.icon}</td>
      <td style="vertical-align:top;padding:4px 0;">
        <span style="font-weight:700;color:${INK};">${esc(h.label)}:</span>
        <span style="color:${MUTED};"> ${esc(h.text)}</span>
      </td>
    </tr>`).join('')

  return `
    <div class="step" style="margin:0 0 18px;padding:14px 16px;border:1px solid #e2e8f0;border-radius:12px;background:#f8fafc;">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
        <span style="display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:50%;background:${BRAND};color:#fff;font-weight:800;font-size:13px;">${step.num}</span>
        <span style="font-size:15px;font-weight:800;color:${INK};">${esc(step.title)}</span>
      </div>
      <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;color:${BRAND};margin:0 0 6px 36px;">${esc(step.subtitle)}</div>
      <div style="font-size:11.5px;color:${MUTED};margin:0 0 8px 36px;">${esc(step.desc)}</div>
      <table style="border-collapse:collapse;font-size:11.5px;margin-left:30px;">${items}</table>
    </div>`
}

function buildManualHtml(): string {
  const steps = MANUAL_STEPS.map(stepHtml).join('')
  return `
  <div style="font-family:'Outfit',Arial,sans-serif;color:${INK};width:190mm;padding:4mm 2mm;">
    <div style="text-align:center;border-bottom:3px solid ${BRAND};padding-bottom:12px;margin-bottom:16px;">
      <div style="font-size:24px;font-weight:900;letter-spacing:-0.02em;color:${INK};">Danos Aparentes</div>
      <div style="font-size:13px;font-weight:700;color:${BRAND};margin-top:2px;">Manual do Usuário — Passo a Passo</div>
      <div style="font-size:10.5px;color:${MUTED};margin-top:6px;">Guia rápido para fazer uma vistoria do início ao laudo em PDF.</div>
    </div>
    ${steps}
    <div style="margin-top:18px;padding-top:10px;border-top:1px solid #e2e8f0;text-align:center;font-size:9.5px;color:${MUTED};">
      © Danos Aparentes — Vistoria Digital de Avarias Veiculares. Em caso de dúvida, abra o tutorial dentro do app (botão 💡 Tutorial).
    </div>
  </div>`
}

const MANUAL_OPTS = {
  margin: [10, 8, 12, 8] as [number, number, number, number],
  filename: 'Manual-Danos-Aparentes.pdf',
  image: { type: 'jpeg', quality: 0.98 },
  html2canvas: { scale: 2, backgroundColor: '#ffffff', useCORS: true, logging: false },
  jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
  pagebreak: { mode: ['css', 'legacy'], avoid: ['.step', '.nobreak'] },
}

export async function generateManualPdf(): Promise<void> {
  if (typeof window !== 'undefined' && (window as any).document?.fonts?.ready) {
    await (window as any).document.fonts.ready
  }
  const html2pdf = await getHtml2Pdf()
  await html2pdf().set(MANUAL_OPTS).from(buildManualHtml()).save()
}
