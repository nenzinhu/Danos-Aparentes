'use client';
import { useState, useEffect } from 'react'
import { Damage } from '../types'
import { db } from '../lib/db'

export function useDamages() {
  const [damages, setDamages] = useState<Damage[]>([])

  useEffect(() => {
    db.getAllDamages().then(setDamages)
  }, [])

  async function addDamage(d: Damage) {
    await db.putDamage(d)
    setDamages(prev => [...prev, d])
  }

  async function removeDamage(id: string) {
    await db.deleteDamage(id)
    setDamages(prev => prev.filter(d => d.id !== id))
  }

  async function updateDamage(id: string, patch: Partial<Damage>) {
    const prev = damages
    const target = prev.find(d => d.id === id)
    if (!target) return
    const updatedTarget = { ...target, ...patch }
    await db.putDamage(updatedTarget)
    setDamages(prevList => prevList.map(d => d.id === id ? updatedTarget : d))
  }

  async function clearDamages() {
    await db.clearDamages()
    setDamages([])
  }

  return { damages, addDamage, removeDamage, updateDamage, clearDamages }
}
