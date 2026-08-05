import { mapRemoteInspection } from '@/src/lib/reportMapping';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/server/supabaseAdmin';
import { requirePermission } from '@/src/lib/server/rbac';
import { hasActiveSubscriptionAccess } from '@/src/lib/subscriptionAccess';

async function isCorporate(userId: string): Promise<boolean> {
  if (!supabaseAdmin) return false;
  const { data } = await supabaseAdmin
    .from('subscriptions')
    .select('status, trial_ends_at, expires_at, plan_tier')
    .eq('user_id', userId)
    .maybeSingle();
  if (!data || data.plan_tier !== 'corporativo') return false;
  return hasActiveSubscriptionAccess({
    status: data.status as string,
    trialEndsAt: data.trial_ends_at as string | null,
    expiresAt: data.expires_at as string | null,
  });
}

export async function GET(req: NextRequest) {
  const authz = await requirePermission(req, 'view_team_reports');
  if (authz instanceof NextResponse) return authz;

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Supabase não configurado' }, { status: 500 });
  }

  if (!(await isCorporate(authz.userId))) {
    return NextResponse.json({ error: 'Recurso disponível apenas no plano Corporativo' }, { status: 403 });
  }

  try {
    const { data: company } = await supabaseAdmin
      .from('companies')
      .select('id')
      .eq('owner_id', authz.userId)
      .maybeSingle();

    if (!company) {
      return NextResponse.json({ members: [], reports: [] });
    }

    if (authz.tenantId && authz.tenantId !== company.id) {
      return NextResponse.json({ error: 'Escopo de tenant inválido' }, { status: 403 });
    }

    const { data: members, error: membersError } = await supabaseAdmin
      .from('team_members')
      .select('user_id, invited_email, status, invited_at, joined_at')
      .eq('company_id', company.id);
    if (membersError) throw membersError;

    const acceptedUserIds = (members ?? [])
      .filter(m => m.status === 'accepted' && m.user_id)
      .map(m => m.user_id as string);

    const emailByUserId = new Map((members ?? []).map(m => [m.user_id, m.invited_email]));

    let reports: { inspectorEmail: string; report: ReturnType<typeof mapRemoteInspection> }[] = [];
    if (acceptedUserIds.length > 0) {
      const { data: inspections, error: inspError } = await supabaseAdmin
        .from('vehicle_inspections')
        .select('*')
        .in('user_id', acceptedUserIds)
        .eq('tenant_id', company.id);
      if (inspError) throw inspError;

      const { data: damages, error: dmgError } = await supabaseAdmin
        .from('damages')
        .select('*')
        .in('user_id', acceptedUserIds);
      if (dmgError) throw dmgError;

      const damageRows = (damages ?? []) as Record<string, unknown>[];
      reports = (inspections ?? []).map((insp) => ({
        inspectorEmail: emailByUserId.get(insp.user_id as string) || '',
        report: mapRemoteInspection(insp as Record<string, unknown>, damageRows),
      }));
    }

    return NextResponse.json({ members: members ?? [], reports });
  } catch (err) {
    console.error('Erro ao buscar laudos da equipe:', err);
    return NextResponse.json(
      { error: 'Erro ao buscar laudos da equipe. Tente novamente em alguns instantes.' },
      { status: 500 },
    );
  }
}
