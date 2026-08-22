import { Severity, ViewType } from '../../types'

export const SEV_LABEL = { low: 'Leve', medium: 'Média', high: 'Grave' } satisfies Record<Severity, string>
/** Badge / KPI text — executive SaaS severity tokens */
export const SEV_COLOR = {
  low: '#166534',    // green-800
  medium: '#92400E', // amber-800
  high: '#991B1B',   // red-800
} satisfies Record<Severity, string>
export const SEV_BG = {
  low: '#DCFCE7',    // green-100
  medium: '#FEF3C7', // amber-100
  high: '#FEE2E2',   // red-100
} satisfies Record<Severity, string>
/** KPI card fill (slightly softer than badge bg) */
export const SEV_KPI_BG = {
  low: '#DEF7EC',
  medium: '#FEF3C7',
  high: '#FDE8E8',
} satisfies Record<Severity, string>
export const SEV_KPI_TEXT = {
  low: '#03543F',
  medium: '#92400E',
  high: '#9B1C1C',
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
    fontMain: "'Times New Roman', Georgia, 'Liberation Serif', serif",
    fontTitle: "'Times New Roman', Georgia, 'Liberation Serif', serif",
    bgMain: '#ffffff', textMain: '#000000', textMuted: '#444444',
    accentColor: '#000000', borderColor: '#000000', borderLight: '#cccccc', cardBg: '#ffffff',
    headerBg: 'linear-gradient(135deg, #111111 0%, #333333 100%)',
    colorStripe: 'linear-gradient(90deg, #000000 0%, #555555 50%, #000000 100%)',
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

import type { CustomThemeColors } from './types'

export function resolveTheme(id?: PdfThemeId, customColors?: CustomThemeColors): PdfTheme {
  const base = THEMES[id ?? 'modern'] ?? THEMES.modern
  if (!customColors) return base

  return {
    ...base,
    accentColor: customColors.accentColor ?? base.accentColor,
    headerBg: customColors.headerBg ?? base.headerBg,
    colorStripe: customColors.colorStripe ?? base.colorStripe,
  }
}

export function pillBadge(label: string, color: string, bg: string, theme: PdfTheme, compact = false): string {
  const pad = compact ? '1px 7px' : '2px 10px'
  const size = compact ? '6.5px' : '8px'
  return `<span style="display:inline-block;padding:${pad};background:${bg};border:1px solid ${color}22;color:${color};font-size:${size};font-weight:700;border-radius:999px;text-transform:uppercase;letter-spacing:0.04em;font-family:${theme.fontTitle};white-space:nowrap;margin:1px 2px 1px 0;line-height:1.35;">${label}</span>`
}

export function sectionTitle(text: string, theme: PdfTheme, num?: number): string {
  const label = num ? `${num}. ${text}` : text
  return `<div class="sec-title" style="margin:12px 0 7px; display:flex; align-items:center; gap:8px;">
    <span style="display:inline-block;width:4px;height:13px;background:${theme.accentColor};border-radius:2px;flex:0 0 auto;"></span>
    <span class="sec-title-text" style="font-size:9.5px; font-weight:800; color:${theme.textMain}; text-transform:uppercase; letter-spacing:0.09em; font-family:${theme.fontTitle}; line-height:1.1;">${label}</span>
  </div>`
}

/** Card shell — SaaS executive (6px radius, fine gray border). */
export function cardShell(inner: string, theme: PdfTheme, extraStyle = ''): string {
  return `<div class="card-wrapper" style="background:${theme.cardBg};border:1px solid #E5E7EB;border-radius:6px;padding:8px 10px;margin-bottom:6px;box-shadow:none;${extraStyle}">${inner}</div>`
}
