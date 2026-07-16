-- PIX / subscription period end (used by webhook, RLS helper, and app access checks).
-- Referenced in code since 20260715_pix_subscription_access but never created.

alter table public.subscriptions
  add column if not exists expires_at timestamptz;

comment on column public.subscriptions.expires_at is
  'Fim do período pago (PIX active_pix ou extensão manual). Null enquanto trialing/stripe-only.';

create index if not exists idx_subscriptions_expires_at
  on public.subscriptions (expires_at)
  where expires_at is not null;
