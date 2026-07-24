'use client';

// Cobre erros lançados no próprio root layout (fora do alcance de error.tsx).
// Não pode depender de globals.css/layout — por isso usa estilo inline.
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pt-BR">
      <body
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          background: '#020617',
          color: '#e8f4ff',
          textAlign: 'center',
          padding: '1.5rem',
          fontFamily: 'sans-serif',
        }}
      >
        <p style={{ fontWeight: 700, fontSize: '1.125rem' }}>Algo deu errado.</p>
        <p style={{ fontSize: '0.875rem', color: '#94a3b8', maxWidth: 420 }}>
          Ocorreu um erro inesperado ao carregar o aplicativo.
        </p>
        <button
          onClick={() => reset()}
          style={{
            fontSize: '0.875rem',
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            fontWeight: 700,
            border: '1px solid rgba(56,189,248,0.3)',
            background: 'rgba(56,189,248,0.1)',
            color: '#38bdf8',
            cursor: 'pointer',
          }}
        >
          Recarregar
        </button>
      </body>
    </html>
  );
}
