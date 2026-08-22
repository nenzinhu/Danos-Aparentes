import type { DamageType, Severity } from '@/src/types'

const DAMAGE_TYPES: DamageType[] = ['scratch', 'dent', 'broken']

const SEVERITIES: Severity[] = ['low', 'medium', 'high']

function coerceDamageType(v: unknown): DamageType | null {
  if (typeof v !== 'string') return null
  const s = v.trim().toLowerCase()
  if ((DAMAGE_TYPES as string[]).includes(s)) return s as DamageType
  // Aliases comuns em PT.
  const map: Record<string, DamageType> = {
    risco: 'scratch', arranhao: 'scratch', arranhão: 'scratch',
    amassado: 'dent', amasso: 'dent',
    trinca: 'broken', rachadura: 'broken',
    quebrado: 'broken', quebrada: 'broken', fraturado: 'broken',
    ferrugem: 'broken', oxidacao: 'broken', oxidação: 'broken',
    pintura: 'broken', 'desbotamento': 'broken',
    deformacao: 'broken', deformação: 'broken',
    faltando: 'broken', ausente: 'broken',
  }
  return map[s] || null
}

function coerceSeverity(v: unknown): Severity {
  if (typeof v !== 'string') return 'low'
  const s = v.trim().toLowerCase()
  if ((SEVERITIES as string[]).includes(s)) return s as Severity
  if (/leve|baix|small|minor/.test(s)) return 'low'
  if (/med|moderad|méd|moderad/.test(s)) return 'medium'
  if (/alt|sever|grand|major|grav/.test(s)) return 'high'
  return 'low'
}

export type DamageClassifyResult = {
  type: DamageType | null
  severity: Severity
  description: string
  noDamage: boolean
}

/** Parse tolerante da resposta JSON da IA — nunca lança. */
export function parseDamageClassifyResponse(text: string): DamageClassifyResult {
  const cleaned = text.replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim()
  let data: unknown
  try {
    data = JSON.parse(cleaned)
  } catch {
    return { type: null, severity: 'low', description: '', noDamage: false }
  }
  const o = (data && typeof data === 'object' ? data : {}) as Record<string, unknown>
  const type = coerceDamageType(o.type ?? o.tipo ?? o.damageType)
  const severity = coerceSeverity(o.severity ?? o.gravidade ?? o.severidade)
  const description = typeof o.description === 'string' ? o.description.trim() : ''
  const noDamageRaw = o.noDamage ?? o.semDano ?? o.no_damage
  const noDamage = noDamageRaw === true || noDamageRaw === 'true' || noDamageRaw === 'sim'
  return { type, severity, description, noDamage }
}

/** Prompt canônico para classificação de avaria a partir de uma foto (estilo Parte 1). */
export function buildDamageClassifyPrompt(partName?: string, allowNoDamage = true): string {
  const foco = partName ? `Foco na peça: "${partName}".` : ''
  return `Você é um inspetor de veículos no Brasil. Analise a foto e classifique a avaria.
${foco}
Responda SOMENTE JSON válido, sem markdown:
{"type":"scratch|dent|crack|broken|rust|paint|deformation|missing|other","severity":"low|medium|high","description":"descrição curta da avaria em português"}
${allowNoDamage ? 'Se não houver avaria aparente, responda {"noDamage":true,"type":null,"severity":"low","description":""}.' : ''}
Tipos: scratch=risco, dent=amassado, crack=trinca, broken=quebrado, rust=ferrugem, paint=problema de pintura, deformation=deformação, missing=peça faltando, other=outro.`
}

/** Decide o status de evidência sugerido com base no resultado. */
export function suggestEvidenceStatusFromClassify(r: DamageClassifyResult): 'sugerido' | 'ignorado' {
  if (r.noDamage || !r.type) return 'ignorado'
  return 'sugerido'
}
