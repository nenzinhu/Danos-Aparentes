-- Colunas usadas pelo scanner de CNH e assinatura digital (src/lib/sync.ts,
-- inspectionRow()) que nunca tinham sido migradas para produção — todo upsert
-- de vistoria estava falhando por coluna inexistente.
ALTER TABLE public.vehicle_inspections
  ADD COLUMN IF NOT EXISTS cpf text DEFAULT '',
  ADD COLUMN IF NOT EXISTS cnh text DEFAULT '',
  ADD COLUMN IF NOT EXISTS cnh_category text DEFAULT '',
  ADD COLUMN IF NOT EXISTS inspector_signature text DEFAULT '',
  ADD COLUMN IF NOT EXISTS client_signature text DEFAULT '';
