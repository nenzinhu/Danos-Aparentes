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
  if (plate.length < 6) {
    return NextResponse.json({ error: 'Placa inválida' }, { status: 400 });
  }

  try {
    const { data: existing, error: findError } = await supabaseAdmin
      .from('vehicle_qr_tokens')
      .select('token')
      .eq('plate', plate)
      .eq('user_id', user.id)
      .maybeSingle();
    if (findError) throw findError;

    if (existing?.token) {
      return NextResponse.json({ token: existing.token });
    }

    const { data: created, error: insertError } = await supabaseAdmin
      .from('vehicle_qr_tokens')
      .insert({ plate, user_id: user.id })
      .select('token')
      .single();
    if (insertError) throw insertError;

    return NextResponse.json({ token: created.token });
  } catch (err) {
    console.error('Erro ao gerar token de QR do veículo:', err);
    return NextResponse.json({ error: 'Não foi possível gerar o QR agora. Tente novamente.' }, { status: 500 });
  }
}
