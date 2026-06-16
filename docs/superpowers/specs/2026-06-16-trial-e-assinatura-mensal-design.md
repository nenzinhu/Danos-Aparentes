# Trial de 7 dias + Assinatura mensal — Design

## Contexto

O Vistoria+ (AvariasAPARENTES-PWA) hoje é gratuito para qualquer usuário autenticado via
Supabase Auth, sem nenhum controle de tempo de uso ou cobrança. Não existe ainda nenhuma
tabela de assinatura/pagamento nem integração com gateway de pagamento.

Este documento desenha a introdução de um **trial gratuito de 7 dias** seguido de uma
**assinatura mensal paga única (R$ 49,90/mês)**, usando **Stripe** como gateway.

Não há usuários reais cadastrados hoje — não é necessário desenhar migração/grandfathering
para contas existentes.

Este é o primeiro de dois subprojetos identificados a partir do pedido original do usuário;
o segundo (seção de contato B2B na landing page) tem spec própria.

## Objetivo

- Todo novo usuário ganha 7 dias de acesso completo ao app, sem precisar cadastrar cartão.
- Ao final dos 7 dias, se não assinar, o acesso ao app é **totalmente bloqueado** (tela de
  paywall) até que ele assine o plano mensal.
- Assinatura mensal única, R$ 49,90/mês, sem múltiplos planos/tiers.
- Usuário assinante pode gerenciar a própria assinatura (cancelar, trocar cartão) sem
  intervenção manual.

## Não-objetivos (fora de escopo nesta v1)

- Múltiplos planos/tiers de preço.
- Cupons de desconto, período de trial customizável por usuário.
- Pagamento via Pix/boleto (Stripe Checkout no Brasil prioriza cartão; pode ser revisitado
  depois).
- Cobrança anual.
- Qualquer lógica de migração de usuários existentes (não há usuários reais hoje).

## Modelo de dados (Supabase)

Nova tabela `subscriptions`, uma linha por usuário:

```sql
create table if not exists subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  status text not null default 'trialing', -- 'trialing' | 'active' | 'past_due' | 'canceled'
  trial_ends_at timestamptz not null,
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_end timestamptz,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table subscriptions enable row level security;

-- Usuário só LÊ a própria linha. Nunca escreve diretamente (cliente não é confiável
-- para decidir se pagou ou não) — escrita é só via service role (webhook do Stripe).
create policy "select_own_subscription" on subscriptions
  for select using (auth.uid() = user_id);
```

### Criação automática do trial

Um trigger no Postgres, disparado em `insert` em `auth.users`, cria a linha em
`subscriptions` com `status = 'trialing'` e `trial_ends_at = now() + interval '7 days'`.
Roda no banco, não depende do front-end — não é possível burlar o trial recarregando a
página ou manipulando o client.

```sql
create or replace function public.handle_new_user_trial()
returns trigger as $$
begin
  insert into public.subscriptions (user_id, status, trial_ends_at)
  values (new.id, 'trialing', now() + interval '7 days');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created_trial
  after insert on auth.users
  for each row execute function public.handle_new_user_trial();
```

## Fluxo de pagamento (Stripe + Vercel Functions)

Três endpoints serverless em `/api` (Vercel Functions, Node.js):

### `/api/create-checkout-session`
- Recebe o JWT do Supabase do usuário autenticado (via header `Authorization`).
- Valida o usuário com o client Supabase (anon key + JWT).
- Cria uma Stripe Checkout Session em modo `subscription`, usando `STRIPE_PRICE_ID`
  (preço fixo de R$ 49,90/mês cadastrado no Stripe).
- `success_url`: volta para o app (`/app.html?checkout=success`).
- `cancel_url`: volta para a tela de paywall (`/app.html?checkout=canceled`).
- Retorna a URL da sessão; o client faz `window.location.href = url`.

### `/api/create-portal-session`
- Mesma validação de JWT.
- Busca `stripe_customer_id` na tabela `subscriptions` do usuário.
- Cria uma Stripe Billing Portal Session e retorna a URL.
- Client redireciona; o portal (hospedado pelo Stripe) permite cancelar, trocar cartão,
  ver faturas — sem UI própria necessária.

### `/api/stripe-webhook`
- Verifica a assinatura do webhook (`stripe-signature` header + `STRIPE_WEBHOOK_SECRET`).
  Sem isso, rejeita a requisição (evita atualização de status por chamadas falsas).
- Usa a `SUPABASE_SERVICE_ROLE_KEY` para escrever na tabela `subscriptions` (bypassa RLS,
  já que é o backend confiável).
- Eventos tratados:
  - `checkout.session.completed` → grava `stripe_customer_id`, `stripe_subscription_id`,
    seta `status = 'active'`.
  - `customer.subscription.updated` → atualiza `status` (mapeando o status do Stripe:
    `active`/`trialing`/`past_due`/`canceled`/`unpaid`) e `current_period_end`.
  - `customer.subscription.deleted` → `status = 'canceled'`.

### Variáveis de ambiente novas
`STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, `STRIPE_WEBHOOK_SECRET`,
`SUPABASE_SERVICE_ROLE_KEY` (server-side only, nunca exposta ao client).

## Bloqueio de acesso e UI

Hook `useSubscription()` (client) lê a linha de `subscriptions` do usuário logado via
Supabase e calcula:

```
acesso liberado = status === 'active'
               || (status === 'trialing' && trial_ends_at > agora)
```

Comportamento em `App.tsx`:

- **Sem acesso** (`trialing` expirado ou `past_due`/`canceled`) → renderiza tela de
  **Paywall** no lugar do app: título explicando a situação (trial acabou / pagamento
  falhou), preço do plano, botão "Assinar agora" que chama `create-checkout-session`.
- **Trial ativo** → app funciona normalmente; badge discreto no `Header`
  ("🎁 Teste grátis: N dias restantes").
- **Assinante ativo** (`status === 'active'`) → app funciona normalmente; no Header,
  badge "✓ Assinatura ativa" + botão "Gerenciar assinatura" (chama
  `create-portal-session`).
- **`past_due`** → mesma tela de paywall, com mensagem específica ("seu pagamento
  falhou, atualize seu cartão") em vez do texto de trial expirado.

A tela de Paywall reaproveita os estilos visuais já existentes no projeto (cards,
gradientes, paleta de cores do `index.css`) para manter consistência visual.

## Tratamento de erros

- Webhook sempre valida a assinatura criptográfica antes de processar qualquer evento;
  requisição inválida é rejeitada com 400 e nada é escrito no banco.
- Checkout cancelado ou com erro → usuário volta para a tela de paywall, nenhum dado é
  alterado, pode tentar novamente.
- Falha ao chamar `create-checkout-session`/`create-portal-session` (ex: Stripe fora do
  ar, erro de rede) → mostra mensagem de erro amigável na própria tela de paywall/header,
  com botão para tentar novamente; nunca quebra o restante do app.
- Se a linha de `subscriptions` não existir por algum motivo (ex: trigger falhou) →
  tratar como "sem acesso" (fail-closed) e logar o erro, em vez de liberar acesso por
  padrão.

## Testes

- Todo o fluxo é testado em modo de teste do Stripe (chaves `sk_test_`/`pk_test_`,
  cartões de teste como `4242 4242 4242 4242`) antes de qualquer chave de produção ser
  configurada:
  - Assinar com sucesso → status vira `active`.
  - Cancelar pelo portal → status vira `canceled`, acesso bloqueado.
  - Cartão recusado (cartão de teste específico do Stripe) → status `past_due`, mensagem
    correta no paywall.
  - Trial expirando (ajustando `trial_ends_at` manualmente em ambiente de teste) → app
    bloqueia corretamente ao expirar.

## Resumo do que será criado

| Item | Tipo |
|---|---|
| `subscriptions` (tabela) + trigger de trial | Migration SQL (Supabase) |
| `/api/create-checkout-session.js` | Vercel Function |
| `/api/create-portal-session.js` | Vercel Function |
| `/api/stripe-webhook.js` | Vercel Function |
| `useSubscription()` | Hook React |
| Tela de Paywall | Componente React |
| Badge de trial/assinatura no Header | Alteração em `Header.tsx` |
| Variáveis de ambiente Stripe | Configuração Vercel + `.env` |
