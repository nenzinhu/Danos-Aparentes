#!/usr/bin/env node
/*
 * ============================================================
 *  Danos Aparentes — Buscador de LOCADORAS de veículos
 * ============================================================
 *
 * Coleta: NOME, E-MAIL, LOCALIZAÇÃO, SITE, TELEFONE.
 * Fonte: OpenStreetMap (Overpass API) — dados abertos, sem raspar Google Maps.
 *
 * E-mail: tags OSM (email / contact:email) + opcional --enrich (página de contato do site).
 *
 * ── Uso ─────────────────────────────────────────────────────
 *   node scripts/email-marketing/buscar-locadoras.mjs
 *   node scripts/email-marketing/buscar-locadoras.mjs --uf SP
 *   node scripts/email-marketing/buscar-locadoras.mjs --cidade "Florianópolis"
 *   node scripts/email-marketing/buscar-locadoras.mjs --enrich
 *   node scripts/email-marketing/buscar-locadoras.mjs --enrich --so-com-email
 *
 * Ou dê dois cliques em: prospect-locadoras.bat (raiz do projeto)
 *
 * Saída: locadoras-encontradas.csv  (nesta mesma pasta)
 *
 * ⚠️ LGPD: contato comercial B2B apenas, com opção de descadastro. Sem spam em massa.
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
const SO_COM_EMAIL = process.argv.includes('--so-com-email')
const DELAY = Number(arg('--intervalo', 2)) * 1000
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/** Nome típico de locadora (filtro local + query por nome em cidade). */
const RE_NOME = /loca(?:dora|ção|cao)|aluguel\s+de\s+(?:carro|carros|ve[ií]culo|veiculos|auto)|rent\s*a\s*car|car\s*rental|localiza|unidas|movida|foco\s*rent|yes\s*rent|avis|hertz|enterprise/i

function classificar(nome = '') {
  if (/localiza/i.test(nome)) return 'rede-localiza'
  if (/unidas/i.test(nome)) return 'rede-unidas'
  if (/movida/i.test(nome)) return 'rede-movida'
  if (/rent\s*a\s*car|avis|hertz|enterprise/i.test(nome)) return 'rede-internacional'
  if (/frota|empresarial|corporativ/i.test(nome)) return 'frota-empresarial'
  return 'locadora'
}

function montarQuery() {
  const areaSel = CIDADE
    ? `area["name"~"^${escapeOverpass(CIDADE)}$",i]["admin_level"~"8|9"]->.a;`
    : `area["ISO3166-2"="BR-${UF}"]["admin_level"="4"]->.a;`

  // Tags oficiais de aluguel de carro + (só com cidade) nomes típicos.
  // Evita varredura por nome em estado inteiro (Overpass estoura timeout).
  const porNome = CIDADE
    ? `
  nwr(area.a)["name"~"locadora|aluguel de carro|aluguel de ve|rent.?a.?car|car rental",i];
`
    : ''

  return `
[out:json][timeout:180];
${areaSel}
(
  nwr(area.a)["amenity"="car_rental"];
  nwr(area.a)["shop"="car_rental"];
  nwr(area.a)["amenity"="car_sharing"];
${porNome}
);
out center tags;`
}

function escapeOverpass(s) {
  return String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"')
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
          Accept: 'application/json',
          'User-Agent': 'DanosAparentes-LeadFinder/1.0 (contato: suporte@danosaparentes.com.br)',
        },
        body,
        signal: AbortSignal.timeout(190000),
      })
      if (!res.ok) {
        console.log(`falhou (HTTP ${res.status})`)
        continue
      }
      const json = await res.json()
      console.log(`ok — ${json.elements?.length || 0} registros brutos.`)
      return json.elements || []
    } catch (e) {
      console.log(`erro (${e.message})`)
    }
  }
  throw new Error('Não foi possível consultar a Overpass API. Tente novamente mais tarde.')
}

const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g
const LIXO =
  /\.(png|jpg|jpeg|gif|svg|webp)$|sentry|wixpress|example|seu-?email|your-?email|@2x|domain\.com|email\.com$|noreply|no-reply|webpack|sentry\.io/i

function limparEmails(texto, dom) {
  const achados = (texto.match(EMAIL_RE) || [])
    .map((e) => e.toLowerCase())
    .filter((e) => !LIXO.test(e))
  const d = dom?.replace(/^www\./, '')
  achados.sort((a, b) => (b.endsWith(d || '\0') ? 1 : 0) - (a.endsWith(d || '\0') ? 1 : 0))
  return [...new Set(achados)][0] || ''
}

async function buscarEmailNoSite(site) {
  if (!site) return ''
  let base
  try {
    base = new URL(site.startsWith('http') ? site : `https://${site}`)
  } catch {
    return ''
  }
  const dom = base.hostname.replace(/^www\./, '')
  for (const p of ['', 'contato', 'contato.html', 'fale-conosco', 'contact', 'contato/', 'about']) {
    try {
      const u = new URL(p, base).toString()
      const res = await fetch(u, {
        signal: AbortSignal.timeout(8000),
        headers: { 'User-Agent': 'Mozilla/5.0 (DanosAparentes lead finder)' },
        redirect: 'follow',
      })
      if (!res.ok) continue
      const email = limparEmails(await res.text(), dom)
      if (email) return email
    } catch {
      /* próxima URL */
    }
  }
  return ''
}

function csvCell(v) {
  const s = String(v ?? '')
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

async function main() {
  console.log('\n=== Buscador · Locadoras de veículos ===')
  console.log(
    `Região: ${CIDADE ? CIDADE + ' / ' : ''}${UF}${ENRICH ? ' · com busca de e-mail no site' : ''}\n`,
  )

  const elementos = await buscarOverpass()
  const vistos = new Set()
  let empresas = []

  for (const el of elementos) {
    const t = el.tags || {}
    const nome = t.name || t.brand || t.operator || ''
    if (!nome) continue

    const tagLocadora = t.amenity === 'car_rental' || t.shop === 'car_rental'
    const tagSharing = t.amenity === 'car_sharing'
    if (!tagLocadora && !tagSharing && !RE_NOME.test(nome)) continue

    // Descarta coisas óbvias fora do ICP (concessionária pura, posto, etc.)
    if (/concession[aá]ria|posto\b|borracharia|lava\s*jato|estacionamento\b/i.test(nome) && !RE_NOME.test(nome)) {
      continue
    }

    const cidade = t['addr:city'] || t['addr:municipality'] || ''
    const rua = [t['addr:street'], t['addr:housenumber']].filter(Boolean).join(', ')
    const localizacao = [rua, cidade, UF].filter(Boolean).join(' - ')
    const email = (t.email || t['contact:email'] || '').toLowerCase()
    let site = t.website || t['contact:website'] || t['contact:facebook'] || ''
    if (site && !/^https?:/i.test(site) && !site.includes('facebook.com')) site = 'https://' + site
    if (/facebook\.com/i.test(site)) {
      // mantém como referência, mas não é bom para scrape de e-mail
    }
    const telefone = t.phone || t['contact:phone'] || t['contact:mobile'] || ''
    const chave = (nome + '|' + (cidade || localizacao)).toLowerCase()
    if (vistos.has(chave)) continue
    vistos.add(chave)

    empresas.push({
      nome,
      email,
      localizacao,
      cidade,
      site,
      telefone,
      categoria: tagSharing && !tagLocadora ? 'car-sharing' : classificar(nome),
      fonte: tagLocadora ? 'osm-car_rental' : tagSharing ? 'osm-car_sharing' : 'osm-nome',
    })
  }

  const porCat = empresas.reduce((a, e) => {
    a[e.categoria] = (a[e.categoria] || 0) + 1
    return a
  }, {})
  console.log(`Locadoras / aluguel encontradas: ${empresas.length}`)
  console.log('  Por categoria:', Object.entries(porCat).map(([k, v]) => `${k}=${v}`).join(', ') || '(nenhuma)')
  console.log(`  • com e-mail no OpenStreetMap: ${empresas.filter((e) => e.email).length}`)
  console.log(`  • com site (para enrichment): ${empresas.filter((e) => e.site && !e.email).length}\n`)

  if (empresas.length === 0) {
    console.log('Nenhum resultado. Tente:')
    console.log('  --cidade "Florianópolis"   (cidade costuma achar mais por nome)')
    console.log('  --uf SP')
    console.log('  Ou rode várias cidades e una os CSVs.\n')
  }

  if (ENRICH) {
    const alvos = empresas.filter((e) => !e.email && e.site && !/facebook\.com|instagram\.com/i.test(e.site))
    console.log(`Buscando e-mail no site de ${alvos.length} empresa(s) (intervalo ${DELAY / 1000}s)...`)
    for (let i = 0; i < alvos.length; i++) {
      const e = alvos[i]
      const email = await buscarEmailNoSite(e.site)
      if (email) {
        e.email = email
        console.log(`  ✓ [${i + 1}/${alvos.length}] ${e.nome}: ${email}`)
      } else {
        console.log(`  · [${i + 1}/${alvos.length}] ${e.nome}: (sem e-mail público)`)
      }
      if (i < alvos.length - 1) await sleep(DELAY)
    }
    console.log('')
  }

  if (SO_COM_EMAIL) {
    empresas = empresas.filter((e) => e.email)
    console.log(`Filtro --so-com-email: ${empresas.length} restante(s).\n`)
  }

  empresas.sort(
    (a, b) => (b.email ? 1 : 0) - (a.email ? 1 : 0) || a.cidade.localeCompare(b.cidade) || a.nome.localeCompare(b.nome),
  )

  const header = 'nome,email,localizacao,categoria,site,telefone,fonte'
  const linhas = empresas.map((e) =>
    [e.nome, e.email, e.localizacao, e.categoria, e.site, e.telefone, e.fonte].map(csvCell).join(','),
  )
  const out = path.resolve(__dirname, 'locadoras-encontradas.csv')
  fs.writeFileSync(out, '\uFEFF' + header + '\n' + linhas.join('\n'), 'utf8')

  console.log(`=== Pronto: ${empresas.length} registro(s) ===`)
  console.log(`Com e-mail: ${empresas.filter((e) => e.email).length}`)
  console.log(`Arquivo: ${out}`)
  if (!ENRICH) console.log('\nDica: rode com --enrich para buscar mais e-mails nos sites.')
  console.log('Dica: OSM cobre pouco no BR — rode por cidade (--cidade) e complete com Hunter/WhatsApp.\n')
}

main().catch((e) => {
  console.error('\nErro:', e.message)
  process.exit(1)
})
