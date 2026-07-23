'use client';
import React, { useRef, useState, useEffect } from 'react'

interface Props {
  label: string
  value?: string
  onChange: (base64: string) => void
}

export default function SignaturePad({ label, value, onChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)

  // Draw guideline horizontal line
  const drawGuideline = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
    const rect = canvas.getBoundingClientRect()
    ctx.save()
    ctx.strokeStyle = '#cbd5e1'
    ctx.lineWidth = 1
    ctx.setLineDash([4, 4])
    ctx.beginPath()
    ctx.moveTo(15, rect.height - 24)
    ctx.lineTo(rect.width - 15, rect.height - 24)
    ctx.stroke()
    ctx.restore()
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Setup canvas resolution for HD displays (High DPI)
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    // Set default signature stroke style
    ctx.strokeStyle = '#1e293b' // Dark navy stroke
    ctx.lineWidth = 2.2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    if (!value) {
      ctx.clearRect(0, 0, rect.width, rect.height)
      drawGuideline(canvas, ctx)
      return
    }

    // Load pre-existing signature image
    const img = new Image()
    img.onload = () => {
      ctx.clearRect(0, 0, rect.width, rect.height)
      ctx.drawImage(img, 0, 0, rect.width, rect.height)
    }
    img.src = value
  }, [value])

  const getCoordinates = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }
  }

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    canvasRef.current?.setPointerCapture(e.pointerId)
    setIsDrawing(true)
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    const coords = getCoordinates(e)
    ctx.beginPath()
    ctx.moveTo(coords.x, coords.y)
  }

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    e.preventDefault()
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    const coords = getCoordinates(e)
    ctx.lineTo(coords.x, coords.y)
    ctx.stroke()
  }

  const stopDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    canvasRef.current?.releasePointerCapture(e.pointerId)
    setIsDrawing(false)
    saveSignature()
  }

  const saveSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const base64 = canvas.toDataURL('image/png')
    onChange(base64)
  }

  const handleClear = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const rect = canvas.getBoundingClientRect()
    ctx.clearRect(0, 0, rect.width, rect.height)
    drawGuideline(canvas, ctx)
    onChange('')
  }

  return (
    <div className="flex flex-col gap-1.5 font-outfit">
      <label className="text-[0.68rem] font-bold text-slate-400 uppercase tracking-wider">{label}</label>
      <div className="relative bg-white border border-slate-200 rounded-xl overflow-hidden shadow-inner group">
        <canvas
          ref={canvasRef}
          className="w-full h-[100px] block touch-none cursor-crosshair"
          onPointerDown={startDrawing}
          onPointerMove={draw}
          onPointerUp={stopDrawing}
          onPointerCancel={stopDrawing}
        />
        <button
          type="button"
          onClick={handleClear}
          className="absolute top-2 right-2 bg-slate-900/10 hover:bg-slate-950/20 text-slate-600 hover:text-slate-900 border border-slate-300/40 rounded-lg px-2.5 py-1 text-[0.68rem] font-bold transition-all cursor-pointer select-none opacity-60 group-hover:opacity-100"
        >
          Limpar
        </button>
      </div>
    </div>
  )
}
