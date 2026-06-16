import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

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

const projectUrl = env.VITE_SUPABASE_URL
const accessToken = env.SUPABASE_ACCESS_TOKEN
const siteUrl = env.SUPABASE_SITE_URL || 'http://localhost:5173/app.html'

if (!projectUrl) {
  console.error('VITE_SUPABASE_URL nao encontrado no .env.')
  process.exitCode = 1
} else if (!accessToken) {
  console.error('SUPABASE_ACCESS_TOKEN nao encontrado no .env.')
  console.error('Gere um Personal Access Token em: https://supabase.com/dashboard/account/tokens')
  process.exitCode = 1
} else {
  const ref = new URL(projectUrl).hostname.split('.')[0]

  async function patchConfig(body, label) {
    const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/config/auth`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const text = await res.text()
      console.error(`Erro ${res.status} ao ${label}:`, text)
      return false
    }
    console.log(`OK: ${label}`)
    return true
  }

  const okUrl = await patchConfig(
    { site_url: siteUrl, uri_allow_list: siteUrl },
    'configurar Site URL / Redirect URL'
  )

  const okTemplate = await patchConfig(
    {
      mailer_subjects_confirmation: 'Confirme seu cadastro - Vistoria+',
      mailer_templates_confirmation_content: `<h2>Vistoria+</h2>
<p>Ola! Confirme seu cadastro para acessar suas vistorias de qualquer dispositivo.</p>
<p><a href="{{ .ConfirmationURL }}">Confirmar meu e-mail</a></p>
<p>Se voce nao criou essa conta, ignore este e-mail.</p>`,
    },
    'personalizar template do e-mail'
  )

  if (!okTemplate) {
    console.log('')
    console.log('O template de e-mail so pode ser customizado com um provedor SMTP proprio')
    console.log('(Authentication > Email Templates exige SMTP customizado no plano gratuito).')
    console.log('A Site URL/Redirect URL foi aplicada normalmente, entao o link de confirmacao')
    console.log('ja deve levar para o app certo mesmo com o e-mail padrao do Supabase.')
  }

  if (!okUrl && !okTemplate) process.exitCode = 1
}
