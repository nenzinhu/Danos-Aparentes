---
format: 1080x1920
message: "Danos Aparentes troca prancheta e papel por um laudo digital de vistoria que se prova sozinho."
arc: Hook → Transformação → Reasseguramento → Capacidade → Offline → Segurança → CTA → Marca
audience: locadoras, frotistas e vistoriadores autônomos
mode: collaborative
---

## Frame 1 — Hook

- scene: Tipografia gigante em preto/azul — "chega." estoura a tela
- duration: 5.32898s
- transition_in: cut
- status: outline
- voiceover: "Chega de carregar papel, prancheta no pátio. Sério, isso já era."
- src: compositions/frames/01-hook.html
- blueprint: statement
- asset_candidates: []

Abertura fria e direta. Cansaço com o processo físico atual (papel, prancheta) vira a virada de chave logo na primeira frase.

## Frame 2 — Transformação (20min → 3 toques)

- scene: Contraste numérico grande — "20 min" riscado vira "3 toques"
- duration: 7.706122s
- transition_in: crossfade
- status: outline
- voiceover: "Com o Danos Aparentes, você transforma vinte minutos de burocracia em só três toques na tela do celular."
- src: compositions/frames/02-transform.html
- blueprint: compare-panel / stat-card
- asset_candidates: ["logo-b5d5d7ba.svg"]

O produto entra pela promessa mensurável: de 20 minutos de burocracia para 3 toques. Painel comparativo (antes/depois) ou stat-card com o número em destaque.

## Frame 3 — Esquece (reasseguramento)

- scene: Lista de problemas antigos desvanecendo (fadelist) — papel molhado, rasgado, foto perdida
- duration: 6.060408s
- transition_in: crossfade
- status: outline
- voiceover: "Sabe aquela história de papel molhado, rasgado ou foto que some na galeria? Esquece!"
- src: compositions/frames/03-esquece.html
- blueprint: fadelist
- asset_candidates: []

Fadelist com os três problemas físicos citados, cada um perdendo opacidade, coroado pela palavra grande "esquece." como título oposto.

## Frame 4 — Laudo 100% digital

- scene: Lista com marcador — digital, assinado na tela, GPS, hora exata
- duration: 7.053061s
- transition_in: crossfade
- status: outline
- voiceover: "O laudo é cem por cento digital, assinado na tela, e já sai com o GPS e a hora exata da vistoria."
- src: compositions/frames/04-digital.html
- blueprint: bullet (capped at 3) + kicker "100% digital"
- asset_candidates: ["diagrama-lateral-do-veculo-carro.png"]

Lista curta (máx. 3 itens) das capacidades citadas na fala: assinatura na tela, GPS, hora exata.

## Frame 5 — Offline

- scene: Pergunta em destaque — "e se o pátio estiver sem sinal?" — resposta calma logo abaixo
- duration: 9.377959s
- transition_in: crossfade
- status: outline
- voiceover: "E se o pátio estiver sem sinal? Não tem problema nenhum. Ele funciona totalmente offline e sincroniza sozinho quando a internet voltar."
- src: compositions/frames/05-offline.html
- blueprint: statement (pergunta → resposta em dois beats)
- asset_candidates: []

Formato pergunta/resposta: a pergunta entra primeiro, tensiona, depois a resposta calma resolve — pacing casado com a fala.

## Frame 6 — Segurança (Hash + QR)

- scene: Stat-card duplo — Hash SHA-256 / QR Code — com selo "blindado contra fraudes"
- duration: 11.62449s
- transition_in: crossfade
- status: outline
- voiceover: "Para fechar com segurança total, o sistema gera criptografia SHA-256 e QR Code. É blindado contra fraudes e contestações."
- src: compositions/frames/06-seguranca.html
- blueprint: stat-card ×2 + bar-track (opcional)
- asset_candidates: []

Cena mais técnica e mais longa (11.6s) — dá tempo pra dois stat-cards (Hash / QR) surgirem em sequência, fechando com o selo de "blindado contra fraudes".

## Frame 7 — CTA

- scene: Chamada direta — "7 dias grátis" grande, "sem cartão" como subtexto
- duration: 7.392653s
- transition_in: crossfade
- status: outline
- voiceover: "Quer simplificar sua operação hoje? Testa grátis por sete dias. Não precisa nem de cartão."
- src: compositions/frames/07-cta.html
- blueprint: statement (registro orange — declaração)
- asset_candidates: []

Registro orange (fundo de destaque) para a chamada — inversão de contraste sinaliza "hora de agir".

## Frame 8 — Marca / outro

- scene: Logo + URL centralizados, fundo escuro, fecha limpo
- duration: 3.892245s
- transition_in: crossfade
- status: outline
- voiceover: "Entra lá: danosaparentes.com.br"
- src: compositions/frames/08-outro.html
- blueprint: cover (register dark, sem chrome)
- asset_candidates: ["logo-b5d5d7ba.svg"]

Fecho de marca, curto e memorável — logo + URL, sem ornamento.
