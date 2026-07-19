import { NextResponse } from 'next/server';

/** Assistente IA removido do produto. */
export async function POST() {
  return NextResponse.json(
    { error: 'Assistente IA foi desativado neste aplicativo.' },
    { status: 410 },
  );
}
