import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve, join } from 'node:path'
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

// supabase/schema.sql é o schema-base (tabelas originais). As migrations reais
// e mais recentes (companies, team_members, plan_tier, sync_errors, triggers de
// validação etc.) vivem em src/supabase/migrations/ — raiz do projeto Supabase
// CLI (tem config.toml). Aplicamos as duas em sequência para que db:push sempre
// deixe o banco no estado atual real, e não só no schema original desatualizado.
const migrationsDir = resolve(__dirname, '..', 'src', 'supabase', 'migrations')

const steps = [
  { label: 'supabase/schema.sql', sql: readFileSync(resolve(__dirname, '..', 'supabase', 'schema.sql'), 'utf8') },
  ...(existsSync(migrationsDir)
    ? readdirSync(migrationsDir)
        .filter((f) => f.endsWith('.sql'))
        .sort()
        .map((f) => ({ label: `src/supabase/migrations/${f}`, sql: readFileSync(join(migrationsDir, f), 'utf8') }))
    : []),
]

const client = new Client({ connectionString: connStr, ssl: { rejectUnauthorized: false } })

try {
  await client.connect()
  for (const step of steps) {
    await client.query(step.sql)
    console.log(`Aplicado: ${step.label}`)
  }
  console.log('Schema aplicado com sucesso no Supabase!')
} catch (err) {
  console.error('Erro ao aplicar schema:', err.message)
  process.exitCode = 1
} finally {
  await client.end()
}
