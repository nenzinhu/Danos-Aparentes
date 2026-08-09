-- FASE 20: antifraude de fotos — perceptual hash + índice para reuso.
-- Additive only. Não bloqueia emissão; alertas vão para audit_log.

ALTER TABLE public.photo_evidence
  ADD COLUMN IF NOT EXISTS perceptual_hash text;

CREATE INDEX IF NOT EXISTS idx_photo_evidence_perceptual_hash
  ON public.photo_evidence (perceptual_hash)
  WHERE perceptual_hash IS NOT NULL;

-- Acelera lookup de reuso exato por usuário (já existe idx em sha256 global).
CREATE INDEX IF NOT EXISTS idx_photo_evidence_user_sha256
  ON public.photo_evidence (user_id, sha256);
