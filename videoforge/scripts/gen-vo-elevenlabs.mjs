#!/usr/bin/env node
/**
 * Gera narração (VO) por shot a partir de scripts video-*.pt.md
 * Uso (sempre a partir de videoforge/):
 *   node scripts/gen-vo-elevenlabs.mjs scripts/video-30s.pt.md
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const DEFAULT_VOICE = 'ErXwobaYiN019PkySvjV'; // Antoni PT-BR
const DEFAULT_MODEL = 'eleven_flash_v2_5';

function loadEnv() {
  const paths = [
    join(ROOT, '..', '.env.local'),
    join(ROOT, '..', '.env'),
    join(ROOT, '.env.local'),
    join(ROOT, '.env'),
  ];
  for (const p of paths) {
    if (!existsSync(p)) continue;
    for (const raw of readFileSync(p, 'utf8').split('\n')) {
      const line = raw.replace(/\r$/, '').trim();
      if (!line || line.startsWith('#')) continue;
      const m = line.match(/^([^=]+)=(.*)$/);
      if (!m) continue;
      const key = m[1].trim();
      if (!process.env[key]) process.env[key] = m[2].trim().replace(/^["']|["']$/g, '');
    }
  }
}

function parseScript(md) {
  const shots = [];
  const blocks = md.split(/^### Shot /m).slice(1);
  for (const block of blocks) {
    const numMatch = block.match(/^(\d+)/);
    if (!numMatch) continue;
    const num = numMatch[1].padStart(2, '0');
    const titleLine = block.split('\n')[0].replace(/^\d+\s*—\s*/, '').trim();
    const duration = parseFloat(block.match(/\*\*duration\*\*\s*\|\s*([\d.]+)s?/i)?.[1] ?? '0');
    const slot = block.match(/\*\*slot\*\*\s*\|\s*(\w+)/i)?.[1] ?? 'CUT';
    const vo = block.match(/\*\*VO\*\*\s*\|\s*(.+)/i)?.[1]?.trim();
    if (!vo || !duration) continue;
    shots.push({ num, title: titleLine, duration, slot, vo });
  }
  return shots;
}

async function synthesize(text, voiceId, apiKey) {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
      Accept: 'audio/mpeg',
    },
    body: JSON.stringify({
      text,
      model_id: DEFAULT_MODEL,
      language_code: 'pt',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.8,
        style: 0,
        use_speaker_boost: true,
        speed: 1.0,
      },
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`ElevenLabs ${res.status}: ${err}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

async function probeDurationMp3(buf) {
  // MP3 frame header estimate — rough; prefer ffprobe in validate-timing
  const kbps = 128;
  return buf.length / (kbps * 1000 / 8);
}

async function main() {
  const scriptPath = process.argv[2];
  if (!scriptPath) {
    console.error('Uso: node scripts/gen-vo-elevenlabs.mjs scripts/video-30s.pt.md');
    process.exit(1);
  }

  loadEnv();
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    console.error('ELEVENLABS_API_KEY não encontrada (.env na raiz do PWA)');
    process.exit(1);
  }

  const absScript = join(process.cwd(), scriptPath);
  const md = readFileSync(absScript, 'utf8');
  const shots = parseScript(md);
  if (!shots.length) {
    console.error('Nenhum shot parseado. Verifique o formato do markdown.');
    process.exit(1);
  }

  const slug = basename(scriptPath, '.md');
  const outDir = join(ROOT, 'cache', slug, 'vo');
  mkdirSync(outDir, { recursive: true });

  const manifest = { script: scriptPath, voiceId: DEFAULT_VOICE, shots: [] };

  for (const shot of shots) {
    const outFile = join(outDir, `shot-${shot.num}.mp3`);
    console.log(`[VO] Shot ${shot.num} — ${shot.title}`);
    const audio = await synthesize(shot.vo, DEFAULT_VOICE, apiKey);
    writeFileSync(outFile, audio);
    const estDuration = await probeDurationMp3(audio);
    manifest.shots.push({
      ...shot,
      file: `cache/${slug}/vo/shot-${shot.num}.mp3`,
      voDurationEst: Math.round(estDuration * 100) / 100,
    });
    console.log(`  → ${outFile} (~${estDuration.toFixed(1)}s VO, slot ${shot.duration}s ${shot.slot})`);
  }

  const manifestPath = join(ROOT, 'cache', slug, 'vo-manifest.json');
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`\nManifest: ${manifestPath}`);
  console.log('Próximo: node scripts/validate-timing.mjs', scriptPath);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
