'use client';
import { useState } from 'react'
import { Damage, DamageType } from '../types'
import { useTts } from '../hooks/useTts'
import { VehicleViewer } from '../components/VehicleViewer'
import Logo from '../components/Logo'
import Link from 'next/link'

export default function Demo() {
  const [damages, setDamages] = useState<Damage[]>([])
  const [generatingSample, setGeneratingSample] = useState(false)
  const { speak, speakHover } = useTts()

  async function handleDownloadSample() {
    if (damages.length === 0 || generatingSample) return
    setGeneratingSample(true)
    try {
      const { generatePdf } = await import('../lib/pdf')
      const info: import('../types').VehicleInfo = {
        owner: 'Cliente Exemplo',
        phone: '',
        brand: 'Veículo de demonstração',
        plate: '' as import('../types').VehicleInfo['plate'],
        generalNotes: '',
        interiorNotes: '',
        interiorPhotos: [],
        interiorPhotoNotes: [],
        profile: '',
        ref: '',
        color: '',
        vehicleTypeDesc: '',
        city: '',
        state: '',
      }
      // Amostra pública, sem login: nenhuma chamada ao Supabase é feita (o
      // hash é calculado localmente e registerHash() só grava se houver
      // sessão autenticada — aqui não há, então é puramente um PDF local).
      await generatePdf(info, damages, undefined, { watermark: 'AMOSTRA' })
    } finally {
      setGeneratingSample(false)
    }
  }

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
        <Logo size={28} textClassName="text-[#e8f4ff]" />
        <Link href='/app' className='border border-primary/40 text-primary font-bold text-xs px-4 py-2 rounded-lg hover:bg-primary/10 transition-all'>
          Entrar
        </Link>
      </header>

      <h1 className='sr-only'>Demonstração — Vistoria Digital de Avarias Veiculares | Danos Aparentes</h1>

      <h2 className='text-center text-slate-400 text-sm mb-4 shrink-0 font-medium'>
        Clique nas peças do carro para marcar uma avaria
      </h2>

      <div className='flex-1 min-h-0 grid place-items-center'>
        <div className='w-full max-w-5xl grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4'>
          <div className='glass-card p-8 aspect-video flex items-center justify-center'>
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

          {/* Evidência real da inspeção — Toyota Corolla ABC-1234 */}
          <aside className='glass-card p-4 flex flex-col gap-3 self-center'>
            <div className='flex items-center justify-between gap-2'>
              <p className='font-display text-sm font-bold uppercase tracking-tight text-[#e8f4ff] leading-none'>
                Toyota Corolla
              </p>
              <span className='font-mono-data text-[11px] tracking-[0.2em] text-[#7dd3fc]'>ABC-1234</span>
            </div>
            <div className='rounded-lg overflow-hidden border border-white/10'>
              <img
                src='/samples/corolla-abc-1234-2.jpg'
                alt='Toyota Corolla ABC-1234 — vista traseira na inspeção'
                className='w-full h-32 object-cover'
                loading='lazy'
              />
            </div>
            <div className='rounded-lg overflow-hidden border border-white/10'>
              <img
                src='/samples/corolla-abc-1234-1.jpg'
                alt='Toyota Corolla ABC-1234 — detalhe da avaria'
                className='w-full h-32 object-cover'
                loading='lazy'
              />
            </div>
            <p className='text-[10px] text-slate-400 leading-snug'>
              Fotos anexadas à inspeção · Traseira · Evidência comprovatória
            </p>
          </aside>
        </div>
      </div>

      {damages.length > 0 && (
        <div className='flex justify-center shrink-0 mt-3'>
          <button
            onClick={handleDownloadSample}
            disabled={generatingSample}
            className='bg-primary/10 border border-primary/40 text-primary font-bold text-xs px-5 py-2.5 rounded-lg hover:bg-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {generatingSample ? 'Gerando PDF...' : '📥 Baixar PDF de amostra (grátis, sem cadastro)'}
          </button>
        </div>
      )}

      <footer className='flex items-center justify-center gap-4 shrink-0 mt-4 flex-wrap'>
        <span className='text-xs font-bold text-slate-500 tracking-widest uppercase'>
          © 2026 Danos Aparentes — Módulo de Demonstração
        </span>
      </footer>
    </div>
  )
}

