import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/server/supabaseAdmin';
import { getUserFromRequest } from '@/src/lib/server/auth';

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Supabase não configurado' }, { status: 500 });
  }

  const body = await req.json().catch(() => ({}));
  const token = typeof body?.token === 'string' ? body.token : '';
  if (!token) {
    return NextResponse.json({ error: 'Convite inválido' }, { status: 400 });
  }

  try {
    const { data: invite, error: findError } = await supabaseAdmin
      .from('team_members')
      .select('id, invited_email, status')
      .eq('invite_token', token)
      .maybeSingle();

    if (findError) throw findError;
    if (!invite) {
      return NextResponse.json({ error: 'Convite não encontrado' }, { status: 404 });
    }
    if (invite.status === 'accepted') {
      return NextResponse.json({ error: 'Este convite já foi aceito' }, { status: 409 });
    }
    if ((invite.invited_email || '').toLowerCase() !== (user.email || '').toLowerCase()) {
      return NextResponse.json({ error: 'Este convite foi enviado para outro e-mail' }, { status: 403 });
    }

    const { error: updateError } = await supabaseAdmin
      .from('team_members')
      .update({ user_id: user.id, status: 'accepted', joined_at: new Date().toISOString() })
      .eq('id', invite.id);
    if (updateError) throw updateError;

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Erro ao aceitar convite de equipe:', err);
    return NextResponse.json(
      { error: 'Erro ao aceitar convite. Tente novamente em alguns instantes.' },
      { status: 500 },
    );
  }
}
