import { useState } from 'react'
import Logo from '../components/Logo'

interface Props {
  onSignIn: (email: string, password: string) => Promise<void>
  onSignUp: (email: string, password: string) => Promise<void>
  onResetPassword: (email: string) => Promise<void>
}

type Mode = 'login' | 'signup' | 'reset'

const inputStyle: React.CSSProperties = {
  background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--input-color)',
  borderRadius: 8, padding: '10px 14px', fontFamily: 'Outfit,sans-serif', fontSize: '0.9rem',
  width: '100%', outline: 'none',
}

export default function Login({ onSignIn, onSignUp, onResetPassword }: Props) {
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setInfo('')
    setBusy(true)
    try {
      if (mode === 'login') {
        await onSignIn(email, password)
      } else if (mode === 'signup') {
        await onSignUp(email, password)
        setInfo('Conta criada! Verifique seu email para confirmar (se exigido) e faça login.')
        setMode('login')
      } else {
        await onResetPassword(email)
        setInfo('Email de recuperação enviado, se a conta existir.')
        setMode('login')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Algo deu errado.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'var(--text-main)', fontFamily: 'Outfit,sans-serif', padding: 20,
    }}>
      <div style={{
        width: '100%', maxWidth: 380, background: 'var(--card-bg)', border: '1px solid var(--card-border)',
        borderRadius: 20, padding: 32, backdropFilter: 'blur(18px)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <Logo size={36} />
        </div>

        <h1 style={{ fontSize: '1.1rem', fontWeight: 800, textAlign: 'center', marginBottom: 6 }}>
          {mode === 'login' && 'Entrar'}
          {mode === 'signup' && 'Criar conta'}
          {mode === 'reset' && 'Recuperar senha'}
        </h1>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: 22 }}>
          {mode === 'login' && 'Acesse suas vistorias de qualquer dispositivo'}
          {mode === 'signup' && 'Leva menos de um minuto'}
          {mode === 'reset' && 'Enviaremos um link para o seu email'}
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            type="email" placeholder="Email" required value={email}
            onChange={e => setEmail(e.target.value)} style={inputStyle}
          />
          {mode !== 'reset' && (
            <input
              type="password" placeholder="Senha" required minLength={6} value={password}
              onChange={e => setPassword(e.target.value)} style={inputStyle}
            />
          )}

          {error && <div style={{ color: '#ef4444', fontSize: '0.8rem' }}>{error}</div>}
          {info && <div style={{ color: '#22c55e', fontSize: '0.8rem' }}>{info}</div>}

          <button type="submit" disabled={busy} style={{
            background: '#00aaff', color: '#02101e', fontWeight: 800, fontSize: '0.9rem',
            padding: '11px 0', borderRadius: 8, border: 'none', cursor: busy ? 'default' : 'pointer',
            fontFamily: 'Outfit,sans-serif', opacity: busy ? 0.7 : 1, marginTop: 4,
          }}>
            {busy ? 'Aguarde...' : mode === 'login' ? 'Entrar' : mode === 'signup' ? 'Criar conta' : 'Enviar link'}
          </button>
        </form>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 18, fontSize: '0.78rem' }}>
          {mode === 'login' ? (
            <>
              <span style={{ color: '#00aaff', cursor: 'pointer' }} onClick={() => { setMode('signup'); setError(''); setInfo('') }}>Criar conta</span>
              <span style={{ color: 'var(--text-muted)', cursor: 'pointer' }} onClick={() => { setMode('reset'); setError(''); setInfo('') }}>Esqueci a senha</span>
            </>
          ) : (
            <span style={{ color: '#00aaff', cursor: 'pointer' }} onClick={() => { setMode('login'); setError(''); setInfo('') }}>← Voltar para login</span>
          )}
        </div>
      </div>
    </div>
  )
}
