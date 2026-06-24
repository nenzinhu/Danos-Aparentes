#!/usr/bin/env node
/**
 * Placeholder VO (silêncio) com duração do slot — para render sem ElevenLabs.
 * Uso: node scripts/gen-silent-vo.mjs scripts/video-30s.pt.md
 */
import { readFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

function parseScript(md) {
  const shots = [];
  for (const block of md.split(/^### Shot /m).slice(1)) {
    const num = block.match(/^(\d+)/)?.[1]?.padStart(2, '0');
    const duration = parseFloat(block.match(/\*\*duration\*\*\s*\|\s*([\d.]+)s?/i)?.[1] ?? '0');
    if (num && duration) shots.push({ num, duration });
  }
  return shots;
}

function main() {
  const scriptPath = process.argv[2];
  if (!scriptPath) {
    console.error('Uso: node scripts/gen-silent-vo.mjs scripts/video-30s.pt.md');
    process.exit(1);
  }
  const slug = basename(scriptPath, '.md');
  const md = readFileSync(join(process.cwd(), scriptPath), 'utf8');
  const shots = parseScript(md);
  const outDir = join(ROOT, 'cache', slug, 'vo');
  mkdirSync(outDir, { recursive: true });

  for (const s of shots) {
    const out = join(outDir, `shot-${s.num}.mp3`);
    if (existsSync(out)) {
      console.log(`skip ${out} (exists)`);
      continue;
    }
    execSync(
      `ffmpeg -y -f lavfi -i anullsrc=r=44100:cl=mono -t ${s.duration} -q:a 9 -acodec libmp3lame "${out}"`,
      { stdio: 'inherit' },
    );
    console.log(`→ ${out} (${s.duration}s silence)`);
  }
  console.log('\nPlaceholder VO pronto. Para narração real: gen-vo-elevenlabs.mjs');
}

main();
