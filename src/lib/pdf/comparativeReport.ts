/**
 * PDF comparativo derivado — NÃO substitui laudo emitido.
 * Sem mutação de vistorias; sem registro como issued em report_hashes.
 */

import type { ComparisonResult } from '../vehicleEvidence/types'
import { sha256Hex } from './integrityManifest'

async function getHtml2Pdf(): Promise<any> {
  const mod = await import('html2pdf.js')
  return (mod as any).default ?? mod
}

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function categoryLabel(cat: ComparisonResult['items'][0]['category']): string {
  switch (cat) {
    case 'new': return 'NOVO DANO'
    case 'unchanged': return 'EXISTENTE'
    case 'severityChanged': return 'ALTERADO'
    case 'removedOrRepaired': return 'NÃO IDENTIFICADO'
    case 'uncertain': return 'INCERTO'
  }
}

export type ComparativePdfInput = {
  plate: string
  previousLabel: string
  currentLabel: string
  result: ComparisonResult
  brand?: string
}

export function buildComparativeContentHash(input: ComparativePdfInput): Promise<string> {
  const canonical = JSON.stringify({
    plate: input.plate,
    previous: input.previousLabel,
    current: input.currentLabel,
    summary: input.result.summary,
    items: input.result.items.map((i) => ({
      cat: i.category,
      key: i.identityKey,
      msg: i.message,
      prevSev: i.previousSeverity ?? null,
      currSev: i.currentSeverity ?? null,
    })),
  })
  return sha256Hex(canonical)
}

const SEV_PT: Record<string, string> = {
  low: 'leve',
  medium: 'média',
  high: 'grave',
}

export function buildComparativeHtml(input: ComparativePdfInput, contentHash: string): string {
  const { plate, previousLabel, currentLabel, result, brand } = input
  const s = result.summary
  const rows = result.items.map((item) => {
    const part = item.current?.partName || item.previous?.partName || 'Peça'
    const type = item.current?.typeName || item.previous?.typeName || '—'
    const sev =
      item.previousSeverity && item.currentSeverity && item.previousSeverity !== item.currentSeverity
        ? `${SEV_PT[item.previousSeverity] ?? item.previousSeverity} → ${SEV_PT[item.currentSeverity] ?? item.currentSeverity}`
        : SEV_PT[item.currentSeverity || item.previousSeverity || ''] || '—'
    return `<tr>
      <td style="padding:6px;border-bottom:1px solid #e2e8f0;font-size:11px;"><strong>${esc(categoryLabel(item.category))}</strong></td>
      <td style="padding:6px;border-bottom:1px solid #e2e8f0;font-size:11px;">${esc(part)}</td>
      <td style="padding:6px;border-bottom:1px solid #e2e8f0;font-size:11px;">${esc(type)}</td>
      <td style="padding:6px;border-bottom:1px solid #e2e8f0;font-size:10px;">${esc(sev)}</td>
      <td style="padding:6px;border-bottom:1px solid #e2e8f0;font-size:10px;color:#64748b;">${esc(item.message)}</td>
    </tr>`
  }).join('')

  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><style>
    body{font-family:system-ui,-apple-system,sans-serif;color:#0f172a;margin:24px;background:#fff;}
    h1{font-size:20px;margin:0 0 4px;}
    .meta{font-size:11px;color:#64748b;margin-bottom:16px;}
    .banner{background:#fef3c7;border:1px solid #f59e0b;color:#92400e;padding:8px 12px;font-size:10px;border-radius:6px;margin-bottom:16px;}
    .stats{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px;}
    .stat{border:1px solid #e2e8f0;border-radius:6px;padding:8px 10px;font-size:11px;}
    .stat strong{display:block;font-size:16px;}
    table{width:100%;border-collapse:collapse;margin-top:8px;}
    th{text-align:left;font-size:10px;color:#64748b;padding:6px;border-bottom:2px solid #e2e8f0;}
    .foot{margin-top:20px;font-size:9px;color:#94a3b8;line-height:1.4;}
    code{font-size:9px;word-break:break-all;}
  </style></head><body>
    <div class="banner"><strong>RELATÓRIO COMPARATIVO (derivado)</strong> — Não substitui laudos emitidos. Não constitui validade jurídica garantida. FASE 9+</div>
    <h1>Vistoria comparativa — ${esc(plate)}</h1>
    <p class="meta">${esc(brand || '')} · Gerado em ${esc(new Date().toLocaleString('pt-BR'))}</p>
    <p class="meta"><strong>Anterior:</strong> ${esc(previousLabel)}<br/><strong>Atual:</strong> ${esc(currentLabel)}</p>
    <div class="stats">
      <div class="stat"><strong>${s.unchanged}</strong>existentes</div>
      <div class="stat"><strong>${s.newDamages}</strong>novos</div>
      <div class="stat"><strong>${s.severityChanged}</strong>alterados</div>
      <div class="stat"><strong>${s.removedOrRepaired}</strong>não identificados</div>
      <div class="stat"><strong>${s.uncertain}</strong>incertos</div>
    </div>
    <table>
      <thead><tr><th>Categoria</th><th>Peça</th><th>Tipo</th><th>Severidade</th><th>Detalhe</th></tr></thead>
      <tbody>${rows || '<tr><td colspan="5" style="padding:8px;font-size:11px;">Sem itens</td></tr>'}</tbody>
    </table>
    <div class="foot">
      <p>Hash do conteúdo deste comparativo (SHA-256): <code>${esc(contentHash)}</code></p>
      <p>Este documento é derivado da comparação estrutural entre duas vistorias. Laudos emitidos permanecem imutáveis e verificáveis em danosaparentes.com.br/verify.</p>
      <p>Assinaturas em tela ≠ certificado digital qualificado. Sem afirmação automática de reparo ou responsabilidade.</p>
    </div>
  </body></html>`
}

export async function generateComparativePdf(input: ComparativePdfInput): Promise<{ hash: string }> {
  const hash = await buildComparativeContentHash(input)
  const html = buildComparativeHtml(input, hash)
  const filename = `comparativo-${input.plate || 'veiculo'}.pdf`

  if (typeof window !== 'undefined' && (window as any).document?.fonts?.ready) {
    await (window as any).document.fonts.ready
  }

  const html2pdf = await getHtml2Pdf()
  await html2pdf()
    .set({
      margin: [10, 10, 10, 10],
      filename,
      image: { type: 'jpeg', quality: 0.95 },
      html2canvas: { scale: 2, useCORS: true, logging: false, backgroundColor: '#ffffff' },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    })
    .from(html)
    .save()

  return { hash }
}
