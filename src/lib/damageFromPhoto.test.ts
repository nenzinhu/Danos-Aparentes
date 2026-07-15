import { describe, expect, it } from 'vitest'
import {
  isKnownVehicleType,
  normalizeDamageType,
  parsePhotoDamageSuggestions,
} from './damageFromPhoto'

describe('damageFromPhoto', () => {
  it('aceita tipos de veículo conhecidos', () => {
    expect(isKnownVehicleType('car')).toBe(true)
    expect(isKnownVehicleType('moto')).toBe(true)
    expect(isKnownVehicleType('aviao')).toBe(false)
  })

  it('normaliza tipo de dano', () => {
    expect(normalizeDamageType('scratch')).toBe('scratch')
    expect(normalizeDamageType('dent')).toBe('dent')
    expect(normalizeDamageType('broken')).toBe('broken')
    expect(normalizeDamageType('risco')).toBeNull()
  })

  it('descarta partId fora do catálogo e preenche labels', () => {
    const result = parsePhotoDamageSuggestions('car', {
      suggestions: [
        {
          partId: 'car-ll-door-front',
          type: 'scratch',
          severity: 'medium',
          description: 'Risco profundo no terço inferior da porta.',
          confidence: 'high',
        },
        {
          partId: 'peca-inventada',
          type: 'dent',
          severity: 'high',
          description: 'Deve ser ignorada',
          confidence: 'high',
        },
        {
          partId: 'car-ll-door-front',
          type: 'broken',
          severity: 'high',
          description: 'Duplicata — ignorar',
          confidence: 'low',
        },
      ],
    })

    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      partId: 'car-ll-door-front',
      partName: 'Porta Dianteira Esquerda',
      view: 'lateral-left',
      type: 'scratch',
      typeName: 'Riscos / Abrasão',
      severity: 'medium',
      confidence: 'high',
    })
  })

  it('retorna lista vazia se a IA não achar dano', () => {
    expect(parsePhotoDamageSuggestions('car', { suggestions: [] })).toEqual([])
    expect(parsePhotoDamageSuggestions('car', null)).toEqual([])
  })
})
