-- Plano Starter + limite mensal de laudos em PDF por plano.
-- Starter: 20 laudos/mês · Pro: 80 laudos/mês · Corporativo: ilimitado.

-- 1. Novo valor de plan_tier. ALTER TYPE ... ADD VALUE não pode ser usado
-- dentro da mesma transação em que o valor é referenciado por um literal
-- do tipo enum — por isso a função abaixo compara plan_tier::text em vez de
-- comparar contra o literal 'starter'::plan_tier.
ALTER TYPE public.plan_tier ADD VALUE IF NOT EXISTS 'starter';

-- 2. Contador de laudos do período mensal corrente + tier pendente de
-- confirmação PIX (o Stripe já resolve o tier a partir do Price ID comprado,
-- mas o PIX não tem esse conceito nativo — precisa ser guardado à parte
-- entre a criação da cobrança e a confirmação do pagamento).
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS laudos_used INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS laudos_period_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS pending_plan_tier TEXT;

-- 3. Consome uma unidade de quota de laudos em PDF, reiniciando o contador
-- quando o período mensal (30 dias corridos desde o último reset) expira.
-- FOR UPDATE + single UPDATE torna a operação atômica entre gerações
-- concorrentes do mesmo usuário (ex: duas abas abertas).
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
    ELSE NULL -- corporativo: ilimitado
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
