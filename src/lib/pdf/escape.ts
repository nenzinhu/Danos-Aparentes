/**
 * Escapes special HTML characters in user-provided text strings
 * to prevent XSS / markup corruption when rendering PDF templates.
 */
export function escapeHtml(str: string | null | undefined): string {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
