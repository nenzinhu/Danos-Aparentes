# Drag-to-rotate no visualizador de veículo

## Contexto

O visualizador de vistoria ([src/components/VehicleViewer.tsx](../../../src/components/VehicleViewer.tsx))
já anima a troca entre as 4 vistas fixas do veículo (`lateral-left`,
`frontal`, `lateral-right`, `traseira`) com um giro 3D via Framer Motion
(`orbitVariants`, `rotateY` ±90°, `perspective: 1100px` no container) e já
calcula o sentido do giro (`orbitDir`) a partir da ordem circular das vistas
(`VIEW_ORDER`). Essa troca hoje só é disparada clicando nos botões do
[ViewSelector.tsx](../../../src/components/ViewSelector.tsx).

Motivação: no fluxo de vistoria em campo (pátio, sol/chuva, pressa), arrastar
o dedo diretamente sobre o desenho do veículo é mais rápido e natural do que
mirar num botão pequeno. Ideia levantada em sessão de brainstorm de produto
(ver personas "Jef"/"Guerra"/"Mari" em memória do usuário) como evolução da
funcionalidade de giro que já existe — não é um recurso novo do zero.

Conflito a resolver: o mesmo container (`containerRef`) já tem gestos de
arrastar/pinçar via [useZoomPan.ts](../../../src/hooks/useZoomPan.ts), usados
para **pan** (mover a imagem) quando o zoom está ampliado (`scale > 1`) e
para pinch-zoom. Um novo gesto de arrastar-para-girar não pode quebrar esse
comportamento existente.

## Escopo

Extensão pontual do visualizador e do hook de zoom/pan já existentes. Sem
telas novas, sem mudança de schema, sem novas dependências (Framer Motion já
está no projeto).

Fora de escopo (descartado no brainstorm): vistas intermediárias/diagonais
(ex. "quina" frontal-lateral) — exigiria desenhar novos SVGs por tipo de
veículo e recalibrar coordenadas de clique de peça (`data-part-id`), custo
alto para o ganho nesta fase.

## Design

### Regra de ativação do gesto

O arrastar horizontal só é interpretado como "trocar de vista" quando
`scale === 1` (zoom no padrão). Nesse estado, fazer pan não tem utilidade —
não há nada fora da viewport pra revelar — então o gesto fica livre para
significar outra coisa.

Quando `scale > 1`, o comportamento atual de pan é mantido **sem nenhuma
mudança**.

### Threshold e direção

- Dispara a troca de vista somente se o deslocamento horizontal acumulado
  ultrapassar **60px OU 25% da largura do container** (o que for menor), E o
  movimento for predominantemente horizontal (`|dx| > |dy| * 1.5`) — evita
  conflito com scroll vertical da página em mobile.
- Abaixo do threshold, ao soltar o gesto simplesmente não muda nada (sem
  giro parcial, sem "quicar de volta").
- Direção: arrastar para a esquerda avança para a próxima vista na ordem de
  `VIEW_ORDER`; arrastar para a direita volta para a anterior. Isso alimenta
  o `orbitDir` já existente, então a animação de giro sai coerente com o
  sentido do gesto.

### Onde mexer

**`useZoomPan.ts`**
- Passa a aceitar um parâmetro opcional `onHorizontalSwipe?: (direction: 1 | -1) => void`.
- Em `onTouchMove`/`onMouseMove`, quando `scaleRef.current === 1`: em vez de
  aplicar o `translate3d` de pan, acumula o delta horizontal e, se cruzar o
  threshold, chama `onHorizontalSwipe(direction)` uma única vez por gesto
  (usa uma flag `swipeFired` resetada em `onTouchStart`/`onMouseDown`) e
  ignora o resto do gesto até soltar.
- Quando `scaleRef.current > 1`, comportamento inalterado (pan normal).

**`VehicleViewer.tsx` (`Viewport`)**
- Passa `onHorizontalSwipe` para `useZoomPan`, implementado como: calcular o
  índice atual em `VIEW_ORDER`, somar/subtrair a direção (módulo 4), e
  chamar a mesma função de troca de `viewType` que o `ViewSelector` já usa
  (via prop existente, subindo o novo `viewType` para quem gerencia esse
  estado no componente pai). O `orbitDir` já calculado em `RootComponent`
  cobre a direção da animação automaticamente — nenhuma mudança necessária
  ali.

**`ViewSelector.tsx`**
- Sem mudanças. Continua sendo o caminho por clique/teclado, e a barra de
  progresso ("X de 4 vistas vistas") reflete também as trocas feitas por
  gesto, já que ambas atualizam o mesmo estado de `viewType`.

### Acessibilidade

O gesto é aditivo. Teclado e clique nos botões do `ViewSelector` continuam
sendo o caminho primário e não dependem do drag. Usuários com
`prefers-reduced-motion` já têm a animação de giro suprimida em outros
pontos do componente (`prefersReducedMotion()`); o mesmo guard se aplica
aqui — a troca de vista ainda ocorre, só sem a transição animada.

### Testes

Teste unitário em `useZoomPan` (novo arquivo ou extensão do existente):
- Simula `touchstart` → `touchmove` (delta horizontal > 60px, `scale === 1`)
  → `touchend`: espera `onHorizontalSwipe` chamado uma vez com a direção
  correta.
- Simula o mesmo delta com `scale > 1`: espera `onHorizontalSwipe` **não**
  chamado, e que o pan (`translate3d`) tenha sido aplicado normalmente.
- Simula delta abaixo do threshold: espera `onHorizontalSwipe` não chamado.
- Simula delta predominantemente vertical: espera `onHorizontalSwipe` não
  chamado (não interpretado como swipe horizontal).

## Critérios de aceite

- Arrastar sobre o veículo com zoom padrão (100%) troca de vista na direção
  esperada, reaproveitando a animação de giro já existente.
- Com zoom ampliado, arrastar continua fazendo pan como hoje, sem trocar de
  vista.
- Clique nos botões do `ViewSelector` continua funcionando sem regressão.
- `npm test`: testes novos e existentes passam.
- `npm run build`: compila sem erros de TypeScript.
