'use client';
import { useState } from 'react'

interface Props {
  isOpen: boolean
  onClose: () => void
}

const STEPS = [
  {
    icon: '📋',
    title: 'Dados do cliente e placa',
    text: 'Comece pelo cliente. Depois consulte a placa — os dados do veículo preenchem sozinhos. No computador, use “Salvar prévia” para continuar no celular.',
  },
  {
    icon: '🚗',
    title: 'Marque as avarias no diagrama',
    text: 'Clique nas peças do SVG para registrar danos. Sem avarias? Siga mesmo assim para o laudo.',
  },
  {
    icon: '✍️',
    title: 'Assine e capture o GPS',
    text: 'Na aba Laudo, revise as avarias, capture a localização do local e colete as assinaturas.',
  },
  {
    icon: '📄',
    title: 'Gere o PDF',
    text: 'Exporte o laudo com hash, QR Code e GPS do local da vistoria.',
  },
]

export default function InspectionCoachMarks({ isOpen, onClose }: Props) {
  const [step, setStep] = useState(0)

  if (!isOpen) return null

  const isLast = step === STEPS.length - 1
  const current = STEPS[step]

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Guia rápido da primeira vistoria"
      className="fixed z-[9998] bottom-4 right-4 left-4 sm:left-auto sm:w-[320px] p-4 rounded-2xl border backdrop-blur-xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300"
      style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)', boxShadow: 'var(--glass-shadow)' }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{current.icon}</span>
          <span className="font-outfit font-extrabold text-sm text-[var(--text-main)]">{current.title}</span>
        </div>
        <button
          onClick={onClose}
          aria-label="Fechar guia"
          className="bg-[var(--btn-secondary-bg)] border border-[var(--btn-secondary-border)] hover:bg-[var(--btn-secondary-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)] rounded-lg w-6 h-6 flex items-center justify-center text-xs font-bold transition-colors cursor-pointer shrink-0"
        >
          ✕
        </button>
      </div>

      <p className="text-[0.8rem] text-[var(--text-muted)] leading-relaxed mb-3">{current.text}</p>

      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${i === step ? 'bg-[var(--primary)]' : 'bg-[var(--btn-secondary-border)]'}`}
            />
          ))}
        </div>

        <div className="flex gap-1.5">
          <button
            onClick={onClose}
            className="text-[0.72rem] font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors px-2 py-1.5 cursor-pointer"
          >
            Pular
          </button>
          <button
            onClick={() => (isLast ? onClose() : setStep(s => s + 1))}
            className="text-[0.72rem] font-black text-white bg-[var(--primary)] rounded-lg px-3 py-1.5 cursor-pointer hover:opacity-90 transition-opacity"
          >
            {isLast ? 'Concluir' : 'Próximo →'}
          </button>
        </div>
      </div>
    </div>
  )
}
