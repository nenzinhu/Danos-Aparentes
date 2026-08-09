#!/usr/bin/env node
/*
 * ============================================================
 *  Danos Aparentes — Exportar contatos de WhatsApp
 * ============================================================
 *
 * Lê o funilarias-encontradas.csv (ou empresas-encontradas.csv) e gera uma
 * lista pronta para abordagem por WhatsApp: nome, telefone normalizado e
 * link wa.me clicável. Mantém só empresas que têm telefone.
 *
 * ── Uso ─────────────────────────────────────────────────────
 *   node scripts/email-marketing/exportar-whatsapp.mjs
 *   node scripts/email-marketing/exportar-whatsapp.mjs --fonte empresas-encontradas.csv
 *
 * Saída: whatsapp-contatos.csv  (nesta mesma pasta)
 *
 * ⚠️ LGPD: use para contato comercial B2B. Não dispare mensagens em massa
 *    automatizadas (viola termos do WhatsApp). Aborde de forma individual.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
function arg(flag, fallback) {
  const i = process.argv.indexOf(flag)
  if (i === -1) return fallback
  const v = process.argv[i + 1]
  return v && !v.startsWith('--') ? v : fallback
}
const FONTE = arg('--fonte', 'funilarias-encontradas.csv')

// Parser CSV simples que respeita aspas.
function parseCsv(texto) {
  const linhas = texto.replace(/^﻿/, '').trim().split(/\r?\n/)
  const head = splitLinha(linhas.shift())
  return linhas.filter(Boolean).map((l) => {
    const cols = splitLinha(l)
    const o = {}
    head.forEach((h, i) => (o[h.trim()] = (cols[i] || '').trim()))
    return o
  })
}
function splitLinha(linha) {
  const out = []
  let cur = '', dentro = false
  for (let i = 0; i < linha.length; i++) {
    const c = linha[i]
    if (c === '"') { if (dentro && linha[i + 1] === '"') { cur += '"'; i++ } else dentro = !dentro }
    else if (c === ',' && !dentro) { out.push(cur); cur = '' }
    else cur += c
  }
  out.push(cur)
  return out
}

// Normaliza telefone BR para E.164 (só dígitos, com 55). Pega o 1º número.
function normalizarTelefone(tel) {
  if (!tel) return ''
  const primeiro = tel.split(/[;/]/)[0]
  let d = primeiro.replace(/\D/g, '')
  if (!d) return ''
  if (d.startsWith('55')) d = d.slice(2)
  // remove zeros à esquerda / DDD 0
  d = d.replace(/^0+/, '')
  // precisa de DDD (2) + número (8 ou 9 dígitos)
  if (d.length < 10 || d.length > 11) return ''
  return '55' + d
}

function csvCell(v) {
  const s = String(v ?? '')
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

function main() {
  const src = path.resolve(__dirname, FONTE)
  if (!fs.existsSync(src)) {
    console.error(`✗ Arquivo não encontrado: ${src}`)
    console.error('  Rode primeiro o Buscar-Funilaria.bat para gerar a lista.')
    process.exit(1)
  }
  console.log(`\n=== Exportar contatos de WhatsApp ===\nFonte: ${FONTE}\n`)

  const rows = parseCsv(fs.readFileSync(src, 'utf8'))
  const vistos = new Set()
  const contatos = []
  for (const r of rows) {
    const fone = normalizarTelefone(r.telefone)
    if (!fone) continue
    if (vistos.has(fone)) continue
    vistos.add(fone)
    const ddd = fone.slice(2, 4)
    const numeroFmt = `(${ddd}) ${fone.slice(4)}`
    contatos.push({
      nome: r.nome || '',
      telefone: numeroFmt,
      whatsapp_link: `https://wa.me/${fone}`,
      categoria: r.categoria || '',
      localizacao: r.localizacao || '',
    })
  }

  const header = 'nome,telefone,whatsapp_link,categoria,localizacao'
  const linhas = contatos.map((c) =>
    [c.nome, c.telefone, c.whatsapp_link, c.categoria, c.localizacao].map(csvCell).join(','))
  const out = path.resolve(__dirname, 'whatsapp-contatos.csv')
  fs.writeFileSync(out, '﻿' + header + '\n' + linhas.join('\n'))

  console.log(`Contatos com WhatsApp: ${contatos.length} (de ${rows.length} empresas)`)
  console.log(`Arquivo: ${out}`)
  console.log('\nAbra o CSV, clique no link wa.me e use a mensagem rápida da trilha funilaria.')
}

main()
