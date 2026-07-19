-- Prévia (draft) de dados cliente/veículo no computador + sync para o celular,
-- e colunas GPS da vistoria (antes só entravam no PDF/hash, sem sync).
ALTER TABLE public.vehicle_inspections
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'complete',
  ADD COLUMN IF NOT EXISTS geo_lat double precision,
  ADD COLUMN IF NOT EXISTS geo_lng double precision,
  ADD COLUMN IF NOT EXISTS geo_accuracy double precision,
  ADD COLUMN IF NOT EXISTS geo_address text,
  ADD COLUMN IF NOT EXISTS geo_captured_at bigint;

-- status: 'draft' = prévia cadastral (sem laudo final); 'complete' = vistoria salva/laudo.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'vehicle_inspections_status_check'
  ) THEN
    ALTER TABLE public.vehicle_inspections
      ADD CONSTRAINT vehicle_inspections_status_check
      CHECK (status IN ('draft', 'complete'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_vehicle_inspections_user_status
  ON public.vehicle_inspections (user_id, status);
