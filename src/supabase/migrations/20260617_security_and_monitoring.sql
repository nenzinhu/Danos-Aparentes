-- 1. SQL Validation Triggers

-- Plate validation: Ensure 'plate' follows a basic Brazilian format (AAA0A00 or AAA0000)
-- Based on cleaned input (7 characters, no hyphens)
CREATE OR REPLACE FUNCTION public.validate_plate()
RETURNS TRIGGER AS $$
BEGIN
  -- Regex matches:
  -- 3 Letters [A-Z]{3}
  -- 1 Digit [0-9]
  -- 1 Letter or Digit [A-Z0-9] (Mercosul uses letter, old uses digit)
  -- 2 Digits [0-9]{2}
  -- Só valida quando a placa já tem 7 caracteres: o formulário (VehicleInfoForm)
  -- salva rascunhos com placa vazia/parcial enquanto o usuário ainda digita, e
  -- esses rascunhos também sincronizam.
  IF length(NEW.plate) = 7 AND NEW.plate !~ '^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$' THEN
    RAISE EXCEPTION 'Invalid Brazilian plate format. Expected AAA0A00 or AAA0000.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS validate_plate_trigger ON public.vehicle_inspections;
CREATE TRIGGER validate_plate_trigger
BEFORE INSERT OR UPDATE ON public.vehicle_inspections
FOR EACH ROW EXECUTE FUNCTION public.validate_plate();


-- Date validation: Ensure 'updated_at' is not in the future
-- Note: 'updated_at' in this app is stored as milliseconds (numeric)
CREATE OR REPLACE FUNCTION public.validate_not_future_date()
RETURNS TRIGGER AS $$
BEGIN
  -- Tolerância de 5min para desvio de relógio entre cliente e servidor.
  IF NEW.updated_at > (EXTRACT(EPOCH FROM NOW()) * 1000 + 300000) THEN
    RAISE EXCEPTION 'Update date cannot be in the future.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for vehicle_inspections
DROP TRIGGER IF EXISTS validate_date_inspections_trigger ON public.vehicle_inspections;
CREATE TRIGGER validate_date_inspections_trigger
BEFORE INSERT OR UPDATE ON public.vehicle_inspections
FOR EACH ROW EXECUTE FUNCTION public.validate_not_future_date();

-- Trigger for damages
DROP TRIGGER IF EXISTS validate_date_damages_trigger ON public.damages;
CREATE TRIGGER validate_date_damages_trigger
BEFORE INSERT OR UPDATE ON public.damages
FOR EACH ROW EXECUTE FUNCTION public.validate_not_future_date();


-- 2. Error Logging Table
-- Schema alinhado ao que src/lib/sync.ts (logSyncError) realmente grava:
-- type, report_id, error, retry_count, timestamp (ms).

CREATE TABLE IF NOT EXISTS public.sync_errors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  report_id TEXT,
  error TEXT NOT NULL,
  retry_count INT NOT NULL DEFAULT 0,
  timestamp BIGINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.sync_errors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "insert_own_sync_errors" ON public.sync_errors;
CREATE POLICY "insert_own_sync_errors" ON public.sync_errors
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "select_own_sync_errors" ON public.sync_errors;
CREATE POLICY "select_own_sync_errors" ON public.sync_errors
  FOR SELECT USING (auth.uid() = user_id);


-- 3. Storage Policy Audit
-- Review and ensure users can only access their own folders in 'damage-photos' bucket.
-- Folder name matches user_id.

-- Ensure the bucket exists (this might fail if already created via UI, so we catch or just assume)
-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('damage-photos', 'damage-photos', false)
-- ON CONFLICT (id) DO NOTHING;

-- SELECT: Users can only see objects in their own folder
DROP POLICY IF EXISTS "Users can view their own damage photos" ON storage.objects;
CREATE POLICY "Users can view their own damage photos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'damage-photos' AND
  (storage.foldername(name))[1] = (SELECT auth.uid())::text
);

-- INSERT: Users can only upload to their own folder
DROP POLICY IF EXISTS "Users can upload their own damage photos" ON storage.objects;
CREATE POLICY "Users can upload their own damage photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'damage-photos' AND
  (storage.foldername(name))[1] = (SELECT auth.uid())::text
);

-- UPDATE: Users can only update objects in their own folder
DROP POLICY IF EXISTS "Users can update their own damage photos" ON storage.objects;
CREATE POLICY "Users can update their own damage photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'damage-photos' AND
  (storage.foldername(name))[1] = (SELECT auth.uid())::text
);

-- DELETE: Users can only delete objects in their own folder
DROP POLICY IF EXISTS "Users can delete their own damage photos" ON storage.objects;
CREATE POLICY "Users can delete their own damage photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'damage-photos' AND
  (storage.foldername(name))[1] = (SELECT auth.uid())::text
);
