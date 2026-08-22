-- Fotos dos 4 lados do veículo (lateral L/R, frontal, traseira) por vistoria.
ALTER TABLE public.vehicle_inspections
  ADD COLUMN IF NOT EXISTS view_photos jsonb NOT NULL DEFAULT '{}'::jsonb;
