import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/server/supabaseAdmin';
import { getUserFromRequest } from '@/src/lib/server/auth';

type QuotaResult = {
  allowed: boolean;
  reason?: string;
  limit: number | null;
  used?: number;
  plan_tier?: string;
};

/**
 * Consome uma unidade da cota mensal de laudos em PDF do usuário (Starter:
 * 20/mês, Pro: 80/mês, Corporativo: ilimitado). Chamada pelo client antes de
 * gerar cada PDF — ver consume_laudo_quota() em
 * src/supabase/migrations/20260724_starter_plan_quota.sql para a lógica de
 * limite e reset mensal (roda no banco para ser atômica entre gerações
 * concorrentes do mesmo usuário).
 */
export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Supabase não configurado' }, { status: 500 });
  }

  const { data, error } = await supabaseAdmin.rpc('consume_laudo_quota', { p_user_id: user.id });

  if (error) {
    console.error('[report-quota] Falha ao consumir cota de laudos:', error);
    return NextResponse.json({ error: 'Erro ao verificar limite de laudos' }, { status: 500 });
  }

  const result = data as QuotaResult;
  return NextResponse.json(result, { status: result.allowed ? 200 : 403 });
}
