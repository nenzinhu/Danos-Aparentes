-- FASE isolamento: verify público via RPC (sem SELECT * aberto em report_hashes).

-- Receipt público por hash SHA
CREATE OR REPLACE FUNCTION public.get_public_report_receipt(p_hash text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_row public.report_hashes%ROWTYPE;
  v_status text;
BEGIN
  IF p_hash IS NULL OR length(trim(p_hash)) < 8 THEN
    RETURN NULL;
  END IF;

  SELECT * INTO v_row
  FROM public.report_hashes
  WHERE hash = upper(regexp_replace(trim(p_hash), '[\s-]', '', 'g'))
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  IF v_row.inspection_id IS NOT NULL AND length(trim(v_row.inspection_id)) > 0 THEN
    SELECT vi.status::text INTO v_status
    FROM public.vehicle_inspections vi
    WHERE vi.id::text = v_row.inspection_id
    LIMIT 1;
  END IF;

  RETURN jsonb_build_object(
    'hash', v_row.hash,
    'plate', v_row.plate,
    'ref', v_row.ref,
    'issued_at', v_row.issued_at,
    'damages_count', v_row.damages_count,
    'created_at', v_row.created_at,
    'geo_lat', v_row.geo_lat,
    'geo_lng', v_row.geo_lng,
    'geo_accuracy', v_row.geo_accuracy,
    'geo_address', v_row.geo_address,
    'company_name', v_row.company_name,
    'company_logo', v_row.company_logo,
    'report_key', v_row.report_key,
    'version', v_row.version,
    'public_code', v_row.public_code,
    'inspection_id', v_row.inspection_id,
    'disclosure_scope', v_row.disclosure_scope,
    'severity_summary', v_row.severity_summary,
    'final_hash', v_row.final_hash,
    'integrity_manifest', v_row.integrity_manifest,
    'correction_reason', v_row.correction_reason,
    'supersedes_hash', v_row.supersedes_hash,
    'inspection_status', v_status
  );
END;
$$;

-- Receipt por código público curto
CREATE OR REPLACE FUNCTION public.get_public_report_by_code(p_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_hash text;
BEGIN
  IF p_code IS NULL OR length(trim(p_code)) < 4 THEN
    RETURN NULL;
  END IF;

  SELECT rh.hash INTO v_hash
  FROM public.report_hashes rh
  WHERE upper(rh.public_code) = upper(trim(p_code))
  ORDER BY rh.version DESC NULLS LAST
  LIMIT 1;

  IF v_hash IS NULL THEN
    RETURN NULL;
  END IF;

  RETURN public.get_public_report_receipt(v_hash);
END;
$$;

-- Versões irmãs (só hash + version) para selo de supersedência
CREATE OR REPLACE FUNCTION public.get_public_report_versions(p_report_key text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF p_report_key IS NULL OR length(trim(p_report_key)) = 0 THEN
    RETURN '[]'::jsonb;
  END IF;

  RETURN COALESCE(
    (
      SELECT jsonb_agg(jsonb_build_object('hash', rh.hash, 'version', rh.version) ORDER BY rh.version ASC NULLS LAST)
      FROM public.report_hashes rh
      WHERE rh.report_key = p_report_key
    ),
    '[]'::jsonb
  );
END;
$$;

-- Lookup por pdf_hash no integrity_manifest
CREATE OR REPLACE FUNCTION public.get_public_report_by_pdf_hash(p_pdf_hash text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_hash text;
BEGIN
  IF p_pdf_hash IS NULL OR length(trim(p_pdf_hash)) < 8 THEN
    RETURN NULL;
  END IF;

  SELECT rh.hash INTO v_hash
  FROM public.report_hashes rh
  WHERE rh.integrity_manifest->>'pdf_hash' = trim(p_pdf_hash)
  LIMIT 1;

  IF v_hash IS NULL THEN
    RETURN NULL;
  END IF;

  RETURN public.get_public_report_receipt(v_hash);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_report_receipt(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_report_by_code(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_report_versions(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_report_by_pdf_hash(text) TO anon, authenticated;

-- Fecha SELECT aberto; autores autenticados ainda leem os próprios
DROP POLICY IF EXISTS "select_any_hash" ON public.report_hashes;

DROP POLICY IF EXISTS "select_own_hash" ON public.report_hashes;
CREATE POLICY "select_own_hash" ON public.report_hashes
  FOR SELECT
  USING (auth.uid() = user_id);

-- Membros da empresa leem receipts do tenant (app autenticado)
DROP POLICY IF EXISTS "select_tenant_hash" ON public.report_hashes;
CREATE POLICY "select_tenant_hash" ON public.report_hashes
  FOR SELECT
  USING (
    tenant_id IS NOT NULL
    AND (
      EXISTS (
        SELECT 1 FROM public.companies c
        WHERE c.id = report_hashes.tenant_id AND c.owner_id = auth.uid()
      )
      OR EXISTS (
        SELECT 1 FROM public.team_members tm
        WHERE tm.company_id = report_hashes.tenant_id
          AND tm.user_id = auth.uid()
          AND tm.status = 'accepted'
      )
    )
  );
