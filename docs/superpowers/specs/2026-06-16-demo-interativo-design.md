# Demo Interativo de Página Única — Design

## Contexto

A landing page atual (`/`, [[2026-06-16-landing-redesign-rebranding-design]]) é uma página com
rolagem (Hero → Funcionalidades → Como funciona → Preço → CTA). O usuário pediu uma **segunda
opção** de página: uma vitrine de página única, sem rolagem, mostrando o produto em ação —
o SVG do veículo clicável, com voz e seleção de avarias — sem precisar de conta.

Esta é uma rota nova e independente; a landing atual em `/` não é alterada.

## Objetivo

Dar a um visitante uma demonstração imediata e prática do que o produto faz — clicar numa peça
do carro, escolher o tipo de avaria, ouvir a voz — sem rolar a página e sem precisar criar
conta. Termina com um CTA para criar conta.

## Rota e entrada

Novo arquivo `demo.html` na raiz (mesmo padrão multi-página já usado por `index.html`,
`app.html`, `verify.html`), com entry point `src/demo-main.tsx` montando `src/pages/Demo.tsx`.
`vite.config.ts` ganha uma nova entrada `demo` em `build.rollupOptions.input`.

Sem animação de abertura (`IntroAnimation`) nesta página — o objetivo é ir direto ao demo, sem
atraso.

## Layout (página única, sem rolagem — `100vh`)

1. **Header compacto**: logo "Danos Aparentes" (componente `Logo` já existente) + link "Entrar"
   apontando para `/app.html`.
2. **Área central** (ocupa o espaço restante do viewport): uma legenda curta ("Clique nas peças
   do carro pra marcar uma avaria") acima do `VehicleViewer` já existente, fixado em
   `vehicleType="car"` e `viewType="lateral-left"` — sem seletores de tipo/vista, para manter a
   tela enxuta.
3. **Contador discreto**: número de avarias marcadas na sessão atual (ex.: "3 avarias
   marcadas"), no mesmo estilo visual já usado no contador "Avarias Registradas" do app
   (`App.tsx`).
4. **CTA fixo no rodapé**: "Gostou? Criar conta grátis" → `/app.html`.

## Comportamento e dados

- Reaproveita o `VehicleViewer` existente (`src/components/VehicleViewer.tsx`) sem nenhuma
  modificação — ele já é autocontido: renderiza seus próprios `<VehicleDefs />` e o popover
  `DamageFloat` internamente, então a página `Demo` não precisa lidar com esses detalhes.
- Reaproveita o hook `useTts` existente sem modificações — mesma configuração padrão (voz
  nativa, sem alterar nada relacionado a engine/gênero/velocidade), disparada nos mesmos
  eventos de clique/hover que o app principal já usa.
- **Não reaproveita `useDamages`**, porque esse hook persiste cada avaria no IndexedDB
  (`db.putDamage`) — incompatível com o objetivo de não salvar nada nesta página de
  demonstração, que não exige conta. Em vez disso, `Demo.tsx` mantém um `useState<Damage[]>`
  local com funções `addDamage`/`removeDamage` equivalentes em assinatura às do hook real, mas
  que só atualizam o estado em memória — sem nenhuma chamada a `db`, Supabase, ou
  `localStorage`. As avarias marcadas desaparecem ao recarregar a página; isso é esperado e não
  precisa de aviso ao usuário (é uma vitrine, não uma ferramenta de trabalho real).
- Nenhum login, nenhuma conta, nenhuma sincronização — a página funciona inteiramente sem
  `supabaseEnabled`/sessão.

## Fora de escopo

- Seletor de tipo de veículo ou de vista (fixo em carro / lateral esquerda).
- Salvar, exportar PDF, ou qualquer ação que persista dados.
- Animação de abertura (`IntroAnimation`).
- Qualquer alteração na landing page existente (`/`) ou no app principal (`/app.html`).

## Validação

Sem suite de testes automatizada (consistente com o resto do projeto); validação manual:

1. Acessar `/demo.html` sem estar logado e confirmar que a página carrega sem pedir conta.
2. Confirmar que tudo cabe na tela sem precisar rolar, em desktop e em um viewport mobile
   comum (375×812).
3. Clicar numa peça do carro, escolher um tipo de avaria no popover, confirmar que o contador
   de avarias incrementa e que a voz fala (se TTS estiver disponível no navegador).
4. Recarregar a página e confirmar que as avarias marcadas anteriormente desapareceram (estado
   em memória, não persistido).
5. Clicar em "Criar conta grátis" e confirmar que leva para `/app.html`.
