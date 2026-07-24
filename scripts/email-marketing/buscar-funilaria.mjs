#!/usr/bin/env node
/*
 * ============================================================
 *  Danos Aparentes — Buscador FOCADO: funilaria / pintura / martelinho
 * ============================================================
 *
 * Ao contrário do buscar-empresas.mjs (que traz TODAS as oficinas),
 * este script busca SOMENTE empresas de:
 *   - Funilaria / lanternagem
 *   - Pintura automotiva / repintura
 *   - Martelinho de ouro (reparo de pequenos amassados)
 *   - Estética automotiva (relacionada a lataria/pintura)
 *
 * Filtra por tags específicas do OpenStreetMap (reparo de lataria/pintura)
 * E por palavras no nome — descarta mecânica e auto elétrica genéricas.
 *
 * Coleta: NOME, E-MAIL, LOCALIZAÇÃO, SITE, TELEFONE.
 * Fonte: OpenStreetMap (Overpass API) — dados abertos, sem violar termos.
 *
 * ── Uso ─────────────────────────────────────────────────────
 *   node scripts/email-marketing/buscar-funilaria.mjs
 *   node scripts/email-marketing/buscar-funilaria.mjs --uf SC
 *   node scripts/email-marketing/buscar-funilaria.mjs --cidade "Joinville"
 *   node scripts/email-marketing/buscar-funilaria.mjs --enrich
 *
 * Saída: funilarias-encontradas.csv  (nesta mesma pasta)
 *
 * ⚠️ LGPD: use apenas para contato comercial B2B, com opção de descadastro.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function arg(flag, fallback) {
  const i = process.argv.indexOf(flag)
  if (i === -1) return fallback
  const v = process.argv[i + 1]
  return v && !v.startsWith('--') ? v : true
}
const UF = String(arg('--uf', 'SC')).toUpperCase()
const CIDADE = arg('--cidade', null)
const ENRICH = process.argv.includes('--enrich')
const DELAY = Number(arg('--intervalo', 2)) * 1000
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// Palavras do ramo (também usadas no filtro de nome do Overpass).
const NOME_RAMO = 'funilaria|funilria|lanternagem|lanterneiro|funileiro|pintura|repintura|martelinho|estética automotiva|estetica automotiva|reparo de amassado'
const RE_RAMO = new RegExp(NOME_RAMO, 'i')

function classificar(nome = '') {
  if (/martelinho|reparo de amassado|paintless|\bpdr\b/i.test(nome)) return 'martelinho'
  if (/funilaria|funilria|lanternagem|lanterneiro|funileiro/i.test(nome)) return 'funilaria'
  if (/pintura|repintura/i.test(nome)) return 'pintura'
  if (/estética|estetica/i.test(nome)) return 'estetica-automotiva'
  return 'funilaria/pintura' // veio por tag de serviço de lataria/pintura
}

function montarQuery() {
  const areaSel = CIDADE
    ? `area["name"~"^${CIDADE}$",i]["admin_level"~"8|9"]->.a;`
    : `area["ISO3166-2"="BR-${UF}"]["admin_level"="4"]->.a;`
  // Query LEVE (rápida e estável): busca oficinas + serviços de lataria/pintura.
  // O recorte para SÓ funilaria/pintura/martelinho é feito localmente no script,
  // o que evita sobrecarregar a Overpass com varredura por nome em todo o estado.
  return `
[out:json][timeout:180];
${areaSel}
(
  nwr(area.a)["shop"="car_repair"];
  nwr(area.a)["craft"="car_repair"];
  nwr(area.a)["shop"="car_body_repair"];
  nwr(area.a)["service:vehicle:body_repair"="yes"];
  nwr(area.a)["service:vehicle:painting"="yes"];
  nwr(area.a)["craft"="car_painter"];
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
    } catch (e) { console.log(`erro (${e.message})`) }
  }
  throw new Error('Não foi possível consultar a Overpass API. Tente novamente mais tarde.')
}

const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g
const LIXO = /\.(png|jpg|jpeg|gif|svg|webp)$|sentry|wix|example|seu-?email|your-?email|@2x|domain\.com|email\.com$/i
function limparEmails(texto, dom) {
  const achados = (texto.match(EMAIL_RE) || []).map((e) => e.toLowerCase()).filter((e) => !LIXO.test(e))
  const d = dom?.replace(/^www\./, '')
  achados.sort((a, b) => (b.endsWith(d || '\0') ? 1 : 0) - (a.endsWith(d || '\0') ? 1 : 0))
  return [...new Set(achados)][0] || ''
}
async function buscarEmailNoSite(site) {
  if (!site) return ''
  let base
  try { base = new URL(site.startsWith('http') ? site : `https://${site}`) } catch { return '' }
  const dom = base.hostname.replace(/^www\./, '')
  for (const p of ['', 'contato', 'contato.html', 'fale-conosco', 'contact']) {
    try {
      const u = new URL(p, base).toString()
      const res = await fetch(u, { signal: AbortSignal.timeout(8000), headers: { 'User-Agent': 'Mozilla/5.0 (DanosAparentes lead finder)' } })
      if (!res.ok) continue
      const email = limparEmails(await res.text(), dom)
      if (email) return email
    } catch { /* tenta próxima */ }
  }
  return ''
}

function csvCell(v) {
  const s = String(v ?? '')
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

async function main() {
  console.log('\n=== Buscador FOCADO · Funilaria / Pintura / Martelinho ===')
  console.log(`Região: ${CIDADE ? CIDADE + ' / ' : ''}${UF}${ENRICH ? ' · com busca de e-mail no site' : ''}\n`)

  const elementos = await buscarOverpass()
  const vistos = new Set()
  let empresas = []
  for (const el of elementos) {
    const t = el.tags || {}
    const nome = t.name || t.brand || ''
    if (!nome) continue
    // Segurança extra: se veio por tag mas o nome é claramente mecânica/elétrica
    // pura (sem indício de lataria/pintura) e não tem tag de body/paint, descarta.
    const temTagRamo = t['service:vehicle:body_repair'] === 'yes' || t['service:vehicle:painting'] === 'yes' ||
      t.shop === 'car_body_repair' || t.craft === 'car_painter'
    const soMecanica = /mec[âa]nica|el[ée]trica|auto el[ée]trica|injeção|injecao|diesel|pneus?|borracharia|alinhamento/i.test(nome)
    if (!temTagRamo && !RE_RAMO.test(nome)) continue
    if (!temTagRamo && soMecanica && !RE_RAMO.test(nome)) continue

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

  const porCat = empresas.reduce((a, e) => { a[e.categoria] = (a[e.categoria] || 0) + 1; return a }, {})
  console.log(`Empresas de funilaria/pintura/martelinho: ${empresas.length}`)
  console.log('  Por categoria:', Object.entries(porCat).map(([k, v]) => `${k}=${v}`).join(', '))
  console.log(`  • com e-mail no OpenStreetMap: ${empresas.filter(e => e.email).length}`)
  console.log(`  • com site (para enrichment): ${empresas.filter(e => e.site && !e.email).length}\n`)

  if (ENRICH) {
    const alvos = empresas.filter(e => !e.email && e.site)
    console.log(`Buscando e-mail no site de ${alvos.length} empresa(s) (intervalo ${DELAY / 1000}s)...`)
    for (let i = 0; i < alvos.length; i++) {
      const e = alvos[i]
      const email = await buscarEmailNoSite(e.site)
      if (email) { e.email = email; console.log(`  ✓ [${i + 1}/${alvos.length}] ${e.nome}: ${email}`) }
      else console.log(`  · [${i + 1}/${alvos.length}] ${e.nome}: (sem e-mail público)`)
      if (i < alvos.length - 1) await sleep(DELAY)
    }
    console.log('')
  }

  empresas.sort((a, b) => (b.email ? 1 : 0) - (a.email ? 1 : 0) || a.cidade.localeCompare(b.cidade))
  const header = 'nome,email,localizacao,categoria,site,telefone'
  const linhas = empresas.map(e => [e.nome, e.email, e.localizacao, e.categoria, e.site, e.telefone].map(csvCell).join(','))
  const out = path.resolve(__dirname, 'funilarias-encontradas.csv')
  fs.writeFileSync(out, '﻿' + header + '\n' + linhas.join('\n'))

  console.log(`=== Pronto: ${empresas.length} empresa(s) salvas ===`)
  console.log(`Com e-mail: ${empresas.filter(e => e.email).length}`)
  console.log(`Arquivo: ${out}`)
  if (!ENRICH) console.log('\nDica: rode com --enrich para buscar mais e-mails nos sites.')
}

main().catch((e) => { console.error('\nErro:', e.message); process.exit(1) })
