'use client'
import React from 'react'

interface Props {
  children: React.ReactNode
  /** Texto amigável exibido ao usuário (sem expor stack trace). */
  message?: string
  /** Ação do botão (além de limpar o erro). Default: recarrega a página. */
  onReset?: () => void
  fallback?: React.ReactNode
}

interface State {
  hasError: boolean
}

// Suspense só cobre o estado "carregando"; se a promise do import dinâmico
// rejeitar (chunk falhou) ou qualquer render lançar, o erro precisa de um
// Error Boundary de verdade para não derrubar a árvore inteira sem fallback.
export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    // Telemetria silenciosa — nunca expor o stack trace ao usuário.
    console.error('ErrorBoundary capturou um erro:', error)
  }

  private handleReset = () => {
    this.setState({ hasError: false })
    this.props.onReset?.()
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 min-h-[220px] text-center px-4">
          <p className="text-sm font-bold text-[var(--text-main)]">Algo deu errado</p>
          <p className="text-[0.8rem] text-[var(--text-muted)] max-w-[34ch] leading-relaxed">
            {this.props.message ?? 'Ocorreu um erro inesperado ao carregar esta parte do aplicativo. Seus dados locais estão seguros.'}
          </p>
          <button
            type="button"
            onClick={this.handleReset}
            className="text-xs px-4 py-2 rounded-lg font-bold border border-sky-500/30 bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 transition-all"
          >
            Tentar novamente
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
