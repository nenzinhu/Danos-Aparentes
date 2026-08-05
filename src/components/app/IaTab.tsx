'use client';
import React, { useState, useEffect, useRef } from 'react';
import { VehicleInfo, Damage, VehicleType } from '@/src/types';

interface IaTabProps {
  vehicleInfo: VehicleInfo;
  damages: Damage[];
  vehicleType: VehicleType;
  onToast: (msg: string) => void;
  accessToken?: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const VEHICLE_NAME: Record<VehicleType, string> = {
  car: 'Automóvel',
  car2d: 'Carro (2/3 Portas)',
  moto: 'Motocicleta',
  motoneta: 'Motoneta',
  truck: 'Caminhão',
  van: 'Van / Utilitário',
  bus: 'Ônibus',
  microbus: 'Micro-ônibus',
  custom: 'Outro'
};

export default function IaTab({ vehicleInfo, damages, vehicleType, onToast, accessToken }: IaTabProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize with a welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const vehicleDesc = vehicleInfo.brand 
        ? vehicleInfo.brand
        : VEHICLE_NAME[vehicleType];

      const dmgCount = damages.length;
      const initialText = `Olá! Sou seu Assistente IA. Estou pronto para ajudar com a vistoria do **${vehicleDesc}** (Placa: ${vehicleInfo.plate || 'Não informada'}). 
      
      Até o momento, identifiquei **${dmgCount}** ${dmgCount === 1 ? 'avaria registrada' : 'avarias registradas'}. 
      
      Como posso te ajudar hoje? Você pode usar um dos botões rápidos abaixo ou digitar sua dúvida.`;

      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: initialText,
          timestamp: new Date()
        }
      ]);
    }
  }, [vehicleInfo, damages, vehicleType]);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Envia todo o histórico (sem o id/timestamp para compatibilidade com o backend)
      const history = [...messages, userMsg].map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch('/api/ia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          messages: history,
          vehicleInfo,
          damages,
          vehicleType
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Erro ao obter resposta da IA');
      }

      const data = await res.json();

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      }]);
    } catch (err) {
      console.error(err);
      onToast('❌ Ocorreu um erro ao falar com o Assistente IA.');
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `⚠️ **Erro de Conexão:** Não foi possível obter resposta da Inteligência Artificial. Por favor, verifique se a chave \`GEMINI_API_KEY\` está corretamente configurada no arquivo \`.env\` do projeto.\n\n*Detalhes do erro: ${err instanceof Error ? err.message : 'Erro Desconhecido'}*`,
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (actionType: 'diagnostic' | 'obs' | 'repair') => {
    let prompt = '';
    if (actionType === 'diagnostic') {
      prompt = 'Por favor, gere um diagnóstico executivo e resumo técnico sobre esta vistoria.';
    } else if (actionType === 'obs') {
      prompt = 'Me dê sugestões de textos formais e descrições técnicas de observação para incluir nas notas desse laudo.';
    } else if (actionType === 'repair') {
      prompt = 'Com base nas peças danificadas e gravidades relatadas, quais são os tipos de reparos automotivos indicados? (funilaria, retoque, substituição, martelinho, etc.)';
    }
    handleSend(prompt);
  };

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-300">
      
      {/* Top Banner / Status */}
      <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-5 flex flex-wrap justify-between items-center gap-4 backdrop-blur-md">
        <div>
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <span className="text-xl">🤖</span> Assistente IA Interativo
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Analisando em tempo real os dados da vistoria ativa para auxiliar na geração do laudo.
          </p>
        </div>

        {/* Badge do Veículo Atual */}
        <div className="flex items-center gap-3 bg-slate-950/60 border border-white/5 rounded-xl px-4 py-2 text-xs">
          <div className="text-slate-400">
            Veículo: <span className="font-bold text-sky-400">{vehicleInfo.brand || VEHICLE_NAME[vehicleType]}</span>
          </div>
          <div className="w-px h-4 bg-white/10" />
          <div className="text-slate-400">
            Avarias: <span className="font-bold text-rose-400">{damages.length}</span>
          </div>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="bg-slate-900/40 border border-white/5 rounded-3xl flex flex-col overflow-hidden h-[600px] backdrop-blur-lg">
        
        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 scrollbar-thin scrollbar-thumb-white/5 scrollbar-track-transparent">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col max-w-[85%] ${
                m.role === 'user' ? 'self-end items-end' : 'self-start items-start'
              }`}
            >
              {/* Message Header */}
              <span className="text-[10px] text-slate-500 font-mono-data mb-1 px-1">
                {m.role === 'user' ? 'Você' : 'Assistente IA'} · {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>

              {/* Message Bubble */}
              <div
                className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-tr-none shadow-lg shadow-sky-500/10'
                    : 'bg-slate-900 border border-white/5 text-slate-200 rounded-tl-none shadow-md'
                }`}
              >
                {/* Parse basic markdown (bold, bullet points) */}
                {m.content.split('\n').map((line, i) => {
                  let renderedLine = line;
                  // Handle bullet points
                  const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('* ');
                  if (isBullet) {
                    renderedLine = line.replace(/^[\s\-\*]+/, '• ');
                  }

                  // Handle basic bold syntax (**text**)
                  const boldRegex = /\*\*(.*?)\*\*/g;
                  const parts = [];
                  let lastIndex = 0;
                  let match;

                  while ((match = boldRegex.exec(renderedLine)) !== null) {
                    if (match.index > lastIndex) {
                      parts.push(renderedLine.substring(lastIndex, match.index));
                    }
                    parts.push(<strong key={match.index} className="font-extrabold text-white">{match[1]}</strong>);
                    lastIndex = boldRegex.lastIndex;
                  }
                  
                  if (lastIndex < renderedLine.length) {
                    parts.push(renderedLine.substring(lastIndex));
                  }

                  return (
                    <div key={i} className={`${isBullet ? 'pl-2' : ''} ${line.trim() === '' ? 'h-3' : ''}`}>
                      {parts.length > 0 ? parts : renderedLine}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {loading && (
            <div className="self-start flex flex-col items-start max-w-[85%] animate-pulse">
              <span className="text-[10px] text-slate-500 font-mono-data mb-1">
                Assistente IA escrevendo...
              </span>
              <div className="bg-slate-900 border border-white/5 text-slate-400 rounded-2xl rounded-tl-none px-5 py-3 text-sm flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Quick Actions Panel */}
        <div className="px-6 py-3 bg-slate-900/60 border-t border-white/5 flex flex-wrap gap-2 items-center">
          <span className="text-[10px] font-mono-data text-slate-500 mr-2">AÇÕES RÁPIDAS:</span>
          <button
            onClick={() => handleQuickAction('diagnostic')}
            disabled={loading}
            className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-white/5 text-slate-300 hover:text-white rounded-lg text-xs font-semibold font-outfit transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            📊 Diagnóstico Geral
          </button>
          <button
            onClick={() => handleQuickAction('obs')}
            disabled={loading}
            className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-white/5 text-slate-300 hover:text-white rounded-lg text-xs font-semibold font-outfit transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            ✍️ Sugerir Obs
          </button>
          <button
            onClick={() => handleQuickAction('repair')}
            disabled={loading}
            className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-white/5 text-slate-300 hover:text-white rounded-lg text-xs font-semibold font-outfit transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            🔧 Tipos de Reparo
          </button>
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
          className="p-4 bg-slate-950/80 border-t border-white/5 flex gap-2 items-center"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pergunte sobre as avarias, peça dicas de reparo ou textos para o laudo..."
            disabled={loading}
            className="flex-1 bg-slate-900 border border-white/5 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500/50 transition-all font-outfit"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="h-11 w-11 bg-sky-500 hover:bg-sky-400 text-white rounded-xl flex items-center justify-center transition-all disabled:opacity-40 disabled:hover:bg-sky-500 cursor-pointer"
            title="Enviar mensagem"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
            </svg>
          </button>
        </form>

      </div>

    </div>
  );
}
