-- FASE 8: amarrar QR do veículo a vehicles.id (opcional, compatível com tokens por placa).

ALTER TABLE public.vehicle_qr_tokens
  ADD COLUMN IF NOT EXISTS vehicle_id text REFERENCES public.vehicles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_vehicle_qr_tokens_vehicle
  ON public.vehicle_qr_tokens (vehicle_id)
  WHERE vehicle_id IS NOT NULL;
