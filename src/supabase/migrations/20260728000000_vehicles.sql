-- FASE 3 (vehicle evidence): entidade Vehicle + vínculo opcional em vistorias.
-- Additive only. Não muta laudos issued. Backfill por (tenant|user, placa).

CREATE TABLE IF NOT EXISTS public.vehicles (
  id text PRIMARY KEY,
  tenant_id uuid REFERENCES public.companies(id) ON DELETE SET NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plate text NOT NULL DEFAULT '',
  vin text,
  vehicle_type text DEFAULT '',
  brand text DEFAULT '',
  model text DEFAULT '',
  year int,
  color text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vehicles_tenant_plate
  ON public.vehicles (tenant_id, plate)
  WHERE tenant_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_vehicles_user_plate
  ON public.vehicles (user_id, plate);

CREATE UNIQUE INDEX IF NOT EXISTS idx_vehicles_tenant_vin
  ON public.vehicles (tenant_id, upper(vin))
  WHERE vin IS NOT NULL AND length(trim(vin)) > 0 AND tenant_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_vehicles_user_vin_solo
  ON public.vehicles (user_id, upper(vin))
  WHERE vin IS NOT NULL AND length(trim(vin)) > 0 AND tenant_id IS NULL;

ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_vehicles" ON public.vehicles;
CREATE POLICY "select_own_vehicles" ON public.vehicles
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_vehicles" ON public.vehicles;
CREATE POLICY "insert_own_vehicles" ON public.vehicles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_vehicles" ON public.vehicles;
CREATE POLICY "update_own_vehicles" ON public.vehicles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Team manager read (when helper exists).
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'is_team_manager_of'
  ) THEN
    EXECUTE 'DROP POLICY IF EXISTS "manager_select_team_vehicles" ON public.vehicles';
    EXECUTE $pol$
      CREATE POLICY "manager_select_team_vehicles" ON public.vehicles
        FOR SELECT
        USING (public.is_team_manager_of(user_id))
    $pol$;
  END IF;
END $$;

-- Team members can select vehicles of the same company (tenant).
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'team_members'
  ) THEN
    EXECUTE 'DROP POLICY IF EXISTS "team_select_tenant_vehicles" ON public.vehicles';
    EXECUTE $pol$
      CREATE POLICY "team_select_tenant_vehicles" ON public.vehicles
        FOR SELECT
        USING (
          tenant_id IS NOT NULL
          AND EXISTS (
            SELECT 1 FROM public.team_members tm
            WHERE tm.user_id = auth.uid()
              AND tm.company_id = vehicles.tenant_id
              AND tm.status = 'accepted'
          )
        )
    $pol$;
  END IF;
END $$;

ALTER TABLE public.vehicle_inspections
  ADD COLUMN IF NOT EXISTS vehicle_id text REFERENCES public.vehicles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_vehicle_inspections_vehicle
  ON public.vehicle_inspections (vehicle_id)
  WHERE vehicle_id IS NOT NULL;

-- Backfill: um vehicle por (escopo, placa normalizada). Escopo = tenant_id ou user_id.
-- Placa vazia / curta demais é ignorada (não cria veículo órfão).
WITH candidates AS (
  SELECT
    vi.user_id,
    vi.tenant_id,
    upper(regexp_replace(coalesce(vi.plate, ''), '[^A-Za-z0-9]', '', 'g')) AS plate_norm,
    min(vi.created_at) AS first_seen,
    max(vi.updated_at) AS last_seen,
    (array_agg(vi.brand ORDER BY vi.updated_at DESC))[1] AS brand,
    (array_agg(vi.color ORDER BY vi.updated_at DESC))[1] AS color,
    (array_agg(vi.vehicle_type ORDER BY vi.updated_at DESC))[1] AS vehicle_type
  FROM public.vehicle_inspections vi
  WHERE vi.vehicle_id IS NULL
    AND length(upper(regexp_replace(coalesce(vi.plate, ''), '[^A-Za-z0-9]', '', 'g'))) >= 6
  GROUP BY vi.user_id, vi.tenant_id,
    upper(regexp_replace(coalesce(vi.plate, ''), '[^A-Za-z0-9]', '', 'g'))
),
inserted AS (
  INSERT INTO public.vehicles (
    id, tenant_id, user_id, plate, vehicle_type, brand, color, created_at, updated_at
  )
  SELECT
    gen_random_uuid()::text,
    c.tenant_id,
    c.user_id,
    c.plate_norm,
    coalesce(c.vehicle_type, ''),
    coalesce(c.brand, ''),
    coalesce(c.color, ''),
    coalesce(c.first_seen, now()),
    to_timestamp(greatest(c.last_seen, 0) / 1000.0)
  FROM candidates c
  WHERE NOT EXISTS (
    SELECT 1 FROM public.vehicles v
    WHERE v.user_id = c.user_id
      AND v.tenant_id IS NOT DISTINCT FROM c.tenant_id
      AND upper(regexp_replace(v.plate, '[^A-Za-z0-9]', '', 'g')) = c.plate_norm
  )
  RETURNING id, user_id, tenant_id, plate
)
UPDATE public.vehicle_inspections vi
SET vehicle_id = v.id
FROM public.vehicles v
WHERE vi.vehicle_id IS NULL
  AND vi.user_id = v.user_id
  AND vi.tenant_id IS NOT DISTINCT FROM v.tenant_id
  AND upper(regexp_replace(coalesce(vi.plate, ''), '[^A-Za-z0-9]', '', 'g'))
      = upper(regexp_replace(v.plate, '[^A-Za-z0-9]', '', 'g'));

-- Allow linking vehicle_id on issued rows without content mutation of other fields.
-- The existing immutability trigger already permits only status→superseded content freeze;
-- vehicle_id is a relational pointer and may be set during backfill / late link.
CREATE OR REPLACE FUNCTION public.prevent_issued_inspection_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.status IN ('issued', 'superseded', 'cancelled') THEN
    IF OLD.status = 'issued' AND NEW.status = 'superseded' THEN
      IF NEW.owner IS DISTINCT FROM OLD.owner
         OR NEW.phone IS DISTINCT FROM OLD.phone
         OR NEW.brand IS DISTINCT FROM OLD.brand
         OR NEW.plate IS DISTINCT FROM OLD.plate
         OR NEW.general_notes IS DISTINCT FROM OLD.general_notes
         OR NEW.ref IS DISTINCT FROM OLD.ref
         OR NEW.inspector_signature IS DISTINCT FROM OLD.inspector_signature
         OR NEW.client_signature IS DISTINCT FROM OLD.client_signature
         OR NEW.geo_lat IS DISTINCT FROM OLD.geo_lat
         OR NEW.geo_lng IS DISTINCT FROM OLD.geo_lng
         OR NEW.issued_hash IS DISTINCT FROM OLD.issued_hash
         OR NEW.public_code IS DISTINCT FROM OLD.public_code
         OR NEW.laudo_version IS DISTINCT FROM OLD.laudo_version
         OR NEW.parent_inspection_id IS DISTINCT FROM OLD.parent_inspection_id
      THEN
        RAISE EXCEPTION 'issued inspection content is immutable (only status→superseded allowed)';
      END IF;
      RETURN NEW;
    END IF;
    -- Permit only vehicle_id (and updated_at) changes for relational backfill/link.
    IF NEW.vehicle_id IS DISTINCT FROM OLD.vehicle_id
       AND NEW.owner IS NOT DISTINCT FROM OLD.owner
       AND NEW.phone IS NOT DISTINCT FROM OLD.phone
       AND NEW.brand IS NOT DISTINCT FROM OLD.brand
       AND NEW.plate IS NOT DISTINCT FROM OLD.plate
       AND NEW.general_notes IS NOT DISTINCT FROM OLD.general_notes
       AND NEW.ref IS NOT DISTINCT FROM OLD.ref
       AND NEW.inspector_signature IS NOT DISTINCT FROM OLD.inspector_signature
       AND NEW.client_signature IS NOT DISTINCT FROM OLD.client_signature
       AND NEW.geo_lat IS NOT DISTINCT FROM OLD.geo_lat
       AND NEW.geo_lng IS NOT DISTINCT FROM OLD.geo_lng
       AND NEW.issued_hash IS NOT DISTINCT FROM OLD.issued_hash
       AND NEW.public_code IS NOT DISTINCT FROM OLD.public_code
       AND NEW.laudo_version IS NOT DISTINCT FROM OLD.laudo_version
       AND NEW.parent_inspection_id IS NOT DISTINCT FROM OLD.parent_inspection_id
       AND NEW.status IS NOT DISTINCT FROM OLD.status
    THEN
      RETURN NEW;
    END IF;
    RAISE EXCEPTION 'inspection status % is immutable — create a correction (new version)', OLD.status;
  END IF;
  RETURN NEW;
END;
$$;
