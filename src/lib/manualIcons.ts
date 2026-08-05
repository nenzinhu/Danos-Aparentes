/**
 * Ícones do manual — fonte única para os dois renderizadores.
 *
 * O conteúdo de `manualContent.ts` é consumido tanto pelo modal React
 * (`FeaturesSlidesModal`) quanto pelo gerador de PDF (`manual.ts`), que monta
 * HTML como string. Por isso o ícone é guardado como *markup interno* do <svg>:
 * o React embrulha num <svg> via JSX e o PDF via template string.
 *
 * Traço no estilo Lucide: viewBox 24x24, stroke currentColor, sem fill.
 */
export type ManualIconKey = keyof typeof MANUAL_ICON_PATHS

export const MANUAL_ICON_PATHS = {
  /** prédio / empresa */
  building:
    '<path d="M3 21h18"/><path d="M5 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16"/><path d="M15 21V9h4a2 2 0 0 1 2 2v10"/><path d="M9 7h2"/><path d="M9 11h2"/><path d="M9 15h2"/>',
  /** prancheta com lista */
  clipboard:
    '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M8 12h8"/><path d="M8 16h5"/>',
  /** carro de lado */
  car: '<path d="M5 17h14"/><path d="M3 17v-4l2-5a2 2 0 0 1 1.9-1.3h10.2A2 2 0 0 1 19 8l2 5v4"/><path d="M3 13h18"/><circle cx="7.5" cy="17.5" r="1.8"/><circle cx="16.5" cy="17.5" r="1.8"/>',
  /** lista com marcações */
  list: '<path d="M9 6h11"/><path d="M9 12h11"/><path d="M9 18h11"/><path d="M3.5 6l1 1 2-2"/><path d="M3.5 12l1 1 2-2"/><path d="M3.5 18l1 1 2-2"/>',
  /** lupa */
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
  /** raio */
  zap: '<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z"/>',
  /** lápis */
  pencil:
    '<path d="M17 3.5a2.1 2.1 0 0 1 3 3L8 18.5l-4 1 1-4z"/><path d="M15 5.5l3 3"/>',
  /** van / utilitário */
  van: '<path d="M3 17V8a1 1 0 0 1 1-1h9v10"/><path d="M13 10h4l4 4v3"/><path d="M3 17h2"/><path d="M9 17h6"/><path d="M19 17h2"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
  /** girar / 4 lados */
  rotate:
    '<path d="M21 12a9 9 0 1 1-2.6-6.3"/><path d="M21 3v5h-5"/>',
  /** toque / dedo */
  tap: '<path d="M9 11V5.5a1.8 1.8 0 0 1 3.6 0V12"/><path d="M12.6 12V9.8a1.7 1.7 0 0 1 3.4 0V12"/><path d="M16 12v-1a1.7 1.7 0 0 1 3.4 0v4.4a5.6 5.6 0 0 1-5.6 5.6h-1.6a5 5 0 0 1-3.9-1.9L5 15.6a1.7 1.7 0 0 1 2.6-2.2L9 15"/>',
  /** etiqueta */
  tag: '<path d="M12.6 3H20a1 1 0 0 1 1 1v7.4a2 2 0 0 1-.6 1.4l-7.6 7.6a2 2 0 0 1-2.8 0l-6-6a2 2 0 0 1 0-2.8l7.6-7.6a2 2 0 0 1 1.4-.6z"/><circle cx="16.5" cy="7.5" r="1.3"/>',
  /** aviso */
  alert:
    '<path d="M10.3 3.9 2.4 17.5A2 2 0 0 0 4.1 20.5h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4.5"/><path d="M12 17h.01"/>',
  /** câmera */
  camera:
    '<path d="M3 8.5h3l1.6-2.4a1 1 0 0 1 .8-.6h7.2a1 1 0 0 1 .8.6L18 8.5h3a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1z"/><circle cx="12" cy="13.5" r="3.4"/>',
  /** paleta de cores */
  palette:
    '<path d="M12 3a9 9 0 1 0 0 18 2 2 0 0 0 1.6-3.2 2 2 0 0 1 1.6-3.2H18a3 3 0 0 0 3-3A9 9 0 0 0 12 3z"/><circle cx="7.7" cy="11.5" r="1.2"/><circle cx="10.5" cy="7.5" r="1.2"/><circle cx="15" cy="8.3" r="1.2"/>',
  /** documento técnico */
  file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M9 13h6"/><path d="M9 17h4"/>',
  /** jornal / editorial */
  news: '<path d="M4 5h12a1 1 0 0 1 1 1v13H5a1 1 0 0 1-1-1z"/><path d="M17 9h2a1 1 0 0 1 1 1v7a2 2 0 0 1-2 2"/><path d="M7 8.5h6"/><path d="M7 12h6"/><path d="M7 15.5h4"/>',
  /** assinatura */
  signature:
    '<path d="M3 18c3.5 0 3.5-12 6.5-12 2 0 1.6 8-.5 8-2.5 0-2.5-5 1-5 3.5 0 4 6 7 6 1.6 0 2.5-.8 3-1.6"/><path d="M3 21h18"/>',
  /** cadeado */
  lock: '<rect x="4" y="10.5" width="16" height="10" rx="2"/><path d="M8 10.5V7.4a4 4 0 0 1 8 0v3.1"/><path d="M12 14.5v2.5"/>',
  /** balão de conversa */
  chat: '<path d="M21 12a8 8 0 0 1-8 8H8l-4 2 1.2-3.4A8 8 0 1 1 21 12z"/><path d="M9 11h6"/><path d="M9 14.5h4"/>',
  /** salvar no aparelho */
  save: '<path d="M5 3h11l3 3v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M8 3v5h7"/><path d="M8 14h8v7H8z"/>',
  /** sinal / conectividade estável */
  signal:
    '<path d="M4.5 15.5a5.5 5.5 0 0 1 0-7.8"/><path d="M19.5 7.7a5.5 5.5 0 0 1 0 7.8"/><path d="M7.6 12.9a2.2 2.2 0 0 1 0-3.1"/><path d="M16.4 9.8a2.2 2.2 0 0 1 0 3.1"/><circle cx="12" cy="11.3" r="1.6"/><path d="M12 13v8"/>',
  /** envio para a nuvem */
  cloud:
    '<path d="M7 19a4.5 4.5 0 0 1-.4-9A6 6 0 0 1 18 10.4a3.8 3.8 0 0 1-.5 8.6"/><path d="M12 21v-7"/><path d="M9.4 16.2 12 13.6l2.6 2.6"/>',
} as const

/** Markup interno do ícone; string vazia se a chave não existir. */
export function manualIconPaths(key: string): string {
  return (MANUAL_ICON_PATHS as Record<string, string>)[key] ?? ''
}

/** <svg> completo como string — usado na geração do PDF. */
export function manualIconSvg(key: string, size = 15, color = '#0369a1'): string {
  const paths = manualIconPaths(key)
  if (!paths) return ''
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`
}
