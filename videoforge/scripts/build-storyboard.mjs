#!/usr/bin/env node
/**
 * Fase 5 — Gera storyboard.json a partir do roteiro + manifest de VO.
 * Uso (a partir de videoforge/):
 *   node scripts/build-storyboard.mjs scripts/video-30s.pt.md
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync } from 'node:fs';
import { join, basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const FPS = 30;
const W = 1080;
const H = 1920;

function parseScript(md) {
  const shots = [];
  const blocks = md.split(/^### Shot /m).slice(1);
  for (const block of blocks) {
    const numMatch = block.match(/^(\d+)/);
    if (!numMatch) continue;
    const num = numMatch[1].padStart(2, '0');
    const title = block.split('\n')[0].replace(/^\d+\s*—\s*/, '').trim();
    const duration = parseFloat(block.match(/\*\*duration\*\*\s*\|\s*([\d.]+)s?/i)?.[1] ?? '0');
    const slot = (block.match(/\*\*slot\*\*\s*\|\s*(\w+)/i)?.[1] ?? 'CUT').toUpperCase();
    const vo = block.match(/\*\*VO\*\*\s*\|\s*(.+)/i)?.[1]?.trim() ?? '';
    const onscreenKind = block.match(/kind:\s*`([^`]+)`/i)?.[1] ?? 'headline';
    const onscreenText = block.match(/text:\s*`([^`]+)`/i)?.[1] ?? '';
    const flags = [...block.matchAll(/`([a-z-]+)`/gi)].map((m) => m[1]).filter((f) =>
      ['broll', 'brand', 'logo', 'library', 'screenshot-ref'].some((x) => f.startsWith(x)),
    );
    if (!duration) continue;
    shots.push({ id: num, title, durationSec: duration, frames: Math.round(duration * FPS), slot, vo, onscreen: { kind: onscreenKind, text: onscreenText }, flags });
  }
  return shots;
}

function main() {
  const scriptPath = process.argv[2];
  if (!scriptPath) {
    console.error('Uso: node scripts/build-storyboard.mjs scripts/video-30s.pt.md');
    process.exit(1);
  }

  const slug = basename(scriptPath, '.md');
  const md = readFileSync(join(process.cwd(), scriptPath), 'utf8');
  const shots = parseScript(md);
  const outDir = join(ROOT, 'remotion', 'public');
  mkdirSync(outDir, { recursive: true });

  let fromFrame = 0;
  const timeline = shots.map((s) => {
    const entry = { ...s, fromFrame, toFrame: fromFrame + s.frames - 1 };
    fromFrame += s.frames;
    const voDir = join(outDir, 'vo', slug);
    const voSrc = join(ROOT, 'cache', slug, 'vo', `shot-${s.id}.mp3`);
    const voPublic = join(voDir, `shot-${s.id}.mp3`);
    if (existsSync(voSrc)) {
      mkdirSync(voDir, { recursive: true });
      copyFileSync(voSrc, voPublic);
      entry.voFile = `vo/${slug}/shot-${s.id}.mp3`;
    } else {
      entry.voFile = null;
    }
    return entry;
  });

  const brand = JSON.parse(readFileSync(join(ROOT, 'brand.json'), 'utf8'));
  const storyboard = {
    id: slug,
    fps: FPS,
    width: W,
    height: H,
    durationInFrames: fromFrame,
    durationSec: fromFrame / FPS,
    brand,
    shots: timeline,
  };

  const storyboardsDir = join(outDir, 'storyboards');
  mkdirSync(storyboardsDir, { recursive: true });
  const outPath = join(storyboardsDir, `${slug}.json`);
  writeFileSync(outPath, JSON.stringify(storyboard, null, 2));

  // compat: último build também em storyboard.json (legado)
  writeFileSync(join(outDir, 'storyboard.json'), JSON.stringify(storyboard, null, 2));

  const logoSrc = join(ROOT, '..', 'public', 'logo.svg');
  if (existsSync(logoSrc)) {
    copyFileSync(logoSrc, join(outDir, 'logo.svg'));
  }

  console.log(`Storyboard: ${outPath}`);
  console.log(`  ${timeline.length} shots · ${storyboard.durationSec}s · ${fromFrame} frames`);
}

main();
