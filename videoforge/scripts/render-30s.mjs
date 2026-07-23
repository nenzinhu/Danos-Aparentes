#!/usr/bin/env node
/**
 * Pipeline completo 30s: VO → timing gate → storyboard → render Remotion
 * Uso (a partir de videoforge/):
 *   node scripts/render-30s.mjs
 *   node scripts/render-30s.mjs --silent   # sem ElevenLabs (VO mudo)
 */
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SCRIPT = 'scripts/video-30s.pt.md';
const silent = process.argv.includes('--silent');

function run(cmd, cwd = ROOT) {
  console.log(`\n▶ ${cmd}\n`);
  execSync(cmd, { cwd, stdio: 'inherit', env: process.env });
}

process.chdir(ROOT);
mkdirSync(join(ROOT, 'out'), { recursive: true });

if (silent) {
  console.log('Modo --silent: render sem trilha de VO (ffmpeg não necessário)\n');
} else {
  try {
    run(`node scripts/gen-vo-elevenlabs.mjs ${SCRIPT}`);
  } catch {
    console.warn('\n⚠ ElevenLabs falhou — usando VO silencioso. Configure ELEVENLABS_API_KEY no .env\n');
    run(`node scripts/gen-silent-vo.mjs ${SCRIPT}`);
  }
}

run(`node scripts/build-storyboard.mjs ${SCRIPT}`);

const hasVo = existsSync(join(ROOT, 'cache', 'video-30s.pt', 'vo', 'shot-01.mp3'));
if (!hasVo && !silent) {
  console.log('Sem arquivos VO — render apenas com legendas visuais.\n');
}

const remotionDir = join(ROOT, 'remotion');
if (!existsSync(join(remotionDir, 'node_modules'))) {
  run('npm install', remotionDir);
}

run('npx remotion render src/index.ts Ad30 ../out/ad-30s-9x16.mp4 --concurrency=1', remotionDir);

console.log('\n✓ Entrega: videoforge/out/ad-30s-9x16.mp4\n');
