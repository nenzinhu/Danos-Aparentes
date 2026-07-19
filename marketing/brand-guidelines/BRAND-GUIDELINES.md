# Danos Aparentes — Brand Guidelines

> Guia oficial de identidade visual para produto, landings, ads e vídeos.  
> Fonte de verdade no código: `src/app/globals.css` + `src/app/layout.tsx`.  
> Tokens de vídeo: `videoforge/brand.json`.

**Marca:** Danos Aparentes  
**Tagline:** Vistoria digital de alta fidelidade  
**Site:** https://danosaparentes.com.br  
**Empresa / CNPJ:** ver `src/components/LegalContent`

---

## 1. Personalidade da marca

Estética **pericial + técnica**: prancha de vistoria, grades sutis, tipografia condensada em títulos, dados em mono, acento âmbar para estrutura e azul ciano para ação.

| Palavra-chave | Significa |
|---|---|
| Precisão | Diagrama, hash, QR, GPS — nada genérico |
| Clareza | Uma ideia por seção; CTAs óbvios |
| Credibilidade | Tom profissional, sem emoji “clip-art” |
| Velocidade | “Laudo em 1 minuto”, “7 dias grátis” |

**Voz:** direta, pt-BR, benefício concreto. Evitar jargão vazio e hype de “IA genérica”.

---

## 2. Sistema de dois acentos (obrigatório)

Nunca misturar papéis:

| Token | Papel | Uso |
|---|---|---|
| `--primary` (azul / terracota no light) | **AÇÃO** | CTAs, seleção ativa, links, focus ring |
| `--signal` (âmbar) | **ESTRUTURA / DADOS** | Eyebrows, rótulos, marcadores, molduras `.sheet-frame`, valores mono |
| `--severity-*` | **SEMÂNTICO** | Só gravidade de avaria (leve / médio / grave) |

- Não usar âmbar em botão de ação.
- Não usar azul (primary) em rótulo estrutural / eyebrow.

---

## 3. Paleta

### 3.1 Tema escuro (padrão do produto)

| Token | Hex / valor | Uso |
|---|---|---|
| `--bg-main` | `#020617` | Fundo base |
| `--bg-gradient` | radial `#0d1f3c` → `#060d1a` → `#020408` | Atmosfera |
| `--text-main` | `#e8f4ff` | Texto principal |
| `--text-muted` | `#9bb4d0` | Secundário |
| `--primary` | `#1FB6FF` | Ação |
| `--primary-hover` | `#72C5EE` | Hover de ação |
| `--primary-glow` | `rgba(31,182,255,0.4)` | Glow de CTA / card destaque |
| `--signal` | `#f5a623` | Estrutura |
| `--signal-bright` | `#ffb938` | Ênfase de dado |
| `--card-bg` | `rgba(10,20,40,0.72)` | Glass |
| `--card-border` | `rgba(0,190,255,0.12)` | Borda glass |
| `--severity-low` | `#94a3b8` | Avaria leve |
| `--severity-medium` | `#f97316` | Avaria média |
| `--severity-high` | `#ef4444` | Avaria grave |
| `--whatsapp-color` | `#22c55e` | Só WhatsApp |

Gradiente de CTA: `var(--primary-btn-gradient)` = `#1FB6FF` → `#72C5EE`.

### 3.2 Tema claro (`html.light`)

Paleta editorial quente (paper + terracota). Alinhada à referência de tipografia/cores “warm paper” do skill brand-guidelines Anthropic, adaptada à marca:

| Token | Hex | Uso |
|---|---|---|
| `--bg-main` | `#faf9f5` | Fundo |
| `--text-main` | `#141413` | Texto |
| Mid gray (border/input) | `#b0aea5` / `#e8e6dc` | Superfícies sutis |
| `--primary` | `#9e4428` | Ação (terracota) |
| Accent ref. | `#d97757` | Gradiente de título / accents |
| Secondary accent | `#6a9bcc` | Apoio (neon-blue light) |
| Tertiary accent | `#788c5d` | Apoio (neon-cyan light) |
| `--signal-bright` | `#8a5508` | Estrutura no light |

### 3.3 CSS variables — resumo

Sempre preferir `var(--*)` em vez de hex solto em componentes novos. Hex hard-coded só quando o contraste WCAG do light mode exigir override (já mapeado em `globals.css`).

---

## 4. Tipografia

| Papel | Família | CSS | Uso |
|---|---|---|---|
| Body / UI | **Outfit** | `font-outfit` / body | Parágrafos, labels, botões |
| Display | **Saira Condensed** | `.font-display` | H1/H2 marketing, uppercase tracking tight |
| Dados | **IBM Plex Mono** | `.font-mono-data` | Placa, hash, eyebrows técnicos, códigos |

Fallbacks: Outfit → system sans; display → Outfit; mono → `ui-monospace`.

### Escala marketing (referência)

| Nível | Classes típicas |
|---|---|
| Hero H1 | `font-display text-4xl sm:text-5xl lg:text-[5.25rem] font-bold uppercase leading-[0.92]` |
| Section H2 | `font-display text-4xl lg:text-5xl font-bold uppercase tracking-tight leading-[0.95]` |
| Eyebrow | `font-mono-data text-[11px] tracking-[0.2em] uppercase text-[var(--signal-bright)]` |
| Body | `text-sm` / `text-base` `text-[var(--text-muted)]` |
| CTA | `font-black` / `font-bold` sobre `--primary-btn-gradient` |

---

## 5. Forma (raios)

| Token | Valor | Tailwind | Uso |
|---|---|---|---|
| `--radius-pill` | 9999px | `rounded-full` | Dots, pílulas |
| `--radius-card` | 20px | `rounded-2xl` | `.glass-card` |
| `--radius-control` | 12px | `rounded-xl` | CTAs, inputs grandes |
| `--radius-chip` | 6px | `rounded` / `rounded-lg` | Chips, badges |

Não introduzir `rounded-3xl` nem raios fora desta escala.

---

## 6. Logo e assets

| Asset | Path | Uso |
|---|---|---|
| Logo full | `/brand/logo-full.svg` | Header, footer, PDF white-label default |
| Logo icon | `/brand/logo-icon.svg` | Favicon-adjacent, compact |
| Logo PNG preload | `/logo.png` | LCP / splash |
| Logo SVG | `/logo.svg` | Alternativa |
| OG | `/og-image.jpg` | 1200×630 |
| Diagramas marketing | `/vehicles-img/{type}.png` | Showcase estático |
| Ícones app (coloridos) | `/icons/vehicles/*.svg` | Seletor in-app |
| Ícones marketing (line) | `src/components/marketing/VehicleLineIcons.tsx`, `MarketingIcons.tsx` | Landings |

**Clear space:** não colocar texto colado no ícone do logo; preferir altura ~28–36px no nav.

---

## 7. Iconografia

### Marketing / landings
- **SVG line art** em `currentColor` (stroke ~1.5–2).
- Componentes: `MarketingIcons.tsx`, `VehicleLineIcons.tsx`.
- Proibido emoji / clip-art colorido em listas, CTAs e badges de produto.

### App (vistoria)
- SVGs de veículo em `/icons/vehicles/` podem ser preenchidos (fidelidade do diagrama).
- Tipos de avaria: ícones geométricos (risco / amassado / quebrado), não emoji.

---

## 8. Componentes-chave

### CTA primário
- Fundo: `var(--primary-btn-gradient)` ou `bg-primary`
- Texto: contraste forçado (`globals.css` — escuro no dark, branco no light)
- Shape: `rounded-xl`, sombra `shadow-[var(--primary)]/20`
- Copy padrão: **Testar 7 dias grátis** + apoio **Sem cartão**

### Secondary / idle list item
- `bg-[var(--btn-secondary-bg)]` + `border-[var(--btn-secondary-border)]`
- Hover: `--btn-secondary-hover`

### Glass card
- Classe `.glass-card` (blur 18px desktop; sólido no mobile ≤900px)

### Sheet / prancha
- Classe `.sheet-frame` + marcas de corte âmbar (`--sheet-line`)

### Reveal
- Classe `.reveal` / `.is-visible` — só opacity + translateY; respeitar `prefers-reduced-motion`

---

## 9. Layout marketing

- Container: `max-w-6xl mx-auto` (+ padding horizontal)
- Uma composição na primeira dobra: marca forte + 1 headline + 1 apoio + 1 grupo de CTA + 1 âncora visual (diagrama / produto)
- Sem cards no hero; cards só quando forem interação ou lista de planos
- Landings verticais: `/locadoras`, `/oficinas`, `/frotas`, `/seguradoras`

---

## 10. Anti-patterns

| ❌ Não | ✅ Sim |
|---|---|
| Emoji em UI de produto/landing | SVG line / ícone do design system |
| Roxo genérico / glow roxo | Azul ciano (dark) ou terracota (light) |
| Âmbar em botão “Assinar” | Primary para ação |
| Primary em eyebrow “01 · Fluxo” | Signal / mono-data |
| Inter / Roboto / Arial como display | Saira Condensed + Outfit |
| Hero com stats + schedule + chips | Hero enxuto |
| Cards decorativos sem interação | Glass só onde agrupa ação/conteúdo |
| Hex soltos novos sem token | Estender `:root` / `html.light` |

---

## 11. Motion

| Token | Valor |
|---|---|
| `--duration-exit` | 150ms |
| `--duration-enter` | 210ms |
| `--duration-move` | 400ms |

Preferir transform + opacity. No mobile (≤900px): sem backdrop-blur pesado e sem view transitions caras.

---

## 12. Tom & CTAs

| Contexto | Copy |
|---|---|
| CTA principal | Testar 7 dias grátis |
| Apoio | Sem cartão |
| Prova | Hash SHA-256, QR Code, GPS, offline, white-label |
| Vertical locadoras | Devolução sem disputa |
| Vertical oficinas | Laudo pronto em minutos |
| Vertical frotas | Offline + padronização |
| Vertical seguradoras | Anti-fraude (hash + QR) |

---

## 13. Checklist para novas páginas / ads

- [ ] Brand name visível na primeira dobra (não só no nav)
- [ ] Tipografia: display / body / mono nos papéis certos
- [ ] Primary = ação; signal = estrutura
- [ ] Ícones SVG profissionais (sem emoji)
- [ ] Raios só da escala oficial
- [ ] Contraste ok em dark e light
- [ ] CTA “Testar 7 dias grátis” quando for acquisition
- [ ] Tokens via CSS variables
- [ ] Mobile: sem depender de backdrop-blur

---

## 14. Referência Anthropic (skill brand-guidelines)

O tema claro reutiliza a paleta paper da referência Anthropic (`#faf9f5`, `#141413`, `#b0aea5`, `#e8e6dc`, accents `#d97757` / `#6a9bcc` / `#788c5d`) como **modo dia**, não como identidade principal.

A identidade **default / ads / produto** permanece o tema escuro ciano-técnico (`#020617` + `#1FB6FF` + signal âmbar).

Não aplicar Poppins/Lora ao produto — usamos Outfit / Saira Condensed / IBM Plex Mono.
