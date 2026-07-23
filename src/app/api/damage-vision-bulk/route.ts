import { NextResponse } from 'next/server';

/** Detecção automática por IA removida do produto. */
export async function POST() {
  return NextResponse.json(
    { error: 'Detecção automática por IA foi desativada neste aplicativo.' },
    { status: 410 },
  );
}
