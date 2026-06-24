'use client';
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Logo from '../components/Logo'
import { trackCompleteRegistration } from '@/src/lib/analytics/pixels'

interface Props {
  onSignIn: (email: string, password: string) => Promise<void>
  onSignUp: (email: string, password: string) => Promise<void>
  onResetPassword: (email: string) => Promise<void>
}

type Mode = 'login' | 'signup' | 'reset'

export default function Login({ onSignIn, onSignUp, onResetPassword }: Props) {
  const searchParams = useSearchParams()
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (searchParams.get('mode') === 'signup') setMode('signup')
  }, [searchParams])

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
        trackCompleteRegistration()
        setInfo('Conta criada! Seu teste de 7 dias começou. Verifique seu email se necessário.')
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
    <main className="min-h-screen flex items-center justify-center p-6 bg-slate-950 text-slate-100 font-outfit relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" aria-hidden="true" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/10 blur-[120px] rounded-full" aria-hidden="true" />

      <div className="w-full max-w-md bg-slate-900/60 border border-slate-800 rounded-3xl p-8 backdrop-blur-2xl shadow-2xl relative z-10">
        <div className="flex justify-center mb-8">
          <div className="p-3 bg-slate-800/50 rounded-2xl border border-slate-700/50 shadow-inner">
            <Logo size={42} />
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-black tracking-tight mb-2">
            {mode === 'login' && 'Bem-vindo de volta'}
            {mode === 'signup' && 'Começar agora'}
            {mode === 'reset' && 'Recuperar acesso'}
          </h1>
          <p className="text-slate-400 text-sm font-medium">
            {mode === 'login' && 'Acesse suas vistorias de qualquer lugar'}
            {mode === 'signup' && 'Crie sua conta em poucos segundos'}
            {mode === 'reset' && 'Enviaremos as instruções por email'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" aria-label="Formulário de autenticação">
          <div className="space-y-1.5">
            <label htmlFor="login-email" className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Email</label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="seu@email.com"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-slate-950/50 border border-slate-800 text-slate-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-600"
            />
          </div>

          {mode !== 'reset' && (
            <div className="space-y-1.5">
              <div className="flex justify-between items-end">
                <label htmlFor="login-password" className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Senha</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => { setMode('reset'); setError(''); setInfo('') }}
                    className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors"
                    aria-label="Esqueceu a senha? Recuperar acesso"
                  >
                    Esqueceu?
                  </button>
                )}
              </div>
              <input
                id="login-password"
                type="password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                placeholder="••••••••"
                required
                minLength={6}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-800 text-slate-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-600"
              />
            </div>
          )}

          {error && (
            <div role="alert" className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs py-2.5 px-3 rounded-lg flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" aria-hidden="true" />
              {error}
            </div>
          )}
          {info && (
            <div role="status" className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs py-2.5 px-3 rounded-lg flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
              {info}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            aria-busy={busy}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:opacity-50 text-white font-bold text-sm py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] mt-2"
          >
            {busy ? 'Processando...' : mode === 'login' ? 'Entrar na plataforma' : mode === 'signup' ? 'Criar minha conta' : 'Enviar link de recuperação'}
          </button>
        </form>

        <nav className="mt-8 pt-6 border-t border-slate-800 flex justify-center text-sm font-medium" aria-label="Alternar modo de autenticação">
          {mode === 'login' ? (
            <p className="text-slate-400">
              Não tem uma conta?{' '}
              <button
                onClick={() => { setMode('signup'); setError(''); setInfo('') }}
                className="text-blue-400 hover:text-blue-300 font-bold"
              >
                Cadastre-se
              </button>
            </p>
          ) : (
            <button
              onClick={() => { setMode('login'); setError(''); setInfo('') }}
              className="text-slate-400 hover:text-slate-300 flex items-center gap-2"
            >
              ← Voltar para o login
            </button>
          )}
        </nav>
      </div>
    </main>
  )
}
