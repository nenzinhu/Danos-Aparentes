'use client';
import { useState } from 'react'
import { Damage, DamageType } from '../types'
import { useTts } from '../hooks/useTts'
import { VehicleViewer } from '../components/VehicleViewer'
import Logo from '../components/Logo'
import Link from 'next/link'

export default function Demo() {
  const [damages, setDamages] = useState<Damage[]>([])
  const { speak, speakHover } = useTts()

  function handleAddDamage(partId: string, partName: string, type: DamageType, typeName: string) {
    const newDamage: Damage = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      vehicle: 'car',
      view: 'lateral-left',
      partId, partName, type, typeName,
      severity: 'low', notes: '', photos: [], photoNotes: [],
    }
    setDamages(prev => [...prev, newDamage])
  }

  function handleRemoveDamageFromPart(partId: string) {
    setDamages(prev => prev.filter(d => d.partId !== partId))
  }

  return (
    <div className='h-screen w-screen flex flex-col overflow-hidden font-outfit text-[#e8f4ff] p-5 bg-[#020617]'>
      <header className='flex items-center justify-between shrink-0 mb-4'>
        <Logo size={28} />
        <Link href='/app' className='border border-primary/40 text-primary font-bold text-xs px-4 py-2 rounded-lg hover:bg-primary/10 transition-all'>
          Entrar
        </Link>
      </header>

      <p className='text-center text-slate-400 text-sm mb-4 shrink-0 font-medium'>
        Clique nas peças do carro para marcar uma avaria
      </p>

      <div className='flex-1 min-h-0 grid place-items-center'>
        <div className='w-full max-w-4xl glass-card p-8 aspect-video flex items-center justify-center'>
          <VehicleViewer.Root
            vehicleType='car'
            viewType='lateral-left'
            damages={damages}
            onAddDamage={handleAddDamage}
            onRemoveDamageFromPart={handleRemoveDamageFromPart}
            speak={speak}
            speakHover={speakHover}
          >
            <VehicleViewer.Viewport />
            <VehicleViewer.FloatingDamage />
            <VehicleViewer.Controls />
            <VehicleViewer.FullscreenOverlay />
          </VehicleViewer.Root>
        </div>
      </div>

      <footer className='flex items-center justify-center gap-4 shrink-0 mt-4 flex-wrap'>
        <span className='text-xs font-bold text-slate-500 tracking-widest uppercase'>
          © 2026 Danos Aparentes — Módulo de Demonstração
        </span>
      </footer>
    </div>
  )
}

