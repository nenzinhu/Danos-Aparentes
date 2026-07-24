import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/server/supabaseAdmin';
import { getUserFromRequest } from '@/src/lib/server/auth';
import { hasActiveSubscriptionAccess } from '@/src/lib/subscriptionAccess';

const STORAGE_REF_PREFIX = 'storage:';

function normalizeRemotePhotoRef(ref: string): string {
  if (ref.startsWith('data:') || ref.startsWith(STORAGE_REF_PREFIX)) return ref;
  return `${STORAGE_REF_PREFIX}${ref}`;
}

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

function mapInspection(insp: Record<string, unknown>, damages: Record<string, unknown>[]) {
  return {
    id: insp.id,
    savedAt: insp.updated_at,
    syncedAt: insp.updated_at,
    vehicleType: insp.vehicle_type ?? undefined,
    vehicleInfo: {
      owner: insp.owner, phone: insp.phone, brand: insp.brand, plate: insp.plate,
      generalNotes: insp.general_notes, profile: insp.profile, ref: insp.ref, color: insp.color,
      vehicleTypeDesc: insp.vehicle_type_desc, city: insp.city, state: insp.state,
      cpf: insp.cpf || '', cnh: insp.cnh || '', cnhCategory: insp.cnh_category || '',
      inspectorSignature: insp.inspector_signature || '', clientSignature: insp.client_signature || '',
    },
    damages: damages
      .filter(d => d.inspection_id === insp.id)
      .map(d => ({
        id: d.id, vehicle: d.vehicle, view: d.view, partId: d.part_id, partName: d.part_name,
        type: d.type, typeName: d.type_name, severity: d.severity, notes: d.notes,
        photos: ((d.photos as string[] | null) ?? []).map(normalizeRemotePhotoRef),
        photoNotes: (d.photo_notes as string[] | null) ?? [],
      })),
  };
}

export async function GET(req: NextRequest) {
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

  try {
    const { data: company } = await supabaseAdmin
      .from('companies')
      .select('id')
      .eq('owner_id', user.id)
      .maybeSingle();

    if (!company) {
      return NextResponse.json({ members: [], reports: [] });
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

    let reports: { inspectorEmail: string; report: ReturnType<typeof mapInspection> }[] = [];
    if (acceptedUserIds.length > 0) {
      const { data: inspections, error: inspError } = await supabaseAdmin
        .from('vehicle_inspections')
        .select('*')
        .in('user_id', acceptedUserIds);
      if (inspError) throw inspError;

      const { data: damages, error: dmgError } = await supabaseAdmin
        .from('damages')
        .select('*')
        .in('user_id', acceptedUserIds);
      if (dmgError) throw dmgError;

      const damageRows = (damages ?? []) as Record<string, unknown>[];
      reports = (inspections ?? []).map((insp) => ({
        inspectorEmail: emailByUserId.get(insp.user_id as string) || '',
        report: mapInspection(insp as Record<string, unknown>, damageRows),
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
