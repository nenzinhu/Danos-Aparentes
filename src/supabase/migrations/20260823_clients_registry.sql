-- Cadastro reutilizável de clientes + veículos (pré-preenchimento rápido de inspeções).
-- Cada usuário (auth.users) só enxerga os próprios registros (RLS por auth.uid()).

CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Cliente
  owner TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  cpf TEXT,
  cnh TEXT,
  cnh_category TEXT,

  -- Veículo
  plate TEXT NOT NULL DEFAULT '',
  brand TEXT NOT NULL DEFAULT '',
  color TEXT NOT NULL DEFAULT '',
  vehicle_type_desc TEXT NOT NULL DEFAULT '',
  ano TEXT,
  km TEXT,
  city TEXT NOT NULL DEFAULT '',
  state TEXT NOT NULL DEFAULT '',
  profile TEXT NOT NULL DEFAULT '',

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_clients_user ON public.clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_user_plate ON public.clients(user_id, plate);
CREATE UNIQUE INDEX IF NOT EXISTS idx_clients_user_plate_unique
  ON public.clients(user_id, lower(plate)) WHERE plate <> '';

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "owner_manages_own_clients" ON public.clients;
CREATE POLICY "owner_manages_own_clients" ON public.clients
  FOR ALL USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- Mantém updated_at em updates
CREATE OR REPLACE FUNCTION public.touch_clients_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_clients_updated_at ON public.clients;
CREATE TRIGGER trg_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.touch_clients_updated_at();
