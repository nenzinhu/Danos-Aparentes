# Landing Redesign + Rebranding "Danos Aparentes" — Design

## Contexto

A landing page (`src/pages/Landing.tsx`) já existe, seguindo o spec aprovado em
[[2026-06-15-landing-page-design]]. Desde então, a assinatura mensal (R$49,90/mês + trial de
7 dias) foi implementada — o spec antigo deixava de fora uma seção de preço por não existir
modelo de cobrança ainda. Este documento cobre três mudanças relacionadas, decididas em uma
sessão de brainstorm com companion visual:

1. Redesign visual da landing (direção "neon refinado") + nova seção de preço.
2. Rebranding do nome do produto para **"Danos Aparentes"**, app-wide.
3. Adoção de uma logo nova (imagem fornecida pelo usuário) com animação de abertura na landing.

## 1. Direção visual: Neon refinado

Mantém a paleta azul/dark neon já usada no app (`#00aaff`, `#00d4ff` sobre fundo escuro), sem
trocar de tema. O refinamento é de profundidade e composição — mais glow, melhor uso de espaço
negativo — não uma reformulação de cores. As seções existentes (Hero, Funcionalidades, Como
funciona, CTA final, Footer) mantêm a mesma estrutura aprovada no spec de 15/06, só com mais
polish visual.

## 2. Nova seção: Preço

Inserida entre "Como funciona" e o CTA final. Layout: card único centralizado com checklist de
benefícios (decidido via companion visual, opção "card com lista de benefícios" sobre as
alternativas "card único simples" e "faixa horizontal"):

- Preço: `R$ 49,90/mês`
- Lista de benefícios (✓): Vistorias ilimitadas · Laudo em PDF com QR Code · Sincronização em
  nuvem · 7 dias grátis pra testar
- CTA: "Criar conta grátis" → linka para `/app.html`, igual aos outros CTAs da página (não
  chama a API de checkout do Stripe diretamente — é só marketing/entrada pro app, onde o fluxo
  de assinatura já existente assume a partir daí).

## 3. Rebranding: "Danos Aparentes"

Substitui as variantes inconsistentes atualmente em uso (`Vistoria+`, `Avarias Aparentes`,
`AvariasAPARENTES PWA`, `VISTORIA+`) pelo nome único **"Danos Aparentes"**, em todo o app:

| Arquivo | Ocorrência atual | Nova |
|---|---|---|
| `src/components/Header.tsx:30` | `Avarias Aparentes` (h1) | `Danos Aparentes` |
| `src/components/Paywall.tsx:26-27` | `Vistoria+` (×2) | `Danos Aparentes` |
| `src/lib/pdf.ts:363,433` | `AvariasAPARENTES PWA` (×2) | `Danos Aparentes` |
| `src/lib/pdf.ts:365` | `Documento Técnico de Mapeamento de Avarias Aparentes` | `Documento Técnico de Mapeamento de Danos Aparentes` |
| `src/pages/Landing.tsx:155` (footer) | `Vistoria+ — Vistoria de Danos Aparentes` | `Danos Aparentes — App de Inspeção e Registro` |
| `src/components/Logo.tsx:24` | `VISTORIA+` (texto do componente) | Componente reescrito (ver seção 4) |

Termos genéricos que não são o nome do produto (ex: "Sistema de Vistoria PRO" no badge do
Header, "RELATÓRIO DE VISTORIA VEICULAR" nos relatórios, "Assinatura do Vistoriador") **não**
são alterados — só a marca em si.

## 4. Logo

A imagem fornecida (`LOGO-transparent.png`, 2048×2048, fundo transparente) é um ícone de app
quadrado com ilustração dos veículos + o texto "DANOS APARENTES / App de Inspeção e Registro"
desenhado dentro da própria imagem.

Dois usos distintos, decididos via companion visual:

- **Header (uso recorrente, pequeno):** versão **recortada** da imagem — só a faixa superior
  com a ilustração dos veículos, removendo a faixa de texto inferior (que ficaria ilegível em
  tamanho pequeno). O texto "Danos Aparentes" é escrito ao lado, em HTML/CSS normal (mesmo
  padrão do `Logo.tsx` atual, que já combina ícone + texto). `src/components/Logo.tsx` é
  reescrito para usar essa imagem cropada em vez do SVG desenhado à mão atual.
- **Animação de abertura (só na landing):** usa a imagem **completa** (com texto), animada.

O crop exato é gerado como um asset estático na implementação (não precisa ficar pixel-perfeito
no spec — a costura visual é validada depois de gerado). Os dois assets (original completo +
versão cropada) vão para `public/`, servidos como arquivos estáticos.

## 5. Animação de abertura

Componente novo (ex: `src/components/IntroAnimation.tsx`), renderizado no topo da `Landing`,
antes do conteúdo normal. Estilo escolhido via demo animada no companion visual: **"Revelação
com brilho neon"** — a logo completa aparece com fade-in + um glow azul neon que pulsa e depois
assenta (~1.4s), depois a animação se desfaz revelando o conteúdo normal da landing.

- Toca **toda vez** que a landing carrega (decisão explícita — não usa `localStorage` para
  suprimir em visitas repetidas, já que a duração curta não compromete a experiência).
- Só ocorre na `Landing` (`/`) — não afeta `/app.html` nem nenhuma outra página.
- Implementada com CSS `@keyframes` (mesma técnica usada no protótipo do companion), sem
  dependência de animação nova além do que o projeto já usa (Framer Motion já está disponível
  no projeto, mas CSS puro é suficiente aqui e evita custo de bundle adicional).

## Fora de escopo

- Mudar o nome do **repositório/projeto** (`AvariasAPARENTES-PWA-main`, `package.json` name
  `danos-veiculos-react`) — só strings visíveis ao usuário final são alteradas.
- Animação de abertura no app principal (`/app.html`) — só a landing.
- Edição de pixels da imagem fora do crop simples (remover/redesenhar elementos) — usa a
  imagem fornecida como está.

## Validação

Sem suite de testes automatizada (consistente com o resto do projeto); validação manual:

1. Abrir `/` e confirmar que a animação de abertura toca (logo com glow neon) antes do
   conteúdo normal aparecer.
2. Recarregar a página e confirmar que a animação toca de novo (não é suprimida).
3. Confirmar visualmente a nova seção de preço entre "Como funciona" e o CTA final.
4. Buscar no app inteiro por `Vistoria+`, `VISTORIA+`, `AvariasAPARENTES PWA` e confirmar que
   não restam ocorrências fora do escopo definido (nomes de arquivo/repositório/pacote, que
   são explicitamente fora de escopo).
5. Testar responsividade em mobile (landing já precisa funcionar bem em celular, conforme
   spec original).
