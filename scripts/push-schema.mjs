import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { Client } from 'pg'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(__dirname, '..', '.env')

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

const env = { ...loadEnv(envPath), ...process.env }
const connStr = env.SUPABASE_DB_URL

if (!connStr || connStr.includes('SUA-SENHA') || connStr.includes('SEU-PROJETO')) {
  console.error('Defina SUPABASE_DB_URL no arquivo .env com a connection string real do Supabase.')
  console.error('Pegue em: Project Settings > Database > Connection string (URI).')
  process.exit(1)
}

const schemaPath = resolve(__dirname, '..', 'supabase', 'schema.sql')
const sql = readFileSync(schemaPath, 'utf8')

const client = new Client({ connectionString: connStr, ssl: { rejectUnauthorized: false } })

try {
  await client.connect()
  await client.query(sql)
  console.log('Schema aplicado com sucesso no Supabase!')
} catch (err) {
  console.error('Erro ao aplicar schema:', err.message)
  process.exitCode = 1
} finally {
  await client.end()
}
