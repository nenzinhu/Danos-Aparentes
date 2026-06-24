'use client';
import { VehicleProps } from '../../types'
import { usePartProps } from './usePartProps'

export default function MicroBusTraseira({ damages, selectedPartId, onPartClick, onPartHover }: VehicleProps) {
  const partProps = usePartProps(damages, selectedPartId, onPartClick, onPartHover)


  return (
    <svg viewBox="0 0 350 300" width="100%">
      <ellipse cx="175" cy="282" rx="135" ry="10" className="shadow-ground" />
      <g pointerEvents="none">
        <rect x="60" y="244" width="22" height="36" rx="3" fill="#0f172a" />
        <rect x="268" y="244" width="22" height="36" rx="3" fill="#0f172a" />
      </g>

      <rect {...partProps('microbus-t-body')} data-name="Painel Traseiro" x="55" y="24" width="240" height="246" rx="20" fill="url(#grad-metal)" />

      <g {...partProps('microbus-t-window')} data-name="Vidro Traseiro">
        <path d="M66,40 L284,40 L284,96 L66,96 Z" fill="url(#metal-glass)" opacity="0.9" stroke="#0f172a" strokeWidth="1.8" />
        <path d="M86,40 L116,40 L96,96 L66,96 Z" fill="#fff" opacity="0.12" pointerEvents="none" />
        <path d="M210,40 L240,40 L220,96 L190,96 Z" fill="#fff" opacity="0.12" pointerEvents="none" />
      </g>

      <rect x="55" y="104" width="240" height="9" fill="#f97316" opacity="0.85" pointerEvents="none" />

      <g {...partProps('microbus-t-engine-cover')} data-name="Tampa do Motor / Grade">
        <rect x="80" y="150" width="190" height="74" rx="8" fill="url(#grad-metal)" stroke="#1e293b" strokeWidth="2" />
        <rect x="95" y="160" width="160" height="40" rx="4" fill="#0f172a" stroke="#334155" strokeWidth="1.2" />
        <line x1="100" y1="167" x2="250" y2="167" stroke="#1e293b" strokeWidth="2" pointerEvents="none" />
        <line x1="100" y1="174" x2="250" y2="174" stroke="#1e293b" strokeWidth="2" pointerEvents="none" />
        <line x1="100" y1="181" x2="250" y2="181" stroke="#1e293b" strokeWidth="2" pointerEvents="none" />
        <line x1="100" y1="188" x2="250" y2="188" stroke="#1e293b" strokeWidth="2" pointerEvents="none" />
        <line x1="100" y1="195" x2="250" y2="195" stroke="#1e293b" strokeWidth="2" pointerEvents="none" />
      </g>

      <g {...partProps('microbus-t-light-left')} data-name="Lanterna Traseira Esquerda">
        <rect x="60" y="120" width="16" height="70" rx="3" fill="#121824" stroke="#334155" strokeWidth="1" />
        <rect x="62" y="123" width="12" height="32" rx="1.5" fill="#ef4444" opacity="0.9" pointerEvents="none" />
        <rect x="62" y="157" width="12" height="16" rx="1.5" fill="#f97316" opacity="0.9" pointerEvents="none" />
        <rect x="62" y="175" width="12" height="12" rx="1.5" fill="#f8fafc" opacity="0.9" pointerEvents="none" />
      </g>
      <g {...partProps('microbus-t-light-right')} data-name="Lanterna Traseira Direita">
        <rect x="274" y="120" width="16" height="70" rx="3" fill="#121824" stroke="#334155" strokeWidth="1" />
        <rect x="276" y="123" width="12" height="32" rx="1.5" fill="#ef4444" opacity="0.9" pointerEvents="none" />
        <rect x="276" y="157" width="12" height="16" rx="1.5" fill="#f97316" opacity="0.9" pointerEvents="none" />
        <rect x="276" y="175" width="12" height="12" rx="1.5" fill="#f8fafc" opacity="0.9" pointerEvents="none" />
      </g>

      <g {...partProps('microbus-t-bumper')} data-name="Para-choque Traseiro">
        <path d="M55,244 L295,244 C295,244 295,268 286,270 L64,270 C55,270 55,244 55,244 Z" fill="#0f172a" stroke="#1e293b" strokeWidth="1.5" />
        <rect x="66" y="250" width="20" height="6" rx="1" fill="#ef4444" pointerEvents="none" />
        <rect x="264" y="250" width="20" height="6" rx="1" fill="#ef4444" pointerEvents="none" />
        <g pointerEvents="none">
          <rect x="148" y="249" width="54" height="14" rx="1.5" fill="#f8fafc" stroke="#1e293b" strokeWidth="1" />
          <rect x="149" y="250" width="52" height="3" fill="#3b82f6" />
          <text x="175" y="260" fontFamily="monospace" fontSize="8.5" fontWeight="900" fill="#000" textAnchor="middle" letterSpacing="1">AAA0A00</text>
        </g>
      </g>
    </svg>
  )
}
