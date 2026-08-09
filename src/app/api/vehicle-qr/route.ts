import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/server/supabaseAdmin';
import { getUserFromRequest } from '@/src/lib/server/auth';
import { normalizePlate } from '@/src/lib/reportComparison';

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Supabase não configurado' }, { status: 500 });
  }

  const body = await req.json().catch(() => ({}));
  const plate = normalizePlate(String(body.plate || ''));
  const vehicleId = typeof body.vehicleId === 'string' && body.vehicleId.trim()
    ? body.vehicleId.trim()
    : null;

  if (plate.length < 6 && !vehicleId) {
    return NextResponse.json({ error: 'Placa inválida' }, { status: 400 });
  }

  try {
    // Prefer existing token by vehicle_id (FASE 8), else by plate+user
    if (vehicleId) {
      const { data: byVehicle } = await supabaseAdmin
        .from('vehicle_qr_tokens')
        .select('token')
        .eq('vehicle_id', vehicleId)
        .eq('user_id', user.id)
        .maybeSingle();
      if (byVehicle?.token) {
        return NextResponse.json({ token: byVehicle.token });
      }
    }

    const { data: existing, error: findError } = await supabaseAdmin
      .from('vehicle_qr_tokens')
      .select('token, vehicle_id')
      .eq('plate', plate)
      .eq('user_id', user.id)
      .maybeSingle();
    if (findError) throw findError;

    if (existing?.token) {
      // Backfill vehicle_id on legacy token when provided
      if (vehicleId && !existing.vehicle_id) {
        await supabaseAdmin
          .from('vehicle_qr_tokens')
          .update({ vehicle_id: vehicleId })
          .eq('token', existing.token)
          .eq('user_id', user.id);
      }
      return NextResponse.json({ token: existing.token });
    }

    const { data: created, error: insertError } = await supabaseAdmin
      .from('vehicle_qr_tokens')
      .insert({
        plate: plate || 'UNKNOWN',
        user_id: user.id,
        ...(vehicleId ? { vehicle_id: vehicleId } : {}),
      })
      .select('token')
      .single();
    if (insertError) throw insertError;

    return NextResponse.json({ token: created.token });
  } catch (err) {
    console.error('Erro ao gerar token de QR do veículo:', err);
    return NextResponse.json({ error: 'Não foi possível gerar o QR agora. Tente novamente.' }, { status: 500 });
  }
}
