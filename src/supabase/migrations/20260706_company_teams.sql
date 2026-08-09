-- Perfis de empresa com múltiplos inspetores (plano Corporativo)
-- Adiciona plan_tier a subscriptions, e as tabelas companies/team_members
-- para que um gestor Corporativo veja os laudos de toda a sua equipe.

-- 1. plan_tier em subscriptions
DO $$ BEGIN
  CREATE TYPE public.plan_tier AS ENUM ('pro', 'corporativo');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS plan_tier public.plan_tier NOT NULL DEFAULT 'pro';

-- 2. companies
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_companies_owner ON public.companies(owner_id);
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "owner_manages_own_company" ON public.companies;
CREATE POLICY "owner_manages_own_company" ON public.companies
  FOR ALL USING (owner_id = (SELECT auth.uid()))
  WITH CHECK (owner_id = (SELECT auth.uid()));

-- 3. team_members
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  invited_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted')),
  invite_token UUID NOT NULL DEFAULT gen_random_uuid(),
  invited_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  joined_at TIMESTAMPTZ
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_team_members_invite_token ON public.team_members(invite_token);
CREATE INDEX IF NOT EXISTS idx_team_members_company ON public.team_members(company_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user ON public.team_members(user_id);
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Dono gerencia (lê/escreve) todos os membros da própria empresa
DROP POLICY IF EXISTS "owner_manages_team_members" ON public.team_members;
CREATE POLICY "owner_manages_team_members" ON public.team_members
  FOR ALL USING (
    company_id IN (SELECT id FROM public.companies WHERE owner_id = (SELECT auth.uid()))
  )
  WITH CHECK (
    company_id IN (SELECT id FROM public.companies WHERE owner_id = (SELECT auth.uid()))
  );

-- Um membro pode ver a própria linha de vínculo (útil pra UI do inspetor saber
-- a que empresa pertence). Escrita continua só pelo backend via service role.
DROP POLICY IF EXISTS "member_sees_own_membership" ON public.team_members;
CREATE POLICY "member_sees_own_membership" ON public.team_members
  FOR SELECT USING (user_id = (SELECT auth.uid()));

-- 4. Leitura (somente leitura) do gestor sobre laudos da equipe.
-- Policies ADITIVAS: Postgres combina múltiplas policies permissivas com OR,
-- então o acesso de cada usuário aos próprios laudos (select_own_inspections /
-- select_own_damages, em supabase/schema.sql) continua intacto e não é
-- restringido por esta migration.
CREATE OR REPLACE FUNCTION public.is_team_manager_of(p_report_user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.team_members tm
    JOIN public.companies c ON c.id = tm.company_id
    WHERE tm.user_id = p_report_user_id
      AND tm.status = 'accepted'
      AND c.owner_id = auth.uid()
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp;

DROP POLICY IF EXISTS "manager_select_team_inspections" ON public.vehicle_inspections;
CREATE POLICY "manager_select_team_inspections" ON public.vehicle_inspections
  FOR SELECT USING (public.is_team_manager_of(user_id));

DROP POLICY IF EXISTS "manager_select_team_damages" ON public.damages;
CREATE POLICY "manager_select_team_damages" ON public.damages
  FOR SELECT USING (public.is_team_manager_of(user_id));
