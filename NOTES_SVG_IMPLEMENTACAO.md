# Referência de Implementação: SVGs do Veículo

Este documento contém os blocos de código SVG extraídos de `inspecao_veicular.html` para as quatro vistas dos veículos (Automóvel, Moto, Caminhão, Ônibus). Utilize estes fragmentos para implementar o visualizador em outros arquivos `index.html` ou componentes.

## 1. Carro
- `container-car-lateral-left`
- `container-car-lateral-right`
- `container-car-frontal`
- `container-car-traseira`

## 2. Motocicleta
- `container-moto-lateral-left`
- `container-moto-lateral-right`
- `container-moto-frontal`
- `container-moto-traseira`

## 3. Caminhão
- `container-truck-lateral-left`
- `container-truck-lateral-right`
- `container-truck-frontal`
- `container-truck-traseira`

## 4. Ônibus
- `container-bus-lateral-left`
- `container-bus-lateral-right`
- `container-bus-frontal`
- `container-bus-traseira`

---
**Nota de Implementação:** Certifique-se de incluir os `<defs>`, gradientes e filtros definidos no arquivo original (`inspecao_veicular.html`) dentro do `visualizer-wrapper` em seu novo projeto, caso contrário, os efeitos de preenchimento (metálicos, vidros, sombras) não serão renderizados.
