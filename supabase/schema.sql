-- Schema-base para o Vistoria+ (AvariasAPARENTES-PWA).
-- Rode este script no SQL Editor do seu projeto Supabase (https://app.supabase.com).
--
-- Este arquivo é só o ponto de partida (tabelas originais). O estado atual do
-- banco depende também das migrations em src/supabase/migrations/ (raiz do
-- projeto Supabase CLI, com config.toml), que devem ser aplicadas em seguida,
-- em ordem de nome de arquivo. `npm run db:push` já faz as duas coisas.

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

create index if not exists idx_damages_inspection on damages(inspection_id);
create index if not exists idx_inspections_user on vehicle_inspections(user_id);
create index if not exists idx_damages_user on damages(user_id);

-- FASE 2 columns (additive for DBs that already had the base table)
alter table vehicle_inspections add column if not exists public_code text default '';
alter table vehicle_inspections add column if not exists laudo_version int default 1;
alter table vehicle_inspections add column if not exists parent_inspection_id text;
alter table vehicle_inspections add column if not exists correction_reason text default '';
alter table vehicle_inspections add column if not exists corrected_by uuid;
alter table vehicle_inspections add column if not exists corrected_at timestamptz;
alter table vehicle_inspections add column if not exists issued_at timestamptz;
alter table vehicle_inspections add column if not exists issued_hash text default '';

alter table vehicle_inspections drop constraint if exists vehicle_inspections_status_check;
alter table vehicle_inspections
  add constraint vehicle_inspections_status_check
  check (status in ('draft', 'complete', 'issued', 'superseded', 'cancelled'));

create index if not exists idx_vehicle_inspections_parent
  on vehicle_inspections (parent_inspection_id)
  where parent_inspection_id is not null;

-- Immutability triggers (issued / superseded / cancelled snapshots)
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

-- Row Level Security: cada usuário só acessa os próprios registros
alter table vehicle_inspections enable row level security;
alter table damages enable row level security;

-- Helper para verificar se o usuário possui assinatura ativa, PIX válido ou trial
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
-- Guarda um "recibo" leve de cada PDF emitido para que o QR Code impresso no
-- documento possa ser conferido publicamente (sem login) na página /verify.html.
create table if not exists report_hashes (
  hash text primary key,
  user_id uuid references auth.users(id) on delete set null,
  plate text default '',
  ref text default '',
  issued_at text default '',
  damages_count int default 0,
  geo_lat double precision,
  geo_lng double precision,
  geo_accuracy int,
  geo_address text,
  created_at timestamptz not null default now()
);

-- Localização da vistoria (adicionada após a criação original da tabela).
alter table report_hashes add column if not exists geo_lat double precision;
alter table report_hashes add column if not exists geo_lng double precision;
alter table report_hashes add column if not exists geo_accuracy int;
alter table report_hashes add column if not exists geo_address text;

-- Nome da locadora/empresa emissora, exibido na página /verify e no selo
-- embutível para reforçar de quem é o laudo (adicionada após a criação original).
alter table report_hashes add column if not exists company_name text default '';

-- Logo da empresa (data URL, já comprimido no upload) exibido junto do nome
-- na página /verify. Antes só o nome era salvo — a verificação pública nunca
-- mostrava o logo, mesmo quando o laudo original tinha um configurado.
alter table report_hashes add column if not exists company_logo text default '';

-- Versionamento visível do laudo: report_key agrupa reemissões do MESMO laudo
-- (placa + Nº OS normalizados, calculado no cliente em registerHash) e version
-- é o número sequencial dentro desse grupo. Sem isso, reemitir um laudo com
-- correção criava um hash novo sem nenhum vínculo com o anterior — o cliente
-- final não tinha como saber se estava vendo a versão mais recente ou uma
-- versão já substituída (risco jurídico/de fraude apontado pela perícia).
alter table report_hashes add column if not exists report_key text default '';
alter table report_hashes add column if not exists version int default 1;
create index if not exists report_hashes_report_key_idx on report_hashes (report_key, version);

-- Integrity-v2: layered SHA-256 manifest (final_hash = 64 hex). v1 `hash` PK
-- (32 hex, QR /verify) stays the public lookup key.
alter table report_hashes add column if not exists integrity_scheme text default '';
alter table report_hashes add column if not exists integrity_manifest jsonb;
alter table report_hashes add column if not exists final_hash text default '';

-- FASE 2: correction lineage on the public verify receipt
alter table report_hashes add column if not exists correction_reason text default '';
alter table report_hashes add column if not exists supersedes_hash text default '';
alter table report_hashes add column if not exists inspection_id text default '';
alter table report_hashes add column if not exists public_code text default '';

alter table report_hashes enable row level security;

-- Qualquer pessoa pode consultar um hash específico (é assim que a verificação
-- via QR Code funciona sem exigir login de quem está conferindo o documento).
drop policy if exists "select_any_hash" on report_hashes;
create policy "select_any_hash" on report_hashes
  for select using (true);

-- Só o autor autenticado da vistoria pode registrar o hash do PDF que emitiu.
drop policy if exists "insert_own_hash" on report_hashes;
create policy "insert_own_hash" on report_hashes
  for insert with check (auth.uid() = user_id);

-- Autor pode atualizar o próprio registro (ex.: preencher pdf_hash após gerar o PDF).
drop policy if exists "update_own_hash" on report_hashes;
create policy "update_own_hash" on report_hashes
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Storage: bucket privado para fotos das avarias (acesso via download/signed URL + RLS)
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

-- Storage: fotos de documento (CNH), separado de damage-photos por ser dado
-- pessoal mais sensível — bucket privado (sem URL pública), só o dono acessa.
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

-- ─── Assinaturas (trial de 7 dias + Stripe + PIX) ─────────────────────────────
create table if not exists subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  status text not null default 'trialing'
    -- 'trialing' | 'active' | 'past_due' | 'canceled' | 'pending_pix' | 'active_pix'
    check (status in ('trialing', 'active', 'past_due', 'canceled', 'pending_pix', 'active_pix')),
  trial_ends_at timestamptz not null,
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_end timestamptz,
   updated_at timestamptz not null default now(),
   created_at timestamptz not null default now(),
   expires_at timestamptz,
   pending_months int default 0,
   pix_charge_id text
);

create index if not exists idx_subscriptions_stripe_subscription_id
  on subscriptions(stripe_subscription_id);
create index if not exists idx_subscriptions_pix_charge_id
  on subscriptions(pix_charge_id);

alter table subscriptions enable row level security;

drop policy if exists "select_own_subscription" on subscriptions;
create policy "select_own_subscription" on subscriptions
  for select using (auth.uid() = user_id);

-- Não há policies de insert/update/delete por escolha: a escrita nesta tabela
-- é feita apenas pelo backend via service role (trigger de trial e webhook do
-- Stripe), que ignora RLS. Usuários autenticados só podem ler seus próprios dados.

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
$$ language plpgsql security definer set search_path = public, pg_temp;

drop trigger if exists on_auth_user_created_trial on auth.users;
create trigger on_auth_user_created_trial
  after insert on auth.users
  for each row execute function public.handle_new_user_trial();
