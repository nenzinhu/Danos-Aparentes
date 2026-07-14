-- Token opaco por veículo (placa), para o QR físico colado no carro que leva
-- ao histórico público de vistorias daquele veículo (via /historico/[token]).
-- O token nunca expõe a placa diretamente na URL — evita que alguém tente
-- adivinhar placas de veículos alheios navegando URLs sequenciais.
create table if not exists public.vehicle_qr_tokens (
  token uuid primary key default gen_random_uuid(),
  plate text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists idx_vehicle_qr_tokens_plate on public.vehicle_qr_tokens(plate);
create unique index if not exists idx_vehicle_qr_tokens_plate_user on public.vehicle_qr_tokens(plate, user_id);

alter table public.vehicle_qr_tokens enable row level security;

-- Só o dono gerencia (cria/vê) os próprios tokens. A resolução pública
-- token → placa para a página /historico/[token] roda no servidor via
-- service role (bypassa RLS), nunca com a anon key — assim a tabela não
-- pode ser listada por completo por quem não é dono das linhas.
drop policy if exists "owner_manages_own_qr_tokens" on public.vehicle_qr_tokens;
create policy "owner_manages_own_qr_tokens" on public.vehicle_qr_tokens
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
