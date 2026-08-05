-- FASE 7: modular signature metadata (on-screen first provider).
-- Additive only. Does not claim legal / qualified signature validity.

ALTER TABLE public.vehicle_inspections
  ADD COLUMN IF NOT EXISTS inspector_signature_meta jsonb,
  ADD COLUMN IF NOT EXISTS client_signature_meta jsonb;
