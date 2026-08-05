# Design: Chatbot de suporte nas landing pages de segmento

**Data:** 2026-07-14
**Status:** Aprovado (aguardando revisão do spec)
**Escopo:** Widget de chat com IA (Gemini) nas 4 landing pages de segmento (`/locadoras`, `/oficinas`, `/seguradoras`, `/frotas`), grounded no conteúdo já publicado do site, com fallback honesto para WhatsApp quando a pergunta sai do escopo. Sem dashboard de análise, sem base de conhecimento nova, sem chatbot no restante do site nesta fase.

## Problema

As 4 landing pages de segmento ([[2026-07-13-landing-pages-por-segmento-design]]) já têm FAQ estático, mas um visitante com uma dúvida específica não coberta pela FAQ só tem o WhatsApp como saída — que exige sair do fluxo de leitura e trocar de app. Um chatbot na própria página reduz essa fricção para quem está quase convertendo, desde que não corra o risco comum desse tipo de recurso: inventar resposta sobre preço/prazo/capacidade quando não sabe.

## Objetivo

Adicionar um widget de chat nas 4 landings que responde dúvidas com base no conteúdo já publicado (FAQs, planos, funcionamento do produto) e admite explicitamente quando não sabe, oferecendo o WhatsApp em vez de arriscar uma resposta errada.

## Decisões de produto (brainstorm)

| Decisão | Escolha |
|---|---|
| Objetivo do bot | Responder dúvidas e converter — não é qualificação de lead nem suporte pós-venda |
| Fonte de conhecimento | Reaproveitar conteúdo já existente (FAQs das landings, planos, funcionamento) — resumido, não o texto bruto dos posts |
| Fallback/escalonamento | Sempre oferecer o WhatsApp quando a pergunta sai do escopo, sem tentar responder mesmo assim |
| Onde aparece | Só nas 4 landings de segmento (não no restante do site, nesta fase) |
| Intenções cobertas | Preço/planos, como funciona a vistoria, QR Code + hash anti-fraude, funcionamento offline, white-label, pergunta específica do segmento da landing |
| Fora de escopo | Negociação de contrato Corporativo, suporte técnico de conta já existente — cai direto no fallback de WhatsApp |
| Contato de WhatsApp | Número atualizado para (48) 99203-2348 (`5548992032348`) em `src/lib/whatsapp.ts` e `ShareBar.tsx`, antes desta feature |

## Abordagens consideradas

### A — Bot com IA (Gemini) grounded no conteúdo do site ✅ (escolhida)
Reaproveita o mesmo padrão já existente em `src/app/api/ia/route.ts` (Gemini 1.5 Flash). Uma rota nova recebe a pergunta e monta um system prompt com o conteúdo de grounding + instrução explícita de admitir quando não sabe. Custo baixo dado o volume atual de tráfego; não exige banco vetorial porque o conteúdo de grounding é pequeno o suficiente para caber direto no prompt.

### B — Bot só por regras, sem IA (descartada)
Mapeamento de palavras-chave para respostas fixas. Zero custo de API, mas é exatamente o padrão "scripted-bot" que falha na primeira pergunta fora do script —rejeitado por não atender ao objetivo de responder dúvidas reais dos visitantes.

### C — Ferramenta de chat SaaS (Intercom, Crisp etc.) (descartada)
Mais robusta, mas tem custo mensal e overhead de configuração desproporcional ao estágio atual do produto (site com poucos dias, tráfego baixo, orçamento só orgânico).

---

## Arquitetura

### Responsabilidades por arquivo

| Item | Arquivo | Responsabilidade |
|---|---|---|
| Grounding | `src/content/chatSupportKnowledge.ts` *(novo)* | Conteúdo resumido por intenção (preços, como funciona, QR/hash, offline, white-label) + bloco específico por segmento (`locadoras`, `oficinas`, `seguradoras`, `frotas`) |
| API | `src/app/api/chat-support/route.ts` *(novo)* | Recebe `{ message, segment, history }`, monta o system prompt com o grounding do segmento, chama Gemini 1.5 Flash, aplica rate-limit por IP/sessão, retorna a resposta |
| Widget | `src/components/ChatSupportWidget.tsx` *(novo)* | Botão flutuante + painel de chat (histórico + input), client component, recebe `segment` como prop |
| Integração | `src/app/oficinas/page.tsx`, `src/app/seguradoras/page.tsx`, `src/app/frotas/page.tsx`, `src/app/locadoras/page.tsx` | Renderizam `<ChatSupportWidget segment="..." />` |
| Contato | `src/lib/whatsapp.ts`, `src/components/ShareBar.tsx` | Número já atualizado para `5548992032348` nesta sessão, antes da spec |

### Fluxo de dados

```
Visitante digita pergunta no ChatSupportWidget (landing X)
   │
   ▼
POST /api/chat-support { message, segment: 'oficinas', history }
   │
   ▼
route.ts monta system prompt:
   - grounding geral (preços, como funciona, QR/hash, offline, white-label)
   - grounding específico de chatSupportKnowledge[segment]
   - instrução: "responda só com base nisso; se não souber, diga que não tem
     certeza e ofereça o WhatsApp"
   │
   ▼
Gemini 1.5 Flash gera resposta
   │
   ▼
Resposta volta ao widget; se contiver o marcador de fallback, o widget
renderiza um botão de WhatsApp (whatsappLink) com mensagem pré-preenchida
contextual, além do texto da resposta
```

### Detecção de fallback

O system prompt instrui o modelo a iniciar a resposta com um marcador fixo (ex: `[ESCALAR]`) sempre que a pergunta sair do escopo de grounding, antes do texto explicando que não tem certeza. A rota da API detecta esse marcador na resposta, remove-o do texto exibido, e retorna um campo `escalate: true` no JSON de resposta. O widget usa esse campo (não parsing de linguagem natural) para decidir se mostra o botão de WhatsApp — mais confiável do que tentar inferir intenção de escalonamento a partir do texto livre.

### Rate limiting

A rota é pública (sem login, diferente de `/api/ia` que exige assinatura ativa). Para conter custo de abuso, aplica um limite simples em memória por IP (ex: 10 mensagens/minuto) na própria rota — suficiente para o volume atual do site; não introduz Redis nem infraestrutura nova nesta fase.

### Tratamento de erros

Falha de rede, erro do Gemini ou rate-limit estourado: o widget exibe uma mensagem de erro simples no próprio chat ("Não consegui responder agora") acompanhada do botão de WhatsApp direto, sem travar a interface nem exigir reload da página.

---

## Fora de escopo (próximos passos, não agora)

- Dashboard/analytics de conversas (taxa de fallback, taxa de escalonamento por intenção) — poderia informar iteração futura, mas não é necessário para o lançamento inicial dado o volume baixo de conversas esperado
- Chatbot em outras páginas do site (home, blog, planos) — avaliar depois que o comportamento nas 4 landings for validado
- Base de conhecimento dedicada (fora do conteúdo já publicado) — só se o conteúdo atual se mostrar insuficiente
- Histórico de conversa persistido entre sessões (hoje vive só em memória do componente, perdido ao recarregar a página)

## Testes / verificação

- Build local (`next build`) sem erro, com a nova rota de API e o widget presente nas 4 landings
- Verificação manual, conversando com o bot ao vivo em cada uma das 4 landings, cobrindo: as 6 intenções listadas + ao menos 2 perguntas propositalmente fora de escopo (ex: "quanto vocês cobram para reduzir o preço do Corporativo?", "meu app não está sincronizando, o que fazer?") — confirmando que essas caem no fallback de WhatsApp em vez de gerar resposta inventada
- Confirmar que o botão de WhatsApp do fallback abre com o número correto (`5548992032348`) e mensagem contextual
- Simular erro (ex: derrubar a rota temporariamente ou forçar rate-limit) e confirmar que o widget mostra a mensagem de erro + botão de WhatsApp, sem quebrar a página
