import { describe, expect, it } from 'vitest'
import { extractGeminiText, parseImageDataUrl } from './geminiVision'

describe('parseImageDataUrl', () => {
  it('aceita image/jpeg padrão', () => {
    const parsed = parseImageDataUrl('data:image/jpeg;base64,/9j/4AAQ')
    expect(parsed).toEqual({ mimeType: 'image/jpeg', base64: '/9j/4AAQ' })
  })

  it('aceita image/webp e image/png', () => {
    expect(parseImageDataUrl('data:image/webp;base64,UklGRg==')?.mimeType).toBe('image/webp')
    expect(parseImageDataUrl('data:image/png;base64,iVBOR')?.mimeType).toBe('image/png')
  })

  it('trata mime vazio e octet-stream como jpeg', () => {
    expect(parseImageDataUrl('data:;base64,abc123')).toEqual({
      mimeType: 'image/jpeg',
      base64: 'abc123',
    })
    expect(parseImageDataUrl('data:application/octet-stream;base64,abc123')).toEqual({
      mimeType: 'image/jpeg',
      base64: 'abc123',
    })
  })

  it('rejeita data URL inválida', () => {
    expect(parseImageDataUrl('https://example.com/a.jpg')).toBeNull()
    expect(parseImageDataUrl('data:text/plain;base64,abc')).toBeNull()
  })
})

describe('extractGeminiText', () => {
  it('lê texto na primeira parte', () => {
    expect(
      extractGeminiText({
        candidates: [{ content: { parts: [{ text: '{"severity":"low"}' }] } }],
      }),
    ).toBe('{"severity":"low"}')
  })

  it('ignora partes de thinking e junta textos', () => {
    expect(
      extractGeminiText({
        candidates: [
          {
            content: {
              parts: [
                { thought: true, text: 'raciocínio interno' },
                { text: '{"severity":' },
                { text: '"high"}' },
              ],
            },
          },
        ],
      }),
    ).toBe('{"severity":"high"}')
  })

  it('retorna vazio sem candidatos', () => {
    expect(extractGeminiText({})).toBe('')
    expect(extractGeminiText(null)).toBe('')
  })
})
