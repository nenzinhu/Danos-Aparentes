-- FASE 21: divulgação seletiva na verificação pública.
-- authenticity | summary | full. Legado sem valor → app trata como summary.

ALTER TABLE public.report_hashes
  ADD COLUMN IF NOT EXISTS disclosure_scope text DEFAULT 'summary';

ALTER TABLE public.report_hashes
  ADD COLUMN IF NOT EXISTS severity_summary jsonb;

-- Soft check: valores conhecidos (NULL/legado ok via DEFAULT).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'report_hashes_disclosure_scope_check'
  ) THEN
    ALTER TABLE public.report_hashes
      ADD CONSTRAINT report_hashes_disclosure_scope_check
      CHECK (
        disclosure_scope IS NULL
        OR disclosure_scope IN ('authenticity', 'summary', 'full')
      );
  END IF;
END $$;
