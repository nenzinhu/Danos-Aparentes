---
name: Danos Aparentes
colors:
  primary: "#1FB6FF"
  secondary: "#7a9bbf"
  surface: "#020617"
  surface-elevated: "#0a1428"
  on-surface: "#e8f4ff"
  accent: "#ffb938"
  error: "#ef4444"
  card-border: "#00beff1f"
typography:
  headline:
    fontFamily: Saira Condensed
    fontSize: 48px
    fontWeight: 700
  body-md:
    fontFamily: Outfit
    fontSize: 16px
    fontWeight: 400
  label-sm:
    fontFamily: Outfit
    fontSize: 12px
    fontWeight: 700
  mono:
    fontFamily: IBM Plex Mono
    fontSize: 14px
    fontWeight: 500
rounded:
  sm: 4px
  md: 12px
  lg: 20px
  pill: 9999px
spacing:
  unit: 8px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#020617"
    rounded: "{rounded.md}"
  button-signal:
    backgroundColor: "{colors.accent}"
    textColor: "#020617"
    rounded: "{rounded.md}"
  card:
    backgroundColor: "{colors.surface-elevated}"
    rounded: "{rounded.lg}"
    border: "{colors.card-border}"
---

# Design System — Danos Aparentes (Meta Ads)

> Extraído de tokens CSS de produção (`:root` em danosaparentes.com.br) + `videos/danos-aparentes-tour/DESIGN.md`.  
> **Tema escuro é a identidade real.** Paleta bege/terracota de capturas em light mode = descartada.

## Overview

SaaS de vistoria veicular digital. Visual: **prova documental**, não lifestyle genérico. Fundo azul-marinho quase-preto, acento ciano, âmbar só no momento de “selado/verificado”. Tipografia condensada (placa/documento) + mono para hash/QR/placa.

**Mood:** direto, operacional, resolutivo — “prova, não desculpa”.

## Colors

- **Primary** (`#1FB6FF`): CTAs, links, ícones ativos, traços de destaque
- **Accent / signal** (`#ffb938`): selo verificado, QR/hash, urgência pontual — usar com moderação
- **Surface** (`#020617`): fundo base de criativos
- **On-surface** (`#e8f4ff`): headlines e texto principal
- **Secondary** (`#7a9bbf`): legendas, metadados
- **Error** (`#ef4444`): só para dor/alerta visual (nunca como CTA)

## Typography

- **Headlines:** Saira Condensed 700, maiúscula preferível em overlays curtos
- **Body / UI:** Outfit 400–900
- **Prova técnica (placa, hash, QR label):** IBM Plex Mono 400–500

## Components (ads)

- **CTA button:** fill `#1FB6FF` ou `#ffb938`, texto `#020617`, radius 12px
- **Badge verificado:** pill âmbar ou ciano, texto escuro
- **Mock laudo PDF:** painel `#0a1428` + borda ciano 12% + QR + hash mono
- **Diagrama veículo:** car lateral + pontos âmbar de avaria

## Do's and Don'ts

- Do: tema escuro; diagrama/laudo/QR como heróis; overlay ≤7 palavras
- Do: provar mecanismo (QR/hash), não inventar depoimentos
- Don't: bege `#FAF9F5`, terracota `#9E4428`, texto preto `#141413` como base
- Don't: glow roxo genérico “IA SaaS”; cards lotados; fake ★★★★★
- Don't: usar claims “empresas relatam…” sem case nomeado
