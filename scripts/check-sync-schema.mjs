// Detecta drift entre as colunas que src/lib/sync.ts realmente grava no
// Supabase (upsert de vehicle_inspections/damages) e as colunas que existem
// de fato no banco de produção. Existe porque exatamente essa divergência
// (colunas cpf/cnh/assinatura usadas no código, nunca migradas pro banco)
// deixou a sincronização de vistorias 100% quebrada por semanas sem ninguém
// perceber — ver commits de 2026-07-07.
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))

function loadEnv(path) {
  if (!existsSync(path)) return {}
  const text = readFileSync(path, 'utf8')
  const env = {}
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim()
  }
  return env
}

const env = { ...loadEnv(resolve(__dirname, '..', '.env')), ...process.env }
const token = env.SUPABASE_ACCESS_TOKEN
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || env.VITE_SUPABASE_URL || ''
const projectRef = env.SUPABASE_PROJECT_REF || supabaseUrl.match(/^https?:\/\/([a-z0-9]+)\.supabase\.co/)?.[1]

if (!token) {
  console.error('Defina SUPABASE_ACCESS_TOKEN no .env (token pessoal da Management API do Supabase).')
  process.exit(1)
}
if (!projectRef) {
  console.error('Não consegui descobrir o project ref. Defina SUPABASE_PROJECT_REF no .env.')
  process.exit(1)
}

/** Extrai as chaves (nomes de coluna) do objeto literal retornado por uma função,
 *  contando chaves para achar o corpo inteiro da função — funciona para os dois
 *  formatos usados em sync.ts (return { ... } e arrow function ({ ... })). */
function extractObjectKeys(source, fnName) {
  const fnStart = source.indexOf(`function ${fnName}(`)
  if (fnStart === -1) throw new Error(`função ${fnName} não encontrada em sync.ts`)
  const braceStart = source.indexOf('{', fnStart)
  let depth = 0
  let end = -1
  for (let i = braceStart; i < source.length; i++) {
    if (source[i] === '{') depth++
    else if (source[i] === '}') {
      depth--
      if (depth === 0) { end = i; break }
    }
  }
  if (end === -1) throw new Error(`não achei o fim do corpo de ${fnName}`)
  const body = source.slice(braceStart, end)
  const keys = new Set()
  for (const m of body.matchAll(/(?:^|[{,])\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*:/gm)) {
    keys.add(m[1])
  }
  return keys
}

const syncPath = resolve(__dirname, '..', 'src', 'lib', 'sync.ts')
const syncSource = readFileSync(syncPath, 'utf8')

const codeColumns = {
  vehicle_inspections: extractObjectKeys(syncSource, 'inspectionRow'),
  damages: extractObjectKeys(syncSource, 'damageRows'),
}

async function fetchLiveColumns(table) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: `select column_name from information_schema.columns where table_schema = 'public' and table_name = '${table}'`,
    }),
  })
  if (!res.ok) {
    throw new Error(`Falha ao consultar colunas de ${table}: ${res.status} ${await res.text()}`)
  }
  const rows = await res.json()
  return new Set(rows.map((r) => r.column_name))
}

let hasDrift = false
for (const [table, columns] of Object.entries(codeColumns)) {
  const liveColumns = await fetchLiveColumns(table)
  const missing = [...columns].filter((c) => !liveColumns.has(c))
  if (missing.length > 0) {
    hasDrift = true
    console.error(`✗ ${table}: colunas usadas em sync.ts mas ausentes no banco: ${missing.join(', ')}`)
  } else {
    console.log(`✓ ${table}: todas as colunas usadas em sync.ts existem no banco`)
  }
}

if (hasDrift) {
  console.error('\nA sincronização vai falhar em produção. Rode `npm run db:push` ou crie uma migration nova em src/supabase/migrations/.')
  process.exit(1)
}
console.log('\nSchema do banco bate com o que src/lib/sync.ts espera.')
