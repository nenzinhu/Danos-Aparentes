import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/server/supabaseAdmin';
import { getAuthzFromRequest } from '@/src/lib/server/rbac';
import { normalizePlate } from '@/src/lib/reportComparison';
import { resolveReadableUserIds } from '@/src/lib/server/vehicleScope';

export async function GET(req: NextRequest) {
  const authz = await getAuthzFromRequest(req);
  if (!authz) {
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
    // Owner: equipe legível; inspector/solo: só o próprio user_id
    const scopeUserIds = await resolveReadableUserIds({
      userId: authz.userId,
      tenantId: authz.tenantId,
      role: authz.role,
    });

    let query = supabaseAdmin
      .from('vehicle_inspections')
      .select('id, plate, updated_at, user_id, tenant_id')
      .in('user_id', scopeUserIds);

    if (authz.tenantId) {
      query = query.eq('tenant_id', authz.tenantId);
    } else {
      query = query.is('tenant_id', null);
    }

    const { data: inspections, error: inspError } = await query;
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
    return NextResponse.json({ found: false });
  }
}
