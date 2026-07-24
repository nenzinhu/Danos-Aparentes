import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/server/supabaseAdmin';
import { getUserFromRequest } from '@/src/lib/server/auth';
import { normalizePlate } from '@/src/lib/reportComparison';

// Descobre os user_ids cujos laudos entram na busca: o próprio usuário,
// mais toda a equipe da mesma empresa (dono OU membro aceito) no plano
// Corporativo. Sem empresa, o escopo é só o próprio usuário.
async function resolveScopeUserIds(userId: string): Promise<string[]> {
  if (!supabaseAdmin) return [userId];

  const { data: ownedCompany } = await supabaseAdmin
    .from('companies')
    .select('id')
    .eq('owner_id', userId)
    .maybeSingle();

  let companyId = ownedCompany?.id as string | undefined;
  let ownerId = userId;

  if (!companyId) {
    const { data: membership } = await supabaseAdmin
      .from('team_members')
      .select('company_id, companies(owner_id)')
      .eq('user_id', userId)
      .eq('status', 'accepted')
      .maybeSingle();

    if (membership?.company_id) {
      companyId = membership.company_id as string;
      const companies = membership.companies as unknown as { owner_id?: string } | { owner_id?: string }[] | null;
      const owner = Array.isArray(companies) ? companies[0]?.owner_id : companies?.owner_id;
      if (owner) ownerId = owner;
    }
  }

  if (!companyId) return [userId];

  const { data: members } = await supabaseAdmin
    .from('team_members')
    .select('user_id, status')
    .eq('company_id', companyId);

  const teamUserIds = (members ?? [])
    .filter(m => m.status === 'accepted' && m.user_id)
    .map(m => m.user_id as string);

  return Array.from(new Set([ownerId, userId, ...teamUserIds]));
}

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const rawPlate = req.nextUrl.searchParams.get('plate') || '';
  const plate = normalizePlate(rawPlate);
  if (plate.length < 6) {
    return NextResponse.json({ error: 'Placa inválida' }, { status: 400 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ found: false });
  }

  try {
    const scopeUserIds = await resolveScopeUserIds(user.id);

    const { data: inspections, error: inspError } = await supabaseAdmin
      .from('vehicle_inspections')
      .select('id, plate, updated_at')
      .in('user_id', scopeUserIds);
    if (inspError) throw inspError;

    const matches = (inspections ?? [])
      .filter(i => normalizePlate(String(i.plate || '')) === plate)
      .sort((a, b) => new Date(b.updated_at as string).getTime() - new Date(a.updated_at as string).getTime());

    const latest = matches[0];
    if (!latest) {
      return NextResponse.json({ found: false });
    }

    const { data: damages, error: dmgError } = await supabaseAdmin
      .from('damages')
      .select('part_id, type')
      .eq('inspection_id', latest.id);
    if (dmgError) throw dmgError;

    return NextResponse.json({
      found: true,
      updatedAt: latest.updated_at,
      damages: (damages ?? []).map(d => ({ partId: d.part_id, type: d.type })),
    });
  } catch (err) {
    console.error('Erro ao buscar laudo anterior por placa:', err);
    // Não bloqueia a vistoria — só não mostra a comparação.
    return NextResponse.json({ found: false });
  }
}
