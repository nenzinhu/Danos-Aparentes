'use client';
import { useRef, useState, type FormEvent } from 'react';
import Button from './ui/Button';
import { whatsappLink } from '../lib/whatsapp';
import { SEGMENT_LABELS, type ChatSupportSegment } from '../content/chatSupportKnowledge';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  escalate?: boolean;
}

interface Props {
  segment: ChatSupportSegment;
}

function escalateWhatsappLink(segment: ChatSupportSegment) {
  const label = SEGMENT_LABELS[segment];
  return whatsappLink(
    `Olá! Estava no chat do site perguntando sobre ${label} e gostaria de continuar por aqui.`,
  );
}

export default function ChatSupportWidget({ segment }: Props) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  function scrollToBottom() {
    requestAnimationFrame(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const nextHistory: ChatMessage[] = [...messages, { role: 'user', content: text }];
    setMessages(nextHistory);
    setInput('');
    setError(false);
    setLoading(true);
    scrollToBottom();

    try {
      const res = await fetch('/api/chat-support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          segment,
          history: nextHistory.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) {
        setError(true);
        return;
      }

      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.response, escalate: !!data.escalate }]);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="w-[min(360px,calc(100vw-2.5rem))] max-h-[70vh] flex flex-col glass-card border border-[var(--card-border)]/50 rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--card-border)]/40">
            <p className="text-sm font-bold text-[var(--text-main)]">Tire suas dúvidas</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fechar chat"
              className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors text-lg leading-none"
            >
              ×
            </button>
          </div>

          <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3 min-h-[180px]">
            {messages.length === 0 && (
              <p className="text-xs text-[var(--text-muted)]">
                Pergunte sobre preço, como funciona a vistoria, QR Code/hash, funcionamento offline ou white-label.
              </p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={m.role === 'user' ? 'self-end max-w-[85%]' : 'self-start max-w-[85%]'}>
                <div
                  className={
                    m.role === 'user'
                      ? 'rounded-xl px-3 py-2 text-sm bg-primary text-white'
                      : 'rounded-xl px-3 py-2 text-sm bg-[var(--btn-secondary-bg)] text-[var(--text-main)] border border-[var(--btn-secondary-border)]'
                  }
                >
                  {m.content}
                </div>
                {m.role === 'assistant' && m.escalate && (
                  <a
                    href={escalateWhatsappLink(segment)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-white bg-[var(--whatsapp-color)] hover:bg-[var(--whatsapp-hover)] transition-colors"
                  >
                    Falar com o Jeferson no WhatsApp
                  </a>
                )}
              </div>
            ))}
            {error && (
              <div className="self-start max-w-[85%]">
                <div className="rounded-xl px-3 py-2 text-sm bg-[var(--btn-secondary-bg)] text-[var(--text-main)] border border-[var(--btn-secondary-border)]">
                  Não consegui responder agora.
                </div>
                <a
                  href={escalateWhatsappLink(segment)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-white bg-[var(--whatsapp-color)] hover:bg-[var(--whatsapp-hover)] transition-colors"
                >
                  Falar com o Jeferson no WhatsApp
                </a>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex items-center gap-2 p-3 border-t border-[var(--card-border)]/40">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Digite sua pergunta..."
              disabled={loading}
              className="flex-1 rounded-xl px-3 py-2 text-sm bg-[var(--btn-secondary-bg)] border border-[var(--btn-secondary-border)] text-[var(--text-main)] outline-none focus-visible:ring-2 ring-[var(--primary)]"
            />
            <Button type="submit" variant="primary" size="sm" loading={loading} disabled={!input.trim()}>
              Enviar
            </Button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-label={open ? 'Fechar chat de suporte' : 'Abrir chat de suporte'}
        className="w-14 h-14 rounded-full bg-primary hover:bg-primary-hover text-white shadow-xl shadow-[var(--primary)]/25 flex items-center justify-center transition-transform motion-safe:hover:-translate-y-0.5 focus-visible:ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-[var(--bg-main)] outline-none"
      >
        {open ? (
          <span className="text-2xl leading-none">×</span>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
    </div>
  );
}
