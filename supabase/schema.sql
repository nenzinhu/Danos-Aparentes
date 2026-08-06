-- Schema-base para o Vistoria+ (AvariasAPARENTES-PWA).
-- Rode este script no SQL Editor do seu projeto Supabase (https://app.supabase.com).
--
-- Este arquivo contém APENAS o DDL original (CREATE TABLE, índices base, triggers,
-- RLS e funções auxiliares do schema inicial). Colunas e objetos adicionados em
-- fases posteriores estão em supabase/migrations/ e são aplicados por:
--   npm run db:push
-- que executa este arquivo e depois as migrations em ordem de nome.

-- ─── Tabelas principais ───────────────────────────────────────────────────────

create table if not exists vehicle_inspections (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  vehicle_type text not null,
  owner text default '',
  phone text default '',
  brand text default '',
  plate text default '',
  general_notes text default '',
  profile text default '',
  ref text default '',
  color text default '',
  vehicle_type_desc text default '',
  city text default '',
  state text default '',
  cpf text default '',
  cnh text default '',
  cnh_category text default '',
  inspector_signature text default '',
  client_signature text default '',
  status text not null default 'complete',
  geo_lat double precision,
  geo_lng double precision,
  geo_accuracy double precision,
  geo_address text,
  geo_captured_at bigint,
  tenant_id uuid,
  public_code text default '',
  laudo_version int default 1,
  parent_inspection_id text,
  correction_reason text default '',
  corrected_by uuid,
  corrected_at timestamptz,
  issued_at timestamptz,
  issued_hash text default '',
  updated_at bigint not null,
  created_at timestamptz not null default now(),
  constraint vehicle_inspections_status_check
    check (status in ('draft', 'complete', 'issued', 'superseded', 'cancelled'))
);

create table if not exists damages (
  id text primary key,
  inspection_id text not null references vehicle_inspections(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  vehicle text not null,
  view text not null,
  part_id text not null,
  part_name text not null,
  type text not null,
  type_name text not null,
  severity text not null default 'low',
  notes text default '',
  photos text[] default '{}',
  photo_notes text[] default '{}',
  updated_at bigint not null,
  created_at timestamptz not null default now()
);

-- ─── Índices base ─────────────────────────────────────────────────────────────

create index if not exists idx_damages_inspection on damages(inspection_id);
create index if not exists idx_inspections_user on vehicle_inspections(user_id);
create index if not exists idx_damages_user on damages(user_id);

-- ─── Trigger de imutabilidade: laudos emitidos/superseded/cancelled ───────────
-- vehicle_id pode ser vinculado/backfilled sem alterar o conteúdo do laudo.

create or replace function public.prevent_issued_inspection_mutation()
returns trigger
language plpgsql
as $$
begin
  if old.status in ('issued', 'superseded', 'cancelled') then
    if old.status = 'issued' and new.status = 'superseded' then
      if new.owner is distinct from old.owner
         or new.phone is distinct from old.phone
         or new.brand is distinct from old.brand
         or new.plate is distinct from old.plate
         or new.general_notes is distinct from old.general_notes
         or new.ref is distinct from old.ref
         or new.inspector_signature is distinct from old.inspector_signature
         or new.client_signature is distinct from old.client_signature
         or new.geo_lat is distinct from old.geo_lat
         or new.geo_lng is distinct from old.geo_lng
         or new.issued_hash is distinct from old.issued_hash
         or new.public_code is distinct from old.public_code
         or new.laudo_version is distinct from old.laudo_version
         or new.parent_inspection_id is distinct from old.parent_inspection_id
      then
        raise exception 'issued inspection content is immutable (only status→superseded allowed)';
      end if;
      return new;
    end if;
    if new.vehicle_id is distinct from old.vehicle_id
       and new.owner is not distinct from old.owner
       and new.phone is not distinct from old.phone
       and new.brand is not distinct from old.brand
       and new.plate is not distinct from old.plate
       and new.general_notes is not distinct from old.general_notes
       and new.ref is not distinct from old.ref
       and new.inspector_signature is not distinct from old.inspector_signature
       and new.client_signature is not distinct from old.client_signature
       and new.geo_lat is not distinct from old.geo_lat
       and new.geo_lng is not distinct from old.geo_lng
       and new.issued_hash is not distinct from old.issued_hash
       and new.public_code is not distinct from old.public_code
       and new.laudo_version is not distinct from old.laudo_version
       and new.parent_inspection_id is not distinct from old.parent_inspection_id
       and new.status is not distinct from old.status
    then
      return new;
    end if;
    raise exception 'inspection status % is immutable — create a correction (new version)', old.status;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_prevent_issued_inspection_mutation on vehicle_inspections;
create trigger trg_prevent_issued_inspection_mutation
  before update on vehicle_inspections
  for each row execute function public.prevent_issued_inspection_mutation();

create or replace function public.prevent_issued_damage_mutation()
returns trigger
language plpgsql
as $$
declare
  v_status text;
  v_inspection_id text;
begin
  v_inspection_id := coalesce(new.inspection_id, old.inspection_id);
  select status into v_status
    from public.vehicle_inspections
   where id = v_inspection_id;
  if v_status in ('issued', 'superseded', 'cancelled') then
    raise exception 'damages of % inspection % are immutable', v_status, v_inspection_id;
  end if;
  if tg_op = 'delete' then
    return old;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_prevent_issued_damage_mutation on damages;
create trigger trg_prevent_issued_damage_mutation
  before insert or update or delete on damages
  for each row execute function public.prevent_issued_damage_mutation();

-- ─── Row Level Security ───────────────────────────────────────────────────────

alter table vehicle_inspections enable row level security;
alter table damages enable row level security;

-- Helper: verifica assinatura ativa, PIX válido ou trial
-- (espelha src/lib/subscriptionAccess.ts → hasActiveSubscriptionAccess)
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

drop policy if exists "select_own_inspections" on vehicle_inspections;
create policy "select_own_inspections" on vehicle_inspections
  for select using (auth.uid() = user_id);
drop policy if exists "insert_own_inspections" on vehicle_inspections;
create policy "insert_own_inspections" on vehicle_inspections
  for insert with check (auth.uid() = user_id and public.user_has_active_subscription(auth.uid()));
drop policy if exists "update_own_inspections" on vehicle_inspections;
create policy "update_own_inspections" on vehicle_inspections
  for update using (auth.uid() = user_id and public.user_has_active_subscription(auth.uid()));
drop policy if exists "delete_own_inspections" on vehicle_inspections;
create policy "delete_own_inspections" on vehicle_inspections
  for delete using (auth.uid() = user_id);

drop policy if exists "select_own_damages" on damages;
create policy "select_own_damages" on damages
  for select using (auth.uid() = user_id);
drop policy if exists "insert_own_damages" on damages;
create policy "insert_own_damages" on damages
  for insert with check (auth.uid() = user_id and public.user_has_active_subscription(auth.uid()));
drop policy if exists "update_own_damages" on damages;
create policy "update_own_damages" on damages
  for update using (auth.uid() = user_id and public.user_has_active_subscription(auth.uid()));
drop policy if exists "delete_own_damages" on damages;
create policy "delete_own_damages" on damages
  for delete using (auth.uid() = user_id);

-- ─── Verificação pública de PDFs (QR Code de integridade) ────────────────────

create table if not exists report_hashes (
  hash text primary key,
  user_id uuid references auth.users(id) on delete set null,
  tenant_id uuid,
  plate text default '',
  ref text default '',
  issued_at text default '',
  damages_count int default 0,
  created_at timestamptz not null default now()
);

alter table report_hashes enable row level security;

drop policy if exists "select_any_hash" on report_hashes;
create policy "select_any_hash" on report_hashes
  for select using (true);

drop policy if exists "insert_own_hash" on report_hashes;
create policy "insert_own_hash" on report_hashes
  for insert with check (auth.uid() = user_id);

drop policy if exists "update_own_hash" on report_hashes;
create policy "update_own_hash" on report_hashes
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── Storage: bucket de fotos de avarias ─────────────────────────────────────

insert into storage.buckets (id, name, public)
values ('damage-photos', 'damage-photos', false)
on conflict (id) do update set public = excluded.public;

drop policy if exists "select_own_photos" on storage.objects;
create policy "select_own_photos" on storage.objects
  for select using (bucket_id = 'damage-photos' and auth.uid()::text = (storage.foldername(name))[1]);
drop policy if exists "insert_own_photos" on storage.objects;
create policy "insert_own_photos" on storage.objects
  for insert with check (bucket_id = 'damage-photos' and auth.uid()::text = (storage.foldername(name))[1]);
drop policy if exists "delete_own_photos" on storage.objects;
create policy "delete_own_photos" on storage.objects
  for delete using (bucket_id = 'damage-photos' and auth.uid()::text = (storage.foldername(name))[1]);
drop policy if exists "update_own_photos" on storage.objects;
create policy "update_own_photos" on storage.objects
  for update using (bucket_id = 'damage-photos' and auth.uid()::text = (storage.foldername(name))[1]);

-- ─── Storage: fotos de documento (CNH) ───────────────────────────────────────

insert into storage.buckets (id, name, public)
values ('document-photos', 'document-photos', false)
on conflict (id) do nothing;

drop policy if exists "select_own_document_photos" on storage.objects;
create policy "select_own_document_photos" on storage.objects
  for select using (bucket_id = 'document-photos' and auth.uid()::text = (storage.foldername(name))[1]);
drop policy if exists "insert_own_document_photos" on storage.objects;
create policy "insert_own_document_photos" on storage.objects
  for insert with check (bucket_id = 'document-photos' and auth.uid()::text = (storage.foldername(name))[1]);
drop policy if exists "delete_own_document_photos" on storage.objects;
create policy "delete_own_document_photos" on storage.objects
  for delete using (bucket_id = 'document-photos' and auth.uid()::text = (storage.foldername(name))[1]);

-- ─── Assinaturas (trial 7 dias + Stripe + PIX) ───────────────────────────────

create table if not exists subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  status text not null default 'trialing'
    check (status in ('trialing', 'active', 'past_due', 'canceled', 'pending_pix', 'active_pix')),
  trial_ends_at timestamptz not null,
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_end timestamptz,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  expires_at timestamptz,
  pending_months int default 0,
  pix_charge_id text,
  welcome_email_sent_at timestamptz,
  trial_ending_email_sent_at timestamptz
);

create index if not exists idx_subscriptions_stripe_subscription_id
  on subscriptions(stripe_subscription_id);
create index if not exists idx_subscriptions_pix_charge_id
  on subscriptions(pix_charge_id);

alter table subscriptions enable row level security;

drop policy if exists "select_own_subscription" on subscriptions;
create policy "select_own_subscription" on subscriptions
  for select using (auth.uid() = user_id);

-- Escrita feita apenas pelo backend via service role (trial trigger + webhook Stripe).
-- Usuários autenticados só podem ler os próprios dados.

create or replace function public.handle_new_user_trial()
returns trigger as $$
begin
  insert into public.subscriptions (user_id, status, trial_ends_at)
  values (new.id, 'trialing', now() + interval '7 days')
  on conflict (user_id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public, pg_temp;

drop trigger if exists on_auth_user_created_trial on auth.users;
create trigger on_auth_user_created_trial
  after insert on auth.users
  for each row execute function public.handle_new_user_trial();

-- ─── Audit log append-only (hash chain) ──────────────────────────────────────
-- Technical audit trail only — does not claim legal validity.

create table if not exists public.audit_log (
  event_id uuid primary key default gen_random_uuid(),
  inspection_id text,
  tenant_id uuid,
  user_id uuid not null references auth.users(id) on delete cascade,
  actor_id text not null,
  actor_type text not null default 'user'
    check (actor_type in ('user', 'system', 'service')),
  event_type text not null,
  timestamp timestamptz not null default now(),
  ip text,
  user_agent text,
  device_id text,
  metadata jsonb not null default '{}'::jsonb,
  previous_event_hash text not null default '',
  event_hash text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_audit_log_inspection_ts
  on public.audit_log (inspection_id, timestamp asc, event_id asc)
  where inspection_id is not null;

create index if not exists idx_audit_log_global_ts
  on public.audit_log (timestamp asc, event_id asc)
  where inspection_id is null;

create index if not exists idx_audit_log_user_ts
  on public.audit_log (user_id, timestamp desc);

create index if not exists idx_audit_log_event_type
  on public.audit_log (event_type);

alter table public.audit_log enable row level security;

drop policy if exists "insert_own_audit_events" on public.audit_log;
create policy "insert_own_audit_events" on public.audit_log
  for insert with check (auth.uid() = user_id);

drop policy if exists "select_own_audit_events" on public.audit_log;
create policy "select_own_audit_events" on public.audit_log
  for select using (auth.uid() = user_id);

do $$
begin
  if exists (
    select 1 from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'is_team_manager_of'
  ) then
    execute 'drop policy if exists "manager_select_team_audit_events" on public.audit_log';
    execute $pol$
      create policy "manager_select_team_audit_events" on public.audit_log
        for select using (public.is_team_manager_of(user_id))
    $pol$;
  end if;
end $$;

create or replace function public.prevent_audit_log_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception 'audit_log is append-only — UPDATE/DELETE not allowed';
end;
$$;

drop trigger if exists trg_prevent_audit_log_update on public.audit_log;
create trigger trg_prevent_audit_log_update
  before update on public.audit_log
  for each row execute function public.prevent_audit_log_mutation();

drop trigger if exists trg_prevent_audit_log_delete on public.audit_log;
create trigger trg_prevent_audit_log_delete
  before delete on public.audit_log
  for each row execute function public.prevent_audit_log_mutation();

-- ─── Vehicles (histórico / evidência) ────────────────────────────────────────
-- tenant_id aponta para companies.id após migrations de team; sem FK aqui
-- (companies não está no schema base). Ver migration 20260728000000_vehicles.sql.

create table if not exists public.vehicles (
  id text primary key,
  tenant_id uuid,
  user_id uuid not null references auth.users(id) on delete cascade,
  plate text not null default '',
  vin text,
  vehicle_type text default '',
  brand text default '',
  model text default '',
  year int,
  color text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.vehicle_inspections
  add column if not exists vehicle_id text references public.vehicles(id) on delete set null;
