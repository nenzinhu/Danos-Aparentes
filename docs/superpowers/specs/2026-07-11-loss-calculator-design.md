# Design: Calculadora de Prejuízo Compartilhável

**Data:** 2026-07-11
**Status:** Aprovado (aguardando revisão do spec)
**Escopo:** Página `/calculadora` com fórmula por persona (frota/locadora vs. autônomo), estado na URL, e imagem de prévia (Open Graph) dinâmica refletindo o resultado calculado. Sem captura de e-mail, sem persistência em banco.

## Problema

O produto tem conteúdo de blog e páginas de categoria (Fase 1 de SEO), mas nada desenhado especificamente para gerar compartilhamento espontâneo ("chamar atenção"). Uma calculadora de prejuízo é um formato comprovado de conteúdo compartilhável — mas só funciona como isca de atenção se o link, ao ser colado no WhatsApp/LinkedIn, já mostrar o número calculado na prévia (card de link), não apenas o título genérico da página.

## Objetivo

Uma ferramenta simples, sem fricção, em que:
1. O usuário escolhe seu perfil (frota/locadora ou vistoriador autônomo) e ajusta poucos números.
2. Vê um valor de prejuízo (R$/mês ou horas/mês) calculado na hora.
3. Compartilha um link que já carrega esse resultado — para quem recebe, e como card de prévia (imagem OG dinâmica) antes mesmo do clique.

## Decisões de produto (brainstorm)

| Decisão | Escolha |
|---|---|
| Público | Dois caminhos: frota/locadora (mira plano Corporativo) e autônomo (mira plano Profissional), com uma escolha inicial de persona |
| Localização | Página própria, `/calculadora` |
| Captura de lead | Nenhuma — resultado livre, sem pedir e-mail (maximiza compartilhamento; captura de lead fica para outra spec) |
| Compartilhamento | Estado nos parâmetros da URL + imagem de prévia (Open Graph) dinâmica gerada a partir desses parâmetros |
| Fórmula frota | `veículos/mês × % contestação × custo médio por avaria não comprovada` → R$/mês |
| Fórmula autônomo | `vistorias/mês × minutos perdidos por vistoria ÷ 60` → horas/mês (sem pedir salário) |

## Abordagens consideradas

### A — Calculadora sem estado compartilhável (descartada)
Só client-side, sem refletir na URL. Simples, mas cada link compartilhado abre em branco — perde o efeito viral, que é o objetivo declarado desta spec.

### B — Estado na URL, sem imagem de prévia dinâmica
Link compartilhado já abre com os números preenchidos. Melhor que A, mas a prévia do link (WhatsApp/LinkedIn) mostra só o título genérico da página — o "gancho" que faz alguém clicar não aparece antes do clique.

### C — Estado na URL + imagem de prévia dinâmica ✅ (escolhida)
Mesma base de B, mas a página gera uma imagem Open Graph (1200×630) com o número calculado, servida por uma rota dedicada que lê os mesmos parâmetros. É o que efetivamente faz o link "chamar atenção" no feed/chat antes do clique — sem isso, a ferramenta é só mais uma calculadora.

---

## Arquitetura

### Arquivos

| Arquivo | Responsabilidade |
|---|---|
| `src/lib/lossCalculator.ts` *(novo)* | Funções puras: parse/clamp dos parâmetros da URL, cálculo de cada fórmula. Única fonte de verdade da fórmula — usada tanto pela página quanto pela imagem OG. |
| `src/app/calculadora/page.tsx` *(novo)* | Server Component. Lê `searchParams`, monta `generateMetadata` (título, descrição, `openGraph.images` apontando para a rota de imagem com os mesmos parâmetros), renderiza `LossCalculator` com os valores iniciais. |
| `src/components/LossCalculator.tsx` *(novo)* | Client Component. Escolha de persona, inputs, resultado ao vivo, botão de compartilhar no WhatsApp. Atualiza a URL visível via `window.history.replaceState` (debounced) conforme o usuário ajusta os campos — sem usar `router.replace` do Next.js, que re-renderiza o Server Component a cada chamada; aqui só a URL precisa refletir o estado, o cálculo já é local. |
| `src/app/api/og/calculadora/route.tsx` *(novo)* | Route Handler. Lê os mesmos parâmetros, roda `lossCalculator.ts`, devolve uma imagem via `next/og` (`ImageResponse`). |
| `src/app/sitemap.ts` | Adiciona `/calculadora` (sem parâmetros) como entrada estática. |

### Parâmetros da URL

- `tipo`: `'frota' | 'autonomo'` — ausente = tela de escolha de persona, sem resultado.
- Frota: `veiculos` (1–2000, padrão 50), `contestacao` (0–100, padrão 15, em %), `custo` (0–100000, padrão 800, em R$).
- Autônomo: `vistorias` (1–2000, padrão 40), `minutos` (0–120, padrão 12).

Qualquer valor ausente, não-numérico ou fora da faixa cai no padrão — nunca gera erro ou `NaN`. A validação/clamp vive em `lossCalculator.ts` e é a mesma função usada pela página e pela imagem OG, então os dois nunca podem divergir.

### Fluxo de dados

```
URL (searchParams)
   │
   ├─ page.tsx (Server) ──► generateMetadata ──► openGraph.images: /api/og/calculadora?<mesmos params>
   │        │
   │        └─ passa valores iniciais para
   │
   └─ LossCalculator (Client)
            │
            ├─ recalcula ao vivo via lossCalculator.ts (mesma fórmula)
            └─ history.replaceState(nova URL) a cada mudança de input (debounced, sem round-trip ao servidor)
```

Quando alguém abre um link compartilhado, o crawler do WhatsApp/LinkedIn busca a página, `generateMetadata` monta a URL da imagem com os parâmetros, e o crawler busca `/api/og/calculadora?...` separadamente — essa rota roda a mesma fórmula e devolve a imagem com o número. A pessoa que abre o link no navegador vê a calculadora já preenchida com os números de quem compartilhou.

### Imagem de prévia (Open Graph)

- 1200×630px (padrão esperado por WhatsApp/LinkedIn/Twitter).
- Fundo escuro (navy, consistente com a paleta do site), logo "Danos Aparentes", número grande em destaque, uma linha de contexto abaixo (ex.: "perdidos com avarias contestadas" ou "perdidas com retrabalho").
- Sem parâmetros válidos (`tipo` ausente/inválido): imagem genérica de marca, sem número — nunca mostra um resultado fabricado.

### Fórmulas e valores padrão

| Persona | Fórmula | Padrões |
|---|---|---|
| Frota/locadora | `veiculos × (contestacao / 100) × custo` → R$/mês | 50 veículos, 15% contestação, R$ 800/avaria |
| Autônomo | `vistorias × minutos / 60` → horas/mês | 40 vistorias, 12 min/vistoria |

**Nota:** os valores padrão acima são estimativas de partida, não dados de mercado validados. O dono do produto deve revisá-los antes ou logo depois da publicação — um número que pareça exagerado prejudica a credibilidade da ferramenta, que é o oposto do objetivo (chamar atenção de forma positiva).

## Fora de escopo

- Captura de e-mail / lead magnet (fica para outra spec, já mencionada como Fase 2 do SEO).
- Persistência dos resultados em banco de dados.
- Métricas/analytics de quantos compartilhamentos a calculadora gera (poderia ser adicionado depois via evento de clique no botão de compartilhar).

## Testes / verificação

- Projeto não tem test runner (confirmado em specs anteriores) — verificação via `npx tsc --noEmit`, `npm run build`, e checagem manual no navegador.
- Checar que `/api/og/calculadora` (sem parâmetros e com parâmetros de cada persona) devolve uma imagem PNG válida (`curl -I`, content-type e tamanho de resposta não-trivial).
- Checar que parâmetros inválidos (texto, negativo, fora da faixa) não quebram nem a página nem a imagem — caem no padrão.
- Não é possível verificar nesta sessão como o WhatsApp/LinkedIn realmente renderizam a prévia do link — isso só é testável com uma URL pública (após deploy), idealmente usando o depurador de compartilhamento de cada rede.
