-- Garante tabela vehicle_events (pode faltar em prod) + RLS alinhada ao app.

CREATE TABLE IF NOT EXISTS public.vehicle_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL,
  tenant_id TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'OTHER',
  title TEXT NOT NULL,
  description TEXT,
  date TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID,
  location TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  photos TEXT[] DEFAULT '{}',
  documents JSONB DEFAULT '[]'::jsonb,
  inspection_id UUID,
  status TEXT DEFAULT 'completed',
  hash TEXT,
  signature JSONB
);

-- FK opcional se vehicles existir
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'vehicles'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'vehicle_events_vehicle_id_fkey'
  ) THEN
    BEGIN
      ALTER TABLE public.vehicle_events
        ADD CONSTRAINT vehicle_events_vehicle_id_fkey
        FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id) ON DELETE CASCADE;
    EXCEPTION WHEN others THEN NULL;
    END;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_vehicle_events_vehicle_date ON public.vehicle_events (vehicle_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_vehicle_events_tenant_date ON public.vehicle_events (tenant_id, date DESC);

ALTER TABLE public.vehicle_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir leitura de eventos por tenant" ON public.vehicle_events;
DROP POLICY IF EXISTS "Permitir criacao de eventos por tenant" ON public.vehicle_events;
DROP POLICY IF EXISTS "Permitir atualizacao de eventos por tenant" ON public.vehicle_events;
DROP POLICY IF EXISTS "Permitir delecao de eventos por tenant" ON public.vehicle_events;
DROP POLICY IF EXISTS "vehicle_events_select_tenant" ON public.vehicle_events;
DROP POLICY IF EXISTS "vehicle_events_insert_tenant" ON public.vehicle_events;
DROP POLICY IF EXISTS "vehicle_events_update_tenant" ON public.vehicle_events;
DROP POLICY IF EXISTS "vehicle_events_delete_tenant" ON public.vehicle_events;

CREATE OR REPLACE FUNCTION public.can_access_vehicle_event_tenant(p_tenant_id text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT
    p_tenant_id = ('user:' || auth.uid()::text)
    OR (
      p_tenant_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      AND (
        EXISTS (
          SELECT 1 FROM public.companies c
          WHERE c.id::text = p_tenant_id AND c.owner_id = auth.uid()
        )
        OR EXISTS (
          SELECT 1 FROM public.team_members tm
          WHERE tm.company_id::text = p_tenant_id
            AND tm.user_id = auth.uid()
            AND tm.status = 'accepted'
        )
      )
    );
$$;

DROP POLICY IF EXISTS "vehicle_events_select_tenant" ON public.vehicle_events;
CREATE POLICY "vehicle_events_select_tenant" ON public.vehicle_events
  FOR SELECT USING (public.can_access_vehicle_event_tenant(tenant_id));

DROP POLICY IF EXISTS "vehicle_events_insert_tenant" ON public.vehicle_events;
CREATE POLICY "vehicle_events_insert_tenant" ON public.vehicle_events
  FOR INSERT WITH CHECK (
    public.can_access_vehicle_event_tenant(tenant_id)
    AND (created_by IS NULL OR created_by = auth.uid())
  );

DROP POLICY IF EXISTS "vehicle_events_update_tenant" ON public.vehicle_events;
CREATE POLICY "vehicle_events_update_tenant" ON public.vehicle_events
  FOR UPDATE USING (public.can_access_vehicle_event_tenant(tenant_id));

DROP POLICY IF EXISTS "vehicle_events_delete_tenant" ON public.vehicle_events;
CREATE POLICY "vehicle_events_delete_tenant" ON public.vehicle_events
  FOR DELETE USING (public.can_access_vehicle_event_tenant(tenant_id));
