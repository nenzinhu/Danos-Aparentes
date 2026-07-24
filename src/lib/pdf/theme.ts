import { Severity, ViewType } from '../../types'

export const SEV_LABEL = { low: 'Leve', medium: 'Média', high: 'Grave' } satisfies Record<Severity, string>
export const SEV_COLOR = { 
  low: '#0369a1',    // sky-700
  medium: '#b45309', // amber-700
  high: '#be123c'    // rose-700
} satisfies Record<Severity, string>
export const SEV_BG = { 
  low: '#f0f9ff',    // sky-50
  medium: '#fffbeb', // amber-50
  high: '#fff1f2'    // rose-50
} satisfies Record<Severity, string>

export const VIEW_LABEL = {
  'lateral-left':  'Lateral Esquerda',
  'lateral-right': 'Lateral Direita',
  frontal:         'Frontal',
  traseira:        'Traseira',
} satisfies Record<ViewType, string>

export interface PdfTheme {
  fontMain: string
  fontTitle: string
  bgMain: string
  textMain: string
  textMuted: string
  accentColor: string
  borderColor: string
  borderLight: string
  cardBg: string
  headerBg: string
  colorStripe: string
}

export type PdfThemeId = 'modern' | 'editorial' | 'tecnico' | 'corporativo' | 'minimalista' | 'vibrante'

export const THEMES = {
  modern: {
    fontMain: "'Outfit', -apple-system, sans-serif",
    fontTitle: "'Outfit', -apple-system, sans-serif",
    bgMain: '#ffffff', textMain: '#1e293b', textMuted: '#64748b',
    accentColor: '#2563eb', borderColor: '#e2e8f0', borderLight: '#f8fafc', cardBg: '#ffffff',
    headerBg: 'linear-gradient(135deg, #090d16 0%, #1e293b 100%)',
    colorStripe: 'linear-gradient(90deg, #2563eb 0%, #3b82f6 50%, #60a5fa 100%)',
  },
  editorial: {
    fontMain: "'Lora', Georgia, serif",
    fontTitle: "'Poppins', sans-serif",
    bgMain: '#faf9f5', textMain: '#141413', textMuted: '#7a7974',
    accentColor: '#d97757', borderColor: '#b0aea5', borderLight: 'rgba(176,174,165,0.25)', cardBg: '#faf9f5',
    headerBg: 'linear-gradient(135deg, #141413 0%, #2a2a29 100%)',
    colorStripe: 'linear-gradient(90deg, #d97757 0%, #6a9bcc 50%, #788c5d 100%)',
  },
  tecnico: {
    fontMain: "'Outfit', -apple-system, sans-serif",
    fontTitle: "'IBM Plex Mono', monospace",
    bgMain: '#ffffff', textMain: '#0b1220', textMuted: '#64748b',
    accentColor: '#0f766e', borderColor: '#cbd5e1', borderLight: '#eef2f7', cardBg: '#f8fafc',
    headerBg: 'linear-gradient(135deg, #0b1220 0%, #1e293b 100%)',
    colorStripe: 'linear-gradient(90deg, #0f766e 0%, #2dd4bf 50%, #0ea5e9 100%)',
  },
  corporativo: {
    fontMain: "'Outfit', -apple-system, sans-serif",
    fontTitle: "'Poppins', sans-serif",
    bgMain: '#ffffff', textMain: '#0f172a', textMuted: '#64748b',
    accentColor: '#1e3a8a', borderColor: '#cbd5e1', borderLight: '#eef2f7', cardBg: '#ffffff',
    headerBg: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
    colorStripe: 'linear-gradient(90deg, #1e3a8a 0%, #b45309 50%, #1e3a8a 100%)',
  },
  minimalista: {
    fontMain: "'Outfit', -apple-system, sans-serif",
    fontTitle: "'Outfit', -apple-system, sans-serif",
    bgMain: '#ffffff', textMain: '#18181b', textMuted: '#71717a',
    accentColor: '#18181b', borderColor: '#e4e4e7', borderLight: '#f4f4f5', cardBg: '#fafafa',
    headerBg: 'linear-gradient(135deg, #18181b 0%, #3f3f46 100%)',
    colorStripe: 'linear-gradient(90deg, #18181b 0%, #71717a 50%, #18181b 100%)',
  },
  vibrante: {
    fontMain: "'Outfit', -apple-system, sans-serif",
    fontTitle: "'Poppins', sans-serif",
    bgMain: '#ffffff', textMain: '#1e1b2e', textMuted: '#6b7280',
    accentColor: '#7c3aed', borderColor: '#e9d5ff', borderLight: '#f5f3ff', cardBg: '#fdfcff',
    headerBg: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 60%, #db2777 100%)',
    colorStripe: 'linear-gradient(90deg, #7c3aed 0%, #db2777 50%, #f59e0b 100%)',
  },
} as const satisfies Record<PdfThemeId, PdfTheme>

export function resolveTheme(id?: PdfThemeId): PdfTheme {
  return THEMES[id ?? 'modern'] ?? THEMES.modern
}

export function pillBadge(label: string, color: string, bg: string, theme: PdfTheme): string {
  return `<span style="display:inline-block;padding:2px 10px;background:${bg};border:1px solid ${color}20;color:${color};font-size:8px;font-weight:700;border-radius:20px;text-transform:uppercase;letter-spacing:0.04em;font-family:${theme.fontTitle};white-space:nowrap;">${label}</span>`
}

export function sectionTitle(text: string, theme: PdfTheme): string {
  return `<div style="margin-top:6px; margin-bottom:5px; display:flex; align-items:center;">
    <div class="sec-title-bar" style="width:3px; height:11px; background:${theme.accentColor}; border-radius:1px; margin-right:7px;"></div>
    <span class="sec-title-text" style="font-size:9px; font-weight:800; color:${theme.textMain}; text-transform:uppercase; letter-spacing:0.08em; font-family:${theme.fontTitle};">${text}</span>
  </div>`
}
