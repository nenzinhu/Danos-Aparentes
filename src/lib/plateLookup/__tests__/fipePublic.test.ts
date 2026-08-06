import { describe, expect, it } from 'vitest'
import { extractFipePublic, sanitizePlateLookupPayload } from '../fipePublic'

const sampleFipe = {
  dados: [
    {
      ano_modelo: '2007',
      codigo_fipe: '005225-6',
      id_valor: 77250,
      mes_referencia: 'maio de 2022 ',
      score: 101,
      texto_marca: 'VW - VolksWagen',
      texto_modelo: 'CROSSFOX 1.6 Mi Total Flex 8V 5p',
      texto_valor: 'R$ 28.799,00',
    },
  ],
}

describe('extractFipePublic / sanitizePlateLookupPayload', () => {
  it('extrai só campos públicos do melhor score', () => {
    const summary = extractFipePublic({ fipe: sampleFipe })
    expect(summary).toEqual({
      mesReferencia: 'maio de 2022',
      valor: 'R$ 28.799,00',
      anoModelo: '2007',
      textoMarca: 'VW - VolksWagen',
      textoModelo: 'CROSSFOX 1.6 Mi Total Flex 8V 5p',
    })
  })

  it('remove fipe bruto da resposta', () => {
    const sanitized = sanitizePlateLookupPayload({
      MARCA: 'VW',
      fipe: sampleFipe,
    })
    expect(sanitized.fipe).toBeUndefined()
    expect(sanitized.fipePublic).toEqual({
      mesReferencia: 'maio de 2022',
      valor: 'R$ 28.799,00',
      anoModelo: '2007',
      textoMarca: 'VW - VolksWagen',
      textoModelo: 'CROSSFOX 1.6 Mi Total Flex 8V 5p',
    })
    expect(JSON.stringify(sanitized)).not.toContain('codigo_fipe')
  })
})
