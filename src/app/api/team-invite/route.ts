import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/server/supabaseAdmin';
import { getUserFromRequest } from '@/src/lib/server/auth';
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

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Supabase não configurado' }, { status: 500 });
  }

  if (!(await isCorporate(user.id))) {
    return NextResponse.json({ error: 'Recurso disponível apenas no plano Corporativo' }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'E-mail inválido' }, { status: 400 });
  }

  const origin = req.headers.get('origin') || `https://${req.headers.get('host')}`;

  try {
    let { data: company } = await supabaseAdmin
      .from('companies')
      .select('id')
      .eq('owner_id', user.id)
      .maybeSingle();

    if (!company) {
      const { data: created, error: createError } = await supabaseAdmin
        .from('companies')
        .insert({ owner_id: user.id, name: '' })
        .select('id')
        .single();
      if (createError) throw createError;
      company = created;
    }

    const { data: invite, error: inviteError } = await supabaseAdmin
      .from('team_members')
      .insert({ company_id: company.id, invited_email: email, status: 'pending' })
      .select('invite_token')
      .single();
    if (inviteError) throw inviteError;

    return NextResponse.json({ inviteUrl: `${origin}/app/team/invite/${invite.invite_token}` });
  } catch (err) {
    console.error('Erro ao gerar convite de equipe:', err);
    return NextResponse.json(
      { error: 'Erro ao gerar convite. Tente novamente em alguns instantes.' },
      { status: 500 },
    );
  }
}
