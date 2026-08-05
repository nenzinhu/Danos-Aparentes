-- Propósito da vistoria: entrada (check-out) vs retorno (check-in).
ALTER TABLE public.vehicle_inspections
  ADD COLUMN IF NOT EXISTS inspection_purpose TEXT,
  ADD COLUMN IF NOT EXISTS baseline_inspection_id UUID;
