# DESIGN.md — Danos Aparentes (danosaparentes.com.br)

## 1. Visual Theme

Danos Aparentes é um SaaS/PWA de vistoria digital de avarias veiculares: o usuário consulta a placa, marca as avarias num diagrama do carro, colhe assinatura e GPS, e recebe um laudo em PDF com hash de segurança e QR Code — tudo pensado para resolver disputas ("quem amassou o quê") com prova, não com discussão.

**Identidade real da marca = tema escuro.** A captura automatizada (`capture/`) rodou em Chrome headless com preferência de cor clara, então boa parte dos screenshots e do `design-styles.json` mostra a marca "errada": bege/creme (`#FAF9F5`, `#E8E6DC`), texto quase-preto (`#141413`) e um botão primário terracota (`linear-gradient(135deg, #9E4428, #A34B30)`). Essa é a mesma paleta que já foi usada num vídeo anterior deste produto e que o usuário rejeitou explicitamente ("nso curte o video") por não parecer com a marca de verdade.

A identidade real — confirmada em `capture/extracted/tokens.json` → `cssVariables` (os `:root` do CSS de produção, não o que o DOM renderizou na captura) e já validada em 3 vídeos motion-graphics anteriores deste mesmo produto — é:

- **Fundo**: azul-marinho quase-preto `#020617`.
- **Acento primário**: azul-céu vibrante `#1FB6FF` (hover `#72c5ee`).
- **Acento de destaque/CTA**: âmbar `#ffb938`, usado com moderação para "sinal" (alerta, prova, urgência).
- **Texto**: quase-branco levemente azulado `#e8f4ff`, secundário azul-acinzentado `#7a9bbf`.

Trate esse tema escuro como a ÚNICA paleta usada no vídeo. Ignore `#9E4428` (terracota), `#FAF9F5`/`#E8E6DC` (bege) e `#141413` (texto quase-preto) do `design-styles.json` — eles são artefato de captura em modo claro, não a marca. Onde este documento reaproveita geometria do `design-styles.json` (raios, paddings, escala de espaçamento), os valores são agnósticos de tema e continuam válidos; apenas as **cores** são substituídas pelo tema escuro.

**Tom**: direto, prático, ligeiramente urgente — "prova, não desculpa". Tipografia condensada e maiúscula em títulos passa a sensação de placa/documento oficial; o corpo em Outfit é limpo e neutro. O produto lida com conflito (quem amassou o carro), então o vídeo deve soar confiante e resolutivo, nunca informal/brincalhão.

**Referência de composição real do produto** (para as cenas que mostram o app): a seção `#laudo` do site captura um mockup real do PDF do laudo com campos preenchidos (placa, veículo, avarias marcadas, QR Code, hash), e há um diagrama lateral do veículo (`assets/diagrama-lateral-do-veculo-carro.png`) usado para a marcação de avarias — ambos citados em `capture/extracted/asset-descriptions.md` e devem ancorar as cenas que "mostram o PDF" e "mostram a escolha de avarias" pedidas pelo usuário.

---

## 2. Quick Reference

### Cores (tema escuro — única paleta usada no vídeo)

| Token | Hex | Uso | Contraste (sobre `#020617`) |
|---|---|---|---|
| `--bg-main` | `#020617` | Fundo base de todas as cenas | — |
| `--bg-elevated` | `#0a1428` (aprox., ver nota) | Cards/painéis elevados sobre o fundo | — |
| `--text-main` | `#e8f4ff` | Texto principal, headlines | 17.7:1 (AAA) |
| `--text-muted` | `#7a9bbf` | Texto secundário, legendas, metadados | 7.0:1 (AA/quase-AAA) |
| `--primary` | `#1FB6FF` | Acento primário, links, ícones ativos, traços de destaque | 8.8:1 (AAA) |
| `--primary-hover` | `#72c5ee` | Estado hover/brilho do primário (usar em glows/pulses) | — |
| `--signal-bright` | `#ffb938` | CTA final, selo "assinado/verificado", QR/hash — usar com moderação | 11.8:1 (AAA) |
| `--card-border` | `#00beff1f` (azul 12% opacidade) | Bordas sutis de card sobre fundo escuro | decorativo |

Nota: `--bg-elevated` não está listado explicitamente em `tokens.json`; nas cenas, simule "card elevado" com `--bg-main` + `--card-border` + leve `box-shadow`/glow radial em `rgba(31,182,255,0.08–0.12)` (o mesmo padrão de glow azul já visto em `design-styles.json` → `backgrounds`, ex.: `radial-gradient(circle at 50% 30%, rgba(0,170,255,0.1) 0%, transparent 65%)`).

Todos os pares texto-sobre-fundo acima passam AA para texto normal; `--text-main`, `--primary` e `--signal-bright` passam AAA. Nunca usar `#9E4428`, `#FAF9F5`, `#E8E6DC`, `#141413`, `#44433F`, `#B0AEA5` — são a paleta clara descartada.

### Fontes

| Papel | Família | Peso | Arquivo (`capture/assets/fonts/`) |
|---|---|---|---|
| Display / títulos grandes | Saira Condensed | 700 (Bold) | `bcc6c7b97aa3243e-s.p.0-bot13eqj7bq.woff2` ou `fad8c11517de0c51-s.3taa34zb7zg2j.woff2` |
| Heading / subtítulos | Saira Condensed | 600 (SemiBold) | `b94cfb34b9e6a2b8-s.p.3-n57bcvaz8oc.woff2` ou `d0f5eca495bd6f0e-s.2ghbzre0fc5v5.woff2` |
| Heading leve | Saira Condensed | 500 (Medium) | `34fd6ffea3f110b0-s.3hd5jkugfx254.woff2` ou `aa5902a20f09ee56-s.3icaf0vxshg63.woff2` |
| Corpo / UI | Outfit (variável) | 100–900, usar 400 (corpo) e 700–900 (botões/links) | `1b99372b3eaef0c8-s.p.1gsd1jahc5dg_.woff2` ou `b2ea385cb5ae8625-s.1spbknb88wd48.woff2` |
| Mono / dados técnicos (hash, placa, JSON-LD, código do laudo) | IBM Plex Mono | 400 / 500 | `2fe89d53234c61d4-s.1u30mmyq6lnsd.woff2` (400), `a7afbb44bec2bb18-s.1qc6dx89jd2qv.woff2` (500) |

`@font-face` deve apontar para os caminhos acima relativos ao projeto (`capture/assets/fonts/<arquivo>`). Saira Condensed é a fonte de "placa/documento oficial" (maiúscula, condensada) — reservar para headlines e números grandes. IBM Plex Mono reforça a sensação de dado verificável (hash, QR, placa) — usar em qualquer texto que pareça "prova técnica".

### Escala tipográfica (de `design-styles.json`, geometria reaproveitada)

| Papel | Tamanho | Peso | Line-height | Letter-spacing |
|---|---|---|---|---|
| Display | 84px | 700 | 84px | -0.84px |
| Heading | 48px | 700 | 48px | -0.48px |
| Heading-3 | 20px | 600 | 28px | -0.2px |
| Body | 18px | 400 | 28px | normal |
| Botão/link | 16px | 900 | 24px | normal |
| Código/mono | 16px | 400 | 24px | normal |
| Heading-4 (label) | 12px | 700–900 | 16px | -0.3px / normal |

---

## 3. Component Stylings

1. **Botão primário (CTA)** — fundo sólido `--primary` (`#1FB6FF`) com texto `#020617` (contraste máximo, inverte a lógica clara do site) OU fundo `--signal-bright` para o CTA final "assinado/verificado". `border-radius: 12px`. Padding `16px 32px`. Fonte Outfit 900, 16px. Sombra: glow suave `0 0 24px rgba(31,182,255,0.35)` em vez da sombra neutra do modo claro.
2. **Botão secundário/ghost** — fundo transparente, borda `1px solid var(--card-border)`, texto `--text-main`. Mesmo `border-radius: 12px`.
3. **Card elevado** (ex.: card de plano, card de resultado de vistoria) — fundo `--bg-main` levemente clareado (ou `--bg-main` puro com glow), borda `--card-border`, `border-radius: 20px`, padding `32px`, sombra `0 8px 40px rgba(0,0,0,0.4)` + halo azul sutil.
4. **Chip/tag de avaria** (ex.: "Porta diant. esq. · risco") — fundo `rgba(31,182,255,0.12)`, texto `--text-main`, `border-radius: 4px`, padding `4px 8px`, fonte 10px. Usar `--signal-bright` no lugar do azul quando o chip representa algo crítico/urgente.
5. **Badge "Ativo/Verificado"** — pill (`border-radius: 9999px`), fundo `--primary` ou `--signal-bright`, texto `#020617`, padding `2px 8px`, fonte 12px/700.
6. **Nav/topo** — fundo transparente sobre `--bg-main`, padding `24px 32px`, sem borda; logo + wordmark em Outfit 900 12px, cor `--text-main`.
7. **Diagrama do veículo (marcação de avarias)** — o SVG/imagem do carro em vista lateral (`diagrama-lateral-do-veculo-carro.png`) fica sobre `--bg-main`; pontos de avaria marcados como círculos pulsantes em `--signal-bright` com halo `rgba(255,185,56,0.3)`, conectados a chips de legenda como o item 4.
8. **Mockup do laudo PDF** — retângulo estilo "página", fundo levemente mais claro que `--bg-main` (simular papel escuro, não papel branco — ex. `#0a1428`) com borda `--card-border`; cabeçalho com placa em IBM Plex Mono; QR code e hash em mono também; assinatura estilizada como traço em `--primary`.
9. **Glow/grid de fundo** — grade fina quase invisível (mesma lógica do `backgrounds` do site, mas recolorida) `linear-gradient` de `rgba(31,182,255,0.03)` a cada 1px, mais um `radial-gradient` de destaque `rgba(31,182,255,0.08–0.12)` centralizado atrás do elemento hero de cada cena.
10. **Texto de hash/segurança** — sempre em IBM Plex Mono, cor `--text-muted` ou `--primary`, tamanho pequeno (12–14px), para reforçar "isso é um dado verificável", nunca decorativo.

---

## 4. Spacing & Layout

- **Unidade base**: 8px (confirmada em `design-styles.json` → `spacing.baseUnit`). Escala observada: 2, 4, 6, 8, 10, 12, 14, 16, 20, 24, 32, 40, 48, 64.
- **Raios**: 4px (chips), 12px (botões/inputs), 16px (glass/overlay), 20px (cards), 9999px (pills/badges).
- **Padding padrão de card**: 32px (mobile) a 48px 32px (seções amplas).
- **Composição das cenas**: seguir o padrão do site — hero com headline grande centralizada ou à esquerda, elemento visual (diagrama/laudo/telefone) à direita ou abaixo, respiro generoso (múltiplos de 8/16/24px) entre blocos de texto e elementos visuais. Evitar lotar a cena; o produto vende "clareza e prova", a composição deve refletir isso.
- **Hierarquia por cena**: 1 headline (Saira Condensed, display ou heading) + no máximo 1 bloco de apoio (body ou chip/badge) + 1 elemento visual principal (diagrama, laudo, celular). Não empilhar mais de 3 elementos com timing próprio por cena para manter o ritmo de vídeo curto.

---

## 5. Iteration Guide

1. **Tema escuro é inegociável.** Se qualquer captura de tela, screenshot ou trecho de `design-styles.json`/`tokens.json` sugerir bege/creme/terracota, ignore — é artefato de captura em modo claro. A marca real é `#020617` + `#1FB6FF` + `#ffb938`.
2. **Nunca usar `#9E4428` (terracota) ou `#FAF9F5`/`#E8E6DC` (bege)** em nenhuma cena, nem como acento secundário.
3. **Saira Condensed é para números e títulos grandes**; não usar em corpo de texto longo (é condensada, cansa em blocos longos). Outfit para corpo; IBM Plex Mono para qualquer coisa que pareça "dado verificável" (placa, hash, QR, timestamp).
4. **`--signal-bright` (âmbar) é escasso.** Reservar para o momento de prova/confirmação (assinatura feita, laudo gerado, hash verificado) — não usar como cor de fundo ou decoração recorrente, senão perde força de "sinal".
5. **O diagrama do carro e o PDF do laudo são os heróis visuais** — o pedido original do usuário foi justamente mostrar "como é feita a escolha de avarias" e "o PDF gerado". Toda cena que puder usar esses dois ativos reais (em vez de ilustração genérica) deve fazer isso.
6. **Botões nunca usam gradiente terracota.** Usar preenchimento sólido `--primary` ou `--signal-bright`, ou o padrão ghost/outline — nunca o `linear-gradient(135deg, #9E4428, #A34B30)` capturado no `design-styles.json`.
7. **Contraste de texto**: qualquer texto sobre `--bg-main` deve ser `--text-main` ou `--primary`/`--signal-bright` (todos AA+ verificados); nunca `--text-muted` para headline (é AA, não pensado para texto grande de destaque, embora passe).
8. **Ritmo condiz com "vídeo curto que chama atenção"**: pedido original do usuário foi por vídeos de poucos segundos. Cada cena deve comunicar 1 ideia só — não tentar caber toda a jornada (placa → marcação → laudo) numa cena única a menos que o storyboard explicitamente peça um "tour" mais longo.
9. **Reaproveitar geometria, recolorir cores.** Raios, paddings e escala tipográfica do `design-styles.json` são válidos como estão (são independentes de tema) — só as cores precisam ser trocadas pela paleta escura deste documento.
10. **Em caso de dúvida sobre uma cor não listada aqui**, preferir extrapolar a partir da paleta escura confirmada (tons de azul-marinho para fundo, azul-céu para acento, âmbar para destaque pontual) em vez de voltar ao `design-styles.json` bruto.

---

## Quick User Check

Aqui está o que extraí como identidade visual do Danos Aparentes para este vídeo:

- **Cores**: fundo azul-marinho quase-preto (`#020617`), acento azul-céu vibrante (`#1FB6FF`), destaque âmbar pontual (`#ffb938`) para momentos de prova/confirmação, texto quase-branco (`#e8f4ff`). *(Ignorei deliberadamente a paleta bege/terracota que a captura automática mostrou, porque é a mesma que você já rejeitou no vídeo anterior — o tema escuro é a marca real do produto.)*
- **Fontes**: Saira Condensed (condensada, maiúscula) para títulos grandes/números, Outfit para corpo, IBM Plex Mono para placa/hash/QR (qualquer coisa que precise parecer "dado verificável").
- **Tom**: direto e resolutivo — "prova, não desculpa". Sem humor solto; o produto resolve uma discussão real.

Isso bate com o que você quer pro vídeo? Vou seguir para o Passo 2 (alinhar mensagem e roteiro) já assumindo essa direção, a menos que você aponte algo pra ajustar.
