import { NextRequest, NextResponse } from 'next/server';
import { getClientIp, getUserFromRequest, userHasActiveSubscription } from '@/src/lib/server/auth';
import { checkRateLimit } from '@/src/lib/server/rateLimit';

// Placas brasileiras: formato antigo (ABC1234) ou Mercosul (ABC1D23).
const PLATE_REGEX = /^[A-Z]{3}\d[A-Z\d]\d{2}$/;

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const hasAccess = await userHasActiveSubscription(user.id);
  if (!hasAccess) {
    return NextResponse.json({ error: 'Assinatura necessária para consultar placas' }, { status: 403 });
  }

  const ip = getClientIp(req);
  const { allowed, retryAfterSec } = await checkRateLimit(`plate-lookup:${user.id}:${ip}`, 30, 10 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json(
      { error: 'Muitas requisições. Tente novamente em instantes.' },
      { status: 429, headers: { 'Retry-After': String(retryAfterSec) } },
    );
  }

  const plate = (req.nextUrl.searchParams.get('plate') || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (!PLATE_REGEX.test(plate)) {
    return NextResponse.json({ error: 'Placa inválida' }, { status: 400 });
  }

  const token = process.env.WDAPI_TOKEN;
  if (!token) {
    return NextResponse.json({ error: 'Consulta de placas não configurada' }, { status: 500 });
  }

  try {
    const res = await fetch(`https://wdapi2.com.br/consulta/${plate}/${token}`);
    if (!res.ok) {
      return NextResponse.json({ error: `Erro na consulta (HTTP ${res.status})` }, { status: 502 });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error('Erro na consulta de placa:', err);
    return NextResponse.json({ error: 'Erro ao consultar a placa' }, { status: 500 });
  }
}
