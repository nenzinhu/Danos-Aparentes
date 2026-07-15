import { describe, expect, it } from 'vitest'
import { mapPlateApiToFound } from './parsePlateLookup'

describe('mapPlateApiToFound', () => {
  it('retorna null em erro', () => {
    expect(mapPlateApiToFound({ erro: true })).toBeNull()
    expect(mapPlateApiToFound({ message: 'Not Found' })).toBeNull()
  })

  it('mapeia carro padrão', () => {
    const found = mapPlateApiToFound({
      MARCA: 'Toyota',
      MODELO: 'Corolla',
      anoModelo: 2023,
      cor: 'prata',
      municipio: 'são paulo',
      uf: 'sp',
      tipo: 'Automóvel',
    })
    expect(found).toMatchObject({
      brand: 'Toyota Corolla 2023',
      color: 'Prata',
      city: 'São paulo',
      state: 'SP',
      svgType: 'car',
    })
  })

  it('detecta moto', () => {
    const found = mapPlateApiToFound({ tipo: 'Motocicleta', MARCA: 'Honda' })
    expect(found?.svgType).toBe('moto')
    expect(found?.vehicleTypeDesc).toBe('Motocicleta')
  })

  it('detecta caminhão', () => {
    const found = mapPlateApiToFound({ especie: 'Caminhão', MARCA: 'Volvo' })
    expect(found?.svgType).toBe('truck')
  })
})
