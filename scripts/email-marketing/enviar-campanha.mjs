#!/usr/bin/env node
/*
 * ============================================================
 *  Danos Aparentes — Envio de campanha de e-mail (SMTP Zoho)
 * ============================================================
 *
 * Envia os 3 templates (funilaria/martelinho, locadoras, vistoriadores)
 * para a lista em destinatarios.csv, a partir de suporte@danosaparentes.com.br.
 *
 * Recursos: modo de teste (dry-run), throttle entre envios, filtro por
 * segmento, limite de envios, log de enviados e falhas, descadastro/LGPD.
 *
 * ── Pré-requisitos ──────────────────────────────────────────
 *   1) npm install nodemailer dotenv
 *   2) No .env (na raiz do projeto), adicione as credenciais SMTP do Zoho:
 *        SMTP_HOST=smtp.zoho.com
 *        SMTP_PORT=465
 *        SMTP_USER=suporte@danosaparentes.com.br
 *        SMTP_PASS=<senha-de-aplicativo-do-zoho>
 *      A SMTP_PASS NÃO é a senha de login: gere uma "App Password" em
 *      Zoho Mail → Settings → Security → App Passwords.
 *
 * ── Uso ─────────────────────────────────────────────────────
 *   # Teste (NÃO envia nada, só mostra o que faria):
 *   node scripts/email-marketing/enviar-campanha.mjs --dry-run
 *
 *   # Envio real:
 *   node scripts/email-marketing/enviar-campanha.mjs
 *
 *   # Só um segmento, no máximo 20 e-mails, 12s entre cada:
 *   node scripts/email-marketing/enviar-campanha.mjs --segmento funilaria --limite 20 --intervalo 12
 *
 * Flags:
 *   --dry-run            não envia; apenas simula e gera preview do 1º e-mail
 *   --segmento <nome>    funilaria | locadoras | vistoriadores
 *   --limite <n>         envia no máximo n e-mails nesta execução
 *   --intervalo <seg>    segundos de espera entre envios (padrão 10)
 *   --csv <caminho>      lista alternativa (padrão: ./destinatarios.csv)
 */

import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import nodemailer from 'nodemailer'
import { montarEmail, SEGMENTOS_DISPONIVEIS } from './templates.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REMETENTE = process.env.SMTP_USER || 'suporte@danosaparentes.com.br'
const NOME_REMETENTE = 'Danos Aparentes'

// ── Parse de argumentos ──────────────────────────────────────────────────
function arg(flag, fallback = undefined) {
  const i = process.argv.indexOf(flag)
  if (i === -1) return fallback
  const val = process.argv[i + 1]
  return val && !val.startsWith('--') ? val : true
}
const DRY_RUN = process.argv.includes('--dry-run')
const SEGMENTO_FILTRO = arg('--segmento')
const LIMITE = Number(arg('--limite', Infinity))
const INTERVALO = Number(arg('--intervalo', 10)) * 1000
const CSV_PATH = path.resolve(__dirname, arg('--csv', 'destinatarios.csv'))

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const emailValido = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)

// ── Leitura do CSV (parser simples, sem dependência) ─────────────────────
function lerCsv(arquivo) {
  if (!fs.existsSync(arquivo)) {
    console.error(`✗ CSV não encontrado: ${arquivo}`)
    process.exit(1)
  }
  const linhas = fs.readFileSync(arquivo, 'utf8').trim().split(/\r?\n/)
  const cabecalho = linhas.shift().split(',').map((c) => c.trim().toLowerCase())
  return linhas
    .filter((l) => l.trim())
    .map((linha) => {
      const cols = linha.split(',')
      const obj = {}
      cabecalho.forEach((c, i) => (obj[c] = (cols[i] || '').trim()))
      return obj
    })
}

// ── Log append (csv) ─────────────────────────────────────────────────────
function registrar(arquivo, linha) {
  const caminho = path.resolve(__dirname, arquivo)
  if (!fs.existsSync(caminho)) fs.writeFileSync(caminho, 'data,email,segmento,status\n')
  fs.appendFileSync(caminho, linha + '\n')
}

// ── Main ─────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n=== Campanha de e-mail · Danos Aparentes ===')
  console.log(DRY_RUN ? '🟡 MODO TESTE (dry-run) — nada será enviado\n' : '🔴 ENVIO REAL\n')

  let destinatarios = lerCsv(CSV_PATH)

  // Validação e filtros
  const invalidos = destinatarios.filter((d) => !emailValido(d.email))
  if (invalidos.length) {
    console.warn(`⚠ ${invalidos.length} e-mail(s) inválido(s) ignorado(s).`)
    destinatarios = destinatarios.filter((d) => emailValido(d.email))
  }
  destinatarios = destinatarios.filter((d) => SEGMENTOS_DISPONIVEIS.includes(d.segmento))
  if (SEGMENTO_FILTRO) destinatarios = destinatarios.filter((d) => d.segmento === SEGMENTO_FILTRO)

  // Deduplica por e-mail
  const vistos = new Set()
  destinatarios = destinatarios.filter((d) => {
    const k = d.email.toLowerCase()
    if (vistos.has(k)) return false
    vistos.add(k)
    return true
  })

  if (Number.isFinite(LIMITE)) destinatarios = destinatarios.slice(0, LIMITE)

  if (!destinatarios.length) {
    console.log('Nenhum destinatário válido após os filtros. Encerrando.')
    return
  }
  console.log(`📋 ${destinatarios.length} destinatário(s) na fila.`)
  console.log(`⏱  Intervalo: ${INTERVALO / 1000}s entre envios.\n`)

  // ── Preview / transporte ───────────────────────────────────────────────
  if (DRY_RUN) {
    const d = destinatarios[0]
    const { assunto, html } = montarEmail(d.segmento, d)
    const preview = path.resolve(__dirname, 'preview.html')
    fs.writeFileSync(preview, html)
    console.log(`Exemplo (1º da fila): ${d.email} [${d.segmento}]`)
    console.log(`Assunto: ${assunto}`)
    console.log(`Preview HTML salvo em: ${preview}\n`)
    destinatarios.forEach((x) => console.log(`  • ${x.email.padEnd(36)} ${x.segmento}`))
    console.log('\nRode sem --dry-run para enviar de verdade.')
    return
  }

  for (const v of ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS']) {
    if (!process.env[v]) {
      console.error(`✗ Variável ${v} ausente no .env. Veja o cabeçalho deste arquivo.`)
      process.exit(1)
    }
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  })

  try {
    await transporter.verify()
    console.log('✓ Conexão SMTP verificada.\n')
  } catch (e) {
    console.error('✗ Falha ao conectar no SMTP:', e.message)
    process.exit(1)
  }

  let ok = 0
  let falhou = 0
  for (let i = 0; i < destinatarios.length; i++) {
    const d = destinatarios[i]
    const { assunto, html, texto } = montarEmail(d.segmento, d)
    const tag = `[${i + 1}/${destinatarios.length}] ${d.email}`
    try {
      await transporter.sendMail({
        from: `"${NOME_REMETENTE}" <${REMETENTE}>`,
        to: d.email,
        subject: assunto,
        text: texto,
        html,
        replyTo: REMETENTE,
        headers: {
          'List-Unsubscribe': `<mailto:${REMETENTE}?subject=Descadastrar>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        },
      })
      ok++
      console.log(`✓ ${tag} enviado.`)
      registrar('enviados.csv', `${new Date().toISOString()},${d.email},${d.segmento},ok`)
    } catch (e) {
      falhou++
      console.error(`✗ ${tag} FALHOU: ${e.message}`)
      registrar('falhas.csv', `${new Date().toISOString()},${d.email},${d.segmento},"${e.message}"`)
    }
    if (i < destinatarios.length - 1) await sleep(INTERVALO)
  }

  console.log(`\n=== Fim · enviados: ${ok} · falhas: ${falhou} ===`)
  console.log('Logs: enviados.csv / falhas.csv (na pasta email-marketing).')
}

main().catch((e) => {
  console.error('Erro inesperado:', e)
  process.exit(1)
})
