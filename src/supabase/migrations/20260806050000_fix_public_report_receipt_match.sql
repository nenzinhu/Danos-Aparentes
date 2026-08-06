-- Fix verify público: match case-insensitive + final_hash (QR/integrity).

CREATE OR REPLACE FUNCTION public.get_public_report_receipt(p_hash text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_row public.report_hashes%ROWTYPE;
  v_status text;
  v_norm text;
BEGIN
  IF p_hash IS NULL OR length(trim(p_hash)) < 8 THEN
    RETURN NULL;
  END IF;

  v_norm := upper(regexp_replace(trim(p_hash), '[\s-]', '', 'g'));

  SELECT * INTO v_row
  FROM public.report_hashes
  WHERE upper(hash) = v_norm
  LIMIT 1;

  IF NOT FOUND THEN
    SELECT * INTO v_row
    FROM public.report_hashes
    WHERE final_hash IS NOT NULL
      AND upper(regexp_replace(final_hash, '[\s-]', '', 'g')) = v_norm
    LIMIT 1;
  END IF;

  IF NOT FOUND AND length(v_norm) > 32 THEN
    SELECT * INTO v_row
    FROM public.report_hashes
    WHERE upper(hash) = left(v_norm, 32)
    LIMIT 1;
  END IF;

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

GRANT EXECUTE ON FUNCTION public.get_public_report_receipt(text) TO anon, authenticated;
