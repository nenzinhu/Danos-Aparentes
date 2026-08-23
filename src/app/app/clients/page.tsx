'use client';
import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useClients, type ClientRecord } from '@/src/hooks/useClients';
import { IconCar, IconDocument, IconSearch, IconEraser } from '@/src/components/ui/AnimatedIcons';

const FILL_KEY = 'da_fill_client_id';

export default function ClientsPage({ userId }: { userId?: string }) {
  const router = useRouter();
  const { clients, loading, remove } = useClients(userId);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toUpperCase();
    if (!q) return clients;
    return clients.filter(
      (c) =>
        c.owner.toUpperCase().includes(q) ||
        c.plate.toUpperCase().includes(q) ||
        c.brand.toUpperCase().includes(q) ||
        c.phone.includes(q),
    );
  }, [clients, query]);

  const useClient = (c: ClientRecord) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(FILL_KEY, c.id);
    }
    router.push('/app');
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="font-display text-2xl font-extrabold tracking-tight text-[var(--text-main)]">
            Clientes & Veículos
          </h2>
          <p className="text-sm text-[var(--text-muted)]">
            Cadastro reutilizável — pré-preenche inspeções em 1 clique.
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
            <IconSearch size={15} />
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar nome, placa, marca..."
            className="w-full rounded-xl border border-[var(--btn-secondary-border)] bg-[var(--bg-main)]/60 pl-9 pr-3 py-2.5 text-sm text-[var(--text-main)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/30"
          />
        </div>
      </div>

      {loading ? (
        <p className="text-[var(--text-muted)] text-sm">Carregando...</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--panel-bg)] p-10 text-center backdrop-blur-md">
          <IconCar size={36} className="mx-auto text-[var(--primary)]" />
          <p className="mt-3 font-bold text-[var(--text-main)]">
            {clients.length === 0 ? 'Nenhum cliente cadastrado ainda' : 'Nenhum resultado'}
          </p>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            {clients.length === 0
              ? 'Na tela de inspeção, use “Salvar” para registrar cliente + veículo.'
              : 'Tente outro termo de busca.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((c) => (
            <div
              key={c.id}
              className="rounded-2xl border border-[var(--card-border)] bg-[var(--panel-bg)] p-4 backdrop-blur-md flex flex-col gap-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-bold text-[var(--text-main)] truncate">{c.owner || '—'}</p>
                  <p className="text-[0.72rem] text-[var(--text-muted)] truncate">{c.phone || 'sem telefone'}</p>
                </div>
                <button
                  type="button"
                  onClick={() => remove(c.id)}
                  title="Remover"
                  className="shrink-0 rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-red-500/10 hover:text-red-400 transition-colors"
                >
                  <IconEraser size={15} />
                </button>
              </div>
              <div className="rounded-xl bg-[var(--bg-main)]/50 p-3 text-[0.78rem] space-y-1">
                <p>
                  <span className="text-[var(--text-muted)]">Placa:</span>{' '}
                  <span className="font-bold text-[var(--text-main)]">{c.plate || '—'}</span>
                </p>
                <p>
                  <span className="text-[var(--text-muted)]">Veículo:</span>{' '}
                  <span className="text-[var(--text-main)]">
                    {[c.brand, c.color, c.ano].filter(Boolean).join(' · ') || '—'}
                  </span>
                </p>
                {(c.city || c.state) && (
                  <p className="text-[var(--text-muted)]">
                    {[c.city, c.state].filter(Boolean).join(' / ')}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => useClient(c)}
                className="mt-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-[var(--primary)]/20 transition-opacity hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-main)]"
                style={{ backgroundImage: 'var(--primary-btn-gradient)' }}
              >
                <IconDocument size={15} /> Usar em nova inspeção
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
