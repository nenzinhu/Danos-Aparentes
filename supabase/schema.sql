-- Schema para o Vistoria+ (AvariasAPARENTES-PWA)
-- Rode este script no SQL Editor do seu projeto Supabase (https://app.supabase.com).

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
  updated_at bigint not null,
  created_at timestamptz not null default now()
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

-- Row Level Security: cada usuário só acessa os próprios registros
alter table vehicle_inspections enable row level security;
alter table damages enable row level security;

drop policy if exists "select_own_inspections" on vehicle_inspections;
create policy "select_own_inspections" on vehicle_inspections
  for select using (auth.uid() = user_id);
drop policy if exists "insert_own_inspections" on vehicle_inspections;
create policy "insert_own_inspections" on vehicle_inspections
  for insert with check (auth.uid() = user_id);
drop policy if exists "update_own_inspections" on vehicle_inspections;
create policy "update_own_inspections" on vehicle_inspections
  for update using (auth.uid() = user_id);
drop policy if exists "delete_own_inspections" on vehicle_inspections;
create policy "delete_own_inspections" on vehicle_inspections
  for delete using (auth.uid() = user_id);

drop policy if exists "select_own_damages" on damages;
create policy "select_own_damages" on damages
  for select using (auth.uid() = user_id);
drop policy if exists "insert_own_damages" on damages;
create policy "insert_own_damages" on damages
  for insert with check (auth.uid() = user_id);
drop policy if exists "update_own_damages" on damages;
create policy "update_own_damages" on damages
  for update using (auth.uid() = user_id);
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
  created_at timestamptz not null default now()
);

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

-- Storage: bucket para fotos das avarias (rode também via dashboard, ou aqui)
insert into storage.buckets (id, name, public)
values ('damage-photos', 'damage-photos', true)
on conflict (id) do nothing;

drop policy if exists "select_own_photos" on storage.objects;
create policy "select_own_photos" on storage.objects
  for select using (bucket_id = 'damage-photos' and auth.uid()::text = (storage.foldername(name))[1]);
drop policy if exists "insert_own_photos" on storage.objects;
create policy "insert_own_photos" on storage.objects
  for insert with check (bucket_id = 'damage-photos' and auth.uid()::text = (storage.foldername(name))[1]);
drop policy if exists "delete_own_photos" on storage.objects;
create policy "delete_own_photos" on storage.objects
  for delete using (bucket_id = 'damage-photos' and auth.uid()::text = (storage.foldername(name))[1]);
