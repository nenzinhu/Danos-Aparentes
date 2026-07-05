'use client';
import { useState } from 'react'

interface Props {
  isOpen: boolean
  onClose: () => void
}

const STEPS = [
  {
    icon: '🚗',
    title: 'Clique nas peças',
    text: 'Clique em qualquer peça do veículo no desenho para registrar uma avaria ali.',
  },
  {
    icon: '📷',
    title: 'Anexe fotos na hora',
    text: 'Ao escolher o tipo de avaria, você pode anexar uma foto direto — sem precisar voltar depois.',
  },
  {
    icon: '📋',
    title: 'Acompanhe o resumo',
    text: 'Todas as avarias registradas aparecem na lista ao lado, com opção de editar grau e observações.',
  },
  {
    icon: '📄',
    title: 'Exporte o laudo',
    text: 'Quando terminar, gere o PDF, envie por WhatsApp ou copie o relatório — tudo na seção "Exportar Relatório".',
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
