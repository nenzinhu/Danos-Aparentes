#!/usr/bin/env node
/**
 * Cursor SDK CLI — Agent.create() + runtime local (padrão) ou cloud.
 *
 * Uso:
 *   export CURSOR_API_KEY=cursor_...
 *   npm run agent -- "Explique o fluxo de sync"
 *   npm run agent -- --task pix-idempotency
 *   npm run agent -- --task sync-pull-safe --stream
 *   npm run agent -- --resume agent-xxx "Agora escreva o teste"
 *   npm run agent -- --cloud --task pix-idempotency
 *
 * Exit codes:
 *   0 = run finished
 *   1 = startup/config (CursorAgentError)
 *   2 = run executou e falhou
 */

import { Agent, CursorAgentError } from '@cursor/sdk'
import { createInterface } from 'node:readline'
import process from 'node:process'

const MODEL = { id: 'composer-2.5' }

/** Prompts prontos alinhados aos P0 de analysis/avarias-aparentes-pwa/FULLSTACK_AUDIT.md */
const TASKS = {
  'pix-idempotency': `
Implemente idempotência real no webhook PIX do Danos Aparentes.

Contexto:
- src/app/api/pix-webhook/route.ts processa pagamento e zera pending_months
- src/lib/subscriptionAccess.ts → extendSubscriptionExpiry trata months<=0 como 1 mês
- Retry do Mercado Pago pode estender a assinatura indevidamente

Faça:
1. Em extendSubscriptionExpiry, months <= 0 deve ser no-op (retornar base sem adicionar mês)
2. No webhook: só aplicar extensão se pending_months > 0 (update condicional) OU registrar payment_id processado
3. Testes em pix-flow.test.ts / subscriptionAccess.test.ts cobrindo webhook duplicado
4. Rodar npm run test e npm run typecheck; commit se tudo passar

Não mexer em UI/marketing. PR focado só neste fix.
`.trim(),

  'sync-pull-safe': `
Corrija perda de dados no sync offline-first.

Contexto:
- src/lib/sync.ts → pullRemote() retorna [] em erro
- mergeRemoteReports remove laudos locais com syncedAt quando remoto não tem o id

Faça:
1. Distinguir pull OK (lista vazia) de pull com erro (não merge destrutivo)
2. Em erro de pull, abortar remoções locais e manter cache
3. Testes em sync.test.ts
4. npm run test && npm run typecheck; commit

Escopo só sync + testes.
`.trim(),

  'pdf-escape': `
Adicione escapeHtml em todo texto de usuário no gerador de PDF.

Arquivos: src/lib/pdf/sections.ts, html.ts, theme.ts (labels dinâmicos).
Campos: owner, notes, custom fields, partName, empresa, etc.
Não escapar SVGs/data URLs de imagem já controlados.
Inclua teste unitário do helper e rode npm run test.
`.trim(),

  'historico-tenant': `
Isole o histórico público por placa ao emissor do QR.

Arquivo: src/app/historico/[token]/page.tsx
Hoje lista report_hashes por plate sem filtrar user_id do vehicle_qr_tokens.
Filtre pelo user_id do token (ou documente se produto deliberadamente público).
Mantenha robots noindex. Teste se houver harness; senão valide typecheck.
`.trim(),
}

function usage() {
  console.log(`Usage:
  npm run agent -- <prompt...>
  npm run agent -- --task <${Object.keys(TASKS).join('|')}>
  npm run agent -- --resume <agentId> <prompt...>
  npm run agent -- --cloud [--repo <url>] [--ref main] <prompt...>

Flags:
  --stream          imprime texto do assistente ao vivo
  --cloud            runtime cloud (abre PR se autoCreatePR)
  --repo <url>      repo GitHub para cloud (default: origin)
  --ref <branch>    startingRef cloud (default: main)
  --task <name>     usa prompt P0 pré-definido
  --resume <id>     continua agente existente
`)
}

function parseArgs(argv) {
  const args = [...argv]
  const opts = {
    stream: false,
    cloud: false,
    resume: null,
    task: null,
    repo: null,
    ref: 'main',
    promptParts: [],
  }

  while (args.length) {
    const a = args.shift()
    if (a === '--help' || a === '-h') {
      usage()
      process.exit(0)
    } else if (a === '--stream') {
      opts.stream = true
    } else if (a === '--cloud') {
      opts.cloud = true
    } else if (a === '--resume') {
      opts.resume = args.shift()
    } else if (a === '--task') {
      opts.task = args.shift()
    } else if (a === '--repo') {
      opts.repo = args.shift()
    } else if (a === '--ref') {
      opts.ref = args.shift()
    } else if (a.startsWith('-')) {
      console.error(`Flag desconhecida: ${a}`)
      usage()
      process.exit(1)
    } else {
      opts.promptParts.push(a)
      opts.promptParts.push(...args)
      break
    }
  }

  return opts
}

async function resolveOriginUrl() {
  const { execSync } = await import('node:child_process')
  try {
    const url = execSync('git remote get-url origin', { encoding: 'utf8' }).trim()
    return url.replace(/\.git$/, '').replace(/^git@github\.com:/, 'https://github.com/')
  } catch {
    return null
  }
}

async function streamAssistant(run) {
  for await (const event of run.stream()) {
    if (event.type === 'assistant') {
      for (const block of event.message.content) {
        if (block.type === 'text') process.stdout.write(block.text)
      }
    }
  }
  process.stdout.write('\n')
}

async function main() {
  const opts = parseArgs(process.argv.slice(2))
  const apiKey = process.env.CURSOR_API_KEY?.trim()
  if (!apiKey) {
    console.error('Defina CURSOR_API_KEY (Dashboard → Integrations / Service accounts).')
    process.exit(1)
  }

  let prompt = opts.promptParts.join(' ').trim()
  if (opts.task) {
    const taskPrompt = TASKS[opts.task]
    if (!taskPrompt) {
      console.error(`Task desconhecida: ${opts.task}`)
      console.error(`Disponíveis: ${Object.keys(TASKS).join(', ')}`)
      process.exit(1)
    }
    prompt = prompt ? `${taskPrompt}\n\nInstrução extra:\n${prompt}` : taskPrompt
  }

  if (!prompt && !opts.resume) {
    usage()
    process.exit(1)
  }

  if (!prompt && opts.resume) {
    // resume sem prompt: modo interativo de uma linha
    const rl = createInterface({ input: process.stdin, output: process.stdout })
    prompt = await new Promise((resolve) => {
      rl.question('Prompt follow-up: ', (answer) => {
        rl.close()
        resolve(answer.trim())
      })
    })
    if (!prompt) {
      console.error('Prompt vazio.')
      process.exit(1)
    }
  }

  try {
    /** @type {Awaited<ReturnType<typeof Agent.create>>} */
    let agent

    if (opts.resume) {
      agent = await Agent.resume(opts.resume, { apiKey })
    } else if (opts.cloud) {
      const repo = opts.repo || (await resolveOriginUrl())
      if (!repo) {
        console.error('Cloud exige --repo <url> (ou remote origin configurado).')
        process.exit(1)
      }
      agent = await Agent.create({
        apiKey,
        model: MODEL,
        cloud: {
          repos: [{ url: repo, startingRef: opts.ref }],
          autoCreatePR: true,
          skipReviewerRequest: true,
        },
      })
    } else {
      agent = await Agent.create({
        apiKey,
        model: MODEL,
        local: { cwd: process.cwd() },
      })
    }

    try {
      console.error(`[agent] id=${agent.agentId} runtime=${opts.cloud ? 'cloud' : opts.resume ? 'resume' : 'local'}`)
      const run = await agent.send(prompt)
      console.error(`[run] id=${run.id}`)

      if (opts.stream && run.supports('stream')) {
        await streamAssistant(run)
      }

      const result = await run.wait()
      if (result.status === 'error') {
        console.error(`[run] failed: ${result.error?.message ?? result.id}`)
        process.exit(2)
      }
      if (result.status === 'cancelled') {
        console.error('[run] cancelled')
        process.exit(2)
      }

      if (!opts.stream && result.result) {
        console.log(result.result)
      }
      if (result.usage) {
        console.error(
          `[usage] in=${result.usage.inputTokens} out=${result.usage.outputTokens} total=${result.usage.totalTokens}`,
        )
      }
      if (result.git?.branches?.length) {
        for (const b of result.git.branches) {
          console.error(`[git] ${b.repoUrl} branch=${b.branch ?? '?'} pr=${b.prUrl ?? '-'}`)
        }
      }
      console.error(`[run] status=${result.status} durationMs=${result.durationMs ?? '?'}`)
    } finally {
      await agent[Symbol.asyncDispose]()
    }
  } catch (err) {
    if (err instanceof CursorAgentError) {
      console.error(`[startup] ${err.message} retryable=${err.isRetryable}`)
      process.exit(1)
    }
    throw err
  }
}

main()
