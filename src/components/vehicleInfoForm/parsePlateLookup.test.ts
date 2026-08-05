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
})
