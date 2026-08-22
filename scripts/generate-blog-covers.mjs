/**
 * Gera capas contextuais do blog (SVG + WebP) alinhadas ao título de cada post.
 * Uso: node scripts/generate-blog-covers.mjs
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { resolve, join } from 'node:path'
import sharp from 'sharp'

const OUT = resolve('public/blog-covers')
mkdirSync(OUT, { recursive: true })

const W = 828
const H = 352

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function svgWrap(aria, body, palette) {
  const { card0, card1, header0, header1, badge0, badge1, glow, accent = '#38bdf8' } = palette
  const uid = aria.replace(/\W+/g, '').slice(0, 12)
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(aria)}">
  <defs>
    <linearGradient id="card-${uid}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${card0}"/><stop offset="1" stop-color="${card1}"/>
    </linearGradient>
    <linearGradient id="header-${uid}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${header0}"/><stop offset="1" stop-color="${header1}"/>
    </linearGradient>
    <linearGradient id="badge-${uid}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${badge0}"/><stop offset="1" stop-color="${badge1}"/>
    </linearGradient>
    <radialGradient id="glow-${uid}" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="${glow}" stop-opacity="0.55"/>
      <stop offset="1" stop-color="${glow}" stop-opacity="0"/>
    </radialGradient>
    <filter id="soft-${uid}" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="14" stdDeviation="16" flood-color="#000" flood-opacity="0.38"/>
    </filter>
  </defs>
  <ellipse cx="414" cy="185" rx="230" ry="150" fill="url(#glow-${uid})"/>
  ${body.replaceAll('__UID__', uid).replaceAll('__ACC__', accent)}
</svg>`
}

function docCard(uid, opts = {}) {
  const { x = 300, y = 46, w = 222, h = 270, title = 'LAUDO DE VISTORIA', lines = 3, footer = 'hash · SHA-256 ✓', rotate = -5 } = opts
  const cx = x + w / 2
  const cy = y + h / 2
  const lineEls = Array.from({ length: lines }, (_, i) => {
    const lw = [178, 150, 164, 110][i] || 140
    return `<rect x="${x + 22}" y="${112 + i * 18}" width="${lw}" height="7" rx="3.5" fill="#94a3b8"/>`
  }).join('\n')
  return `
  <g transform="rotate(${rotate} ${cx} ${cy})" filter="url(#soft-__UID__)">
    <path d="M${x + 10} ${y} H${x + w - 44} L${x + w} ${y + 44} V${y + h - 10} A10 10 0 0 1 ${x + w - 10} ${y + h} H${x + 10} A10 10 0 0 1 ${x} ${y + h - 10} V${y + 10} A10 10 0 0 1 ${x + 10} ${y} Z" fill="url(#card-__UID__)"/>
    <path d="M${x + w - 44} ${y} V${y + 34} A10 10 0 0 0 ${x + w - 34} ${y + 44} H${x + w} Z" fill="#c3cede"/>
    <rect x="${x}" y="${y}" width="${w}" height="40" rx="10" fill="url(#header-__UID__)"/>
    <rect x="${x}" y="${y + 20}" width="${w}" height="20" fill="url(#header-__UID__)"/>
    <text x="${x + 22}" y="${y + 26}" font-family="sans-serif" font-weight="800" font-size="12" fill="#fff">${esc(title)}</text>
    ${lineEls}
    <line x1="${x + 22}" y1="${y + h - 74}" x2="${x + w - 22}" y2="${y + h - 74}" stroke="#c3cede" stroke-width="1.5"/>
    <text x="${x + 22}" y="${y + h - 52}" font-family="monospace" font-size="10" fill="#1e3a5f" opacity="0.85">${esc(footer)}</text>
  </g>`
}

function qrBlock(x, y, size = 46) {
  const s = size / 46
  return `
  <g transform="translate(${x} ${y}) scale(${s})">
    <rect x="0" y="0" width="46" height="46" rx="4" fill="#0f172a"/>
    <g fill="#f3f6fb">
      <rect x="5" y="5" width="10" height="10"/><rect x="31" y="5" width="10" height="10"/>
      <rect x="5" y="31" width="10" height="10"/><rect x="19" y="19" width="10" height="10"/>
      <rect x="33" y="19" width="4" height="4"/><rect x="19" y="33" width="4" height="4"/>
      <rect x="27" y="33" width="4" height="10"/><rect x="35" y="35" width="6" height="6"/>
    </g>
  </g>`
}

function phone(uid, opts = {}) {
  const { x = 360, y = 58, rotate = 4 } = opts
  return `
  <g transform="rotate(${rotate} ${x + 56} ${y + 110})" filter="url(#soft-__UID__)">
    <rect x="${x}" y="${y}" width="112" height="220" rx="18" fill="#0f172a"/>
    <rect x="${x + 8}" y="${y + 14}" width="96" height="178" rx="10" fill="#e2e8f0"/>
    <rect x="${x + 38}" y="${y + 198}" width="36" height="6" rx="3" fill="#334155"/>
    <rect x="${x + 16}" y="${y + 28}" width="72" height="8" rx="4" fill="#0369a1"/>
    <rect x="${x + 16}" y="${y + 44}" width="56" height="6" rx="3" fill="#94a3b8"/>
    <circle cx="${x + 58}" cy="${y + 92}" r="28" fill="#38bdf8" opacity="0.25"/>
    <path d="M${x + 34} ${y + 92} Q${x + 58} ${y + 72} ${x + 82} ${y + 92} L${x + 82} ${y + 108} Q${x + 58} ${y + 128} ${x + 34} ${y + 108} Z" fill="#0369a1"/>
    <circle cx="${x + 58}" cy="${y + 100}" r="8" fill="#ef4444"/>
  </g>`
}

function badgeCircle(x, y, r, icon) {
  return `
  <g transform="translate(${x} ${y})" filter="url(#soft-__UID__)">
    <circle cx="0" cy="0" r="${r}" fill="url(#badge-__UID__)"/>
    <circle cx="0" cy="0" r="${r}" fill="none" stroke="#ffffff" stroke-opacity="0.25" stroke-width="2"/>
    ${icon}
  </g>`
}

const COVERS = [
  {
    slug: 'laudo-sem-danos-aparentes',
    aria: 'Laudo sem danos aparentes com veículo zerado e selo de verificação',
    palette: { card0: '#ecfdf5', card1: '#d1fae5', header0: '#065f46', header1: '#059669', badge0: '#22c55e', badge1: '#15803d', glow: '#34d399' },
    body: () => docCard('uid', { title: 'SEM AVARIAS APARENTES', footer: 'PDF verificável · QR ✓', lines: 2, rotate: -4 })
      + badgeCircle(500, 96, 44, `<path d="M-10 0 L-3 8 L12 -9" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`),
  },
  {
    slug: 'laudo-cautelar-vs-laudo-de-avarias',
    aria: 'Comparativo entre laudo cautelar e laudo de avarias',
    palette: { card0: '#f5f3ff', card1: '#ede9fe', header0: '#3b1d6e', header1: '#5b21b6', badge0: '#a855f7', badge1: '#5b21b6', glow: '#c084fc' },
    body: () => docCard('uid', { x: 250, y: 56, w: 170, h: 240, title: 'CAUTELAR', footer: 'estrutural', rotate: -8 })
      + docCard('uid', { x: 408, y: 56, w: 170, h: 240, title: 'AVARIAS', footer: 'operacional', rotate: 6 })
      + `<text x="414" y="320" font-family="sans-serif" font-weight="800" font-size="28" fill="#fff" text-anchor="middle" opacity="0.9">×</text>`,
  },
  {
    slug: 'laudo-de-avarias-para-sinistro',
    aria: 'Laudo de avarias para sinistro com escudo de seguradora',
    palette: { card0: '#ecfeff', card1: '#cffafe', header0: '#0f3d3e', header1: '#0d9488', badge0: '#14b8a6', badge1: '#0f766e', glow: '#5eead4' },
    body: () => docCard('uid', { title: 'SINISTRO · AVARIAS', footer: 'documentação para seguradora' })
      + badgeCircle(510, 98, 46, `<path d="M0 -22 L20 -13 V4 C20 18 10 27 0 30 C-10 27 -20 18 -20 4 V-13 Z" fill="none" stroke="#fff" stroke-width="3.4" stroke-linejoin="round"/><path d="M-9 1 L-2 9 L11 -8" fill="none" stroke="#fff" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/>`),
  },
  {
    slug: 'vistoria-na-chuva-sem-retrabalho',
    aria: 'Vistoria na chuva com celular e laudo digital sem papel molhado',
    palette: { card0: '#f1f5f9', card1: '#e2e8f0', header0: '#0f172a', header1: '#334155', badge0: '#64748b', badge1: '#334155', glow: '#94a3b8', accent: '#38bdf8' },
    body: () => phone('uid', { rotate: 2 })
      + Array.from({ length: 8 }, (_, i) => `<ellipse cx="${180 + i * 34}" cy="${60 + (i % 3) * 18}" rx="3" ry="8" fill="#fff" opacity="0.55"/>`).join('')
      + `<text x="190" y="280" font-family="sans-serif" font-weight="700" font-size="13" fill="#fff">Sem papel molhado</text>`,
  },
  {
    slug: 'antes-e-depois-da-vistoria-digital',
    aria: 'Antes e depois da vistoria digital: papel versus celular',
    palette: { card0: '#ecfdf5', card1: '#d1fae5', header0: '#0f172a', header1: '#0f766e', badge0: '#22c55e', badge1: '#059669', glow: '#34d399' },
    body: () => `
      <g transform="rotate(-6 280 180)" filter="url(#soft-__UID__)" opacity="0.85">
        <rect x="210" y="70" width="140" height="190" rx="8" fill="#fef3c7" stroke="#d97706" stroke-width="2"/>
        <text x="280" y="110" font-family="sans-serif" font-weight="800" font-size="11" fill="#92400e" text-anchor="middle">PRANCHETA</text>
        <line x1="230" y1="130" x2="330" y2="130" stroke="#d97706" opacity="0.5"/>
        <line x1="230" y1="150" x2="310" y2="150" stroke="#d97706" opacity="0.5"/>
        <text x="280" y="240" font-family="sans-serif" font-size="10" fill="#92400e" text-anchor="middle">20 min</text>
      </g>
      <text x="414" y="186" font-family="sans-serif" font-weight="800" font-size="24" fill="#fff">→</text>
      ${phone('uid', { x: 470, y: 58, rotate: 4 })}
      <text x="526" y="290" font-family="sans-serif" font-size="10" fill="#fff" text-anchor="middle">3 toques · PDF</text>`,
  },
  {
    slug: 'como-eliminar-redigitacao-na-vistoria-veicular',
    aria: 'Eliminar redigitação na vistoria: fluxo único do pátio ao PDF',
    palette: { card0: '#eff6ff', card1: '#dbeafe', header0: '#1e293b', header1: '#2563eb', badge0: '#60a5fa', badge1: '#2563eb', glow: '#93c5fd' },
    body: () => `
      <g transform="rotate(-5 270 170)" filter="url(#soft-__UID__)">
        <rect x="200" y="90" width="140" height="170" rx="8" fill="#fee2e2" stroke="#dc2626" stroke-width="2"/>
        <text x="270" y="130" font-family="sans-serif" font-weight="800" font-size="11" fill="#991b1b" text-anchor="middle">PAPEL</text>
        <text x="270" y="210" font-family="sans-serif" font-size="22" fill="#dc2626" text-anchor="middle">✕</text>
      </g>
      <text x="380" y="180" font-family="sans-serif" font-weight="800" font-size="22" fill="#fff">→</text>
      ${phone('uid', { x: 420, y: 58 })}
      <text x="476" y="292" font-family="sans-serif" font-size="10" fill="#fff" text-anchor="middle">sem redigitar</text>`,
  },
  {
    slug: 'erros-de-transcricao-na-vistoria',
    aria: 'Erros de transcrição na vistoria com alerta no laudo',
    palette: { card0: '#fef2f2', card1: '#fee2e2', header0: '#7f1d1d', header1: '#dc2626', badge0: '#f87171', badge1: '#dc2626', glow: '#fca5a5' },
    body: () => docCard('uid', { title: 'PLACA ERRADA?', footer: 'foto trocada · observação incompleta', lines: 4 })
      + badgeCircle(505, 92, 44, `<text x="0" y="8" font-family="sans-serif" font-weight="900" font-size="28" fill="#fff" text-anchor="middle">!</text>`),
  },
  {
    slug: 'laudo-de-vistoria-com-assinatura-digital',
    aria: 'Laudo de vistoria com assinatura digital na tela',
    palette: { card0: '#f0f9ff', card1: '#e0f2fe', header0: '#0f172a', header1: '#0c4a6e', badge0: '#38bdf8', badge1: '#0369a1', glow: '#7dd3fc' },
    body: () => phone('uid', { rotate: 3 })
      + `<path d="M430 210 Q450 190 470 205 T510 198 T540 220" fill="none" stroke="#0369a1" stroke-width="3" stroke-linecap="round"/>
         <text x="476" y="248" font-family="cursive" font-size="14" fill="#0c4a6e">Assinatura</text>`,
  },
  {
    slug: 'qr-code-e-hash-no-laudo-de-avarias',
    aria: 'QR Code e hash SHA-256 no laudo de avarias',
    palette: { card0: '#f3f6fb', card1: '#dde5f0', header0: '#111827', header1: '#1d4ed8', badge0: '#60a5fa', badge1: '#1d4ed8', glow: '#93c5fd' },
    body: () => docCard('uid', { title: 'LAUDO VERIFICÁVEL', footer: 'SHA-256 · 0DF2…CE90' })
      + qrBlock(322, 254)
      + badgeCircle(500, 92, 46, `<path d="M0 -22 L20 -13 V4 C20 18 10 27 0 30 C-10 27 -20 18 -20 4 V-13 Z" fill="none" stroke="#fff" stroke-width="3.4" stroke-linejoin="round"/><path d="M-9 1 L-2 9 L11 -8" fill="none" stroke="#fff" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/>`),
  },
  {
    slug: 'scanner-de-cnh-autofill-nome-cpf',
    aria: 'Scanner de CNH preenchendo nome e CPF automaticamente',
    palette: { card0: '#ecfeff', card1: '#cffafe', header0: '#0f172a', header1: '#0891b2', badge0: '#22d3ee', badge1: '#0891b2', glow: '#67e8f9' },
    body: () => `
      <g transform="rotate(-4 400 176)" filter="url(#soft-__UID__)">
        <rect x="290" y="78" width="248" height="156" rx="12" fill="url(#card-__UID__)" stroke="#0891b2" stroke-width="2"/>
        <rect x="308" y="96" width="72" height="88" rx="6" fill="#cbd5e1"/>
        <circle cx="344" cy="132" r="18" fill="#94a3b8"/>
        <rect x="392" y="104" width="120" height="8" rx="4" fill="#0891b2"/>
        <rect x="392" y="122" width="96" height="6" rx="3" fill="#64748b"/>
        <rect x="392" y="140" width="110" height="6" rx="3" fill="#64748b"/>
        <rect x="308" y="196" width="180" height="20" rx="4" fill="#0f172a" opacity="0.08"/>
        <text x="398" y="210" font-family="monospace" font-size="10" fill="#0e7490" text-anchor="middle">CPF · NOME · AUTO</text>
        <line x1="290" y1="120" x2="538" y2="120" stroke="#22d3ee" stroke-width="2" opacity="0.8"/>
      </g>`,
  },
  {
    slug: 'plano-corporativo-gestao-de-equipe-vistoriadores',
    aria: 'Plano corporativo gerenciando equipe de vistoriadores',
    palette: { card0: '#eef2ff', card1: '#e0e7ff', header0: '#1e1b4b', header1: '#4f46e5', badge0: '#818cf8', badge1: '#4f46e5', glow: '#a5b4fc' },
    body: () => `
      <g transform="rotate(-3 400 176)" filter="url(#soft-__UID__)">
        <rect x="268" y="52" width="292" height="248" rx="12" fill="url(#card-__UID__)"/>
        <rect x="268" y="52" width="292" height="42" rx="12" fill="url(#header-__UID__)"/>
        <rect x="268" y="82" width="292" height="12" fill="url(#header-__UID__)"/>
        <text x="288" y="78" font-family="sans-serif" font-weight="800" font-size="12" fill="#fff">EQUIPE · LAUDOS</text>
        ${[0, 1, 2].map(i => `<circle cx="302" cy="${128 + i * 44}" r="12" fill="#4f46e5"/><rect x="324" y="${118 + i * 44}" width="120" height="8" rx="4" fill="#94a3b8"/><rect x="324" y="${132 + i * 44}" width="80" height="6" rx="3" fill="#cbd5e1"/>`).join('')}
        <rect x="288" y="248" width="252" height="34" rx="8" fill="#4f46e5"/>
        <text x="414" y="270" font-family="sans-serif" font-weight="700" font-size="11" fill="#fff" text-anchor="middle">Corporativo · visão única</text>
      </g>`,
  },
  {
    slug: 'vistoria-de-seminovos-para-concessionarias',
    aria: 'Inspeção de seminovos para concessionárias com laudo na entrada',
    palette: { card0: '#f0fdf4', card1: '#dcfce7', header0: '#052e16', header1: '#16a34a', badge0: '#4ade80', badge1: '#16a34a', glow: '#86efac' },
    body: () => docCard('uid', { title: 'SEMINOVO · ENTRADA', footer: 'estado real na revenda' })
      + `<rect x="470" y="72" width="96" height="28" rx="14" fill="#16a34a"/><text x="518" y="91" font-family="sans-serif" font-weight="800" font-size="11" fill="#fff" text-anchor="middle">SEMINOVO</text>`,
  },
  {
    slug: 'como-treinar-um-novo-vistoriador-rapidamente',
    aria: 'Treinar novo vistoriador com checklist e roteiro prático',
    palette: { card0: '#fff7ed', card1: '#ffedd5', header0: '#422006', header1: '#ea580c', badge0: '#fb923c', badge1: '#ea580c', glow: '#fdba74' },
    body: () => docCard('uid', { title: 'ROTEIRO · NOVO VISTORIADOR', footer: 'padrão da equipe', lines: 4, rotate: -3 })
      + badgeCircle(505, 96, 44, `<path d="M-12 -8 L12 -8 L8 10 L0 16 L-8 10 Z" fill="none" stroke="#fff" stroke-width="3" stroke-linejoin="round"/><rect x="-14" y="-18" width="28" height="8" rx="2" fill="#fff"/>`),
  },
  {
    slug: 'vistoria-por-voz-nome-da-peca-ao-clicar',
    aria: 'Vistoria por voz anunciando o nome da peça ao clicar no diagrama',
    palette: { card0: '#f5f3ff', card1: '#ede9fe', header0: '#1e1b4b', header1: '#7c3aed', badge0: '#c4b5fd', badge1: '#7c3aed', glow: '#ddd6fe' },
    body: () => phone('uid')
      + `<path d="M520 120 Q540 100 560 120 T600 120" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
         <text x="560" y="150" font-family="sans-serif" font-weight="700" font-size="11" fill="#fff" text-anchor="middle">Para-choque dianteiro</text>`,
  },
  {
    slug: 'consulta-automatica-de-placa',
    aria: 'Consulta automática de placa preenchendo dados do veículo',
    palette: { card0: '#ecfdf5', card1: '#d1fae5', header0: '#052e2b', header1: '#0d9488', badge0: '#2dd4bf', badge1: '#0d9488', glow: '#5eead4' },
    body: () => `
      <g transform="rotate(-2 400 176)" filter="url(#soft-__UID__)">
        <rect x="286" y="118" width="256" height="56" rx="8" fill="#fff" stroke="#0d9488" stroke-width="3"/>
        <text x="414" y="154" font-family="monospace" font-weight="900" font-size="28" fill="#0f172a" text-anchor="middle">ABC1D23</text>
        <circle cx="560" cy="146" r="22" fill="url(#badge-__UID__)"/>
        <circle cx="560" cy="146" r="10" fill="none" stroke="#fff" stroke-width="3"/>
        <line x1="572" y1="158" x2="586" y2="172" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
        <rect x="300" y="188" width="88" height="8" rx="4" fill="#0d9488" opacity="0.7"/>
        <rect x="300" y="206" width="120" height="8" rx="4" fill="#64748b" opacity="0.6"/>
        <rect x="300" y="224" width="96" height="8" rx="4" fill="#64748b" opacity="0.6"/>
      </g>`,
  },
  {
    slug: '6-modelos-de-pdf-para-o-laudo-de-vistoria',
    aria: 'Seis modelos de PDF para o laudo de vistoria',
    palette: { card0: '#faf5ff', card1: '#f3e8ff', header0: '#312e81', header1: '#6366f1', badge0: '#a5b4fc', badge1: '#6366f1', glow: '#c7d2fe' },
    body: () => ['#6366f1', '#0ea5e9', '#64748b', '#0369a1', '#111827', '#a855f7'].map((c, i) => `
      <g transform="translate(${300 + i * 18} ${70 + i * 6}) rotate(${-8 + i * 3} 360 170)" filter="url(#soft-__UID__)" opacity="${0.75 + i * 0.04}">
        <rect x="250" y="60" width="140" height="190" rx="8" fill="${c}" opacity="0.92"/>
        <rect x="262" y="78" width="90" height="8" rx="4" fill="#fff" opacity="0.85"/>
        <rect x="262" y="96" width="70" height="6" rx="3" fill="#fff" opacity="0.55"/>
      </g>`).join(''),
  },
  {
    slug: 'checklist-de-avarias-sem-dor-de-cabeca',
    aria: 'Checklist de avarias do toque na tela ao laudo pronto',
    palette: { card0: '#f0f9ff', card1: '#e0f2fe', header0: '#0c4a6e', header1: '#0284c7', badge0: '#38bdf8', badge1: '#0284c7', glow: '#7dd3fc' },
    body: () => docCard('uid', { title: 'CHECKLIST · AVARIAS', footer: 'toque · foto · PDF', lines: 3 })
      + badgeCircle(500, 96, 44, `<path d="M-10 0 L-3 8 L12 -9" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`),
  },
  {
    slug: 'vistoria-nas-4-vistas-do-veiculo',
    aria: 'Vistoria nas quatro vistas do veículo com fotos por avaria',
    palette: { card0: '#eff6ff', card1: '#dbeafe', header0: '#0c4a6e', header1: '#0369a1', badge0: '#1FB6FF', badge1: '#0369a1', glow: '#38bdf8' },
    body: () => ['Frente', 'Esquerda', 'Direita', 'Traseira'].map((label, i) => {
      const x = 250 + (i % 2) * 170
      const y = 70 + Math.floor(i / 2) * 110
      return `
      <g transform="translate(${x} ${y})" filter="url(#soft-__UID__)">
        <rect x="0" y="0" width="130" height="88" rx="10" fill="url(#card-__UID__)"/>
        <path d="M20 58 Q30 38 58 34 L92 34 Q112 34 118 48 L118 58 L14 58 Q8 58 8 52 Z" fill="#0369a1" opacity="0.85"/>
        <circle cx="30" cy="58" r="8" fill="#0f172a"/><circle cx="98" cy="58" r="8" fill="#0f172a"/>
        <text x="65" y="22" font-family="sans-serif" font-weight="700" font-size="10" fill="#0c4a6e" text-anchor="middle">${label}</text>
      </g>`
    }).join(''),
  },
  {
    slug: 'laudo-de-avaria-com-qr-code',
    aria: 'Laudo de avaria com QR Code de verificação',
    palette: { card0: '#f8fafc', card1: '#e2e8f0', header0: '#1e293b', header1: '#334155', badge0: '#64748b', badge1: '#334155', glow: '#94a3b8' },
    body: () => docCard('uid', { title: 'LAUDO · QR CODE', footer: 'verificação online' }) + qrBlock(430, 210, 52),
  },
  {
    slug: 'vistoria-de-frota-padronizar-equipe',
    aria: 'Padronizar equipe de vistoria de frota com mesmo laudo',
    palette: { card0: '#fff7ed', card1: '#ffedd5', header0: '#7c2d12', header1: '#c2410c', badge0: '#fb923c', badge1: '#c2410c', glow: '#fdba74' },
    body: () => `
      <g transform="rotate(-3 400 176)" filter="url(#soft-__UID__)">
        <rect x="268" y="60" width="292" height="232" rx="12" fill="url(#card-__UID__)"/>
        <text x="288" y="92" font-family="sans-serif" font-weight="800" font-size="13" fill="#7c2d12">PADRÃO ÚNICO · FROTA</text>
        ${[0, 1, 2].map(i => `<rect x="288" y="${110 + i * 38}" width="252" height="28" rx="6" fill="#fff" stroke="#fb923c" stroke-width="1.5"/><circle cx="306" cy="${124 + i * 38}" r="8" fill="#22c55e"/><rect x="322" y="${118 + i * 38}" width="140" height="6" rx="3" fill="#94a3b8"/>`).join('')}
      </g>`,
  },
  {
    slug: 'como-padronizar-equipe-de-vistoria-e-acabar-com-o-retrabalho',
    aria: 'Padronizar equipe de vistoria e acabar com retrabalho',
    palette: { card0: '#fff7ed', card1: '#fed7aa', header0: '#7c2d12', header1: '#c2410c', badge0: '#fb923c', badge1: '#c2410c', glow: '#fdba74' },
    body: () => docCard('uid', { title: 'MESMO PADRÃO · EQUIPE', footer: 'laudos comparáveis', lines: 4 })
      + badgeCircle(505, 96, 44, `<path d="M-12 4 H12 M0 -8 V16" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/>`),
  },
  {
    slug: 'como-fazer-mais-vistorias-por-dia',
    aria: 'Fazer mais vistorias por dia com fluxo ágil',
    palette: { card0: '#f0fdf4', card1: '#dcfce7', header0: '#14532d', header1: '#15803d', badge0: '#4ade80', badge1: '#15803d', glow: '#86efac' },
    body: () => `
      <g filter="url(#soft-__UID__)">
        <circle cx="320" cy="170" r="58" fill="url(#card-__UID__)" stroke="#15803d" stroke-width="3"/>
        <circle cx="320" cy="170" r="4" fill="#15803d"/>
        <line x1="320" y1="170" x2="320" y2="130" stroke="#15803d" stroke-width="3" stroke-linecap="round"/>
        <line x1="320" y1="170" x2="350" y2="185" stroke="#15803d" stroke-width="3" stroke-linecap="round"/>
        <text x="320" y="250" font-family="sans-serif" font-weight="800" font-size="12" fill="#fff" text-anchor="middle">+ escala</text>
      </g>
      ${phone('uid', { x: 430, y: 70, rotate: 5 })}`,
  },
  {
    slug: 'como-reduzir-prejuizo-com-avarias-na-frota',
    aria: 'Reduzir prejuízo com avarias na frota com controle e prova',
    palette: { card0: '#f0fdf4', card1: '#dcfce7', header0: '#14532d', header1: '#16a34a', badge0: '#4ade80', badge1: '#16a34a', glow: '#86efac' },
    body: () => `
      <g transform="rotate(-4 360 180)" filter="url(#soft-__UID__)">
        <rect x="250" y="90" width="220" height="160" rx="12" fill="url(#card-__UID__)"/>
        <polyline points="280,210 320,170 350,185 390,130 430,150" fill="none" stroke="#16a34a" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
        <text x="360" y="120" font-family="sans-serif" font-weight="800" font-size="12" fill="#14532d" text-anchor="middle">Prejuízo ↓</text>
      </g>`,
  },
  {
    slug: 'laudo-com-logo-da-empresa-no-pdf',
    aria: 'Laudo com logo e nome da empresa no PDF white-label',
    palette: { card0: '#f8fafc', card1: '#e2e8f0', header0: '#0f172a', header1: '#334155', badge0: '#64748b', badge1: '#334155', glow: '#94a3b8' },
    body: () => docCard('uid', { title: 'SUA EMPRESA LTDA', footer: 'white-label · logo no cabeçalho' })
      + `<rect x="318" y="68" width="48" height="48" rx="8" fill="#0369a1"/><text x="342" y="98" font-family="sans-serif" font-weight="900" font-size="16" fill="#fff" text-anchor="middle">LOGO</text>`,
  },
  {
    slug: 'como-entregar-um-pdf-de-vistoria-mais-profissional',
    aria: 'PDF de vistoria profissional com marca da empresa',
    palette: { card0: '#f0f9ff', card1: '#e0f2fe', header0: '#0f172a', header1: '#0369a1', badge0: '#38bdf8', badge1: '#0369a1', glow: '#7dd3fc' },
    body: () => docCard('uid', { title: 'LAUDO PROFISSIONAL', footer: 'marca · clareza · confiança' })
      + badgeCircle(505, 96, 44, `<path d="M-10 0 L-3 8 L12 -9" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`),
  },
  {
    slug: 'vistoria-de-frota-sem-internet',
    aria: 'Vistoria de frota offline com sincronização automática',
    palette: { card0: '#f0fdf4', card1: '#dcfce7', header0: '#14532d', header1: '#166534', badge0: '#4ade80', badge1: '#166534', glow: '#86efac' },
    body: () => phone('uid', { rotate: 2 })
      + `<g opacity="0.9"><rect x="500" y="110" width="72" height="48" rx="10" fill="#166534"/><path d="M536 98 Q536 86 548 86 Q560 86 560 98" fill="none" stroke="#fff" stroke-width="3"/><line x1="520" y1="132" x2="552" y2="132" stroke="#fff" stroke-width="3" stroke-linecap="round"/><text x="536" y="150" font-family="sans-serif" font-size="9" fill="#fff" text-anchor="middle">offline</text></g>`,
  },
  {
    slug: 'vistoria-foto-gps-hash-sha256-eliminar-contestacoes',
    aria: 'Vistoria com foto GPS e hash SHA-256 eliminando contestações',
    palette: { card0: '#eff6ff', card1: '#dbeafe', header0: '#0c4a6e', header1: '#0369a1', badge0: '#1FB6FF', badge1: '#0369a1', glow: '#38bdf8' },
    body: () => phone('uid')
      + `<circle cx="520" cy="120" r="20" fill="#0369a1"/><path d="M520 108 C520 108 512 116 512 122 C512 128 520 134 520 134 C520 134 528 128 528 122 C528 116 520 108 520 108 Z" fill="#fff"/>
         <text x="520" y="168" font-family="monospace" font-size="9" fill="#fff" text-anchor="middle">GPS · SHA-256</text>`,
  },
  {
    slug: 'como-fazer-laudo-de-vistoria-veicular',
    aria: 'Passo a passo de como fazer laudo de vistoria veicular',
    palette: { card0: '#eef6fc', card1: '#d7e8f5', header0: '#0c4a6e', header1: '#0369a1', badge0: '#1FB6FF', badge1: '#0369a1', glow: '#38bdf8' },
    body: () => docCard('uid', { title: 'PASSO A PASSO', footer: 'LAUDO-2026.pdf · hash ✓', lines: 4 })
      + badgeCircle(492, 84, 44, `<rect x="-15" y="-19" width="30" height="38" rx="4" fill="none" stroke="#fff" stroke-width="3"/><path d="M-8 10 L-2 16 L9 4" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`),
  },
  {
    slug: 'vistoria-de-moto',
    aria: 'Vistoria de moto com checklist de tanque, carenagem e peças',
    palette: { card0: '#fef2f2', card1: '#fee2e2', header0: '#7f1d1d', header1: '#b91c1c', badge0: '#f87171', badge1: '#b91c1c', glow: '#fca5a5' },
    body: () => docCard('uid', { title: 'VISTORIA · MOTO', footer: 'tanque · carenagem · rodas' })
      + `<g transform="translate(520 150)" opacity="0.95"><ellipse cx="0" cy="40" rx="46" ry="8" fill="#000" opacity="0.25"/><circle cx="-28" cy="40" r="14" fill="#0f172a"/><circle cx="28" cy="40" r="14" fill="#0f172a"/><path d="M-40 20 Q-10 0 20 8 L40 8 Q50 8 50 18 L50 28 L-40 28 Z" fill="#b91c1c"/></g>`,
  },
  {
    slug: 'vistoria-de-caminhao',
    aria: 'Vistoria de caminhão com checklist de cabine, baú e eixos',
    palette: { card0: '#ecfeff', card1: '#cffafe', header0: '#0c4a6e', header1: '#0e7490', badge0: '#22d3ee', badge1: '#0e7490', glow: '#67e8f9' },
    body: () => docCard('uid', { title: 'CAMINHÃO · CHECKLIST', footer: 'cabine · baú · eixos' })
      + `<g transform="translate(500 158)" opacity="0.95"><rect x="-60" y="-10" width="120" height="34" rx="6" fill="#0e7490"/><rect x="20" y="-6" width="36" height="26" rx="4" fill="#22d3ee" opacity="0.8"/><circle cx="-36" cy="28" r="12" fill="#0f172a"/><circle cx="36" cy="28" r="12" fill="#0f172a"/></g>`,
  },
  {
    slug: 'vistoria-de-onibus',
    aria: 'Vistoria de ônibus com roteiro de carroceria e interior',
    palette: { card0: '#ecfdf5', card1: '#d1fae5', header0: '#155e2f', header1: '#047857', badge0: '#34d399', badge1: '#047857', glow: '#6ee7b7' },
    body: () => docCard('uid', { title: 'ÔNIBUS · ROTEIRO', footer: 'carroceria · janelas · interior' })
      + `<g transform="translate(500 158)" opacity="0.95"><rect x="-70" y="-8" width="140" height="32" rx="8" fill="#047857"/><rect x="-50" y="-4" width="18" height="14" rx="2" fill="#a7f3d0"/><rect x="-24" y="-4" width="18" height="14" rx="2" fill="#a7f3d0"/><rect x="2" y="-4" width="18" height="14" rx="2" fill="#a7f3d0"/><circle cx="-44" cy="28" r="10" fill="#0f172a"/><circle cx="44" cy="28" r="10" fill="#0f172a"/></g>`,
  },
  {
    slug: 'controle-de-avarias-para-locadora',
    aria: 'Controle de avarias para locadora: laudo de retirada versus devolução',
    palette: { card0: '#e0f2fe', card1: '#bae6fd', header0: '#0c4a6e', header1: '#0369a1', badge0: '#1FB6FF', badge1: '#0369a1', glow: '#38bdf8', accent: '#38bdf8' },
    body: () => `
      ${docCard('uid', { x: 210, y: 52, w: 168, h: 240, title: 'RETIRADA', footer: 'check-out · hash ✓', lines: 2, rotate: -8 })}
      ${docCard('uid', { x: 410, y: 62, w: 168, h: 240, title: 'DEVOLUÇÃO', footer: 'check-in · QR ✓', lines: 2, rotate: 6 })}
      <g filter="url(#soft-__UID__)">
        <circle cx="414" cy="176" r="28" fill="url(#badge-__UID__)"/>
        <path d="M404 176 L411 183 L426 166" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      </g>
      <g opacity="0.95">
        <rect x="318" y="28" width="192" height="26" rx="13" fill="#0c4a6e"/>
        <text x="414" y="46" font-family="sans-serif" font-weight="800" font-size="11" fill="#fff" text-anchor="middle">CONTROLE DE AVARIAS · LOCADORA</text>
      </g>
      <g transform="translate(620 210)" opacity="0.9">
        <ellipse cx="0" cy="36" rx="54" ry="8" fill="#000" opacity="0.2"/>
        <rect x="-48" y="0" width="96" height="32" rx="6" fill="#0369a1"/>
        <rect x="18" y="4" width="28" height="20" rx="3" fill="#7dd3fc" opacity="0.85"/>
        <circle cx="-28" cy="36" r="10" fill="#0f172a"/>
        <circle cx="28" cy="36" r="10" fill="#0f172a"/>
        <text x="0" y="-8" font-family="sans-serif" font-size="9" fill="#0c4a6e" font-weight="700" text-anchor="middle">placa · prova</text>
      </g>`,
  },
  {
    slug: 'sistema-check-in-check-out-frota',
    aria: 'Sistema de check-in e check-out de frota com histórico por placa',
    palette: { card0: '#ecfeff', card1: '#cffafe', header0: '#164e63', header1: '#0e7490', badge0: '#22d3ee', badge1: '#0e7490', glow: '#67e8f9', accent: '#22d3ee' },
    body: () => `
      ${phone('uid', { x: 300, y: 48, rotate: -3 })}
      <g filter="url(#soft-__UID__)">
        <rect x="460" y="88" width="210" height="72" rx="14" fill="#0e7490"/>
        <text x="565" y="118" font-family="sans-serif" font-weight="800" font-size="14" fill="#fff" text-anchor="middle">CHECK-OUT →</text>
        <text x="565" y="140" font-family="sans-serif" font-size="11" fill="#a5f3fc" text-anchor="middle">saída do pátio · laudo</text>
        <rect x="460" y="176" width="210" height="72" rx="14" fill="#155e75"/>
        <text x="565" y="206" font-family="sans-serif" font-weight="800" font-size="14" fill="#fff" text-anchor="middle">← CHECK-IN</text>
        <text x="565" y="228" font-family="sans-serif" font-size="11" fill="#a5f3fc" text-anchor="middle">retorno · histórico placa</text>
      </g>
      <g transform="translate(180 220)" opacity="0.92">
        <ellipse cx="40" cy="48" rx="70" ry="10" fill="#000" opacity="0.18"/>
        <rect x="0" y="8" width="80" height="28" rx="5" fill="#0e7490"/>
        <rect x="52" y="12" width="24" height="16" rx="2" fill="#67e8f9" opacity="0.8"/>
        <circle cx="18" cy="42" r="9" fill="#0f172a"/>
        <circle cx="62" cy="42" r="9" fill="#0f172a"/>
        <rect x="90" y="12" width="70" height="24" rx="5" fill="#155e75"/>
        <circle cx="108" cy="42" r="8" fill="#0f172a"/>
        <circle cx="148" cy="42" r="8" fill="#0f172a"/>
      </g>
      <text x="414" y="36" font-family="sans-serif" font-weight="800" font-size="12" fill="#164e63" text-anchor="middle">SISTEMA CHECK-IN / CHECK-OUT · FROTA</text>`,
  },
]

/** Mapeamento slug -> capa contextual (substitui PNG genérico de veículo) */
export const COVER_MAP = Object.fromEntries(COVERS.map(c => [c.slug, `/blog-covers/${c.slug}.webp`]))

const only = (process.env.ONLY_SLUGS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)
const toGenerate = only.length ? COVERS.filter((c) => only.includes(c.slug)) : COVERS

for (const cover of toGenerate) {
  const svg = svgWrap(cover.aria, cover.body(), cover.palette)
  const svgPath = join(OUT, `${cover.slug}.svg`)
  const webpPath = join(OUT, `${cover.slug}.webp`)
  writeFileSync(svgPath, svg, 'utf8')
  await sharp(Buffer.from(svg)).resize({ width: 828, height: 352 }).webp({ quality: 82 }).toFile(webpPath)
  console.log('✓', cover.slug)
}

console.log(`\n${toGenerate.length} capas geradas em public/blog-covers/`)
