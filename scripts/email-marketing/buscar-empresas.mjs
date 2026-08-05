#!/usr/bin/env node
/*
 * ============================================================
 *  Danos Aparentes — Buscador de empresas (funilaria / martelinho)
 * ============================================================
 *
 * Coleta NOME, LOCALIZAÇÃO, SITE e E-MAIL de oficinas de funilaria,
 * martelinho de ouro, lanternagem e pintura automotiva.
 *
 * FONTE: OpenStreetMap (Overpass API) — base de dados ABERTA e gratuita.
 *        Não viola termos de uso (ao contrário de raspar Google Maps).
 *
 * E-MAIL: o OSM tem e-mail só de uma parte das empresas. Com a flag
 *         --enrich, o script visita a PÁGINA DE CONTATO do próprio site
 *         da empresa (informação pública que ela divulga) e extrai o
 *         e-mail publicado. Rate-limited e best-effort.
 *
 * ── Uso ─────────────────────────────────────────────────────
 *   # Santa Catarina inteira (padrão):
 *   node scripts/email-marketing/buscar-empresas.mjs
 *
 *   # Uma cidade específica:
 *   node scripts/email-marketing/buscar-empresas.mjs --cidade "Joinville"
 *
 *   # Outro estado (sigla UF):
 *   node scripts/email-marketing/buscar-empresas.mjs --uf SP
 *
 *   # Buscar e-mail no site das empresas que não têm e-mail no OSM:
 *   node scripts/email-marketing/buscar-empresas.mjs --enrich
 *
 *   # Só empresas com e-mail no resultado final:
 *   node scripts/email-marketing/buscar-empresas.mjs --enrich --so-com-email
 *
 * Saída: empresas-encontradas.csv  (nesta mesma pasta)
 *
 * ⚠️ Uso responsável (LGPD): destine apenas a contato comercial B2B,
 *    sempre com opção de descadastro. Não dispare spam em massa.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// ── Argumentos ───────────────────────────────────────────────────────────
function arg(flag, fallback) {
  const i = process.argv.indexOf(flag)
  if (i === -1) return fallback
  const v = process.argv[i + 1]
  return v && !v.startsWith('--') ? v : true
}
const UF = String(arg('--uf', 'SC')).toUpperCase()
const CIDADE = arg('--cidade', null)
const ENRICH = process.argv.includes('--enrich')
const SO_COM_EMAIL = process.argv.includes('--so-com-email')
// --so-funilaria mantém só funilaria/martelinho/pintura (descarta oficina genérica)
const SO_FUNILARIA = process.argv.includes('--so-funilaria')
const DELAY_ENRICH = Number(arg('--intervalo', 2)) * 1000

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// Palavras que classificam o tipo de oficina pelo nome.
const CATEGORIAS = [
  { cat: 'martelinho', re: /martelinho|repara[çc][aã]o r[áa]pida|paintless|\bpdr\b|reparo r[áa]pido/i },
  { cat: 'funilaria',  re: /funilaria|lanternagem|lanterneiro|funileiro/i },
  { cat: 'pintura',    re: /pintura|repintura|pintor/i },
]
function classificar(nome = '') {
  for (const c of CATEGORIAS) if (c.re.test(nome)) return c.cat
  return 'oficina/auto'
}

// ── Consulta Overpass ────────────────────────────────────────────────────
function montarQuery() {
  // Área: cidade (se informada) dentro da UF, senão a UF inteira.
  const areaSel = CIDADE
    ? `area["name"~"^${CIDADE}$",i]["admin_level"~"8|9"]->.a;`
    : `area["ISO3166-2"="BR-${UF}"]["admin_level"="4"]->.a;`
  return `
[out:json][timeout:180];
${areaSel}
(
  nwr(area.a)["shop"="car_repair"];
  nwr(area.a)["craft"="car_repair"];
  nwr(area.a)["shop"="car_body_repair"];
  nwr(area.a)["service:vehicle:body_repair"="yes"];
  nwr(area.a)["service:vehicle:painting"="yes"];
);
out center tags;`
}

async function buscarOverpass() {
  const endpoints = [
    'https://overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter',
  ]
  const body = 'data=' + encodeURIComponent(montarQuery())
  for (const url of endpoints) {
    try {
      process.stdout.write(`Consultando OpenStreetMap (${new URL(url).host})... `)
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
          'User-Agent': 'DanosAparentes-LeadFinder/1.0 (contato: suporte@danosaparentes.com.br)',
        },
        body,
        signal: AbortSignal.timeout(190000),
      })
      if (!res.ok) { console.log(`falhou (HTTP ${res.status})`); continue }
      const json = await res.json()
      console.log(`ok — ${json.elements?.length || 0} registros brutos.`)
      return json.elements || []
    } catch (e) {
      console.log(`erro (${e.message})`)
    }
  }
  throw new Error('Não foi possível consultar a Overpass API. Tente novamente mais tarde.')
}

// ── Extração de e-mail de um site (enrichment, best-effort) ───────────────
const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g
const LIXO = /\.(png|jpg|jpeg|gif|svg|webp)$|sentry|wix|example|seu-?email|your-?email|@2x|domain\.com|email\.com$/i

function limparEmails(texto, domSite) {
  const achados = (texto.match(EMAIL_RE) || [])
    .map((e) => e.toLowerCase())
    .filter((e) => !LIXO.test(e))
  // Prioriza e-mail cujo domínio bate com o site da empresa.
  const dom = domSite?.replace(/^www\./, '')
  achados.sort((a, b) => (b.endsWith(dom || '\0') ? 1 : 0) - (a.endsWith(dom || '\0') ? 1 : 0))
  return [...new Set(achados)][0] || ''
}

async function buscarEmailNoSite(site) {
  if (!site) return ''
  let base
  try { base = new URL(site.startsWith('http') ? site : `https://${site}`) } catch { return '' }
  const dom = base.hostname.replace(/^www\./, '')
  const paginas = ['', 'contato', 'contato.html', 'fale-conosco', 'contact']
  for (const p of paginas) {
    try {
      const u = new URL(p, base).toString()
      const ctrl = AbortSignal.timeout(8000)
      const res = await fetch(u, { signal: ctrl, headers: { 'User-Agent': 'Mozilla/5.0 (DanosAparentes lead finder)' } })
      if (!res.ok) continue
      const html = await res.text()
      const email = limparEmails(html, dom)
      if (email) return email
    } catch { /* ignora e tenta próxima página */ }
  }
  return ''
}

// ── CSV ──────────────────────────────────────────────────────────────────
function csvCell(v) {
  const s = String(v ?? '')
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

// ── Main ─────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n=== Buscador de empresas · funilaria / martelinho ===')
  console.log(`Região: ${CIDADE ? CIDADE + ' / ' : ''}${UF}${ENRICH ? ' · com busca de e-mail no site' : ''}\n`)

  const elementos = await buscarOverpass()

  // Normaliza e remove duplicados por nome+cidade.
  const vistos = new Set()
  let empresas = []
  for (const el of elementos) {
    const t = el.tags || {}
    const nome = t.name || t.brand || ''
    if (!nome) continue
    const cidade = t['addr:city'] || t['addr:municipality'] || ''
    const rua = [t['addr:street'], t['addr:housenumber']].filter(Boolean).join(', ')
    const localizacao = [rua, cidade, UF].filter(Boolean).join(' - ')
    const email = (t.email || t['contact:email'] || '').toLowerCase()
    let site = t.website || t['contact:website'] || ''
    if (site && !/^https?:/.test(site)) site = 'https://' + site
    const telefone = t.phone || t['contact:phone'] || ''
    const chave = (nome + '|' + cidade).toLowerCase()
    if (vistos.has(chave)) continue
    vistos.add(chave)
    empresas.push({ nome, email, localizacao, cidade, site, telefone, categoria: classificar(nome) })
  }

  // Quebra por categoria, útil para decidir o filtro.
  const porCat = empresas.reduce((a, e) => { a[e.categoria] = (a[e.categoria] || 0) + 1; return a }, {})
  console.log(`Empresas únicas encontradas: ${empresas.length}`)
  console.log('  Por categoria:', Object.entries(porCat).map(([k, v]) => `${k}=${v}`).join(', '))

  if (SO_FUNILARIA) {
    empresas = empresas.filter(e => e.categoria !== 'oficina/auto')
    console.log(`  Filtro --so-funilaria ativo → ${empresas.length} (funilaria/martelinho/pintura)`)
  }

  console.log(`  • com e-mail já no OpenStreetMap: ${empresas.filter(e => e.email).length}`)
  console.log(`  • com site (para enrichment): ${empresas.filter(e => e.site && !e.email).length}\n`)

  // Enrichment opcional: busca e-mail no site das que não têm.
  if (ENRICH) {
    const alvos = empresas.filter(e => !e.email && e.site)
    console.log(`Buscando e-mail no site de ${alvos.length} empresa(s) (intervalo ${DELAY_ENRICH / 1000}s)...`)
    for (let i = 0; i < alvos.length; i++) {
      const e = alvos[i]
      const email = await buscarEmailNoSite(e.site)
      if (email) { e.email = email; process.stdout.write(`  ✓ [${i + 1}/${alvos.length}] ${e.nome}: ${email}\n`) }
      else process.stdout.write(`  · [${i + 1}/${alvos.length}] ${e.nome}: (sem e-mail público)\n`)
      if (i < alvos.length - 1) await sleep(DELAY_ENRICH)
    }
    console.log('')
  }

  if (SO_COM_EMAIL) empresas = empresas.filter(e => e.email)

  // Ordena: com e-mail primeiro, depois por cidade.
  empresas.sort((a, b) => (b.email ? 1 : 0) - (a.email ? 1 : 0) || a.cidade.localeCompare(b.cidade))

  const header = 'nome,email,localizacao,categoria,site,telefone'
  const linhas = empresas.map(e =>
    [e.nome, e.email, e.localizacao, e.categoria, e.site, e.telefone].map(csvCell).join(','))
  const out = path.resolve(__dirname, 'empresas-encontradas.csv')
  fs.writeFileSync(out, '﻿' + header + '\n' + linhas.join('\n')) // BOM p/ Excel

  console.log(`=== Pronto: ${empresas.length} empresa(s) salvas ===`)
  console.log(`Com e-mail: ${empresas.filter(e => e.email).length}`)
  console.log(`Arquivo: ${out}`)
  console.log('\nDica: rode com --enrich para buscar mais e-mails nos sites.')
}

main().catch((e) => { console.error('\nErro:', e.message); process.exit(1) })
