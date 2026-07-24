#!/usr/bin/env node
/*
 * ============================================================
 *  Danos Aparentes — Buscar e-mails em SITES/BLOGS via motor de busca
 * ============================================================
 *
 * Usa a API oficial do Google (Programmable Search / Custom Search JSON)
 * para encontrar SITES, BLOGS e páginas de FUNILARIA, PINTURA AUTOMOTIVA e
 * MARTELINHO DE OURO que publicam e-mail de contato — depois visita cada
 * página e extrai o e-mail.
 *
 * Por que a API e não raspar o Google direto?
 *   Raspar resultados do Google viola os termos e leva a bloqueio (CAPTCHA).
 *   A Custom Search JSON API é a via oficial e gratuita (100 buscas/dia).
 *
 * ── Configuração (uma vez) ──────────────────────────────────
 *   1) Crie um mecanismo em https://programmablesearchengine.google.com/
 *      - "Pesquisar em toda a web" = ATIVADO
 *      - copie o "ID do mecanismo de pesquisa" (cx)
 *   2) Gere uma API key em https://developers.google.com/custom-search/v1/introduction
 *      (botão "Get a Key")
 *   3) No arquivo .env (raiz do projeto), adicione:
 *        GOOGLE_API_KEY=sua_chave
 *        GOOGLE_CSE_ID=seu_cx
 *
 * ── Uso ─────────────────────────────────────────────────────
 *   node scripts/email-marketing/buscar-sites.mjs --cidade "Joinville"
 *   node scripts/email-marketing/buscar-sites.mjs --uf SC --cidade "Blumenau"
 *   node scripts/email-marketing/buscar-sites.mjs --cidade "Itajaí" --max 6
 *
 *   Sem chave configurada → o script imprime as BUSCAS PRONTAS para você
 *   abrir no navegador manualmente.
 *
 * Saída: sites-encontrados.csv  (nesta mesma pasta)
 *
 * ⚠️ LGPD: e-mails de contato comercial B2B, com opção de descadastro.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Carrega .env de forma simples (sem dependência), se existir.
;(function loadEnv() {
  const envPath = path.resolve(__dirname, '../../.env')
  if (!fs.existsSync(envPath)) return
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
})()

function arg(flag, fallback) {
  const i = process.argv.indexOf(flag)
  if (i === -1) return fallback
  const v = process.argv[i + 1]
  return v && !v.startsWith('--') ? v : fallback
}
const UF = String(arg('--uf', 'SC')).toUpperCase()
const CIDADE = arg('--cidade', '')
const MAX_QUERIES = Number(arg('--max', 8))
const DELAY = Number(arg('--intervalo', 1.5)) * 1000
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const KEY = process.env.GOOGLE_API_KEY
const CX = process.env.GOOGLE_CSE_ID

// ── Buscas bem específicas para o nicho + indício de e-mail ───────────────
function montarBuscas() {
  const local = CIDADE ? `${CIDADE} ${UF}` : `${UF}`
  // Cada item vira uma consulta. Operadores deixam a busca bem cirúrgica.
  return [
    `"funilaria e pintura" ${local} (contato OR email OR "@gmail" OR "@hotmail")`,
    `"martelinho de ouro" ${local} (contato OR email OR "@gmail" OR "@hotmail")`,
    `"pintura automotiva" ${local} email contato`,
    `("lanternagem" OR "latoaria") "pintura" ${local} email`,
    `funilaria pintura ${local} "@" site:.com.br`,
    `"martelinho" OR "reparo de amassado" ${local} "@" site:.com.br`,
    `funilaria OR "pintura automotiva" ${local} contato site:facebook.com`,
    `"estética automotiva" funilaria ${local} email`,
  ].slice(0, MAX_QUERIES)
}

// ── Google Custom Search ──────────────────────────────────────────────────
async function googleSearch(q) {
  const url = `https://www.googleapis.com/customsearch/v1?key=${KEY}&cx=${CX}` +
    `&q=${encodeURIComponent(q)}&num=10&gl=br&hl=pt-BR&lr=lang_pt`
  const res = await fetch(url, { signal: AbortSignal.timeout(15000) })
  if (!res.ok) {
    const txt = await res.text().catch(() => '')
    throw new Error(`HTTP ${res.status} ${txt.slice(0, 120)}`)
  }
  const json = await res.json()
  return (json.items || []).map((it) => ({ title: it.title, link: it.link, snippet: it.snippet || '' }))
}

// ── Extração de e-mail ────────────────────────────────────────────────────
const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g
const LIXO = /\.(png|jpe?g|gif|svg|webp)$|sentry|wixpress|\.wix|example|seu-?email|your-?email|@2x|sentry\.io|@sentry|godaddy|cloudflare|@adobe|@facebook|@google|noreply|no-reply/i
function extrairEmails(texto, dom) {
  const achados = (texto.match(EMAIL_RE) || []).map((e) => e.toLowerCase()).filter((e) => !LIXO.test(e))
  const d = (dom || '').replace(/^www\./, '')
  achados.sort((a, b) => (b.endsWith(d || '\0') ? 1 : 0) - (a.endsWith(d || '\0') ? 1 : 0))
  return [...new Set(achados)]
}
async function emailDoSite(link) {
  let base
  try { base = new URL(link) } catch { return [] }
  const dom = base.hostname.replace(/^www\./, '')
  const paginas = ['', 'contato', 'fale-conosco', 'sobre', 'contact']
  for (const p of paginas) {
    try {
      const u = p ? new URL(p, base).toString() : link
      const res = await fetch(u, { signal: AbortSignal.timeout(9000), headers: { 'User-Agent': 'Mozilla/5.0 (DanosAparentes lead finder)' } })
      if (!res.ok) continue
      const emails = extrairEmails(await res.text(), dom)
      if (emails.length) return emails
    } catch { /* tenta próxima */ }
  }
  return []
}

function csvCell(v) {
  const s = String(v ?? '')
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

async function main() {
  console.log('\n=== Buscar e-mails em sites/blogs · funilaria/pintura/martelinho ===')
  console.log(`Região: ${CIDADE ? CIDADE + ' / ' : ''}${UF}\n`)
  const buscas = montarBuscas()

  // Sem chave: imprime as buscas prontas para uso manual.
  if (!KEY || !CX) {
    console.log('⚠ GOOGLE_API_KEY / GOOGLE_CSE_ID não configurados no .env.')
    console.log('  Veja as instruções no topo deste arquivo para ativar a busca automática.\n')
    console.log('Enquanto isso, abra estas buscas no navegador (copie e cole):\n')
    buscas.forEach((q, i) => {
      console.log(`  ${i + 1}. ${q}`)
      console.log(`     https://www.google.com/search?q=${encodeURIComponent(q)}\n`)
    })
    return
  }

  // Com chave: busca → coleta links → extrai e-mails.
  const linksVistos = new Set()
  const resultados = []
  for (let i = 0; i < buscas.length; i++) {
    const q = buscas[i]
    process.stdout.write(`[${i + 1}/${buscas.length}] Buscando: ${q.slice(0, 50)}... `)
    let itens = []
    try { itens = await googleSearch(q) } catch (e) { console.log(`erro (${e.message})`); continue }
    console.log(`${itens.length} resultados`)
    for (const it of itens) {
      if (linksVistos.has(it.link)) continue
      linksVistos.add(it.link)
      // e-mail já no snippet?
      let emails = extrairEmails(it.title + ' ' + it.snippet, new URL(it.link).hostname)
      if (!emails.length) emails = await emailDoSite(it.link)
      if (emails.length) {
        resultados.push({ empresa: it.title.replace(/\s+[-|–].*$/, '').trim(), email: emails[0], site: it.link, query: q })
        console.log(`    ✓ ${emails[0]}  (${it.link})`)
      }
      await sleep(300)
    }
    if (i < buscas.length - 1) await sleep(DELAY)
  }

  // Dedup por e-mail.
  const porEmail = new Map()
  for (const r of resultados) if (!porEmail.has(r.email)) porEmail.set(r.email, r)
  const finais = [...porEmail.values()]

  const header = 'empresa,email,site,busca'
  const linhas = finais.map((r) => [r.empresa, r.email, r.site, r.query].map(csvCell).join(','))
  const out = path.resolve(__dirname, 'sites-encontrados.csv')
  fs.writeFileSync(out, '﻿' + header + '\n' + linhas.join('\n'))

  console.log(`\n=== Pronto: ${finais.length} e-mail(s) único(s) encontrados ===`)
  console.log(`Arquivo: ${out}`)
}

main().catch((e) => { console.error('\nErro:', e.message); process.exit(1) })
