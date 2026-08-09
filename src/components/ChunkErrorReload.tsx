'use client';
import { useEffect } from 'react';

const RELOAD_FLAG_KEY = 'chunk-reload-attempted';

// Chunks de import dinâmico (ex: os SVGs de veículo em vehicleRegistry) ficam
// 404 quando um novo deploy substitui os arquivos referenciados por uma aba
// que já estava aberta. Detecta esse erro e recarrega uma única vez por aba —
// evita loop infinito se o problema persistir após o reload.
function isChunkLoadError(message: string | undefined | null): boolean {
  if (!message) return false;
  return /ChunkLoadError|Loading chunk [\w-]+ failed|Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed/i.test(
    message
  );
}

export default function ChunkErrorReload() {
  useEffect(() => {
    const reloadOnce = () => {
      try {
        if (sessionStorage.getItem(RELOAD_FLAG_KEY)) return;
        sessionStorage.setItem(RELOAD_FLAG_KEY, '1');
      } catch {
        // sessionStorage indisponível (modo privado/bloqueado) — recarrega sem guarda.
      }
      window.location.reload();
    };

    const handleError = (event: ErrorEvent) => {
      if (isChunkLoadError(event.message) || isChunkLoadError(event.error?.message)) {
        reloadOnce();
      }
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const message = typeof reason === 'string' ? reason : reason?.message;
      if (isChunkLoadError(message)) reloadOnce();
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  return null;
}
