const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const OUT = '/workspace/public/ads/impact';
const ROOT = '/workspace';

async function main() {
const logoBuf = await sharp(path.join(ROOT, 'public/brand/logo-full.png'))
  .ensureAlpha()
  .png()
  .toBuffer();

const angles = [
  { id: 'loc-perda', src: 'public/blog/cobranca-avaria-devolucao-locadora.jpg', headline: 'Nao perca mais cobranca', sub: 'Laudo com foto, GPS e hash' },
  { id: 'ofi-regret', src: 'public/blog/vistoria-antes-do-orcamento-oficina.jpg', headline: 'Pare o "nao era assim"', sub: 'Vistoria na entrada da oficina' },
  { id: 'fro-hoje', src: 'public/blog/controle-avarias-frota-entrada-saida.jpg', headline: 'Controle avarias hoje', sub: 'Offline no patio - sync depois' },
  { id: 'seg-auth', src: 'public/blog/qr-code-e-hash-no-laudo-de-avarias.jpg', headline: 'Laudo com QR e hash', sub: 'Valide o PDF original' },
  { id: 'amas-loss', src: 'public/blog/como-provar-amassado-pre-existente-locacao.jpg', headline: 'Prove o amassado na entrada', sub: 'Foto + diagrama + hash' },
  { id: 'off-ability', src: 'public/blog/vistoria-de-frota-sem-internet.jpg', headline: 'Sem sinal? Continua', sub: 'Vistoria 100% offline' },
  { id: 'oferta-zero', src: 'public/blog/como-fazer-laudo-de-vistoria-veicular.jpg', headline: '7 dias gratis - sem cartao', sub: 'Pro R$49,90/mes - R$1,66/dia' },
  { id: 'cobranca-devolucao', src: 'public/blog/cobranca-avaria-devolucao-locadora.jpg', headline: 'Cobre avaria com prova', sub: 'Retirada x devolucao iguais' },
  { id: 'oficina-orcamento', src: 'public/blog/vistoria-antes-do-orcamento-oficina.jpg', headline: 'Vistoria antes do orcamento', sub: 'Laudo profissional na entrada' },
  { id: 'consulta-placa', src: 'public/blog/consulta-automatica-de-placa.jpg', headline: 'Digite a placa. Pronto.', sub: 'Autofill do veiculo' },
  { id: 'avarias-preexistentes', src: 'public/blog/avarias-preexistentes-como-provar.jpg', headline: 'Prove a avaria preexistente', sub: 'Registro claro e com hash' },
  { id: 'sem-papel', src: 'public/blog/vistoria-sem-papel.jpg', headline: 'Vistoria sem prancheta', sub: 'Fotos + assinatura + PDF' },
  { id: 'qr-hash', src: 'public/blog/qr-code-e-hash-no-laudo-de-avarias.jpg', headline: 'Laudo com QR e hash', sub: 'Anti-adulteracao no PDF' },
  { id: 'frota-entrada-saida', src: 'public/blog/controle-avarias-frota-entrada-saida.jpg', headline: 'Controle avarias na frota', sub: 'Historico auditavel' },
  { id: 'oferta-pro', src: 'public/blog/antes-e-depois-da-vistoria-digital.jpg', headline: '7 dias gratis de vistoria', sub: 'Sem cartao no trial' },
];

function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

async function landscape(a) {
  const W = 1200, H = 628;
  const photo = await sharp(path.join(ROOT, a.src))
    .resize(W, H, { fit: 'cover', position: 'attention' })
    .sharpen()
    .toBuffer();
  const logo = await sharp(logoBuf).resize({ width: 240 }).png().toBuffer();
  const overlay = Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#020617" stop-opacity="0.05"/>
      <stop offset="55%" stop-color="#020617" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="#020617" stop-opacity="0.55"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <rect x="28" y="${H-148}" rx="14" ry="14" width="820" height="120" fill="#020617" fill-opacity="0.78"/>
  <text x="48" y="${H-88}" font-family="Arial, Helvetica, sans-serif" font-size="40" font-weight="800" fill="#ffffff">${esc(a.headline)}</text>
  <text x="48" y="${H-46}" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="600" fill="#1FB6FF">${esc(a.sub)}</text>
  <rect x="${W-210}" y="${H-100}" rx="12" ry="12" width="170" height="44" fill="#1FB6FF"/>
  <text x="${W-125}" y="${H-71}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="15" font-weight="800" fill="#020617">7 DIAS GRATIS</text>
</svg>`);
  await sharp(photo)
    .composite([{ input: overlay, top: 0, left: 0 }, { input: logo, top: 24, left: 32 }])
    .jpeg({ quality: 92, progressive: false, mozjpeg: false, chromaSubsampling: '4:4:4' })
    .toFile(path.join(OUT, `${a.id}-1200x628.jpg`));
}

async function square(a) {
  const W = 1080, H = 1080;
  const photo = await sharp(path.join(ROOT, a.src))
    .resize(W, H, { fit: 'cover', position: 'attention' })
    .sharpen()
    .toBuffer();
  const logo = await sharp(logoBuf).resize({ width: 280 }).png().toBuffer();
  const overlay = Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#020617" stop-opacity="0.06"/>
      <stop offset="55%" stop-color="#020617" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#020617" stop-opacity="0.6"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <rect x="36" y="${H-250}" rx="16" ry="16" width="1008" height="214" fill="#020617" fill-opacity="0.78"/>
  <text x="64" y="${H-170}" font-family="Arial, Helvetica, sans-serif" font-size="48" font-weight="800" fill="#ffffff">${esc(a.headline)}</text>
  <text x="64" y="${H-118}" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="600" fill="#1FB6FF">${esc(a.sub)}</text>
  <rect x="64" y="${H-90}" rx="14" ry="14" width="300" height="52" fill="#1FB6FF"/>
  <text x="214" y="${H-55}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="800" fill="#020617">TESTAR 7 DIAS GRATIS</text>
</svg>`);
  await sharp(photo)
    .composite([{ input: overlay, top: 0, left: 0 }, { input: logo, top: 36, left: 40 }])
    .jpeg({ quality: 92, progressive: false, mozjpeg: false, chromaSubsampling: '4:4:4' })
    .toFile(path.join(OUT, `${a.id}-1080.jpg`));
}

async function reportHero() {
  const W = 1200, H = 628;
  const bg = await sharp({ create: { width: W, height: H, channels: 3, background: { r: 2, g: 6, b: 23 } } }).jpeg().toBuffer();
  const report = await sharp(path.join(ROOT, 'public/exemplos/modelo-relatorio.webp')).resize({ height: 540 }).png().toBuffer();
  const meta = await sharp(report).metadata();
  const left = Math.round((W - meta.width) / 2);
  const logo = await sharp(logoBuf).resize({ width: 220 }).png().toBuffer();
  const overlay = Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="0" width="${W}" height="70" fill="#020617" fill-opacity="0.92"/>
  <text x="260" y="44" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="700" fill="#e8f4ff">Laudo real do produto - PDF com hash e QR</text>
  <rect x="${W-200}" y="16" rx="10" ry="10" width="168" height="38" fill="#1FB6FF"/>
  <text x="${W-116}" y="41" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="14" font-weight="800" fill="#020617">7 DIAS GRATIS</text>
</svg>`);
  await sharp(bg).composite([
    { input: report, top: 70, left },
    { input: overlay, top: 0, left: 0 },
    { input: logo, top: 14, left: 24 },
  ]).jpeg({ quality: 93, progressive: false, mozjpeg: false }).toFile(path.join(OUT, 'laudo-real-1200x628.jpg'));

  const WS = 1080, HS = 1080;
  const bgS = await sharp({ create: { width: WS, height: HS, channels: 3, background: { r: 2, g: 6, b: 23 } } }).jpeg().toBuffer();
  const reportS = await sharp(path.join(ROOT, 'public/exemplos/modelo-relatorio.webp')).resize({ height: 860 }).png().toBuffer();
  const metaS = await sharp(reportS).metadata();
  const leftS = Math.round((WS - metaS.width) / 2);
  const logoS = await sharp(logoBuf).resize({ width: 260 }).png().toBuffer();
  const overlayS = Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg width="${WS}" height="${HS}" xmlns="http://www.w3.org/2000/svg">
  <rect x="40" y="${HS-130}" rx="14" ry="14" width="1000" height="100" fill="#020617" fill-opacity="0.88"/>
  <text x="64" y="${HS-75}" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="800" fill="#ffffff">Laudo PDF real - hash + QR</text>
  <text x="64" y="${HS-40}" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="600" fill="#1FB6FF">7 dias gratis - sem cartao</text>
</svg>`);
  await sharp(bgS).composite([
    { input: reportS, top: 90, left: leftS },
    { input: overlayS, top: 0, left: 0 },
    { input: logoS, top: 28, left: 36 },
  ]).jpeg({ quality: 93, progressive: false, mozjpeg: false }).toFile(path.join(OUT, 'laudo-real-1080.jpg'));
}

async function og() {
  const W = 1200, H = 628;
  const photo = await sharp(path.join(ROOT, 'public/blog/cobranca-avaria-devolucao-locadora.jpg'))
    .resize(W, H, { fit: 'cover', position: 'attention' })
    .toBuffer();
  const logo = await sharp(logoBuf).resize({ width: 280 }).png().toBuffer();
  const overlay = Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#020617" stop-opacity="0.08"/>
      <stop offset="100%" stop-color="#020617" stop-opacity="0.45"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <rect x="32" y="${H-100}" rx="12" ry="12" width="900" height="68" fill="#020617" fill-opacity="0.72"/>
  <text x="52" y="${H-55}" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="800" fill="#ffffff">Vistoria digital de avarias - laudo com hash e QR</text>
</svg>`);
  await sharp(photo).composite([
    { input: overlay, top: 0, left: 0 },
    { input: logo, top: 28, left: 36 },
  ]).jpeg({ quality: 92, progressive: false, mozjpeg: false }).toFile(path.join(ROOT, 'public/og-image.jpg'));
}

  for (const a of angles) {
    await landscape(a);
    await square(a);
    console.log('ok', a.id);
  }
  await reportHero();
  await og();
  fs.copyFileSync(path.join(OUT, 'loc-perda-1200x628.jpg'), path.join(ROOT, 'public/ads/ad-landscape-1200x628.jpg'));
  fs.copyFileSync(path.join(OUT, 'ofi-regret-1080.jpg'), path.join(ROOT, 'public/ads/ad-square-1200.jpg'));
  const m = await sharp(path.join(OUT, 'loc-perda-1200x628.jpg')).metadata();
  console.log('sample', m.width, m.height, 'progressive', m.isProgressive, 'bytes', fs.statSync(path.join(OUT, 'loc-perda-1200x628.jpg')).size);
}
main().catch(e => { console.error(e); process.exit(1); });
