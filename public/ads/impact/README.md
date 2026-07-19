# Ad creatives — impacto fotográfico

Substitui ilustrações genéricas (`og-image` vetorial / `ad-square` esquema) por:

1. **Cenas fotográficas** das capas de blog (contexto de vistoria, oficina, QR/hash)
2. **Laudo PDF real** do produto (`/exemplos/modelo-relatorio.webp`) para oferta/planos

## Formatos
- `*-1200x628.jpg` — Meta link / landscape
- `*-1080.jpg` — feed 1:1
- `laudo-real-*` — preview do PDF do app

## Geração
Composto com `sharp` a partir dos assets do repo (logo + foto + overlay brand). Sem emoji / sem ilustração flat do carro genérico.
