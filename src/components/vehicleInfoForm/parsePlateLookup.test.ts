import { describe, expect, it } from 'vitest'
import { mapPlateApiToFound } from './parsePlateLookup'

describe('mapPlateApiToFound', () => {
  it('retorna null em erro', () => {
    expect(mapPlateApiToFound({ erro: true })).toBeNull()
    expect(mapPlateApiToFound({ message: 'Not Found' })).toBeNull()
  })

  it('mapeia carro 4 portas padrão', () => {
    const found = mapPlateApiToFound({
      MARCA: 'Toyota',
      MODELO: 'Corolla',
      anoModelo: 2023,
      cor: 'prata',
      municipio: 'são paulo',
      uf: 'sp',
      tipo: 'Automóvel',
      portas: 4,
    })
    expect(found).toMatchObject({
      brand: 'Toyota Corolla 2023',
      color: 'Prata',
      city: 'São paulo',
      state: 'SP',
      svgType: 'car',
    })
  })

  it('mapeia carro 2/3 portas', () => {
    const found = mapPlateApiToFound({
      tipo: 'Automóvel',
      portas: 3,
      MARCA: 'VW',
      MODELO: 'Gol',
    })
    expect(found?.svgType).toBe('car2d')
    expect(found?.vehicleTypeDesc).toContain('2/3')
  })

  it('detecta motocicleta', () => {
    const found = mapPlateApiToFound({ tipo: 'Motocicleta', MARCA: 'Honda' })
    expect(found?.svgType).toBe('moto')
    expect(found?.vehicleTypeDesc).toBe('Motocicleta')
  })

  it('detecta motoneta', () => {
    const found = mapPlateApiToFound({ tipo: 'Motoneta', MARCA: 'Honda' })
    expect(found?.svgType).toBe('motoneta')
    expect(found?.vehicleTypeDesc).toBe('Motoneta')
  })

  it('detecta caminhão', () => {
    const found = mapPlateApiToFound({ especie: 'Caminhão', MARCA: 'Volvo' })
    expect(found?.svgType).toBe('truck')
  })

  it('detecta ônibus e micro-ônibus separadamente', () => {
    expect(mapPlateApiToFound({ tipo: 'Ônibus', MARCA: 'Mercedes' })?.svgType).toBe('bus')
    expect(mapPlateApiToFound({ tipo: 'Micro-ônibus', MARCA: 'Mercedes' })?.svgType).toBe('microbus')
  })

  it('usa sub_segmento hatch para carro 2/3 portas', () => {
    const found = mapPlateApiToFound({
      tipo: 'Automóvel',
      sub_segmento: 'AU - HATCH PEQUENO',
      MARCA: 'Fiat',
      MODELO: 'Uno',
    })
    expect(found?.svgType).toBe('car2d')
  })

  it('prefere FIPE para marca/modelo/ano e guarda só o resumo público', () => {
    const found = mapPlateApiToFound({
      MARCA: 'Volkswagen',
      MODELO: 'CrossFox',
      anoModelo: 2006,
      tipo: 'Automóvel',
      portas: 5,
      fipe: {
        dados: [
          {
            ano_modelo: '2007',
            codigo_fipe: '005225-6',
            codigo_marca: 59,
            codigo_modelo: '2368',
            combustivel: 'Gasolina',
            id_valor: 77250,
            mes_referencia: 'maio de 2022 ',
            referencia_fipe: 285,
            score: 101,
            sigla_combustivel: 'G',
            texto_marca: 'VW - VolksWagen',
            texto_modelo: 'CROSSFOX 1.6 Mi Total Flex 8V 5p',
            texto_valor: 'R$ 28.799,00',
            tipo_modelo: 1,
          },
        ],
      },
    })
    expect(found?.brand).toContain('VW - VolksWagen')
    expect(found?.brand).toContain('CROSSFOX 1.6 Mi Total Flex 8V 5p')
    expect(found?.brand).toContain('2007')
    expect(found?.fipe).toEqual({
      mesReferencia: 'maio de 2022',
      valor: 'R$ 28.799,00',
      anoModelo: '2007',
      textoMarca: 'VW - VolksWagen',
      textoModelo: 'CROSSFOX 1.6 Mi Total Flex 8V 5p',
    })
    expect(JSON.stringify(found)).not.toContain('codigo_fipe')
    expect(JSON.stringify(found)).not.toContain('id_valor')
  })

  it('escolhe o FIPE com maior score', () => {
    const found = mapPlateApiToFound({
      fipe: {
        dados: [
          {
            score: 10,
            texto_marca: 'Baixo',
            texto_modelo: 'A',
            texto_valor: 'R$ 1,00',
            mes_referencia: 'jan',
            ano_modelo: '2000',
          },
          {
            score: 200,
            texto_marca: 'Alto',
            texto_modelo: 'B',
            texto_valor: 'R$ 2,00',
            mes_referencia: 'fev',
            ano_modelo: '2001',
          },
        ],
      },
    })
    expect(found?.fipe?.textoMarca).toBe('Alto')
    expect(found?.fipe?.valor).toBe('R$ 2,00')
  })
})
