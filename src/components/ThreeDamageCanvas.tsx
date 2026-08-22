'use client'

import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'
import type { DamageType, Severity } from '../types'

interface Props {
  type: DamageType
  severity?: Severity
  partName?: string
  width?: number
  height?: number
  className?: string
  interactive?: boolean
}

/**
 * Visualizador 3D Interativo (Three.js WebGL) para simulação hiper-realista
 * de danos veiculares na peça selecionada do diagrama:
 * - Risco / Arranhado: Painel de lataria vermelha metálica com riscos profundos e abrasão.
 * - Amassado / Deformado: Painel metálico azul com deformação côncava de vértice e sombras.
 * - Quebrado / Trincado: Lente translúcida de vidro com teia de fraturas e estilhaços 3D.
 */
export default function ThreeDamageCanvas({
  type,
  severity = 'high',
  partName = 'Peça do Veículo',
  width = 240,
  height = 200,
  className = '',
  interactive = true,
}: Props) {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene()

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
    camera.position.set(0, 0, 4.5)

    // 2. WebGL Renderer with Alpha Transparent Background
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap

    // Clear existing canvas
    while (container.firstChild) {
      container.removeChild(container.firstChild)
    }
    container.appendChild(renderer.domElement)

    // 3. Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9)
    scene.add(ambientLight)

    const mainLight = new THREE.DirectionalLight(0xffffff, 2.2)
    mainLight.position.set(5, 5, 5)
    scene.add(mainLight)

    const fillLight = new THREE.DirectionalLight(
      type === 'scratch' ? 0xef4444 : type === 'dent' ? 0x3b82f6 : 0x38bdf8,
      1.8,
    )
    fillLight.position.set(-5, -2, 2)
    scene.add(fillLight)

    const pointLight = new THREE.PointLight(0xffffff, 1.5, 10)
    pointLight.position.set(0, 2, 3)
    scene.add(pointLight)

    // 4. Create 3D Mesh Group for Vehicle Part Damage
    const group = new THREE.Group()
    scene.add(group)

    // Pedestal Base Ring
    const ringGeo = new THREE.TorusGeometry(1.4, 0.05, 16, 64)
    const ringMat = new THREE.MeshStandardMaterial({
      color: type === 'scratch' ? 0xf43f5e : type === 'dent' ? 0x38bdf8 : 0x0284c7,
      metalness: 0.9,
      roughness: 0.1,
      emissive: type === 'scratch' ? 0x881337 : type === 'dent' ? 0x1e3a8a : 0x0369a1,
      emissiveIntensity: 0.5,
    })
    const ringMesh = new THREE.Mesh(ringGeo, ringMat)
    ringMesh.rotation.x = Math.PI / 2.3
    ringMesh.position.y = -1.1
    group.add(ringMesh)

    // Secondary Pedestal Ring
    const innerRingGeo = new THREE.TorusGeometry(1.2, 0.03, 16, 64)
    const innerRingMesh = new THREE.Mesh(innerRingGeo, ringMat)
    innerRingMesh.rotation.x = Math.PI / 2.3
    innerRingMesh.position.y = -1.18
    group.add(innerRingMesh)

    if (type === 'scratch') {
      // ── RISCO / ARRANHADO: Lataria Vermelha Metálica ──
      const panelGeo = new THREE.SphereGeometry(1.15, 64, 64)
      const panelMat = new THREE.MeshStandardMaterial({
        color: 0xdc2626,
        metalness: 0.85,
        roughness: 0.2,
      })
      const panelMesh = new THREE.Mesh(panelGeo, panelMat)
      group.add(panelMesh)

      // Scratch Gouges (Procedural 3D Lines)
      const scratchGroup = new THREE.Group()
      for (let i = 0; i < 4; i++) {
        const scratchGeo = new THREE.BoxGeometry(1.1 - i * 0.1, 0.03, 0.04)
        const scratchMat = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          roughness: 0.1,
          metalness: 0.9,
          emissive: 0xfecdd3,
          emissiveIntensity: 0.8,
        })
        const scratchMesh = new THREE.Mesh(scratchGeo, scratchMat)
        scratchMesh.position.set(-0.2 + i * 0.15, 0.3 - i * 0.2, 1.08)
        scratchMesh.rotation.z = -Math.PI / 5
        scratchGroup.add(scratchMesh)
      }
      group.add(scratchGroup)
    } else if (type === 'dent') {
      // ── AMASSADO / DEFORMADO: Painel Metálico Azul Deformado ──
      const dentGeo = new THREE.SphereGeometry(1.15, 64, 64)
      const posAttr = dentGeo.attributes.position

      // Deform vertices inward to create a structural concave dent
      for (let i = 0; i < posAttr.count; i++) {
        const x = posAttr.getX(i)
        const y = posAttr.getY(i)
        const z = posAttr.getZ(i)

        // Center of dent at front center (0, 0, 1.15)
        const dist = Math.sqrt(x * x + y * y + (z - 1.15) * (z - 1.15))
        if (dist < 0.9) {
          const depth = (1 - dist / 0.9) * 0.35
          posAttr.setZ(i, z - depth)
        }
      }
      dentGeo.computeVertexNormals()

      const dentMat = new THREE.MeshStandardMaterial({
        color: 0x2563eb,
        metalness: 0.9,
        roughness: 0.15,
      })
      const dentMesh = new THREE.Mesh(dentGeo, dentMat)
      group.add(dentMesh)
    } else {
      // ── QUEBRADO / TRINCADO: Esfera de Vidro com Estilhaços ──
      const glassGeo = new THREE.SphereGeometry(1.15, 64, 64)
      const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0xe0f2fe,
        metalness: 0.1,
        roughness: 0.05,
        transmission: 0.85,
        opacity: 0.8,
        transparent: true,
        reflectivity: 0.9,
        clearcoat: 1.0,
      })
      const glassMesh = new THREE.Mesh(glassGeo, glassMat)
      group.add(glassMesh)

      // Cracked Spiderweb 3D Structure
      const crackGroup = new THREE.Group()
      const rayCount = 10
      for (let i = 0; i < rayCount; i++) {
        const angle = (i / rayCount) * Math.PI * 2
        const length = 0.8 + Math.random() * 0.3
        const crackGeo = new THREE.BoxGeometry(length, 0.015, 0.02)
        const crackMat = new THREE.MeshBasicMaterial({ color: 0x0f172a })
        const crackMesh = new THREE.Mesh(crackGeo, crackMat)
        crackMesh.position.set(0, 0, 1.12)
        crackMesh.rotation.z = angle
        crackGroup.add(crackMesh)
      }
      group.add(crackGroup)

      // Glass Shards (Floating Particles)
      for (let i = 0; i < 6; i++) {
        const shardGeo = new THREE.ConeGeometry(0.08, 0.2, 3)
        const shardMat = new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          roughness: 0.1,
          metalness: 0.8,
          transparent: true,
          opacity: 0.9,
        })
        const shard = new THREE.Mesh(shardGeo, shardMat)
        shard.position.set(
          (Math.random() - 0.5) * 1.2,
          (Math.random() - 0.5) * 1.2,
          1.15 + Math.random() * 0.2,
        )
        shard.rotation.set(Math.random(), Math.random(), Math.random())
        group.add(shard)
      }
    }

    // 5. Interactive Mouse & Drag Rotation Control
    let isDragging = false
    let prevMouseX = 0
    let prevMouseY = 0

    const onMouseDown = (e: MouseEvent) => {
      if (!interactive) return
      isDragging = true
      prevMouseX = e.clientX
      prevMouseY = e.clientY
    }

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      const deltaX = e.clientX - prevMouseX
      const deltaY = e.clientY - prevMouseY

      group.rotation.y += deltaX * 0.01
      group.rotation.x += deltaY * 0.01

      prevMouseX = e.clientX
      prevMouseY = e.clientY
    }

    const onMouseUp = () => {
      isDragging = false
    }

    const dom = renderer.domElement
    dom.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)

    // Touch events for mobile
    const onTouchStart = (e: TouchEvent) => {
      if (!interactive || !e.touches[0]) return
      isDragging = true
      prevMouseX = e.touches[0].clientX
      prevMouseY = e.touches[0].clientY
    }

    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging || !e.touches[0]) return
      const deltaX = e.touches[0].clientX - prevMouseX
      const deltaY = e.touches[0].clientY - prevMouseY

      group.rotation.y += deltaX * 0.01
      group.rotation.x += deltaY * 0.01

      prevMouseX = e.touches[0].clientX
      prevMouseY = e.touches[0].clientY
    }

    dom.addEventListener('touchstart', onTouchStart)
    window.addEventListener('touchmove', onTouchMove)
    window.addEventListener('touchend', onMouseUp)

    // 6. Animation Loop (Subtle Floating Rotation)
    let animationFrameId: number
    const clock = new THREE.Clock()

    const animate = () => {
      const elapsed = clock.getElapsedTime()
      if (!isDragging) {
        group.rotation.y = Math.sin(elapsed * 0.8) * 0.2
        group.rotation.x = Math.cos(elapsed * 0.6) * 0.1
      }

      renderer.render(scene, camera)
      animationFrameId = requestAnimationFrame(animate)
    }
    animate()

    // 7. Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId)
      dom.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      dom.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onMouseUp)
      renderer.dispose()
    }
  }, [type, width, height, interactive])

  const levelLabel =
    type === 'scratch'
      ? 'NÍVEL 1: SUPERFICIAL'
      : type === 'dent'
      ? 'NÍVEL 2: ESTRUTURAL'
      : 'NÍVEL 3: CRÍTICO'

  const pillColor =
    type === 'scratch'
      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
      : type === 'dent'
      ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
      : 'bg-rose-500/20 border-rose-500/50 text-rose-300'

  return (
    <div
      className={`relative flex flex-col items-center justify-between p-3 rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg-solid)] shadow-2xl backdrop-blur-xl select-none group ${className}`}
      style={{ width: `${width + 24}px` }}
    >
      {/* Top Pill Badge */}
      <div
        className={`px-3 py-1 rounded-full border text-[0.68rem] font-black uppercase mb-1 flex items-center gap-1.5 shadow-md ${pillColor}`}
      >
        <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
        <span>{levelLabel}</span>
      </div>

      {/* 3D Three.js WebGL Canvas Mount */}
      <div ref={mountRef} className="cursor-grab active:cursor-grabbing" />

      {/* Bottom Part Name & Damage Label */}
      <div className="text-center mt-1 w-full px-2">
        <div className="text-[0.62rem] font-bold text-sky-400 uppercase tracking-widest truncate">
          {partName}
        </div>
        <div className="text-[0.82rem] font-black text-slate-100 tracking-wide uppercase">
          {type === 'scratch'
            ? 'RISCO / ARRANHADO'
            : type === 'dent'
            ? 'AMASSADO / DEFORMADO'
            : 'QUEBRADO / TRINCADO'}
        </div>
      </div>
    </div>
  )
}
