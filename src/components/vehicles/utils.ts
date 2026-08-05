import { Severity } from '../../types'

export function getDamageClass(severity: Severity | undefined): string {
  if (!severity) return ''
  return `damage-${severity}`
}
