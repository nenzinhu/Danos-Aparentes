-- Idempotent: garante coluna pending_plan_tier + RPC consume_laudo_quota
-- (produção reportou PGRST202 / PGRST204 quando 20260724 não estava aplicada).

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS laudos_used INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS laudos_period_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS pending_plan_tier TEXT;

-- plan_tier 'starter' — idempotente no PG 15+ (Supabase).
ALTER TYPE public.plan_tier ADD VALUE IF NOT EXISTS 'starter';

CREATE OR REPLACE FUNCTION public.consume_laudo_quota(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_tier public.plan_tier;
  v_limit INT;
  v_used INT;
  v_period_start TIMESTAMPTZ;
BEGIN
  SELECT plan_tier, laudos_used, laudos_period_start
    INTO v_tier, v_used, v_period_start
    FROM public.subscriptions
    WHERE user_id = p_user_id
    FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'no_subscription');
  END IF;

  IF v_period_start < (now() - INTERVAL '30 days') THEN
    v_used := 0;
    v_period_start := now();
  END IF;

  v_limit := CASE v_tier::text
    WHEN 'starter' THEN 20
    WHEN 'pro' THEN 80
    ELSE NULL
  END;

  IF v_limit IS NOT NULL AND v_used >= v_limit THEN
    UPDATE public.subscriptions
      SET laudos_period_start = v_period_start, updated_at = now()
      WHERE user_id = p_user_id;
    RETURN jsonb_build_object(
      'allowed', false, 'reason', 'limit_reached',
      'limit', v_limit, 'used', v_used, 'plan_tier', v_tier
    );
  END IF;

  v_used := v_used + 1;
  UPDATE public.subscriptions
    SET laudos_used = v_used, laudos_period_start = v_period_start, updated_at = now()
    WHERE user_id = p_user_id;

  RETURN jsonb_build_object(
    'allowed', true,
    'limit', v_limit, 'used', v_used, 'plan_tier', v_tier
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

GRANT EXECUTE ON FUNCTION public.consume_laudo_quota(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.consume_laudo_quota(UUID) TO authenticated;
