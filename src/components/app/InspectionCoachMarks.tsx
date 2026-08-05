'use client';
import { useState } from 'react'
import { IconDocument, IconCar, IconSignature } from '../ui/AnimatedIcons'

interface Props {
  isOpen: boolean
  onClose: () => void
}

const STEPS = [
  {
    icon: <IconDocument size={20} className="text-sky-400" />,
    title: 'Identidade do Veículo',
    text: 'Comece pelo responsável. Depois consulte a placa — os dados preenchem sozinhos. No computador, use “Salvar prévia” para continuar no celular.',
  },
  {
    icon: <IconCar size={20} className="text-sky-400" />,
    title: 'Marque os danos no diagrama',
    text: 'Toque nas peças do SVG para registrar danos e anexar evidências. Sem danos? Siga mesmo assim para o dossiê.',
  },
  {
    icon: <IconSignature size={20} className="text-emerald-400" />,
    title: 'Assine e capture o GPS',
    text: 'Na aba Dossiê Técnico, revise os danos, capture a localização e colete as assinaturas.',
  },
  {
    icon: <IconDocument size={20} className="text-purple-400" />,
    title: 'Emita o dossiê técnico',
    text: 'Exporte o dossiê com hash, QR Code e GPS — nova versão do histórico do veículo.',
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
      aria-label="Guia rápido da primeira inspeção"
      className="fixed z-[9998] bottom-4 right-4 left-4 sm:left-auto sm:w-[320px] p-4 rounded-2xl border backdrop-blur-xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300"
      style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)', boxShadow: 'var(--glass-shadow)' }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="shrink-0 p-1.5 rounded-lg bg-sky-500/10 border border-sky-500/20">{current.icon}</span>
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
      <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-4">{current.text}</p>
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-1" aria-hidden>
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 w-1.5 rounded-full ${i === step ? 'bg-sky-400' : 'bg-[var(--card-border)]'}`}
            />
          ))}
        </div>
        <div className="flex gap-2">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="text-xs font-bold text-[var(--text-muted)] px-2 py-1.5 cursor-pointer"
            >
              Voltar
            </button>
          )}
          <button
            type="button"
            onClick={() => (isLast ? onClose() : setStep((s) => s + 1))}
            className="text-xs font-black text-white bg-[var(--primary)] px-3 py-1.5 rounded-lg cursor-pointer"
          >
            {isLast ? 'Começar' : 'Próximo'}
          </button>
        </div>
      </div>
    </div>
  )
}
