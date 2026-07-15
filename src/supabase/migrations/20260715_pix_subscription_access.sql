-- PIX subscription statuses + access parity with app/server helpers
-- Applies: pending_pix / active_pix, pix_charge_id, RLS helper with expires_at

-- 1. Status check: allow PIX statuses
alter table public.subscriptions drop constraint if exists subscriptions_status_check;
alter table public.subscriptions
  add constraint subscriptions_status_check
  check (status in ('trialing', 'active', 'past_due', 'canceled', 'pending_pix', 'active_pix'));

-- 2. Link to Mercado Pago payment id
alter table public.subscriptions
  add column if not exists pix_charge_id text;

create index if not exists idx_subscriptions_pix_charge_id
  on public.subscriptions (pix_charge_id);

-- 3. RLS helper: Stripe active | trial valid | PIX active with expires_at
create or replace function public.user_has_active_subscription(p_user_id uuid)
returns boolean as $$
declare
  v_status text;
  v_trial_ends_at timestamptz;
  v_expires_at timestamptz;
begin
  select status, trial_ends_at, expires_at
    into v_status, v_trial_ends_at, v_expires_at
  from public.subscriptions
  where user_id = p_user_id;

  if not found then
    return false;
  end if;

  if v_status = 'active' then
    return true;
  end if;

  if v_status = 'active_pix' and v_expires_at is not null and v_expires_at > now() then
    return true;
  end if;

  if v_status = 'trialing' and v_trial_ends_at > now() then
    return true;
  end if;

  return false;
end;
$$ language plpgsql security definer set search_path = public, pg_temp;
