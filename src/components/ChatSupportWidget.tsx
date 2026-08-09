'use client';
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import Button from './ui/Button';
import ChatMascotFab, { ChatMascotAvatar } from './ChatMascotFab';
import { type ChatSupportSegment } from '../content/chatSupportKnowledge';
import { getChatIntents, HOME_WELCOME, type ChatIntent } from '../content/chatSupportIntents';
import {
  OPEN_CHAT_SUPPORT_EVENT,
  chatSupportWhatsappLink,
  type ChatEscalateKind,
  type OpenChatSupportDetail,
} from '../lib/chatSupportWhatsapp';
import gsap from 'gsap';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  escalate?: boolean;
  escalateKind?: ChatEscalateKind;
}

interface Props {
  segment: ChatSupportSegment;
  /** Empurra o FAB para cima do sticky CTA mobile da home. */
  liftAboveMobileSticky?: boolean;
}

function WhatsAppEscalateButtons({
  segment,
  kind,
}: {
  segment: ChatSupportSegment;
  kind?: ChatEscalateKind | null;
}) {
  if (kind === 'support') {
    return (
      <a
        href={chatSupportWhatsappLink(segment, 'support')}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-white bg-[var(--whatsapp-color)] hover:bg-[var(--whatsapp-hover)] transition-colors"
      >
        Falar com suporte no WhatsApp
      </a>
    );
  }
  if (kind === 'sales') {
    return (
      <a
        href={chatSupportWhatsappLink(segment, 'sales')}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-white bg-[var(--whatsapp-color)] hover:bg-[var(--whatsapp-hover)] transition-colors"
      >
        Falar com vendas no WhatsApp
      </a>
    );
  }
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      <a
        href={chatSupportWhatsappLink(segment, 'support')}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-white bg-[var(--whatsapp-color)] hover:bg-[var(--whatsapp-hover)] transition-colors"
      >
        Suporte no WhatsApp
      </a>
      <a
        href={chatSupportWhatsappLink(segment, 'sales')}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border border-[var(--whatsapp-color)] text-[var(--whatsapp-color)] hover:bg-[var(--whatsapp-color)]/10 transition-colors"
      >
        Vendas no WhatsApp
      </a>
    </div>
  );
}

export default function ChatSupportWidget({ segment, liftAboveMobileSticky = false }: Props) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const intents = getChatIntents(segment);
  const welcome = segment === 'home' ? HOME_WELCOME : undefined;
  const [attention, setAttention] = useState(false);

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    if (!panel) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(panel, { autoAlpha: 1, y: 0, scale: 1 });
      return;
    }
    gsap.fromTo(
      panel,
      { autoAlpha: 0, y: 22, scale: 0.94 },
      { autoAlpha: 1, y: 0, scale: 1, duration: 0.42, ease: 'back.out(1.45)' },
    );
  }, [open]);

  function scrollToBottom() {
    requestAnimationFrame(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
    });
  }

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      const nextHistory: ChatMessage[] = [...messages, { role: 'user', content: trimmed }];
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
            history: nextHistory.map((m) => ({ role: m.role, content: m.content })),
          }),
        });

        if (!res.ok) {
          setError(true);
          return;
        }

        const data = await res.json();
        const escalateKind = (data.escalateKind as ChatEscalateKind | undefined) ?? (data.escalate ? 'generic' : undefined);
        if (data.escalate) setAttention(true);
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: data.response,
            escalate: !!data.escalate,
            escalateKind,
          },
        ]);
      } catch {
        setError(true);
        setAttention(true);
      } finally {
        setLoading(false);
        scrollToBottom();
      }
    },
    [loading, messages, segment],
  );

  function handleDirectEscalate(intent: ChatIntent) {
    const kind = intent.escalateKind === 'sales' ? 'sales' : 'support';
    const reply =
      kind === 'sales'
        ? 'Perfeito — a equipe de vendas atende pelo WhatsApp. Escolha o botão abaixo para continuar com o número oficial.'
        : 'Certo — o suporte humano atende pelo WhatsApp. Escolha o botão abaixo para continuar com o número oficial.';
    setAttention(true);
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: intent.prompt },
      { role: 'assistant', content: reply, escalate: true, escalateKind: kind },
    ]);
    scrollToBottom();
  }

  function handleChip(intent: ChatIntent) {
    setOpen(true);
    if (intent.escalateKind) {
      handleDirectEscalate(intent);
      return;
    }
    void sendMessage(intent.prompt);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await sendMessage(input);
  }

  useEffect(() => {
    function onOpen(ev: Event) {
      const detail = (ev as CustomEvent<OpenChatSupportDetail>).detail ?? {};
      if (detail.segment && detail.segment !== segment) return;
      setOpen(true);
      if (detail.intent === 'vendas') {
        const intent = intents.find((i) => i.id === 'vendas');
        if (intent) handleDirectEscalate(intent);
      } else if (detail.intent === 'suporte') {
        const intent = intents.find((i) => i.id === 'suporte');
        if (intent) handleDirectEscalate(intent);
      } else if (detail.intent === 'planos') {
        const intent = intents.find((i) => i.id === 'planos');
        if (intent) void sendMessage(intent.prompt);
      }
    }
    window.addEventListener(OPEN_CHAT_SUPPORT_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_CHAT_SUPPORT_EVENT, onOpen);
    // intents/sendMessage estáveis o bastante para o ciclo de vida do widget
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segment]);

  const fabBottom = liftAboveMobileSticky
    ? 'bottom-[calc(5.25rem+env(safe-area-inset-bottom))] md:bottom-5'
    : 'bottom-5';

  return (
    <div className={`fixed ${fabBottom} right-5 z-[99990] flex flex-col items-end gap-3`}>
      {open && (
        <div
          ref={panelRef}
          className="w-[min(380px,calc(100vw-2.5rem))] max-h-[min(70vh,560px)] flex flex-col glass-card border border-[var(--card-border)]/50 rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-[var(--card-border)]/40">
            <div className="flex items-center gap-2.5 min-w-0">
              <ChatMascotAvatar />
              <div className="min-w-0">
                <p className="text-sm font-bold text-[var(--text-main)] truncate">Equipe Danos Aparentes</p>
                <p className="text-[11px] text-[var(--text-muted)]">Dúvidas, suporte e vendas</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fechar chat"
              className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors text-lg leading-none shrink-0"
            >
              ×
            </button>
          </div>

          <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3 min-h-[180px]">
            {messages.length === 0 && (
              <div className="space-y-3">
                <div className="flex items-start gap-2.5">
                  <ChatMascotAvatar className="mt-0.5" />
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed pt-1">
                    {welcome ??
                      'Olá! Sou a Equipe Danos Aparentes. Pergunte sobre preço, como funciona a vistoria, QR Code/hash, funcionamento offline ou white-label.'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5" role="group" aria-label="Perguntas sugeridas">
                  {intents.map((intent) => (
                    <button
                      key={intent.id}
                      type="button"
                      disabled={loading}
                      onClick={() => handleChip(intent)}
                      className="rounded-full border border-[var(--card-border)]/70 bg-[var(--bg-main)]/40 px-2.5 py-1 text-[11px] font-bold text-[var(--text-main)] hover:border-[var(--primary)]/50 hover:text-[var(--primary)] transition-colors disabled:opacity-50"
                    >
                      {intent.label}
                    </button>
                  ))}
                </div>
              </div>
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
                  <WhatsAppEscalateButtons segment={segment} kind={m.escalateKind} />
                )}
              </div>
            ))}
            {error && (
              <div className="self-start max-w-[85%]">
                <div className="rounded-xl px-3 py-2 text-sm bg-[var(--btn-secondary-bg)] text-[var(--text-main)] border border-[var(--btn-secondary-border)]">
                  Não consegui responder agora.
                </div>
                <WhatsAppEscalateButtons segment={segment} kind="error" />
              </div>
            )}
            {messages.length > 0 && !loading && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {intents
                  .filter((i) => i.escalateKind)
                  .map((intent) => (
                    <button
                      key={`again-${intent.id}`}
                      type="button"
                      onClick={() => handleChip(intent)}
                      className="rounded-full border border-[var(--card-border)]/60 px-2.5 py-1 text-[10px] font-bold text-[var(--text-muted)] hover:text-[var(--primary)] hover:border-[var(--primary)]/40 transition-colors"
                    >
                      {intent.label}
                    </button>
                  ))}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex items-center gap-2 p-3 border-t border-[var(--card-border)]/40">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
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

      <ChatMascotFab
        open={open}
        attention={attention && !open}
        onToggle={() => {
          setOpen((v) => {
            if (v) setAttention(false);
            return !v;
          });
        }}
      />
    </div>
  );
}
