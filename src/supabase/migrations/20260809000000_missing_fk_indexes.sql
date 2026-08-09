-- Migração corretiva (auditada via supabase-postgres-best-practices):
-- Índices em chaves estrangeiras usadas por RLS / filtros frequentes que
-- ainda não tinham índice dedicado, causando sequential scan:
--   1) vehicles.user_id       -> RLS select_own_vehicles (WHERE user_id = auth.uid())
--   2) sync_errors.user_id   -> RLS select_own_sync_errors (WHERE user_id = auth.uid())
-- A regra schema-foreign-key-indexes exige índice em toda FK referenciada em
-- predicados de RLS/filtro. Sem isso, cada avaliação de policy ou listagem do
-- usuário faz seq scan na tabela.
--
-- Idempotente (CREATE INDEX IF NOT EXISTS) para rodar via `npm run db:push`.

-- 1) vehicles.user_id (FK -> auth.users, ON DELETE CASCADE)
CREATE INDEX IF NOT EXISTS idx_vehicles_user_id
  ON public.vehicles (user_id);

-- 2) sync_errors.user_id (FK -> auth.users, ON DELETE CASCADE)
CREATE INDEX IF NOT EXISTS idx_sync_errors_user_id
  ON public.sync_errors (user_id);
