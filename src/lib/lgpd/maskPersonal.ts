/**
 * FASE 11 — Minimization helpers for UI / export surfaces.
 * Technical masking only — not a substitute for legal bases or DPO process.
 */

import { maskCpfInText, maskPlate } from '../verify/publicVerify'

export { maskCpfInText, maskPlate }

/** Mask phone keeping last 4 digits when possible. */
export function maskPhone(phone: string): string {
  const digits = (phone || '').replace(/\D/g, '')
  if (digits.length < 4) return phone ? '****' : ''
  return `****${digits.slice(-4)}`
}

/** Mask display name: keep first token, redact rest. */
export function maskDisplayName(name: string): string {
  const t = (name || '').trim()
  if (!t) return ''
  const parts = t.split(/\s+/)
  if (parts.length === 1) return `${parts[0].slice(0, 1)}***`
  return `${parts[0]} ***`
}

/** CPF digits → ***.***.***-XX (or empty). */
export function maskCpfDigits(cpf: string): string {
  const d = (cpf || '').replace(/\D/g, '')
  if (d.startsWith('EX') || (cpf || '').startsWith('EX-')) return 'EX-***'
  if (d.length !== 11) return maskCpfInText(cpf || '')
  return `***.***.***-${d.slice(-2)}`
}

export type MaskedSubjectPreview = {
  owner: string
  cpf: string
  phone: string
  plate: string
}

/** Public/minimized preview of subject fields. */
export function maskSubjectPreview(input: {
  owner?: string
  cpf?: string
  phone?: string
  plate?: string
}): MaskedSubjectPreview {
  return {
    owner: maskDisplayName(input.owner || ''),
    cpf: maskCpfDigits(input.cpf || ''),
    phone: maskPhone(input.phone || ''),
    plate: maskPlate(input.plate || ''),
  }
}
