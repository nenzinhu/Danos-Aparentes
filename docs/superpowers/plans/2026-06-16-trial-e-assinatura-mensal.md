# Trial de 7 dias + Assinatura mensal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Todo novo usuário ganha 7 dias de acesso grátis ao Vistoria+; depois disso, precisa assinar R$ 49,90/mês (via Stripe) para continuar usando o app.

**Architecture:** Tabela `subscriptions` no Supabase (criada automaticamente por trigger no signup), 3 Vercel Functions em `/api` para checkout/portal/webhook do Stripe, um hook `useSubscription` no client que decide se mostra o app ou uma tela de Paywall.

**Tech Stack:** React + Vite (existente), Supabase Postgres + Auth (existente), Stripe (novo), Vercel Functions (novo, Node.js runtime).

**Nota sobre testes:** este projeto não tem um runner de testes automatizados configurado (sem Jest/Vitest). Os passos de verificação usam `npm run build` (checagem de compilação), `vercel dev` + `curl` (checagem manual das functions) e o modo de teste do Stripe (checagem do fluxo de pagamento ponta a ponta) — mesma abordagem de verificação já usada neste projeto.

---

## Task 0: Criar conta Stripe e produto de assinatura

**Files:** nenhum (passos manuais no dashboard do Stripe)

- [ ] **Passo 1:** Acesse https://dashboard.stripe.com/register e crie a conta (pode usar o modo de teste sem precisar completar verificação de negócio ainda).
- [ ] **Passo 2:** Confirme que está no **modo de teste** (toggle "Test mode" no topo do dashboard, deve estar ativado).
- [ ] **Passo 3:** Vá em **Product catalog → Add product**. Nome: `Vistoria+ Mensal`. Em "Pricing", escolha `Recurring`, `Monthly`, valor `49.90`, moeda `BRL`. Salve.
- [ ] **Passo 4:** Copie o **Price ID** gerado (formato `price_xxxxx...`) — vai virar `STRIPE_PRICE_ID`.
- [ ] **Passo 5:** Vá em **Developers → API keys**. Copie a **Secret key** de teste (formato `sk_test_...`) — vai virar `STRIPE_SECRET_KEY`.
- [ ] **Passo 6 (fica pendente até o Task 6 estar deployado):** Depois que o endpoint `/api/stripe-webhook` estiver no ar (em uma URL pública, ex: deployment de preview da Vercel), volte em **Developers → Webhooks → Add endpoint**, use a URL `https://<seu-dominio>/api/stripe-webhook`, selecione os eventos `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, e copie o **Signing secret** (`whsec_...`) — vai virar `STRIPE_WEBHOOK_SECRET`.

---

## Task 1: Tabela `subscriptions` + trigger de trial automático

**Files:**
- Modify: `supabase/schema.sql`

- [ ] **Passo 1: Adicionar a tabela e o trigger ao final do arquivo**

Abra `supabase/schema.sql` e adicione ao final:

```sql
-- ─── Assinaturas (trial de 7 dias + Stripe) ───────────────────────────────────
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

drop policy if exists "select_own_subscription" on subscriptions;
create policy "select_own_subscription" on subscriptions
  for select using (auth.uid() = user_id);

-- Cria o trial de 7 dias automaticamente quando uma conta é criada.
-- Roda no banco (security definer) — não depende do client, não pode ser burlado.
create or replace function public.handle_new_user_trial()
returns trigger as $$
begin
  insert into public.subscriptions (user_id, status, trial_ends_at)
  values (new.id, 'trialing', now() + interval '7 days')
  on conflict (user_id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created_trial on auth.users;
create trigger on_auth_user_created_trial
  after insert on auth.users
  for each row execute function public.handle_new_user_trial();
```

- [ ] **Passo 2: Aplicar no Supabase**

Confirme que `SUPABASE_DB_URL` está definida no `.env` (connection string de "Project Settings → Database → Connection string (URI)" no dashboard do Supabase). Depois rode:

```bash
npm run db:push
```

Esperado: `Schema aplicado com sucesso no Supabase!`

- [ ] **Passo 3: Verificar manualmente**

No SQL Editor do dashboard do Supabase, rode:

```sql
select column_name, data_type from information_schema.columns where table_name = 'subscriptions';
```

Esperado: lista com `user_id`, `status`, `trial_ends_at`, `stripe_customer_id`, `stripe_subscription_id`, `current_period_end`, `updated_at`, `created_at`.

Crie um usuário de teste (Authentication → Add user no dashboard, ou cadastro normal pelo app) e confirme que apareceu uma linha correspondente em `subscriptions` com `status = 'trialing'` automaticamente.

- [ ] **Passo 4: Commit**

```bash
git add supabase/schema.sql
git commit -m "feat: add subscriptions table with auto-trial trigger"
```

(Se a pasta ainda não for um repositório git, rode `git init` antes.)

---

## Task 2: Instalar dependências (Stripe SDK)

**Files:**
- Modify: `package.json`, `package-lock.json`

- [ ] **Passo 1: Instalar o SDK do Stripe (runtime, usado pelas Vercel Functions)**

```bash
npm install stripe@22.2.1
```

- [ ] **Passo 2: Instalar os tipos das Vercel Functions (apenas dev, ajuda o editor)**

```bash
npm install -D @vercel/node@5.8.17
```

- [ ] **Passo 3: Verificar**

```bash
npm run build
```

Esperado: build conclui sem erros (mesma saída de antes, só com `stripe` agora em `node_modules`).

- [ ] **Passo 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add stripe and @vercel/node dependencies"
```

---

## Task 3: Libs compartilhadas das Vercel Functions

**Files:**
- Create: `api/_lib/stripeClient.ts`
- Create: `api/_lib/supabaseAdmin.ts`
- Create: `api/_lib/getUserFromRequest.ts`

- [ ] **Passo 1: Criar `api/_lib/stripeClient.ts`**

```ts
import Stripe from 'stripe'

const secretKey = process.env.STRIPE_SECRET_KEY

if (!secretKey) {
  throw new Error('STRIPE_SECRET_KEY não configurada nas variáveis de ambiente')
}

export const stripe = new Stripe(secretKey)
```

- [ ] **Passo 2: Criar `api/_lib/supabaseAdmin.ts`**

```ts
import { createClient } from '@supabase/supabase-js'

const url = process.env.VITE_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceRoleKey) {
  throw new Error('VITE_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configuradas')
}

// Cliente com a service role key: ignora RLS, só deve ser usado no backend
// (Vercel Functions), nunca exposto ao navegador.
export const supabaseAdmin = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})
```

- [ ] **Passo 3: Criar `api/_lib/getUserFromRequest.ts`**

```ts
import type { VercelRequest } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const url = process.env.VITE_SUPABASE_URL
const anonKey = process.env.VITE_SUPABASE_ANON_KEY

// Valida o JWT enviado pelo client (header Authorization: Bearer <token>) e
// devolve o usuário autenticado, ou null se o token for inválido/ausente.
export async function getUserFromRequest(req: VercelRequest) {
  if (!url || !anonKey) throw new Error('VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não configuradas')

  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) return null

  const token = authHeader.slice('Bearer '.length)
  const supabase = createClient(url, anonKey)
  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data.user) return null
  return data.user
}
```

- [ ] **Passo 4: Verificar**

```bash
npm run build
```

Esperado: build continua passando (esses arquivos ficam fora de `src/`, não afetam o bundle do Vite).

- [ ] **Passo 5: Commit**

```bash
git add api/_lib
git commit -m "feat: add shared Stripe/Supabase helpers for Vercel Functions"
```

---

## Task 4: `/api/create-checkout-session`

**Files:**
- Create: `api/create-checkout-session.ts`

- [ ] **Passo 1: Criar o arquivo**

```ts
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { stripe } from './_lib/stripeClient'
import { supabaseAdmin } from './_lib/supabaseAdmin'
import { getUserFromRequest } from './_lib/getUserFromRequest'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método não permitido' })
    return
  }

  const user = await getUserFromRequest(req)
  if (!user) {
    res.status(401).json({ error: 'Não autenticado' })
    return
  }

  const priceId = process.env.STRIPE_PRICE_ID
  if (!priceId) {
    res.status(500).json({ error: 'STRIPE_PRICE_ID não configurada' })
    return
  }

  const { data: sub } = await supabaseAdmin
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .maybeSingle()

  const origin = (req.headers.origin as string) || `https://${req.headers.host}`

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      customer: sub?.stripe_customer_id || undefined,
      customer_email: sub?.stripe_customer_id ? undefined : user.email,
      client_reference_id: user.id,
      success_url: `${origin}/app.html?checkout=success`,
      cancel_url: `${origin}/app.html?checkout=canceled`,
    })

    res.status(200).json({ url: session.url })
  } catch (err) {
    res.status(500).json({ error: `Erro ao criar sessão de checkout: ${(err as Error).message}` })
  }
}
```

- [ ] **Passo 2: Verificar localmente**

Defina as variáveis de ambiente locais (crie/edite `.env` na raiz, sem subir pro git):

```
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PRICE_ID=price_xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
```

(`VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` já devem existir no `.env` de antes.)

Rode:

```bash
vercel dev
```

Em outro terminal, pegue um access token válido (login pelo app no navegador, em DevTools → Application → Local Storage, procure a chave `sb-...-auth-token`, copie o campo `access_token`), depois:

```bash
curl -X POST http://localhost:3000/api/create-checkout-session \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN_AQUI"
```

Esperado: resposta JSON `{"url":"https://checkout.stripe.com/..."}`. Sem o header `Authorization`, esperado `{"error":"Não autenticado"}` com status 401.

- [ ] **Passo 3: Commit**

```bash
git add api/create-checkout-session.ts
git commit -m "feat: add /api/create-checkout-session endpoint"
```

---

## Task 5: `/api/create-portal-session`

**Files:**
- Create: `api/create-portal-session.ts`

- [ ] **Passo 1: Criar o arquivo**

```ts
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { stripe } from './_lib/stripeClient'
import { supabaseAdmin } from './_lib/supabaseAdmin'
import { getUserFromRequest } from './_lib/getUserFromRequest'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método não permitido' })
    return
  }

  const user = await getUserFromRequest(req)
  if (!user) {
    res.status(401).json({ error: 'Não autenticado' })
    return
  }

  const { data: sub } = await supabaseAdmin
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!sub?.stripe_customer_id) {
    res.status(400).json({ error: 'Usuário ainda não tem assinatura registrada' })
    return
  }

  const origin = (req.headers.origin as string) || `https://${req.headers.host}`

  try {
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: `${origin}/app.html`,
    })

    res.status(200).json({ url: portalSession.url })
  } catch (err) {
    res.status(500).json({ error: `Erro ao abrir portal: ${(err as Error).message}` })
  }
}
```

- [ ] **Passo 2: Verificar localmente**

Com `vercel dev` ainda rodando (do Task 4):

```bash
curl -X POST http://localhost:3000/api/create-portal-session \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN_AQUI"
```

Esperado (usuário ainda sem `stripe_customer_id`, pois ainda não assinou): `{"error":"Usuário ainda não tem assinatura registrada"}` com status 400. Esse comportamento será validado de ponta a ponta no Task 11, depois que o usuário tiver assinado de fato.

- [ ] **Passo 3: Commit**

```bash
git add api/create-portal-session.ts
git commit -m "feat: add /api/create-portal-session endpoint"
```

---

## Task 6: `/api/stripe-webhook`

**Files:**
- Create: `api/stripe-webhook.ts`

- [ ] **Passo 1: Criar o arquivo**

```ts
import type { VercelRequest, VercelResponse } from '@vercel/node'
import type Stripe from 'stripe'
import { stripe } from './_lib/stripeClient'
import { supabaseAdmin } from './_lib/supabaseAdmin'

// Desliga o parser automático de JSON: precisamos do corpo "crú" (raw) da
// requisição pra validar a assinatura criptográfica do Stripe.
export const config = {
  api: { bodyParser: false },
}

function readRawBody(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

// Lê o fim do período atual de um Subscription, cobrindo tanto a API antiga
// (campo no objeto subscription) quanto a API mais recente do Stripe (campo
// dentro de cada subscription item).
function getCurrentPeriodEnd(subscription: Stripe.Subscription): number | null {
  const fromItem = subscription.items.data[0]?.current_period_end
  if (typeof fromItem === 'number') return fromItem
  const legacy = (subscription as unknown as { current_period_end?: number }).current_period_end
  return typeof legacy === 'number' ? legacy : null
}

function mapStripeStatus(status: Stripe.Subscription.Status): 'active' | 'past_due' | 'canceled' {
  if (status === 'active' || status === 'trialing') return 'active'
  if (status === 'past_due' || status === 'unpaid' || status === 'incomplete') return 'past_due'
  return 'canceled'
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método não permitido' })
    return
  }

  const signature = req.headers['stripe-signature']
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!signature || !webhookSecret) {
    res.status(400).json({ error: 'Assinatura do webhook ausente ou não configurada' })
    return
  }

  let event: Stripe.Event
  try {
    const rawBody = await readRawBody(req)
    event = stripe.webhooks.constructEvent(rawBody, signature as string, webhookSecret)
  } catch (err) {
    res.status(400).json({ error: `Assinatura inválida: ${(err as Error).message}` })
    return
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.client_reference_id
    if (userId && session.customer && session.subscription) {
      await supabaseAdmin.from('subscriptions').update({
        status: 'active',
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: session.subscription as string,
        updated_at: new Date().toISOString(),
      }).eq('user_id', userId)
    }
  }

  if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription
    const status = event.type === 'customer.subscription.deleted'
      ? 'canceled'
      : mapStripeStatus(subscription.status)
    const periodEndUnix = getCurrentPeriodEnd(subscription)

    await supabaseAdmin.from('subscriptions').update({
      status,
      current_period_end: periodEndUnix ? new Date(periodEndUnix * 1000).toISOString() : null,
      updated_at: new Date().toISOString(),
    }).eq('stripe_subscription_id', subscription.id)
  }

  res.status(200).json({ received: true })
}
```

- [ ] **Passo 2: Verificar a assinatura é exigida**

Com `vercel dev` rodando:

```bash
curl -X POST http://localhost:3000/api/stripe-webhook -d '{}'
```

Esperado: `{"error":"Assinatura do webhook ausente ou não configurada"}` com status 400 (a requisição é rejeitada sem a assinatura criptográfica, como desenhado na spec).

- [ ] **Passo 3: Commit**

```bash
git add api/stripe-webhook.ts
git commit -m "feat: add /api/stripe-webhook endpoint"
```

---

## Task 7: Hook `useSubscription`

**Files:**
- Create: `src/hooks/useSubscription.ts`

- [ ] **Passo 1: Criar o arquivo**

```ts
import { useState, useEffect, useCallback } from 'react'
import { supabase, supabaseEnabled } from '../lib/supabase'

export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled'

export interface SubscriptionInfo {
  status: SubscriptionStatus
  trialEndsAt: string
  hasAccess: boolean
  trialDaysLeft: number
}

export function useSubscription(userId?: string, accessToken?: string) {
  const [info, setInfo] = useState<SubscriptionInfo | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!supabaseEnabled || !supabase || !userId) {
      setLoading(false)
      return
    }

    const { data } = await supabase
      .from('subscriptions')
      .select('status, trial_ends_at')
      .eq('user_id', userId)
      .maybeSingle()

    if (!data) {
      // Fail-closed: sem linha de assinatura (ex: trigger falhou), sem acesso.
      setInfo({ status: 'canceled', trialEndsAt: '', hasAccess: false, trialDaysLeft: 0 })
      setLoading(false)
      return
    }

    const status = data.status as SubscriptionStatus
    const trialEndsAt = data.trial_ends_at as string
    const trialActive = new Date(trialEndsAt).getTime() > Date.now()
    const hasAccess = status === 'active' || (status === 'trialing' && trialActive)
    const trialDaysLeft = Math.max(0, Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / 86_400_000))

    setInfo({ status, trialEndsAt, hasAccess, trialDaysLeft })
    setLoading(false)
  }, [userId])

  useEffect(() => { refresh() }, [refresh])

  async function startCheckout() {
    if (!accessToken) throw new Error('Não autenticado')
    const res = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!res.ok) throw new Error('Não foi possível iniciar o checkout')
    const { url } = await res.json()
    window.location.href = url
  }

  async function openPortal() {
    if (!accessToken) throw new Error('Não autenticado')
    const res = await fetch('/api/create-portal-session', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!res.ok) throw new Error('Não foi possível abrir o portal de gerenciamento')
    const { url } = await res.json()
    window.location.href = url
  }

  return { info, loading, refresh, startCheckout, openPortal }
}
```

- [ ] **Passo 2: Verificar**

```bash
npm run build
```

Esperado: build passa (hook ainda não é usado em lugar nenhum, mas precisa compilar sem erros de tipo).

- [ ] **Passo 3: Commit**

```bash
git add src/hooks/useSubscription.ts
git commit -m "feat: add useSubscription hook"
```

---

## Task 8: Componente `Paywall`

**Files:**
- Create: `src/components/Paywall.tsx`

- [ ] **Passo 1: Criar o arquivo**

```tsx
import { useState } from 'react'
import { SubscriptionStatus } from '../hooks/useSubscription'

interface Props {
  status: SubscriptionStatus
  onSubscribe: () => Promise<void>
  onSignOut?: () => void
}

const PRICE_LABEL = 'R$ 49,90/mês'

export default function Paywall({ status, onSubscribe, onSignOut }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const title = status === 'past_due'
    ? 'Seu pagamento falhou'
    : 'Seu teste grátis de 7 dias acabou'

  const description = status === 'past_due'
    ? 'Não conseguimos confirmar o pagamento da sua assinatura. Atualize seu cartão para continuar usando o Vistoria+.'
    : 'Assine o Vistoria+ para continuar registrando vistorias, gerando laudos em PDF e usando a sincronização em nuvem.'

  async function handleClick() {
    setLoading(true)
    setError(null)
    try {
      await onSubscribe()
    } catch {
      setError('Não foi possível iniciar o pagamento. Tente novamente em alguns instantes.')
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{
        background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 24,
        padding: '40px 32px', maxWidth: 440, width: '100%', textAlign: 'center',
        backdropFilter: 'blur(18px)', boxShadow: 'var(--glass-shadow)',
      }}>
        <div style={{ fontSize: '2.4rem', marginBottom: 12 }}>{status === 'past_due' ? '⚠️' : '⏳'}</div>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 12 }}>{title}</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: 26 }}>{description}</p>

        <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#00aaff', marginBottom: 4 }}>{PRICE_LABEL}</div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: 26 }}>Cancele quando quiser</div>

        {error && (
          <div style={{ color: '#ef4444', fontSize: '0.82rem', marginBottom: 14 }}>{error}</div>
        )}

        <button onClick={handleClick} disabled={loading} style={{
          background: '#00aaff', color: '#02101e', fontWeight: 800, fontSize: '0.95rem',
          padding: '14px 28px', borderRadius: 10, border: 'none', cursor: loading ? 'default' : 'pointer',
          fontFamily: 'Outfit,sans-serif', width: '100%', opacity: loading ? 0.7 : 1,
        }}>
          {loading ? 'Abrindo pagamento...' : 'Assinar agora'}
        </button>

        {onSignOut && (
          <button onClick={onSignOut} style={{
            background: 'transparent', border: 'none', color: 'var(--text-muted)',
            fontSize: '0.8rem', marginTop: 18, cursor: 'pointer', textDecoration: 'underline',
            fontFamily: 'Outfit,sans-serif',
          }}>Sair da conta</button>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Passo 2: Verificar**

```bash
npm run build
```

Esperado: build passa.

- [ ] **Passo 3: Commit**

```bash
git add src/components/Paywall.tsx
git commit -m "feat: add Paywall component"
```

---

## Task 9: Badge de assinatura no `Header`

**Files:**
- Modify: `src/components/Header.tsx`

- [ ] **Passo 1: Adicionar a prop de assinatura na interface**

Em `src/components/Header.tsx`, troque:

```ts
interface Props {
  darkMode: boolean
  onToggleDark: () => void
  onOpenSaved: () => void
  onSignOut?: () => void
  syncStatus?: 'synced' | 'pending' | 'offline'
}
```

por:

```ts
interface Props {
  darkMode: boolean
  onToggleDark: () => void
  onOpenSaved: () => void
  onSignOut?: () => void
  syncStatus?: 'synced' | 'pending' | 'offline'
  subscription?: { status: 'trialing' | 'active' | 'past_due' | 'canceled'; trialDaysLeft: number }
  onManageSubscription?: () => void
}
```

- [ ] **Passo 2: Atualizar a assinatura da função**

Troque:

```ts
export default function Header({ darkMode, onToggleDark, onOpenSaved, onSignOut, syncStatus }: Props) {
```

por:

```ts
export default function Header({ darkMode, onToggleDark, onOpenSaved, onSignOut, syncStatus, subscription, onManageSubscription }: Props) {
```

- [ ] **Passo 3: Adicionar o badge na fileira de chips**

Localize este trecho (depois do `.map(b => ...)` dos chips fixos):

```tsx
        {syncStatus && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.04)', border: `1px solid ${SYNC_LABEL[syncStatus].color}33`, borderRadius: 8, padding: '6px 14px', fontSize: '0.78rem', fontWeight: 600, color: SYNC_LABEL[syncStatus].color }}>
            {SYNC_LABEL[syncStatus].icon} {SYNC_LABEL[syncStatus].text}
          </div>
        )}
      </div>
```

E adicione o badge de assinatura logo depois do badge de sync, antes do `</div>` de fechamento:

```tsx
        {syncStatus && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.04)', border: `1px solid ${SYNC_LABEL[syncStatus].color}33`, borderRadius: 8, padding: '6px 14px', fontSize: '0.78rem', fontWeight: 600, color: SYNC_LABEL[syncStatus].color }}>
            {SYNC_LABEL[syncStatus].icon} {SYNC_LABEL[syncStatus].text}
          </div>
        )}
        {subscription?.status === 'trialing' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.3)', borderRadius: 8, padding: '6px 14px', fontSize: '0.78rem', fontWeight: 600, color: '#eab308' }}>
            🎁 Teste grátis: {subscription.trialDaysLeft} dia{subscription.trialDaysLeft !== 1 ? 's' : ''} restante{subscription.trialDaysLeft !== 1 ? 's' : ''}
          </div>
        )}
        {subscription?.status === 'active' && (
          <button onClick={onManageSubscription} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 8, padding: '6px 14px', fontSize: '0.78rem', fontWeight: 700, color: '#22c55e', cursor: 'pointer', fontFamily: 'Outfit,sans-serif' }}>
            ✓ Assinatura ativa — Gerenciar
          </button>
        )}
      </div>
```

- [ ] **Passo 4: Verificar**

```bash
npm run build
```

Esperado: build passa.

- [ ] **Passo 5: Commit**

```bash
git add src/components/Header.tsx
git commit -m "feat: show trial/subscription badge in Header"
```

---

## Task 10: Conectar o gate de assinatura no `App.tsx`

**Files:**
- Modify: `src/App.tsx`

- [ ] **Passo 1: Importar o hook e o componente**

No topo de `src/App.tsx`, adicione junto aos outros imports de hooks:

```ts
import { useSubscription } from './hooks/useSubscription'
import Paywall from './components/Paywall'
```

- [ ] **Passo 2: Chamar o hook dentro de `App()`**

Logo depois da linha `const { status: syncStatus } = useSyncStatus(session?.user.id)`, adicione:

```ts
  const { info: subscription, loading: subLoading, startCheckout, openPortal } = useSubscription(session?.user.id, session?.access_token)
```

- [ ] **Passo 3: Adicionar as telas de carregamento e paywall**

Localize:

```tsx
  if (supabaseEnabled && !session) {
    return <Login onSignIn={signIn} onSignUp={signUp} onResetPassword={resetPassword} />
  }
```

E adicione imediatamente depois:

```tsx
  if (supabaseEnabled && session && subLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-main)' }}>
        Carregando...
      </div>
    )
  }

  if (supabaseEnabled && session && subscription && !subscription.hasAccess) {
    return <Paywall status={subscription.status} onSubscribe={startCheckout} onSignOut={signOut} />
  }
```

- [ ] **Passo 4: Passar os dados de assinatura para o `Header`**

Localize:

```tsx
      <Header
        darkMode={darkMode}
        onToggleDark={() => setDarkMode(d => !d)}
        onOpenSaved={() => setSavedModal(true)}
        onSignOut={supabaseEnabled ? signOut : undefined}
        syncStatus={supabaseEnabled ? syncStatus : undefined}
      />
```

E troque por:

```tsx
      <Header
        darkMode={darkMode}
        onToggleDark={() => setDarkMode(d => !d)}
        onOpenSaved={() => setSavedModal(true)}
        onSignOut={supabaseEnabled ? signOut : undefined}
        syncStatus={supabaseEnabled ? syncStatus : undefined}
        subscription={supabaseEnabled && subscription ? { status: subscription.status, trialDaysLeft: subscription.trialDaysLeft } : undefined}
        onManageSubscription={openPortal}
      />
```

- [ ] **Passo 5: Verificar**

```bash
npm run build
```

Esperado: build passa sem erros de tipo.

- [ ] **Passo 6: Verificar manualmente no navegador**

```bash
npm run dev
```

Abra `http://localhost:5173/app.html`, cadastre uma conta nova (ou use uma existente de teste). Esperado:
- Login funciona normalmente.
- App abre normalmente (trial ainda válido), com o badge "🎁 Teste grátis: 7 dias restantes" no Header.
- No SQL Editor do Supabase, rode `update subscriptions set trial_ends_at = now() - interval '1 day' where user_id = '<id-do-usuario>';`, recarregue a página → esperado: tela de Paywall aparece no lugar do app.

- [ ] **Passo 7: Commit**

```bash
git add src/App.tsx
git commit -m "feat: gate app access behind trial/subscription status"
```

---

## Task 11: Configurar variáveis de ambiente e testar o fluxo completo no Stripe (modo teste)

**Files:**
- Modify: `.env.example`

- [ ] **Passo 1: Atualizar `.env.example`**

```
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui

# Necessárias só no backend (Vercel Functions) — nunca prefixar com VITE_,
# senão ficam expostas no bundle do navegador.
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key-aqui
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PRICE_ID=price_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

- [ ] **Passo 2: Configurar as variáveis no Vercel**

```bash
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add STRIPE_SECRET_KEY production
vercel env add STRIPE_PRICE_ID production
vercel env add STRIPE_WEBHOOK_SECRET production
```

(Cole o valor correspondente quando solicitado por cada comando — use as chaves de **teste** do Stripe por enquanto.)

- [ ] **Passo 3: Deploy de preview e configurar o webhook no Stripe**

```bash
vercel
```

Copie a URL de preview gerada (ex: `https://danosaparentes-xxxx.vercel.app`). No dashboard do Stripe (modo teste), complete o **Passo 6 do Task 0**: registre o endpoint `https://danosaparentes-xxxx.vercel.app/api/stripe-webhook` e copie o signing secret pra variável `STRIPE_WEBHOOK_SECRET` (repita o `vercel env add` do Passo 2 com o valor real agora).

- [ ] **Passo 4: Testar o checkout de ponta a ponta**

Faça um novo deploy de preview (pra pegar a env var atualizada): `vercel`.

Acesse o app na URL de preview, force o trial a expirar (como no Task 10, Passo 6), confirme que aparece o Paywall, clique em "Assinar agora". Esperado: redireciona pra página de checkout do Stripe. Use o cartão de teste `4242 4242 4242 4242`, qualquer data futura, qualquer CVC. Complete o pagamento.

Esperado: volta pro app (`?checkout=success`), o webhook já deve ter rodado — no SQL Editor do Supabase, confirme `select status, stripe_customer_id from subscriptions where user_id = '<id>'` mostra `status = 'active'` e `stripe_customer_id` preenchido. Recarregue a página do app → app libera o acesso normalmente, badge agora mostra "✓ Assinatura ativa — Gerenciar".

- [ ] **Passo 5: Testar o portal de gerenciamento**

Clique em "✓ Assinatura ativa — Gerenciar" no Header. Esperado: abre o Customer Portal do Stripe. Cancele a assinatura ali.

Esperado: o evento `customer.subscription.deleted` chega no webhook, `status` na tabela `subscriptions` vira `canceled`. Recarregue o app → Paywall aparece de novo.

- [ ] **Passo 6: Testar pagamento recusado (opcional, mas recomendado)**

Repita o checkout usando o cartão de teste de recusa `4000 0000 0000 0002`. Esperado: o Stripe recusa o pagamento, o checkout não completa — usuário permanece sem acesso, pode tentar de novo com outro cartão.

- [ ] **Passo 7: Promover para produção**

Quando tudo acima estiver validado em modo de teste, repita o Task 0 (produto + chaves) no **modo live** do Stripe, registre o webhook de produção apontando pra `https://danosaparentes.vercel.app/api/stripe-webhook`, atualize as env vars na Vercel (`production`) com as chaves `sk_live_...`/`whsec_...` reais, e rode:

```bash
vercel --prod
```

- [ ] **Passo 8: Commit**

```bash
git add .env.example
git commit -m "docs: document Stripe/Supabase env vars needed for subscriptions"
```
