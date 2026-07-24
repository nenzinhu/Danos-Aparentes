#!/usr/bin/env node
/**
 * Timing gate — compara duração estimada do VO vs slot do roteiro.
 * Requer ffprobe no PATH para medição precisa.
 * Uso (a partir de videoforge/):
 *   node scripts/validate-timing.mjs scripts/video-30s.pt.md
 */
import { readFileSync, existsSync } from 'node:fs';
import { join, basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

function parseScript(md) {
  const shots = [];
  const blocks = md.split(/^### Shot /m).slice(1);
  for (const block of blocks) {
    const numMatch = block.match(/^(\d+)/);
    if (!numMatch) continue;
    const num = numMatch[1].padStart(2, '0');
    const duration = parseFloat(block.match(/\*\*duration\*\*\s*\|\s*([\d.]+)s?/i)?.[1] ?? '0');
    const slot = (block.match(/\*\*slot\*\*\s*\|\s*(\w+)/i)?.[1] ?? 'CUT').toUpperCase();
    const vo = block.match(/\*\*VO\*\*\s*\|\s*(.+)/i)?.[1]?.trim();
    if (!vo || !duration) continue;
    shots.push({ num, duration, slot, vo });
  }
  return shots;
}

function ffprobeDuration(file) {
  try {
    const out = execSync(
      `ffprobe -v error -show_entries format=duration -of csv=p=0 "${file}"`,
      { encoding: 'utf8' },
    );
    return parseFloat(out.trim());
  } catch {
    return null;
  }
}

function main() {
  const scriptPath = process.argv[2];
  if (!scriptPath) {
    console.error('Uso: node scripts/validate-timing.mjs scripts/video-30s.pt.md');
    process.exit(1);
  }

  const absScript = join(process.cwd(), scriptPath);
  const md = readFileSync(absScript, 'utf8');
  const shots = parseScript(md);
  const slug = basename(scriptPath, '.md');
  const voDir = join(ROOT, 'cache', slug, 'vo');

  let totalSlot = 0;
  let failures = 0;
  const TOLERANCE = 0.35; // segundos — VO pode ser até 350ms menor que slot (pausa visual)

  console.log(`\n⏱  Timing gate — ${scriptPath}\n`);

  for (const shot of shots) {
    totalSlot += shot.duration;
    const voFile = join(voDir, `shot-${shot.num}.mp3`);
    let voDur = null;
    let status = 'SKIP';

    if (existsSync(voFile)) {
      voDur = ffprobeDuration(voFile);
      if (voDur === null) status = 'NO_FFPROBE';
      else if (voDur > shot.duration + TOLERANCE) {
        status = 'FAIL';
        failures++;
      } else if (voDur < shot.duration - 1.5 && shot.slot === 'CUT') {
        status = 'WARN_SHORT';
      } else {
        status = 'PASS';
      }
    }

    const icon =
      status === 'PASS' ? '✓' : status === 'FAIL' ? '✗' : status === 'WARN_SHORT' ? '⚠' : '○';
    const voStr = voDur != null ? `${voDur.toFixed(2)}s` : '—';
    console.log(
      `  ${icon} Shot ${shot.num}  slot=${shot.duration}s (${shot.slot})  VO=${voStr}  [${status}]`,
    );
    if (status === 'FAIL') {
      console.log(`      VO excede slot em ${(voDur - shot.duration).toFixed(2)}s — encurte texto ou aumente slot`);
    }
  }

  console.log(`\n  Total slots: ${totalSlot.toFixed(1)}s`);
  if (failures > 0) {
    console.error(`\n✗ GATE FAILED — ${failures} shot(s). Não renderizar até corrigir.\n`);
    process.exit(1);
  }
  if (!existsSync(voDir)) {
    console.log('\n○ VO ainda não gerado. Rode: node scripts/gen-vo-elevenlabs.mjs', scriptPath);
    process.exit(0);
  }
  console.log('\n✓ GATE PASSED (ou apenas slots validados sem VO)\n');
}

main();
