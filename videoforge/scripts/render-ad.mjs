#!/usr/bin/env node
/**
 * Pipeline: VO → storyboard → render para um roteiro.
 * Uso: node scripts/render-ad.mjs scripts/video-15s.pt.md Ad15 ../out/ad-15s-9x16.mp4
 */
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const SCRIPT = process.argv[2];
const COMPOSITION = process.argv[3];
const OUT = process.argv[4];

if (!SCRIPT || !COMPOSITION || !OUT) {
  console.error('Uso: node scripts/render-ad.mjs scripts/video-15s.pt.md Ad15 ../out/ad-15s-9x16.mp4');
  process.exit(1);
}

function run(cmd, cwd = ROOT) {
  console.log(`\n▶ ${cmd}\n`);
  execSync(cmd, { cwd, stdio: 'inherit', env: process.env });
}

mkdirSync(join(ROOT, 'out'), { recursive: true });
process.chdir(ROOT);

run(`node scripts/gen-vo-elevenlabs.mjs ${SCRIPT}`);
run(`node scripts/build-storyboard.mjs ${SCRIPT}`);

const remotionDir = join(ROOT, 'remotion');
if (!existsSync(join(remotionDir, 'node_modules'))) {
  run('npm install', remotionDir);
}

run(`npx remotion render src/index.ts ${COMPOSITION} ${OUT} --concurrency=1`, remotionDir);
console.log(`\n✓ ${OUT}\n`);
