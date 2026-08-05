import { describe, expect, it } from 'vitest'
import {
  normalizeViewSideToken,
  parseViewSideResponse,
} from '../viewSideClassify'

describe('normalizeViewSideToken', () => {
  it('maps PT synonyms', () => {
    expect(normalizeViewSideToken('frente')).toBe('frontal')
    expect(normalizeViewSideToken('Frontal')).toBe('frontal')
    expect(normalizeViewSideToken('traseira')).toBe('traseira')
    expect(normalizeViewSideToken('esquerda')).toBe('lateral-left')
    expect(normalizeViewSideToken('Lado-Esquerdo')).toBe('lateral-left')
    expect(normalizeViewSideToken('direita')).toBe('lateral-right')
  })

  it('maps motorista/passageiro', () => {
    expect(normalizeViewSideToken('motorista')).toBe('lateral-left')
    expect(normalizeViewSideToken('lado do passageiro')).toBe('lateral-right')
  })

  it('maps tampa de combustível to left side', () => {
    expect(normalizeViewSideToken('tampa de combustivel')).toBe('lateral-left')
    expect(normalizeViewSideToken('Bocal de Combustível')).toBe('lateral-left')
    expect(normalizeViewSideToken('portinhola')).toBe('lateral-left')
    expect(normalizeViewSideToken('fuel door')).toBe('lateral-left')
  })
})

describe('parseViewSideResponse', () => {
  it('parses wrapped suggestions', () => {
    const text = JSON.stringify({
      suggestions: [
        { index: 0, view: 'frontal' },
        { index: 1, view: 'traseira' },
      ],
    })
    expect(parseViewSideResponse(text, 2)).toEqual([
      { index: 0, view: 'frontal' },
      { index: 1, view: 'traseira' },
    ])
  })

  it('parses markdown-fenced JSON and PT tokens', () => {
    const text = '```json\n[{"index":0,"view":"frente"},{"index":1,"lado":"esquerda"}]\n```'
    expect(parseViewSideResponse(text, 2)).toEqual([
      { index: 0, view: 'frontal' },
      { index: 1, view: 'lateral-left' },
    ])
  })

  it('drops invalid index and view', () => {
    const text = JSON.stringify({
      suggestions: [
        { index: 9, view: 'frontal' },
        { index: 0, view: 'teto' },
        { index: 0, view: 'frontal' },
      ],
    })
    expect(parseViewSideResponse(text, 1)).toEqual([{ index: 0, view: 'frontal' }])
  })

  it('returns empty on bad JSON', () => {
    expect(parseViewSideResponse('not-json', 2)).toEqual([])
  })
})
