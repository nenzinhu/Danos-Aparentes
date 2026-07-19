import { NextResponse } from 'next/server';

/** Análise por IA removida do produto. */
export async function POST() {
  return NextResponse.json(
    { error: 'Análise por IA foi desativada neste aplicativo.' },
    { status: 410 },
  );
}
