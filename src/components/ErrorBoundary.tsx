'use client';
import React from 'react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
}

// Suspense só cobre o estado "carregando"; se a promise do import dinâmico
// rejeitar (chunk falhou), o erro precisa de um Error Boundary de verdade
// pra não derrubar a árvore inteira sem fallback.
export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('ErrorBoundary capturou um erro:', error);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 min-h-[220px] text-center px-4">
          <p className="text-sm text-[var(--text-muted)]">Não foi possível carregar o diagrama.</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="text-xs px-4 py-2 rounded-lg font-bold border border-sky-500/30 bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 transition-all"
          >
            Recarregar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
