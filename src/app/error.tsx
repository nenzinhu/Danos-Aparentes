'use client';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Erro na aplicação:', error);
  }, [error]);

  const isChunkError = /ChunkLoadError|Loading chunk|dynamically imported module/i.test(
    error?.message || ''
  );

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center gap-4 bg-[var(--bg-main)] text-[var(--text-main)] px-6 text-center">
      <p className="text-lg font-bold">Algo deu errado.</p>
      <p className="text-sm text-[var(--text-muted)] max-w-md">
        {isChunkError
          ? 'Uma nova versão do app foi publicada. Recarregue a página para continuar.'
          : 'Ocorreu um erro inesperado. Tente novamente ou recarregue a página.'}
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => reset()}
          className="text-sm px-4 py-2 rounded-lg font-bold border border-sky-500/30 bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 transition-all"
        >
          Tentar novamente
        </button>
        <button
          onClick={() => window.location.reload()}
          className="text-sm px-4 py-2 rounded-lg font-bold border border-white/10 bg-white/5 hover:bg-white/10 transition-all"
        >
          Recarregar página
        </button>
      </div>
    </div>
  );
}
