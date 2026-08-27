'use client';

import { Component, type ReactNode } from 'react';
import type { AppError } from '@/src/lib/types';

type Props = {
  fallback?: ReactNode;
  children: ReactNode;
  onError?: (error: Error) => void;
};

type State = {
  error: AppError | null;
};

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return {
      error: {
        kind: 'unknown',
        message: error.message,
        cause: error.cause,
        context: {},
      },
    };
  }

  componentDidCatch(error: Error, info: { componentStack?: string }) {
    this.props.onError?.(error);
    console.error('[AppErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="rounded-2xl border border-[var(--severity-high)]/30 bg-[var(--severity-high)]/5 p-6 text-center">
          <p className="text-sm font-bold text-[var(--severity-high)]">Algo saiu do esperado.</p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            {this.state.error.message}
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
